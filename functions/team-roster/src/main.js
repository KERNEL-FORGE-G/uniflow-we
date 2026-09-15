/**
 * Function `team-roster` — création, modification et suppression des membres de
 * l'équipe KERNEL FORGE présentés sur la page publique `/teams`.
 *
 * La collection `team_members` est lisible par tous (`read("any")`) : la page
 * publique du web s'affiche sans session, et le mobile comme le desktop la
 * lisent avec la session de l'utilisateur. En revanche **aucune écriture n'est
 * ouverte au niveau collection** : accorder `create("users")` laisserait
 * n'importe quel étudiant connecté effacer la page publique de l'équipe. Toutes
 * les écritures passent donc par ici, et le rôle ADMIN est vérifié côté serveur
 * — jamais accepté du client.
 *
 * Le rôle est lu dans la collection `users`, avec `academic_directory` en
 * second recours : `admin-directory` écrit le rôle dans les deux, mais un
 * compte créé avant cette double écriture n'existe que dans l'une des deux.
 * On ne reprend volontairement pas le contrôle de périmètre UY1/ICT4D/L1 de
 * `admin-directory` : l'équipe KERNEL FORGE est un objet du projet, pas d'une
 * filière, et un administrateur d'une autre filière doit pouvoir la gérer.
 */

import { Client, Databases, ID, Permission, Query, Role, Storage } from 'node-appwrite'

const DATABASE_ID = 'uniflow'
const TEAM_COLLECTION = 'team_members'
const PROFILE_COLLECTION = 'users'
const DIRECTORY_COLLECTION = 'academic_directory'
const AVATAR_BUCKET = '6aa81b840031e6a34dc3'

const TEAMS = ['Leadership', 'Frontend', 'Backend']
const ACCENTS = ['blue', 'purple', 'emerald', 'amber', 'rose', 'cyan', 'indigo']

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

function requireText(value, field, max = 255) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`Champ requis ou invalide : ${field}`)
  return value.trim()
}

/** Champ facultatif : absent ou vide devient `''`, jamais `undefined`. */
function optionalText(value, max = 255) {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function normalizeUserId(value) {
  return typeof value === 'string' ? value.replace(/^user:/, '') : ''
}

/** Les documents doivent porter eux-mêmes leur permission : la collection a
 *  `documentSecurity: true`, donc ce sont elles qui décident, pas celles de la
 *  collection. Sans ce `read("any")`, un membre créé depuis l'administration
 *  serait invisible sur la page publique. */
const publicRead = [Permission.read(Role.any())]

function memberPayload(body) {
  const name = requireText(body.name, 'name')
  const role = requireText(body.role, 'role')
  const team = requireText(body.team, 'team', 32)
  if (!TEAMS.includes(team)) throw new Error(`Équipe inconnue : « ${team} ». Attendu : ${TEAMS.join(', ')}.`)
  const accent = optionalText(body.accent, 32) || 'blue'
  if (!ACCENTS.includes(accent)) throw new Error(`Couleur inconnue : « ${accent} ». Attendu : ${ACCENTS.join(', ')}.`)

  return {
    slug: optionalText(body.slug, 64).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, ''),
    name,
    role,
    team,
    subTeam: optionalText(body.subTeam),
    badge: optionalText(body.badge, 64),
    // Le `@` n'est pas stocké : les trois clients le préfixent à l'affichage et
    // construisent l'URL `github.com/<handle>`, qui ne l'accepte pas.
    github: optionalText(body.github, 100).replace(/^@/, ''),
    email: optionalText(body.email),
    accent,
    avatarFileId: optionalText(body.avatarFileId, 36),
    displayOrder: Number.isFinite(Number(body.displayOrder)) ? Number(body.displayOrder) : 0,
  }
}

