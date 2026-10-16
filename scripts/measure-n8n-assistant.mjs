#!/usr/bin/env node
/**
 * Mesure ce que l'assistant Uni met vraiment de temps à répondre, et où passe ce
 * temps : dans Google ou dans le détour par n8n.
 *
 * Pourquoi deux modes : depuis le 2026-09-25 la conversation ne part plus
 * directement chez Gemini, elle passe par le workflow « Uni · Passerelle
 * assistant » (`docs/n8n/`). La Function coupe à 25 s (`N8N_TIMEOUT_MS`) et son
 * nœud HTTP à 20 s, donc un TOTAL de 21 s n'est pas une marge de 4 s : c'est
 * Google qui a mis 19 s et n8n qui en ajoute 2. Sans la comparaison, on réglage
 * le mauvais timeout.
 *
 * Les trois clients attendent un payload unique, sans streaming : le TOTAL est
 * exactement ce que l'étudiant voit tourner.
 *
 * La consigne et la charge utile sont fabriquées par le vrai code
 * (`buildSystemInstruction`, `toN8nRequest`) : ce script ne peut pas dériver du
 * contrat de la Function, et une estimation à la baisse de la taille de la
 * consigne sous-estimerait le temps de préfixe, qui est la moitié du coût.
 *
 * Aucun modèle n'est passé en argument : il est verrouillé dans le nœud HTTP de
 * n8n et dans la constante `GEMINI_MODEL`, comme le veut l'invariant du
 * 2026-09-21.
 *
 * Usage :
 *   # via n8n, ce que sent l'utilisateur — le jeton est celui du credential
 *   # « UniFlow · Jeton passerelle » (Header Auth), jamais une clé Gemini :
 *   N8N_TOKEN=… node scripts/measure-n8n-assistant.mjs --gateway --case etudiant
 *
 *   # droit chez Google, pour soustraire et voir ce que n8n ajoute :
 *   GEMINI_API_KEY=… node scripts/measure-n8n-assistant.mjs --direct
 *
 *   # les deux, dans le même élan (recommandé pour le premier réglage) :
 *   N8N_TOKEN=… GEMINI_API_KEY=… node scripts/measure-n8n-assistant.mjs --compare --runs 5
 *
 *   # les trois cas de production, du plus court au plus lourd :
 *   … --case minimal | etudiant | admin
 *
 * Les clés ne sont lues que depuis l'environnement et jamais écrites nulle part.
 */

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import {
  GEMINI_MODEL,
  MAX_OUTPUT_TOKENS,
  N8N_TOKEN_HEADER,
  buildSystemInstruction,
  frenchDayOfWeek,
  frenchLongDate,
  toN8nRequest,
} from '../functions/uniflow-api/src/lib/assistant.js'

const HERE = dirname(fileURLToPath(import.meta.url))

/** Ce que la Function tolère, et ce que son nœud HTTP tolère avant elle. */
const BUDGET_FUNCTION_MS = 25_000
const BUDGET_NOEUD_N8N_MS = 20_000

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const GATEWAY_URL = 'https://n8n.kernelforge.codes/webhook/uniflow-assistant'

/** Les trois cas qui existent vraiment en production, du plus court au plus lourd. */
const CASES = {
  minimal: {
    label: 'étudiant sans filière ni niveau (cas le plus court)',
    caller: { name: 'Amine', role: 'STUDENT', accountType: 'UNIVERSITY' },
    grounding: {},
    question: 'Quels cours ai-je aujourd’hui ?',
  },
  etudiant: {
    label: 'étudiant avec 12 séances du jour (cas le plus fréquent)',
    caller: {
      name: 'Amine Diallo', role: 'STUDENT', accountType: 'UNIVERSITY',
      university: 'Université de Yaoundé I', faculty: 'Faculté des Sciences', program: 'ICT4D', level: 'L1',
    },
    grounding: { scopeLabel: 'ICT4D · L1', todaySessions: sessions(12) },
    question: 'Quels cours ai-je aujourd’hui et où ?',
  },
  admin: {
    label: 'administration de la plateforme (chiffres du périmètre)',
    caller: { name: 'Ravel', accountType: 'PLATFORM', isSuperAdmin: true },
    grounding: {
      scopeLabel: 'plateforme',
      counts: { 'membres de l’annuaire': 1204, 'unités d’enseignement': 88, 'séances d’emploi du temps': 3400, 'filières': 24 },
    },
    question: 'Combien d’étudiants dans la plateforme ?',
  },
}

