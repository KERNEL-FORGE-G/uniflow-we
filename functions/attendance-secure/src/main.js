import { Client, Databases, ID, Permission, Query, Role } from 'node-appwrite'
import { createHash, randomUUID } from 'node:crypto'

const DATABASE_ID = 'uniflow'
const TOKEN_LIFETIME_MS = 15 * 60 * 1000
const MAX_LOCATION_ACCURACY_METERS = 100

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

function requireValue(value, key) {
  if (!value || typeof value !== 'string') throw new Error(`Champ requis : ${key}`)
  return value
}

function distanceMeters(first, second) {
  const radians = (value) => (value * Math.PI) / 180
  const earthRadius = 6371000
  const dLatitude = radians(second.latitude - first.latitude)
  const dLongitude = radians(second.longitude - first.longitude)
  const a = Math.sin(dLatitude / 2) ** 2 + Math.cos(radians(first.latitude)) * Math.cos(radians(second.latitude)) * Math.sin(dLongitude / 2) ** 2
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function positionFrom(payload) {
  const latitude = Number(payload?.latitude)
  const longitude = Number(payload?.longitude)
  const accuracy = Number(payload?.accuracy)
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('Position géographique invalide.')
  if (!Number.isFinite(accuracy) || accuracy <= 0 || accuracy > MAX_LOCATION_ACCURACY_METERS) throw new Error('Précision de localisation insuffisante.')
  return { latitude, longitude, accuracy }
}

function tokenValue() {
  return `${Date.now().toString(36)}-${randomUUID().replaceAll('-', '')}`
}

function deterministicId(prefix, value) {
  return `${prefix}_${createHash('sha256').update(value).digest('hex').slice(0, 24)}`
}

function duplicateCount(documents, keyOf) {
  const seen = new Set()
  let duplicates = 0
  for (const document of documents) {
    const key = keyOf(document)
    if (seen.has(key)) duplicates += 1
    else seen.add(key)
  }
  return duplicates
}

export default async ({ req, res, log, error }) => {
  const rawUserId = req.headers['x-appwrite-user-id'] || req.headers['x-appwrite-user']
  const userId = typeof rawUserId === 'string' ? rawUserId.replace(/^user:/, '') : ''
  if (!userId) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  const databases = new Databases(client)
  const body = parseBody(req)

  try {
    const directory = await databases.listDocuments(DATABASE_ID, 'academic_directory', [Query.equal('userId', userId), Query.limit(1)])
    const profile = directory.documents[0]
    if (!profile) return json(res, { ok: false, code: 'PROFILE_REQUIRED', message: 'Profil académique introuvable.' }, 403)

    if (body.action === 'audit') {
      if (profile.role !== 'ADMIN') return json(res, { ok: false, code: 'AUDIT_ROLE_DENIED', message: 'Seul un administrateur peut lancer un audit d’intégrité.' }, 403)
      const [courses, enrollments, schedules, sessions, records, tokens, locations] = await Promise.all([
        databases.listDocuments(DATABASE_ID, 'academic_courses', [Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, 'academic_enrollments', [Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, 'academic_schedules', [Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, 'attendance_sessions', [Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, 'attendance_records', [Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, 'attendance_qr_tokens', [Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, 'attendance_session_locations', [Query.limit(200)]),
      ])
      const courseIds = new Set(courses.documents.map((document) => document.$id))
      const sessionById = new Map(sessions.documents.map((document) => [document.$id, document]))
      const enrollmentKeys = new Set(enrollments.documents.map((document) => `${document.studentId}:${document.courseId}`))
      const report = {
        checkedAt: new Date().toISOString(),
        collections: { courses: courses.total, enrollments: enrollments.total, schedules: schedules.total, sessions: sessions.total, records: records.total, tokens: tokens.total, locations: locations.total },
        duplicates: {
          enrollments: duplicateCount(enrollments.documents, (document) => `${document.studentId}:${document.courseId}`),
          sessions: duplicateCount(sessions.documents, (document) => `${document.courseId}:${String(document.date).slice(0, 10)}`),
          records: duplicateCount(records.documents, (document) => `${document.sessionId}:${document.studentId}`),
          tokens: duplicateCount(tokens.documents, (document) => document.token),
          locations: duplicateCount(locations.documents, (document) => document.sessionId),
        },
        orphaned: {
          enrollments: enrollments.documents.filter((document) => !courseIds.has(document.courseId)).length,
          schedules: schedules.documents.filter((document) => !courseIds.has(document.courseId)).length,
          sessions: sessions.documents.filter((document) => !courseIds.has(document.courseId)).length,
          records: records.documents.filter((document) => !sessionById.has(document.sessionId) || !courseIds.has(document.courseId)).length,
          tokens: tokens.documents.filter((document) => !sessionById.has(document.sessionId) || !courseIds.has(document.courseId)).length,
          locations: locations.documents.filter((document) => !sessionById.has(document.sessionId)).length,
        },
        invalidRecords: records.documents.filter((document) => !enrollmentKeys.has(`${document.studentId}:${document.courseId}`)).length,
      }
      const issueCount = Object.values(report.duplicates).reduce((sum, value) => sum + value, 0) + Object.values(report.orphaned).reduce((sum, value) => sum + value, 0) + report.invalidRecords
      return json(res, { ok: true, ...report, healthy: issueCount === 0 })
    }

    if (body.action === 'roll') {
      if (!['DELEGATE', 'TEACHER', 'ADMIN'].includes(profile.role)) return json(res, { ok: false, code: 'ROLE_DENIED', message: 'Seul un délégué, enseignant ou administrateur peut enregistrer un appel.' }, 403)
      const courseId = requireValue(body.courseId, 'courseId')
      const date = requireValue(body.date, 'date')
      const dateKey = new Date(date).toISOString().slice(0, 10)
      if (Number.isNaN(new Date(date).getTime())) return json(res, { ok: false, code: 'DATE_INVALID', message: 'Date de séance invalide.' }, 400)
      const [courses, enrollments, sessions] = await Promise.all([
        databases.listDocuments(DATABASE_ID, 'academic_courses', [Query.equal('$id', courseId), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, 'academic_enrollments', [Query.equal('courseId', courseId), Query.limit(200)]),
        databases.listDocuments(DATABASE_ID, 'attendance_sessions', [Query.equal('courseId', courseId), Query.limit(200)]),
      ])
      const course = courses.documents[0]
      if (!course || course.university !== 'Université de Yaoundé I' || course.program !== 'ICT4D' || course.level !== 'L1') return json(res, { ok: false, code: 'COURSE_INVALID', message: 'Cours académique invalide.' }, 404)
      if (profile.role === 'TEACHER' && course.teacherId !== userId) return json(res, { ok: false, code: 'COURSE_ASSIGNMENT_DENIED', message: 'Cet enseignant n’est pas affecté à ce cours.' }, 403)
      const rows = Array.isArray(body.rows) ? body.rows : []
      if (rows.some((row) => !row || typeof row.studentId !== 'string' || !['PRESENT', 'ABSENT', 'RETARD', 'JUSTIFIE'].includes(row.status))) return json(res, { ok: false, code: 'ROLL_INVALID', message: 'La liste d’appel contient un statut ou un apprenant invalide.' }, 400)
      const studentIds = [...new Set(rows.map((row) => row.studentId))]
      if (studentIds.length !== rows.length) return json(res, { ok: false, code: 'ROLL_DUPLICATE', message: 'Un apprenant ne peut apparaître qu’une seule fois dans le même appel.' }, 400)
      const activeStudentIds = new Set(enrollments.documents.filter((entry) => entry.status !== 'INACTIVE').map((entry) => entry.studentId))
      if (studentIds.some((studentId) => !activeStudentIds.has(studentId))) return json(res, { ok: false, code: 'ENROLLMENT_REQUIRED', message: 'La liste d’appel contient un apprenant qui n’est pas inscrit à ce cours.' }, 403)
      let session = sessions.documents.find((entry) => String(entry.date).slice(0, 10) === dateKey)
      if (!session) {
        const sessionId = deterministicId('ses', `${courseId}:${dateKey}`)
        try {
          session = await databases.createDocument(DATABASE_ID, 'attendance_sessions', sessionId, { courseId, date: new Date(date).toISOString(), createdBy: userId }, [Permission.read(Role.users()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))])
        } catch (creationError) {
          if (Number(creationError?.code) !== 409) throw creationError
          session = await databases.getDocument(DATABASE_ID, 'attendance_sessions', sessionId)
        }
      }
      const records = await databases.listDocuments(DATABASE_ID, 'attendance_records', [Query.equal('sessionId', session.$id), Query.limit(200)])
      const byStudentId = new Map(records.documents.map((record) => [record.studentId, record]))
      const writeResults = await Promise.all(rows.map(async (row) => {
        const existing = byStudentId.get(row.studentId)
        if (existing?.status === row.status) return { created: 0, updated: 0 }
        if (existing) {
          await databases.updateDocument(DATABASE_ID, 'attendance_records', existing.$id, { status: row.status, verificationMethod: 'MANUAL', proximityStatus: 'NOT_REQUIRED', verifiedAt: new Date().toISOString() })
          return { created: 0, updated: 1 }
        }
        const recordId = deterministicId('att', `${session.$id}:${row.studentId}`)
        try {
          await databases.createDocument(DATABASE_ID, 'attendance_records', recordId, { sessionId: session.$id, courseId, studentId: row.studentId, status: row.status, verificationMethod: 'MANUAL', proximityStatus: 'NOT_REQUIRED', proximityDistanceMeters: -1, locationAccuracyMeters: -1, verifiedAt: new Date().toISOString() }, [Permission.read(Role.users()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))])
          return { created: 1, updated: 0 }
        } catch (creationError) {
          if (Number(creationError?.code) !== 409) throw creationError
          await databases.updateDocument(DATABASE_ID, 'attendance_records', recordId, { status: row.status, verificationMethod: 'MANUAL', proximityStatus: 'NOT_REQUIRED', verifiedAt: new Date().toISOString() })
          return { created: 0, updated: 1 }
        }
      }))
      const created = writeResults.reduce((sum, result) => sum + result.created, 0)
      const updated = writeResults.reduce((sum, result) => sum + result.updated, 0)
      return json(res, { ok: true, action: 'roll', sessionId: session.$id, courseId, date: session.date, created, updated })
    }

    if (body.action === 'issue') {
      if (!['DELEGATE', 'TEACHER', 'ADMIN'].includes(profile.role)) return json(res, { ok: false, code: 'ROLE_DENIED', message: 'Seul un délégué, enseignant ou administrateur peut émettre un QR.' }, 403)
      const sessionId = requireValue(body.sessionId, 'sessionId')
      const courseId = requireValue(body.courseId, 'courseId')
      const sessions = await databases.listDocuments(DATABASE_ID, 'attendance_sessions', [Query.equal('$id', sessionId), Query.limit(1)])
      const session = sessions.documents[0]
      if (!session || session.courseId !== courseId) return json(res, { ok: false, code: 'SESSION_INVALID', message: 'Séance Appwrite invalide.' }, 404)
      if (profile.role !== 'ADMIN' && session.createdBy !== userId) return json(res, { ok: false, code: 'SESSION_OWNER_REQUIRED', message: 'Vous ne pouvez émettre un QR que pour votre séance.' }, 403)

      const origin = positionFrom(body.origin)
      const radiusMeters = Math.min(250, Math.max(20, Number(body.radiusMeters) || 80))
      const existingOrigins = await databases.listDocuments(DATABASE_ID, 'attendance_session_locations', [Query.equal('sessionId', sessionId), Query.limit(1)])
      const originData = { sessionId, latitude: String(origin.latitude), longitude: String(origin.longitude), radiusMeters: Math.round(radiusMeters), createdBy: userId, createdAt: new Date().toISOString() }
      if (existingOrigins.documents[0]) {
        await databases.updateDocument(DATABASE_ID, 'attendance_session_locations', existingOrigins.documents[0].$id, originData)
      } else {
        await databases.createDocument(DATABASE_ID, 'attendance_session_locations', ID.unique(), originData, [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))])
      }

      const tokens = await databases.listDocuments(DATABASE_ID, 'attendance_qr_tokens', [Query.equal('sessionId', sessionId), Query.limit(25)])
      for (const previous of tokens.documents.filter((document) => !document.revoked)) await databases.updateDocument(DATABASE_ID, 'attendance_qr_tokens', previous.$id, { revoked: true })
      const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS).toISOString()
      const token = tokenValue()
      await databases.createDocument(DATABASE_ID, 'attendance_qr_tokens', ID.unique(), { token, sessionId, courseId, createdBy: userId, expiresAt, revoked: false }, [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))])
      return json(res, { ok: true, token, sessionId, courseId, expiresAt, radiusMeters: Math.round(radiusMeters) })
    }

    if (body.action === 'revoke') {
      const token = requireValue(body.token, 'token')
      const matches = await databases.listDocuments(DATABASE_ID, 'attendance_qr_tokens', [Query.equal('token', token), Query.limit(1)])
      const qr = matches.documents[0]
      if (!qr) return json(res, { ok: false, code: 'TOKEN_NOT_FOUND', message: 'Jeton QR introuvable.' }, 404)
      if (profile.role !== 'ADMIN' && qr.createdBy !== userId) return json(res, { ok: false, code: 'REVOKE_DENIED', message: 'Vous ne pouvez révoquer que vos propres QR.' }, 403)
      await databases.updateDocument(DATABASE_ID, 'attendance_qr_tokens', qr.$id, { revoked: true })
      return json(res, { ok: true, token, revoked: true })
    }

    if (body.action === 'scan') {
      if (!['STUDENT', 'DELEGATE'].includes(profile.role)) return json(res, { ok: false, code: 'SCAN_ROLE_DENIED', message: 'Seul un apprenant inscrit peut émarger.' }, 403)
      const token = requireValue(body.token, 'token')
      const matches = await databases.listDocuments(DATABASE_ID, 'attendance_qr_tokens', [Query.equal('token', token), Query.limit(1)])
      const qr = matches.documents[0]
      if (!qr || qr.revoked || new Date(qr.expiresAt).getTime() <= Date.now()) return json(res, { ok: false, code: 'TOKEN_INVALID', message: 'QR expiré, révoqué ou invalide.' }, 422)
      const enrollments = await databases.listDocuments(DATABASE_ID, 'academic_enrollments', [Query.equal('studentId', userId), Query.equal('courseId', qr.courseId), Query.limit(1)])
      if (!enrollments.documents[0]) return json(res, { ok: false, code: 'ENROLLMENT_REQUIRED', message: 'Vous n’êtes pas inscrit à ce cours.' }, 403)
      const locations = await databases.listDocuments(DATABASE_ID, 'attendance_session_locations', [Query.equal('sessionId', qr.sessionId), Query.limit(1)])
      const location = locations.documents[0]
      if (!location) return json(res, { ok: false, code: 'PROXIMITY_NOT_CONFIGURED', message: 'La proximité n’est pas configurée pour cette séance.' }, 409)
      const position = positionFrom(body.position)
      const distance = distanceMeters(position, { latitude: Number(location.latitude), longitude: Number(location.longitude) })
      const allowance = Number(location.radiusMeters) + position.accuracy
      if (distance > allowance) return json(res, { ok: false, code: 'PROXIMITY_DENIED', message: 'Vous êtes hors de la zone autorisée pour cette séance.', distanceMeters: Math.round(distance), accuracyMeters: Math.round(position.accuracy) }, 403)
      const records = await databases.listDocuments(DATABASE_ID, 'attendance_records', [Query.equal('sessionId', qr.sessionId), Query.equal('studentId', userId), Query.limit(1)])
      if (records.documents[0]) return json(res, { ok: true, idempotent: true, recordId: records.documents[0].$id, message: 'Présence déjà enregistrée.' })
      const record = await databases.createDocument(DATABASE_ID, 'attendance_records', ID.unique(), { sessionId: qr.sessionId, courseId: qr.courseId, studentId: userId, status: 'PRESENT', verificationMethod: 'QR_GEOFENCE', proximityStatus: 'VERIFIED', proximityDistanceMeters: Math.round(distance), locationAccuracyMeters: Math.round(position.accuracy), verifiedAt: new Date().toISOString() }, [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))])
      return json(res, { ok: true, idempotent: false, recordId: record.$id, message: 'Présence vérifiée.' })
    }

    return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action QR inconnue.' }, 400)
  } catch (exception) {
    error(`attendance-secure: ${exception.message}`)
    log(`action=${body.action || 'unknown'} user=${userId}`)
    return json(res, { ok: false, code: 'ATTENDANCE_SECURE_ERROR', message: 'Le contrôle sécurisé de présence a échoué.' }, 500)
  }
}