/** L'appelant est-il administrateur ? Renvoie son identifiant, ou `null`. */
async function assertAdmin(databases, actorId) {
  try {
    const profile = await databases.getDocument(DATABASE_ID, PROFILE_COLLECTION, actorId)
    if (profile.role === 'ADMIN') return actorId
  } catch {
    // Document absent de `users` : on tente `academic_directory` ci-dessous.
  }
  const directory = await databases.listDocuments(DATABASE_ID, DIRECTORY_COLLECTION, [
    Query.equal('userId', actorId),
    Query.limit(1),
  ])
  if (directory.documents[0]?.role === 'ADMIN') return actorId
  return null
}

/** Supprime un fichier du bucket des avatars sans faire échouer l'action. */
async function deletePhoto(storage, fileId, log) {
  if (!fileId) return
  try {
    await storage.deleteFile(AVATAR_BUCKET, fileId)
    log(`photo ${fileId} supprimée du bucket`)
  } catch (exception) {
    // Un fichier déjà absent, ou un bucket inaccessible : ce n'est pas une
    // raison de refuser la modification demandée. On le journalise pour que
    // l'orphelin reste traçable.
    log(`photo ${fileId} non supprimée : ${exception?.message || 'raison inconnue'}`)
  }
}

export default async ({ req, res, log, error }) => {
  const actorId = normalizeUserId(req.headers['x-appwrite-user-id'] || req.headers['x-appwrite-user'])
  if (!actorId) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  const databases = new Databases(client)
  const storage = new Storage(client)
  const body = parseBody(req)

  try {
    log(`team_roster action=${typeof body.action === 'string' ? body.action : 'unknown'}`)

    if (!['create', 'update', 'delete'].includes(body.action)) {
      return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action d’équipe inconnue.' }, 400)
    }

    const admin = await assertAdmin(databases, actorId)
    if (!admin) {
      return json(res, { ok: false, code: 'ADMIN_REQUIRED', message: 'Seul un administrateur peut modifier l’équipe.' }, 403)
    }

    if (body.action === 'create') {
      const payload = memberPayload(body)
      if (!payload.slug) throw new Error('Champ requis ou invalide : slug')
      const document = await databases.createDocument(DATABASE_ID, TEAM_COLLECTION, ID.unique(), payload, publicRead)
      return json(res, { ok: true, action: 'create', memberId: document.$id, slug: payload.slug })
    }

    const memberId = requireText(body.memberId, 'memberId', 64)
    const existing = await databases.getDocument(DATABASE_ID, TEAM_COLLECTION, memberId)

    if (body.action === 'update') {
      // Le formulaire d'administration envoie l'objet complet : on fusionne
      // avec l'existant pour qu'un champ omis conserve sa valeur au lieu d'être
      // remis à vide.
      const payload = memberPayload({ ...existing, ...body })
      if (!payload.slug) throw new Error('Champ requis ou invalide : slug')
      const document = await databases.updateDocument(DATABASE_ID, TEAM_COLLECTION, memberId, payload, publicRead)
      // L'ancienne photo ne sert plus : la laisser en place accumulerait des
      // fichiers invisibles dans le bucket à chaque changement de photo.
      if (existing.avatarFileId && existing.avatarFileId !== payload.avatarFileId) {
        await deletePhoto(storage, existing.avatarFileId, log)
      }
      return json(res, { ok: true, action: 'update', memberId: document.$id, slug: payload.slug })
    }

    await databases.deleteDocument(DATABASE_ID, TEAM_COLLECTION, memberId)
    await deletePhoto(storage, existing.avatarFileId, log)
    return json(res, { ok: true, action: 'delete', memberId })
  } catch (exception) {
    // Un slug déjà pris remonte en 409 côté Appwrite : le dire lisiblement
    // plutôt que d'afficher « document déjà existant » à l'administrateur.
    const conflict = Number(exception?.code) === 409
    error(`team_roster action=${typeof body.action === 'string' ? body.action : 'unknown'} failed=${exception?.message || 'unknown'}`)
    return json(res, {
      ok: false,
      code: conflict ? 'SLUG_TAKEN' : 'TEAM_ROSTER_ERROR',
      message: conflict
        ? 'Cette clé est déjà utilisée par un autre membre.'
        : (exception.message || 'La modification de l’équipe a échoué.'),
    }, conflict ? 409 : 400)
  }
}
