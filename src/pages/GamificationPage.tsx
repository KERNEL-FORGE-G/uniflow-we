/**
 * GamificationPage.tsx — Badges & Quêtes UniFlow (web)
 *
 * Design : clean white (style "Book app" adapté UniFlow)
 *   - Fond #F0F6FF, cards #FFFFFF avec ombres douces
 *   - Accent bleu #1E3A8A + teal #0D9488
 *   - Zéro glassmorphism, zéro fond sombre
 */
import React, { useEffect, useState, useMemo } from 'react'
import { useUserRole } from '@/utils/userRole'
import {
  loadBadgesWithProgress,
  loadQuestsWithProgress,
  loadUserXp,
  loadLeaderboard,
  badgeImageUrl,
  rarityColor,
  periodLabel,
  periodColor,
  type BadgeWithProgress,
  type QuestWithProgress,
  type UserXp,
  type LeaderboardEntry,
  type QuestPeriod,
  type BadgeCategory,
} from '@/lib/gamification'

// ─── Palette UniFlow ──────────────────────────────────────────────────────────
const C = {
  primary:  '#1E3A8A',
  teal:     '#0D9488',
  bg:       '#F0F6FF',
  card:     '#FFFFFF',
  text:     '#0F172A',
  muted:    '#64748B',
  border:   '#E2E8F0',
  shadow:   '0 2px 12px rgba(0,0,0,0.06)',
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────

function XpBar({ xp, level }: { xp: number; level: number }) {
  const xpInLevel  = xp % 500
  const xpForLevel = 500
  const pct        = Math.min(100, Math.round((xpInLevel / xpForLevel) * 100))
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${C.primary},${C.teal})` }}
        />
      </div>
      <span className="text-xs shrink-0" style={{ color: C.muted }}>{xpInLevel}/500 XP</span>
    </div>
  )
}

function BadgeCircle({ item }: { item: BadgeWithProgress }) {
  const def    = item.definition
  const color  = rarityColor(def.rarity)
  const imgUrl = def.imageFileId ? badgeImageUrl(def.imageFileId) : null
  const [imgErr, setImgErr] = useState(false)

  return (
    <div
      title={`${def.name} — ${def.description}`}
      className="flex flex-col items-center gap-1.5 cursor-default group"
    >
      <div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110"
        style={{
          border:     `2px solid ${item.unlocked ? color : C.border}`,
          background: item.unlocked ? `${color}18` : '#F8FAFC',
          boxShadow:  item.unlocked ? `0 4px 12px ${color}30` : 'none',
          opacity:    item.unlocked ? 1 : 0.5,
        }}
      >
        {imgUrl && !imgErr ? (
          <img
            src={imgUrl}
            alt={def.name}
            onError={() => setImgErr(true)}
            className={`w-10 h-10 object-contain ${item.unlocked ? '' : 'grayscale'}`}
          />
        ) : (
          <span className="text-2xl select-none">🏅</span>
        )}
        {item.unlocked && (
          <span
            className="absolute top-0.5 right-0.5 text-[8px] font-bold px-1 rounded-sm text-white"
            style={{ background: color }}
          >✓</span>
        )}
      </div>
      <span className="text-[10px] text-center leading-tight max-w-[56px] truncate" style={{ color: C.muted }}>
        {def.name}
      </span>
    </div>
  )
}

function QuestRow({ item }: { item: QuestWithProgress }) {
  const def    = item.definition
  const color  = periodColor(def.period as QuestPeriod)
  const target = item.progress?.targetValue ?? Number(def.targetValue) ?? 1
  const curr   = item.progress?.currentValue ?? 0

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-shadow hover:shadow-md"
      style={{ background: C.card, boxShadow: C.shadow, border: `1px solid ${C.border}` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base font-bold"
        style={{ background: `${color}15`, color }}
      >
        {def.period === 'weekly' ? '📅' : def.period === 'monthly' ? '📆' : def.period === 'annual' ? '🏆' : '⭐'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold truncate" style={{ color: C.text }}>{def.title}</p>
          <span className="text-xs font-bold shrink-0" style={{ color }}>+{def.xpReward} XP</span>
        </div>
        <p className="text-xs mb-1.5 truncate" style={{ color: C.muted }}>{def.description}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${item.percent}%`, background: color }}
            />
          </div>
          <span className="text-[10px] shrink-0" style={{ color: C.muted }}>
            {item.completed ? '✓ Terminée' : `${curr}/${target}`}
          </span>
        </div>
      </div>
    </div>
  )
}

