/**
 * Cœur pur de la mesure d'audience (voir `services/metrics.js`) : validation
 * d'un « hit », calcul du jour, agrégation des compteurs journaliers. Testé
 * avec `node --test`.
 */

export const PLATFORMS = ['web', 'mobile', 'desktop']
export const DEVICES = ['mobile', 'tablet', 'desktop', 'other']
export const DAYS_IN_ADMIN_SERIES = 30
export const RECENT_VISITS = 60
export const LIVE_WINDOW_MS = 5 * 60 * 1000

const UUID_LIKE = /^[a-zA-Z0-9_-]{8,36}$/

function text(value, max, fallback = '') {
  if (typeof value !== 'string') return fallback
  const cleaned = value.replace(/[\u0000-\u001f]/g, '').trim()
  return cleaned ? cleaned.slice(0, max) : fallback
}

/** Jour civil au Cameroun (AAAA-MM-JJ), quel que soit le fuseau du serveur. */
export function dayKey(date = new Date(), timeZone = 'Africa/Douala') {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

/** Les [count] derniers jours, du plus ancien au plus récent, [dayKey] inclus. */
export function lastDays(count, today = new Date()) {
  const keys = []
  for (let i = count - 1; i >= 0; i -= 1) {
    keys.push(dayKey(new Date(today.getTime() - i * 86_400_000)))
  }
  return keys
}

/**
 * Nettoie un hit reçu du client. Lève `HIT_INVALID` si l'identifiant visiteur
 * ou la plateforme manquent : un client qui n'envoie pas ça n'a rien à
 * compter. Le type d'appareil inconnu retombe sur `other`.
 */
export function sanitizeHit(raw) {
  const visitorId = text(raw?.visitorId, 36)
  if (!UUID_LIKE.test(visitorId)) throw new Error('HIT_INVALID')
  const platform = PLATFORMS.includes(raw?.platform) ? raw.platform : null
  if (!platform) throw new Error('HIT_INVALID')
  return {
    visitorId,
    platform,
    device: DEVICES.includes(raw?.device) ? raw.device : 'other',
    path: text(raw?.path, 255, '/'),
    referrer: text(raw?.referrer, 255),
    browser: text(raw?.browser, 64),
    os: text(raw?.os, 64),
    language: text(raw?.language, 16),
    authenticated: raw?.authenticated === true,
    newSession: raw?.newSession !== false,
  }
}

const COUNTERS = ['visits', 'uniqueVisitors', 'pageViews', 'authenticated', 'deviceMobile', 'deviceTablet', 'deviceDesktop', 'deviceOther', 'platformWeb', 'platformMobile', 'platformDesktop']

export function emptyDaily(day) {
  return { day, ...Object.fromEntries(COUNTERS.map((key) => [key, 0])) }
}

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

/**
 * Applique un hit aux compteurs d'un jour. `firstOfDay` : première visite de
 * ce visiteur ce jour-là (compte un visiteur unique) ; `newSession` : début
 * d'une session de navigation (compte une visite et l'appareil).
 */
export function applyHit(daily, hit, { firstOfDay }) {
  const next = { ...emptyDaily(daily.day), ...daily }
  next.pageViews += 1
  if (firstOfDay) next.uniqueVisitors += 1
  if (hit.newSession) {
    next.visits += 1
    next[`device${capitalize(hit.device)}`] += 1
    next[`platform${capitalize(hit.platform)}`] += 1
    if (hit.authenticated) next.authenticated += 1
  }
  return next
}

/** Retire de l'objet tout ce qui n'est pas un compteur (métadonnées `$…`). */
export function counterPayload(daily) {
  return Object.fromEntries(['day', ...COUNTERS].map((key) => [key, daily[key] ?? (key === 'day' ? '' : 0)]))
}

/** Somme de plusieurs jours (la landing affiche les totaux ; la limite `total` d'Appwrite ne s'applique pas). */
export function sumDaily(days) {
  const total = emptyDaily('total')
  for (const day of days) for (const key of COUNTERS) total[key] += Number(day?.[key]) || 0
  return total
}

/** Résumé public : jamais de ligne brute, seulement des totaux. */
export function publicSummary(allDays, today = dayKey()) {
  const totals = sumDaily(allDays)
  const todayDoc = allDays.find((d) => d.day === today) || emptyDaily(today)
  const week = lastDays(7)
  const last7 = sumDaily(allDays.filter((d) => week.includes(d.day)))
  return {
    totalVisits: totals.visits,
    totalVisitors: totals.uniqueVisitors,
    totalPageViews: totals.pageViews,
    today: { visits: todayDoc.visits, visitors: todayDoc.uniqueVisitors, pageViews: todayDoc.pageViews },
    last7Days: { visits: last7.visits, visitors: last7.uniqueVisitors },
    devices: { mobile: totals.deviceMobile, tablet: totals.deviceTablet, desktop: totals.deviceDesktop, other: totals.deviceOther },
    platforms: { web: totals.platformWeb, mobile: totals.platformMobile, desktop: totals.platformDesktop },
    daysTracked: allDays.length,
  }
}

/** Série continue pour l'administration : un point par jour, zéro quand rien n'a été compté. */
export function adminSeries(allDays, count = DAYS_IN_ADMIN_SERIES, today = new Date()) {
  const byDay = new Map(allDays.map((d) => [d.day, d]))
  return lastDays(count, today).map((day) => counterPayload(byDay.get(day) || emptyDaily(day)))
}
