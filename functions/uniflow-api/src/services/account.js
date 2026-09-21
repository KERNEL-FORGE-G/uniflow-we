import { Client, Databases, Query, Storage, Users } from 'node-appwrite'
import { DATABASE_ID, actorIdOf } from '../lib/caller.js'

/**
 * `/account` — actions qu'un utilisateur exerce sur **son propre** compte.
 *
 * `delete-self` : droit à l'effacement (politique de confidentialité, § 5 et
 * page « Droits des utilisateurs »). Les clients mobile et desktop appelaient
 * déjà ce chemin depuis leur écran « Supprimer mon compte » ; le service
 * n'existait pas côté Function (constaté le 2026-09-21), la demande échouait
 * donc partout. Le web se branche dessus en même temps.
 *
 * Ce qui est effacé : le compte Appwrite (sessions comprises), le document
 * `users`, l'entrée d'annuaire, la photo de profil, les notifications, les
 * réactions du forum, la préférence d'abonnement et l'espace personnel. Ce
 * qui est conservé, dissocié de l'identité : présences, notes, rendus,
 * demandes de paiement (obligations de l'établissement et traçabilité de la
 * facturation). Les messages et publications restent, sans auteur
 * résoluble : l'annuaire ne le connaît plus.
 */

const BUCKET_ID = 'uniflow_assets'

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function bodyOf(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

/** Collections dont les documents appartiennent en propre à l'utilisateur. */
export const OWNED_COLLECTIONS = [
  { collection: 'academic_directory', attribute: 'userId' },
  { collection: 'notifications', attribute: 'ownerId' },
  { collection: 'forum_reactions', attribute: 'userId' },
  { collection: 'subscription_statuses', attribute: 'userId' },
  { collection: 'personal_subjects', attribute: 'ownerId' },
  { collection: 'personal_schedules', attribute: 'ownerId' },
  { collection: 'personal_tasks', attribute: 'ownerId' },
  { collection: 'personal_grades', attribute: 'ownerId' },
]

async function deleteOwned(databases, userId, log) {
  const removed = {}
  for (const { collection, attribute } of OWNED_COLLECTIONS) {
    removed[collection] = 0
    for (;;) {
      let page
      try {
        page = await databases.listDocuments(DATABASE_ID, collection, [Query.equal(attribute, userId), Query.limit(100)])
      } catch (exception) {
        // Collection absente sur cette instance : rien à effacer.
        log?.(`account/delete-self: ${collection} ignorée (${exception?.message || exception})`)
        break
      }
      if (!page.documents.length) break
      await Promise.all(page.documents.map((doc) => databases.deleteDocument(DATABASE_ID, collection, doc.$id).catch(() => null)))
      removed[collection] += page.documents.length
      if (page.documents.length < 100) break
    }
  }
  return removed
}

export default async ({ req, res, log, error }) => {
  const userId = actorIdOf(req)
  if (!userId) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connectez-vous pour gérer votre compte.' }, 401)

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.headers['x-appwrite-key'] || '')
  const users = new Users(client)
  const databases = new Databases(client)
  const storage = new Storage(client)
  const body = bodyOf(req)

  if (body.action !== 'delete-self') {
    return json(res, { ok: false, code: 'ACTION_INVALID', message: 'Action inconnue pour /account.' }, 400)
  }

  try {
    // Garde-fou : le compte administrateur de la plateforme ne se supprime
    // pas depuis un client — il n'a pas de remplaçant.
    const account = await users.get(userId)
    if (Array.isArray(account.labels) && account.labels.includes('superadmin')) {
      return json(res, { ok: false, code: 'SUPERADMIN_PROTECTED', message: 'Le compte administrateur de la plateforme ne peut pas être supprimé depuis l’application.' }, 403)
    }

    let avatarFileId = ''
    try {
      const profile = await databases.getDocument(DATABASE_ID, 'users', userId)
      avatarFileId = typeof profile.avatarFileId === 'string' ? profile.avatarFileId : ''
    } catch { /* profil jamais créé : rien à lire */ }

    const removed = await deleteOwned(databases, userId, log)
    if (avatarFileId) await storage.deleteFile(BUCKET_ID, avatarFileId).catch(() => null)
    await databases.deleteDocument(DATABASE_ID, 'users', userId).catch(() => null)
    try { await users.deleteSessions(userId) } catch { /* aucune session ou déjà fermées */ }
    await users.delete(userId)

    log?.(`account/delete-self: ${userId} supprimé (${JSON.stringify(removed)})`)
    return json(res, { ok: true, deleted: { userId, avatar: Boolean(avatarFileId), ...removed } })
  } catch (exception) {
    error?.(`account/delete-self: ${exception?.message || exception}`)
    return json(res, { ok: false, code: 'DELETE_FAILED', message: 'La suppression du compte a échoué. Réessayez ou écrivez-nous.' }, 500)
  }
}
