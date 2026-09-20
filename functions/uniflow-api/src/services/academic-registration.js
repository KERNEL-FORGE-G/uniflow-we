import { createHash } from 'node:crypto'
import { Client, Databases, Permission, Query, Role, Users } from 'node-appwrite'
import { DATABASE_ID, resolveCaller } from '../lib/caller.js'

/**
 * Raccordement académique d'un compte universitaire qui vient de s'inscrire :
 * entrée d'annuaire + inscription à tous les cours de sa filière et de son
 * niveau. Le périmètre (université, filière, niveau) vient du profil `users`
 * écrit à l'inscription — rien n'est figé sur ICT4D ou L1, d'autres filières
 * de l'UY1 arrivent en base par un autre script.
 *
 * Un auto-inscrit est **toujours STUDENT** : le rôle envoyé par le client, ou
 * écrit dans son propre document `users`, est ignoré. Les rôles privilégiés se
 * posent uniquement via `/admin-directory` (labels Appwrite, clé serveur).
 */
const LEVELS = ['L1', 'L2', 'L3']

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function bodyOf(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

function enrollmentId(studentId, courseId) {
  return `enr_${createHash('sha256').update(`${studentId}:${courseId}`).digest('hex').slice(0, 24)}`
}

function cleanMatricule(value) {
  return typeof value === 'string' ? value.trim().slice(0, 64) : ''
}

function learnerPermissions(userId) {
  return [
    Permission.read(Role.users()),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ]
}

function enrollmentPermissions(userId) {
  return [Permission.read(Role.users()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
}

/** Le cours appartient-il à l'université, la filière et le niveau du profil ? */
function sameAcademicScope(profile, document) {
  return document?.university === profile.university && document?.program === profile.program && document?.level === profile.level
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
  const body = bodyOf(req)

  try {
    if (body.action !== 'provision') return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de provisioning inconnue.' }, 400)

    const caller = await resolveCaller(req, users, databases)
    if (!caller) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)
    const { userId } = caller
    const profile = await databases.getDocument(DATABASE_ID, 'users', userId)
    if (profile.accountType !== 'UNIVERSITY') {
      return json(res, { ok: false, code: 'SCOPE_DENIED', message: 'Seul un compte universitaire est raccordé à une filière.' }, 403)
    }
    const scope = {
      university: typeof profile.university === 'string' ? profile.university.trim() : '',
      program: typeof profile.program === 'string' ? profile.program.trim() : '',
      level: LEVELS.includes(profile.level) ? profile.level : '',
    }
    if (!scope.university || !scope.program || !scope.level) {
      return json(res, { ok: false, code: 'SCOPE_INCOMPLETE', message: 'Le profil doit indiquer l’université, la filière et le niveau (L1 à L3).' }, 422)
    }
    // Rôle réel = labels. Un auto-inscrit n'en a aucun : STUDENT. Si le
    // document `users` prétend autre chose (client bricolé), on le remet au
    // rôle réel plutôt que de le propager dans l'annuaire.
    const role = caller.role === 'DELEGATE' ? 'DELEGATE' : 'STUDENT'
    if (!['STUDENT', 'DELEGATE'].includes(caller.role)) {
      return json(res, { ok: false, code: 'LEARNER_REQUIRED', message: 'Seul un apprenant peut être inscrit automatiquement aux cours.' }, 403)
    }
    if (profile.role !== role) await databases.updateDocument(DATABASE_ID, 'users', userId, { role })

    const existingDirectory = await databases.listDocuments(DATABASE_ID, 'academic_directory', [Query.equal('userId', userId), Query.limit(1)])
    let directoryCreated = false
    if (existingDirectory.documents[0]) {
      if (!sameAcademicScope(scope, existingDirectory.documents[0])) {
        return json(res, { ok: false, code: 'DIRECTORY_SCOPE_CONFLICT', message: 'Le profil académique existant ne correspond pas à la filière et au niveau du compte.' }, 409)
      }
    } else {
      const directory = {
        userId,
        name: typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim().slice(0, 255) : caller.name || 'Apprenant',
        role,
        university: scope.university,
        program: scope.program,
        level: scope.level,
        matricule: cleanMatricule(body.matricule),
        status: 'ACTIVE',
      }
      try {
        await databases.createDocument(DATABASE_ID, 'academic_directory', `directory_${userId}`, directory, learnerPermissions(userId))
        directoryCreated = true
      } catch (creationError) {
        if (Number(creationError?.code) !== 409) throw creationError
      }
    }

    // Index `course_program_level` ; l'université se filtre en mémoire (pas d'index).
    const courses = await databases.listDocuments(DATABASE_ID, 'academic_courses', [
      Query.equal('program', scope.program),
      Query.equal('level', scope.level),
      Query.limit(100),
    ])
    const scopedCourses = courses.documents.filter((course) => sameAcademicScope(scope, course))
    if (scopedCourses.length === 0) return json(res, { ok: false, code: 'COURSES_NOT_READY', message: `Les cours ${scope.program} / ${scope.level} ne sont pas encore disponibles.` }, 409)

    const existingEnrollments = await databases.listDocuments(DATABASE_ID, 'academic_enrollments', [Query.equal('studentId', userId), Query.limit(100)])
    const activeCourseIds = new Set(existingEnrollments.documents.filter((row) => row.status !== 'INACTIVE').map((row) => row.courseId))
    let enrollmentsCreated = 0
    for (const course of scopedCourses) {
      if (activeCourseIds.has(course.$id)) continue
      try {
        await databases.createDocument(
          DATABASE_ID,
          'academic_enrollments',
          enrollmentId(userId, course.$id),
          { studentId: userId, courseId: course.$id, status: 'ACTIVE' },
          enrollmentPermissions(userId),
        )
        enrollmentsCreated += 1
      } catch (creationError) {
        if (Number(creationError?.code) !== 409) throw creationError
      }
    }

    log(`academic_registration provision user=${userId} directoryCreated=${directoryCreated} enrollmentsCreated=${enrollmentsCreated}`)
    return json(res, { ok: true, action: 'provision', directoryCreated, enrollmentsCreated, totalCourses: scopedCourses.length })
  } catch (exception) {
    error(`academic_registration failed=${exception?.message || 'unknown'}`)
    return json(res, { ok: false, code: 'ACADEMIC_REGISTRATION_ERROR', message: 'Le raccordement académique Appwrite a échoué.' }, 500)
  }
}
