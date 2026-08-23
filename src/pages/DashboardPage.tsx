import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList, Clock, TrendingUp, UserCheck, Calendar, Bell, GraduationCap, Megaphone, Video, MessageSquare, BarChart3, ChevronRight, Star, Zap, Users, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useUserRole } from '../utils/userRole'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, AreaChart, Area } from 'recharts'
import { useEffect, useState } from 'react'
import { assignmentsApi, coursesApi, gradesApi } from '../lib/api'
import { SubscriptionWidget } from '../components/subscription/SubscriptionWidget'
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus'

type AttendancePoint = { week: string; rate: number }
type GradePoint = { week: string; average: number }
type GradeDistributionPoint = { name: string; value: number; color: string }

const gradeDistrib: GradeDistributionPoint[] = []
const attendanceTrend: AttendancePoint[] = []
const teacherGradeData: GradePoint[] = []

// Calendar helper
const calDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function DashboardPage() {
  const { currentRole, currentUser, language, authUser, isSessionReady } = useUserRole()
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

  const eventDays: number[] = []

  const [activeCalDay, setActiveCalDay] = useState(today)
  const [overview, setOverview] = useState<{ courseCount: number; assignmentCount: number; gradeCount: number; averageGrade: number | null; attendanceRate: number | null; studentCount: number }>({ courseCount: 0, assignmentCount: 0, gradeCount: 0, averageGrade: null, attendanceRate: null, studentCount: 0 })
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const refetchOverview = async () => {
    setOverviewLoading(true)
    setOverviewError(null)
    try {
      const [courses, assignments, grades] = await Promise.all([coursesApi.mine(), assignmentsApi.mine(), gradesApi.mine()])
      const gradeAverage = grades.length ? grades.reduce((sum, grade) => sum + Number(grade.grade), 0) / grades.length : null
      const nextOverview = { courseCount: courses.length, assignmentCount: assignments.length, gradeCount: grades.length, averageGrade: gradeAverage == null ? null : Number(gradeAverage.toFixed(2)), attendanceRate: null, studentCount: 0 }
      setOverview(nextOverview)
      return nextOverview
    } catch (err) {
      setOverviewError(err instanceof Error ? err.message : 'Impossible de charger les données Appwrite du dashboard.')
      setOverview({ courseCount: 0, assignmentCount: 0, gradeCount: 0, averageGrade: null, attendanceRate: null, studentCount: 0 })
      return null
    } finally {
      setOverviewLoading(false)
    }
  }

  useEffect(() => {
    if (!isSessionReady || !authUser?.id) return
    let cancelled = false
    const loadAfterSession = async () => {
      // Lors d’une reprise à froid, Appwrite peut d’abord restaurer l’identité,
      // puis les droits de lecture des collections. Les essais sont bornés et
      // s’arrêtent dès qu’une donnée réelle est reçue.
      const retryDelays = [0, 900, 2_100, 4_000]
      for (let attempt = 0; attempt < retryDelays.length && !cancelled; attempt += 1) {
        if (retryDelays[attempt] > 0) await new Promise((resolve) => window.setTimeout(resolve, retryDelays[attempt]))
        if (cancelled) return
        const loaded = await refetchOverview()
        if (loaded && (loaded.courseCount > 0 || loaded.assignmentCount > 0 || loaded.gradeCount > 0)) return
      }
    }
    const onSessionRestored = () => { void loadAfterSession() }
    window.addEventListener('uniflow:session-restored', onSessionRestored)
    void loadAfterSession()
    return () => {
      cancelled = true
      window.removeEventListener('uniflow:session-restored', onSessionRestored)
    }
  }, [authUser?.id, isSessionReady])
  const isEmptyData = overview.courseCount === 0 && overview.assignmentCount === 0 && overview.gradeCount === 0

  const studentStats = [
    { label: 'Cours inscrits',   value: overview ? `${overview.courseCount}` : '0',      delta: overview?.courseCount ? 'Données réelles' : 'Aucune donnée',    up: Boolean(overview?.courseCount),  icon: BookOpen,      bg: 'bg-[#eff3ff]', color: 'text-[#1e3a8a]', to: '/app/cours' },
    { label: 'Devoirs à rendre', value: overview ? `${overview.assignmentCount ?? 0}` : '0',       delta: '0',     up: true, icon: ClipboardList, bg: 'bg-[#fef3c7]', color: 'text-[#d97706]', to: '/app/devoirs' },
    { label: 'Emploi du temps',   value: overview?.courseCount ? `${overview.courseCount} cours` : 'Aucun',    delta: overview?.courseCount ? 'Données réelles' : 'Aucune donnée',   up: Boolean(overview?.courseCount),  icon: Clock,         bg: 'bg-[#f0fdfa]', color: 'text-[#0d9488]', to: '/app/emploi-du-temps' },
    { label: 'Moyenne',          value: overview?.averageGrade != null ? `${overview.averageGrade}/20` : '—', delta: '0',   up: true,  icon: TrendingUp,    bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]', to: '/app/notes' },
    { label: 'Présences',        value: overview?.attendanceRate != null ? `${overview.attendanceRate}%` : '—',     delta: '0%',    up: true, icon: UserCheck,     bg: 'bg-[#d1fae5]', color: 'text-[#059669]', to: '/app/presences' },
  ]
  const delegateStats = [
    { label: 'Taux présence',     value: overview?.attendanceRate != null ? `${overview.attendanceRate}%` : '—',  delta: '0%',    up: true,  icon: UserCheck,     bg: 'bg-[#f0fdfa]', color: 'text-[#0d9488]', to: '/app/gestion-presences' },
    { label: 'Sync. en attente',  value: '0',    delta: 'En ligne', up: true, icon: ClipboardList, bg: 'bg-[#eff3ff]', color: 'text-[#1e3a8a]', to: '/app/gestion-presences' },
    { label: 'Justif. en attente',value: '0',    delta: '0',     up: true,  icon: Bell,          bg: 'bg-[#fef3c7]', color: 'text-[#d97706]', to: '/app/gestion-presences' },
    { label: 'Étudiants suivis',  value: overview ? `${overview.studentCount}` : '0',   delta: 'Personnel',  up: true,  icon: BookOpen,      bg: 'bg-[#eff3ff]', color: 'text-[#1e3a8a]', to: '/app/etudiants' },
    { label: 'Sessions validées', value: '0',   delta: '0',     up: true,  icon: Calendar,      bg: 'bg-[#d1fae5]', color: 'text-[#059669]', to: '/app/emploi-du-temps' },
  ]
  const teacherStats = [
    { label: 'Cours créés',       value: overview ? `${overview.courseCount}` : '0',     delta: 'Incrémental', up: true,  icon: BookOpen,      bg: 'bg-[#eff3ff]', color: 'text-[#1e3a8a]', to: '/app/mes-cours-enseignant' },
    { label: 'Étudiants enregistrés',  value: overview ? `${overview.studentCount}` : '0',   delta: 'Actifs',    up: true,  icon: UserCheck,     bg: 'bg-[#f0fdfa]', color: 'text-[#0d9488]', to: '/app/etudiants' },
    { label: 'Devoirs créés',     value: overview ? `${overview.assignmentCount ?? 0}` : '0',    delta: '0',     up: true, icon: ClipboardList, bg: 'bg-[#fef3c7]', color: 'text-[#d97706]', to: '/app/devoirs' },
    { label: 'Notes saisies',     value: overview ? `${overview.gradeCount ?? 0}` : '0',     delta: '0',     up: true,  icon: TrendingUp,    bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]', to: '/app/notes' },
    { label: 'Moyenne générale',  value: overview?.averageGrade != null ? `${overview.averageGrade}/20` : '—',     delta: '0',     up: true,  icon: Calendar,      bg: 'bg-[#d1fae5]', color: 'text-[#059669]', to: '/app/notes' },
  ]

  const stats = currentRole === 'teacher' ? teacherStats : currentRole === 'delegate' ? delegateStats : studentStats

  const activities: Array<{ text: string; time: string; icon: typeof BookOpen; color: string }> = []

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

  const upcomingEvents: Array<{ time: string; title: string; room: string; type: string }> = []

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
            </Link>
          </div>
        </div>
      </div>

      {overviewError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{overviewError}</div>}
      {/* ── Card Statut d'Abonnement / Plan Académique ── */}
      <div className="animate-fade-in">
        <SubscriptionStatus />
      </div>

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
              {attendanceTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={attendanceTrend}>
                    <defs>
                      <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[65, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any) => [`${v}%`, 'Présence']} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Area type="monotone" dataKey="rate" stroke="#1e3a8a" strokeWidth={2.5} fill="url(#attendanceGrad)" dot={{ r: 4, fill: '#1e3a8a', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-[180px] items-center justify-center text-xs text-[#6b7280]">Aucune donnée de présence disponible.</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">Évolution des moyennes — ICT4D L1</h2>
                  <p className="text-xs text-[#6b7280] mt-0.5">Progression des étudiants</p>
                </div>
                <button onClick={() => navigate('/app/mes-cours-enseignant')} className="text-xs font-semibold text-[#0d9488] hover:underline">
                  Voir détails →
                </button>
              </div>
              {teacherGradeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={teacherGradeData}>
                    <defs>
                      <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[10, 20]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any) => [`${v}/20`, 'Moyenne']} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Area type="monotone" dataKey="average" stroke="#0d9488" strokeWidth={2.5} fill="url(#gradeGrad)" dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-[180px] items-center justify-center text-xs text-[#6b7280]">Aucune moyenne disponible.</p>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#111827]">Activité récente</h2>
              <span className="text-xs text-[#9ca3af]">Aujourd'hui</span>
            </div>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map(({ text, time, icon: Icon, color }, i) => (
                  <div key={i} className={`flex items-start gap-3 animate-stagger-${i + 1}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-sm text-[#111827] font-medium leading-snug">{text}</p></div>
                    <span className="text-xs text-[#9ca3af] flex-shrink-0 whitespace-nowrap">{time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6b7280]">Aucune activité académique Appwrite n’est encore disponible.</p>
            )}
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
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map(({ time, title, room, type }, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-xl p-3 ${i === 0 ? 'bg-[#eff3ff] border border-[#1e3a8a]/10' : 'bg-[#f9fafb]'} animate-stagger-${i + 1}`}>
                    <div className="text-center flex-shrink-0 w-10"><p className="text-xs font-bold text-[#1e3a8a]">{time}</p></div>
                    <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-[#111827] truncate">{title}</p><p className="text-[11px] text-[#6b7280]">{room}</p></div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${typeColor[type] || 'bg-[#f3f4f6] text-[#6b7280]'}`}>{type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6b7280]">Aucun cours Appwrite n’est planifié aujourd’hui.</p>
            )}
          </div>

          {/* Grade distribution (student only) */}
          {currentRole === 'student' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#111827]">Distribution des notes</h2>
                <button onClick={() => navigate('/app/notes')} className="text-xs font-semibold text-[#1e3a8a] hover:underline">Voir →</button>
              </div>
              {gradeDistrib.length > 0 ? (
                <>
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
                      <div key={d.name} className="flex items-center gap-1.5 text-xs"><span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} /><span className="text-[#6b7280]">{d.name}</span><span className="ml-auto font-bold text-[#111827]">{d.value}%</span></div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-8 text-xs text-[#6b7280]">Aucune note disponible pour calculer une distribution.</p>
              )}
            </div>
          )}

          {currentRole === 'teacher' && (
            <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-[#d97706]" />
                <h2 className="text-sm font-bold text-[#111827]">Tâches pédagogiques</h2>
              </div>
              <p className="text-xs text-[#6b7280]">Les tâches pédagogiques Appwrite apparaîtront ici dès leur enregistrement pour ce cours.</p>
              <button onClick={() => navigate('/app/mes-cours-enseignant')} className="mt-3 text-xs font-bold text-[#1e3a8a] hover:underline">Ouvrir l’espace pédagogique →</button>
            </div>
          )}

          {currentRole === 'delegate' && (
            <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-[#0d9488]" />
                <h2 className="text-sm font-bold text-[#111827]">Suivi de cohorte</h2>
              </div>
              <p className="text-xs text-[#6b7280]">Les statistiques de cohorte apparaîtront lorsque les données de présence Appwrite seront agrégées.</p>
              <button onClick={() => navigate('/app/gestion-presences')} className="mt-3 text-xs font-bold text-[#0d9488] hover:underline">Gérer les présences →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
