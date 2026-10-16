/**
 * quest-reset — Appwrite Function
 *
 * Auto-actualise les quêtes dynamiques UniFlow :
 *   • Hebdomadaires : cron "0 0 * * 1"  (lundi 00h00 UTC)
 *   • Mensuelles   : cron "0 0 1 * *"   (1er du mois 00h00 UTC)
 *   • Annuelles    : cron "0 0 1 1 *"   (1er janvier 00h00 UTC)
 *
 * Peut aussi être appelée manuellement avec le body :
 *   { "period": "weekly" | "monthly" | "annual" | "all" }
 *
 * Logique :
 *  1. Détermine le(s) period(s) à réinitialiser.
 *  2. Marque expired les user_quest_progress non complétés de la période.
 *  3. Récupère les quêtes actives du catalogue pour la période.
 *  4. Crée de nouvelles entrées user_quest_progress pour chaque (user, quest).
 *  5. Envoie une notification récap à chaque utilisateur.
 */

import { Client, Databases, Users, Query, ID, Permission, Role } from 'node-appwrite'

const DATABASE_ID       = 'uniflow'
const QUESTS_CATALOG    = 'quests_catalog'
const USER_QUEST        = 'user_quest_progress'
const NOTIFICATIONS     = 'notifications'

// ─── Helpers ────────────────────────────────────────────────────────────────

function json(res, body, status = 200) {
  return res.json(body, status)
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson
  try { return JSON.parse(req.bodyText || '{}') } catch { return {} }
}

/**
 * Calcule la clé de période courante.
 * Ex. : weekly → "2025-W03", monthly → "2025-01", annual → "2025"
 */
