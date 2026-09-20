import { Client, Databases, ID, Permission, Query, Role, Users } from 'node-appwrite'
import { DATABASE_ID, ROLES, canAssignRole, isAdministrator, labelsForRole, resolveCaller, roleFromLabels } from '../lib/caller.js'

/**
 * Gestion des comptes universitaires par l'administration.
 *
 * Règles du propriétaire :
 * - le compte administrateur de la plateforme (label `superadmin`) crée et
 *   modifie tout rôle, dans toute université ;
 * - une administration (`role:ADMIN`) crée et modifie les enseignants,
 *   délégués et étudiants **de sa propre université** ;
 * - tout autre appelant est refusé.
 *
 * Le rôle est **posé sur les labels Appwrite** (`users.updateLabels`, clé
 * serveur) et seulement recopié dans `users.role` et `academic_directory.role`
 * pour l'affichage : ces documents appartiennent à l'utilisateur et ne valent
 * pas preuve. Rien n'est figé sur une université, une filière ou un niveau :
 * les vues d'administration filtrent par `program` + `level`, et d'autres
 * filières de l'UY1 arrivent en base par un autre script.
 */

const DIRECTORY_COLLECTION = 'academic_directory'
const PROFILE_COLLECTION = 'users'
const LEVELS = ['L1', 'L2', 'L3']
const STATUSES = ['ACTIVE', 'SUSPENDED', 'INACTIVE']

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

