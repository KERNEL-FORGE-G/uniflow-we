import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_PAYMENT_FILTERS, annualSavingsPercent, matchesPaymentFilters, rejectionReasonProblem, shouldHideMissingSubscription, whatsappBillingMessage, whatsappBillingUrl } from './paymentsModel.ts'
import { CONTACT_WHATSAPP_E164 } from './contactInfo.ts'

const input = { reference: 'UF-2026-0001', planName: 'Étudiant Premium', billingCycle: 'MONTHLY' as const, amount: 2500, currency: 'XAF', fullName: 'Ada Lovelace', email: 'ada@example.com' }

test('le message WhatsApp porte la référence, la formule et le montant', () => {
  const message = whatsappBillingMessage(input)
  assert.match(message, /Référence : UF-2026-0001/)
  assert.match(message, /Étudiant Premium \(mensuel\)/)
  assert.match(message, /2\s?500/)
  assert.match(message, /Ada Lovelace/)
  assert.doesNotMatch(message, /Université/, 'pas de ligne université vide quand elle n’est pas renseignée')
})

test('le message WhatsApp porte l’université / faculté quand elle est connue', () => {
  const message = whatsappBillingMessage({ ...input, institution: ' Université de Yaoundé I — FS ' })
  assert.match(message, /Université \/ faculté : Université de Yaoundé I — FS\n/)
})

test('la remise annuelle est calculée sur les montants réels de la formule', () => {
  assert.equal(annualSavingsPercent(100, 1000), 17, 'dix mensualités pour douze mois : deux mois offerts')
  assert.equal(annualSavingsPercent(500, 5000), 17)
  assert.equal(annualSavingsPercent(100, 1200), 0, 'aucune remise si l’annuel vaut douze mensualités')
  assert.equal(annualSavingsPercent(100, 1500), 0, 'jamais de remise négative')
  assert.equal(annualSavingsPercent(0, 0), 0, 'formule incluse : rien à remiser')
})

test('l’URL cible le numéro de facturation centralisé et encode le message', () => {
  const url = whatsappBillingUrl(input)
  assert.ok(url.startsWith(`https://wa.me/${CONTACT_WHATSAPP_E164}?text=`))
  assert.ok(url.includes(encodeURIComponent('UF-2026-0001')))
  assert.ok(!url.includes('\n'), 'les sauts de ligne sont encodés')
})

test('le motif de rejet est obligatoire', () => {
  assert.ok(rejectionReasonProblem(''))
  assert.ok(rejectionReasonProblem('  no '))
  assert.equal(rejectionReasonProblem('Preuve de paiement illisible'), null)
})

const rows = [
  { status: 'PENDING' as const, planCode: 'STUDENT', requestedAt: '2026-09-10T10:00:00Z', fullName: 'Ada', email: 'ada@x.cm', reference: 'UF-1' },
  { status: 'CONFIRMED' as const, planCode: 'TEACHER', requestedAt: '2026-09-01T10:00:00Z', fullName: 'Grace', email: 'grace@x.cm', reference: 'UF-2' },
]

test('filtres admin : statut, formule, dates inclusives, recherche', () => {
  assert.deepEqual(rows.filter((row) => matchesPaymentFilters(row, DEFAULT_PAYMENT_FILTERS)).map((r) => r.reference), ['UF-1'])
  assert.equal(rows.filter((row) => matchesPaymentFilters(row, { ...DEFAULT_PAYMENT_FILTERS, status: 'ALL' })).length, 2)
  assert.deepEqual(rows.filter((row) => matchesPaymentFilters(row, { ...DEFAULT_PAYMENT_FILTERS, status: 'ALL', planCode: 'TEACHER' })).map((r) => r.reference), ['UF-2'])
  assert.deepEqual(rows.filter((row) => matchesPaymentFilters(row, { ...DEFAULT_PAYMENT_FILTERS, status: 'ALL', from: '2026-09-05' })).map((r) => r.reference), ['UF-1'])
  assert.deepEqual(rows.filter((row) => matchesPaymentFilters(row, { ...DEFAULT_PAYMENT_FILTERS, status: 'ALL', to: '2026-09-01' })).map((r) => r.reference), ['UF-2'])
  assert.deepEqual(rows.filter((row) => matchesPaymentFilters(row, { ...DEFAULT_PAYMENT_FILTERS, status: 'ALL', search: 'grace' })).map((r) => r.reference), ['UF-2'])
  const withInstitution = rows.map((row) => (row.reference === 'UF-1' ? { ...row, institution: 'Université de Douala' } : row))
  assert.deepEqual(withInstitution.filter((row) => matchesPaymentFilters(row, { ...DEFAULT_PAYMENT_FILTERS, status: 'ALL', search: 'douala' })).map((r) => r.reference), ['UF-1'], 'la recherche couvre l’université')
})

test('l’absence d’abonnement est tue pour les comptes universitaires hors page Abonnement', () => {
  assert.equal(shouldHideMissingSubscription('UNIVERSITY', false), true)
  assert.equal(shouldHideMissingSubscription('PLATFORM', false), true)
  assert.equal(shouldHideMissingSubscription('UNIVERSITY', true), false)
  assert.equal(shouldHideMissingSubscription('PERSONAL', false), false)
  assert.equal(shouldHideMissingSubscription('PERSONAL', true), false)
})