function periodKey(period) {
  const now = new Date()
  const y = now.getUTCFullYear()
  if (period === 'annual')  return String(y)
  if (period === 'monthly') return `${y}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  if (period === 'weekly') {
    // ISO week number
    const d = new Date(Date.UTC(y, now.getUTCMonth(), now.getUTCDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
  }
  return 'unknown'
}

/**
 * Retourne la date de fin de la période courante.
 */
function periodEndDate(period) {
  const now = new Date()
  if (period === 'annual') {
    return new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59)).toISOString()
  }
  if (period === 'monthly') {
    const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
    return new Date(Date.UTC(lastDay.getUTCFullYear(), lastDay.getUTCMonth(), lastDay.getUTCDate(), 23, 59, 59)).toISOString()
  }
  // weekly : prochain dimanche
  const d = new Date(now)
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + (7 - day))
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59)).toISOString()
}

/** Liste paginée de tous les documents d'une collection. */
async function listAll(databases, collectionId, queries = []) {
  const all = []
  let cursor = null
  for (;;) {
    const q = [...queries, Query.limit(100)]
    if (cursor) q.push(Query.cursorAfter(cursor))
    const page = await databases.listDocuments(DATABASE_ID, collectionId, q)
    all.push(...page.documents)
    if (page.documents.length < 100) break
    cursor = page.documents[page.documents.length - 1].$id
  }
  return all
}

/** Liste tous les utilisateurs Appwrite. */
async function listAllUsers(usersClient) {
  const all = []
  let cursor = null
  for (;;) {
    const queries = [Query.limit(100)]
    if (cursor) queries.push(Query.cursorAfter(cursor))
    const page = await usersClient.list(queries)
    all.push(...page.users)
    if (page.users.length < 100) break
    cursor = page.users[page.users.length - 1].$id
  }
  return all
}

/** Expire les quêtes non-complétées de la période précédente. */
async function expireOldProgress(databases, period, currentKey, log) {
  const old = await listAll(databases, USER_QUEST, [
    Query.equal('period', period),
    Query.notEqual('periodKey', currentKey),
    Query.equal('status', 'active'),
  ])
  log(`Expiration : ${old.length} entrées ${period} non complétées`)
  for (const doc of old) {
    try {
      await databases.updateDocument(DATABASE_ID, USER_QUEST, doc.$id, { status: 'expired' })
    } catch { /* skip */ }
  }
}

/** Vérifie si une entrée user_quest_progress existe déjà pour (userId, questId, periodKey). */
async function progressExists(databases, userId, questId, pKey) {
  const rows = await databases.listDocuments(DATABASE_ID, USER_QUEST, [
    Query.equal('userId', userId),
    Query.equal('questId', questId),
    Query.equal('periodKey', pKey),
    Query.limit(1),
  ])
  return rows.documents.length > 0
}

// ─── Point d'entrée ──────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT  || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY        || '')

  const databases   = new Databases(client)
  const usersClient = new Users(client)

  const body = parseBody(req)

  // Détermine le(s) période(s) à traiter
  let periods = []
  const requested = body.period || 'auto'

  if (requested === 'all') {
    periods = ['weekly', 'monthly', 'annual']
  } else if (['weekly', 'monthly', 'annual'].includes(requested)) {
    periods = [requested]
  } else {
    // 'auto' : détermine selon le cron qui a déclenché (lundi=weekly, 1er=monthly, 1er jan=annual)
    const now = new Date()
    const day  = now.getUTCDate()
    const month = now.getUTCMonth() + 1
    const dow  = now.getUTCDay() // 0=Sun 1=Mon

    if (dow === 1)           periods.push('weekly')
    if (day === 1)           periods.push('monthly')
    if (day === 1 && month === 1) periods.push('annual')
    if (periods.length === 0) periods = ['weekly'] // fallback
  }

  log(`Périodes à traiter : ${periods.join(', ')}`)

  // Récupère tous les utilisateurs
  let users
  try {
    users = await listAllUsers(usersClient)
  } catch (e) {
    error(`Impossible de lister les utilisateurs : ${e.message}`)
    return json(res, { ok: false, error: e.message }, 500)
  }

  const stats = {}

  for (const period of periods) {
    const pKey    = periodKey(period)
    const endDate = periodEndDate(period)

    log(`--- ${period} (${pKey}) ---`)

    // 1. Expire les anciennes
    await expireOldProgress(databases, period, pKey, log)

    // 2. Récupère le catalogue de quêtes actives pour cette période
    const quests = await listAll(databases, QUESTS_CATALOG, [
      Query.equal('period', period),
      Query.equal('isActive', true),
    ])
    log(`${quests.length} quêtes actives trouvées pour ${period}`)

    let created = 0
    let skipped = 0
    let failed  = 0

    for (const user of users) {
      // Filtre les quêtes selon les rôles
      const userRole = (user.labels || []).find(l => l.startsWith('role:'))?.replace('role:', '') || 'student'

      const applicableQuests = quests.filter(q => {
        const roles = Array.isArray(q.targetRoles) ? q.targetRoles : ['student']
        return roles.includes(userRole) || roles.includes('all')
      })

      for (const quest of applicableQuests) {
        try {
          const exists = await progressExists(databases, user.$id, quest.$id, pKey)
          if (exists) { skipped++; continue }

          await databases.createDocument(
            DATABASE_ID, USER_QUEST, ID.unique(),
            {
              userId    : user.$id,
              questId   : quest.$id,
              period,
              periodKey : pKey,
              status    : 'active',
              currentValue: 0,
              targetValue : parseInt(quest.targetValue) || 1,
              startedAt : new Date().toISOString(),
              expiresAt : endDate,
              completedAt: null,
            },
            [
              Permission.read(Role.user(user.$id)),
              Permission.update(Role.user(user.$id)),
            ],
          )
          created++
        } catch (e) {
          error(`✗ ${user.$id}/${quest.$id}: ${e.message}`)
          failed++
        }
      }

      // Notification récap (1 seule par utilisateur par période reset)
      try {
        const eventKey = `quest_reset_${period}_${pKey}_${user.$id}`
        const firstName = (user.name || '').split(' ')[0] || 'toi'
        const count = applicableQuests.length
        let title, message
        if (period === 'weekly') {
          title = `🗓️ Nouvelles quêtes de la semaine !`
          message = `${count} quêtes t'attendent cette semaine, ${firstName}. Bonne chance !`
        } else if (period === 'monthly') {
          title = `📅 Nouveau mois, nouveaux défis !`
          message = `${count} quêtes mensuelles démarrent aujourd'hui, ${firstName}. Lance-toi !`
        } else {
          title = `🎯 Objectifs annuels débloqués !`
          message = `Une nouvelle année commence ! ${count} quêtes annuelles t'attendent, ${firstName}.`
        }

        await databases.createDocument(
          DATABASE_ID, NOTIFICATIONS, ID.unique(),
          {
            ownerId  : user.$id,
            type     : 'quest_reset',
            title,
            message,
            isRead   : false,
            createdAt: new Date().toISOString(),
            courseId : '',
            scheduleId: '',
            eventKey,
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ],
        )
      } catch { /* notif optional */ }
    }

    stats[period] = { pKey, questsFound: quests.length, created, skipped, failed }
    log(`${period} terminé : ${created} créés, ${skipped} existants, ${failed} erreurs`)
  }

  return json(res, { ok: true, periods, stats })
}
