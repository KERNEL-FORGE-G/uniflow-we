/**
 * gamification.ts — Service badges & quêtes UniFlow (web)
 *
 * Lit les collections Appwrite :
 *   badges_catalog       → définitions des 100 badges
 *   user_badges          → badges débloqués par l'utilisateur courant
 *   quests_catalog       → définitions des 3000 quêtes
 *   user_quest_progress  → progression de l'utilisateur sur les quêtes actives
 *   user_xp              → XP et niveau de l'utilisateur
 *   leaderboard          → classement global
 */
import {
  appwriteDatabases,
  appwriteStorage,
  APPWRITE_DATABASE_ID,
  APPWRITE_BUCKET_ID,
} from './appwrite'
import { Query } from 'appwrite'
import {
  ALL_QUESTS_250,
  QuestAutoAdjuster,
  type QuestCatalogItem,
} from '../data/questsCatalog250'

// ─── Constantes ──────────────────────────────────────────────────────────────

const DB  = APPWRITE_DATABASE_ID
const C   = {
  BADGES_CATALOG:       'badges_catalog',
  USER_BADGES:          'user_badges',
  QUESTS_CATALOG:       'quests_catalog',
  USER_QUEST_PROGRESS:  'user_quest_progress',
  USER_XP:              'user_xp',
  LEADERBOARD:          'leaderboard',
} as const

// Le plan gratuit Appwrite Cloud n'autorise qu'un seul bucket : uniflow_assets.
// Les images de badges y sont stockées avec le fileId = slug du badge (ex: "badge_assidu").
export const BADGES_BUCKET = APPWRITE_BUCKET_ID  // 'uniflow_assets'

// ─── Types ───────────────────────────────────────────────────────────────────

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type BadgeCategory = 'assiduity' | 'academic' | 'social' | 'progression' | 'special' | 'seasonal'

export interface BadgeDefinition {
  $id:         string
  badgeId:     string
  name:        string
  description: string
  category:    BadgeCategory
  rarity:      BadgeRarity
  imageFileId: string
  xpReward:    number
  sortOrder:   number
  isActive:    boolean
}

export interface UserBadge {
  $id:          string
  userId:       string
  badgeId:      string
  unlockedAt:   string
  currentLevel: number
  notified:     boolean
}

export interface BadgeWithProgress {
  definition:      BadgeDefinition
  userBadge:       UserBadge | null
  unlocked:        boolean
  progressPercent: number
  progressDetail:  string
}

export type QuestPeriod   = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'annual' | 'special'
export type QuestCategory = 'assiduity' | 'academic' | 'social' | 'progression' | 'content' | 'community' | 'challenge' | 'organization' | 'library' | 'quiz'

export interface QuestDefinition {
  $id:          string
  questId?:     string
  title:        string
  description:  string
  period:       QuestPeriod
  category:     string
  criteriaType: string
  targetValue:  string
  xpReward:     number
  sortOrder:    number
  isActive:     boolean
  iconName:     string
  colorHex?:    string
}

export interface UserQuestProgress {
  $id:          string
  userId:       string
  questId:      string
  currentValue: number
  targetValue:  number
  completed:    boolean
  completedAt?: string
  periodKey:    string
  resetAt:      string
  xpAwarded:    number
}

export interface QuestWithProgress {
  definition: QuestDefinition
  progress:   UserQuestProgress | null
  completed:  boolean
  percent:    number
}

export interface UserXp {
  $id:        string
  userId:     string
  totalXp:    number
  level:      number
  weeklyXp:   number
  monthlyXp:  number
  annualXp:   number
}

export interface LeaderboardEntry {
  $id:        string
  userId:     string
  displayName: string
  avatarUrl?:  string
  totalXp:    number
  level:      number
  rank:       number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Construit l'URL publique d'une image de badge depuis le bucket Appwrite. */
export function badgeImageUrl(fileId: string): string {
  if (!fileId) return ''
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
  const project  = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''
  return `${endpoint}/storage/buckets/${BADGES_BUCKET}/files/${fileId}/view?project=${project}`
}

/** Couleur accent par rareté (cohérente avec le mobile). */
export function rarityColor(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'legendary': return '#F59E0B'
    case 'epic':      return '#8B5CF6'
    case 'rare':      return '#3B82F6'
    default:          return '#6B7280'
  }
}

