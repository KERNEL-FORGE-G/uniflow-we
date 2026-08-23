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

function sameAcademicScope(document) {
  return document?.university === UNIVERSITY && document?.program === PROGRAM && document?.level === LEVEL
}

function gradeId(studentId, courseId, title) {
  return `grd_${createHash('sha256').update(`${studentId}:${courseId}:${title.toLowerCase()}`).digest('hex').slice(0, 24)}`
}

function text(value, field, length = 255) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > length) throw new Error(`Champ invalide : ${field}`)
  return value.trim()
}

function integer(value, field, min, max) {
  const numeric = Number(value)
  if (!Number.isInteger(numeric) || numeric < min || numeric > max) throw new Error(`Valeur invalide : ${field}`)
  return numeric
}

async function one(databases, collection, attribute, value) {
  const rows = await databases.listDocuments(DATABASE_ID, collection, [Query.equal(attribute, value), Query.limit(1)])
  return rows.documents[0] || null
}

async function assertTeacherCourse(databases, actorId, courseId) {
  const actor = await one(databases, 'academic_directory', 'userId', actorId)
  if (!actor || !sameAcademicScope(actor) || !['TEACHER', 'ADMIN'].includes(actor.role)) throw new Error('ROLE_DENIED')
  const course = await databases.getDocument(DATABASE_ID, 'academic_courses', courseId)
  if (!sameAcademicScope(course)) throw new Error('COURSE_SCOPE_DENIED')
  if (actor.role === 'TEACHER' && course.teacherId !== actorId) throw new Error('COURSE_ASSIGNMENT_DENIED')
  return { actor, course }
}

function gradePermissions(studentId, teacherId) {
  return [
    Permission.read(Role.user(studentId)),
    Permission.read(Role.user(teacherId)),
    Permission.update(Role.user(teacherId)),
    Permission.delete(Role.user(teacherId)),
  ]
}

export default async ({ req, res, log, error }) => {
  const actorId = actorIdOf(req)
  if (!actorId) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  const databases = new Databases(client)
  const body = bodyOf(req)

  try {
    const courseId = text(body.courseId, 'courseId', 64)
    const { course } = await assertTeacherCourse(databases, actorId, courseId)

    if (body.action === 'roster') {
      const [enrollments, directory, grades] = await Promise.all([
        databases.listDocuments(DATABASE_ID, 'academic_enrollments', [Query.equal('courseId', courseId), Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, 'academic_directory', [Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, 'academic_grades', [Query.equal('courseId', courseId), Query.limit(200)]),
      ])
      const directoryByUser = new Map(directory.documents.map((entry) => [entry.userId, entry]))
      const students = enrollments.documents
        .filter((enrollment) => enrollment.status !== 'INACTIVE')
        .map((enrollment) => directoryByUser.get(enrollment.studentId))
        .filter((entry) => entry && ['STUDENT', 'DELEGATE'].includes(entry.role) && sameAcademicScope(entry))
        .map((entry) => ({ userId: entry.userId, name: entry.name, matricule: entry.matricule || '', role: entry.role }))
      const validStudentIds = new Set(students.map((student) => student.userId))
      const entries = grades.documents
        .filter((grade) => validStudentIds.has(grade.studentId))
        .map((grade) => ({ id: grade.$id, studentId: grade.studentId, courseId: grade.courseId, courseCode: grade.courseCode, evaluationTitle: grade.evaluationTitle, type: grade.type || 'CC', score: Number(grade.score), maxScore: Number(grade.maxScore || 20), coefficient: Number(grade.coefficient || 1) }))
      return json(res, { ok: true, action: 'roster', course: { id: course.$id, code: course.code, name: course.name }, students, grades: entries })
    }

    const studentId = text(body.studentId, 'studentId', 64)
    const enrollment = await one(databases, 'academic_enrollments', 'studentId', studentId)
    const courseEnrollment = enrollment && enrollment.courseId === courseId && enrollment.status !== 'INACTIVE'
      ? enrollment
      : (await databases.listDocuments(DATABASE_ID, 'academic_enrollments', [Query.equal('studentId', studentId), Query.equal('courseId', courseId), Query.limit(1)])).documents[0]
    if (!courseEnrollment || courseEnrollment.status === 'INACTIVE') return json(res, { ok: false, code: 'ENROLLMENT_REQUIRED', message: 'Cet apprenant n’est pas inscrit à ce cours.' }, 403)

    if (body.action === 'delete') {
      const gradeIdValue = text(body.gradeId, 'gradeId', 64)
      const grade = await databases.getDocument(DATABASE_ID, 'academic_grades', gradeIdValue)
      if (grade.courseId !== courseId || grade.studentId !== studentId) return json(res, { ok: false, code: 'GRADE_SCOPE_DENIED', message: 'Cette évaluation ne correspond pas au cours ou à l’apprenant sélectionné.' }, 403)
      await databases.deleteDocument(DATABASE_ID, 'academic_grades', gradeIdValue)
      return json(res, { ok: true, action: 'delete', gradeId: gradeIdValue })
    }

    if (body.action !== 'upsert') return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de note inconnue.' }, 400)
    const evaluationTitle = text(body.evaluationTitle, 'evaluationTitle')
    const type = text(typeof body.type === 'string' ? body.type : 'CC', 'type', 64).toUpperCase()
    const maxScore = integer(body.maxScore ?? 20, 'maxScore', 1, 1000)
    const score = integer(body.score, 'score', 0, maxScore)
    const coefficient = integer(body.coefficient ?? 1, 'coefficient', 1, 100)
    const existing = await databases.listDocuments(DATABASE_ID, 'academic_grades', [Query.equal('studentId', studentId), Query.equal('courseId', courseId), Query.limit(100)])
    const matched = existing.documents.find((grade) => String(grade.evaluationTitle).trim().toLowerCase() === evaluationTitle.toLowerCase())
    const payload = { studentId, courseId, courseCode: course.code, evaluationTitle, type, score, maxScore, coefficient }
    let grade
    if (matched) {
      grade = await databases.updateDocument(DATABASE_ID, 'academic_grades', matched.$id, payload)
    } else {
      try {
        grade = await databases.createDocument(DATABASE_ID, 'academic_grades', gradeId(studentId, courseId, evaluationTitle), payload, gradePermissions(studentId, actorId))
      } catch (creationError) {
        if (Number(creationError?.code) !== 409) throw creationError
        const concurrent = await databases.getDocument(DATABASE_ID, 'academic_grades', gradeId(studentId, courseId, evaluationTitle))
        grade = await databases.updateDocument(DATABASE_ID, 'academic_grades', concurrent.$id, payload)
      }
    }
    log(`academic_grades upsert actor=${actorId} student=${studentId} course=${courseId}`)
    return json(res, { ok: true, action: 'upsert', grade: { id: grade.$id, ...payload } })
  } catch (exception) {
    const message = String(exception?.message || '')
    if (['ROLE_DENIED', 'COURSE_SCOPE_DENIED', 'COURSE_ASSIGNMENT_DENIED'].includes(message)) return json(res, { ok: false, code: message, message: 'Vous n’êtes pas autorisé à gérer les notes de ce cours.' }, 403)
    error(`academic_grades action=${body.action || 'unknown'} failed=${message || 'unknown'}`)
    return json(res, { ok: false, code: 'ACADEMIC_GRADES_ERROR', message: 'La saisie de notes Appwrite a échoué.' }, 400)
  }
}
