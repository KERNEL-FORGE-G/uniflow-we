/**
 * Logique pure de la page tarifaire (testée sous `node --test`).
 *
 * Le catalogue `subscription_plans` porte une formule par devise (XAF, EUR,
 * USD) pour les offres personnelles et enseignantes : afficher tout le
 * catalogue mettait trois « UniFlow Personnel » côte à côte. On ne montre que
 * les formules de la devise du pays choisi, plus celles qui ne dépendent pas du
 * pays (accès académique inclus, déploiement campus sur devis).
 */

export type PlanCurrency = 'XAF' | 'EUR' | 'USD'

export interface CountryOption {
  code: string
  label: string
  currency: PlanCurrency
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'CM', label: 'Cameroun', currency: 'XAF' },
  { code: 'FR', label: 'France', currency: 'EUR' },
  { code: 'BE', label: 'Belgique', currency: 'EUR' },
  { code: 'CA', label: 'Canada', currency: 'USD' },
  { code: 'US', label: 'États-Unis', currency: 'USD' },
]

/** Devise attendue pour un pays ; l'euro sert de repli international. */
export function currencyForCountry(countryCode: string): PlanCurrency {
  return COUNTRY_OPTIONS.find((option) => option.code === countryCode)?.currency ?? 'EUR'
}

export interface PricingPlanLike {
  code: string
  category: 'PERSONAL' | 'TEACHER' | 'INSTITUTION' | 'ACADEMIC'
  countryCode?: string
  currency?: string
}

const COUNTRY_INDEPENDENT: PricingPlanLike['category'][] = ['ACADEMIC', 'INSTITUTION']

/**
 * Formules à afficher pour un pays, dans l'ordre reçu.
 *
 * Priorité : formules du pays exact, sinon de sa devise, sinon en euros (offre
 * internationale). Une même catégorie n'apparaît qu'une fois par pays pour
 * qu'un ajout de devise au catalogue ne dédouble jamais une carte.
 */
export function plansForCountry<T extends PricingPlanLike>(plans: T[], countryCode: string): T[] {
  const currency = currencyForCountry(countryCode)
  const priced = plans.filter((plan) => !COUNTRY_INDEPENDENT.includes(plan.category))
  const byCountry = priced.filter((plan) => plan.countryCode === countryCode)
  const byCurrency = priced.filter((plan) => plan.currency === currency)
  const international = priced.filter((plan) => plan.currency === 'EUR')
  const candidates = byCountry.length > 0 ? byCountry : byCurrency.length > 0 ? byCurrency : international

  const seenCategories = new Set<string>()
  const localized = candidates.filter((plan) => {
    if (seenCategories.has(plan.category)) return false
    seenCategories.add(plan.category)
    return true
  })

  return plans.filter((plan) => COUNTRY_INDEPENDENT.includes(plan.category) || localized.includes(plan))
}

/**
 * Formule à mettre en avant : celle marquée `highlight`, sinon la première
 * formule payante. Une page sans aucune carte accentuée se lisait comme une
 * liste, sans recommandation.
 */
export function featuredPlanCode<T extends PricingPlanLike & { highlight?: boolean; priceMonthlyAmount: number }>(plans: T[]): string | null {
  return plans.find((plan) => plan.highlight)?.code ?? plans.find((plan) => plan.priceMonthlyAmount > 0)?.code ?? null
}
