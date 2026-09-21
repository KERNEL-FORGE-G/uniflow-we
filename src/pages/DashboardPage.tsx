import { Link, useNavigate } from 'react-router-dom'
import { IconTile, UniIcon, type UniIconName } from '../components/ui/UniIcon'
import { hexWithAlpha } from '../lib/subjectIcon'
import { useUserRole } from '../utils/userRole'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, AreaChart, Area } from 'recharts'
import { useEffect, useState } from 'react'
import { assignmentsApi, attendanceApi, coursesApi, gradesApi, notificationsApi, schedulesApi, studentsApi, type Assignment, type Grade, type Notification, type Schedule } from '../lib/api'
import { SubscriptionWidget } from '../components/subscription/SubscriptionWidget'
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus'
import { attendanceRate } from '../lib/assignmentModel'
import { dueWithin, eventDaysInMonth, gradeDistribution, gradedStudentCount, passRate, relativeTime, teacherAverages, todaysSessions, weeklyAttendanceTrend } from '../lib/dashboardModel'

/** Icône et couleur (hex, pour la tuile) d'une entrée d'activité d'après le type de notification Appwrite. */
function activityStyle(type: string): { icon: UniIconName; color: string } {
  const key = type.toUpperCase()
  if (key.includes('ASSIGNMENT') || key.includes('SUBMISSION')) return { icon: 'assignments', color: '#D97706' }
  if (key.includes('SCHEDULE')) return { icon: 'schedule', color: '#0D9488' }
  if (key.includes('ATTENDANCE')) return { icon: 'attendance', color: '#059669' }
  if (key.includes('MESSAGE')) return { icon: 'messages', color: '#7C3AED' }
  if (key.includes('GRADE') || key.includes('NOTE')) return { icon: 'grades', color: '#1E3A8A' }
  return { icon: 'notifications', color: '#6B7280' }
}

/** Couleurs UniFlow des cartes de statistiques et des actions rapides (une tuile = une couleur pleine). */
const TILE = { blue: '#1E3A8A', amber: '#D97706', teal: '#0D9488', purple: '#7C3AED', green: '#059669' } as const

