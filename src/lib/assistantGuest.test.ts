import test from 'node:test'
import assert from 'node:assert/strict'
import { GUEST_GREETING, GUEST_SUGGESTIONS, guestReply } from './assistantGuest.ts'

test("Uni invité oriente vers les tarifs, l'inscription, la connexion, les plateformes", () => {
  assert.match(guestReply('Quels sont les tarifs ?').text, /WhatsApp/)
  assert.ok(guestReply('Combien ça coûte ?').links.some((l) => l.to === '/pricing'))
  assert.ok(guestReply('Comment créer un compte enseignant ?').links.some((l) => l.to === '/register'))
  assert.match(guestReply('Comment créer un compte enseignant ?').text, /administration/)
  assert.ok(guestReply("J'ai oublié mon mot de passe").links.some((l) => l.to === '/mot-de-passe-oublie'))
  assert.match(guestReply('Ça marche sur Android ?').text, /hors ligne/)
  assert.match(guestReply("C'est quoi UniFlow ?").text, /KERNEL FORGE/)
})

test('sans mot-clé reconnu, Uni invité propose la connexion et le forum', () => {
  const reply = guestReply('blabla')
  assert.ok(reply.links.some((l) => l.to === '/login'))
  assert.ok(reply.links.some((l) => l.to === '/forum'))
  assert.match(GUEST_GREETING, /Uni/)
  assert.equal(GUEST_SUGGESTIONS.length, 4)
})
