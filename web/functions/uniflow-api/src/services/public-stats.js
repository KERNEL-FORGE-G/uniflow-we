import { Client, Databases, Query } from 'node-appwrite'
import { DATABASE_ID } from '../lib/caller.js'
import { publicSummary } from '../lib/metrics.js'

/**
 * Service `/public-stats` — chiffres réels affichés sur la page d'accueil
 * (demande du 2026-09-21 : « statistiques dynamiques depuis la base », plus
 * aucun chiffre inventé ni bandeau vide). Aucune donnée personnelle : des
 * totaux seulement, mis en cache cinq minutes côté Function.
 */

const CACHE_MS = 5 * 60_000
let cache = { at: 0, value: null }

function json(res, body, status = 200) {
  return res.json(body, status, { 'content-type': 'application/json' })
}

async function total(databases, collection, queries = []) {
  try {
    const page = await databases.listDocuments(DATABASE_ID, collection, [...queries, Query.limit(1)])
    return page.total
  } catch {
    return 0
  }
}

async function allDaily(databases) {
  const days = []
  let cursor = null
  for (;;) {
    const queries = [Query.orderDesc('day'), Query.limit(100)]
    if (cursor) queries.push(Query.cursorAfter(cursor))
    const page = await databases.listDocuments(DATABASE_ID, 'site_metrics_daily', queries).catch(() => ({ documents: [] }))
    days.push(...page.documents)
    if (page.documents.length < 100) break
    cursor = page.documents[page.documents.length - 1].$id
  }
  return days
}

export async function computePublicStats(databases) {
  const [universities, faculties, programs, courses, sessions, classrooms, students, teachers, users, teamMembers, documents, days] = await Promise.all([
    total(databases, 'universities'),
    total(databases, 'faculties'),
    total(databases, 'academic_programs'),
    total(databases, 'academic_courses'),
    total(databases, 'academic_schedules'),
    total(databases, 'classrooms'),
    total(databases, 'users', [Query.equal('role', 'STUDENT')]),
    total(databases, 'users', [Query.equal('role', 'TEACHER')]),
    total(databases, 'users'),
    total(databases, 'team_members'),
    total(databases, 'academic_library'),
    allDaily(databases),
  ])
  const audience = publicSummary(days)
  return {
    universities,
    faculties,
    programs,
    courses,
    sessions,
    classrooms,
    students,
    teachers,
    users,
    teamMembers,
    documents,
    visitors: audience.totalVisitors,
    visits: audience.totalVisits,
    visitsToday: audience.today.visits,
    platforms: audience.platforms,
    generatedAt: new Date().toISOString(),
  }
}

export default async ({ req, res, error }) => {
  if (Date.now() - cache.at < CACHE_MS && cache.value) return json(res, { ok: true, ...cache.value, cached: true })
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.headers['x-appwrite-key'] || '')
  try {
    const stats = await computePublicStats(new Databases(client))
    cache = { at: Date.now(), value: stats }
    return json(res, { ok: true, ...stats })
  } catch (exception) {
    error?.(`public-stats: ${exception?.message || exception}`)
    return json(res, { ok: false, code: 'STATS_FAILED', message: 'Les chiffres publics sont momentanément indisponibles.' }, 500)
  }
}
