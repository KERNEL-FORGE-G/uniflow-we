import test from 'node:test'
import assert from 'node:assert/strict'
import { currencyForCountry, featuredPlanCode, plansForCountry } from './pricingModel.ts'

const catalog = [
  { code: 'academic_uy1_free', category: 'ACADEMIC' as const, countryCode: 'CM', currency: 'XAF', highlight: false, priceMonthlyAmount: 0 },
  { code: 'personal_cm', category: 'PERSONAL' as const, countryCode: 'CM', currency: 'XAF', highlight: true, priceMonthlyAmount: 100 },
  { code: 'personal_eur', category: 'PERSONAL' as const, countryCode: 'FR', currency: 'EUR', highlight: true, priceMonthlyAmount: 1 },
  { code: 'personal_usd', category: 'PERSONAL' as const, countryCode: 'US', currency: 'USD', highlight: true, priceMonthlyAmount: 1 },
  { code: 'teacher_cm', category: 'TEACHER' as const, countryCode: 'CM', currency: 'XAF', highlight: false, priceMonthlyAmount: 500 },
  { code: 'teacher_eur', category: 'TEACHER' as const, countryCode: 'FR', currency: 'EUR', highlight: false, priceMonthlyAmount: 3 },
  { code: 'campus', category: 'INSTITUTION' as const, countryCode: 'CM', currency: 'XAF', highlight: false, priceMonthlyAmount: 0 },
]

const codes = (plans: { code: string }[]) => plans.map((plan) => plan.code)

test('la devise dépend du pays, euro par défaut', () => {
  assert.equal(currencyForCountry('CM'), 'XAF')
  assert.equal(currencyForCountry('BE'), 'EUR')
  assert.equal(currencyForCountry('CA'), 'USD')
  assert.equal(currencyForCountry('ZZ'), 'EUR')
})

test('Cameroun : formules XAF plus les formules indépendantes du pays, sans doublon', () => {
  assert.deepEqual(codes(plansForCountry(catalog, 'CM')), ['academic_uy1_free', 'personal_cm', 'teacher_cm', 'campus'])
})

test('Belgique : aucune formule BE, repli sur la devise EUR', () => {
  assert.deepEqual(codes(plansForCountry(catalog, 'BE')), ['academic_uy1_free', 'personal_eur', 'teacher_eur', 'campus'])
})

test('Canada : USD pour le personnel, mais l’enseignant n’existe qu’en XAF/EUR → pas de carte enseignant', () => {
  assert.deepEqual(codes(plansForCountry(catalog, 'CA')), ['academic_uy1_free', 'personal_usd', 'campus'])
})

test('pays inconnu : offre internationale en euros', () => {
  assert.deepEqual(codes(plansForCountry(catalog, 'ZZ')), ['academic_uy1_free', 'personal_eur', 'teacher_eur', 'campus'])
})

test('deux formules de même catégorie et même pays : seule la première est gardée', () => {
  const doubled = [...catalog, { code: 'personal_cm_bis', category: 'PERSONAL' as const, countryCode: 'CM', currency: 'XAF', highlight: false, priceMonthlyAmount: 200 }]
  assert.deepEqual(codes(plansForCountry(doubled, 'CM')), ['academic_uy1_free', 'personal_cm', 'teacher_cm', 'campus'])
})

test('la formule mise en avant est celle marquée highlight, sinon la première payante', () => {
  assert.equal(featuredPlanCode(plansForCountry(catalog, 'CM')), 'personal_cm')
  const unmarked = catalog.map((plan) => ({ ...plan, highlight: false }))
  assert.equal(featuredPlanCode(plansForCountry(unmarked, 'CM')), 'personal_cm')
  assert.equal(featuredPlanCode([]), null)
})
