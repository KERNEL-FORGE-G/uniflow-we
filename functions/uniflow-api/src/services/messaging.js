import { createHash } from 'node:crypto'
import { Client, Databases, ID, Permission, Query, Role, Storage } from 'node-appwrite'

const DATABASE_ID = 'uniflow'
const UNIVERSITY = 'Université de Yaoundé I'
const PROGRAM = 'ICT4D'
// La filière ICT4D couvre la Licence 1 à la Licence 3 (demande du propriétaire) :
// le périmètre n'est plus figé sur `L1`, un compte L2 ou L3 est dans le champ.
const LEVELS = ['L1', 'L2', 'L3']
const inScope = (document) => document?.university === UNIVERSITY && document?.program === PROGRAM && LEVELS.includes(document?.level)
const ALLOWED_ROLES = ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN']

/**
 * Bucket des pièces jointes de discussion.
 *
 * Appwrite Cloud plafonne tout fichier à 50 000 000 octets sur le plan
 * gratuit ; cette constante n'est qu'un garde-fou côté Function, la vraie
 * limite restant celle du bucket. Un fichier plus gros est refusé au
 * téléversement par Appwrite, avec un message que le client relaie.
 *
 * Le bucket est l'unique bucket du projet (le plan gratuit n'en autorise
 * qu'un) : l'isolement des pièces jointes repose sur les permissions par
 * fichier, que cette Function pose elle-même sur les deux participants.
 */
const CHAT_FILES_BUCKET = 'uniflow_assets'
const MAX_ATTACHMENT_BYTES = 50_000_000

/** Types MIME affichés comme des images dans la conversation. */
const IMAGE_MIME_PREFIX = 'image/'

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

/**
 * Permissions d'une pièce jointe une fois envoyée.
 *
 * Le client téléverse avec ses seules permissions — Appwrite 1.6.1 refuse
 * qu'il en accorde à un autre utilisateur — donc c'est ici, avec la clé API,
 * que le destinataire reçoit la lecture.
 *
 * `update` et `delete` restent à l'expéditeur. `updateFile` **remplace** la
 * liste complète : les omettre les retirerait, et un fichier envoyé par erreur
 * deviendrait indestructible, par son auteur comme par la Function.
 */
function attachmentPermissions(uploaderId, participantA, participantB) {
  return [
    Permission.read(Role.user(participantA)),
    Permission.read(Role.user(participantB)),
    Permission.update(Role.user(uploaderId)),
    Permission.delete(Role.user(uploaderId)),
  ]
}

function asMessage(document, actorId) {
  return {
    id: document.$id,
    from: document.senderId === actorId ? 'me' : 'them',
    text: document.body,
    time: document.createdAt || document.$createdAt,
    senderId: document.senderId,
    // Une pièce jointe est décrite par quatre champs ; `kind` distingue les
    // images (aperçu inline) des autres fichiers (carte à ouvrir).
    fileId: document.fileId || '',
    fileName: document.fileName || '',
    fileSize: Number(document.fileSize || 0),
    fileType: document.fileType || '',
    kind: document.kind || 'text',
    urgent: Boolean(document.urgent),
  }
}

/**
 * Vérifie une pièce jointe auprès du Storage avant de la référencer.
 *
 * Un client pourrait sinon annoncer un `fileId` qui ne lui appartient pas — ou
 * qui n'existe pas — et la conversation afficherait une carte cassée. On lit
 * les métadonnées réelles du fichier et on refuse au-delà du plafond du bucket,
 * en s'appuyant sur la taille réelle et non sur celle déclarée par le client.
 *
 * `permissions` est renvoyé pour que l'appelant puisse vérifier la propriété du
 * fichier : le téléversement n'accorde la lecture qu'à son auteur, donc sa
 * présence dans cette liste identifie qui l'a déposé.
 */
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

