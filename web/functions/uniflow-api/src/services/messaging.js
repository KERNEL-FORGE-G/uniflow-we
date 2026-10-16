import { createHash } from 'node:crypto'
import { Client, Databases, ID, Permission, Query, Role, Storage } from 'node-appwrite'

const DATABASE_ID = 'uniflow'
const UNIVERSITY = 'Université de Yaoundé I'
const PROGRAM = 'ICT4D'
const LEVELS = ['L1', 'L2', 'L3']
const inScope = (document) => document?.university === UNIVERSITY && document?.program === PROGRAM && LEVELS.includes(document?.level)
const ALLOWED_ROLES = ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN']

const CHAT_FILES_BUCKET = 'uniflow_assets'
const MAX_ATTACHMENT_BYTES = 50_000_000

/** Types MIME affichés comme des images dans la conversation. */
const IMAGE_MIME_PREFIX = 'image/'

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
  return inScope(document)
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

function attachmentPermissions(uploaderId, participantA, participantB) {
  return [
    Permission.read(Role.user(participantA)),
    Permission.read(Role.user(participantB)),
    Permission.update(Role.user(uploaderId)),
    Permission.delete(Role.user(uploaderId)),
  ]
}

function groupAttachmentPermissions(uploaderId) {
  return [
    Permission.read(Role.users()),
    Permission.update(Role.user(uploaderId)),
    Permission.delete(Role.user(uploaderId)),
  ]
}

function asMessage(document, actorId, senderProfile = null) {
  return {
    id: document.$id,
    from: document.senderId === actorId ? 'me' : 'them',
    text: document.body,
    time: document.createdAt || document.$createdAt,
    senderId: document.senderId,
    senderName: senderProfile?.name || document.senderName || '',
    senderUsername: senderProfile?.username || '',
    senderAvatar: senderProfile?.avatarFileId || '',
    fileId: document.fileId || '',
    fileName: document.fileName || '',
    fileSize: Number(document.fileSize || 0),
    fileType: document.fileType || '',
    kind: document.kind || 'text',
    urgent: Boolean(document.urgent),
  }
}

async function inspectAttachment(storage, fileId) {
  let file
  try {
    file = await storage.getFile(CHAT_FILES_BUCKET, fileId)
  } catch {
    throw new Error('ATTACHMENT_NOT_FOUND')
  }
  if (Number(file.sizeOriginal || 0) > MAX_ATTACHMENT_BYTES) throw new Error('ATTACHMENT_TOO_LARGE')
  const mimeType = String(file.mimeType || '')
  const kind = mimeType.startsWith(IMAGE_MIME_PREFIX)
    ? 'image'
    : mimeType.startsWith('audio/')
      ? 'audio'
      : mimeType.startsWith('video/')
        ? 'video'
        : 'file'
  return {
    fileId: file.$id,
    fileName: file.name,
    fileSize: Number(file.sizeOriginal || 0),
    fileType: mimeType,
    kind,
    permissions: Array.isArray(file.$permissions) ? file.$permissions : [],
  }
}

async function notifyUrgent(databases, { recipientId, senderName, text, messageId, conversationId, hasFile }) {
  const eventKey = `msg:${messageId}`
  const existing = await databases.listDocuments(DATABASE_ID, 'notifications', [Query.equal('eventKey', eventKey), Query.limit(1)])
  if (existing.documents.length > 0) return null
  const preview = text.length > 120 ? `${text.slice(0, 117)}…` : text
  return databases.createDocument(DATABASE_ID, 'notifications', ID.unique(), {
    ownerId: recipientId,
    type: 'MESSAGE_URGENT',
    title: `Message urgent de ${senderName}`,
    message: hasFile && !preview ? 'Vous a envoyé un fichier' : preview,
    isRead: false,
    createdAt: new Date().toISOString(),
    eventKey,
    link: `/messages?conversation=${conversationId}`,
  }, [
    Permission.read(Role.user(recipientId)),
    Permission.update(Role.user(recipientId)),
    Permission.delete(Role.user(recipientId)),
  ])
}

