import { Client, Databases, ID, Permission, Query, Role } from 'node-appwrite'

const DATABASE_ID = 'uniflow'
const WHATSAPP_NUMBER = '237657635644'
const REQUEST_COLLECTION = 'subscription_payment_requests'

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

function cleanText(value, field, limit, required = true) {
  if (typeof value !== 'string') {
    if (!required) return ''
    throw new Error(`INVALID_${field.toUpperCase()}`)
  }
  const normalized = value.trim()
  if ((required && !normalized) || normalized.length > limit) throw new Error(`INVALID_${field.toUpperCase()}`)
  return normalized
}

function asInteger(value, field) {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 0) throw new Error(`INVALID_${field.toUpperCase()}`)
  return number
}

function isAppwriteNotFound(error) {
  return Number(error?.code) === 404
}

async function one(databases, collection, queries) {
  const result = await databases.listDocuments(DATABASE_ID, collection, [...queries, Query.limit(1)])
  return result.documents[0] || null
}

async function actor(databases, userId) {
  const profile = await databases.getDocument(DATABASE_ID, 'users', userId)
  if (!profile) throw new Error('ACTOR_DENIED')
  return profile
}

function isAdmin(profile) {
  return profile?.role === 'ADMIN'
}

function requestPermissions(userId) {
  return [Permission.read(Role.user(userId))]
}

function makeReference() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `UF-${timestamp}-${random}`
}

