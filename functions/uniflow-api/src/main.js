import academicGrades from './services/academic-grades.js'
import academicRegistration from './services/academic-registration.js'
import account from './services/account.js'
import adminDirectory from './services/admin-directory.js'
import assistant from './services/assistant.js'
import attendanceSecure from './services/attendance-secure.js'
import contactMessages from './services/contact-messages.js'
import forumReactions from './services/forum-reactions.js'
import messaging from './services/messaging.js'
import metrics from './services/metrics.js'
import publicStats from './services/public-stats.js'
import subscriptionPayments from './services/subscription-payments.js'
import teamRoster from './services/team-roster.js'
import { resolveServicePath } from './lib/router.js'

/**
 * Point d'entrée unique des services UniFlow côté serveur.
 *
 * Le plan gratuit d'Appwrite Cloud n'autorise que **deux** Functions par
 * projet ; UniFlow en avait neuf (plus `notification-alerts`, déclenchée par
 * événement, qui reste à part). Elles sont donc regroupées ici et distinguées
 * par le chemin d'exécution (`path` de `createExecution`), qui reprend
 * l'ancien identifiant : `/messaging`, `/team-roster`, `/forum-reactions`…
 * Chaque service garde son code, sa charge utile et ses réponses inchangés —
 * seul l'adressage a bougé, ce qui limite les retouches côté clients à
 * l'ajout du chemin.
 *
 * Un chemin inconnu (ou vide) répond 404 avec la liste des services : c'est le
 * symptôme d'un client qui appelle encore l'ancien identifiant de Function.
 */
const services = {
  '/academic-grades': academicGrades,
  '/academic-registration': academicRegistration,
  // Suppression de compte par son titulaire : le mobile et le desktop
  // l'appelaient déjà, sans service derrière (2026-09-21).
  '/account': account,
  '/admin-directory': adminDirectory,
  // Assistant « Flo » (Gemini 3.1 Flash-Lite, clés côté serveur) — ajouté le
  // 2026-09-21 ; c'est le dixième service, le routeur n'a pas de limite.
  '/assistant': assistant,
  '/attendance-secure': attendanceSecure,
  '/contact-messages': contactMessages,
  '/forum-reactions': forumReactions,
  '/messaging': messaging,
  // Mesure d'audience (landing + administration), sans service tiers — 2026-09-21.
  '/metrics': metrics,
  '/public-stats': publicStats,
  '/subscription-payments': subscriptionPayments,
  '/team-roster': teamRoster,
}

// `resolveServicePath` vit dans `lib/router.js` pour être testable avec
// `node --test` sans charger `node-appwrite` (absent des environnements de test).
export { resolveServicePath }

export default async (context) => {
  const { req, res } = context
  const path = resolveServicePath(req.path)
  const service = services[path]
  if (!service) {
    return res.json(
      { ok: false, code: 'UNKNOWN_SERVICE', message: `Service inconnu : « ${path} ».`, services: Object.keys(services) },
      404,
      { 'content-type': 'application/json' },
    )
  }
  return service(context)
}
