import { Client, Databases, Query, ID, Permission, Role } from 'node-appwrite'
import { DATABASE_ID, isAdministrator, resolveCaller } from '../lib/caller.js'

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function bodyOf(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

export default async function newsService({ req, res, log, error }) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

  const databases = new Databases(client)
  const body = bodyOf(req)
  const action = body.action || 'list'

  // 1. LISTER LES ACTUALITÉS (Accessible à tous les utilisateurs)
  if (action === 'list') {
    try {
      const posts = await databases.listDocuments(DATABASE_ID, 'forum_posts', [
        Query.equal('category', 'Actualités'),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]).catch(() => ({ documents: [] }))

      const news = posts.documents.map(d => ({
        id: d.$id,
        title: d.title,
        content: d.content,
        channel: d.university || 'Administration UY1',
        icon: d.role === 'ADMIN' ? '🏛️' : '📢',
        color: '#1E3A8A',
        author: d.authorName || 'Administration',
        createdAt: d.createdAt || d.$createdAt,
        important: Boolean(d.likes && d.likes > 0),
        pinned: Boolean(d.rating && d.rating > 0),
      }))

      return json(res, { ok: true, news })
    } catch (err) {
      error?.(`Erreur chargement actualités: ${err.message}`)
      return json(res, { ok: false, error: err.message }, 500)
    }
  }

  // 1b. LISTER LES STATUTS (Accessible à tous les utilisateurs)
  if (action === 'list-statuses') {
    try {
      const posts = await databases.listDocuments(DATABASE_ID, 'forum_posts', [
        Query.equal('category', 'Statuts'),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]).catch(() => ({ documents: [] }))

      const now = Date.now()
      const maxAgeMs = 48 * 60 * 60 * 1000

      const statuses = posts.documents
        .filter(d => {
          const createdTime = new Date(d.createdAt || d.$createdAt).getTime()
          return !isNaN(createdTime) && (now - createdTime < maxAgeMs)
        })
        .map(d => ({
          id: d.$id,
          userId: d.authorId,
          name: d.authorName,
          content: d.content,
          role: d.role,
          preview: d.title || d.content,
          createdAt: d.createdAt || d.$createdAt,
        }))

      return json(res, { ok: true, statuses })
    } catch (err) {
      error?.(`Erreur chargement statuts: ${err.message}`)
      return json(res, { ok: false, error: err.message }, 500)
    }
  }

  // 1c. PUBLIER UN STATUT (Accessible à tout utilisateur connecté)
  if (action === 'post-status') {
    const callerUser = await resolveCaller(req, databases).catch(() => null)
    if (!callerUser) {
      return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion requise pour publier un statut.' }, 401)
    }
    const { content, preview } = body
    if (!content || !content.trim()) {
      return json(res, { ok: false, message: 'Le contenu du statut ne peut pas être vide.' }, 400)
    }

    try {
      const permissions = [
        Permission.read(Role.any()),
        Permission.update(Role.user(callerUser.userId)),
        Permission.delete(Role.user(callerUser.userId)),
      ]

      const doc = await databases.createDocument(
        DATABASE_ID,
        'forum_posts',
        ID.unique(),
        {
          authorId: callerUser.userId,
          authorName: callerUser.name || 'Utilisateur UniFlow',
          role: callerUser.role || 'STUDENT',
          university: 'UniFlow',
          title: (preview || content).slice(0, 255),
          content: content.slice(0, 1000),
          category: 'Statuts',
          rating: 0,
          likes: 0,
          createdAt: new Date().toISOString(),
        },
        permissions
      )

      return json(res, {
        ok: true,
        message: 'Statut publié avec succès !',
        status: {
          id: doc.$id,
          userId: doc.authorId,
          name: doc.authorName,
          content: doc.content,
          preview: doc.title,
          createdAt: doc.createdAt,
        }
      })
    } catch (err) {
      error?.(`Erreur création statut: ${err.message}`)
      return json(res, { ok: false, error: err.message }, 500)
    }
  }

  // Vérification des privilèges Administrateur pour la gestion
  const caller = await resolveCaller(req, databases).catch(() => null)
  if (!isAdministrator(caller)) {
    return json(res, { ok: false, code: 'FORBIDDEN', message: 'Seul l’administrateur peut publier des actualités ou envoyer des notifications groupées.' }, 403)
  }

  // 2. CRÉER UNE ACTUALITÉ (Réservé Admin)
  if (action === 'create') {
    const { title, content, channel = 'Administration UY1', important = false, pinned = false } = body
    if (!title || !content) {
      return json(res, { ok: false, code: 'INVALID_INPUT', message: 'Titre et contenu obligatoires.' }, 400)
    }

    try {
      const permissions = [
        Permission.read(Role.any()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]

      const doc = await databases.createDocument(
        DATABASE_ID,
        'forum_posts',
        ID.unique(),
        {
          authorId: caller.userId,
          authorName: caller.name || 'Administration UniFlow',
          role: 'ADMIN',
          university: channel.slice(0, 255),
          title: title.slice(0, 255),
          content: content.slice(0, 5000),
          category: 'Actualités',
          rating: pinned ? 1 : 0,
          likes: important ? 1 : 0,
          createdAt: new Date().toISOString(),
        },
        permissions
      )

      return json(res, {
        ok: true,
        message: 'Actualité publiée avec succès.',
        news: {
          id: doc.$id,
          title: doc.title,
          content: doc.content,
          channel: doc.university,
          author: doc.authorName,
          createdAt: doc.createdAt,
          pinned,
          important,
        }
      })
    } catch (err) {
      error?.(`Erreur création actualité: ${err.message}`)
      return json(res, { ok: false, error: err.message }, 500)
    }
  }

  // 3. SUPPRIMER UNE ACTUALITÉ (Réservé Admin)
  if (action === 'delete') {
    const { id } = body
    if (!id) return json(res, { ok: false, message: 'Identifiant requis.' }, 400)

    try {
      await databases.deleteDocument(DATABASE_ID, 'forum_posts', id)
      return json(res, { ok: true, message: 'Actualité supprimée.' })
    } catch (err) {
      return json(res, { ok: false, error: err.message }, 500)
    }
  }

  // 4. DIFFUSION DE NOTIFICATIONS GROUPÉES PAR TYPE DE USER (Réservé Admin)
  if (action === 'broadcast-notification') {
    const { targetGroup = 'ALL', title, message, type = 'ANNOUNCEMENT', link = '' } = body
    if (!title || !message) {
      return json(res, { ok: false, code: 'INVALID_INPUT', message: 'Titre et message obligatoires.' }, 400)
    }

    try {
      // Trouver les utilisateurs cibles
      let targetUserIds = []

      if (targetGroup === 'ALL') {
        const usersList = await databases.listDocuments(DATABASE_ID, 'users', [Query.limit(500)]).catch(() => ({ documents: [] }))
        targetUserIds = usersList.documents.map(u => u.$id)
      } else if (targetGroup === 'PERSONAL') {
        const usersList = await databases.listDocuments(DATABASE_ID, 'users', [
          Query.equal('accountType', 'PERSONAL'),
          Query.limit(500),
        ]).catch(() => ({ documents: [] }))
        targetUserIds = usersList.documents.map(u => u.$id)
      } else {
        // Cible par rôle académique (STUDENT, TEACHER, DELEGATE)
        const directoryList = await databases.listDocuments(DATABASE_ID, 'academic_directory', [
          Query.equal('role', targetGroup),
          Query.limit(500),
        ]).catch(() => ({ documents: [] }))
        targetUserIds = directoryList.documents.map(d => d.userId || d.$id).filter(Boolean)
      }

      // Si aucun utilisateur trouvé, envoyer à l'administrateur comme confirmation
      if (targetUserIds.length === 0) {
        targetUserIds = [caller.userId]
      }

      // Création des notifications pour les utilisateurs cibles
      let sentCount = 0
      const now = new Date().toISOString()
      const eventKey = `broadcast_${Date.now()}`

      await Promise.allSettled(
        targetUserIds.map(async (targetId) => {
          try {
            await databases.createDocument(
              DATABASE_ID,
              'notifications',
              ID.unique(),
              {
                ownerId: targetId,
                type: type.slice(0, 100),
                title: title.slice(0, 255),
                message: message.slice(0, 5000),
                isRead: false,
                createdAt: now,
                eventKey,
                link: (link || '').slice(0, 255),
              },
              [
                Permission.read(Role.user(targetId)),
                Permission.update(Role.user(targetId)),
                Permission.delete(Role.user(targetId)),
              ]
            )
            sentCount++
          } catch (e) {
            // Ignorer individuellement
          }
        })
      )

      return json(res, {
        ok: true,
        message: `Notification push envoyée avec succès à ${sentCount} utilisateur(s) du groupe [${targetGroup}].`,
        sentCount,
        targetGroup,
      })
    } catch (err) {
      error?.(`Erreur diffusion notification: ${err.message}`)
      return json(res, { ok: false, error: err.message }, 500)
    }
  }

  return json(res, { ok: false, message: `Action non reconnue : ${action}` }, 400)
}
