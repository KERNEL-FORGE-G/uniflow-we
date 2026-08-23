import { Account, Client, Databases, ID, Permission, Query, Role, Users } from 'node-appwrite'

const DATABASE_ID = 'uniflow'
const DIRECTORY_COLLECTION = 'academic_directory'
const PROFILE_COLLECTION = 'users'
const UNIVERSITY = 'Université de Yaoundé I'
const PROGRAM = 'ICT4D'
const LEVEL = 'L1'

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

function normalizeUserId(value) {
  return typeof value === 'string' ? value.replace(/^user:/, '') : ''
}

function permissions(userId) {
  return [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
}

function roleOf(value) {
  return ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN'].includes(value) ? value : null
}

async function listOne(databases, collectionId, attribute, value) {
  const result = await databases.listDocuments(DATABASE_ID, collectionId, [Query.equal(attribute, value), Query.limit(1)])
  return result.documents[0] || null
}

function accountPayload(body, accountType = 'UNIVERSITY') {
  const role = roleOf(body.role)
  if (!role) throw new Error('Rôle universitaire invalide.')
  const name = requireText(body.name, 'name')
  const email = requireText(body.email, 'email').toLowerCase()
  if (!email.includes('@')) throw new Error('Adresse email invalide.')
  const matricule = typeof body.matricule === 'string' ? body.matricule.trim().slice(0, 100) : ''
  const status = typeof body.status === 'string' && body.status.trim() ? body.status.trim().toUpperCase() : 'ACTIVE'
  return {
    name,
    email,
    role,
    accountType,
    university: UNIVERSITY,
    program: PROGRAM,
    level: LEVEL,
    matricule,
    status,
  }
}

async function assertAdmin(databases, actorId) {
  const profile = await listOne(databases, DIRECTORY_COLLECTION, 'userId', actorId)
  if (!profile || profile.role !== 'ADMIN' || profile.university !== UNIVERSITY || profile.program !== PROGRAM || profile.level !== LEVEL) {
    return null
  }
  return profile
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

export default async ({ req, res, log, error }) => {
  const actorId = normalizeUserId(req.headers['x-appwrite-user-id'] || req.headers['x-appwrite-user'])
  if (!actorId) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  const databases = new Databases(client)
  const users = new Users(client)
  const body = parseBody(req)

  try {
    log(`admin_directory action=${typeof body.action === 'string' ? body.action : 'unknown'}`)
    if (body.action === 'list') {
      const [directoryResult, profileResult] = await Promise.all([
        databases.listDocuments(DATABASE_ID, DIRECTORY_COLLECTION, [Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, PROFILE_COLLECTION, [Query.limit(200)]),
      ])
      const directoryEntries = directoryResult.documents.filter((entry) => entry.university === UNIVERSITY && entry.program === PROGRAM && entry.level === LEVEL)
      const admin = directoryEntries.find((entry) => entry.userId === actorId && entry.role === 'ADMIN')
      if (!admin) return json(res, { ok: false, code: 'ADMIN_REQUIRED', message: 'Seul un administrateur UY1/ICT4D/L1 peut consulter les contacts.' }, 403)
      const profileById = new Map(profileResult.documents.map((profile) => [profile.$id, profile]))
      const entries = directoryEntries
        .filter((entry) => roleOf(entry.role))
        .map((entry) => {
          const profile = profileById.get(entry.userId)
          return {
            userId: entry.userId,
            name: entry.name,
            role: entry.role,
            matricule: entry.matricule || '',
            status: entry.status || 'ACTIVE',
            email: typeof profile?.email === 'string' ? profile.email : '',
          }
        })
      return json(res, { ok: true, action: 'list', entries })
    }

    const admin = await assertAdmin(databases, actorId)
    if (!admin) return json(res, { ok: false, code: 'ADMIN_REQUIRED', message: 'Seul un administrateur UY1/ICT4D/L1 peut gérer les comptes.' }, 403)

    if (body.action === 'create') {
      const payload = accountPayload(body)
      const password = requireText(body.password, 'password', 128)
      if (password.length < 8) throw new Error('Le mot de passe initial doit contenir au moins 8 caractères.')
      const account = await users.create(ID.unique(), payload.email, undefined, password, payload.name)
      const profilePayload = { email: payload.email, name: payload.name, accountType: payload.accountType, role: payload.role, university: UNIVERSITY, program: PROGRAM, level: LEVEL, country: 'Cameroun' }
      const directoryPayload = { userId: account.$id, name: payload.name, role: payload.role, university: UNIVERSITY, program: PROGRAM, level: LEVEL, matricule: payload.matricule, status: payload.status }
      try {
        await databases.createDocument(DATABASE_ID, PROFILE_COLLECTION, account.$id, profilePayload, permissions(account.$id))
        const directory = await databases.createDocument(DATABASE_ID, DIRECTORY_COLLECTION, `directory_${account.$id}`, directoryPayload, [Permission.read(Role.users()), ...permissions(account.$id).slice(1)])
        return json(res, { ok: true, action: 'create', userId: account.$id, directoryId: directory.$id, email: payload.email, name: payload.name, role: payload.role })
      } catch (creationError) {
        try { await users.delete(account.$id) } catch { /* best effort rollback */ }
        throw creationError
      }
    }

    const targetId = requireText(body.userId, 'userId', 64)
    if (targetId === actorId && body.action === 'delete') return json(res, { ok: false, code: 'SELF_DELETE_DENIED', message: 'Un administrateur ne peut pas supprimer son propre compte.' }, 409)
    const directory = await listOne(databases, DIRECTORY_COLLECTION, 'userId', targetId)
    if (!directory) return json(res, { ok: false, code: 'DIRECTORY_NOT_FOUND', message: 'Profil académique introuvable.' }, 404)
    if (directory.university !== UNIVERSITY || directory.program !== PROGRAM || directory.level !== LEVEL) return json(res, { ok: false, code: 'SCOPE_DENIED', message: 'Le compte ciblé est hors du périmètre UY1/ICT4D/L1.' }, 403)

    if (body.action === 'update') {
      const targetAccount = await users.get(targetId)
      const next = accountPayload({ ...directory, ...body, name: body.name ?? directory.name, email: body.email ?? targetAccount.email, role: body.role ?? directory.role, matricule: body.matricule ?? directory.matricule, status: body.status ?? directory.status })
      await users.updateName(targetId, next.name)
      if (next.email !== targetAccount.email) await users.updateEmail(targetId, next.email)
      const profile = await databases.updateDocument(DATABASE_ID, PROFILE_COLLECTION, targetId, { email: next.email, name: next.name, accountType: next.accountType, role: next.role, university: UNIVERSITY, program: PROGRAM, level: LEVEL, country: 'Cameroun' })
      const updatedDirectory = await databases.updateDocument(DATABASE_ID, DIRECTORY_COLLECTION, directory.$id, { name: next.name, role: next.role, matricule: next.matricule, status: next.status, university: UNIVERSITY, program: PROGRAM, level: LEVEL })
      if (next.status === 'SUSPENDED' || next.status === 'INACTIVE') await users.updateStatus(targetId, false)
      else await users.updateStatus(targetId, true)
      return json(res, { ok: true, action: 'update', userId: targetId, profileId: profile.$id, directoryId: updatedDirectory.$id, name: next.name, email: next.email, role: next.role, status: next.status })
    }

    if (body.action === 'delete') {
      const reference = await ensureNoAcademicReferences(databases, targetId, directory.role)
      if (reference) return json(res, { ok: false, code: 'ACCOUNT_HAS_ACADEMIC_DATA', message: 'Compte conservé pour protéger les historiques académiques. Désactivez-le avec le statut SUSPENDED.', collection: reference.collectionId }, 409)
      await databases.deleteDocument(DATABASE_ID, DIRECTORY_COLLECTION, directory.$id)
      await databases.deleteDocument(DATABASE_ID, PROFILE_COLLECTION, targetId)
      await users.delete(targetId)
      return json(res, { ok: true, action: 'delete', userId: targetId })
    }

    return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de gestion inconnue.' }, 400)
  } catch (exception) {
    error(`admin_directory action=${typeof body.action === 'string' ? body.action : 'unknown'} failed=${exception?.message || 'unknown'}`)
    return json(res, { ok: false, code: 'ADMIN_DIRECTORY_ERROR', message: exception.message || 'La gestion du compte a échoué.' }, 400)
  }
}