async function one(databases, collection, attribute, value) {
  const result = await databases.listDocuments(DATABASE_ID, collection, [Query.equal(attribute, value), Query.limit(1)])
  return result.documents[0] || null
}

async function actor(databases, userId) {
  if (!userId) throw new Error('UNAUTHORIZED')
  const entry = await one(databases, 'academic_directory', 'userId', userId)
  if (entry && hasScope(entry)) return entry

  try {
    const userDoc = await databases.getDocument(DATABASE_ID, 'users', userId)
    if (userDoc) {
      return {
        $id: userDoc.$id,
        userId: userDoc.$id,
        name: userDoc.name || 'Utilisateur UniFlow',
        role: userDoc.accountType === 'PERSONAL' ? 'INDEPENDENT' : (userDoc.role || 'STUDENT'),
        accountType: userDoc.accountType || 'PERSONAL',
        username: userDoc.username || '',
      }
    }
  } catch {}

  return {
    $id: userId,
    userId,
    name: 'Utilisateur UniFlow',
    role: 'INDEPENDENT',
    accountType: 'PERSONAL',
    username: '',
  }
}

async function participantProfile(databases, userId) {
  const [profileResult, directoryResult] = await Promise.allSettled([
    databases.getDocument(DATABASE_ID, 'users', userId),
    one(databases, 'academic_directory', 'userId', userId),
  ])
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null
  const directory = directoryResult.status === 'fulfilled' ? directoryResult.value : null

  const role = directory?.role
    || (profile?.accountType === 'PERSONAL' ? 'INDEPENDENT' : (profile?.role || 'INDEPENDENT'))

  return {
    userId,
    name: profile?.name || directory?.name || 'Utilisateur UniFlow',
    email: profile?.email || '',
    username: profile?.username || '',
    avatarFileId: profile?.avatarFileId || '',
    role,
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
    isGroup: false,
    userId: otherId,
    name: profile.name,
    role: profile.role,
    email: profile.email,
    username: profile.username,
    avatarFileId: profile.avatarFileId,
    online: false,
    time: conversation.lastMessageAt || conversation.$updatedAt,
    preview: conversation.lastMessage || 'Nouvelle conversation',
    unread: unread.length,
    messages: messages.documents.map((message) => asMessage(message, actorId, message.senderId === otherId ? profile : null)),
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

/**
 * Fonctions pour les Groupes de discussion (style WhatsApp)
 */
async function getGroupMembers(databases, groupId, limit = 100) {
  const result = await databases.listDocuments(DATABASE_ID, 'chat_group_members', [
    Query.equal('groupId', groupId),
    Query.limit(limit),
  ])
  return result.documents
}

async function isGroupMember(databases, groupId, userId) {
  const result = await databases.listDocuments(DATABASE_ID, 'chat_group_members', [
    Query.equal('groupId', groupId),
    Query.equal('userId', userId),
    Query.limit(1),
  ])
  return result.documents.length > 0 ? result.documents[0] : null
}

async function serializeGroup(databases, group, actorId) {
  const [membersDoc, messages] = await Promise.all([
    databases.listDocuments(DATABASE_ID, 'chat_group_members', [Query.equal('groupId', group.$id), Query.limit(100)]),
    databases.listDocuments(DATABASE_ID, 'chat_messages', [Query.equal('conversationId', group.$id), Query.orderAsc('createdAt'), Query.limit(100)]),
  ])

  // Charger les profils des expéditeurs des messages récents
  const senderIds = [...new Set(messages.documents.map(m => m.senderId))]
  const profilesMap = new Map()
  await Promise.all(senderIds.map(async (sid) => {
    try {
      const p = await participantProfile(databases, sid)
      profilesMap.set(sid, p)
    } catch {}
  }))

  return {
    id: group.$id,
    groupId: group.$id,
    isGroup: true,
    name: group.name,
    description: group.description || '',
    adminId: group.adminId,
    avatarFileId: group.avatarFileId || '',
    role: 'GROUP',
    online: false,
    time: group.lastMessageAt || group.createdAt || group.$createdAt,
    preview: group.lastMessage ? (group.lastSenderName ? `${group.lastSenderName}: ${group.lastMessage}` : group.lastMessage) : 'Groupe créé',
    unread: 0,
    memberCount: membersDoc.total || membersDoc.documents.length,
    messages: messages.documents.map((message) => asMessage(message, actorId, profilesMap.get(message.senderId))),
  }
}

export default async ({ req, res, error }) => {
  const actorId = actorIdOf(req)
  if (!actorId) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)
  
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.headers['x-appwrite-key'] || '')
  const databases = new Databases(client)
  const storage = new Storage(client)
  const body = bodyOf(req)

  try {
    const currentActor = await actor(databases, actorId)

    // 1. LISTE GLOBALE DES CONVERSATIONS (DIRECTES + GROUPES)
    if (body.action === 'list') {
      const [directConversations, memberEntries] = await Promise.all([
        conversationsFor(databases, actorId),
        databases.listDocuments(DATABASE_ID, 'chat_group_members', [Query.equal('userId', actorId), Query.limit(100)]),
      ])

      const directSerializedPromises = directConversations.map(async (conversation) => {
        try {
          return await serializeConversation(databases, conversation, actorId)
        } catch {
          return null
        }
      })

      const groupSerializedPromises = memberEntries.documents.map(async (entry) => {
        try {
          const group = await databases.getDocument(DATABASE_ID, 'chat_groups', entry.groupId)
          return await serializeGroup(databases, group, actorId)
        } catch {
          return null
        }
      })

      const [directList, groupList] = await Promise.all([
        Promise.all(directSerializedPromises),
        Promise.all(groupSerializedPromises),
      ])

      const all = [...directList.filter(Boolean), ...groupList.filter(Boolean)].sort((left, right) =>
        String(right.time || '').localeCompare(String(left.time || ''))
      )

      return json(res, { ok: true, action: 'list', conversations: all })
    }

    // 2. RECHERCHE DE CONTACTS (PAR PSEUDO, NOM OU EMAIL)
    if (body.action === 'search') {
      const term = cleanText(body.query, 'query', 64).toLowerCase().replace(/^@/, '')
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
          role: candidate.accountType === 'PERSONAL' ? 'INDEPENDENT' : (candidate.role || 'STUDENT'),
        }))
      return json(res, { ok: true, action: 'search', contacts })
    }

    // 3. OUVERTURE D'UNE CONVERSATION OU D'UN GROUPE
    if (body.action === 'open') {
      if (body.groupId) {
        const groupId = cleanText(body.groupId, 'groupId', 64)
        const membership = await isGroupMember(databases, groupId, actorId)
        if (!membership) return json(res, { ok: false, code: 'GROUP_ACCESS_DENIED', message: 'Vous ne faites pas partie de ce groupe.' }, 403)
        const group = await databases.getDocument(DATABASE_ID, 'chat_groups', groupId)
        return json(res, { ok: true, action: 'open', conversation: await serializeGroup(databases, group, actorId) })
      }

      const username = typeof body.username === 'string' ? body.username.trim().replace(/^@/, '').toLowerCase() : ''
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
      if (!username && !email && !userId) return json(res, { ok: false, code: 'CONTACT_REQUIRED', message: 'Renseignez un pseudo, un id ou une adresse e-mail.' }, 400)
      
      let contact = null
      if (userId) {
        try { contact = await databases.getDocument(DATABASE_ID, 'users', userId) } catch {}
      }
      if (!contact && username) {
        const lookup = Query.equal('username', username)
        const contacts = await databases.listDocuments(DATABASE_ID, 'users', [lookup, Query.limit(1)])
        contact = contacts.documents[0]
      }
      if (!contact && email) {
        const lookup = Query.equal('email', email)
        const contacts = await databases.listDocuments(DATABASE_ID, 'users', [lookup, Query.limit(1)])
        contact = contacts.documents[0]
      }

      if (!contact || contact.$id === actorId) return json(res, { ok: false, code: 'CONTACT_NOT_FOUND', message: username ? `Aucun compte ne correspond au pseudo « @${username} ».` : 'Ce contact est introuvable.' }, 404)
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

    // 4. CRÉATION DE GROUPE (STYLE WHATSAPP)
    if (body.action === 'create_group') {
      const name = cleanText(body.name, 'name', 100)
      const description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) : ''
      const avatarFileId = typeof body.avatarFileId === 'string' ? body.avatarFileId.trim() : ''
      
      const groupId = `grp_${ID.unique().slice(0, 24)}`
      const now = new Date().toISOString()
      
      const groupDoc = await databases.createDocument(DATABASE_ID, 'chat_groups', groupId, {
        name,
        description,
        adminId: actorId,
        avatarFileId,
        lastMessage: 'Groupe créé',
        lastMessageAt: now,
        lastSenderName: currentActor.name || '',
        createdAt: now,
      }, [Permission.read(Role.users()), Permission.update(Role.users()), Permission.delete(Role.user(actorId))])

      // Ajouter le créateur comme administrateur du groupe
      await databases.createDocument(DATABASE_ID, 'chat_group_members', ID.unique(), {
        groupId,
        userId: actorId,
        role: 'admin',
        joinedAt: now,
      }, [Permission.read(Role.users()), Permission.update(Role.user(actorId)), Permission.delete(Role.user(actorId))])

      // Résoudre les membres invités (par pseudo ou par userId)
      const memberIdentifiers = Array.isArray(body.members) ? body.members : []
      const resolvedUserIds = new Set()

      for (const raw of memberIdentifiers) {
        if (!raw || typeof raw !== 'string') continue
        const clean = raw.trim()
        if (clean === actorId) continue
        if (clean.startsWith('@') || !clean.includes('-')) {
          // Rechercher par username
          const uname = clean.replace(/^@/, '').toLowerCase()
          const users = await databases.listDocuments(DATABASE_ID, 'users', [Query.equal('username', uname), Query.limit(1)])
          if (users.documents.length > 0) resolvedUserIds.add(users.documents[0].$id)
        } else {
          resolvedUserIds.add(clean)
        }
      }

      for (const targetUserId of resolvedUserIds) {
        try {
          await databases.createDocument(DATABASE_ID, 'chat_group_members', ID.unique(), {
            groupId,
            userId: targetUserId,
            role: 'member',
            joinedAt: now,
          }, [Permission.read(Role.users()), Permission.update(Role.user(targetUserId)), Permission.delete(Role.user(actorId))])
        } catch (addErr) {
          error(`Failed to add initial member ${targetUserId} to group ${groupId}: ${addErr?.message}`)
        }
      }

      const serialized = await serializeGroup(databases, groupDoc, actorId)
      return json(res, { ok: true, action: 'create_group', group: serialized })
    }

    // 5. AJOUT DE MEMBRES DANS UN GROUPE
    if (body.action === 'add_group_members') {
      const groupId = cleanText(body.groupId, 'groupId', 64)
      const membership = await isGroupMember(databases, groupId, actorId)
      if (!membership) return json(res, { ok: false, code: 'NOT_A_MEMBER', message: 'Vous devez faire partie du groupe pour inviter des membres.' }, 403)

      const memberIdentifiers = Array.isArray(body.members) ? body.members : []
      if (!memberIdentifiers.length) return json(res, { ok: false, code: 'NO_MEMBERS', message: 'Indiquez au moins un contact à ajouter.' }, 400)

      const now = new Date().toISOString()
      const added = []

      for (const raw of memberIdentifiers) {
        if (!raw || typeof raw !== 'string') continue
        let targetUserId = raw.trim()
        if (targetUserId.startsWith('@')) {
          const uname = targetUserId.replace(/^@/, '').toLowerCase()
          const users = await databases.listDocuments(DATABASE_ID, 'users', [Query.equal('username', uname), Query.limit(1)])
          if (users.documents.length > 0) targetUserId = users.documents[0].$id
          else continue
        }

        const existing = await isGroupMember(databases, groupId, targetUserId)
        if (!existing) {
          try {
            await databases.createDocument(DATABASE_ID, 'chat_group_members', ID.unique(), {
              groupId,
              userId: targetUserId,
              role: 'member',
              joinedAt: now,
            }, [Permission.read(Role.users()), Permission.update(Role.user(targetUserId)), Permission.delete(Role.user(actorId))])
            added.push(targetUserId)
          } catch (e) {
            error(`Failed to add member ${targetUserId}: ${e?.message}`)
          }
        }
      }

      const group = await databases.getDocument(DATABASE_ID, 'chat_groups', groupId)
      return json(res, { ok: true, action: 'add_group_members', addedCount: added.length, group: await serializeGroup(databases, group, actorId) })
    }

    // 6. QUITTER UN GROUPE
    if (body.action === 'leave_group') {
      const groupId = cleanText(body.groupId, 'groupId', 64)
      const membership = await isGroupMember(databases, groupId, actorId)
      if (!membership) return json(res, { ok: false, code: 'NOT_A_MEMBER', message: 'Vous ne faites pas partie de ce groupe.' }, 404)

      await databases.deleteDocument(DATABASE_ID, 'chat_group_members', membership.$id)

      // Si l'admin quitte, transférer les droits au membre le plus ancien s'il en reste
      const group = await databases.getDocument(DATABASE_ID, 'chat_groups', groupId)
      if (group.adminId === actorId) {
        const remaining = await databases.listDocuments(DATABASE_ID, 'chat_group_members', [Query.equal('groupId', groupId), Query.limit(1)])
        if (remaining.documents.length > 0) {
          const newAdminId = remaining.documents[0].userId
          await databases.updateDocument(DATABASE_ID, 'chat_groups', groupId, { adminId: newAdminId })
          await databases.updateDocument(DATABASE_ID, 'chat_group_members', remaining.documents[0].$id, { role: 'admin' })
        }
      }

      return json(res, { ok: true, action: 'leave_group', groupId })
    }

    // 7. INFOS D'UN GROUPE (AVEC DÉTAIL DES MEMBRES SANS LIMITE)
    if (body.action === 'group_info') {
      const groupId = cleanText(body.groupId, 'groupId', 64)
      const membership = await isGroupMember(databases, groupId, actorId)
      if (!membership) return json(res, { ok: false, code: 'GROUP_ACCESS_DENIED', message: 'Vous ne faites pas partie de ce groupe.' }, 403)

      const group = await databases.getDocument(DATABASE_ID, 'chat_groups', groupId)
      const membersDoc = await databases.listDocuments(DATABASE_ID, 'chat_group_members', [
        Query.equal('groupId', groupId),
        Query.limit(200),
      ])

      const detailedMembers = await Promise.all(membersDoc.documents.map(async (doc) => {
        const p = await participantProfile(databases, doc.userId)
        return {
          userId: doc.userId,
          name: p.name,
          username: p.username,
          avatarFileId: p.avatarFileId,
          role: doc.role,
          joinedAt: doc.joinedAt || doc.$createdAt,
        }
      }))

      return json(res, {
        ok: true,
        action: 'group_info',
        group: {
          id: group.$id,
          name: group.name,
          description: group.description || '',
          adminId: group.adminId,
          avatarFileId: group.avatarFileId || '',
          createdAt: group.createdAt || group.$createdAt,
          memberCount: membersDoc.total,
          members: detailedMembers,
        },
      })
    }

    // 8. MARQUER COMME LU
    if (body.action === 'read') {
      const conversationId = cleanText(body.conversationId, 'conversationId', 64)
      if (conversationId.startsWith('grp_')) {
        return json(res, { ok: true, action: 'read', conversationId, markedRead: 0 })
      }
      const conversation = await databases.getDocument(DATABASE_ID, 'chat_conversations', conversationId)
      return json(res, { ok: true, action: 'read', conversationId, markedRead: await markConversationRead(databases, conversation, actorId) })
    }

    // 9. ENVOI DE MESSAGE (DIRECT OU GROUPE)
    if (body.action === 'send') {
      const conversationId = cleanText(body.conversationId, 'conversationId', 64)
      const attachment = typeof body.fileId === 'string' && body.fileId.trim()
        ? await inspectAttachment(storage, body.fileId.trim())
        : null
      const rawText = typeof body.text === 'string' ? body.text.trim() : ''
      const text = rawText
        ? cleanText(rawText, 'message', 5000)
        : attachment
          ? attachment.fileName.slice(0, 255)
          : ''
      if (!text) return json(res, { ok: false, code: 'MESSAGE_EMPTY', message: 'Saisissez un message ou joignez un fichier.' }, 400)
      const urgent = body.urgent === true
      const now = new Date().toISOString()

      // --- CAS 1 : MESSAGE DANS UN GROUPE ---
      if (conversationId.startsWith('grp_')) {
        const membership = await isGroupMember(databases, conversationId, actorId)
        if (!membership) return json(res, { ok: false, code: 'GROUP_DENIED', message: 'Vous ne faites pas partie de ce groupe.' }, 403)

        if (attachment) {
          if (!attachment.permissions.includes(Permission.read(Role.user(actorId)))) {
            return json(res, { ok: false, code: 'ATTACHMENT_DENIED', message: 'Cette pièce jointe ne vous appartient pas.' }, 403)
          }
          await storage.updateFile(
            CHAT_FILES_BUCKET,
            attachment.fileId,
            attachment.fileName,
            groupAttachmentPermissions(actorId),
          )
        }

        const message = await databases.createDocument(DATABASE_ID, 'chat_messages', ID.unique(), {
          conversationId,
          senderId: actorId,
          senderName: currentActor.name || 'Membre',
          body: text,
          createdAt: now,
          readByA: true,
          readByB: true,
          fileId: attachment?.fileId || '',
          fileName: attachment?.fileName || '',
          fileSize: attachment?.fileSize || 0,
          fileType: attachment?.fileType || '',
          kind: attachment?.kind || 'text',
          urgent,
        }, [Permission.read(Role.users()), Permission.delete(Role.user(actorId))])

        const groupUpdated = await databases.updateDocument(DATABASE_ID, 'chat_groups', conversationId, {
          lastMessage: text.slice(0, 5000),
          lastMessageAt: now,
          lastSenderName: currentActor.name || '',
        })

        return json(res, {
          ok: true,
          action: 'send',
          notified: false,
          conversation: await serializeGroup(databases, groupUpdated, actorId),
        })
      }

      // --- CAS 2 : MESSAGE DIRECT (1-TO-1) ---
      const conversation = await databases.getDocument(DATABASE_ID, 'chat_conversations', conversationId)
      if (![conversation.participantA, conversation.participantB].includes(actorId)) {
        return json(res, { ok: false, code: 'CONVERSATION_DENIED', message: 'Cette conversation ne vous appartient pas.' }, 403)
      }

      if (attachment) {
        if (!attachment.permissions.includes(Permission.read(Role.user(actorId)))) {
          return json(res, { ok: false, code: 'ATTACHMENT_DENIED', message: 'Cette pièce jointe ne vous appartient pas.' }, 403)
        }
        await storage.updateFile(
          CHAT_FILES_BUCKET,
          attachment.fileId,
          attachment.fileName,
          attachmentPermissions(actorId, conversation.participantA, conversation.participantB),
        )
      }

      const message = await databases.createDocument(DATABASE_ID, 'chat_messages', ID.unique(), {
        conversationId,
        senderId: actorId,
        senderName: currentActor.name || '',
        body: text,
        createdAt: now,
        readByA: actorId === conversation.participantA,
        readByB: actorId === conversation.participantB,
        fileId: attachment?.fileId || '',
        fileName: attachment?.fileName || '',
        fileSize: attachment?.fileSize || 0,
        fileType: attachment?.fileType || '',
        kind: attachment?.kind || 'text',
        urgent,
      }, participantPermissions(conversation.participantA, conversation.participantB))

      const preview = urgent ? `Urgent — ${text}` : text
      const updated = await databases.updateDocument(DATABASE_ID, 'chat_conversations', conversationId, {
        lastMessage: preview.slice(0, 5000),
        lastMessageAt: now,
      })

      let notified = false
      if (urgent) {
        const recipientId = conversation.participantA === actorId ? conversation.participantB : conversation.participantA
        try {
          const sender = await participantProfile(databases, actorId)
          notified = Boolean(await notifyUrgent(databases, {
            recipientId,
            senderName: sender.name,
            text: rawText,
            messageId: message.$id,
            conversationId,
            hasFile: Boolean(attachment),
          }))
        } catch (notificationError) {
          error(`messaging urgent notification failed=${String(notificationError?.message || notificationError)}`)
        }
      }
      return json(res, { ok: true, action: 'send', notified, conversation: await serializeConversation(databases, updated, actorId) })
    }

    // 10. NOTIFICATIONS
    if (body.action === 'notifications') {
      const result = await databases.listDocuments(DATABASE_ID, 'notifications', [
        Query.equal('ownerId', actorId),
        Query.orderDesc('createdAt'),
        Query.limit(50),
      ])
      return json(res, {
        ok: true,
        action: 'notifications',
        unread: result.documents.filter((notification) => !notification.isRead).length,
        notifications: result.documents.map((notification) => ({
          id: notification.$id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: Boolean(notification.isRead),
          link: notification.link || '',
          time: notification.createdAt || notification.$createdAt,
        })),
      })
    }

    if (body.action === 'notificationsRead') {
      const notificationId = typeof body.notificationId === 'string' ? body.notificationId.trim() : ''
      const queries = [Query.equal('ownerId', actorId), Query.equal('isRead', false), Query.limit(200)]
      if (notificationId) queries.unshift(Query.equal('$id', notificationId))
      const result = await databases.listDocuments(DATABASE_ID, 'notifications', queries)
      await Promise.all(result.documents.map((notification) => databases.updateDocument(DATABASE_ID, 'notifications', notification.$id, { isRead: true })))
      return json(res, { ok: true, action: 'notificationsRead', markedRead: result.documents.length })
    }

    return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de messagerie inconnue.' }, 400)
  } catch (exception) {
    const message = String(exception?.message || '')
    if (['ATTACHMENT_NOT_FOUND', 'ATTACHMENT_TOO_LARGE'].includes(message)) {
      const denial = message === 'ATTACHMENT_TOO_LARGE'
        ? `Fichier trop volumineux : la limite du serveur est de ${Math.round(MAX_ATTACHMENT_BYTES / 1_000_000)} Mo.`
        : "Ce fichier est introuvable dans l'espace de stockage UniFlow."
      return json(res, { ok: false, code: message, message: denial }, 400)
    }
    if (['ACTOR_DENIED', 'CONTACT_NOT_FOUND', 'CONVERSATION_DENIED', 'GROUP_ACCESS_DENIED', 'GROUP_DENIED'].includes(message)) {
      const denial = message === 'CONVERSATION_DENIED'
        ? 'Cette conversation ne vous appartient pas.'
        : message === 'CONTACT_NOT_FOUND'
          ? 'Ce contact est introuvable.'
          : (message === 'GROUP_ACCESS_DENIED' || message === 'GROUP_DENIED')
            ? 'Vous ne faites pas partie de ce groupe.'
            : 'Accès refusé au service de messagerie.'
      return json(res, { ok: false, code: message, message: denial }, 403)
    }
    if (Number(exception?.code) === 404) {
      return json(res, { ok: false, code: 'CONVERSATION_NOT_FOUND', message: 'Cette conversation ou ce groupe n’existe plus.' }, 404)
    }
    error(`messaging action=${body.action || 'unknown'} failed=${message || 'unknown'}`)
    return json(res, { ok: false, code: 'MESSAGING_ERROR', message: `La messagerie Appwrite a échoué: ${message}` }, 400)
  }
}
