import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_PAYMENT_FILTERS, matchesPaymentFilters, rejectionReasonProblem, whatsappBillingMessage, whatsappBillingUrl } from './paymentsModel.ts'
import { CONTACT_WHATSAPP_E164 } from './contactInfo.ts'

const input = { reference: 'UF-2026-0001', planName: 'Étudiant Premium', billingCycle: 'MONTHLY' as const, amount: 2500, currency: 'XAF', fullName: 'Ada Lovelace', email: 'ada@example.com' }

test('le message WhatsApp porte la référence, la formule et le montant', () => {
  const message = whatsappBillingMessage(input)
  assert.match(message, /Référence : UF-2026-0001/)
  assert.match(message, /Étudiant Premium \(mensuel\)/)
  assert.match(message, /2\s?500/)
  assert.match(message, /Ada Lovelace/)
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
})