function whatsappUrl(request) {
  const text = [
    'Bonjour UniFlow,',
    'je souhaite régler mon abonnement.',
    `Référence : ${request.reference}`,
    `Formule : ${request.planName} (${request.billingCycle === 'ANNUALLY' ? 'annuel' : 'mensuel'})`,
    `Montant : ${request.amount} ${request.currency}`,
    `Compte : ${request.email}`,
    'Je joins ma preuve de paiement à ce message.',
  ].join('\n')
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

function serializeRequest(document) {
  return {
    id: document.$id,
    userId: document.userId,
    reference: document.reference,
    planCode: document.planCode,
    planName: document.planName,
    billingCycle: document.billingCycle,
    amount: document.amount,
    currency: document.currency,
    fullName: document.fullName,
    email: document.email,
    phoneNumber: document.phoneNumber || '',
    status: document.status,
    requestedAt: document.requestedAt || document.$createdAt,
    processedAt: document.processedAt || null,
    processedBy: document.processedBy || null,
    adminNote: document.adminNote || '',
    whatsappUrl: document.status === 'PENDING' ? whatsappUrl(document) : undefined,
  }
}

async function planFor(databases, planCode) {
  const plan = await one(databases, 'subscription_plans', [Query.equal('code', planCode), Query.equal('status', 'ACTIVE')])
  if (!plan) throw new Error('PLAN_NOT_FOUND')
  return plan
}

async function currentRequest(databases, userId, planCode, billingCycle) {
  return one(databases, REQUEST_COLLECTION, [
    Query.equal('userId', userId),
    Query.equal('planCode', planCode),
    Query.equal('billingCycle', billingCycle),
    Query.equal('status', 'PENDING'),
  ])
}

async function listOwnRequests(databases, userId) {
  const response = await databases.listDocuments(DATABASE_ID, REQUEST_COLLECTION, [
    Query.equal('userId', userId),
    Query.orderDesc('requestedAt'),
    Query.limit(50),
  ])
  return response.documents.map(serializeRequest)
}

async function activateSubscription(databases, request, plan, adminId) {
  const now = new Date()
  const periodEnd = new Date(now.getTime())
  periodEnd.setUTCDate(periodEnd.getUTCDate() + (request.billingCycle === 'ANNUALLY' ? 365 : 31))
  const data = {
    userId: request.userId,
    status: 'ACTIVE',
    planCode: request.planCode,
    countryCode: plan.countryCode || 'CM',
    currency: request.currency,
    monthlyAmount: asInteger(plan.priceMonthlyAmount, 'monthly_amount'),
    currentPeriodEnd: periodEnd.toISOString(),
    isAutoRenew: false,
  }
  const existing = await one(databases, 'subscription_statuses', [Query.equal('userId', request.userId)])
  if (existing) {
    await databases.updateDocument(DATABASE_ID, 'subscription_statuses', existing.$id, data)
    return existing.$id
  }
  const created = await databases.createDocument(
    DATABASE_ID,
    'subscription_statuses',
    ID.unique(),
    data,
    [Permission.read(Role.user(request.userId))],
  )
  return created.$id
}

export default async ({ req, res, error }) => {
  const actorId = actorIdOf(req)
  if (!actorId) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  const databases = new Databases(client)
  const body = bodyOf(req)

  try {
    const profile = await actor(databases, actorId)
    if (body.action === 'create') {
      const planCode = cleanText(body.planCode, 'plan_code', 64)
      const billingCycle = body.billingCycle === 'ANNUALLY' ? 'ANNUALLY' : body.billingCycle === 'MONTHLY' ? 'MONTHLY' : ''
      if (!billingCycle) throw new Error('INVALID_BILLING_CYCLE')
      const plan = await planFor(databases, planCode)
      const amount = billingCycle === 'ANNUALLY' ? asInteger(plan.priceAnnuallyAmount, 'amount') : asInteger(plan.priceMonthlyAmount, 'amount')
      if (amount <= 0) return json(res, { ok: false, code: 'ACCESS_INCLUDED', message: 'Cette formule est incluse et ne requiert aucune demande de paiement.' }, 409)
      const existing = await currentRequest(databases, actorId, planCode, billingCycle)
      if (existing) return json(res, { ok: true, action: 'create', request: serializeRequest(existing), idempotent: true })
      const created = await databases.createDocument(
        DATABASE_ID,
        REQUEST_COLLECTION,
        ID.unique(),
        {
          userId: actorId,
          reference: makeReference(),
          planCode,
          planName: plan.name,
          billingCycle,
          amount,
          currency: plan.currency,
          fullName: cleanText(body.fullName, 'full_name', 255),
          email: cleanText(body.email, 'email', 255).toLowerCase(),
          phoneNumber: cleanText(body.phoneNumber, 'phone_number', 64, false),
          status: 'PENDING',
          requestedAt: new Date().toISOString(),
          adminNote: '',
        },
        requestPermissions(actorId),
      )
      return json(res, { ok: true, action: 'create', request: serializeRequest(created), idempotent: false })
    }

    if (body.action === 'list') {
      return json(res, { ok: true, action: 'list', requests: await listOwnRequests(databases, actorId) })
    }

    if (body.action === 'admin-list') {
      if (!isAdmin(profile)) return json(res, { ok: false, code: 'ADMIN_REQUIRED', message: 'Action réservée à l’administration UniFlow.' }, 403)
      const status = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'].includes(body.status) ? body.status : ''
      const queries = [Query.orderDesc('requestedAt'), Query.limit(100)]
      if (status) queries.unshift(Query.equal('status', status))
      const response = await databases.listDocuments(DATABASE_ID, REQUEST_COLLECTION, queries)
      return json(res, { ok: true, action: 'admin-list', requests: response.documents.map(serializeRequest) })
    }

    if (body.action === 'review') {
      if (!isAdmin(profile)) return json(res, { ok: false, code: 'ADMIN_REQUIRED', message: 'Action réservée à l’administration UniFlow.' }, 403)
      const requestId = cleanText(body.requestId, 'request_id', 36)
      const decision = body.decision === 'CONFIRMED' ? 'CONFIRMED' : body.decision === 'REJECTED' ? 'REJECTED' : ''
      if (!decision) throw new Error('INVALID_DECISION')
      const paymentRequest = await databases.getDocument(DATABASE_ID, REQUEST_COLLECTION, requestId)
      if (paymentRequest.status !== 'PENDING') return json(res, { ok: false, code: 'REQUEST_ALREADY_REVIEWED', message: 'Cette demande a déjà été traitée.' }, 409)
      const processedAt = new Date().toISOString()
      const adminNote = cleanText(body.adminNote, 'admin_note', 1000, false)
      const updated = await databases.updateDocument(DATABASE_ID, REQUEST_COLLECTION, requestId, {
        status: decision,
        processedAt,
        processedBy: actorId,
        adminNote,
      })
      let subscriptionStatusId = null
      if (decision === 'CONFIRMED') subscriptionStatusId = await activateSubscription(databases, updated, await planFor(databases, updated.planCode), actorId)
      return json(res, { ok: true, action: 'review', request: serializeRequest(updated), subscriptionStatusId })
    }

    return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de paiement inconnue.' }, 400)
  } catch (exception) {
    const code = String(exception?.message || 'PAYMENT_ERROR')
    if (['ACTOR_DENIED', 'PLAN_NOT_FOUND'].includes(code)) return json(res, { ok: false, code, message: code === 'PLAN_NOT_FOUND' ? 'La formule payante demandée est introuvable ou inactive.' : 'Profil UniFlow introuvable.' }, 404)
    if (code.startsWith('INVALID_')) return json(res, { ok: false, code, message: 'Les informations de la demande de paiement sont invalides.' }, 400)
    error(`subscription-payments action=${body.action || 'unknown'} failed=${code}`)
    return json(res, { ok: false, code: 'PAYMENT_ERROR', message: 'La demande de paiement Appwrite a échoué.' }, 400)
  }
}