function sessions(count) {
  return Array.from({ length: count }, (_, i) => ({
    startTime: `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:00`,
    endTime: `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:00`,
    courseCode: `INF ${101 + i}`,
    courseName: 'Algorithmique et structures de données',
    teacherName: 'Dr NKOUMOU',
    classroom: `S0${12 + i}`,
    type: i % 3 === 0 ? 'CM' : 'TD',
  }))
}

function consigne(caseName) {
  const chosen = CASES[caseName]
  if (!chosen) throw new Error(`--case doit être l’un de : ${Object.keys(CASES).join(', ')}`)
  const now = new Date()
  const grounding = { ...chosen.grounding, todayLabel: frenchLongDate(now), dayLabel: frenchDayOfWeek(now) }
  const system = buildSystemInstruction(chosen.caller, grounding, { platform: 'web' })
  return { system, question: chosen.question, label: chosen.label }
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return fallback
  const next = process.argv[i + 1]
  return next && !next.startsWith('--') ? next : true
}

async function chrono(url, init, label) {
  const started = performance.now()
  let response
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(180_000) })
  } catch (error) {
    console.log(`${label} : ÉCHEC réseau — ${error.name === 'TimeoutError' ? 'aucune réponse en 180 s' : error.message}`)
    return { label, ok: false }
  }
  const wallMs = performance.now() - started
  const text = await response.text()
  let payload = null
  try { payload = JSON.parse(text) } catch { /* une réponse non JSON est déjà un enseignement */ }
  if (!response.ok) {
    console.log(`${label} : HTTP ${response.status} en ${(wallMs / 1000).toFixed(1)} s — ${text.slice(0, 200)}`)
    return { label, wallMs, ok: false }
  }
  return { label, wallMs, ok: true, payload }
}

/** Le chemin de l'utilisateur : la Function, telle quelle, vers le webhook n8n. */
async function mesurerPasserelle({ system, question, runs, maxTokens }) {
  const token = process.env.N8N_TOKEN || String(arg('token', ''))
  const url = String(arg('url', GATEWAY_URL))
  const body = toN8nRequest(system, [{ role: 'user', content: question }], { platform: 'web' })
  body.max_tokens = maxTokens
  if (!token) console.log('N8N_TOKEN absent : n8n (Header Auth) répondra 403. Le temps mesuré reste valable pour le refus, pas pour une réponse.')
  console.log(`\nPasserelle ${url} — ${runs} essai(s)`)
  const samples = []
  for (let i = 1; i <= runs; i += 1) {
    const r = await chrono(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', [N8N_TOKEN_HEADER]: token },
      body: JSON.stringify(body),
    }, `  passerelle ${i}/${runs}`)
    if (!r.ok) continue
    const reply = r.payload?.reply ?? ''
    const meta = Array.isArray(r.payload) ? r.payload[0] : r.payload
    console.log(`  passerelle ${i}/${runs} : ${(r.wallMs / 1000).toFixed(1)} s · ${String(meta?.provider || '?')}/${String(meta?.model || '?')} · ${reply.length} car — ${reply.slice(0, 60).replace(/\n/g, ' ')}`)
    samples.push(r.wallMs)
  }
  return samples
}

/** Le chemin d'avant : la même consigne, posée droit sur l'API Google. */
async function mesurerDirect({ system, question, runs, maxTokens }) {
  const key = process.env.GEMINI_API_KEY || ''
  if (!key) {
    console.log('\nGEMINI_API_KEY absent : --direct et --compare sont sans objet (la clé ne vient que de l’environnement, jamais d’un fichier).')
    return []
  }
  // Même corps que le nœud HTTP de n8n, construit depuis les mêmes champs : la
  // soustraction des deux TOTAUX est bien le seul coût de n8n.
  // La clé part en en-tête et non en `?key=` : l'URL atterrit dans
  // l'historique de shell, les logs HTTP et les traces d'incident.
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: question }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: maxTokens, thinkingConfig: { thinkingLevel: 'minimal' } },
  }
  console.log(`\nGemini droit ${GEMINI_MODEL} — ${runs} essai(s)`)
  const samples = []
  for (let i = 1; i <= runs; i += 1) {
    const r = await chrono(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    }, `  direct ${i}/${runs}`)
    if (!r.ok) {
      console.log(`  direct ${i}/${runs} : sans réponse (quota, clé, ou réseau)`)
      continue
    }
    const parts = r.payload?.candidates?.[0]?.content?.parts || []
    const usage = r.payload?.usageMetadata || {}
    const text = parts.map((p) => p.text || '').join('').trim()
    const gen = (usage.candidatesTokenCount || 0) / (r.wallMs / 1000)
    console.log(`  direct ${i}/${runs} : ${(r.wallMs / 1000).toFixed(1)} s · prompt ${usage.promptTokenCount ?? '?'} tok · ${gen > 0 ? `${gen.toFixed(1)} tok/s · ` : ''}${text.length} car — ${text.slice(0, 60).replace(/\n/g, ' ')}`)
    samples.push(r.wallMs)
  }
  return samples
}

