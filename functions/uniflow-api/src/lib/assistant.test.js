import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  GEMINI_MODEL,
  MAX_HISTORY,
  MAX_MESSAGE_CHARS,
  MAX_OUTPUT_TOKENS,
  N8N_DEFAULT_PATH,
  N8N_TOKEN_HEADER,
  buildSystemInstruction,
  extractMistralText,
  extractN8nReply,
  frenchDayOfWeek,
  sanitizeHistory,
  suggestionsFor,
  toMistralRequest,
  toN8nRequest,
} from './assistant.js'

test('le modèle Gemini reste verrouillé sur 3.1 Flash-Lite, et la passerelle a un chemin connu', () => {
  assert.equal(GEMINI_MODEL, 'gemini-3.1-flash-lite')
  assert.equal(N8N_DEFAULT_PATH, '/webhook/uniflow-assistant')
  assert.equal(N8N_TOKEN_HEADER, 'x-uniflow-token')
})

test("sanitizeHistory garde les tours valides, borne la longueur et exige un dernier tour utilisateur", () => {
  const long = 'x'.repeat(MAX_MESSAGE_CHARS + 50)
  const history = sanitizeHistory([
    { role: 'system', content: 'ignoré' },
    { role: 'assistant', content: '  Bonjour  ' },
    { role: 'user', content: long },
  ])
  assert.deepEqual(history.map((m) => m.role), ['assistant', 'user'])
  assert.equal(history[0].content, 'Bonjour')
  assert.equal(history[1].content.length, MAX_MESSAGE_CHARS)
})

test('sanitizeHistory ne conserve que les derniers tours', () => {
  const many = Array.from({ length: MAX_HISTORY + 7 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }))
  many.push({ role: 'user', content: 'dernier' })
  const history = sanitizeHistory(many)
  assert.equal(history.length, MAX_HISTORY)
  assert.equal(history.at(-1).content, 'dernier')
})

test('sanitizeHistory refuse un historique vide ou terminé par l’assistant', () => {
  assert.throws(() => sanitizeHistory([]), /HISTORY_INVALID/)
  assert.throws(() => sanitizeHistory([{ role: 'assistant', content: 'salut' }]), /HISTORY_INVALID/)
  assert.throws(() => sanitizeHistory([{ role: 'user', content: '   ' }]), /HISTORY_INVALID/)
})

test('frenchDayOfWeek rend la forme stockée en base (« Lundi »)', () => {
  assert.equal(frenchDayOfWeek(new Date('2026-09-21T10:00:00Z')), 'Lundi')
  assert.equal(frenchDayOfWeek(new Date('2026-09-26T10:00:00Z')), 'Samedi')
})

test('la consigne système porte le profil et les séances du jour', () => {
  const caller = { name: 'Amine Diallo', role: 'STUDENT', accountType: 'UNIVERSITY', university: 'Université de Yaoundé I', program: 'ICT4D', level: 'L1' }
  const text = buildSystemInstruction(caller, {
    todayLabel: 'lundi 21 septembre 2026',
    dayLabel: 'Lundi',
    scopeLabel: 'ICT4D · L1',
    todaySessions: [{ startTime: '08:00', endTime: '10:00', courseCode: 'INF 101', courseName: 'Algorithmique', teacherName: 'Dr NKOUMOU', classroom: 'S012', type: 'CM' }],
  })
  assert.match(text, /Tu es Uni/)
  assert.match(text, /Filière : ICT4D\./)
  assert.match(text, /Niveau : L1\./)
  assert.match(text, /08:00–10:00 INF 101 Algorithmique \(CM\) — Dr NKOUMOU — salle S012/)
  assert.match(text, /lundi 21 septembre 2026/)
})

