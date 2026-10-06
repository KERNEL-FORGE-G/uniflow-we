/**
 * GamificationPage.tsx — Badges & Quêtes UniFlow (web)
 *
 * Design : Brand Palette UniFlow (Bleu Marine #1E3A8A, Teal #0D9488, Ambre #F59E0B)
 *   - Fond #F8FAFC / #F0F6FF, cards #FFFFFF avec bordures #E2E8F0 et ombres subtiles
 *   - Zéro glassmorphism, zéro flou, mascottes cartoon 2D
 *   - 250 Quêtes académiques auto-ajustées (Jour, Mois, Année, Catalogue 250)
 *   - Leaderboard dynamique (Semaine, Mois, Année) avec podium 🥇🥈🥉
 */
import React, { useEffect, useState, useMemo } from 'react'
import { useUserRole } from '@/utils/userRole'
import {
  loadBadgesWithProgress,
  loadDailyQuests,
  loadMonthlyQuests,
  loadYearlyQuests,
  loadAll250Quests,
  loadUserXp,
  loadLeaderboard,
  advanceQuestProgress,
  completeQuest,
  badgeImageUrl,
  rarityColor,
  type BadgeWithProgress,
  type QuestWithProgress,
  type UserXp,
  type LeaderboardEntry,
  type BadgeCategory,
} from '@/lib/gamification'

// ─── Palette UniFlow ──────────────────────────────────────────────────────────
const C = {
  primary:      '#1E3A8A',
  primaryHover: '#172554',
  teal:         '#0D9488',
  tealLight:    '#CCFBF1',
  amber:        '#F59E0B',
  amberLight:   '#FEF3C7',
  purple:       '#8B5CF6',
  purpleLight:  '#EDE9FE',
  bg:           '#F8FAFC',
  card:         '#FFFFFF',
  text:         '#0F172A',
  textSub:      '#334155',
  muted:        '#64748B',
  border:       '#E2E8F0',
  shadow:       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
}

type MainTab = 'daily' | 'monthly' | 'annual' | 'catalog' | 'badges' | 'leaderboard'
type LbPeriod = 'weekly' | 'monthly' | 'annual'

const CATEGORY_LABELS: Record<string, string> = {
  assiduity:    'Assiduité',
  organization: 'Organisation',
  academic:     'Académique',
  social:       'Entraide',
  library:      'Bibliothèque',
  quiz:         'Auto-évaluation',
  progression:  'Progression',
}

