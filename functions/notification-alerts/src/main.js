import { Client, Databases, ID, Permission, Query, Role } from 'node-appwrite'

const DATABASE_ID = 'uniflow'
const NOTIFICATIONS = 'notifications'

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

function eventName(req) {
  return String(req.headers['x-appwrite-event'] || req.headers['x-appwrite-event-name'] || '')
}

function documentFrom(body) {
  if (body.document && typeof body.document === 'object') return body.document
  if (body.data && typeof body.data === 'object') return body.data
  return body
}

function valuesFrom(body) {
  if (Array.isArray(body.documents)) return body.documents
  const document = documentFrom(body)
  return document && typeof document === 'object' ? [document] : []
}

function notificationPermissions(studentId) {
  return [Permission.read(Role.user(studentId)), Permission.update(Role.user(studentId)), Permission.delete(Role.user(studentId))]
}

async function alreadyCreated(databases, eventKey) {
  const rows = await databases.listDocuments(DATABASE_ID, NOTIFICATIONS, [Query.equal('eventKey', eventKey), Query.limit(1)])
  return rows.documents[0] || null
}

async function createNotification(databases, payload) {
  if (!payload.ownerId || !payload.eventKey || !payload.title || !payload.message) return { created: false, skipped: true }
  if (await alreadyCreated(databases, payload.eventKey)) return { created: false, duplicate: true }
  const document = await databases.createDocument(DATABASE_ID, NOTIFICATIONS, ID.unique(), { ownerId: payload.ownerId, type: payload.type || 'system', title: payload.title, message: payload.message, isRead: false, createdAt: new Date().toISOString(), courseId: payload.courseId || '', scheduleId: payload.scheduleId || '', eventKey: payload.eventKey }, notificationPermissions(payload.ownerId))
  return { created: true, notificationId: document.$id }
}

async function listStudentsForCourse(databases, courseId) {
  const rows = await databases.listDocuments(DATABASE_ID, 'academic_enrollments', [Query.equal('courseId', courseId), Query.limit(200)])
  return rows.documents.map((row) => row.studentId).filter((value) => typeof value === 'string' && value)
}

function eventType(event) {
  if (event.includes('attendance_records')) return 'attendance'
  if (event.includes('academic_schedules')) return 'schedule'
  if (event.includes('personal_schedules')) return 'personal_schedule'
  return ''
}

export default async ({ req, res, log, error }) => {
  const event = eventName(req)
  const body = parseBody(req)
  const kind = eventType(event)
  if (!kind) return json(res, { ok: true, handled: false, reason: 'EVENT_NOT_RELEVANT' })

  const client = new Client().setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT).setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID).setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  const databases = new Databases(client)

  try {
    const documents = valuesFrom(body)
    const results = []
    for (const document of documents) {
      if (kind === 'attendance') {
        const status = String(document.status || '').toUpperCase()
        if (!['ABSENT', 'RETARD'].includes(status) || !document.studentId) continue
        const label = status === 'ABSENT' ? 'Absence' : 'Retard'
        results.push(await createNotification(databases, {
          ownerId: document.studentId,
          type: 'absence',
          title: `${label} enregistrée`,
          message: status === 'ABSENT' ? 'Une absence a été enregistrée pour vous. Consultez le détail de la séance dans votre espace UniFlow.' : 'Un retard a été enregistré pour vous. Consultez l’historique de présence dans votre espace UniFlow.',
          courseId: document.courseId,
          eventKey: `attendance:${document.$id}:${status}`,
        }))
      }

      if (kind === 'schedule' && document.courseId && document.$id) {
        const studentIds = await listStudentsForCourse(databases, document.courseId)
        const slot = `${document.dayOfWeek || 'jour à préciser'} ${document.startTime || ''}–${document.endTime || ''}`.trim()
        for (const studentId of studentIds) results.push(await createNotification(databases, {
          ownerId: studentId,
          type: 'system',
          title: 'Emploi du temps modifié',
          message: `Le créneau ${slot} de votre cours a été mis à jour. Vérifiez la grille UniFlow avant votre prochaine séance.`,
          courseId: document.courseId,
          scheduleId: document.$id,
          eventKey: `schedule:${document.$id}:${document.$updatedAt || document.$createdAt || new Date().toISOString()}:${studentId}`,
        }))
      }

      if (kind === 'personal_schedule' && document.ownerId && document.$id) {
        results.push(await createNotification(databases, {
          ownerId: document.ownerId,
          type: 'system',
          title: 'Planning personnel mis à jour',
          message: 'Un créneau de votre planning personnel a été créé ou modifié.',
          scheduleId: document.$id,
          eventKey: `personal-schedule:${document.$id}:${document.$updatedAt || document.$createdAt || new Date().toISOString()}`,
        }))
      }
    }
    log(`notification-alerts event=${kind} documents=${documents.length} results=${results.length}`)
    return json(res, { ok: true, handled: true, kind, results })
  } catch (exception) {
    error(`notification-alerts: ${exception.message}`)
    return json(res, { ok: false, code: 'NOTIFICATION_ALERTS_ERROR', message: 'Le traitement des alertes Appwrite a échoué.' }, 500)
  }
}
