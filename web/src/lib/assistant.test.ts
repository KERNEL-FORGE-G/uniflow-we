import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_STORED_TURNS,
  clearMessages,
  historyForServer,
  inlineParts,
  loadMessages,
  makeMessage,
  renderMarkdownLite,
  saveMessages,
  storageKeyFor,
  trimMessages,
} from './assistant.ts'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => { map.set(k, v) },
    removeItem: (k: string) => { map.delete(k) },
    size: () => map.size,
  }
}

test('la clé de stockage est propre à chaque compte', () => {
  assert.notEqual(storageKeyFor('u1'), storageKeyFor('u2'))
  assert.match(storageKeyFor(''), /anonyme$/)
})

test("historyForServer exclut l'accueil local, les échecs et les vides", () => {
  const messages = [
    makeMessage('assistant', 'Bonjour !', { local: true }),
    makeMessage('user', 'Quels cours ?'),
    makeMessage('assistant', '', { failed: true }),
    makeMessage('user', '   '),
    makeMessage('assistant', 'Deux cours.'),
  ]
  assert.deepEqual(historyForServer(messages), [
    { role: 'user', content: 'Quels cours ?' },
    { role: 'assistant', content: 'Deux cours.' },
  ])
})

test("trimMessages garde l'accueil et les derniers tours", () => {
  const greeting = makeMessage('assistant', 'Salut', { local: true })
  const many = Array.from({ length: MAX_STORED_TURNS + 5 }, (_, i) => makeMessage(i % 2 ? 'assistant' : 'user', `m${i}`))
  const trimmed = trimMessages([greeting, ...many])
  assert.equal(trimmed.length, MAX_STORED_TURNS + 1)
  assert.equal(trimmed[0], greeting)
  assert.equal(trimmed.at(-1)?.content, `m${MAX_STORED_TURNS + 4}`)
})

test('sauvegarde, relecture et effacement tolèrent un stockage absent ou corrompu', () => {
  const storage = memoryStorage()
  const messages = [makeMessage('user', 'a'), makeMessage('assistant', 'b')]
  saveMessages(storage, 'u1', messages)
  assert.deepEqual(loadMessages(storage, 'u1').map((m) => m.content), ['a', 'b'])
  storage.setItem(storageKeyFor('u2'), '{pas du json')
  assert.deepEqual(loadMessages(storage, 'u2'), [])
  storage.setItem(storageKeyFor('u3'), JSON.stringify([{ role: 'system', content: 'x' }, { id: '1', role: 'user', content: 'ok' }]))
  assert.deepEqual(loadMessages(storage, 'u3').map((m) => m.content), ['ok'])
  clearMessages(storage, 'u1')
  assert.deepEqual(loadMessages(storage, 'u1'), [])
  assert.deepEqual(loadMessages(undefined, 'u1'), [])
  saveMessages(undefined, 'u1', messages)
})

test('inlineParts découpe le gras sans perdre le texte', () => {
  assert.deepEqual(inlineParts('a **b** c'), [
    { text: 'a ', bold: false },
    { text: 'b', bold: true },
    { text: ' c', bold: false },
  ])
  assert.deepEqual(inlineParts('rien'), [{ text: 'rien', bold: false }])
})

test('renderMarkdownLite : paragraphes, puces (*, -, 1.) et titres aplatis', () => {
  const blocks = renderMarkdownLite('## Emploi du temps\nDeux cours :\n\n*   **08:00** ICT101\n- 10:15 ICT102\n1. fin\n\nBon courage.')
  assert.deepEqual(blocks.map((b) => b.kind), ['paragraph', 'list', 'paragraph'])
  const list = blocks[1]
  assert.equal(list.kind === 'list' ? list.items.length : 0, 3)
  const first = blocks[0]
  assert.equal(first.kind === 'paragraph' ? first.parts.map((p) => p.text).join('') : '', 'Emploi du temps Deux cours :')
})
