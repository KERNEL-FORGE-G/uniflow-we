import { Client, Databases, ID, Permission, Query, Role } from 'node-appwrite'

const DATABASE_ID = 'uniflow'

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

function cleanPostId(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 36) throw new Error('POST_INVALID')
  return value.trim()
}

function reactionPermissions(userId) {
  return [Permission.read(Role.user(userId)), Permission.delete(Role.user(userId))]
}

async function synchronizeLikes(databases, postId) {
  const reactions = await databases.listDocuments(DATABASE_ID, 'forum_reactions', [Query.equal('postId', postId), Query.limit(500)])
  const likes = reactions.total
  await databases.updateDocument(DATABASE_ID, 'forum_posts', postId, { likes })
  return likes
}

export default async ({ req, res, error }) => {
  const actorId = actorIdOf(req)
  if (!actorId) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connectez-vous avec un compte UniFlow pour réagir dans le forum.' }, 401)

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  const databases = new Databases(client)
  const body = bodyOf(req)

  try {
    if (body.action === 'list') {
      const rows = await databases.listDocuments(DATABASE_ID, 'forum_reactions', [Query.equal('userId', actorId), Query.limit(200)])
      return json(res, { ok: true, action: 'list', reactedPostIds: rows.documents.map((row) => row.postId) })
    }

    if (body.action === 'react') {
      const postId = cleanPostId(body.postId)
      await databases.getDocument(DATABASE_ID, 'forum_posts', postId)
      const existing = await databases.listDocuments(DATABASE_ID, 'forum_reactions', [Query.equal('postId', postId), Query.equal('userId', actorId), Query.limit(1)])
      let liked = false
      if (existing.documents[0]) {
        await databases.deleteDocument(DATABASE_ID, 'forum_reactions', existing.documents[0].$id)
      } else {
        await databases.createDocument(DATABASE_ID, 'forum_reactions', ID.unique(), { postId, userId: actorId, createdAt: new Date().toISOString() }, reactionPermissions(actorId))
        liked = true
      }
      const likes = await synchronizeLikes(databases, postId)
      return json(res, { ok: true, action: 'react', postId, liked, likes })
    }

    return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action de forum inconnue.' }, 400)
  } catch (exception) {
    const message = String(exception?.message || '')
    if (Number(exception?.code) === 404 || message === 'POST_INVALID') return json(res, { ok: false, code: 'POST_NOT_FOUND', message: 'Cette publication est introuvable ou n’est plus disponible.' }, 404)
    error(`forum-reactions action=${body.action || 'unknown'} failed=${message || 'unknown'}`)
    return json(res, { ok: false, code: 'FORUM_REACTION_ERROR', message: 'La réaction du forum n’a pas pu être enregistrée.' }, 400)
  }
}