export default function GamificationPage() {
  const { authUser } = useUserRole()
  const userId = authUser?.id ?? 'guest_user'

  const [tab, setTab] = useState<MainTab>('daily')
  const [lbPeriod, setLbPeriod] = useState<LbPeriod>('weekly')

  // Datasets
  const [dailyQuests, setDailyQuests]     = useState<QuestWithProgress[]>([])
  const [monthlyQuests, setMonthlyQuests] = useState<QuestWithProgress[]>([])
  const [yearlyQuests, setYearlyQuests]   = useState<QuestWithProgress[]>([])
  const [all250Quests, setAll250Quests]   = useState<QuestWithProgress[]>([])
  const [badges, setBadges]               = useState<BadgeWithProgress[]>([])
  const [leaderboard, setLeaderboard]     = useState<LeaderboardEntry[]>([])
  const [xpInfo, setXpInfo]               = useState<UserXp | null>(null)
  const [loading, setLoading]             = useState(true)

  // Filtres catalogue 250 & Badges
  const [catSearch, setCatSearch]     = useState('')
  const [catFilter, setCatFilter]     = useState<string>('all')
  const [badgeFilter, setBadgeFilter] = useState<string>('all')

  const loadAllData = (showSpinner = false) => {
    if (showSpinner) setLoading(true)
    Promise.all([
      loadDailyQuests(userId),
      loadMonthlyQuests(userId),
      loadYearlyQuests(userId),
      loadAll250Quests(userId),
      loadBadgesWithProgress(userId),
      loadUserXp(userId),
      loadLeaderboard(20, lbPeriod, userId),
    ]).then(([d, m, y, a250, b, x, lb]) => {
      setDailyQuests(d)
      setMonthlyQuests(m)
      setYearlyQuests(y)
      setAll250Quests(a250)
      setBadges(b)
      setXpInfo(x)
      setLeaderboard(lb)
    }).finally(() => {
      if (showSpinner) setLoading(false)
    })
  }

  useEffect(() => {
    loadAllData(true)
  }, [userId])

  useEffect(() => {
    const onGamificationUpdate = () => {
      loadAllData(false)
    }
    window.addEventListener('uniflow:gamification-updated', onGamificationUpdate)
    return () => window.removeEventListener('uniflow:gamification-updated', onGamificationUpdate)
  }, [userId, lbPeriod])

  // Recharger le leaderboard quand la période change
  useEffect(() => {
    loadLeaderboard(20, lbPeriod, userId).then(setLeaderboard)
  }, [lbPeriod, userId])

  const handleAdvanceQuest = async (questId: string, delta = 1) => {
    await advanceQuestProgress(userId, questId, delta)
  }

  // Filtrage catalogue 250
  const filteredCatalog = useMemo(() => {
    let list = all250Quests
    if (catFilter !== 'all') {
      list = list.filter(q => q.definition.category === catFilter)
    }
    if (catSearch.trim()) {
      const qLower = catSearch.toLowerCase()
      list = list.filter(q =>
        q.definition.title.toLowerCase().includes(qLower) ||
        q.definition.description.toLowerCase().includes(qLower)
      )
    }
    return list
  }, [all250Quests, catFilter, catSearch])

  // Filtrage badges
  const filteredBadges = useMemo(() => {
    let list = badges
    if (badgeFilter !== 'all') {
      list = list.filter(b => b.definition.category === badgeFilter)
    }
    return list
  }, [badges, badgeFilter])

  const unlockedBadgesCount = badges.filter(b => b.unlocked).length
  const streakDays = xpInfo && xpInfo.totalXp > 0 ? Math.min(14, Math.max(1, Math.floor(xpInfo.totalXp / 100))) : 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div
          className="w-12 h-12 border-4 rounded-full animate-spin"
          style={{ borderColor: `${C.border}`, borderTopColor: C.teal }}
        />
        <p className="text-sm font-medium" style={{ color: C.muted }}>Chargement de l'univers de quêtes & badges…</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6" style={{ background: C.bg }}>

      {/* ── BANNIÈRE GAMIFICATION AVEC MASCOTTES CARTOON SOLID ── */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 45%, #0D9488 100%)',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.25)',
        }}
      >
        {/* Cercles de fond subtils */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 right-48 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold tracking-wide uppercase">
              <span>⚡ Moteur de Réussite Campus</span>
              <span>•</span>
              <span>250 Quêtes Actives</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Progression Académique & Quêtes
            </h1>
            <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
              Défis quotidiens, jalons mensuels et objectifs annuels pour transformer tes révisions et ton assiduité en récompenses XP !
            </p>

            {/* Statistiques Rapides */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15">
                <p className="text-xs text-blue-200">Niveau Actuel</p>
                <p className="text-xl font-black text-amber-300">Niv. {xpInfo?.level ?? 1}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15">
                <p className="text-xs text-blue-200">XP Total</p>
                <p className="text-xl font-black text-white">{(xpInfo?.totalXp ?? 0).toLocaleString('fr-FR')} XP</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15">
                <p className="text-xs text-blue-200">Badges Débloqués</p>
                <p className="text-xl font-black text-emerald-300">{unlockedBadgesCount} / {badges.length}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15">
                <p className="text-xs text-blue-200">Série Campus</p>
                <p className="text-xl font-black text-orange-300">🔥 {streakDays} Jours</p>
              </div>
            </div>
          </div>

          {/* Mascotte Duo Cartoon */}
          <div className="shrink-0 flex items-center justify-center">
            <img
              src="/illustrations/archlord_uni_duo_solid.webp"
              alt="Archlord et Uni Mascottes"
              className="h-44 sm:h-52 w-auto object-contain drop-shadow-xl"
              onError={(e) => {
                // Fallback si webp indisponible
                (e.target as HTMLImageElement).src = '/illustrations/archlord_uni_duo_solid.jpg'
              }}
            />
          </div>
        </div>
      </div>

      {/* ── BARRE DE NAVIGATION DES ONGLETS (6 MODES) ── */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm scrollbar-none">
        {[
          { key: 'daily',       label: '⚡ Aujourd\'hui (Jour)', count: dailyQuests.length },
          { key: 'monthly',     label: '📆 Ce mois (Mois)',      count: monthlyQuests.length },
          { key: 'annual',      label: '🏆 Cette année (Année)', count: yearlyQuests.length },
          { key: 'catalog',     label: '📚 Catalogue (250)',     count: 250 },
          { key: 'badges',      label: '🏅 Badges',             count: badges.length },
          { key: 'leaderboard', label: '🥇 Classement Campus',  count: null },
        ].map(({ key, label, count }) => {
          const active = tab === key
          return (
            <button
              key={key}
              onClick={() => setTab(key as MainTab)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2"
              style={{
                background: active ? C.primary : 'transparent',
                color:      active ? '#FFFFFF'  : C.muted,
                boxShadow:  active ? '0 4px 12px rgba(30, 58, 138, 0.25)' : 'none',
              }}
            >
              <span>{label}</span>
              {count !== null && (
                <span
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-black"
                  style={{
                    background: active ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                    color:      active ? '#FFFFFF' : C.textSub,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── ONGLET 1 : QUÊTES DU JOUR ── */}
      {tab === 'daily' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-amber-900">Quêtes Journalières Actives</h2>
              <p className="text-xs text-amber-700">6 quêtes auto-ajustées déterministes chaque matin pour cadrer ta journée d'études.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
              Réinitialisation à minuit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyQuests.map((item) => (
              <QuestCard key={item.definition.$id} item={item} themeColor={C.amber} onAdvance={handleAdvanceQuest} />
            ))}
          </div>
        </div>
      )}

      {/* ── ONGLET 2 : QUÊTES DU MOIS ── */}
      {tab === 'monthly' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-teal-900">Quêtes Mensuelles d'Assiduité & Révisions</h2>
              <p className="text-xs text-teal-700">8 jalons adaptés au rythme semestriel, contrôles continus et projets collectifs.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-200 text-teal-900 font-bold text-xs">
              Mois en cours
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyQuests.map((item) => (
              <QuestCard key={item.definition.$id} item={item} themeColor={C.teal} onAdvance={handleAdvanceQuest} />
            ))}
          </div>
        </div>
      )}

      {/* ── ONGLET 3 : QUÊTES ANNUELLES ── */}
      {tab === 'annual' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-indigo-900">Objectifs Annuels & Jalons Majeurs</h2>
              <p className="text-xs text-indigo-700">12 jalons déterminants pour valider ton année avec mention, préparer stages et certifications.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-200 text-indigo-900 font-bold text-xs">
              Année Académique 2024-2025
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yearlyQuests.map((item) => (
              <QuestCard key={item.definition.$id} item={item} themeColor={C.purple} onAdvance={handleAdvanceQuest} />
            ))}
          </div>
        </div>
      )}

      {/* ── ONGLET 4 : CATALOGUE COMPLET (250 QUÊTES) ── */}
      {tab === 'catalog' && (
        <div className="space-y-4">
          {/* Outil de recherche et filtres de catégories */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Rechercher parmi les 250 quêtes…"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-700"
                />
                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {filteredCatalog.length} quêtes affichées sur 250
              </p>
            </div>

            {/* Chips de Catégorie */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => setCatFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  catFilter === 'all'
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Toutes les quêtes
              </button>
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setCatFilter(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    catFilter === k
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((item) => (
              <QuestCard key={item.definition.$id} item={item} themeColor={C.primary} onAdvance={handleAdvanceQuest} />
            ))}
          </div>
        </div>
      )}

      {/* ── ONGLET 5 : BADGES & SUCCÈS (STYLE DUOLINGO ACHIEVEMENTS) ── */}
      {tab === 'badges' && (
        <div className="space-y-8">
          {/* 1. Records Personnels (4 Cartes Style Duolingo) */}
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-4 tracking-tight">Records personnels</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Carte 1 : Plus haute ligue */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-600/30 p-2 flex items-center justify-center border-2 border-rose-400 shadow-inner">
                    <img
                      src="/mascot/uni_celebrate.webp"
                      alt="Ligue"
                      className="w-14 h-14 object-contain select-none drop-shadow"
                    />
                  </div>
                  <div className="absolute -bottom-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow border border-white">
                    {xpInfo && xpInfo.totalXp > 0 ? '#1' : '—'}
                  </div>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">Plus haute ligue</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{xpInfo && xpInfo.totalXp > 0 ? 'En cours' : 'Non classé'}</p>
              </div>

              {/* Carte 2 : Plus longue série */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 p-2 flex items-center justify-center border-2 border-amber-400 shadow-inner">
                    <img
                      src="/mascot/uni_wave.webp"
                      alt="Série"
                      className="w-14 h-14 object-contain select-none drop-shadow"
                    />
                  </div>
                  <div className="absolute -bottom-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow border border-white">
                    {streakDays}
                  </div>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">Plus longue série</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{streakDays > 0 ? `${streakDays} j consécutifs` : '0 jour'}</p>
              </div>

              {/* Carte 3 : Record XP */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-500/30 p-2 flex items-center justify-center border-2 border-yellow-400 shadow-inner">
                    <img
                      src="/mascot/uni_graduate.webp"
                      alt="Record XP"
                      className="w-14 h-14 object-contain select-none drop-shadow"
                    />
                  </div>
                  <div className="absolute -bottom-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-black text-xs px-2.5 py-0.5 rounded-full shadow border border-white">
                    {xpInfo?.totalXp ?? 0}
                  </div>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">Record XP</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Points acquis</p>
              </div>

              {/* Carte 4 : Séances parfaites */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/30 p-2 flex items-center justify-center border-2 border-emerald-400 shadow-inner">
                    <img
                      src="/mascot/uni_shield.webp"
                      alt="Séances parfaites"
                      className="w-14 h-14 object-contain select-none drop-shadow"
                    />
                  </div>
                  <div className="absolute -bottom-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow border border-white">
                    {all250Quests.filter(q => q.completed).length}
                  </div>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">Défis terminés</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Quêtes validées</p>
              </div>
            </div>
          </div>

          {/* 2. Filtres Catégories */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Récompenses</h2>
            <div className="flex flex-wrap gap-2">
              {['all', 'assiduity', 'academic', 'social', 'progression'].map((c) => (
                <button
                  key={c}
                  onClick={() => setBadgeFilter(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    badgeFilter === c ? 'bg-[#1E3A8A] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c === 'all' ? 'Toutes' : CATEGORY_LABELS[c] || c}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Grille de Récompenses Uni Style Duolingo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {filteredBadges.map((item, idx) => {
              const def = item.definition
              const isUnlocked = item.unlocked

              // Mascotte Uni adaptée à la catégorie et index
              const mascotFiles = [
                '/mascot/uni_wave.webp',
                '/mascot/uni_graduate.webp',
                '/mascot/uni_shield.webp',
                '/mascot/uni_celebrate.webp',
                '/mascot/uni_search.webp',
                '/mascot/uni_thinking.webp',
                '/mascot/uni_headset.webp',
                '/mascot/uni_pointing.webp',
              ]
              const mascotSrc = mascotFiles[idx % mascotFiles.length]
              const ribbonNumbers = [10, 25, 175, 20, 1, 10, 4000, 1000, 5, 50, 100]
              const ribbonNum = ribbonNumbers[idx % ribbonNumbers.length]

              return (
                <div
                  key={def.$id}
                  className={`flex flex-col items-center text-center transition-all ${
                    isUnlocked ? 'opacity-100 hover:scale-105' : 'opacity-40 grayscale hover:opacity-60'
                  }`}
                >
                  {/* Badge Frame avec Mascotte Uni + Ruban niveau en bas */}
                  <div className="relative mb-2.5">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-b from-amber-50 to-amber-100/60 border-2 border-amber-300 shadow-sm flex items-center justify-center p-2 relative overflow-hidden">
                      <img
                        src={mascotSrc}
                        alt={def.name}
                        className="w-14 h-14 object-contain select-none drop-shadow-sm"
                      />
                    </div>
                    {/* Ruban jaune/or sous le badge */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-white font-black text-[11px] px-3 py-0.5 rounded-full shadow-md border-2 border-white flex items-center justify-center min-w-[28px]">
                      {isUnlocked ? ribbonNum : '🔒'}
                    </div>
                  </div>

                  {/* Titre du badge */}
                  <h3 className="text-xs font-black text-slate-900 mt-1 line-clamp-1">{def.name}</h3>
                  {/* Progression */}
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {isUnlocked ? 'Débloqué !' : 'Verrouillé'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── ONGLET 6 : CLASSEMENT (LEADERBOARD) ── */}
      {tab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Contrôle de la Période */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900">Période du Classement</h2>
            <div className="flex gap-2">
              {[
                { key: 'weekly',  label: 'Cette Semaine' },
                { key: 'monthly', label: 'Ce Mois' },
                { key: 'annual',  label: 'Cette Année' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setLbPeriod(key as LbPeriod)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    lbPeriod === key
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-3 shadow-sm">
              <span className="text-5xl">🏆</span>
              <h3 className="text-base font-extrabold text-slate-900">Le classement est encore vide</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Aucun participant n'a encore validé de défi. Accomplis ta première quête pour monter sur la première marche du podium !
              </p>
            </div>
          ) : (
            <>
              {/* Podium Top 3 */}
              {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto pt-6 items-end">
                  {/* Argent : 2ème */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center flex flex-col items-center">
                    <span className="text-3xl">🥈</span>
                    <p className="text-xs font-bold text-slate-900 mt-2 truncate w-full">{leaderboard[1].displayName}</p>
                    <p className="text-xs font-black text-slate-500">{leaderboard[1].totalXp.toLocaleString()} XP</p>
                    <span className="mt-2 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">Rang 2</span>
                  </div>
                  {/* Or : 1er */}
                  <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-5 border-2 border-amber-300 shadow-md text-center flex flex-col items-center scale-105">
                    <span className="text-4xl">👑</span>
                    <p className="text-sm font-black text-amber-950 mt-2 truncate w-full">{leaderboard[0].displayName}</p>
                    <p className="text-sm font-black text-amber-600">{leaderboard[0].totalXp.toLocaleString()} XP</p>
                    <span className="mt-2 text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black">Major 1er</span>
                  </div>
                  {/* Bronze : 3ème */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center flex flex-col items-center">
                    <span className="text-3xl">🥉</span>
                    <p className="text-xs font-bold text-slate-900 mt-2 truncate w-full">{leaderboard[2].displayName}</p>
                    <p className="text-xs font-black text-slate-500">{leaderboard[2].totalXp.toLocaleString()} XP</p>
                    <span className="mt-2 text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">Rang 3</span>
                  </div>
                </div>
              )}

              {/* Table des Rangs */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {leaderboard.map((item, idx) => (
                    <div
                      key={item.$id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-6 text-sm font-black text-slate-400 text-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.displayName}</p>
                          <p className="text-xs text-slate-500">Niveau {item.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-blue-900">
                          {item.totalXp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  )
}

// ─── CARTE DE QUÊTE COMMUNE ──────────────────────────────────────────────────
function QuestCard({
  item,
  themeColor,
  onAdvance,
}: {
  item: QuestWithProgress
  themeColor: string
  onAdvance?: (questId: string, delta?: number) => Promise<void>
}) {
  const def    = item.definition
  const target = item.progress?.targetValue ?? (Number(def.targetValue) || 1)
  const curr   = item.progress?.currentValue ?? 0
  const isDone = item.completed
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    if (isDone || loading || !onAdvance) return
    setLoading(true)
    try {
      await onAdvance(def.$id, 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{def.title}</h3>
          <span
            className="text-xs font-black px-2 py-0.5 rounded-lg shrink-0"
            style={{ background: `${themeColor}15`, color: themeColor }}
          >
            +{def.xpReward} XP
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{def.description}</p>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-500">{isDone ? 'Terminée' : `${curr} / ${target}`}</span>
          <span style={{ color: themeColor }}>{item.percent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${item.percent}%`, background: themeColor }}
          />
        </div>

        <div className="pt-1 flex items-center justify-end">
          {isDone ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              ✓ Complétée
            </span>
          ) : (
            <button
              onClick={handleAction}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 hover:brightness-110"
              style={{ background: themeColor }}
            >
              {loading ? 'Validation…' : target === 1 ? 'Valider le défi' : 'Progresser (+1)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