function optionalText(value, max = 255) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function permissions(userId) {
  return [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
}

function academicPermissions(userId) {
  return [Permission.read(Role.users()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
}

function roleOf(value) {
  return typeof value === 'string' && ROLES.includes(value.toUpperCase()) ? value.toUpperCase() : null
}

async function listOne(databases, collectionId, attribute, value) {
  const result = await databases.listDocuments(DATABASE_ID, collectionId, [Query.equal(attribute, value), Query.limit(1)])
  return result.documents[0] || null
}

/** Tous les comptes Appwrite, par pages de 100 : `users.list` refuse au-delà. */
async function listAllAccounts(users) {
  const accounts = []
  let cursor = null
  for (;;) {
    const queries = [Query.limit(100)]
    if (cursor) queries.push(Query.cursorAfter(cursor))
    const page = await users.list(queries)
    accounts.push(...page.users)
    if (page.users.length < 100) return accounts
    cursor = page.users[page.users.length - 1].$id
  }
}

/**
 * Charge utile normalisée d'un compte. L'université vient de l'appelant
 * (une administration ne crée que chez elle) sauf pour le superadmin, qui
 * peut la préciser ; filière et niveau viennent du formulaire.
 */
function accountPayload(body, caller, fallback = {}) {
  const role = roleOf(body.role ?? fallback.role ?? 'STUDENT')
  if (!role) throw new Error('Rôle universitaire invalide.')
  const name = requireText(body.name ?? fallback.name, 'name')
  const email = requireText(body.email ?? fallback.email, 'email').toLowerCase()
  if (!email.includes('@')) throw new Error('Adresse email invalide.')
  const university = caller.isSuperAdmin
    ? optionalText(body.university) || fallback.university || caller.university
    : caller.university || fallback.university || ''
  if (!university) throw new Error('Université manquante : renseignez l’université du compte.')
  const program = optionalText(body.program, 100) || fallback.program || caller.program || ''
  const rawLevel = optionalText(body.level, 8).toUpperCase() || fallback.level || ''
  const level = LEVELS.includes(rawLevel) ? rawLevel : ''
  const rawStatus = optionalText(body.status, 32).toUpperCase() || fallback.status || 'ACTIVE'
  const status = STATUSES.includes(rawStatus) ? rawStatus : 'ACTIVE'
  return {
    name,
    email,
    role,
    accountType: 'UNIVERSITY',
    university,
    program,
    level,
    matricule: optionalText(body.matricule ?? fallback.matricule, 100),
    status,
  }
}

async function ensureNoAcademicReferences(databases, userId, role) {
  const checks = []
  if (role === 'STUDENT' || role === 'DELEGATE') {
    checks.push(['academic_enrollments', 'studentId'], ['attendance_records', 'studentId'])
  }
  if (role === 'TEACHER') {
    checks.push(['academic_courses', 'teacherId'], ['attendance_sessions', 'createdBy'])
  }
  for (const [collectionId, attribute] of checks) {
    const rows = await databases.listDocuments(DATABASE_ID, collectionId, [Query.equal(attribute, userId), Query.limit(1)])
    if (rows.total > 0) return { collectionId, attribute }
  }
  return null
}

/** Inscrit un apprenant à tous les cours de sa filière et de son niveau. */
async function enrollLearner(databases, userId, payload) {
  if (!payload.program || !payload.level) return 0
  // Index `course_program_level` ; l'université se filtre en mémoire (pas d'index).
  const courses = await databases.listDocuments(DATABASE_ID, 'academic_courses', [
    Query.equal('program', payload.program),
    Query.equal('level', payload.level),
    Query.limit(100),
  ])
  const scoped = courses.documents.filter((course) => course.university === payload.university)
  await Promise.all(scoped.map((course) => databases.createDocument(
    DATABASE_ID,
    'academic_enrollments',
    ID.unique(),
    { studentId: userId, courseId: course.$id, status: 'ACTIVE' },
    academicPermissions(userId),
  )))
  return scoped.length
}

export default async ({ req, res, log, error }) => {
  // Clé dynamique d'Appwrite ≥ 1.6 : elle arrive dans l'en-tête `x-appwrite-key`,
  // limitée aux `scopes` déclarés sur la Function. Aucune clé serveur n'a donc à
  // être stockée en variable ; celle-ci reste lue en premier si elle existe.
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.headers['x-appwrite-key'] || '')
  const databases = new Databases(client)
  const users = new Users(client)
  const body = parseBody(req)

  try {
    const caller = await resolveCaller(req, users, databases)
    if (!caller) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)
    log(`admin_directory action=${typeof body.action === 'string' ? body.action : 'unknown'} caller=${caller.userId} role=${caller.role}${caller.isSuperAdmin ? ' superadmin' : ''}`)

    if (!isAdministrator(caller)) {
      return json(res, { ok: false, code: 'ADMIN_REQUIRED', message: 'Seule l’administration de l’université peut gérer les comptes.' }, 403)
    }
    const inCallerScope = (document) => caller.isSuperAdmin || !caller.university || document?.university === caller.university

    if (body.action === 'list') {
      const [directoryResult, profileResult, accounts] = await Promise.all([
        databases.listDocuments(DATABASE_ID, DIRECTORY_COLLECTION, [Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, PROFILE_COLLECTION, [Query.limit(500)]),
        listAllAccounts(users),
      ])
      const profileById = new Map(profileResult.documents.map((profile) => [profile.$id, profile]))
      const accountById = new Map(accounts.map((account) => [account.$id, account]))
      const program = optionalText(body.program, 100)
      const level = optionalText(body.level, 8).toUpperCase()
      const entries = directoryResult.documents
        .filter(inCallerScope)
        .filter((entry) => !program || entry.program === program)
        .filter((entry) => !level || entry.level === level)
        .map((entry) => {
          const profile = profileById.get(entry.userId)
          const account = accountById.get(entry.userId)
          return {
            userId: entry.userId,
            name: entry.name,
            // Le rôle affiché est celui des labels : l'annuaire n'est qu'un miroir.
            role: account ? roleFromLabels(account.labels) : roleOf(entry.role) || 'STUDENT',
            isSuperAdmin: Boolean(account?.labels?.includes('superadmin')),
            matricule: entry.matricule || '',
            status: entry.status || 'ACTIVE',
            email: typeof account?.email === 'string' ? account.email : typeof profile?.email === 'string' ? profile.email : '',
            university: entry.university || '',
            program: entry.program || '',
            level: entry.level || '',
          }
        })
      return json(res, { ok: true, action: 'list', entries, caller: { role: caller.role, isSuperAdmin: caller.isSuperAdmin, university: caller.university } })
    }

    if (body.action === 'create') {
      const payload = accountPayload(body, caller)
      const allowed = canAssignRole(caller, payload.role, payload.university)
      if (!allowed.ok) return json(res, { ok: false, code: allowed.code, message: allowed.message }, 403)
      const password = requireText(body.password, 'password', 128)
      if (password.length < 8) throw new Error('Le mot de passe initial doit contenir au moins 8 caractères.')
      const account = await users.create(ID.unique(), payload.email, undefined, password, payload.name)
      const profilePayload = { email: payload.email, name: payload.name, accountType: payload.accountType, role: payload.role, university: payload.university, program: payload.program, level: payload.level || null, country: 'Cameroun' }
      const directoryPayload = { userId: account.$id, name: payload.name, role: payload.role, university: payload.university, program: payload.program, level: payload.level || null, matricule: payload.matricule, status: payload.status }
      try {
        await users.updateLabels(account.$id, labelsForRole([], payload.role))
        await databases.createDocument(DATABASE_ID, PROFILE_COLLECTION, account.$id, profilePayload, permissions(account.$id))
        const directory = await databases.createDocument(DATABASE_ID, DIRECTORY_COLLECTION, `directory_${account.$id}`, directoryPayload, [Permission.read(Role.users()), ...permissions(account.$id).slice(1)])
        let enrollments = 0
        if (payload.role === 'STUDENT' || payload.role === 'DELEGATE') enrollments = await enrollLearner(databases, account.$id, payload)
        return json(res, { ok: true, action: 'create', userId: account.$id, directoryId: directory.$id, email: payload.email, name: payload.name, role: payload.role, enrollments })
      } catch (creationError) {
        try { await users.delete(account.$id) } catch { /* best effort rollback */ }
        throw creationError
      }
    }

    const targetId = requireText(body.userId, 'userId', 64)
    if (targetId === caller.userId && body.action === 'delete') return json(res, { ok: false, code: 'SELF_DELETE_DENIED', message: 'Un administrateur ne peut pas supprimer son propre compte.' }, 409)
    const directory = await listOne(databases, DIRECTORY_COLLECTION, 'userId', targetId)
    if (!directory) return json(res, { ok: false, code: 'DIRECTORY_NOT_FOUND', message: 'Profil académique introuvable.' }, 404)
    const targetAccount = await users.get(targetId)
    const targetRole = roleFromLabels(targetAccount.labels)
    if (targetAccount.labels?.includes('superadmin') && !caller.isSuperAdmin) {
      return json(res, { ok: false, code: 'SUPERADMIN_REQUIRED', message: 'Le compte administrateur de la plateforme ne se modifie pas depuis une administration.' }, 403)
    }
    if (!inCallerScope(directory)) return json(res, { ok: false, code: 'UNIVERSITY_SCOPE_DENIED', message: 'Une administration ne gère que les comptes de sa propre université.' }, 403)

    if (body.action === 'update') {
      const next = accountPayload(body, caller, { ...directory, email: targetAccount.email, role: targetRole })
      const allowed = canAssignRole(caller, next.role, next.university, targetRole)
      if (!allowed.ok) return json(res, { ok: false, code: allowed.code, message: allowed.message }, 403)
      await users.updateName(targetId, next.name)
      if (next.email !== targetAccount.email) await users.updateEmail(targetId, next.email)
      if (next.role !== targetRole) await users.updateLabels(targetId, labelsForRole(targetAccount.labels, next.role))
      const mirror = { email: next.email, name: next.name, accountType: next.accountType, role: next.role, university: next.university, program: next.program, level: next.level || null, country: 'Cameroun' }
      let profileId = targetId
      try {
        profileId = (await databases.updateDocument(DATABASE_ID, PROFILE_COLLECTION, targetId, mirror)).$id
      } catch (updateError) {
        // Compte créé sans document `users` (ancien seed) : on le crée au lieu d'échouer.
        if (Number(updateError?.code) !== 404) throw updateError
        profileId = (await databases.createDocument(DATABASE_ID, PROFILE_COLLECTION, targetId, mirror, permissions(targetId))).$id
      }
      const updatedDirectory = await databases.updateDocument(DATABASE_ID, DIRECTORY_COLLECTION, directory.$id, { name: next.name, role: next.role, matricule: next.matricule, status: next.status, university: next.university, program: next.program, level: next.level || null })
      await users.updateStatus(targetId, next.status === 'ACTIVE')
      return json(res, { ok: true, action: 'update', userId: targetId, profileId, directoryId: updatedDirectory.$id, name: next.name, email: next.email, role: next.role, status: next.status })
    }

    if (body.action === 'delete') {
      const allowed = canAssignRole(caller, targetRole, directory.university, targetRole)
      if (!allowed.ok) return json(res, { ok: false, code: allowed.code, message: allowed.message }, 403)
      const reference = await ensureNoAcademicReferences(databases, targetId, targetRole)
      if (reference) return json(res, { ok: false, code: 'ACCOUNT_HAS_ACADEMIC_DATA', message: 'Compte conservé pour protéger les historiques académiques. Désactivez-le avec le statut SUSPENDED.', collection: reference.collectionId }, 409)
      await databases.deleteDocument(DATABASE_ID, DIRECTORY_COLLECTION, directory.$id)
      try { await databases.deleteDocument(DATABASE_ID, PROFILE_COLLECTION, targetId) } catch (deleteError) { if (Number(deleteError?.code) !== 404) throw deleteError }
      await users.delete(targetId)
      return json(res, { ok: true, action: 'delete', userId: targetId })
    }

    return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de gestion inconnue.' }, 400)
  } catch (exception) {
    error(`admin_directory action=${typeof body.action === 'string' ? body.action : 'unknown'} failed=${exception?.message || 'unknown'}`)
    return json(res, { ok: false, code: 'ADMIN_DIRECTORY_ERROR', message: exception.message || 'La gestion du compte a échoué.' }, 400)
  }
}
