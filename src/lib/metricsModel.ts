/**
 * Modèle pur de la mesure d'audience côté client : détection d'appareil,
 * identifiant de visiteur, types. Sans réseau, donc testable avec `node --test` ;
 * les appels au service `/metrics` sont dans `metrics.ts`.
 *
 * Un identifiant de visiteur aléatoire vit dans `localStorage` — il ne
 * contient rien de personnel et ne sert qu'à ne pas compter deux fois la même
 * personne le même jour. Une « session » est une ouverture d'onglet
 * (`sessionStorage`) : le premier hit de la session compte une visite, les
 * suivants ne comptent que des pages vues.
 *
 * Les fonctions pures (détection d'appareil, navigateur, système) sont
 * testées avec `node --test`.
 */

export type VisitDevice = 'mobile' | 'tablet' | 'desktop' | 'other'

export const VISITOR_KEY = 'uniflow:visitor'
export const SESSION_KEY = 'uniflow:visit-session'

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function randomVisitorId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

export function visitorIdFrom(storage: StorageLike | undefined): string {
  try {
    const existing = storage?.getItem(VISITOR_KEY)
    if (existing && /^[a-zA-Z0-9_-]{8,36}$/.test(existing)) return existing
    const fresh = randomVisitorId()
    storage?.setItem(VISITOR_KEY, fresh)
    return fresh
  } catch {
    return randomVisitorId()
  }
}

/** Vrai au premier appel d'une session de navigation, faux ensuite. */
export function startSessionIfNeeded(storage: StorageLike | undefined): boolean {
  try {
    if (storage?.getItem(SESSION_KEY)) return false
    storage?.setItem(SESSION_KEY, new Date().toISOString())
    return true
  } catch {
    return true
  }
}

export function detectDevice(userAgent: string, width?: number): VisitDevice {
  const ua = userAgent || ''
  if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet'
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|Opera Mini|IEMobile/i.test(ua)) return 'mobile'
  if (/Windows|Macintosh|Linux|CrOS|X11/i.test(ua)) return 'desktop'
  if (typeof width === 'number') return width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
  return 'other'
}

export function detectBrowser(userAgent: string): string {
  const ua = userAgent || ''
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\/|Opera/i.test(ua)) return 'Opera'
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Chrome\/|CriOS\//i.test(ua)) return 'Chrome'
  if (/Safari\//i.test(ua) && /Version\//i.test(ua)) return 'Safari'
  return ua ? 'Autre' : ''
}

export function detectOs(userAgent: string): string {
  const ua = userAgent || ''
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS'
  if (/CrOS/i.test(ua)) return 'ChromeOS'
  if (/Linux|X11/i.test(ua)) return 'Linux'
  return ua ? 'Autre' : ''
}

/** Les pages qui identifient une personne (jetons de réinitialisation) ne sont pas journalisées telles quelles. */
export function normalizePath(hashOrPath: string): string {
  const raw = (hashOrPath || '/').replace(/^#/, '') || '/'
  const [path] = raw.split('?')
  return path.startsWith('/reinitialiser-mot-de-passe') ? '/reinitialiser-mot-de-passe' : path.slice(0, 255)
}

export type MetricsSummary = {
  totalVisits: number
  totalVisitors: number
  totalPageViews: number
  today: { visits: number; visitors: number; pageViews: number }
  last7Days: { visits: number; visitors: number }
  devices: { mobile: number; tablet: number; desktop: number; other: number }
  platforms: { web: number; mobile: number; desktop: number }
  daysTracked: number
}

export type MetricsDay = {
  day: string
  visits: number
  uniqueVisitors: number
  pageViews: number
  authenticated: number
  deviceMobile: number
  deviceTablet: number
  deviceDesktop: number
  deviceOther: number
  platformWeb: number
  platformMobile: number
  platformDesktop: number
}

export type RecentVisit = {
  id: string
  at: string
  lastSeen: string
  platform: 'web' | 'mobile' | 'desktop'
  device: VisitDevice
  path: string
  referrer: string
  browser: string
  os: string
  language: string
  authenticated: boolean
  pageViews: number
}

export type MetricsAdmin = { summary: MetricsSummary; series: MetricsDay[]; liveNow: number; recent: RecentVisit[] }