function moyenne(samples) {
  // Le premier essai paie la mise en mémoire du modèle et l'établissement TLS :
  // il est affiché séparément, la moyenne se fait sur les suivants.
  if (!samples.length) return { first: 0, mean: 0 }
  const warm = samples.slice(1)
  return { first: samples[0], mean: warm.length ? warm.reduce((a, b) => a + b, 0) / warm.length : samples[0] }
}

async function main() {
  const caseName = String(arg('case', 'etudiant'))
  const runs = Number(arg('runs', 3))
  const maxTokens = Number(arg('max-tokens', MAX_OUTPUT_TOKENS))
  const { system, question, label } = consigne(caseName)

  if (process.argv.includes('--payload')) {
    // Charge utile du contrat de la passerelle, prête à coller dans l'éditeur
    // n8n (Execute Workflow Input) pour rejouer une exécution sans la Function.
    const body = toN8nRequest(system, [{ role: 'user', content: question }], { platform: 'web' })
    process.stdout.write(JSON.stringify(body, null, 2) + '\n')
    console.error(`# ${label} — consigne ${system.length} caractères, modèle verrouillé ${GEMINI_MODEL} côté n8n`)
    return
  }

  const veutDirect = process.argv.includes('--direct') || process.argv.includes('--compare')
  const veutPasserelle = process.argv.includes('--gateway') || process.argv.includes('--compare')
  if (!veutDirect && !veutPasserelle) {
    console.log('Rien à faire : ajoute --gateway, --direct, --compare ou --payload. --help pour le détail.')
    return
  }

  console.log(`Cas : ${label}`)
  console.log(`Consigne : ${system.length} caractères · ${maxTokens} tokens de sortie au plus`)

  const direct = veutDirect ? await mesurerDirect({ system, question, runs, maxTokens }) : null
  const passerelle = veutPasserelle ? await mesurerPasserelle({ system, question, runs, maxTokens }) : null

  const d = moyenne(direct || [])
  const g = moyenne(passerelle || [])
  console.log('')
  if (direct?.length) console.log(`Gemini seul   : premier ${(d.first / 1000).toFixed(1)} s · suivants ${(d.mean / 1000).toFixed(1)} s`)
  if (passerelle?.length) console.log(`Via n8n       : premier ${(g.first / 1000).toFixed(1)} s · suivants ${(g.mean / 1000).toFixed(1)} s`)
  if (direct?.length && passerelle?.length) {
    const overhead = g.mean - d.mean
    console.log(`n8n ajoute    : ${(overhead / 1000).toFixed(1)} s (${((overhead / d.mean) * 100).toFixed(0)} % du total)`)
    console.log(`\nVerdict : ${
      g.mean > BUDGET_NOEUD_N8N_MS
        ? `le nœud HTTP de n8n coupe à ${BUDGET_NOEUD_N8N_MS / 1000} s avant la Function — l’étudiant verrait une erreur alors que Gemini répondait. Soit un ${GEMINI_MODEL} plus rapide, soit max_tokens plus bas, soit le timeout du nœud à remonter (et celui de la Function avec).`
        : g.mean > BUDGET_FUNCTION_MS * 0.8
          ? `marge faible (${(100 - (g.mean / BUDGET_FUNCTION_MS) * 100).toFixed(0)} %) : les pointes réseau camerounaises passeront par ASSISTANT_UNAVAILABLE. Mesurer avec --runs 10 avant de conclure.`
          : overhead > d.mean * 0.35
            ? `tient, mais c’est n8n qui paie le gros du surcoût : vérifier les nœuds inutiles et l’exécution « pinch » avant d’accuser Google.`
            : `tient — le détour par n8n coûte ${(overhead / 1000).toFixed(1)} s, l’utilisateur ne le distingue pas d’un appel direct.`
    }`)
  }
}

main().catch((error) => {
  console.error(String(error?.message || error))
  process.exit(1)
})
