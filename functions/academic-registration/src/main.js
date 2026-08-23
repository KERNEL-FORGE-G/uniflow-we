import { createHash } from 'node:crypto'
import { Client, Databases, ID, Permission, Query, Role } from 'node-appwrite'

const DATABASE_ID = 'uniflow'
const UNIVERSITY = 'Université de Yaoundé I'
const PROGRAM = 'ICT4D'
const LEVEL = 'L1'

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function bodyOf(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

function actorIdOf(req) {
  const raw = req.headers['x-appwrite-user-id'] || req.headers['x-appwrite-user']
  return typeof raw === 'string' ? raw.replace(/^user:/, '') : ''
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

function sameAcademicScope(document) {
  return document?.university === UNIVERSITY && document?.program === PROGRAM && document?.level === LEVEL
}

export default async ({ req, res, log, error }) => {
  const userId = actorIdOf(req)
  if (!userId) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  const databases = new Databases(client)
  const body = bodyOf(req)

  try {
    if (body.action !== 'provision') return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de provisioning inconnue.' }, 400)

    const profile = await databases.getDocument(DATABASE_ID, 'users', userId)
    if (profile.accountType !== 'UNIVERSITY' || !sameAcademicScope(profile)) {
      return json(res, { ok: false, code: 'SCOPE_DENIED', message: 'Cette inscription ne correspond pas au parcours UY1 / ICT4D / L1.' }, 403)
    }
    if (!['STUDENT', 'DELEGATE'].includes(profile.role)) {
      return json(res, { ok: false, code: 'LEARNER_REQUIRED', message: 'Seul un apprenant peut être inscrit automatiquement aux cours.' }, 403)
    }

    const existingDirectory = await databases.listDocuments(DATABASE_ID, 'academic_directory', [Query.equal('userId', userId), Query.limit(1)])
    let directoryCreated = false
    if (existingDirectory.documents[0]) {
      if (!sameAcademicScope(existingDirectory.documents[0])) {
        return json(res, { ok: false, code: 'DIRECTORY_SCOPE_CONFLICT', message: 'Le profil académique existant est hors du parcours autorisé.' }, 409)
      }
    } else {
      const directory = {
        userId,
        name: typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim().slice(0, 255) : 'Apprenant ICT4D',
        role: profile.role,
        university: UNIVERSITY,
        program: PROGRAM,
        level: LEVEL,
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

    const courses = await databases.listDocuments(DATABASE_ID, 'academic_courses', [Query.limit(100)])
    const scopedCourses = courses.documents.filter(sameAcademicScope)
    if (scopedCourses.length === 0) return json(res, { ok: false, code: 'COURSES_NOT_READY', message: 'Les cours ICT4D / L1 ne sont pas encore disponibles.' }, 409)

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
