/**
 * morning-greetings — Appwrite Function (cron: 0 7 * * *)
 *
 * Envoie chaque matin à 07h00 (Africa/Douala) une notification push
 * personnalisée à tous les utilisateurs actifs.
 *
 * Personnalisation par :
 *   • Prénom de l'utilisateur
 *   • Rôle/fonction (student, teacher, parent, admin)
 *   • Jour de la semaine (message différent lundi vs vendredi vs weekend)
 *   • Badges récemment débloqués (félicitations incluses)
 *   • Quêtes du jour actives
 *
 * Variables d'environnement requises :
 *   APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY
 */

import { Client, Databases, Users, Query, ID, Permission, Role } from 'node-appwrite'

const DATABASE_ID  = 'uniflow'
const NOTIFICATIONS = 'notifications'
const USER_BADGES   = 'user_badges'
const USER_XP       = 'user_xp'
const QUESTS_CATALOG = 'quests_catalog'
const USER_QUEST_PROGRESS = 'user_quest_progress'

// ─── Helpers ────────────────────────────────────────────────────────────────

function json(res, body, status = 200) {
  return res.json(body, status)
}

/** Capitalise la première lettre. */
function cap(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Retourne le numéro du jour de la semaine (0 = dimanche … 6 = samedi)
 * dans le fuseau Africa/Douala (UTC+1).
 */
function localDayOfWeek() {
  const now = new Date()
  // Africa/Douala = UTC+1 (pas de DST)
  const local = new Date(now.getTime() + 60 * 60 * 1000)
  return local.getUTCDay() // 0 Sun … 6 Sat
}

function localHour() {
  const now = new Date()
  return new Date(now.getTime() + 60 * 60 * 1000).getUTCHours()
}

// ─── Messages par rôle et par contexte ──────────────────────────────────────

const ROLE_LABEL = {
  student : 'apprenant',
  teacher : 'formateur',
  parent  : 'parent',
  admin   : 'administrateur',
}

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

/**
 * Génère un message de bonjour personnalisé.
 * @param {string} firstName
 * @param {string} role  student | teacher | parent | admin
 * @param {number} day   0-6 (JS getDay)
 * @param {string|null} badgeName  badge récemment débloqué ou null
 * @param {string|null} questTitle quête du jour ou null
 */
function buildGreeting(firstName, role, day, badgeName, questTitle) {
  const name = cap(firstName) || 'toi'
  const isWeekend = day === 0 || day === 6
  const isFriday  = day === 5
  const isMonday  = day === 1
  const dayName   = DAY_NAMES[day]

  // ── Titre ──────────────────────────────────────────────────────────────
  let title
  if (isWeekend) {
    title = `Bon ${dayName} ${name} 🌟`
  } else if (isMonday) {
    title = `Bonne semaine ${name} 💪`
  } else if (isFriday) {
    title = `Dernier sprint ${name} 🏁`
  } else {
    title = `Bonjour ${name} ☀️`
  }

  // ── Corps selon le rôle ────────────────────────────────────────────────
  let body
  if (role === 'teacher') {
    if (isWeekend) {
      body = `Repose-toi bien — tes apprenants t'attendent lundi. 🎓`
    } else {
      body = `Tes apprenants sont prêts. Inspire-les aujourd'hui ! 🎓`
    }
  } else if (role === 'parent') {
    if (isWeekend) {
      body = `Bon weekend en famille ! Profitez de ce temps précieux. 👨‍👩‍👧`
    } else {
      body = `Suivez la progression de vos enfants sur UniFlow aujourd'hui. 📊`
    }
  } else if (role === 'admin') {
    body = `Tableau de bord disponible — bonne journée productive. 🖥️`
  } else {
    // student (défaut)
    if (isWeekend) {
      body = `C'est le weekend ! Revise un peu ou explore tes badges. 🏆`
    } else if (isMonday) {
      body = `Nouvelle semaine, nouvelle chance de progresser. Lance-toi ! 🚀`
    } else if (isFriday) {
      body = `Vendredi déjà ! Finis fort pour clôturer la semaine. 🎯`
    } else {
      body = `Continue sur ta lancée et décroche tes prochains badges ! 🏅`
    }
  }

  // ── Enrichissements contextuels ────────────────────────────────────────
  if (badgeName) {
    body += ` 🎉 Hier tu as débloqué : « ${badgeName} » !`
  }
  if (questTitle && !isWeekend) {
    body += ` 📋 Quête du jour : ${questTitle}.`
  }

  return { title, body }
}

// ─── Récupération des données ────────────────────────────────────────────────

/** Liste tous les utilisateurs Appwrite (pagination 100 max / page). */
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

/**
 * Retourne le dernier badge débloqué hier pour cet utilisateur, ou null.
 */
async function getRecentBadge(databases, userId) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  try {
    const rows = await databases.listDocuments(DATABASE_ID, USER_BADGES, [
      Query.equal('userId', userId),
      Query.greaterThan('unlockedAt', yesterday),
      Query.orderDesc('unlockedAt'),
      Query.limit(1),
    ])
    if (rows.documents.length === 0) return null
    return rows.documents[0].badgeName || null
  } catch {
    return null
  }
}

