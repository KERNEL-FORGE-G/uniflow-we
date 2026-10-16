// Test des trois workflows n8n de la suite Uni (docs/n8n/).
//
// Les `.json` de docs/n8n sont la seule source de ces workflows : ils sont
// importés dans la console n8n, donc hors de tout garde-fou Git. Ce fichier
// exécute leurs nœuds Code et leur expression HTTP comme `node --test` le fait
// pour le reste du dépôt, parce que deux de leurs contrats ne se voient qu'à
// l'exécution :
//
//   1. la passerelle doit remettre à Gemini exactement le corps que produisait
//      la Function avant le 2026-09-25, et consommer les champs que
//      `toN8nRequest` envoie vraiment — une clef renommée d'un côté ou de
//      l'autre fendrait la conversation en deux sans aucun message d'erreur ;
//   2. le webhook de bienvenue est joignable depuis Internet : si le contrôle
//      HMAC lâche, n8n.kernelforge.codes devient un bouton « envoyer un email à
//      l'adresse que je choisis ».
//
//   node --test scripts/n8n-workflows.test.mjs

import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { MAX_OUTPUT_TOKENS, toN8nRequest } from '../functions/uniflow-api/src/lib/assistant.js'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'n8n')
const doc = (fichier) => JSON.parse(fs.readFileSync(path.join(DIR, fichier), 'utf8'))
const noeud = (fichier, id) => doc(fichier).nodes.find((n) => n.id === id)
const code = (fichier, id) => noeud(fichier, id).parameters.jsCode
const run = (source, globals) => new Function(...Object.keys(globals), source)(...Object.values(globals))

const PASSERELLE = 'uni-passerelle-assistant.workflow.json'
const BIENVENUE = 'uni-bienvenue-inscrit.workflow.json'
const GABARIT = 'uni-gabarit-html.workflow.json'

// ── Passerelle : le corps Gemini fabriqué par l'expression HTTP
const expression = noeud(PASSERELLE, 'uni-gw-http-0002').parameters.jsonBody
  .replace(/^=\{\{/, '')
  .replace(/\}\}$/, '')
  .trim()

function corpsGemini(depuisLaFunction) {
  return JSON.parse(run(`return ${expression}`, { $json: { body: depuisLaFunction } }))
}

test('la passerelle consomme exactement les champs que toN8nRequest envoie', () => {
  const corps = toN8nRequest('SYS', [{ role: 'user', content: 'a' }], { platform: 'web', voice: false })
  // L expression ne lit que ces quatre-là ; un cinquième champ utile serait
  // silencieusement ignoré par n8n, et la Function s en apercevrait jamais.
  for (const clef of ['system', 'messages', 'temperature', 'max_tokens']) {
    assert.ok(clef in corps, `toN8nRequest ne produit plus « ${clef} »`)
  }
  assert.deepEqual(Object.keys(corps).sort(), ['action', 'max_tokens', 'messages', 'platform', 'system', 'temperature', 'voice'])
})

test('le corps Gemini de la passerelle garde la consigne, les rôles model/user et les réglages figés', () => {
  const history = [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'user', content: 'c' }]
  const corps = corpsGemini(toN8nRequest('Tu es Uni.', history))
  assert.deepEqual(corps.system_instruction, { parts: [{ text: 'Tu es Uni.' }] })
  assert.deepEqual(corps.contents.map((c) => c.role), ['user', 'model', 'user'])
  assert.deepEqual(corps.contents[1].parts, [{ text: 'b' }])
  assert.equal(corps.generationConfig.temperature, 0.6)
  assert.equal(corps.generationConfig.maxOutputTokens, MAX_OUTPUT_TOKENS)
  assert.equal(corps.generationConfig.thinkingConfig.thinkingLevel, 'minimal')
  assert.equal(corps.safetySettings.length, 4)
  assert.ok(corps.safetySettings.every((s) => s.threshold === 'BLOCK_MEDIUM_AND_ABOVE'))
})

