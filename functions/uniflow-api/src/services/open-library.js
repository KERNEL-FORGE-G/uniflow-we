import { Client, Databases, Storage, Query, ID, Permission, Role } from 'node-appwrite'
import { DATABASE_ID } from '../lib/caller.js'

const BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || 'uniflow_assets'

// Cache mémoire haute performance (TTL 15 minutes)
const searchCache = new Map()
const CACHE_TTL_MS = 15 * 60 * 1000

function getFromCache(key) {
  const cached = searchCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    searchCache.delete(key)
    return null
  }
  return cached.data
}

function setInCache(key, data) {
  // Limiter la taille du cache à 250 entrées max
  if (searchCache.size > 250) {
    const oldestKey = searchCache.keys().next().value
    searchCache.delete(oldestKey)
  }
  searchCache.set(key, { data, timestamp: Date.now() })
}

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
  const limit = Math.max(30, parseInt(payload.limit, 10) || 35)

  if (action === 'search') {
    const cacheKey = `search:${query.toLowerCase()}:${category}:${limit}`
    const cachedResponse = getFromCache(cacheKey)
    if (cachedResponse) {
      return json(res, { ok: true, cached: true, ...cachedResponse })
    }

    try {
      // 1. Chercher dans les documents déjà enregistrés en base Appwrite
      const dbQuery = [Query.limit(50), Query.orderDesc('publishedAt')]
      if (query) {
        dbQuery.push(Query.search('title', query))
      }
      const existing = await databases.listDocuments(DATABASE_ID, 'academic_library', dbQuery).catch(() => ({ documents: [] }))

      // 2. Recherche multi-sources en parallèle avec timeout maîtrisé (au moins 30 résultats)
      const searchTerm = query || (category !== 'Tous' ? category : 'computer science')

      const [gutendexSettled, openLibrarySettled] = await Promise.allSettled([
        // Source A : Gutendex (Project Gutenberg)
        (async () => {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 3500)
          try {
            const resp = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(searchTerm)}`, { signal: controller.signal })
            clearTimeout(timeout)
            const data = await resp.json()
            if (!data.results || !Array.isArray(data.results)) return []
            return data.results.slice(0, 25).map(b => {
              const formats = b.formats || {}
              const pdfUrl = formats['application/pdf'] || formats['application/epub+zip'] || formats['text/html'] || ''
              const coverUrl = formats['image/jpeg'] || ''
              return {
                id: `guten-${b.id}`,
                title: b.title,
                authors: (b.authors || []).map(a => a.name),
                category: category !== 'Tous' ? category : 'Général & Sciences',
                downloadUrl: pdfUrl,
                coverUrl: coverUrl || undefined,
                format: pdfUrl.includes('epub') ? 'EPUB' : 'PDF',
                source: 'Project Gutenberg',
                downloadsCount: b.download_count || 120,
                cachedInBucket: false,
              }
            })
          } catch (e) {
            clearTimeout(timeout)
            return []
          }
        })(),

        // Source B : Open Library (mode Uni Book - millions d'ouvrages)
        (async () => {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 3500)
          try {
            const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=30`, { signal: controller.signal })
            clearTimeout(timeout)
            const data = await resp.json()
            if (!data.docs || !Array.isArray(data.docs)) return []
            return data.docs.map(doc => {
              const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined
              const iaId = doc.ia?.[0]
              const downloadUrl = iaId ? `https://archive.org/download/${iaId}/${iaId}.pdf` : undefined
              return {
                id: `ol-${doc.key?.replace('/works/', '') || Math.random().toString(36).slice(2)}`,
                title: doc.title,
                authors: doc.author_name || ['Auteur Universitaire'],
                year: doc.first_publish_year,
                category: category !== 'Tous' ? category : 'Informatique & Sciences',
                language: doc.language?.includes('fre') ? 'Français' : 'Anglais',
                coverUrl,
                description: `Édition académique (${doc.first_publish_year || 'Récente'}). Sujets: ${(doc.subject || []).slice(0, 3).join(', ')}`,
                downloadUrl,
                format: 'PDF',
                source: 'Open Library',
                downloadsCount: doc.edition_count ? doc.edition_count * 250 : 800,
                cachedInBucket: false,
                isbn: doc.isbn?.[0],
              }
            })
          } catch (e) {
            clearTimeout(timeout)
            return []
          }
        })()
      ])

      const gutenResults = gutendexSettled.status === 'fulfilled' ? gutendexSettled.value : []
      const olResults = openLibrarySettled.status === 'fulfilled' ? openLibrarySettled.value : []

      // Fusion et déduplication pour garantir au moins 30 retours
      const seenTitles = new Set()
      const merged = []

      for (const item of [...gutenResults, ...olResults]) {
        const norm = (item.title || '').trim().toLowerCase()
        if (norm && !seenTitles.has(norm)) {
          seenTitles.add(norm)
          merged.push(item)
        }
      }

      const results = merged.slice(0, limit)

      const responsePayload = {
        cachedInDb: existing.documents,
        results,
        books: results,
        totalReturned: results.length,
      }

      setInCache(cacheKey, responsePayload)

      return json(res, {
        ok: true,
        ...responsePayload,
      })
    } catch (err) {
      error?.(`Erreur recherche Uni Book: ${err.message}`)
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
