/**
 * Logique pure du service `/app-releases` : plateformes, validation d'une
 * release et vue publique d'un document. Sans dépendance, donc testable avec
 * `node --test` (le service, lui, charge `node-appwrite`) ; le script
 * `scripts/set-app-release.mjs` réutilise la même validation pour que la
 * ligne de commande et la page admin refusent exactement les mêmes entrées.
 */

export const RELEASE_COLLECTION = 'app_releases'
/** Un document par plateforme ; l'identifiant du document est la plateforme. */
export const RELEASE_PLATFORMS = ['android', 'windows', 'linux', 'macos']

const MAX = { version: 32, url: 1024, fileName: 255, sha256: 64, notes: 2000 }

export class ReleaseValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ReleaseValidationError'
    this.code = 'RELEASE_INVALID'
  }
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * L'URL doit être absolue et en `https://` : le lien est proposé à des
 * inconnus sur la landing et ouvert d'un clic — pas de `http://`, de `javascript:`
 * ni de chemin relatif. `new URL` rejette aussi les hôtes vides (« https:// »).
 */
export function isValidReleaseUrl(value) {
  const candidate = text(value)
  if (!candidate || candidate.length > MAX.url || !/^https:\/\//i.test(candidate)) return false
  try {
    const parsed = new URL(candidate)
    return parsed.protocol === 'https:' && Boolean(parsed.hostname)
  } catch {
    return false
  }
}

/** Empreinte SHA-256 : 64 caractères hexadécimaux, ou vide (non fournie). */
export function isValidSha256(value) {
  const candidate = text(value)
  return candidate === '' || /^[0-9a-f]{64}$/i.test(candidate)
}

function parseSizeBytes(value) {
  if (value === undefined || value === null || value === '') return 0
  const number = typeof value === 'number' ? value : Number(String(value).trim())
  if (!Number.isInteger(number) || number < 0) return null
  return number
}

function parsePublishedAt(value) {
  if (value === undefined || value === null || value === '') return null
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/**
 * Normalise et valide l'entrée d'un `upsert`. Lève `ReleaseValidationError`
 * (code `RELEASE_INVALID`) avec un message lisible : c'est ce que la page admin
 * affiche dans son toast.
 *
 * @param {object} input champs libres (corps de requête ou arguments CLI)
 * @param {{ now?: () => Date }} [options] horloge injectable pour les tests
 */
export function normalizeRelease(input, options = {}) {
  const body = input && typeof input === 'object' ? input : {}
  const now = typeof options.now === 'function' ? options.now : () => new Date()

  const platform = text(body.platform).toLowerCase()
  if (!RELEASE_PLATFORMS.includes(platform)) {
    throw new ReleaseValidationError(`Plateforme inconnue : « ${platform || '∅'} ». Attendu : ${RELEASE_PLATFORMS.join(', ')}.`)
  }

  const version = text(body.version)
  if (!version) throw new ReleaseValidationError('La version est requise (ex. « 1.2.0 »).')
  if (version.length > MAX.version) throw new ReleaseValidationError(`La version dépasse ${MAX.version} caractères.`)

  const url = text(body.url)
  if (!isValidReleaseUrl(url)) throw new ReleaseValidationError('L’URL de téléchargement doit être une adresse complète en https://.')

  const fileName = text(body.fileName)
  if (fileName.length > MAX.fileName) throw new ReleaseValidationError(`Le nom de fichier dépasse ${MAX.fileName} caractères.`)

  const sizeBytes = parseSizeBytes(body.sizeBytes)
  if (sizeBytes === null) throw new ReleaseValidationError('La taille doit être un nombre entier d’octets, positif ou nul.')

  const sha256 = text(body.sha256).toLowerCase()
  if (!isValidSha256(sha256)) throw new ReleaseValidationError('L’empreinte SHA-256 doit compter 64 caractères hexadécimaux (ou rester vide).')

  const notes = text(body.notes)
  if (notes.length > MAX.notes) throw new ReleaseValidationError(`Les notes dépassent ${MAX.notes} caractères.`)

  const publishedAt = parsePublishedAt(body.publishedAt)
  if (publishedAt === undefined) throw new ReleaseValidationError('La date de publication est invalide.')

  // `enabled` absent = publié : c'est le cas nominal (le script CLI ne le
  // passe que pour dépublier). Une chaîne « false » venue d'un formulaire
  // vaut faux.
  const enabled = body.enabled === undefined || body.enabled === null
    ? true
    : body.enabled === true || body.enabled === 'true' || body.enabled === 1 || body.enabled === '1'

  return {
    platform,
    version,
    url,
    fileName,
    sizeBytes,
    sha256,
    notes,
    // Sans date fournie, la publication est datée de maintenant.
    publishedAt: publishedAt || now().toISOString(),
    enabled,
  }
}

/**
 * Vue renvoyée aux clients : les champs métier plus la date de mise à jour
 * Appwrite, sans les permissions ni les métadonnées internes.
 */
export function releaseView(document) {
  if (!document || typeof document !== 'object') return null
  return {
    platform: text(document.platform) || text(document.$id),
    version: text(document.version),
    url: text(document.url),
    fileName: text(document.fileName),
    sizeBytes: Number.isFinite(Number(document.sizeBytes)) ? Math.max(0, Number(document.sizeBytes)) : 0,
    sha256: text(document.sha256),
    notes: text(document.notes),
    publishedAt: typeof document.publishedAt === 'string' ? document.publishedAt : null,
    enabled: document.enabled !== false,
    updatedAt: typeof document.$updatedAt === 'string' ? document.$updatedAt : null,
  }
}

/**
 * Filtre de `list` : le public ne voit que les releases publiées ; le
 * superadmin les voit toutes (la page admin doit pouvoir rééditer un lien
 * dépublié). Tri dans l'ordre de `RELEASE_PLATFORMS` (Android en premier).
 */
export function visibleReleases(documents, { includeDisabled = false } = {}) {
  const list = Array.isArray(documents) ? documents : []
  return list
    .filter((document) => RELEASE_PLATFORMS.includes(text(document?.platform || document?.$id)))
    .filter((document) => includeDisabled || document.enabled !== false)
    .map(releaseView)
    .sort((a, b) => RELEASE_PLATFORMS.indexOf(a.platform) - RELEASE_PLATFORMS.indexOf(b.platform))
}