test('le modèle est nommé dans le nœud HTTP, jamais dans la requête du client', () => {
  assert.match(noeud(PASSERELLE, 'uni-gw-http-0002').parameters.url, /models\/gemini-3\.1-flash-lite:generateContent$/)
  assert.equal('model' in corpsGemini(toN8nRequest('S', [{ role: 'user', content: 'a' }])), false)
  // Le timeout n8n (20 s) doit décrocher avant celui de la Function (25 s) :
  // c'est n8n qui renvoie une erreur lisible, pas l'exécution Appwrite tuée.
  assert.equal(noeud(PASSERELLE, 'uni-gw-http-0002').parameters.options.timeout, 20000)
})

test('une requête minimale ne casse pas le corps : 0.6 / 1024 par défaut', () => {
  const corps = corpsGemini({ system: 'S', messages: [{ role: 'user', content: 'a' }] })
  assert.equal(corps.generationConfig.temperature, 0.6)
  assert.equal(corps.generationConfig.maxOutputTokens, 1024)
  assert.equal(corps.contents.length, 1)
})

// ── Passerelle : lecture de la réponse
const reponse = (payload) => run(code(PASSERELLE, 'uni-gw-code-0003'), { $input: { first: () => ({ json: payload }) } })[0].json

test('la passerelle rend l’enveloppe { ok, reply, provider, model } de la Function', () => {
  assert.deepEqual(
    reponse({ candidates: [{ content: { parts: [{ text: 'Bon' }, { text: 'jour' }] } }] }),
    { ok: true, reply: 'Bonjour', provider: 'gemini', model: 'gemini-3.1-flash-lite', assistant: 'Uni' },
  )
})

test('une réponse vide ou filtrée lève GEMINI_EMPTY, donc la Function bascule sur Mistral', () => {
  for (const [label, payload] of [
    ['parts vides', { candidates: [{ content: { parts: [] } }] }],
    ['contenu bloqué', { promptFeedback: { blockReason: 'SAFETY' } }],
    ['réponse absente', {}],
  ]) {
    assert.throws(() => reponse(payload), /GEMINI_EMPTY/, label)
  }
})

// ── Bienvenue : contrôle d'intégrité du webhook Appwrite
const URL_WEBHOOK = 'https://n8n.kernelforge.codes/webhook/appwrite-users'
const SECRET = 'secret-test-2026'
const verifier = code(BIENVENUE, 'uni-bw-code-0002')

function livrer(user, { event = 'users.create', secret = SECRET, store = { welcomed: [] } } = {}) {
  const rawBody = JSON.stringify(user)
  const signature = secret === null ? '' : crypto.createHmac('sha1', secret).update(URL_WEBHOOK + rawBody).digest('hex')
  const sortie = run(verifier, {
    $input: { first: () => ({ json: { headers: { 'x-appwrite-event': event, 'x-appwrite-webhook-signature': signature }, body: user, rawBody } }) },
    $env: secret === null ? {} : { APPWRITE_WEBHOOK_SECRET: SECRET },
    require: (module) => (module === 'crypto' ? crypto : require(module)),
    $getStaticData: () => store,
    $setStaticData: (donnees) => Object.assign(store, donnees),
  })
  return { items: sortie || [], store }
}

const AMINE = { $id: '652f1a', name: 'Amine Diallo', email: 'amine.diallo@gmail.com' }

test('une signature concordante livre, une autre refuse', () => {
  const ok = livrer(AMINE)
  assert.equal(ok.items.length, 1)
  assert.deepEqual(ok.items[0].json, { email: AMINE.email, name: AMINE.name, userId: AMINE.$id, event: 'users.create' })
  assert.throws(() => livrer(AMINE, { secret: 'un-autre-secret' }), /SIGNATURE_REJETEE/)
})

test('sans secret configuré, la livraison est refusée plutôt qu’un envoi non contrôlé', () => {
  assert.throws(() => livrer(AMINE, { secret: null }), /APPWRITE_WEBHOOK_SECRET absent/)
})

test('les seeds et la QA, sur des TLD réservés, ne reçoivent aucun email', () => {
  for (const email of [
    'etudiant.ict4d.l1@uniflow.test',
    'x@example.invalid',
    'qr-delegate-1@test.uniflow.local',
    'administration.ict4d@uniflow.test',
    'qa@exemple.com',
  ]) {
    const attendu = email.endsWith('@exemple.com') ? 1 : 0
    assert.equal(livrer({ ...AMINE, email }).items.length, attendu, email)
  }
})

