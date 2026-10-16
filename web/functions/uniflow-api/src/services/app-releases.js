/**
 * Service `/app-releases` — liens de téléchargement des applications UniFlow
 * (APK Android publié dans les releases GitHub de `KERNEL-FORGE-G/uniflow-apps`,
 * puis les binaires desktop).
 *
 * Pourquoi une Function alors que la collection `app_releases` est lisible par
 * tous : **l'écriture**. Le lien est celui que des inconnus téléchargent depuis
 * la landing ; la collection n'accorde donc aucune écriture au niveau
 * collection ni document, et seul l'admin de la plateforme (label
 * `superadmin`, `kernel@forge.codes`) peut le changer ici, avec la clé
 * dynamique de la Function. Un `ADMIN` d'université est refusé (403) : il gère
 * son université, pas la plateforme.
 *
 * Actions :
 * - `list`   : public. Rend les releases publiées (`enabled`), Android en
 *              premier ; un superadmin qui passe `all: true` les voit toutes,
 *              pour rééditer un lien dépublié depuis la page admin.
 * - `upsert` : superadmin. Valide (`lib/app-releases.js`) puis écrit le
 *              document dont l'identifiant est la plateforme : `update`, sinon
 *              `create` (404). Aucune requête préalable, aucun doublon possible.
 */

import { Client, Databases, Permission, Role, Users } from 'node-appwrite'
import { DATABASE_ID, resolveCaller } from '../lib/caller.js'
import { RELEASE_COLLECTION, ReleaseValidationError, normalizeRelease, releaseView, visibleReleases } from '../lib/app-releases.js'

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

/** La collection a `documentSecurity: true` : sans ce `read("any")` porté par
 *  le document, la landing publique (sans session) ne le verrait pas. */
const publicRead = [Permission.read(Role.any())]

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.headers['x-appwrite-key'] || '')
  const databases = new Databases(client)
  const users = new Users(client)
  const body = parseBody(req)
  const action = typeof body.action === 'string' ? body.action : 'unknown'

  try {
    log(`app_releases action=${action}`)

    if (action === 'list') {
      // L'appelant est facultatif : un visiteur anonyme lit la liste publique.
      // Une identité illisible (compte supprimé…) ne doit pas casser la
      // landing : on retombe sur la vue publique.
      let caller = null
      try { caller = await resolveCaller(req, users, null) } catch { caller = null }
      const includeDisabled = body.all === true && caller?.isSuperAdmin === true
      const page = await databases.listDocuments(DATABASE_ID, RELEASE_COLLECTION)
      return json(res, { ok: true, action, releases: visibleReleases(page.documents, { includeDisabled }), includeDisabled })
    }

    if (action !== 'upsert') {
      return json(res, { ok: false, code: 'ACTION_UNKNOWN', message: 'Action inconnue : attendu « list » ou « upsert ».' }, 400)
    }

    const caller = await resolveCaller(req, users, null)
    if (!caller) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }, 401)
    if (!caller.isSuperAdmin) {
      return json(res, {
        ok: false,
        code: 'SUPERADMIN_REQUIRED',
        message: 'Les liens de téléchargement sont un réglage de la plateforme, réservé à l’administrateur KERNEL FORGE.',
      }, 403)
    }

    const release = normalizeRelease(body)
    let document
    try {
      document = await databases.updateDocument(DATABASE_ID, RELEASE_COLLECTION, release.platform, release, publicRead)
    } catch (exception) {
      if (Number(exception?.code) !== 404) throw exception
      document = await databases.createDocument(DATABASE_ID, RELEASE_COLLECTION, release.platform, release, publicRead)
    }
    log(`app_releases upsert platform=${release.platform} version=${release.version} enabled=${release.enabled} by=${caller.userId}`)
    return json(res, { ok: true, action, release: releaseView(document) })
  } catch (exception) {
    const invalid = exception instanceof ReleaseValidationError
    error(`app_releases action=${action} failed=${exception?.message || 'unknown'}`)
    return json(res, {
      ok: false,
      code: invalid ? exception.code : 'APP_RELEASES_ERROR',
      message: invalid ? exception.message : (exception?.message || 'La mise à jour du lien de téléchargement a échoué.'),
    }, invalid ? 400 : 500)
  }
}
