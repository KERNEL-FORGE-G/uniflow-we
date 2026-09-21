import test from 'node:test'
import assert from 'node:assert/strict'
import { customerWhatsappUrl, decisionOf, matchesAdminFilters, rejectionReasonError, whatsappUrl } from './payments.js'

test('decisionOf : validate/reject et la forme historique review', () => {
  assert.equal(decisionOf('validate'), 'CONFIRMED')
  assert.equal(decisionOf('reject'), 'REJECTED')
  assert.equal(decisionOf('review', { decision: 'CONFIRMED' }), 'CONFIRMED')
  assert.equal(decisionOf('review', { decision: 'VALIDATED' }), 'CONFIRMED', 'VALIDATED absent du schéma → CONFIRMED')
  assert.equal(decisionOf('review', { decision: 'REJECTED' }), 'REJECTED')
  assert.equal(decisionOf('review', { decision: 'CANCELLED' }), '')
  assert.equal(decisionOf('list'), '')
})

test('rejectionReasonError : un rejet sans motif est refusé', () => {
  assert.equal(rejectionReasonError('REJECTED', ''), 'INVALID_ADMIN_NOTE')
  assert.equal(rejectionReasonError('REJECTED', '   '), 'INVALID_ADMIN_NOTE')
  assert.equal(rejectionReasonError('REJECTED', 'Preuve illisible'), '')
  assert.equal(rejectionReasonError('CONFIRMED', ''), '')
})

test('whatsappUrl : numéro de facturation et message pré-rempli', () => {
  const url = whatsappUrl({ reference: 'UF-1', planName: 'Premium', billingCycle: 'ANNUALLY', amount: 12000, currency: 'XAF', fullName: 'Ada', email: 'ada@example.com' })
  assert.ok(url.startsWith('https://wa.me/237657635644?text='))
  const text = decodeURIComponent(url.split('text=')[1])
  assert.match(text, /UF-1/)
  assert.match(text, /Premium \(annuel\)/)
  assert.match(text, /12000 XAF/)
  assert.match(text, /Ada/)
  assert.doesNotMatch(text, /Université/, 'sans institution renseignée, aucune ligne vide « Université : »')
})

test('whatsappUrl : l’université / faculté figure dans le message quand elle est connue', () => {
  const url = whatsappUrl({ reference: 'UF-2', planName: 'Personnel', billingCycle: 'MONTHLY', amount: 100, currency: 'XAF', fullName: 'Ada', email: 'ada@example.com', institution: '  UY1 — Faculté des Sciences ' })
  const text = decodeURIComponent(url.split('text=')[1])
  assert.match(text, /Université \/ faculté : UY1 — Faculté des Sciences\n/, 'valeur nettoyée de ses espaces')
})

test('customerWhatsappUrl : ne garde que les chiffres, vide si trop court', () => {
  assert.equal(customerWhatsappUrl('+237 6 57 63 56 44'), 'https://wa.me/237657635644')
  assert.equal(customerWhatsappUrl(''), '')
  assert.equal(customerWhatsappUrl('12'), '')
})

test('matchesAdminFilters : statut, formule, période, recherche', () => {
  const request = { status: 'PENDING', planCode: 'premium', requestedAt: '2026-09-20T08:00:00.000Z', fullName: 'Ada Lovelace', email: 'ada@example.com', reference: 'UF-42' }
  assert.equal(matchesAdminFilters(request), true)
  assert.equal(matchesAdminFilters(request, { status: 'PENDING' }), true)
  assert.equal(matchesAdminFilters(request, { status: 'REJECTED' }), false)
  assert.equal(matchesAdminFilters(request, { status: 'INCONNU' }), true, 'un statut hors énumération est ignoré')
  assert.equal(matchesAdminFilters(request, { planCode: 'basic' }), false)
  assert.equal(matchesAdminFilters(request, { from: '2026-09-21' }), false)
  assert.equal(matchesAdminFilters(request, { to: '2026-09-19' }), false)
  assert.equal(matchesAdminFilters(request, { from: '2026-09-19', to: '2026-09-21' }), true)
  assert.equal(matchesAdminFilters(request, { search: 'lovelace' }), true)
  assert.equal(matchesAdminFilters(request, { search: 'UF-42' }), true)
  assert.equal(matchesAdminFilters(request, { search: 'bob' }), false)
  assert.equal(matchesAdminFilters({ ...request, institution: 'Université de Douala' }, { search: 'douala' }), true, 'la recherche couvre l’université')
  assert.equal(matchesAdminFilters(request, { search: 'douala' }), false, 'sans institution, pas de faux positif')
})