test('les options platform et voice adaptent la consigne, et une plateforme inconnue est ignorée', () => {
  const caller = { role: 'STUDENT', accountType: 'UNIVERSITY', name: 'X' }
  const desktop = buildSystemInstruction(caller, {}, { platform: 'desktop' })
  assert.match(desktop, /visioconférence locale \(salle/)
  assert.doesNotMatch(desktop, /lue à haute voix/)
  assert.match(desktop, /Mise en forme/)
  const voice = buildSystemInstruction(caller, {}, { platform: 'mobile', voice: true })
  assert.match(voice, /lue à haute voix/)
  assert.match(voice, /application mobile/)
  assert.doesNotMatch(voice, /Mise en forme/)
  const unknown = buildSystemInstruction(caller, {}, { platform: 'tv' })
  assert.doesNotMatch(unknown, /Le client est/)
})

test('un profil sans filière ou niveau est signalé plutôt que comblé', () => {
  const text = buildSystemInstruction({ role: 'STUDENT', accountType: 'UNIVERSITY', name: 'X' }, { scheduleScope: 'none' })
  assert.match(text, /aucune séance ne peut donc être affichée/)
})

test('les suggestions suivent le rôle', () => {
  assert.match(suggestionsFor({ role: 'TEACHER', accountType: 'UNIVERSITY' })[0], /mes séances/)
  assert.match(suggestionsFor({ role: 'STUDENT', accountType: 'UNIVERSITY' })[0], /cours ai-je/)
  assert.match(suggestionsFor({ accountType: 'PLATFORM' })[0], /compte administration/)
  assert.match(suggestionsFor({ accountType: 'PERSONAL' })[0], /matières/)
  assert.equal(suggestionsFor(null).length, 3)
})

test('toN8nRequest passe la consigne ancrée, les rôles tels quels et aucun modèle', () => {
  const body = toN8nRequest('SYS', [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'user', content: 'c' }], { platform: 'mobile', voice: true })
  assert.equal(body.system, 'SYS')
  assert.deepEqual(body.messages.map((m) => m.role), ['user', 'assistant', 'user'])
  assert.equal(body.temperature, 0.6)
  assert.equal(body.max_tokens, MAX_OUTPUT_TOKENS)
  assert.deepEqual([body.platform, body.voice], ['mobile', true])
  // Le verrou du 2026-09-21 : la requête ne nomme aucun modèle, donc aucun
  // client ne peut faire choisir à la passerelle un modèle plus cher.
  assert.equal('model' in body, false)
  assert.equal('apiKey' in body, false)
})

test('toN8nRequest sans options rend des champs neutres plutôt que des absents', () => {
  const body = toN8nRequest('SYS', [{ role: 'user', content: 'a' }])
  assert.deepEqual([body.platform, body.voice], ['', false])
})

test('toMistralRequest garde la même consigne en tête', () => {
  const body = toMistralRequest('SYS', [{ role: 'user', content: 'a' }])
  assert.equal(body.messages[0].role, 'system')
  assert.equal(body.messages[1].content, 'a')
})

test('extraction des textes de réponse, vides si bloqués', () => {
  assert.equal(extractMistralText({ choices: [{ message: { content: ' Salut ' } }] }), 'Salut')
  assert.equal(extractMistralText({}), '')
})

test('extractN8nReply lit reply, tolère text et le tableau d’éléments n8n', () => {
  assert.equal(extractN8nReply({ ok: true, reply: ' Bonjour ' }), 'Bonjour')
  assert.equal(extractN8nReply({ ok: true, text: 'Salut' }), 'Salut')
  assert.equal(extractN8nReply([{ ok: true, reply: 'Salut' }]), 'Salut')
})

test('extractN8nReply rend une chaîne vide si la passerelle a échoué ou s’est tue', () => {
  assert.equal(extractN8nReply({ ok: false, message: 'GEMINI_EMPTY SAFETY' }), '')
  assert.equal(extractN8nReply({ ok: true }), '')
  assert.equal(extractN8nReply(null), '')
  assert.equal(extractN8nReply([]), '')
})