/** Libellé humain d'une période. */
export function periodLabel(period: QuestPeriod): string {
  switch (period) {
    case 'weekly':  return 'Hebdomadaire'
    case 'monthly': return 'Mensuelle'
    case 'annual':  return 'Annuelle'
    default:        return 'Spéciale'
  }
}

/** Couleur par période. */
export function periodColor(period: QuestPeriod): string {
  switch (period) {
    case 'weekly':  return '#0D9488'
    case 'monthly': return '#1E3A8A'
    case 'annual':  return '#8B5CF6'
    default:        return '#F59E0B'
  }
}

// ─── Pagination helper ───────────────────────────────────────────────────────

async function listAll<T extends { $id: string }>(
  collectionId: string,
  queries: string[] = []
): Promise<T[]> {
  const results: T[] = []
  let cursor: string | undefined

  for (;;) {
    const q = [...queries, Query.limit(100)]
    if (cursor) q.push(Query.cursorAfter(cursor))
    const res = await appwriteDatabases.listDocuments(DB, collectionId, q)
    const docs = res.documents as unknown as T[]
    results.push(...docs)
    if (docs.length < 100) break
    cursor = docs[docs.length - 1].$id
  }
  return results
}

// ─── API publique ─────────────────────────────────────────────────────────────

// ─── Données Locales de Secours (Appwrite Quota / Mode Hors-ligne) ──────────

const FALLBACK_BADGES_DATA: BadgeDefinition[] = [
  {
    $id: 'b_assidu',
    badgeId: 'badge_assidu',
    name: 'Assiduité Exemplaire',
    description: '100% de présence sur 4 semaines consécutives.',
    category: 'assiduity',
    rarity: 'epic',
    imageFileId: 'badge_assidu',
    xpReward: 350,
    sortOrder: 1,
    isActive: true,
  },
  {
    $id: 'b_ponctuel',
    badgeId: 'badge_ponctuel',
    name: 'Toujours à l\'Heure',
    description: 'Aucun retard enregistré sur les 20 dernières séances.',
    category: 'assiduity',
    rarity: 'rare',
    imageFileId: 'badge_ponctuel',
    xpReward: 200,
    sortOrder: 2,
    isActive: true,
  },
  {
    $id: 'b_major',
    badgeId: 'badge_major',
    name: 'Major de Promotion',
    description: 'Première place au classement académique du semestre.',
    category: 'academic',
    rarity: 'legendary',
    imageFileId: 'badge_major',
    xpReward: 1000,
    sortOrder: 3,
    isActive: true,
  },
  {
    $id: 'b_sans_faute',
    badgeId: 'badge_sans_faute',
    name: 'Sans Faute',
    description: 'Obtiens 20/20 à un devoir ou contrôle continu.',
    category: 'academic',
    rarity: 'epic',
    imageFileId: 'badge_sans_faute',
    xpReward: 400,
    sortOrder: 4,
    isActive: true,
  },
  {
    $id: 'b_entraide',
    badgeId: 'badge_entraide',
    name: 'Pilier d\'Entraide',
    description: '15 réponses validées ou remerciées sur le forum de promo.',
    category: 'social',
    rarity: 'rare',
    imageFileId: 'badge_entraide',
    xpReward: 250,
    sortOrder: 5,
    isActive: true,
  },
  {
    $id: 'b_premier_pas',
    badgeId: 'badge_premier_pas',
    name: 'Premier Pas',
    description: 'Complète ta première quête sur UniFlow.',
    category: 'progression',
    rarity: 'common',
    imageFileId: 'badge_premier_pas',
    xpReward: 50,
    sortOrder: 6,
    isActive: true,
  },
]

// ─── Local Storage Store pour suivi réel de progression ──────────────────────

