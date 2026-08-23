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

function cleanText(value, field, limit) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > limit) throw new Error(`INVALID_${field.toUpperCase()}`)
  return value.trim()
}

function hasScope(document) {
  return document?.university === UNIVERSITY && document?.program === PROGRAM && document?.level === LEVEL
}

function pairFor(first, second) {
  return [first, second].sort()
}

function conversationIdFor(first, second) {
  const [participantA, participantB] = pairFor(first, second)
  const digest = createHash('sha256').update(`${participantA}:${participantB}`).digest('hex').slice(0, 28)
  return `conv_${digest}`
}

function participantPermissions(participantA, participantB) {
  return [Permission.read(Role.user(participantA)), Permission.read(Role.user(participantB))]
}

function asMessage(document, actorId) {
  return {
    id: document.$id,
    from: document.senderId === actorId ? 'me' : 'them',
    text: document.body,
    time: document.createdAt || document.$createdAt,
    senderId: document.senderId,
  }
}

async function one(databases, collection, attribute, value) {
  const result = await databases.listDocuments(DATABASE_ID, collection, [Query.equal(attribute, value), Query.limit(1)])
  return result.documents[0] || null
}

async function actor(databases, userId) {
  const entry = await one(databases, 'academic_directory', 'userId', userId)
  if (!entry || !hasScope(entry) || !['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN'].includes(entry.role)) throw new Error('ACTOR_DENIED')
  return entry
}

async function participantProfile(databases, userId) {
  const [profile, directory] = await Promise.all([
    databases.getDocument(DATABASE_ID, 'users', userId),
    one(databases, 'academic_directory', 'userId', userId),
  ])
  if (!profile || profile.accountType !== 'UNIVERSITY' || !directory || !hasScope(directory)) throw new Error('CONTACT_NOT_FOUND')
  return { userId, name: profile.name || directory.name || 'Utilisateur UniFlow', email: profile.email || '', role: directory.role || 'STUDENT' }
}

async function conversationsFor(databases, actorId) {
  const [asA, asB] = await Promise.all([
    databases.listDocuments(DATABASE_ID, 'chat_conversations', [Query.equal('participantA', actorId), Query.limit(100)]),
    databases.listDocuments(DATABASE_ID, 'chat_conversations', [Query.equal('participantB', actorId), Query.limit(100)]),
  ])
  return [...asA.documents, ...asB.documents].sort((left, right) => String(right.lastMessageAt || right.$updatedAt).localeCompare(String(left.lastMessageAt || left.$updatedAt)))
}

async function serializeConversation(databases, conversation, actorId) {
  const otherId = conversation.participantA === actorId ? conversation.participantB : conversation.participantA
  const [profile, messages] = await Promise.all([
    participantProfile(databases, otherId),
    databases.listDocuments(DATABASE_ID, 'chat_messages', [Query.equal('conversationId', conversation.$id), Query.orderAsc('createdAt'), Query.limit(100)]),
  ])
  const unreadField = conversation.participantA === actorId ? 'readByA' : 'readByB'
  const unread = messages.documents.filter((message) => message.senderId !== actorId && !message[unreadField])
  if (unread.length) await Promise.all(unread.map((message) => databases.updateDocument(DATABASE_ID, 'chat_messages', message.$id, { [unreadField]: true })))
  return {
    id: conversation.$id,
    name: profile.name,
    role: profile.role,
    email: profile.email,
    online: false,
    time: conversation.lastMessageAt || conversation.$updatedAt,
    preview: conversation.lastMessage || 'Nouvelle conversation',
    unread: unread.length,
    messages: messages.documents.map((message) => asMessage(message, actorId)),
  }
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
    await actor(databases, actorId)
    if (body.action === 'list') {
      const conversations = await conversationsFor(databases, actorId)
      return json(res, { ok: true, action: 'list', conversations: await Promise.all(conversations.map((conversation) => serializeConversation(databases, conversation, actorId))) })
    }

    if (body.action === 'open') {
      const email = cleanText(body.email, 'email', 255).toLowerCase()
      const contacts = await databases.listDocuments(DATABASE_ID, 'users', [Query.equal('email', email), Query.limit(1)])
      const contact = contacts.documents[0]
      if (!contact || contact.$id === actorId) return json(res, { ok: false, code: 'CONTACT_NOT_FOUND', message: 'Ce contact universitaire est introuvable.' }, 404)
      const profile = await participantProfile(databases, contact.$id)
      const [participantA, participantB] = pairFor(actorId, profile.userId)
      const conversationId = conversationIdFor(participantA, participantB)
      let conversation
      try {
        conversation = await databases.getDocument(DATABASE_ID, 'chat_conversations', conversationId)
      } catch (lookupError) {
        if (Number(lookupError?.code) !== 404) throw lookupError
        conversation = await databases.createDocument(DATABASE_ID, 'chat_conversations', conversationId, {
          participantA,
          participantB,
          lastMessage: '',
          lastMessageAt: new Date().toISOString(),
        }, participantPermissions(participantA, participantB))
      }
      return json(res, { ok: true, action: 'open', conversation: await serializeConversation(databases, conversation, actorId) })
    }

    if (body.action === 'send') {
      const conversationId = cleanText(body.conversationId, 'conversationId', 36)
      const text = cleanText(body.text, 'message', 5000)
      const conversation = await databases.getDocument(DATABASE_ID, 'chat_conversations', conversationId)
      if (![conversation.participantA, conversation.participantB].includes(actorId)) return json(res, { ok: false, code: 'CONVERSATION_DENIED', message: 'Cette conversation ne vous appartient pas.' }, 403)
      const now = new Date().toISOString()
      await databases.createDocument(DATABASE_ID, 'chat_messages', ID.unique(), {
        conversationId,
        senderId: actorId,
        body: text,
        createdAt: now,
        readByA: actorId === conversation.participantA,
        readByB: actorId === conversation.participantB,
      }, participantPermissions(conversation.participantA, conversation.participantB))
      const updated = await databases.updateDocument(DATABASE_ID, 'chat_conversations', conversationId, { lastMessage: text, lastMessageAt: now })
      return json(res, { ok: true, action: 'send', conversation: await serializeConversation(databases, updated, actorId) })
    }

    return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de messagerie inconnue.' }, 400)
  } catch (exception) {
    const message = String(exception?.message || '')
    if (['ACTOR_DENIED', 'CONTACT_NOT_FOUND'].includes(message)) return json(res, { ok: false, code: message, message: 'La messagerie est réservée aux comptes universitaires UY1 / ICT4D / L1.' }, 403)
    error(`messaging action=${body.action || 'unknown'} failed=${message || 'unknown'}`)
    return json(res, { ok: false, code: 'MESSAGING_ERROR', message: 'La messagerie Appwrite a échoué.' }, 400)
  }
}
