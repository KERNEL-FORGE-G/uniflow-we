import { Client, Databases, Storage, Query, ID, Permission, Role } from 'node-appwrite'
import { DATABASE_ID } from '../lib/caller.js'

const BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || 'uniflow_assets'

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

export default async function openLibraryService({ req, res, log, error }) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

  const databases = new Databases(client)
  const storage = new Storage(client)

  let payload = {}
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    payload = {}
  }

  const action = payload.action || 'search'
  const query = (payload.query || '').trim()
  const category = payload.category || 'Tous'

  if (action === 'search') {
    try {
      // 1. Chercher dans les documents déjà enregistrés en base
      const dbQuery = [Query.limit(50), Query.orderDesc('publishedAt')]
      if (query) {
        dbQuery.push(Query.search('title', query))
      }
      const existing = await databases.listDocuments(DATABASE_ID, 'academic_library', dbQuery).catch(() => ({ documents: [] }))

      // 2. Recherche Gutendex
      let externalResults = []
      const searchTerm = query || (category !== 'Tous' ? category : 'computer')
      try {
        const gutendexRes = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(searchTerm)}`)
        const data = await gutendexRes.json()
        if (data.results && Array.isArray(data.results)) {
          externalResults = data.results.slice(0, 10).map(b => ({
            id: `guten-${b.id}`,
            title: b.title,
            authors: (b.authors || []).map(a => a.name),
            category: category !== 'Tous' ? category : 'Général',
            downloadUrl: b.formats?.['application/pdf'] || b.formats?.['application/epub+zip'] || b.formats?.['text/html'] || '',
            format: 'PDF',
            source: 'Project Gutenberg',
            downloadsCount: b.download_count || 100,
            cachedInBucket: false,
          }))
        }
      } catch (err) {
        log?.(`Gutendex fetch warning: ${err.message}`)
      }

      return json(res, {
        ok: true,
        cachedInDb: existing.documents,
        results: externalResults,
      })
    } catch (err) {
      error?.(`Erreur recherche bibliothèque: ${err.message}`)
      return json(res, { ok: false, error: err.message }, 500)
    }
  }

  if (action === 'cache-to-bucket') {
    const { title, downloadUrl, format = 'PDF', docId } = payload
    if (!title || !downloadUrl) {
      return json(res, { ok: false, error: 'Titre et downloadUrl requis.' }, 400)
    }

    try {
      const response = await fetch(downloadUrl)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const fileName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35)}.${format.toLowerCase()}`
      const file = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        new File([buffer], fileName, { type: 'application/pdf' }),
        [Permission.read(Role.any()), Permission.read(Role.users())]
      )

      if (docId) {
        await databases.updateDocument(DATABASE_ID, 'academic_library', docId, {
          fileId: file.$id,
        })
      }

      return json(res, {
        ok: true,
        fileId: file.$id,
        downloadUrl: `${process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'}/storage/buckets/${BUCKET_ID}/files/${file.$id}/download?project=${process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID}`,
      })
    } catch (err) {
      error?.(`Erreur mise en bucket: ${err.message}`)
      return json(res, { ok: false, error: err.message }, 500)
    }
  }

  return json(res, { ok: false, message: `Action non reconnue: ${action}` }, 400)
}
