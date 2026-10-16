import { Client, Databases, Query, Users } from 'node-appwrite'
import { DATABASE_ID, actorIdOf, resolveCaller } from '../lib/caller.js'
import {
  ASSISTANT_NAME,
  GEMINI_MODEL,
  MISTRAL_ENDPOINT,
  MISTRAL_MODEL,
  N8N_DEFAULT_PATH,
  N8N_TOKEN_HEADER,
  buildSystemInstruction,
  extractMistralText,
  extractN8nReply,
  frenchDayOfWeek,
  frenchLongDate,
  sanitizeHistory,
  suggestionsFor,
  toMistralRequest,
  toN8nRequest,
} from '../lib/assistant.js'

/**
 * Service `/assistant` — l'assistant « Uni » partagé par le web, le mobile et
 * le desktop.
 *
 * Pourquoi côté serveur : aucune clé ne doit être embarquée dans un client (le
 * `.env` Flutter est lisible dans le binaire, le bundle web est public). Les
 * trois applications appellent donc ce service avec leur session Appwrite ; il
 * ancre la réponse dans les **données réelles** de l'appelant (profil, séances
 * du jour de sa filière et de son niveau) puis remet la consigne à la
 * passerelle d'IA — le workflow n8n du VPS KERNEL FORGE depuis le 2026-09-25 —
 * qui seule connaît le modèle et la clé Gemini.
 *
 * Ce que la passerelle ne reçoit PAS : la clé serveur Appwrite, ni l'accès à la
 * base. Elle reçoit du texte, elle rend du texte. L'ancrage reste ici, sous
 * contrôle des rôles Appwrite.
 *
 * Actions :
 * - `hello` : message d'accueil + suggestions, sans appel au modèle ;
 * - `chat`  : `messages` = historique `{ role: 'user' | 'assistant', content }`,
 *             dernier tour utilisateur ; réponse `{ reply, provider, model }`.
 */

// 25 s : le budget historique de l'appel Gemini direct. Le nœud HTTP de la
// passerelle est réglé à 20 s en interne, donc c'est n8n qui décroche le premier
// et qui renvoie une erreur identifiable — plutôt qu'une exécution Appwrite
// tuée au plafond, sans message.
const N8N_TIMEOUT_MS = 25_000
const MISTRAL_TIMEOUT_MS = 15_000

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function bodyOf(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

async function fetchJson(url, init, timeoutMs) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  const text = await response.text()
  let payload = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { raw: text } }
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || text.slice(0, 200)
    throw new Error(`HTTP ${response.status} ${detail}`)
  }
  return payload
}

async function askN8n({ webhookUrl, token, systemInstruction, history, options }) {
  const payload = await fetchJson(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', [N8N_TOKEN_HEADER]: token },
    body: JSON.stringify(toN8nRequest(systemInstruction, history, options)),
  }, N8N_TIMEOUT_MS)
  const reply = extractN8nReply(payload)
  if (!reply) {
    const motif = (Array.isArray(payload) ? payload[0] : payload)?.message || (Array.isArray(payload) ? payload[0] : payload)?.error?.message || 'ABSENT'
    throw new Error(`N8N_EMPTY ${String(motif).slice(0, 120)}`)
  }
  return reply
}

async function askMistral(apiKey, systemInstruction, history) {
  const payload = await fetchJson(MISTRAL_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(toMistralRequest(systemInstruction, history)),
  }, MISTRAL_TIMEOUT_MS)
  const text = extractMistralText(payload)
  if (!text) throw new Error('MISTRAL_EMPTY')
  return text
}

/**
 * Données réelles à glisser dans la consigne : les séances **du jour** de la
 * filière et du niveau de l'appelant (étudiant, délégué), celles de
 * l'enseignant (par son nom), ou les chiffres du périmètre pour
 * l'administration. Un échec ici ne bloque pas la conversation : Uni répond
 * alors sans ces données et le dit.
 */
