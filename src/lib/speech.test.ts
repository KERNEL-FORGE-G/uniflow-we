import test from 'node:test'
import assert from 'node:assert/strict'
import { loadVoicePreference, pickFrenchVoice, saveVoicePreference, speechText } from './speech.ts'

test('speechText retire le Markdown, les émojis, les URL et lit les heures naturellement', () => {
  assert.equal(
    speechText('**Deux cours** aujourd\'hui 🎓 :\n- 08:00 ICT101\n- 10:15 ICT102 https://uniflow.kernelforge.codes'),
    "Deux cours aujourd'hui : 8 h ICT101 10 h 15 ICT102",
  )
  assert.equal(speechText('## Titre\n> citation'), 'Titre citation')
  assert.equal(speechText('   '), '')
})

test('pickFrenchVoice préfère une voix fr-FR locale, puis fr-*, et rien sans voix française', () => {
  const voices = [
    { lang: 'en-US', name: 'Samantha', default: true },
    { lang: 'fr-CA', name: 'Amélie', localService: true },
    { lang: 'fr-FR', name: 'Thomas', localService: false },
    { lang: 'fr-FR', name: 'Audrey', localService: true },
  ]
  assert.equal(pickFrenchVoice(voices)?.name, 'Audrey')
  assert.equal(pickFrenchVoice(voices.slice(0, 3))?.name, 'Thomas')
  assert.equal(pickFrenchVoice(voices.slice(0, 2))?.name, 'Amélie')
  assert.equal(pickFrenchVoice([voices[0]]), undefined)
  assert.equal(pickFrenchVoice([]), undefined)
})

test('la préférence vocale se lit et s\'écrit, et tolère un stockage absent', () => {
  const map = new Map<string, string>()
  const storage = { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v) } }
  assert.equal(loadVoicePreference(storage), false)
  saveVoicePreference(storage, true)
  assert.equal(loadVoicePreference(storage), true)
  saveVoicePreference(storage, false)
  assert.equal(loadVoicePreference(storage), false)
  assert.equal(loadVoicePreference(undefined), false)
  saveVoicePreference(undefined, true)
})
