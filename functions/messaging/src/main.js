import { createHash } from 'node:crypto'
import { Client, Databases, ID, Permission, Query, Role } from 'node-appwrite'

const DATABASE_ID = 'uniflow'
const UNIVERSITY = 'Université de Yaoundé I'
const PROGRAM = 'ICT4D'
const LEVEL = 'L1'
const ALLOWED_ROLES = ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN']

// Le contrôle d'accès exigeait auparavant que le compte appartienne
// simultanément à UY1, au programme ICT4D ET au niveau L1. Tout étudiant d'une
// autre promotion, ou tout enseignant rattaché à un autre programme, recevait
// donc un 403 sur chacune des actions de messagerie — y compris « list ».
// Par défaut on n'exige plus que l'appartenance à l'annuaire académique avec un
// rôle autorisé. Le verrou d'origine reste activable sans redéploiement via la
// variable d'environnement UNIFLOW_MESSAGING_STRICT_SCOPE=true.
const STRICT_SCOPE = String(process.env.UNIFLOW_MESSAGING_STRICT_SCOPE || '').toLowerCase() === 'true'

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
  if (!document || !ALLOWED_ROLES.includes(document.role)) return false
  if (!STRICT_SCOPE) return true
  return document.university === UNIVERSITY && document.program === PROGRAM && document.level === LEVEL
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
  if (!hasScope(entry)) throw new Error('ACTOR_DENIED')
  return entry
}

async function participantProfile(databases, userId) {
  const [profile, directory] = await Promise.all([
    databases.getDocument(DATABASE_ID, 'users', userId),
    one(databases, 'academic_directory', 'userId', userId),
  ])
  if (!profile || profile.accountType !== 'UNIVERSITY' || !hasScope(directory)) throw new Error('CONTACT_NOT_FOUND')
  return {
    userId,
    name: profile.name || directory.name || 'Utilisateur UniFlow',
    email: profile.email || '',
    username: profile.username || '',
    avatarFileId: profile.avatarFileId || '',
    role: directory.role || 'STUDENT',
  }
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
  return {
    id: conversation.$id,
    name: profile.name,
    role: profile.role,
    email: profile.email,
    username: profile.username,
    avatarFileId: profile.avatarFileId,
    online: false,
    time: conversation.lastMessageAt || conversation.$updatedAt,
    preview: conversation.lastMessage || 'Nouvelle conversation',
    unread: unread.length,
    messages: messages.documents.map((message) => asMessage(message, actorId)),
  }
}

async function markConversationRead(databases, conversation, actorId) {
  if (![conversation.participantA, conversation.participantB].includes(actorId)) throw new Error('CONVERSATION_DENIED')
  const unreadField = conversation.participantA === actorId ? 'readByA' : 'readByB'
  const messages = await databases.listDocuments(DATABASE_ID, 'chat_messages', [Query.equal('conversationId', conversation.$id), Query.limit(100)])
  const unread = messages.documents.filter((message) => message.senderId !== actorId && !message[unreadField])
  if (unread.length) await Promise.all(unread.map((message) => databases.updateDocument(DATABASE_ID, 'chat_messages', message.$id, { [unreadField]: true })))
  return unread.length
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
      // Une conversation dont l'interlocuteur n'est plus un contact valide
      // (compte supprimé, sorti de l'annuaire) faisait échouer toute la liste.
      // On l'écarte au lieu de priver l'utilisateur de ses autres échanges.
      const serialized = await Promise.all(conversations.map(async (conversation) => {
        try {
          return await serializeConversation(databases, conversation, actorId)
        } catch {
          return null
        }
      }))
      return json(res, { ok: true, action: 'list', conversations: serialized.filter(Boolean) })
    }

    // Recherche de contacts par pseudo ou par nom, pour alimenter le sélecteur
    // des clients. Nécessite un terme d'au moins 2 caractères afin de ne pas
    // exposer tout l'annuaire à une requête vide.
    if (body.action === 'search') {
      const term = cleanText(body.query, 'query', 64).toLowerCase()
      if (term.length < 2) return json(res, { ok: false, code: 'QUERY_TOO_SHORT', message: 'Saisissez au moins deux caractères.' }, 400)
      const result = await databases.listDocuments(DATABASE_ID, 'users', [Query.limit(200)])
      const contacts = result.documents
        .filter((candidate) => candidate.$id !== actorId)
        .filter((candidate) => (candidate.username || '').toLowerCase().includes(term)
          || (candidate.name || '').toLowerCase().includes(term)
          || (candidate.email || '').toLowerCase().includes(term))
        .slice(0, 20)
        .map((candidate) => ({
          userId: candidate.$id,
          name: candidate.name || 'Utilisateur UniFlow',
          email: candidate.email || '',
          username: candidate.username || '',
          avatarFileId: candidate.avatarFileId || '',
          role: candidate.role || 'STUDENT',
        }))
      return json(res, { ok: true, action: 'search', contacts })
    }

    if (body.action === 'open') {
      // Le pseudo devient le référent principal ; l'email reste accepté pour ne
      // pas casser les clients qui l'utilisent encore.
      const username = typeof body.username === 'string' ? body.username.trim().replace(/^@/, '').toLowerCase() : ''
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      if (!username && !email) return json(res, { ok: false, code: 'CONTACT_REQUIRED', message: 'Renseignez un pseudo ou une adresse e-mail.' }, 400)
      const lookup = username ? Query.equal('username', username) : Query.equal('email', email)
      const contacts = await databases.listDocuments(DATABASE_ID, 'users', [lookup, Query.limit(1)])
      const contact = contacts.documents[0]
      if (!contact || contact.$id === actorId) return json(res, { ok: false, code: 'CONTACT_NOT_FOUND', message: username ? `Aucun compte ne correspond au pseudo « ${username} ».` : 'Ce contact universitaire est introuvable.' }, 404)
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

    if (body.action === 'read') {
      const conversationId = cleanText(body.conversationId, 'conversationId', 36)
      const conversation = await databases.getDocument(DATABASE_ID, 'chat_conversations', conversationId)
      return json(res, { ok: true, action: 'read', conversationId, markedRead: await markConversationRead(databases, conversation, actorId) })
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
    if (['ACTOR_DENIED', 'CONTACT_NOT_FOUND', 'CONVERSATION_DENIED'].includes(message)) {
      const denial = message === 'CONVERSATION_DENIED'
        ? 'Cette conversation ne vous appartient pas.'
        : STRICT_SCOPE
          ? 'La messagerie est réservée aux comptes universitaires UY1 / ICT4D / L1.'
          : "La messagerie est réservée aux membres de l'annuaire académique (étudiant, délégué, enseignant ou administration)."
      return json(res, { ok: false, code: message, message: denial }, 403)
    }
    error(`messaging action=${body.action || 'unknown'} failed=${message || 'unknown'}`)
    return json(res, { ok: false, code: 'MESSAGING_ERROR', message: 'La messagerie Appwrite a échoué.' }, 400)
  }
}
