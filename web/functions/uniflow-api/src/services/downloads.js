import { Client, Databases, Permission, Role } from 'node-appwrite'
import { DATABASE_ID } from '../lib/caller.js'
import { DOWNLOAD_COLLECTION, isDownloadPlatform, summarizeDownloads } from '../lib/downloads.js'

/**
 * Service `/downloads` — compteur **réel** de téléchargements (demande du
 * 2026-10-23 : plus aucun chiffre simulé).
 *
 * - `stats` (public) : totaux lus dans `app_downloads`, 0 tant que personne
 *   n'a cliqué.
 * - `track` (public) : +1 sur la plateforme, un document par plateforme
 *   (`$id` = plateforme). Lecture-modification-écriture comme `/metrics` ;
 *   le client n'envoie qu'un clic par plateforme et par jour et par navigateur.
 */

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

async function readAll(databases) {
  const page = await databases.listDocuments(DATABASE_ID, DOWNLOAD_COLLECTION).catch(() => ({ documents: [] }))
  return summarizeDownloads(page.documents)
}

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.headers['x-appwrite-key'] || '')
  const databases = new Databases(client)
  const body = parseBody(req)
  const action = typeof body.action === 'string' ? body.action : 'stats'

  try {
    if (action === 'track') {
      if (!isDownloadPlatform(body.platform)) {
        return json(res, { ok: false, code: 'INVALID_PLATFORM', message: 'Plateforme inconnue.' }, 400)
      }
      let count = 0
      try {
        const existing = await databases.getDocument(DATABASE_ID, DOWNLOAD_COLLECTION, body.platform)
        count = Number(existing.count) || 0
        await databases.updateDocument(DATABASE_ID, DOWNLOAD_COLLECTION, body.platform, { count: count + 1 })
      } catch (exception) {
        if (exception?.code !== 404) throw exception
        await databases.createDocument(DATABASE_ID, DOWNLOAD_COLLECTION, body.platform, { platform: body.platform, count: 1 }, [Permission.read(Role.any())])
      }
      log?.(`downloads track platform=${body.platform}`)
    }
    const stats = await readAll(databases)
    return json(res, { ok: true, ...stats, generatedAt: new Date().toISOString() })
  } catch (exception) {
    error?.(`downloads: ${exception?.message || exception}`)
    return json(res, { ok: false, code: 'DOWNLOADS_FAILED', message: 'Compteur momentanément indisponible.' }, 500)
  }
}