function getLocalProgressStore(userId: string): Record<string, { currentValue: number; completed: boolean; completedAt?: string }> {
  try {
    const raw = localStorage.getItem(`uniflow_quest_prog_${userId}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalProgressStore(userId: string, store: Record<string, { currentValue: number; completed: boolean; completedAt?: string }>) {
  try {
    localStorage.setItem(`uniflow_quest_prog_${userId}`, JSON.stringify(store))
  } catch {}
}

function getLocalBadgesStore(userId: string): Record<string, { unlockedAt: string; currentLevel: number }> {
  try {
    const raw = localStorage.getItem(`uniflow_user_badges_${userId}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalBadgesStore(userId: string, store: Record<string, { unlockedAt: string; currentLevel: number }>) {
  try {
    localStorage.setItem(`uniflow_user_badges_${userId}`, JSON.stringify(store))
  } catch {}
}

function getLocalXpStore(userId: string): UserXp {
  try {
    const raw = localStorage.getItem(`uniflow_user_xp_${userId}`)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    $id: `user_xp_${userId}`,
    userId,
    totalXp: 0,
    level: 1,
    weeklyXp: 0,
    monthlyXp: 0,
    annualXp: 0,
  }
}

function saveLocalXpStore(userId: string, xp: UserXp) {
  try {
    localStorage.setItem(`uniflow_user_xp_${userId}`, JSON.stringify(xp))
  } catch {}
}

function getFallbackQuests(userId: string, period?: string, all = false): QuestWithProgress[] {
  const now = new Date()
  let items: QuestCatalogItem[] = []

  if (all || period === 'all') {
    items = ALL_QUESTS_250
  } else if (period === 'daily') {
    items = QuestAutoAdjuster.getDailyQuests(now)
  } else if (period === 'monthly') {
    items = QuestAutoAdjuster.getMonthlyQuests(now)
  } else if (period === 'yearly' || period === 'annual') {
    items = QuestAutoAdjuster.getYearlyQuests(now)
  } else {
    items = QuestAutoAdjuster.getActiveQuests(now)
  }

  const progressStore = getLocalProgressStore(userId)

  return items.map((q, idx) => {
    const saved = progressStore[q.id]
    const current = saved ? Math.min(q.targetValue, saved.currentValue || 0) : 0
    const isDone = saved ? Boolean(saved.completed || current >= q.targetValue) : false

    const def: QuestDefinition = {
      $id: q.id,
      questId: q.id,
      title: q.title,
      description: q.description,
      period: q.period,
      category: q.category,
      criteriaType: q.criteriaType,
      targetValue: String(q.targetValue),
      xpReward: q.xpReward,
      sortOrder: idx,
      isActive: true,
      iconName: q.iconName,
      colorHex: q.colorHex,
    }

    const prog: UserQuestProgress = {
      $id: `prog_${q.id}`,
      userId,
      questId: q.id,
      currentValue: current,
      targetValue: q.targetValue,
      completed: isDone,
      completedAt: isDone ? (saved?.completedAt || now.toISOString()) : undefined,
      periodKey: q.period,
      resetAt: new Date(now.getTime() + 86400000).toISOString(),
      xpAwarded: isDone ? q.xpReward : 0,
    }

    return {
      definition: def,
      progress: prog,
      completed: isDone,
      percent: Math.min(100, Math.round((current / q.targetValue) * 100)),
    }
  })
}

function getFallbackLeaderboard(period = 'weekly', userId?: string): LeaderboardEntry[] {
  // Tant qu'aucun utilisateur n'a validé de quête, le classement commence vide
  if (!userId) return []
  const xpStore = getLocalXpStore(userId)
  if (xpStore.totalXp > 0) {
    return [
      {
        $id: `lb_${userId}`,
        userId,
        displayName: 'Vous',
        totalXp: xpStore.totalXp,
        level: xpStore.level,
        rank: 1,
      },
    ]
  }
  return []
}

/**
 * Fait progresser une quête en temps réel, attribue l'XP, monte de niveau et débloque les badges.
 */
export async function advanceQuestProgress(
  userId: string,
  questId: string,
  delta = 1
): Promise<{ questCompleted: boolean; xpAwarded: number; leveledUp: boolean; newBadgeUnlocked: boolean }> {
  const questDef = ALL_QUESTS_250.find((q) => q.id === questId)
  const target = questDef?.targetValue || 1
  const xpReward = questDef?.xpReward || 50

  const progressStore = getLocalProgressStore(userId)
  const currentEntry = progressStore[questId] || { currentValue: 0, completed: false }

  if (currentEntry.completed) {
    return { questCompleted: true, xpAwarded: 0, leveledUp: false, newBadgeUnlocked: false }
  }

  const newValue = Math.min(target, (currentEntry.currentValue || 0) + delta)
  const nowCompleted = newValue >= target

  progressStore[questId] = {
    currentValue: newValue,
    completed: nowCompleted,
    completedAt: nowCompleted ? new Date().toISOString() : undefined,
  }
  saveLocalProgressStore(userId, progressStore)

  let leveledUp = false
  let newBadgeUnlocked = false
  let xpAwarded = 0

  if (nowCompleted) {
    xpAwarded = xpReward

    // 1. Mise à jour de l'XP
    const xpStore = getLocalXpStore(userId)
    const oldLevel = xpStore.level
    xpStore.totalXp += xpReward
    xpStore.weeklyXp += xpReward
    xpStore.monthlyXp += xpReward
    xpStore.annualXp += xpReward
    xpStore.level = Math.floor(xpStore.totalXp / 250) + 1
    if (xpStore.level > oldLevel) {
      leveledUp = true
    }
    saveLocalXpStore(userId, xpStore)

    // 2. Vérification et déblocage de badges
    const badgesStore = getLocalBadgesStore(userId)
    const completedCount = Object.values(progressStore).filter((p) => p.completed).length

    // Badge Premier Pas : au moins 1 quête terminée
    if (!badgesStore['badge_premier_pas'] && completedCount >= 1) {
      badgesStore['badge_premier_pas'] = { unlockedAt: new Date().toISOString(), currentLevel: 1 }
      newBadgeUnlocked = true
    }

    // Badge Assiduité / Ponctualité si progression continue
    if (!badgesStore['badge_ponctuel'] && completedCount >= 5) {
      badgesStore['badge_ponctuel'] = { unlockedAt: new Date().toISOString(), currentLevel: 1 }
      newBadgeUnlocked = true
    }

    // Badge Major si XP >= 1000
    if (!badgesStore['badge_major'] && xpStore.totalXp >= 1000) {
      badgesStore['badge_major'] = { unlockedAt: new Date().toISOString(), currentLevel: 1 }
      newBadgeUnlocked = true
    }

    if (newBadgeUnlocked) {
      saveLocalBadgesStore(userId, badgesStore)
    }

    // Sauvegarde en arrière-plan dans Appwrite si disponible
    try {
      void appwriteDatabases.createDocument(DB, C.USER_QUEST_PROGRESS, 'unique()', {
        userId,
        questId,
        currentValue: newValue,
        targetValue: target,
        completed: true,
        xpAwarded,
      }).catch(() => {})
    } catch {}
  }

  // Émettre l'événement de synchronisation globale
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uniflow:gamification-updated', {
      detail: { userId, questId, completed: nowCompleted, xpAwarded, leveledUp, newBadgeUnlocked },
    }))
  }

  return {
    questCompleted: nowCompleted,
    xpAwarded,
    leveledUp,
    newBadgeUnlocked,
  }
}