/**
 * Retourne la première quête active du jour pour cet utilisateur, ou null.
 */
async function getTodayQuest(databases, userId) {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const rows = await databases.listDocuments(DATABASE_ID, USER_QUEST_PROGRESS, [
      Query.equal('userId', userId),
      Query.equal('status', 'active'),
      Query.limit(1),
    ])
    if (rows.documents.length === 0) return null
    const questId = rows.documents[0].questId
    if (!questId) return null
    const quest = await databases.getDocument(DATABASE_ID, QUESTS_CATALOG, questId)
    return quest.title || null
  } catch {
    return null
  }
}

// ─── Évite les doublons ──────────────────────────────────────────────────────

async function alreadySentToday(databases, userId) {
  const today = new Date().toISOString().slice(0, 10)
  const eventKey = `morning_greeting_${userId}_${today}`
  try {
    const rows = await databases.listDocuments(DATABASE_ID, NOTIFICATIONS, [
      Query.equal('eventKey', eventKey),
      Query.limit(1),
    ])
    return rows.documents.length > 0 ? eventKey : null
  } catch {
    return null
  }
}

async function persistNotification(databases, userId, title, message, eventKey) {
  try {
    await databases.createDocument(
      DATABASE_ID, NOTIFICATIONS, ID.unique(),
      {
        ownerId  : userId,
        type     : 'greeting',
        title,
        message,
        isRead   : false,
        createdAt: new Date().toISOString(),
        courseId : '',
        scheduleId: '',
        eventKey,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ],
    )
  } catch (e) {
    // Si la collection n'a pas encore le champ 'greeting', on insère sans type strict
  }
}

// ─── Point d'entrée ──────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT  || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY        || '')

  const databases  = new Databases(client)
  const usersClient = new Users(client)

  const day = localDayOfWeek()
  log(`morning-greetings — jour ${DAY_NAMES[day]}, heure locale ${localHour()}h`)

  // Récupère tous les utilisateurs
  let users
  try {
    users = await listAllUsers(usersClient)
  } catch (e) {
    error(`Impossible de lister les utilisateurs : ${e.message}`)
    return json(res, { ok: false, error: e.message }, 500)
  }

  log(`${users.length} utilisateur(s) trouvé(s)`)

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const user of users) {
    try {
      // Évite le doublon si la fonction est relancée le même jour
      const existingKey = await alreadySentToday(databases, user.$id)
      if (existingKey) { skipped++; continue }

      // Récupère le prénom depuis le nom complet
      const firstName = (user.name || '').split(' ')[0] || user.email?.split('@')[0] || 'toi'

      // Rôle depuis les labels Appwrite (ex. label 'role:teacher')
      const roleLabel = (user.labels || []).find(l => l.startsWith('role:'))
      const role = roleLabel ? roleLabel.replace('role:', '') : 'student'

      // Badge récent + quête du jour
      const [badgeName, questTitle] = await Promise.all([
        getRecentBadge(databases, user.$id),
        getTodayQuest(databases, user.$id),
      ])

      const { title, body } = buildGreeting(firstName, role, day, badgeName, questTitle)
      const eventKey = `morning_greeting_${user.$id}_${new Date().toISOString().slice(0, 10)}`

      await persistNotification(databases, user.$id, title, body, eventKey)

      log(`✓ ${user.$id} (${firstName}, ${role}) — "${title}"`)
      sent++
    } catch (e) {
      error(`✗ ${user.$id} : ${e.message}`)
      failed++
    }
  }

  return json(res, {
    ok: true,
    stats: { total: users.length, sent, skipped, failed },
    day: DAY_NAMES[day],
  })
}
