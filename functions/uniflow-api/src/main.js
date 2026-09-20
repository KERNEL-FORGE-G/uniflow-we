import academicGrades from './services/academic-grades.js'
import academicRegistration from './services/academic-registration.js'
import adminDirectory from './services/admin-directory.js'
import attendanceSecure from './services/attendance-secure.js'
import contactMessages from './services/contact-messages.js'
import forumReactions from './services/forum-reactions.js'
import messaging from './services/messaging.js'
import subscriptionPayments from './services/subscription-payments.js'
import teamRoster from './services/team-roster.js'

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
  '/admin-directory': adminDirectory,
  '/attendance-secure': attendanceSecure,
  '/contact-messages': contactMessages,
  '/forum-reactions': forumReactions,
  '/messaging': messaging,
  '/subscription-payments': subscriptionPayments,
  '/team-roster': teamRoster,
}

/** Normalise `/Messaging/` ou `messaging` en `/messaging`. */
export function resolveServicePath(rawPath) {
  const trimmed = String(rawPath || '').trim().toLowerCase().replace(/\/+$/, '')
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

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