/**
 * Valide directement une quête au maximum.
 */
export async function completeQuest(userId: string, questId: string) {
  const questDef = ALL_QUESTS_250.find((q) => q.id === questId)
  const target = questDef?.targetValue || 1
  return advanceQuestProgress(userId, questId, target)
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Charge tous les badges du catalogue + la progression de l'utilisateur courant.
 * Initialisé à zéro : aucun badge n'est débloqué arbitrairement.
 */
export async function loadBadgesWithProgress(userId: string): Promise<BadgeWithProgress[]> {
  const localBadges = getLocalBadgesStore(userId)

  try {
    const [catalog, userBadges] = await Promise.all([
      listAll<BadgeDefinition>(C.BADGES_CATALOG, [Query.equal('isActive', true), Query.orderAsc('sortOrder')]),
      listAll<UserBadge>(C.USER_BADGES, [Query.equal('userId', userId)]),
    ])

    if (catalog.length > 0) {
      const byBadgeId = new Map(userBadges.map(ub => [ub.badgeId, ub]))
      return catalog.map(def => {
        const ub = byBadgeId.get(def.badgeId) ?? null
        const isUnlocked = ub !== null || Boolean(localBadges[def.badgeId])
        return {
          definition:      def,
          userBadge:       ub,
          unlocked:        isUnlocked,
          progressPercent: isUnlocked ? 100 : 0,
          progressDetail:  isUnlocked ? 'Débloqué récemment' : 'Non débloqué',
        }
      })
    }
  } catch {
    // Mode dégradé si Appwrite indisponible ou quota dépassé
  }

  // Fallback local : TOUT EST À ZÉRO PAR DÉFAUT
  return FALLBACK_BADGES_DATA.map((def) => {
    const saved = localBadges[def.badgeId]
    const isUnlocked = Boolean(saved)
    return {
      definition: def,
      userBadge: isUnlocked ? {
        $id: `ub_${def.badgeId}`,
        userId,
        badgeId: def.badgeId,
        unlockedAt: saved?.unlockedAt || new Date().toISOString(),
        currentLevel: saved?.currentLevel || 1,
        notified: true,
      } : null,
      unlocked: isUnlocked,
      progressPercent: isUnlocked ? 100 : 0,
      progressDetail: isUnlocked ? 'Débloqué récemment' : 'Non débloqué',
    }
  })
}

/**
 * Charge les quêtes actives de la période + progression utilisateur.
 */
export async function loadQuestsWithProgress(
  userId: string,
  period: QuestPeriod | 'all' = 'all'
): Promise<QuestWithProgress[]> {
  try {
    const catalogQuery = [
      Query.equal('isActive', true),
      Query.orderAsc('sortOrder'),
      ...(period !== 'all' ? [Query.equal('period', period)] : []),
    ]

    const [catalog, userProgress] = await Promise.all([
      listAll<QuestDefinition>(C.QUESTS_CATALOG, catalogQuery),
      listAll<UserQuestProgress>(C.USER_QUEST_PROGRESS, [Query.equal('userId', userId)]),
    ])

    if (catalog.length > 0) {
      const progressMap = new Map(userProgress.map(p => [p.questId, p]))
      return catalog.map(def => {
        const key = def.questId ?? def.$id
        const prog = progressMap.get(key) ?? null
        const target = prog ? prog.targetValue : Number(def.targetValue) || 1
        const current = prog ? prog.currentValue : 0
        return {
          definition: def,
          progress:   prog,
          completed:  prog?.completed ?? false,
          percent:    prog ? Math.min(100, Math.round((current / target) * 100)) : 0,
        }
      })
    }
  } catch {
    // Mode dégradé si quota Appwrite ou réseau
  }

  return getFallbackQuests(userId, period, period === 'all')
}

/**
 * Charge l'intégralité des 250 quêtes du catalogue.
 */
export async function loadAll250Quests(userId: string): Promise<QuestWithProgress[]> {
  return getFallbackQuests(userId, 'all', true)
}

/**
 * Charge les quêtes journalières auto-ajustées.
 */
export async function loadDailyQuests(userId: string): Promise<QuestWithProgress[]> {
  return getFallbackQuests(userId, 'daily')
}

/**
 * Charge les quêtes mensuelles auto-ajustées.
 */
export async function loadMonthlyQuests(userId: string): Promise<QuestWithProgress[]> {
  return getFallbackQuests(userId, 'monthly')
}

/**
 * Charge les quêtes annuelles auto-ajustées.
 */
export async function loadYearlyQuests(userId: string): Promise<QuestWithProgress[]> {
  return getFallbackQuests(userId, 'yearly')
}

/**
 * Charge le XP et le niveau de l'utilisateur.
 */
export async function loadUserXp(userId: string): Promise<UserXp | null> {
  try {
    const res = await appwriteDatabases.listDocuments(DB, C.USER_XP, [
      Query.equal('userId', userId),
      Query.limit(1),
    ])
    if (res.documents.length) {
      return res.documents[0] as unknown as UserXp
    }
  } catch {
    // Mode dégradé
  }
  return getLocalXpStore(userId)
}

/**
 * Charge le top N du leaderboard (avec sélection de la période).
 */
export async function loadLeaderboard(
  limit = 10,
  period: 'weekly' | 'monthly' | 'annual' = 'weekly',
  userId?: string
): Promise<LeaderboardEntry[]> {
  try {
    const res = await appwriteDatabases.listDocuments(DB, C.LEADERBOARD, [
      Query.equal('period', period),
      Query.orderAsc('rank'),
      Query.limit(limit),
    ])
    if (res.documents.length) {
      return res.documents as unknown as LeaderboardEntry[]
    }
  } catch {
    // Mode dégradé
  }
  return getFallbackLeaderboard(period, userId).slice(0, limit)
}