async function groundingFor(databases, caller, log) {
  const now = new Date()
  const grounding = { todayLabel: frenchLongDate(now), dayLabel: frenchDayOfWeek(now) }
  if (!caller || caller.accountType === 'PERSONAL') return grounding
  try {
    if (caller.accountType === 'PLATFORM' || caller.role === 'ADMIN') {
      const scope = caller.university && !caller.isSuperAdmin ? [Query.equal('university', caller.university)] : []
      const [directory, courses, schedules, programs] = await Promise.all([
        databases.listDocuments(DATABASE_ID, 'academic_directory', [...scope, Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, 'academic_courses', [...scope, Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, 'academic_schedules', [...scope, Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, 'academic_programs', [Query.limit(1)]),
      ])
      grounding.counts = {
        'membres de l’annuaire': directory.total,
        'unités d’enseignement': courses.total,
        'séances d’emploi du temps': schedules.total,
        'filières': programs.total,
      }
      grounding.scopeLabel = caller.isSuperAdmin ? 'plateforme' : caller.university || 'université'
      return grounding
    }
    if (caller.role === 'TEACHER') {
      const rows = caller.name
        ? await databases.listDocuments(DATABASE_ID, 'academic_schedules', [Query.equal('dayOfWeek', grounding.dayLabel), Query.contains('teacherName', caller.name.split(/\s+/).pop()), Query.limit(25)])
        : { documents: [] }
      grounding.scopeLabel = `séances de ${caller.name}`
      grounding.todaySessions = rows.documents.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
      return grounding
    }
    // Étudiant / délégué : la règle stricte du projet — filière **et** niveau,
    // sinon rien (même règle que les écrans d'emploi du temps).
    if (!caller.program || !caller.level) {
      grounding.scheduleScope = 'none'
      return grounding
    }
    const rows = await databases.listDocuments(DATABASE_ID, 'academic_schedules', [
      Query.equal('program', caller.program),
      Query.equal('level', caller.level.toUpperCase()),
      Query.equal('dayOfWeek', grounding.dayLabel),
      Query.limit(25),
    ])
    grounding.scopeLabel = `${caller.program} · ${caller.level.toUpperCase()}`
    grounding.todaySessions = rows.documents.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
  } catch (exception) {
    log(`assistant grounding skipped: ${String(exception?.message || exception)}`)
  }
  return grounding
}

function greetingFor(caller) {
  const first = (caller?.name || '').trim().split(/\s+/)[0]
  const hello = first ? `Bonjour ${first} !` : 'Bonjour !'
  return `${hello} Je suis ${ASSISTANT_NAME}, l'assistant UniFlow. Je connais ton emploi du temps, tes UE et les écrans de la plateforme : pose-moi ta question.`
}

export default async ({ req, res, log, error }) => {
  const actorId = actorIdOf(req)
  if (!actorId) {
    return json(res, { ok: false, code: 'AUTH_REQUIRED', message: `Connectez-vous avec un compte UniFlow pour parler à ${ASSISTANT_NAME}.` }, 401)
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.headers['x-appwrite-key'] || '')
  const users = new Users(client)
  const databases = new Databases(client)
  const body = bodyOf(req)
  const action = body.action === 'hello' ? 'hello' : 'chat'

  let caller = null
  try {
    caller = await resolveCaller(req, users, databases)
  } catch (exception) {
    log(`assistant caller unresolved: ${String(exception?.message || exception)}`)
  }

  if (action === 'hello') {
    return json(res, { ok: true, action, assistant: ASSISTANT_NAME, model: GEMINI_MODEL, greeting: greetingFor(caller), suggestions: suggestionsFor(caller) })
  }

  let history
  try {
    history = sanitizeHistory(body.messages)
  } catch {
    return json(res, { ok: false, code: 'HISTORY_INVALID', message: 'Envoyez au moins un message utilisateur (4000 caractères au plus).' }, 400)
  }

  const mistralKey = (process.env.MISTRAL_API_KEY || '').trim()
  // Deux façons de viser le workflow : l'URL complète (`N8N_WEBHOOK_URL`), ou
  // seulement l'hôte (`N8N_HOST`, sans schéma) et on applique le chemin connu.
  const n8nUrl = (process.env.N8N_WEBHOOK_URL || '').trim()
    || ((process.env.N8N_HOST || '').trim() ? `https://${(process.env.N8N_HOST || '').trim()}${N8N_DEFAULT_PATH}` : '')
  const n8nToken = (process.env.N8N_WEBHOOK_TOKEN || '').trim()
  if (!n8nUrl && !mistralKey) {
    error('assistant: ni N8N_WEBHOOK_URL / N8N_HOST ni MISTRAL_API_KEY sur la Function')
    return json(res, { ok: false, code: 'ASSISTANT_UNCONFIGURED', message: `${ASSISTANT_NAME} n'est pas encore configuré sur le serveur.` }, 503)
  }

  const grounding = await groundingFor(databases, caller, log)
  // `platform` (web | mobile | desktop) oriente vers les bons écrans ; `voice`
  // signale que la réponse sera lue par la synthèse vocale du client.
  const options = {
    platform: ['web', 'mobile', 'desktop'].includes(body.platform) ? body.platform : '',
    voice: body.voice === true,
  }
  const systemInstruction = buildSystemInstruction(caller, grounding, options)

  const failures = []
  if (n8nUrl) {
    // Sans jeton, la passerelle répondrait 403 après un aller-retour réseau :
    // autant le dire dans le journal et passer directement au secours.
    if (!n8nToken) {
      error('assistant: N8N_WEBHOOK_TOKEN absent sur la Function — passerelle n8n ignorée')
      failures.push('n8n: jeton absent')
    } else {
      try {
        const reply = await askN8n({ webhookUrl: n8nUrl, token: n8nToken, systemInstruction, history, options })
        // `provider: 'gemini'` reste vrai : le nœud Gemini de n8n appelle ce
        // modèle, et les trois clients affichent déjà cette étiquette sans
        // brancher la valeur.
        return json(res, { ok: true, action, assistant: ASSISTANT_NAME, provider: 'gemini', model: GEMINI_MODEL, reply, suggestions: suggestionsFor(caller) })
      } catch (exception) {
        failures.push(`n8n: ${String(exception?.message || exception)}`)
      }
    }
  }
  if (mistralKey) {
    try {
      const reply = await askMistral(mistralKey, systemInstruction, history)
      log(`assistant fallback mistral (${failures.join(' | ') || 'passerelle absente'})`)
      return json(res, { ok: true, action, assistant: ASSISTANT_NAME, provider: 'mistral', model: MISTRAL_MODEL, reply, suggestions: suggestionsFor(caller) })
    } catch (exception) {
      failures.push(`mistral: ${String(exception?.message || exception)}`)
    }
  }

  error(`assistant failed user=${actorId} ${failures.join(' | ')}`)
  return json(res, { ok: false, code: 'ASSISTANT_UNAVAILABLE', message: `${ASSISTANT_NAME} ne répond pas pour le moment. Réessayez dans quelques instants.` }, 502)
}
