import { Client, Databases, ID, Query, Users } from 'node-appwrite'
import { DATABASE_ID, actorIdOf, isAdministrator, resolveCaller } from '../lib/caller.js'
import {
  DAYS_IN_ADMIN_SERIES,
  LIVE_WINDOW_MS,
  RECENT_VISITS,
  adminSeries,
  applyHit,
  counterPayload,
  dayKey,
  emptyDaily,
  publicSummary,
  sanitizeHit,
} from '../lib/metrics.js'

/**
 * Service `/metrics` — mesure d'audience maison (demande du 2026-09-21).
 *
 * - `hit` (visiteur anonyme ou connecté) : le client web envoie un hit à
 *   chaque changement de page, `newSession: true` au premier de la session ;
 *   les applications mobile et desktop envoient un hit à l'ouverture.
 * - `summary` (public) : totaux affichés sur la landing (« N visiteurs »).
 * - `admin` (administration / plateforme) : série sur 30 jours, répartition
 *   par appareil et par plateforme, dernières visites, présents à l'instant.
 *
 * Les compteurs journaliers sont mis à jour en lecture-modification-écriture :
 * à l'échelle d'UniFlow (quelques centaines de visites par jour) deux hits
 * strictement simultanés sur le même jour sont rares et ne coûtent qu'une
 * unité ; c'est le prix de rester sur `node-appwrite` 12, sans incrément
 * atomique.
 */

const VISITS = 'site_visits'
const DAILY = 'site_metrics_daily'
const CACHE_MS = 60_000

let summaryCache = { at: 0, value: null }
let dailyCache = { at: 0, value: null }

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

function bodyOf(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

async function allDaily(databases) {
  if (Date.now() - dailyCache.at < CACHE_MS && dailyCache.value) return dailyCache.value
  const days = []
  let cursor = null
  for (;;) {
    const queries = [Query.orderDesc('day'), Query.limit(100)]
    if (cursor) queries.push(Query.cursorAfter(cursor))
    const page = await databases.listDocuments(DATABASE_ID, DAILY, queries)
    days.push(...page.documents)
    if (page.documents.length < 100) break
    cursor = page.documents[page.documents.length - 1].$id
  }
  dailyCache = { at: Date.now(), value: days }
  return days
}

async function recordHit(databases, hit, log) {
  const day = dayKey()
  const existing = await databases.listDocuments(DATABASE_ID, VISITS, [
    Query.equal('visitorId', hit.visitorId),
    Query.equal('day', day),
    Query.limit(1),
  ])
  const firstOfDay = existing.total === 0
  if (firstOfDay) {
    await databases.createDocument(DATABASE_ID, VISITS, ID.unique(), {
      visitorId: hit.visitorId,
      platform: hit.platform,
      device: hit.device,
      day,
      path: hit.path,
      referrer: hit.referrer,
      browser: hit.browser,
      os: hit.os,
      language: hit.language,
      authenticated: hit.authenticated,
      pageViews: 1,
    })
  } else {
    const visit = existing.documents[0]
    await databases.updateDocument(DATABASE_ID, VISITS, visit.$id, {
      pageViews: (Number(visit.pageViews) || 0) + 1,
      // Un visiteur qui se connecte en cours de visite est compté connecté.
      authenticated: visit.authenticated || hit.authenticated,
    }).catch(() => null)
  }

  let daily
  try {
    daily = await databases.getDocument(DATABASE_ID, DAILY, day)
  } catch {
    daily = null
  }
  const next = counterPayload(applyHit(daily || emptyDaily(day), hit, { firstOfDay }))
  if (daily) {
    await databases.updateDocument(DATABASE_ID, DAILY, day, next)
  } else {
    try {
      await databases.createDocument(DATABASE_ID, DAILY, day, next)
    } catch (exception) {
      // Deux premiers hits du jour en même temps : l'autre a créé le document.
      log?.(`metrics: création du jour ${day} concurrente (${exception?.message || exception}), mise à jour`)
      const fresh = await databases.getDocument(DATABASE_ID, DAILY, day)
      await databases.updateDocument(DATABASE_ID, DAILY, day, counterPayload(applyHit(fresh, hit, { firstOfDay })))
    }
  }
  dailyCache = { at: 0, value: null }
  summaryCache = { at: 0, value: null }
  return { firstOfDay, day }
}

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.headers['x-appwrite-key'] || '')
  const databases = new Databases(client)
  const body = bodyOf(req)
  const action = typeof body.action === 'string' ? body.action : 'summary'

  try {
    if (action === 'hit') {
      let hit
      try { hit = sanitizeHit(body) } catch {
        return json(res, { ok: false, code: 'HIT_INVALID', message: 'Visite ignorée : identifiant ou plateforme manquants.' }, 400)
      }
      const result = await recordHit(databases, hit, log)
      return json(res, { ok: true, ...result })
    }

    if (action === 'summary') {
      if (Date.now() - summaryCache.at < CACHE_MS && summaryCache.value) return json(res, { ok: true, ...summaryCache.value })
      const summary = publicSummary(await allDaily(databases))
      summaryCache = { at: Date.now(), value: summary }
      return json(res, { ok: true, ...summary })
    }

    if (action === 'admin') {
      if (!actorIdOf(req)) return json(res, { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion requise.' }, 401)
      const caller = await resolveCaller(req, new Users(client), databases)
      if (!isAdministrator(caller)) {
        return json(res, { ok: false, code: 'ADMIN_REQUIRED', message: "L'audience du site est réservée à l'administration." }, 403)
      }
      const days = await allDaily(databases)
      const since = new Date(Date.now() - LIVE_WINDOW_MS).toISOString()
      const [recent, live] = await Promise.all([
        databases.listDocuments(DATABASE_ID, VISITS, [Query.orderDesc('$createdAt'), Query.limit(RECENT_VISITS)]),
        databases.listDocuments(DATABASE_ID, VISITS, [Query.greaterThan('$updatedAt', since), Query.limit(100)]),
      ])
      return json(res, {
        ok: true,
        summary: publicSummary(days),
        series: adminSeries(days, DAYS_IN_ADMIN_SERIES),
        liveNow: live.total,
        recent: recent.documents.map((visit) => ({
          id: visit.$id,
          at: visit.$createdAt,
          lastSeen: visit.$updatedAt,
          platform: visit.platform,
          device: visit.device,
          path: visit.path,
          referrer: visit.referrer,
          browser: visit.browser,
          os: visit.os,
          language: visit.language,
          authenticated: Boolean(visit.authenticated),
          pageViews: Number(visit.pageViews) || 0,
        })),
      })
    }

    return json(res, { ok: false, code: 'ACTION_INVALID', message: 'Action inconnue pour /metrics.' }, 400)
  } catch (exception) {
    error?.(`metrics/${action}: ${exception?.message || exception}`)
    return json(res, { ok: false, code: 'METRICS_FAILED', message: "La mesure d'audience est momentanément indisponible." }, 500)
  }
}
