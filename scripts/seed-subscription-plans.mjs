/**
 * Écrit le catalogue des formules dans `subscription_plans` (idempotent).
 *
 *   node scripts/seed-subscription-plans.mjs
 *
 * La configuration vient de `uniflow-backend/.env` via `appwrite-env.mjs`. Le
 * schéma doit déjà être provisionné (`provision-appwrite-selfhosted.mjs`) : les
 * attributs `features` et `sortOrder` sont refusés par Appwrite tant qu'ils
 * n'existent pas sur la collection, et le script s'arrête alors avec l'erreur
 * du serveur plutôt que d'écrire des formules incomplètes.
 *
 * Les formules absentes du catalogue ne sont pas supprimées : une formule
 * retirée peut encore être référencée par des demandes de paiement et des
 * statuts d'abonnement. Pour la retirer de la page, passer son `status` à
 * `INACTIVE` depuis la console.
 */
import { createClient, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'
import { subscriptionPlanCatalog, upsertSubscriptionPlan } from './subscription-plans-catalog.mjs'

requireConfig()
console.log(`Catalogue des formules → ${endpoint} — projet ${projectId}`)

const request = createClient()
const summary = { created: 0, updated: 0 }
for (const plan of subscriptionPlanCatalog) {
  const outcome = await upsertSubscriptionPlan(request, databaseId, plan)
  summary[outcome] += 1
  console.log(`  ${outcome === 'created' ? '+' : '='} ${plan.code} — ${plan.name} (${plan.priceMonthlyAmount} ${plan.currency}/mois)`)
}
console.log(`Formules : ${summary.created} créée(s), ${summary.updated} mise(s) à jour, ${subscriptionPlanCatalog.length} au catalogue.`)
