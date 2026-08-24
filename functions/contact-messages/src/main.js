import { Client, Databases, ID, Permission, Query, Role } from 'node-appwrite'

const DATABASE_ID = 'uniflow'
const MAX_REQUESTS_PER_HOUR = 3

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

function text(value, field, limit) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > limit) throw new Error(`INVALID_${field.toUpperCase()}`)
  return value.trim()
}

function email(value) {
  const normalized = text(value, 'email', 255).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('INVALID_EMAIL')
  return normalized
}

function permissionsFor(actorId) {
  return actorId ? [Permission.read(Role.user(actorId))] : []
}

export default async ({ req, res, error }) => {
  const body = bodyOf(req)
  if (body.action !== 'create') return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de contact inconnue.' }, 400)

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  const databases = new Databases(client)
  const actorId = actorIdOf(req)

  try {
    if (body.consent !== true) return json(res, { ok: false, code: 'CONSENT_REQUIRED', message: 'Votre accord est requis pour enregistrer cette demande de contact.' }, 400)
    const requesterName = text(body.fullName, 'name', 255)
    const requesterEmail = email(body.email)
    const subject = text(body.subject, 'subject', 160)
    const message = text(body.message, 'message', 5000)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recent = await databases.listDocuments(DATABASE_ID, 'contact_messages', [Query.equal('requesterEmail', requesterEmail), Query.greaterThan('createdAt', oneHourAgo), Query.limit(MAX_REQUESTS_PER_HOUR)])
    if (recent.total >= MAX_REQUESTS_PER_HOUR) return json(res, { ok: false, code: 'RATE_LIMITED', message: 'Trop de demandes ont été envoyées depuis cette adresse. Réessayez dans une heure.' }, 429)

    const document = await databases.createDocument(DATABASE_ID, 'contact_messages', ID.unique(), {
      requesterName,
      requesterEmail,
      requesterUserId: actorId,
      subject,
      message,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      consentAt: new Date().toISOString(),
    }, permissionsFor(actorId))
    return json(res, { ok: true, reference: document.$id, message: 'Votre demande a été enregistrée.' }, 201)
  } catch (exception) {
    const message = String(exception?.message || '')
    if (message.startsWith('INVALID_')) return json(res, { ok: false, code: message, message: 'Vérifiez les informations saisies puis réessayez.' }, 400)
    error(`contact-messages create failed=${message || 'unknown'}`)
    return json(res, { ok: false, code: 'CONTACT_ERROR', message: 'La demande de contact n’a pas pu être enregistrée.' }, 400)
  }
}
