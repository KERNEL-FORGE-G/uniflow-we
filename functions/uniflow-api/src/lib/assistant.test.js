import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  GEMINI_ENDPOINT,
  GEMINI_MODEL,
  MAX_HISTORY,
  MAX_MESSAGE_CHARS,
  buildSystemInstruction,
  extractGeminiText,
  extractMistralText,
  frenchDayOfWeek,
  sanitizeHistory,
  suggestionsFor,
  toGeminiRequest,
  toMistralRequest,
} from './assistant.js'

test('le modèle Gemini est verrouillé sur 3.1 Flash-Lite', () => {
  assert.equal(GEMINI_MODEL, 'gemini-3.1-flash-lite')
  assert.match(GEMINI_ENDPOINT, /models\/gemini-3\.1-flash-lite:generateContent$/)
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

test('toGeminiRequest traduit les rôles et fige la consigne système', () => {
  const body = toGeminiRequest('SYS', [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'user', content: 'c' }])
  assert.equal(body.system_instruction.parts[0].text, 'SYS')
  assert.deepEqual(body.contents.map((c) => c.role), ['user', 'model', 'user'])
  assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, 'minimal')
})

test('toMistralRequest garde la même consigne en tête', () => {
  const body = toMistralRequest('SYS', [{ role: 'user', content: 'a' }])
  assert.equal(body.messages[0].role, 'system')
  assert.equal(body.messages[1].content, 'a')
})

test('extraction des textes de réponse, vides si bloqués', () => {
  assert.equal(extractGeminiText({ candidates: [{ content: { parts: [{ text: 'Bon' }, { text: 'jour' }] } }] }), 'Bonjour')
  assert.equal(extractGeminiText({ promptFeedback: { blockReason: 'SAFETY' } }), '')
  assert.equal(extractMistralText({ choices: [{ message: { content: ' Salut ' } }] }), 'Salut')
  assert.equal(extractMistralText({}), '')
})
