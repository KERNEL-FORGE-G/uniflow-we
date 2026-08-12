import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList, Clock, TrendingUp, UserCheck, Calendar, Bell, GraduationCap, Megaphone, Video, MessageSquare, BarChart3, ChevronRight, Star, Zap, Users, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useUserRole } from '../utils/userRole'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, AreaChart, Area } from 'recharts'
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { statsApi, getAccountType } from '../lib/api'
import { SubscriptionWidget } from '../components/subscription/SubscriptionWidget'

const gradeDistrib = [
  { name: 'Excellentes', value: 35, color: '#1e3a8a' },
  { name: 'Bonnes',      value: 30, color: '#0d9488' },
  { name: 'Moyennes',    value: 25, color: '#f59e0b' },
  { name: 'Faibles',     value: 10, color: '#ef4444' },
]

const attendanceTrend = [
  { week: 'S1', rate: 85 }, { week: 'S2', rate: 88 }, { week: 'S3', rate: 78 },
  { week: 'S4', rate: 92 }, { week: 'S5', rate: 86 }, { week: 'S6', rate: 91 },
]

const teacherGradeData = [
  { week: 'S1', average: 13.2 }, { week: 'S2', average: 13.8 }, { week: 'S3', average: 14.1 },
  { week: 'S4', average: 13.9 }, { week: 'S5', average: 14.5 }, { week: 'S6', average: 14.8 },
]

const delegateAttendance = [
  { day: 'Lun', present: 48, absent: 4 }, { day: 'Mar', present: 46, absent: 6 },
  { day: 'Mer', present: 50, absent: 2 }, { day: 'Jeu', present: 45, absent: 7 },
  { day: 'Ven', present: 49, absent: 3 },
]