test('un autre événement, un email vide ou un payload sans identifiant ne livrent pas', () => {
  assert.equal(livrer(AMINE, { event: 'users.update' }).items.length, 0)
  assert.equal(livrer({ ...AMINE, email: '' }).items.length, 0)
  assert.equal(livrer({ name: 'X' }).items.length, 0)
})

test('Appwrite rejoue-t-il la livraison, l étudiant ne reçoit qu’une bienvenue', () => {
  const store = { welcomed: [] }
  assert.deepEqual([1, 2, 3].map(() => livrer(AMINE, { store }).items.length), [1, 0, 0])
})

// ── Gabarit HTML : pied de page Uni, échappement, poids
const gabarit = (entree) => run(code(GABARIT, 'uni-gab-code-0002'), { $input: { first: () => ({ json: entree }) } })[0].json
const bienvenue = (user) => run(code(BIENVENUE, 'uni-bw-code-0003'), { $input: { first: () => ({ json: user }) } })[0].json

test('le nom saisi à l inscription est neutralisé avant d entrer dans le HTML', () => {
  const rendu = gabarit({ subject: 'Bienvenue', title: 'T', salutation: 'Bonjour <img src=x onerror=alert(1)>', paragraphs: ['a <b>'], bullets: [], cta: null, note: null })
  assert.ok(!rendu.html.includes('<img src=x'))
  assert.ok(rendu.html.includes('&lt;img src=x onerror=alert(1)&gt;'))
})

test("le bienvenue rendu porte la photo d'Uni, en PNG et en routes hash", () => {
  const rendu = gabarit(bienvenue(livrer(AMINE).items[0].json))
  assert.ok(rendu.html.includes('/assistant/uni-avatar.png'), 'avatar absent du pied de page')
  assert.ok(!rendu.html.toLowerCase().includes('webp'), 'WebP : Outlook desktop ne le décode pas')
  assert.ok(rendu.html.includes('/#/login'), 'les liens doivent être en route hash')
  assert.ok(Buffer.byteLength(rendu.html) < 20_000, 'trop lourd, Gmail tronque')
  assert.equal(rendu.subject, 'Amine, ton compte UniFlow est ouvert')
  assert.ok(rendu.textPlain.includes('UniFlow') && !rendu.textPlain.includes('<'), 'textPlain doit rester du texte')
  assert.ok(rendu.textPlain.includes('l’assistant'), 'l’apostrophe typographique doit survivre à la variante texte seul')
})

test('le gabarit refuse une entrée sans sujet', () => {
  assert.throws(() => gabarit({ title: 'T' }), /GABARIT_ENTREE/)
})

// ── Structure d'import : ce que la console n8n ne peut pas deviner
test('les branchements attendus sont présents', () => {
  const bw = doc(BIENVENUE)
  assert.equal(noeud(BIENVENUE, 'uni-bw-trg-0001').parameters.options.rawBody, true, 'sans rawBody, le HMAC ne peut jamais concorder')
  assert.equal(noeud(BIENVENUE, 'uni-bw-subwf-0004').parameters.workflowId.value, 'REMPLACER_APRES_IMPORT')
  assert.match(noeud(BIENVENUE, 'uni-bw-gmail-0005').parameters.sendTo, /\$\('Vérifier la signature'\)\.item\.json\.email/)
  assert.equal(noeud(BIENVENUE, 'uni-bw-gmail-0005').parameters.options.emailType, 'html')
  assert.equal(noeud(PASSERELLE, 'uni-gw-trg-0001').parameters.authentication, 'headerAuth')
  assert.equal(noeud(PASSERELLE, 'uni-gw-resp-0004').type, 'n8n-nodes-base.respondToWebhook')
  for (const fichier of [PASSERELLE, BIENVENUE, GABARIT]) {
    assert.equal(doc(fichier).active, false, `${fichier} doit s'importer inactif`)
  }
})
