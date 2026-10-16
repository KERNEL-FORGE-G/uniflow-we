/**
 * Liens de téléchargement des applications UniFlow (service `/app-releases`).
 *
 * L'APK Android est publié dans les releases GitHub du dépôt public
 * `KERNEL-FORGE-G/uniflow-apps` et l'URL change à chaque version : rien n'est
 * codé en dur ici, la landing lit la collection `app_releases` et l'admin de la
 * plateforme la met à jour depuis Paramètres. Tant qu'aucun document n'existe,
 * le site renvoie vers la page des releases (`releaseFallbackUrl`).
 */

export const RELEASE_PLATFORMS = ['android', 'windows', 'linux', 'macos'] as const
export type ReleasePlatform = (typeof RELEASE_PLATFORMS)[number]

export const RELEASE_PLATFORM_LABELS: Record<ReleasePlatform, string> = {
  android: 'Android',
  windows: 'Windows',
  linux: 'Linux',
  macos: 'macOS',
}

/** Plateformes servies par l'application de bureau. */
export const DESKTOP_PLATFORMS: ReleasePlatform[] = ['windows', 'linux', 'macos']

export type AppRelease = {
  platform: ReleasePlatform
  version: string
  url: string
  fileName: string
  sizeBytes: number
  sha256: string
  notes: string
  publishedAt: string | null
  enabled: boolean
  updatedAt: string | null
}

/** Corps de l'action `upsert` (superadmin uniquement, contrôlé par la Function). */
export type AppReleaseInput = {
  platform: ReleasePlatform
  version: string
  url: string
  fileName?: string
  sizeBytes?: number
  sha256?: string
  notes?: string
  publishedAt?: string | null
  enabled?: boolean
}

/** Page des releases GitHub : destination par défaut tant qu'aucune version n'est publiée. */
export const releaseFallbackUrl = 'https://github.com/KERNEL-FORGE-G/uniflow-apps/releases'

/** Même règle que la Function : adresse absolue en `https://`, hôte non vide, ≤ 1024 caractères. */
export function isValidReleaseUrl(value: string | null | undefined): boolean {
  const candidate = typeof value === 'string' ? value.trim() : ''
  if (!candidate || candidate.length > 1024 || !/^https:\/\//i.test(candidate)) return false
  try {
    const parsed = new URL(candidate)
    return parsed.protocol === 'https:' && Boolean(parsed.hostname)
  } catch {
    return false
  }
}

export function isValidSha256(value: string | null | undefined): boolean {
  const candidate = typeof value === 'string' ? value.trim() : ''
  return candidate === '' || /^[0-9a-f]{64}$/i.test(candidate)
}

const UNIT = 1024
const UNITS = ['o', 'Ko', 'Mo', 'Go', 'To'] as const

function frenchNumber(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',').replace(/,0+$/, '')
}

/**
 * « 44 355 174 » → « 42,3 Mo ». Base 1024, comme `ls -lh` et le reste du site
 * (limite d'avatar en « Mo » dans `appwrite.ts`) : c'est la taille que
 * l'utilisateur voit dans son gestionnaire de fichiers. Vide si inconnue.
 */
export function formatSize(bytes: number | null | undefined): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) return ''
  if (bytes < UNIT) return `${Math.round(bytes)} o`
  let value = bytes
  let index = 0
  while (value >= UNIT && index < UNITS.length - 1) {
    value /= UNIT
    index += 1
  }
  return `${frenchNumber(value, index >= 2 ? 1 : 0)} ${UNITS[index]}`
}

const SIZE_INPUT = /^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]*)$/
const UNIT_FACTORS: Record<string, number> = {
  '': 1,
  o: 1,
  b: 1,
  octet: 1,
  octets: 1,
  ko: UNIT,
  kb: UNIT,
  kio: UNIT,
  kib: UNIT,
  mo: UNIT ** 2,
  mb: UNIT ** 2,
  mio: UNIT ** 2,
  mib: UNIT ** 2,
  go: UNIT ** 3,
  gb: UNIT ** 3,
  gio: UNIT ** 3,
  gib: UNIT ** 3,
}

/**
 * Saisie libre de la page admin : « 44355174 » (octets), « 42,3 Mo »,
 * « 35.4 MB », « 512 Ko »… → octets entiers. `null` si illisible, `0` si vide.
 */