function LeaderboardPodium({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) return null
  const order  = [1, 0, 2].filter(i => entries[i])
  const medals = ['🥇', '🥈', '🥉']
  const bgColors = [`${C.primary}15`, '#F8FAFC', '#F8FAFC']

  return (
    <div className="flex items-end justify-center gap-3 mt-2">
      {order.map(i => {
        const e = entries[i]
        const heights = ['h-20', 'h-16', 'h-14']
        return (
          <div key={e.$id} className="flex flex-col items-center gap-1">
            <img
              src={e.avatarUrl || '/logos/logo_1.png'}
              alt={e.displayName}
              className="w-10 h-10 rounded-full object-cover"
              style={{ border: `2px solid ${i === 0 ? C.primary : C.border}` }}
            />
            <span className="text-lg">{medals[i]}</span>
            <div
              className={`${heights[i]} w-16 rounded-t-xl flex items-center justify-center`}
              style={{ background: bgColors[i], border: `1px solid ${C.border}` }}
            >
              <div className="text-center px-1">
                <p className="text-[10px] font-bold truncate max-w-[52px]" style={{ color: C.text }}>{e.displayName}</p>
                <p className="text-[9px]" style={{ color: C.muted }}>Niv.{e.level}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page principale ─────────────────────────────────────────────────────────

type Tab = 'badges' | 'weekly' | 'monthly' | 'annual'

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  assiduity:   'Assiduité',
  academic:    'Académique',
  social:      'Social',
  progression: 'Progression',
  special:     'Spécial',
  seasonal:    'Saisonnier',
}

export default function GamificationPage() {
  const { authUser } = useUserRole()
  const userId = authUser?.id ?? ''

  const [tab,       setTab]       = useState<Tab>('badges')
  const [badges,    setBadges]    = useState<BadgeWithProgress[]>([])
  const [quests,    setQuests]    = useState<QuestWithProgress[]>([])
  const [xpInfo,    setXpInfo]    = useState<UserXp | null>(null)
  const [board,     setBoard]     = useState<LeaderboardEntry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [catFilter, setCatFilter] = useState<BadgeCategory | 'all'>('all')
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      loadBadgesWithProgress(userId),
      loadQuestsWithProgress(userId, 'all'),
      loadUserXp(userId),
      loadLeaderboard(10),
    ]).then(([b, q, x, lb]) => {
      setBadges(b)
      setQuests(q)
      setXpInfo(x)
      setBoard(lb)
    }).finally(() => setLoading(false))
  }, [userId])

  const filteredBadges = useMemo(() => {
    let list = badges
    if (catFilter !== 'all') list = list.filter(b => b.definition.category === catFilter)
    if (search) list = list.filter(b =>
      b.definition.name.toLowerCase().includes(search.toLowerCase()) ||
      b.definition.description.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [badges, catFilter, search])

  const filteredQuests = useMemo(() => {
    if (tab === 'badges') return []
    return quests.filter(q => q.definition.period === tab)
  }, [quests, tab])

  const unlockedCount = badges.filter(b => b.unlocked).length
  const totalCount    = badges.length
  const userRank      = board.findIndex(e => e.userId === userId) + 1

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div
          className="w-12 h-12 border-4 rounded-full animate-spin"
          style={{ borderColor: `${C.border}`, borderTopColor: C.teal }}
        />
        <p className="text-sm" style={{ color: C.muted }}>Chargement des badges et quêtes…</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5" style={{ background: C.bg }}>

      {/* ── Header XP ── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: C.card, boxShadow: C.shadow, border: `1px solid ${C.border}` }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* XP gauche */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: `linear-gradient(135deg,${C.primary},${C.teal})` }}
              >
                {xpInfo?.level ?? 1}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide font-medium" style={{ color: C.muted }}>Niveau actuel</p>
                <p className="text-xl font-bold" style={{ color: C.text }}>
                  {xpInfo?.totalXp?.toLocaleString('fr-FR') ?? 0} XP total
                </p>
              </div>
            </div>
            <XpBar xp={xpInfo?.totalXp ?? 0} level={xpInfo?.level ?? 1} />
            <div className="flex flex-wrap gap-4 mt-3">
              {[
                { label: '📅 Cette semaine', val: xpInfo?.weeklyXp ?? 0 },
                { label: '📆 Ce mois', val: xpInfo?.monthlyXp ?? 0 },
                { label: '🏅 Badges', val: `${unlockedCount}/${totalCount}` },
                ...(userRank > 0 ? [{ label: '🏆 Rang', val: `#${userRank}` }] : []),
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: C.muted }}>{label}</span>
                  <span className="text-sm font-bold" style={{ color: C.text }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Podium */}
          {board.length > 0 && (
            <div className="md:w-56">
              <p className="text-xs uppercase tracking-wide font-medium text-center mb-1" style={{ color: C.muted }}>
                Classement
              </p>
              <LeaderboardPodium entries={board.slice(0, 3)} />
            </div>
          )}
        </div>
      </div>

      {/* ── Onglets ── */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: C.card, boxShadow: C.shadow, border: `1px solid ${C.border}` }}
      >
        {(['badges', 'weekly', 'monthly', 'annual'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t ? C.primary  : 'transparent',
              color:      tab === t ? '#FFFFFF'   : C.muted,
            }}
          >
            {t === 'badges' ? '🏅 Badges' : t === 'weekly' ? '📅 Hebdo' : t === 'monthly' ? '📆 Mensuel' : '🏆 Annuel'}
          </button>
        ))}
      </div>

      {/* ── Contenu Badges ── */}
      {tab === 'badges' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-wrap gap-2 items-center">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un badge…"
              className="flex-1 min-w-[180px] rounded-xl px-3 py-2 text-sm outline-none transition-shadow focus:shadow-md"
              style={{
                background:  C.card,
                border:      `1px solid ${C.border}`,
                color:       C.text,
                boxShadow:   C.shadow,
              }}
            />
            {(['all', ...Object.keys(CATEGORY_LABELS)] as (BadgeCategory | 'all')[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background:  catFilter === cat ? C.primary    : C.card,
                  color:       catFilter === cat ? '#FFFFFF'    : C.muted,
                  border:      `1px solid ${catFilter === cat ? C.primary : C.border}`,
                }}
              >
                {cat === 'all' ? 'Tous' : CATEGORY_LABELS[cat as BadgeCategory]}
              </button>
            ))}
          </div>

          {filteredBadges.length === 0 ? (
            <div className="text-center py-16" style={{ color: C.muted }}>Aucun badge trouvé</div>
          ) : (
            <div
              className="rounded-2xl p-5"
              style={{ background: C.card, boxShadow: C.shadow, border: `1px solid ${C.border}` }}
            >
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-4">
                {filteredBadges.map(item => (
                  <BadgeCircle key={item.definition.$id} item={item} />
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs" style={{ color: C.muted }}>
            {unlockedCount} débloqués · {totalCount - unlockedCount} restants
          </p>
        </div>
      )}

      {/* ── Contenu Quêtes ── */}
      {tab !== 'badges' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: C.muted }}>
              {filteredQuests.filter(q => q.completed).length}/{filteredQuests.length} quêtes terminées
            </p>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: `${periodColor(tab as QuestPeriod)}15`,
                color:       periodColor(tab as QuestPeriod),
              }}
            >
              {periodLabel(tab as QuestPeriod)}
            </span>
          </div>

          {filteredQuests.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ background: C.card, boxShadow: C.shadow, border: `1px solid ${C.border}`, color: C.muted }}
            >
              Aucune quête active pour cette période.<br />
              <span className="text-xs">La fonction quest-reset les initialise à chaque début de période.</span>
            </div>
          ) : (
            filteredQuests.map(item => (
              <QuestRow key={item.definition.$id} item={item} />
            ))
          )}
        </div>
      )}

    </div>
  )
}
