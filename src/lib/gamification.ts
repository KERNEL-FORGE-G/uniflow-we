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

export type QuestPeriod   = 'weekly' | 'monthly' | 'annual' | 'special'
export type QuestCategory = 'assiduity' | 'academic' | 'social' | 'progression' | 'content' | 'community' | 'challenge'

export interface QuestDefinition {
  $id:          string
  questId?:     string
  title:        string
  description:  string
  period:       QuestPeriod
  category:     QuestCategory
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

/**
 * Charge tous les badges du catalogue + la progression de l'utilisateur courant.
 */
export async function loadBadgesWithProgress(userId: string): Promise<BadgeWithProgress[]> {
  const [catalog, userBadges] = await Promise.all([
    listAll<BadgeDefinition>(C.BADGES_CATALOG, [Query.equal('isActive', true), Query.orderAsc('sortOrder')]),
    listAll<UserBadge>(C.USER_BADGES, [Query.equal('userId', userId)]),
  ])

  const byBadgeId = new Map(userBadges.map(ub => [ub.badgeId, ub]))

  return catalog.map(def => {
    const ub = byBadgeId.get(def.badgeId) ?? null
    return {
      definition:      def,
      userBadge:       ub,
      unlocked:        ub !== null,
      progressPercent: ub ? 100 : 0,
      progressDetail:  ub ? `Débloqué le ${new Date(ub.unlockedAt).toLocaleDateString('fr-FR')}` : 'Non débloqué',
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
  const catalogQuery = [
    Query.equal('isActive', true),
    Query.orderAsc('sortOrder'),
    ...(period !== 'all' ? [Query.equal('period', period)] : []),
  ]

  const [catalog, userProgress] = await Promise.all([
    listAll<QuestDefinition>(C.QUESTS_CATALOG, catalogQuery),
    listAll<UserQuestProgress>(C.USER_QUEST_PROGRESS, [Query.equal('userId', userId)]),
  ])

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

/**
 * Charge le XP et le niveau de l'utilisateur.
 */
export async function loadUserXp(userId: string): Promise<UserXp | null> {
  try {
    const res = await appwriteDatabases.listDocuments(DB, C.USER_XP, [
      Query.equal('userId', userId),
      Query.limit(1),
    ])
    return res.documents.length ? (res.documents[0] as unknown as UserXp) : null
  } catch {
    return null
  }
}

/**
 * Charge le top N du leaderboard.
 */
export async function loadLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    const res = await appwriteDatabases.listDocuments(DB, C.LEADERBOARD, [
      Query.orderAsc('rank'),
      Query.limit(limit),
    ])
    return res.documents as unknown as LeaderboardEntry[]
  } catch {
    return []
  }
}