export function parseSizeInput(value: string | null | undefined): number | null {
  const raw = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
  if (!raw) return 0
  const compact = raw.replace(/(\d)[\s\u00a0\u202f](?=\d{3}\b)/g, '$1')
  const match = SIZE_INPUT.exec(compact)
  if (!match) return null
  const amount = Number(match[1].replace(',', '.'))
  const factor = UNIT_FACTORS[match[2].toLowerCase()]
  if (!Number.isFinite(amount) || amount < 0 || factor === undefined) return null
  return Math.round(amount * factor)
}

function isPlatform(value: unknown): value is ReleasePlatform {
  return typeof value === 'string' && (RELEASE_PLATFORMS as readonly string[]).includes(value)
}

export function sanitizeReleases(list: unknown): AppRelease[] {
  if (!Array.isArray(list)) return []
  return list
    .filter((item): item is AppRelease => Boolean(item) && typeof item === 'object' && isPlatform((item as AppRelease).platform))
    .map((item) => ({
      platform: item.platform,
      version: String(item.version || ''),
      url: String(item.url || ''),
      fileName: String(item.fileName || ''),
      sizeBytes: Number.isFinite(Number(item.sizeBytes)) ? Math.max(0, Number(item.sizeBytes)) : 0,
      sha256: String(item.sha256 || ''),
      notes: String(item.notes || ''),
      publishedAt: typeof item.publishedAt === 'string' ? item.publishedAt : null,
      enabled: item.enabled !== false,
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : null,
    }))
    .sort((a, b) => RELEASE_PLATFORMS.indexOf(a.platform) - RELEASE_PLATFORMS.indexOf(b.platform))
}

export const CACHE_KEY = 'uniflow:app-releases'

export function readCachedReleases(storage: Pick<Storage, 'getItem'> | undefined): AppRelease[] | null {
  try {
    const raw = storage?.getItem(CACHE_KEY)
    return raw ? sanitizeReleases(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

/** La release publiée d'une plateforme, ou `null`. */
export function findRelease(releases: AppRelease[] | undefined, platform: ReleasePlatform): AppRelease | null {
  return releases?.find((release) => release.platform === platform && release.enabled && isValidReleaseUrl(release.url)) ?? null
}

/** Première release desktop publiée (Windows, puis Linux, puis macOS). */
export function findDesktopRelease(releases: AppRelease[] | undefined): AppRelease | null {
  for (const platform of DESKTOP_PLATFORMS) {
    const release = findRelease(releases, platform)
    if (release) return release
  }
  return null
}

/** Saisie du formulaire admin, telle que tapée (la taille reste une chaîne libre). */
export type ReleaseFormState = {
  url: string
  version: string
  fileName: string
  size: string
  sha256: string
  notes: string
  enabled: boolean
}

export const emptyReleaseForm: ReleaseFormState = { url: '', version: '', fileName: '', size: '', sha256: '', notes: '', enabled: true }

/** Formulaire pré-rempli depuis le document serveur (taille en octets bruts, éditables). */
export function releaseFormFrom(release: AppRelease | null): ReleaseFormState {
  if (!release) return emptyReleaseForm
  return {
    url: release.url,
    version: release.version,
    fileName: release.fileName,
    size: release.sizeBytes > 0 ? String(release.sizeBytes) : '',
    sha256: release.sha256,
    notes: release.notes,
    enabled: release.enabled,
  }
}

/**
 * Premier problème de saisie, ou `null` si le formulaire est envoyable. Mêmes
 * règles que la Function (`normalizeRelease`), vérifiées avant l'appel pour un
 * message immédiat.
 */
export function releaseFormProblem(form: ReleaseFormState): string | null {
  if (!form.version.trim()) return 'Indiquez la version (ex. 1.2.0).'
  if (form.version.trim().length > 32) return 'La version dépasse 32 caractères.'
  if (!isValidReleaseUrl(form.url)) return 'L’URL doit être une adresse complète en https:// (lien direct vers le fichier de la release GitHub).'
  if (parseSizeInput(form.size) === null) return 'Taille illisible : saisissez des octets (44355174) ou une valeur avec unité (42,3 Mo).'
  if (!isValidSha256(form.sha256)) return 'L’empreinte SHA-256 doit compter 64 caractères hexadécimaux, ou rester vide.'
  return null
}

/** « 1.2.0 · 42,3 Mo » : sous-titre du bouton de téléchargement. */
export function releaseCaption(release: AppRelease): string {
  const size = formatSize(release.sizeBytes)
  const version = release.version ? `Version ${release.version}` : ''
  return [version, size].filter(Boolean).join(' · ')
}