// Calendar helper
const calDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function DashboardPage() {
  const { currentRole, currentUser, language, authUser, isSessionReady } = useUserRole()
  const navigate = useNavigate()
  // « Pr. Fouda » saluait « Bonjour, Pr. » : un titre en tête n'est pas un prénom.
  const nameParts = currentUser.name.trim().split(/\s+/)
  const firstName = /^(pr|dr|m|mme|mlle|me)\.?$/i.test(nameParts[0] ?? '') ? currentUser.name.trim() : nameParts[0]

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

  const [activeCalDay, setActiveCalDay] = useState(today)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<Array<{ status: string; at: string }>>([])
  const eventDays = eventDaysInMonth(schedules, currentYear, currentMonth)
  const [overview, setOverview] = useState<{ courseCount: number; assignmentCount: number; pendingAssignmentCount: number; gradeCount: number; averageGrade: number | null; attendanceRate: number | null; studentCount: number }>({ courseCount: 0, assignmentCount: 0, pendingAssignmentCount: 0, gradeCount: 0, averageGrade: null, attendanceRate: null, studentCount: 0 })
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const refetchOverview = async () => {
    setOverviewLoading(true)
    setOverviewError(null)
    try {
      // Les encarts secondaires ne doivent pas faire échouer les compteurs : chacun retombe sur vide.
      const [courses, loadedAssignments, loadedGrades, records, loadedSchedules, loadedNotifications, studentCount] = await Promise.all([
        coursesApi.mine(),
        assignmentsApi.mine(),
        gradesApi.mine(),
        attendanceApi.myRecords().catch(() => []),
        schedulesApi.mine().catch(() => []),
        notificationsApi.list().catch(() => []),
        currentRole === 'student' ? Promise.resolve(0) : studentsApi.countForMyCourses().catch(() => 0),
      ])
      const gradeAverage = loadedGrades.length ? loadedGrades.reduce((sum, grade) => sum + Number(grade.grade), 0) / loadedGrades.length : null
      // « Devoirs à rendre » ne compte que ce qui reste à faire ; un devoir déjà
      // rendu ou noté n'est plus une tâche.
      const pending = loadedAssignments.filter((assignment) => assignment.status === 'À rendre' || assignment.status === 'En retard').length
      const nextOverview = { courseCount: courses.length, assignmentCount: loadedAssignments.length, pendingAssignmentCount: pending, gradeCount: loadedGrades.length, averageGrade: gradeAverage == null ? null : Number(gradeAverage.toFixed(2)), attendanceRate: attendanceRate(records), studentCount }
      setOverview(nextOverview)
      setAssignments(loadedAssignments)
      setGrades(loadedGrades)
      setAttendanceRecords(records)
      setSchedules(loadedSchedules)
      setNotifications(loadedNotifications)
      return nextOverview
    } catch (err) {
      setOverviewError(err instanceof Error ? err.message : 'Impossible de charger les données Appwrite du dashboard.')
      setOverview({ courseCount: 0, assignmentCount: 0, pendingAssignmentCount: 0, gradeCount: 0, averageGrade: null, attendanceRate: null, studentCount: 0 })
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

  type StatCard = { label: string; value: string; delta: string; up: boolean; icon: UniIconName; color: string; to: string }
  const studentStats: StatCard[] = [
    { label: 'Cours inscrits',   value: overview ? `${overview.courseCount}` : '0',      delta: overview?.courseCount ? 'Données réelles' : 'Aucune donnée',    up: Boolean(overview?.courseCount),  icon: 'courses',     color: TILE.blue,   to: '/app/cours' },
    { label: 'Devoirs à rendre', value: overview ? `${overview.pendingAssignmentCount ?? 0}` : '0',       delta: overview?.assignmentCount ? `${overview.assignmentCount} au total` : 'Aucun devoir',     up: true, icon: 'assignments', color: TILE.amber,  to: '/app/devoirs' },
    { label: 'Emploi du temps',   value: overview?.courseCount ? `${overview.courseCount} cours` : 'Aucun',    delta: overview?.courseCount ? 'Données réelles' : 'Aucune donnée',   up: Boolean(overview?.courseCount),  icon: 'schedule',    color: TILE.teal,   to: '/app/emploi-du-temps' },
    { label: 'Moyenne',          value: overview?.averageGrade != null ? `${overview.averageGrade}/20` : '—', delta: overview?.gradeCount ? `${overview.gradeCount} notes` : 'Aucune note',   up: (overview?.averageGrade ?? 10) >= 10,  icon: 'grades',      color: TILE.purple, to: '/app/notes' },
    { label: 'Présences',        value: overview?.attendanceRate != null ? `${overview.attendanceRate}%` : '—',     delta: attendanceRecords.length ? `${attendanceRecords.length} séances` : 'Aucun relevé',    up: (overview?.attendanceRate ?? 100) >= 75, icon: 'attendance',  color: TILE.green,  to: '/app/presences' },
  ]
  // Les pastilles des cartes disent d'où vient le chiffre ; les anciennes
  // valeurs fixes (« Incrémental », « 0 ») laissaient croire à des compteurs morts.
  const unreadCount = notifications.filter((item) => !item.isRead).length
  const dueSoon = dueWithin(assignments, now)
  const successRate = passRate(grades)
  const gradedStudents = gradedStudentCount(grades)
  const weeklySessions = schedules.length ? `${schedules.length} séance${schedules.length > 1 ? 's' : ''} / semaine` : 'Aucune séance planifiée'
  const delegateStats: StatCard[] = [
    { label: 'Taux présence',     value: overview?.attendanceRate != null ? `${overview.attendanceRate}%` : '—',  delta: attendanceRecords.length ? `${attendanceRecords.length} séances` : 'Aucun relevé',    up: (overview?.attendanceRate ?? 100) >= 75,  icon: 'attendance',  color: TILE.teal,   to: '/app/gestion-presences' },
    { label: 'Séances / semaine', value: `${schedules.length}`, delta: overview.courseCount ? `${overview.courseCount} cours` : 'Aucun cours', up: schedules.length > 0, icon: 'schedule', color: TILE.blue, to: '/app/emploi-du-temps' },
    { label: 'Devoirs à rendre',  value: `${overview.pendingAssignmentCount}`, delta: dueSoon ? `${dueSoon} sous 7 jours` : 'Aucune échéance proche', up: dueSoon === 0, icon: 'assignments', color: TILE.amber, to: '/app/devoirs' },
    { label: 'Étudiants suivis',  value: `${overview.studentCount}`,   delta: overview.studentCount ? 'Inscrits à la promotion' : 'Aucun inscrit',  up: overview.studentCount > 0,  icon: 'students',    color: TILE.purple, to: '/app/etudiants' },
    { label: 'Notifications',     value: `${unreadCount}`, delta: unreadCount ? 'Non lues' : 'Tout est lu', up: unreadCount === 0, icon: 'notifications', color: TILE.green, to: '/app/notifications' },
  ]
  const teacherStats: StatCard[] = [
    { label: 'Cours créés',       value: `${overview.courseCount}`,     delta: weeklySessions, up: schedules.length > 0,  icon: 'courses',     color: TILE.blue,   to: '/app/mes-cours-enseignant' },
    { label: 'Étudiants enregistrés',  value: `${overview.studentCount}`,   delta: overview.studentCount ? 'Inscrits à vos cours' : 'Aucun inscrit',    up: overview.studentCount > 0,  icon: 'students',    color: TILE.teal,   to: '/app/etudiants' },
    { label: 'Devoirs créés',     value: `${overview.assignmentCount}`,    delta: dueSoon ? `${dueSoon} à échéance sous 7 j` : 'Aucune échéance proche',     up: true, icon: 'assignments', color: TILE.amber,  to: '/app/devoirs' },
    { label: 'Notes saisies',     value: `${overview.gradeCount}`,     delta: gradedStudents ? `${gradedStudents} étudiant${gradedStudents > 1 ? 's' : ''} noté${gradedStudents > 1 ? 's' : ''}` : 'Aucune note',     up: gradedStudents > 0,  icon: 'grades',      color: TILE.purple, to: '/app/notes' },
    { label: 'Moyenne générale',  value: overview.averageGrade != null ? `${overview.averageGrade}/20` : '—',     delta: successRate != null ? `${successRate} % ≥ 10/20` : 'Aucune note',     up: (successRate ?? 100) >= 50,  icon: 'stats',       color: TILE.green,  to: '/app/notes' },
  ]

  const stats = currentRole === 'teacher' ? teacherStats : currentRole === 'delegate' ? delegateStats : studentStats

  const gradeDistrib = gradeDistribution(grades)
  const attendanceTrend = weeklyAttendanceTrend(attendanceRecords, now)
  const teacherGradeData = teacherAverages(grades)

  // Activité récente : les cinq dernières notifications, complétées par les
  // devoirs proches de l'échéance quand il n'y a rien d'autre à montrer.
  const activities: Array<{ text: string; time: string; icon: UniIconName; color: string }> = [
    ...[...notifications]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 5)
      .map((item) => ({ text: item.title, time: relativeTime(item.createdAt, now), ...activityStyle(item.type) })),
    ...(notifications.length === 0
      ? assignments
        .filter((assignment) => assignment.status === 'À rendre' || assignment.status === 'En retard')
        .slice(0, 3)
        .map((assignment) => ({ text: `${assignment.title} — ${assignment.status.toLowerCase()}`, time: relativeTime(assignment.due, now), icon: 'assignments' as UniIconName, color: TILE.amber }))
      : []),
  ]

  type QuickAction = { label: string; icon: UniIconName; to: string; color: string }
  const studentQuickActions: QuickAction[] = [
    { label: 'Mes cours',       icon: 'courses',     to: '/app/cours',          color: TILE.blue },
    { label: 'Devoirs',         icon: 'assignments', to: '/app/devoirs',        color: TILE.amber },
    { label: 'Visio',           icon: 'video',       to: '/app/visio',          color: TILE.teal },
    { label: 'Messages',        icon: 'messages',    to: '/app/messages',       color: TILE.purple },
  ]
  const teacherQuickActions: QuickAction[] = [
    { label: 'Espace pédago',   icon: 'teacher',     to: '/app/mes-cours-enseignant', color: TILE.blue },
    { label: 'Visio',           icon: 'video',       to: '/app/visio',          color: TILE.teal },
    { label: 'Messages',        icon: 'messages',    to: '/app/messages',       color: TILE.purple },
    { label: 'Planning',        icon: 'schedule',    to: '/app/emploi-du-temps', color: TILE.amber },
  ]
  const delegateQuickActions: QuickAction[] = [
    { label: 'Gérer présences', icon: 'attendance',  to: '/app/gestion-presences', color: TILE.teal },
    { label: 'Messages',        icon: 'messages',    to: '/app/messages',       color: TILE.blue },
    { label: 'Planning',        icon: 'schedule',    to: '/app/emploi-du-temps', color: TILE.purple },
    { label: 'Visio',           icon: 'video',       to: '/app/visio',          color: TILE.amber },
  ]
  const quickActions = currentRole === 'teacher' ? teacherQuickActions : currentRole === 'delegate' ? delegateQuickActions : studentQuickActions

  const roleIcon: UniIconName = currentRole === 'teacher' ? 'teacher' : currentRole === 'delegate' ? 'megaphone' : 'students'
  const roleLabel = currentRole === 'teacher' ? 'Enseignant' : currentRole === 'delegate' ? 'Délégué' : 'Étudiant'

  const upcomingEvents = todaysSessions(schedules, now)

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
                <UniIcon name={roleIcon} weight="fill" size={14} />
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
              <UniIcon name="refresh" weight="bold" size={16} className={overviewLoading ? 'animate-spin' : ''} />
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
              aria-label="Notifications"
            >
              <UniIcon name="notifications" weight="fill" size={20} />
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
        {stats.map(({ label, value, delta, up, icon, color, to }, i) => (
          <div
            key={label}
            onClick={() => navigate(to)}
            className={`rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm card-interactive animate-stagger-${i + 1} cursor-pointer`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <IconTile name={icon} color={color} variant="filled" size={56} index={i} />
              <span className={`text-[11px] font-bold rounded-full px-1.5 py-0.5 text-right ${up ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
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
              <UniIcon name="lightning" weight="fill" size={16} className="text-[#0d9488]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map(({ label, icon, to, color }, i) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  style={{ backgroundColor: hexWithAlpha(color, 0.08), borderColor: hexWithAlpha(color, 0.18) }}
                  className={`flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-xs font-semibold text-[#111827] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-stagger-${i + 1}`}
                >
                  <IconTile name={icon} color={color} variant="filled" size={44} index={i} />
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
                  <h2 className="text-sm font-bold text-[#111827]">Évolution des moyennes{currentUser.scopeLabel ? ` — ${currentUser.scopeLabel}` : ''}</h2>
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
              <Link to="/app/notifications" className="text-xs font-semibold text-[#1e3a8a] hover:underline">Tout voir →</Link>
            </div>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map(({ text, time, icon, color }, i) => (
                  <div key={i} className={`flex items-start gap-3 animate-stagger-${i + 1}`}>
                    <IconTile name={icon} color={color} variant="soft" size={36} index={i} />
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
                    <IconTile subject={title} color={i === 0 ? TILE.blue : TILE.teal} variant={i === 0 ? 'filled' : 'soft'} size={36} index={i} />
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
                <UniIcon name="tasks" size={18} className="text-[#d97706]" />
                <h2 className="text-sm font-bold text-[#111827]">Tâches pédagogiques</h2>
              </div>
              <p className="text-xs text-[#6b7280]">Les tâches pédagogiques Appwrite apparaîtront ici dès leur enregistrement pour ce cours.</p>
              <button onClick={() => navigate('/app/mes-cours-enseignant')} className="mt-3 text-xs font-bold text-[#1e3a8a] hover:underline">Ouvrir l’espace pédagogique →</button>
            </div>
          )}

          {currentRole === 'delegate' && (
            <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <UniIcon name="forum" size={18} className="text-[#0d9488]" />
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