/**
 * Notifie le destinataire d'un message urgent.
 *
 * L'`eventKey` rend l'opération idempotente : rejouer une livraison ne crée pas
 * une seconde notification, le récepteur la retrouvant par cette clé.
 */
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
    // Identifiant du correspondant : le client en a besoin pour donner au
    // fichier téléversé les permissions des deux participants, Appwrite
    // n'accordant au créateur que ce qu'il demande explicitement.
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
  // Clé dynamique d'Appwrite ≥ 1.6 : elle arrive dans l'en-tête `x-appwrite-key`,
  // limitée aux `scopes` déclarés sur la Function. Aucune clé serveur n'a donc à
  // être stockée en variable ; celle-ci reste lue en premier si elle existe.
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.headers['x-appwrite-key'] || '')
  const databases = new Databases(client)
  const storage = new Storage(client)
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
      // Un message peut désormais ne porter qu'un fichier : le texte devient
      // facultatif dès qu'une pièce jointe est présente, et prend alors le nom
      // du fichier comme contenu — `body` reste un attribut `required` en base.
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
      const conversation = await databases.getDocument(DATABASE_ID, 'chat_conversations', conversationId)
      if (![conversation.participantA, conversation.participantB].includes(actorId)) return json(res, { ok: false, code: 'CONVERSATION_DENIED', message: 'Cette conversation ne vous appartient pas.' }, 403)

      // La pièce jointe a été téléversée par l'expéditeur avec ses seules
      // permissions : Appwrite 1.6.1 refuse qu'un client accorde une permission
      // à un autre utilisateur — il répond
      //   « Permissions must be one of: (any, users, user:<soi>, …) », code 401.
      // Le client ne peut donc *pas* donner la lecture au destinataire, et une
      // pièce jointe envoyée depuis le mobile restait lisible par son seul
      // auteur. La Function, elle, agit avec la clé API et peut accorder les
      // deux. Le faire ici, au moment de l'envoi, évite un fichier orphelin
      // si l'utilisateur téléverse puis renonce.
      if (attachment) {
        // Le fichier doit avoir été déposé par l'expéditeur : sans ce contrôle,
        // annoncer le `fileId` d'autrui suffirait à se voir accorder `update`
        // et `delete` dessus, c'est-à-dire à pouvoir supprimer le fichier d'un
        // autre. Le téléversement n'accordant la lecture qu'à son auteur, sa
        // présence dans les permissions du fichier l'identifie.
        if (!attachment.permissions.includes(Permission.read(Role.user(actorId)))) {
          return json(res, { ok: false, code: 'ATTACHMENT_DENIED', message: 'Cette pièce jointe ne vous appartient pas.' }, 403)
        }
        // `node-appwrite` 12 attend `name` puis `permissions`, en positionnels.
        // Passer un objet `{ permissions }` en troisième position l'envoyait
        // comme `name` : Appwrite rejetait la requête, et tout envoi de pièce
        // jointe échouait en `MESSAGING_ERROR`. Un message texte, lui, traverse
        // ce bloc sans y entrer et n'était donc pas affecté.
        await storage.updateFile(
          CHAT_FILES_BUCKET,
          attachment.fileId,
          attachment.fileName,
          attachmentPermissions(actorId, conversation.participantA, conversation.participantB),
        )
      }

      const now = new Date().toISOString()
      const message = await databases.createDocument(DATABASE_ID, 'chat_messages', ID.unique(), {
        conversationId,
        senderId: actorId,
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
      // La notification ne doit jamais faire échouer l'envoi : le message est
      // déjà écrit, et une erreur ici priverait l'expéditeur de sa réponse.
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

    // Notifications de l'utilisateur courant. Elles sont lues par la Function
    // plutôt que directement par le client : la liste reste ainsi filtrée sur
    // `ownerId`, et un compte ne peut pas remonter celles d'un autre en
    // falsifiant une requête.
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
      // Sans identifiant, on marque tout comme lu : c'est l'action « tout lire ».
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
    if (['ACTOR_DENIED', 'CONTACT_NOT_FOUND', 'CONVERSATION_DENIED'].includes(message)) {      const denial = message === 'CONVERSATION_DENIED'
        ? 'Cette conversation ne vous appartient pas.'
        : STRICT_SCOPE
          ? 'La messagerie est réservée aux comptes universitaires UY1 / ICT4D / L1.'
          : "La messagerie est réservée aux membres de l'annuaire académique (étudiant, délégué, enseignant ou administration)."
      return json(res, { ok: false, code: message, message: denial }, 403)
    }
    // Conversation absente : le document a pu être supprimé, ou l'identifiant
    // vient d'un cache client périmé. Un 404 explicite vaut mieux que le
    // « La messagerie Appwrite a échoué » générique, qui n'indique rien.
    if (Number(exception?.code) === 404) {
      return json(res, { ok: false, code: 'CONVERSATION_NOT_FOUND', message: 'Cette conversation n’existe plus.' }, 404)
    }
    error(`messaging action=${body.action || 'unknown'} failed=${message || 'unknown'}`)
    return json(res, { ok: false, code: 'MESSAGING_ERROR', message: 'La messagerie Appwrite a échoué.' }, 400)
  }
}