// Calendar helper
const calDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function DashboardPage() {
  const { currentRole, currentUser, language } = useUserRole()
  const navigate = useNavigate()
  const firstName = currentUser.name.split(' ')[0]

  // Dynamic current date calculations
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const todayNumber = now.getDate()

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  const formattedToday = capitalize(
    now.toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  )

  const formattedMonthYear = capitalize(
    now.toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-US', {
      month: 'long',
      year: 'numeric',
    })
  )

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const calOffset = (firstDayOfMonth.getDay() + 6) % 7
  const calTotal = new Date(currentYear, currentMonth + 1, 0).getDate()
  const today = todayNumber

  const eventDays = [
    Math.max(1, today - 4),
    Math.max(1, today - 1),
    today,
    Math.min(calTotal, today + 3),
    Math.min(calTotal, today + 6),
  ]

  const [activeCalDay, setActiveCalDay] = useState(today)
  const { data: overview, loading: overviewLoading, error: overviewError, refetch: refetchOverview } = useApi(() => statsApi.overview())

  const studentStats = [
    { label: 'Cours inscrits',   value: overview ? `${overview.courseCount}` : '...',      delta: '+8%',    up: true,  icon: BookOpen,      bg: 'bg-[#eff3ff]', color: 'text-[#1e3a8a]', to: '/app/cours' },
    { label: 'Devoirs à rendre', value: '5',       delta: '↓1',     up: false, icon: ClipboardList, bg: 'bg-[#fef3c7]', color: 'text-[#d97706]', to: '/app/devoirs' },
    { label: 'Prochain cours',   value: '2h30',    delta: '+15m',   up: true,  icon: Clock,         bg: 'bg-[#f0fdfa]', color: 'text-[#0d9488]', to: '/app/emploi-du-temps' },
    { label: 'Moyenne',          value: '14.6/20', delta: '+0.6',   up: true,  icon: TrendingUp,    bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]', to: '/app/notes' },
    { label: 'Présences',        value: '87%',     delta: '-5%',    up: false, icon: UserCheck,     bg: 'bg-[#d1fae5]', color: 'text-[#059669]', to: '/app/presences' },
  ]
  const delegateStats = [
    { label: 'Taux présence',     value: '89%',  delta: '+3%',    up: true,  icon: UserCheck,     bg: 'bg-[#f0fdfa]', color: 'text-[#0d9488]', to: '/app/gestion-presences' },
    { label: 'Sync. en attente',  value: '2',    delta: 'Offline', up: false, icon: ClipboardList, bg: 'bg-[#fee2e2]', color: 'text-[#dc2626]', to: '/app/gestion-presences' },
    { label: 'Justif. en attente',value: '3',    delta: '↓2',     up: true,  icon: Bell,          bg: 'bg-[#fef3c7]', color: 'text-[#d97706]', to: '/app/gestion-presences' },
    { label: 'Cohorte L2 Info',   value: overview ? `${overview.studentCount}` : '...',   delta: 'Stable',  up: true,  icon: BookOpen,      bg: 'bg-[#eff3ff]', color: 'text-[#1e3a8a]', to: '/app/cours' },
    { label: 'Sessions validées', value: '18',   delta: '+1',     up: true,  icon: Calendar,      bg: 'bg-[#d1fae5]', color: 'text-[#059669]', to: '/app/emploi-du-temps' },
  ]
  const teacherStats = [
    { label: 'Cours assignés',    value: overview ? `${overview.courseCount}` : '4',     delta: 'Stable', up: true,  icon: BookOpen,      bg: 'bg-[#eff3ff]', color: 'text-[#1e3a8a]', to: '/app/mes-cours-enseignant' },
    { label: 'Étudiants totaux',  value: overview ? `${overview.studentCount}` : '...',   delta: '+12',    up: true,  icon: UserCheck,     bg: 'bg-[#f0fdfa]', color: 'text-[#0d9488]', to: '/app/mes-cours-enseignant' },
    { label: 'Devoirs à corriger',value: '23',    delta: '+5',     up: false, icon: ClipboardList, bg: 'bg-[#fef3c7]', color: 'text-[#d97706]', to: '/app/mes-cours-enseignant' },
    { label: 'Notes à saisir',    value: '2',     delta: '↓1',     up: true,  icon: TrendingUp,    bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]', to: '/app/mes-cours-enseignant' },
    { label: 'Visioconfs / sem.', value: '3',     delta: '+1',     up: true,  icon: Calendar,      bg: 'bg-[#d1fae5]', color: 'text-[#059669]', to: '/app/visio' },
  ]

  const stats = currentRole === 'teacher' ? teacherStats : currentRole === 'delegate' ? delegateStats : studentStats

  const studentActivities = [
    { text: 'Mathématiques : Devoir 1 rendu',    time: 'Il y a 2h',  icon: ClipboardList, color: 'text-[#1e3a8a] bg-[#eff3ff]' },
    { text: 'Économie : Quiz noté 15/20',         time: 'Il y a 5h',  icon: Star,          color: 'text-[#d97706] bg-[#fef3c7]' },
    { text: 'Anglais : Nouveau cours disponible', time: 'Hier',       icon: BookOpen,      color: 'text-[#0d9488] bg-[#f0fdfa]' },
    { text: 'Physique : Document ajouté',         time: 'Hier',       icon: CheckCircle,   color: 'text-[#059669] bg-[#d1fae5]' },
  ]
  const teacherActivities = [
    { text: 'Support "Arbres & Graphes" publié',  time: 'À l\'instant', icon: BookOpen,   color: 'text-[#1e3a8a] bg-[#eff3ff]' },
    { text: 'Grille de notes INFO201 validée',     time: 'Il y a 2h',  icon: CheckCircle, color: 'text-[#059669] bg-[#d1fae5]' },
    { text: 'Rapport d\'assiduité examiné',        time: 'Hier',       icon: BarChart3,   color: 'text-[#0d9488] bg-[#f0fdfa]' },
    { text: 'Cours initié via visioconférence',    time: 'Hier',       icon: Video,       color: 'text-[#7c3aed] bg-[#ede9fe]' },
  ]
  const delegateActivities = [
    { text: 'Appel validé : Structures de données', time: 'Il y a 1h', icon: UserCheck,     color: 'text-[#0d9488] bg-[#f0fdfa]' },
    { text: 'SMS envoyé à Yasmine Ngo',             time: 'Il y a 3h', icon: MessageSquare, color: 'text-[#1e3a8a] bg-[#eff3ff]' },
    { text: 'Rapport d\'assiduité exporté',         time: 'Hier',      icon: CheckCircle,   color: 'text-[#059669] bg-[#d1fae5]' },
    { text: 'QR Code généré pour INFO201',          time: 'Hier',      icon: Star,          color: 'text-[#d97706] bg-[#fef3c7]' },
  ]
  const activities = currentRole === 'teacher' ? teacherActivities : currentRole === 'delegate' ? delegateActivities : studentActivities

  const studentQuickActions = [
    { label: 'Mes cours',       icon: BookOpen,      to: '/app/cours',          gradient: 'from-[#1e3a8a] to-[#2d4fa8]' },
    { label: 'Devoirs',         icon: ClipboardList, to: '/app/devoirs',        gradient: 'from-[#d97706] to-[#b45309]' },
    { label: 'Visio',           icon: Video,         to: '/app/visio',          gradient: 'from-[#0d9488] to-[#0a7167]' },
    { label: 'Messages',        icon: MessageSquare, to: '/app/messages',       gradient: 'from-[#7c3aed] to-[#6d28d9]' },
  ]
  const teacherQuickActions = [
    { label: 'Espace pédago',   icon: BookOpen,      to: '/app/mes-cours-enseignant', gradient: 'from-[#1e3a8a] to-[#2d4fa8]' },
    { label: 'Visio',           icon: Video,         to: '/app/visio',          gradient: 'from-[#0d9488] to-[#0a7167]' },
    { label: 'Messages',        icon: MessageSquare, to: '/app/messages',       gradient: 'from-[#7c3aed] to-[#6d28d9]' },
    { label: 'Planning',        icon: Calendar,      to: '/app/emploi-du-temps',gradient: 'from-[#d97706] to-[#b45309]' },
  ]
  const delegateQuickActions = [
    { label: 'Gérer présences', icon: UserCheck,     to: '/app/gestion-presences', gradient: 'from-[#0d9488] to-[#0a7167]' },
    { label: 'Messages',        icon: MessageSquare, to: '/app/messages',       gradient: 'from-[#1e3a8a] to-[#2d4fa8]' },
    { label: 'Planning',        icon: Calendar,      to: '/app/emploi-du-temps',gradient: 'from-[#7c3aed] to-[#6d28d9]' },
    { label: 'Visio',           icon: Video,         to: '/app/visio',          gradient: 'from-[#d97706] to-[#b45309]' },
  ]
  const quickActions = currentRole === 'teacher' ? teacherQuickActions : currentRole === 'delegate' ? delegateQuickActions : studentQuickActions

  const roleGradient = currentRole === 'teacher' ? 'from-[#0d9488] to-[#14b8a8]' : currentRole === 'delegate' ? 'from-purple-700 to-purple-500' : 'from-[#1e3a8a] to-[#2d4fa8]'
  const RoleIcon = currentRole === 'teacher' ? UserCheck : currentRole === 'delegate' ? Megaphone : GraduationCap
  const roleLabel = currentRole === 'teacher' ? 'Enseignant' : currentRole === 'delegate' ? 'Délégué' : 'Étudiant'

  const upcomingEvents = [
    { time: '08:00', title: 'Algorithmique — CM', room: 'Salle A204', type: 'CM' },
    { time: '10:15', title: 'Bases de données — TD', room: 'Salle B101', type: 'TD' },
    { time: '14:00', title: 'Réseaux — TP', room: 'Labo C205', type: 'TP' },
  ]

  const typeColor: Record<string, string> = {
    CM: 'bg-[#eff3ff] text-[#1e3a8a]',
    TD: 'bg-[#f0fdfa] text-[#0d9488]',
    TP: 'bg-[#fef3c7] text-[#d97706]',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a8a] via-[#1e4080] to-[#0d9488] p-6 shadow-lg">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="animate-slide-in-left">
            <p className="text-white/70 text-sm font-medium mb-1">
              {formattedToday}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Bonjour, {firstName} 👋
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold text-white">
                <RoleIcon className="h-3.5 w-3.5" />
                {roleLabel}
              </span>
              {currentRole === 'student' && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <Zap className="h-3 w-3" />
                  Semestre 2 actif
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 animate-slide-in-right">
            <button
              onClick={() => refetchOverview()}
              disabled={overviewLoading}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50"
              title="Actualiser les données en direct"
            >
              <RefreshCw className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
            {currentRole === 'student' && (
              <Link
                to="/app/accueil-compact"
                className="rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-all"
              >
                Vue compacte
              </Link>
            )}
            <Link
              to="/app/notifications"
              className="relative rounded-xl bg-white/10 border border-white/20 p-2.5 text-white hover:bg-white/20 transition-all"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Zone Temps Restant Abonnement (Compte Personnel / SaaS) ── */}
      {(getAccountType() === 'PERSONAL' || (currentUser as any)?.accountType === 'PERSONAL' || (currentUser as any)?.role?.includes('INDEPENDENT')) && (
        <div className="animate-fade-in">
          <SubscriptionWidget />
        </div>
      )}

      {/* ── KPI Stats ── */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, delta, up, icon: Icon, bg, color, to }, i) => (
          <div
            key={label}
            onClick={() => navigate(to)}
            className={`rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm card-interactive animate-stagger-${i + 1} cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`rounded-xl p-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <span className={`text-[11px] font-bold rounded-full px-1.5 py-0.5 ${up ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {delta}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-[#111827] stat-number leading-none">{value}</p>
            <p className="text-xs text-[#6b7280] mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Quick Actions */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#111827]">Actions rapides</h2>
              <Zap className="h-4 w-4 text-[#0d9488]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map(({ label, icon: Icon, to, gradient }, i) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className={`flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br ${gradient} p-4 text-white font-semibold text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 animate-stagger-${i + 1}`}
                >
                  <Icon className="h-6 w-6" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Attendance chart (student/delegate) or Grade trend (teacher) */}
          {currentRole !== 'teacher' ? (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">Taux de présence — 6 dernières semaines</h2>
                  <p className="text-xs text-[#6b7280] mt-0.5">Évolution hebdomadaire</p>
                </div>
                <button onClick={() => navigate('/app/presences')} className="text-xs font-semibold text-[#1e3a8a] hover:underline">
                  Voir détails →
                </button>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1e3a8a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[65, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Présence']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#1e3a8a" strokeWidth={2.5} fill="url(#attendanceGrad)" dot={{ r: 4, fill: '#1e3a8a', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">Évolution des moyennes — Algorithmique L2</h2>
                  <p className="text-xs text-[#6b7280] mt-0.5">Progression des étudiants</p>
                </div>
                <button onClick={() => navigate('/app/mes-cours-enseignant')} className="text-xs font-semibold text-[#0d9488] hover:underline">
                  Voir détails →
                </button>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={teacherGradeData}>
                  <defs>
                    <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[10, 20]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [`${v}/20`, 'Moyenne']} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Area type="monotone" dataKey="average" stroke="#0d9488" strokeWidth={2.5} fill="url(#gradeGrad)" dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Activity */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#111827]">Activité récente</h2>
              <span className="text-xs text-[#9ca3af]">Aujourd'hui</span>
            </div>
            <div className="space-y-3">
              {activities.map(({ text, time, icon: Icon, color }, i) => (
                <div key={i} className={`flex items-start gap-3 animate-stagger-${i + 1}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111827] font-medium leading-snug">{text}</p>
                  </div>
                  <span className="text-xs text-[#9ca3af] flex-shrink-0 whitespace-nowrap">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-5">

          {/* Mini calendar */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#111827]">{formattedMonthYear}</h2>
              <button onClick={() => navigate('/app/emploi-du-temps')} className="text-xs font-semibold text-[#1e3a8a] hover:underline">
                Calendrier →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {calDays.map(d => (
                <span key={d} className="text-center text-[10px] font-bold text-[#9ca3af] uppercase">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: calOffset }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: calTotal }, (_, i) => i + 1).map(d => (
                <button
                  key={d}
                  onClick={() => setActiveCalDay(d)}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                    d === activeCalDay
                      ? 'bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] text-white shadow-md scale-110'
                      : d === today
                      ? 'bg-[#eff3ff] text-[#1e3a8a] font-bold'
                      : eventDays.includes(d)
                      ? 'text-[#0d9488] font-bold relative'
                      : 'text-[#374151] hover:bg-[#f3f4f6]'
                  }`}
                >
                  {d}
                  {eventDays.includes(d) && d !== activeCalDay && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#0d9488]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Today's schedule */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#111827]">Aujourd'hui</h2>
              <button onClick={() => navigate('/app/emploi-du-temps')} className="text-xs font-semibold text-[#1e3a8a] hover:underline">Voir tout →</button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map(({ time, title, room, type }, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl p-3 ${i === 0 ? 'bg-[#eff3ff] border border-[#1e3a8a]/10' : 'bg-[#f9fafb]'} animate-stagger-${i + 1}`}>
                  <div className="text-center flex-shrink-0 w-10">
                    <p className="text-xs font-bold text-[#1e3a8a]">{time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#111827] truncate">{title}</p>
                    <p className="text-[11px] text-[#6b7280]">{room}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${typeColor[type]}`}>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grade distribution (student only) */}
          {currentRole === 'student' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#111827]">Distribution des notes</h2>
                <button onClick={() => navigate('/app/notes')} className="text-xs font-semibold text-[#1e3a8a] hover:underline">Voir →</button>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={gradeDistrib} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="value" paddingAngle={4}>
                    {gradeDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}%`, '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5">
                {gradeDistrib.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-[#6b7280]">{d.name}</span>
                    <span className="ml-auto font-bold text-[#111827]">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teacher: pending tasks */}
          {currentRole === 'teacher' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#111827]">À faire</h2>
                <AlertTriangle className="h-4 w-4 text-[#d97706]" />
              </div>
              <div className="space-y-2.5">
                {[
                  { task: '23 copies à corriger', course: 'INFO101 Algorithmique', urgent: true },
                  { task: 'Saisir notes INFO201', course: 'Bases de données L2',  urgent: false },
                  { task: 'Préparer TD Réseaux', course: 'INFO301 Vendredi',       urgent: false },
                ].map(({ task, course, urgent }, i) => (
                  <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ${urgent ? 'bg-red-50 border border-red-100' : 'bg-[#f9fafb]'}`}>
                    <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${urgent ? 'bg-red-500' : 'bg-[#9ca3af]'}`} />
                    <div>
                      <p className={`text-xs font-semibold ${urgent ? 'text-red-700' : 'text-[#111827]'}`}>{task}</p>
                      <p className="text-[11px] text-[#6b7280]">{course}</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/app/mes-cours-enseignant')}
                  className="w-full rounded-xl bg-[#1e3a8a] py-2 text-xs font-bold text-white hover:bg-[#2d4fa8] transition-colors mt-1"
                >
                  Gérer l'espace pédagogique →
                </button>
              </div>
            </div>
          )}

          {/* Delegate: cohorte summary */}
          {currentRole === 'delegate' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#111827]">Cohorte L2 Info</h2>
                <Users className="h-4 w-4 text-[#0d9488]" />
              </div>
              <div className="text-center py-2 mb-4">
                <div className="text-4xl font-extrabold text-[#1e3a8a] stat-number">89%</div>
                <p className="text-xs text-[#6b7280] mt-1">Taux de présence global</p>
                <div className="mt-3 h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] progress-animated" style={{ width: '89%' }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { v: '46', l: 'Présents', c: 'text-emerald-600 bg-emerald-50' },
                  { v: '4',  l: 'Absents',  c: 'text-red-600 bg-red-50' },
                  { v: '2',  l: 'Retards',  c: 'text-amber-600 bg-amber-50' },
                ].map(({ v, l, c }) => (
                  <div key={l} className={`rounded-xl py-2 ${c}`}>
                    <p className="text-xl font-extrabold stat-number">{v}</p>
                    <p className="text-[10px] font-semibold">{l}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/app/gestion-presences')}
                className="w-full mt-3 rounded-xl bg-[#0d9488] py-2 text-xs font-bold text-white hover:bg-[#0a7167] transition-colors"
              >
                Gérer les présences →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
