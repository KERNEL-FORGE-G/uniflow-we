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
import { loadDailyQuests, loadUserXp, type QuestWithProgress, type UserXp } from '../lib/gamification'

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
 const [dailyQuests, setDailyQuests] = useState<QuestWithProgress[]>([])
 const [userXp, setUserXp] = useState<UserXp | null>(null)
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

 useEffect(() => {
 const uid = authUser?.id || 'guest_user'
 loadDailyQuests(uid).then(setDailyQuests)
 loadUserXp(uid).then(setUserXp)
 }, [authUser?.id])

 const eventDays = eventDaysInMonth(schedules, currentYear, currentMonth)
 const isEmptyData = overview.courseCount === 0 && overview.assignmentCount === 0 && overview.gradeCount === 0

 type StatCard = { label: string; value: string; delta: string; up: boolean; icon: UniIconName; color: string; to: string; imageSrc?: string }
 const studentStats: StatCard[] = [
 { label: 'Cours inscrits', value: overview ? `${overview.courseCount}` : '0', delta: overview?.courseCount ? 'Données réelles' : 'Aucune donnée', up: Boolean(overview?.courseCount), icon: 'courses', color: TILE.blue, to: '/app/cours', imageSrc: '/icons/nav/courses.png' },
 { label: 'Devoirs à rendre', value: overview ? `${overview.pendingAssignmentCount ?? 0}` : '0', delta: overview?.assignmentCount ? `${overview.assignmentCount} au total` : 'Aucun devoir', up: true, icon: 'assignments', color: TILE.amber, to: '/app/devoirs', imageSrc: '/icons/nav/assignments.png' },
 { label: 'Emploi du temps', value: overview?.courseCount ? `${overview.courseCount} cours` : 'Aucun', delta: overview?.courseCount ? 'Données réelles' : 'Aucune donnée', up: Boolean(overview?.courseCount), icon: 'schedule', color: TILE.teal, to: '/app/emploi-du-temps', imageSrc: '/icons/nav/schedule.png' },
 { label: 'Moyenne', value: overview?.averageGrade != null ? `${overview.averageGrade}/20` : '—', delta: overview?.gradeCount ? `${overview.gradeCount} notes` : 'Aucune note', up: (overview?.averageGrade ?? 10) >= 10, icon: 'grades', color: TILE.purple, to: '/app/notes', imageSrc: '/icons/nav/grades.png' },
 { label: 'Présences', value: overview?.attendanceRate != null ? `${overview.attendanceRate}%` : '—', delta: attendanceRecords.length ? `${attendanceRecords.length} séances` : 'Aucun relevé', up: (overview?.attendanceRate ?? 100) >= 75, icon: 'attendance', color: TILE.green, to: '/app/presences', imageSrc: '/icons/nav/attendance.png' },
 ]
 // Les pastilles des cartes disent d'où vient le chiffre ; les anciennes
 // valeurs fixes (« Incrémental », « 0 ») laissaient croire à des compteurs morts.
 const unreadCount = notifications.filter((item) => !item.isRead).length
 const dueSoon = dueWithin(assignments, now)
 const successRate = passRate(grades)
 const gradedStudents = gradedStudentCount(grades)
 const weeklySessions = schedules.length ? `${schedules.length} séance${schedules.length > 1 ? 's' : ''} / semaine` : 'Aucune séance planifiée'
 const delegateStats: StatCard[] = [
 { label: 'Taux présence', value: overview?.attendanceRate != null ? `${overview.attendanceRate}%` : '—', delta: attendanceRecords.length ? `${attendanceRecords.length} séances` : 'Aucun relevé', up: (overview?.attendanceRate ?? 100) >= 75, icon: 'attendance', color: TILE.teal, to: '/app/gestion-presences', imageSrc: '/icons/nav/attendance.png' },
 { label: 'Séances / semaine', value: `${schedules.length}`, delta: overview.courseCount ? `${overview.courseCount} cours` : 'Aucun cours', up: schedules.length > 0, icon: 'schedule', color: TILE.blue, to: '/app/emploi-du-temps', imageSrc: '/icons/nav/schedule.png' },
 { label: 'Devoirs à rendre', value: `${overview.pendingAssignmentCount}`, delta: dueSoon ? `${dueSoon} sous 7 jours` : 'Aucune échéance proche', up: dueSoon === 0, icon: 'assignments', color: TILE.amber, to: '/app/devoirs', imageSrc: '/icons/nav/assignments.png' },
 { label: 'Étudiants suivis', value: `${overview.studentCount}`, delta: overview.studentCount ? 'Inscrits à la promotion' : 'Aucun inscrit', up: overview.studentCount > 0, icon: 'students', color: TILE.purple, to: '/app/etudiants', imageSrc: '/icons/nav/students.png' },
 { label: 'Notifications', value: `${unreadCount}`, delta: unreadCount ? 'Non lues' : 'Tout est lu', up: unreadCount === 0, icon: 'notifications', color: TILE.green, to: '/app/notifications', imageSrc: '/icons/nav/notifications.png' },
 ]
 const teacherStats: StatCard[] = [
 { label: 'Cours créés', value: `${overview.courseCount}`, delta: weeklySessions, up: schedules.length > 0, icon: 'courses', color: TILE.blue, to: '/app/mes-cours-enseignant', imageSrc: '/icons/nav/courses.png' },
 { label: 'Étudiants enregistrés', value: `${overview.studentCount}`, delta: overview.studentCount ? 'Inscrits à vos cours' : 'Aucun inscrit', up: overview.studentCount > 0, icon: 'students', color: TILE.teal, to: '/app/etudiants', imageSrc: '/icons/nav/students.png' },
 { label: 'Devoirs créés', value: `${overview.assignmentCount}`, delta: dueSoon ? `${dueSoon} à échéance sous 7 j` : 'Aucune échéance proche', up: true, icon: 'assignments', color: TILE.amber, to: '/app/devoirs', imageSrc: '/icons/nav/assignments.png' },
 { label: 'Notes saisies', value: `${overview.gradeCount}`, delta: gradedStudents ? `${gradedStudents} étudiant${gradedStudents > 1 ? 's' : ''} noté${gradedStudents > 1 ? 's' : ''}` : 'Aucune note', up: gradedStudents > 0, icon: 'grades', color: TILE.purple, to: '/app/notes', imageSrc: '/icons/nav/grades.png' },
 { label: 'Moyenne générale', value: overview.averageGrade != null ? `${overview.averageGrade}/20` : '—', delta: successRate != null ? `${successRate} % ≥ 10/20` : 'Aucune note', up: (successRate ?? 100) >= 50, icon: 'stats', color: TILE.green, to: '/app/notes', imageSrc: '/icons/nav/analytics.png' },
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

 type QuickAction = { label: string; icon: UniIconName; to: string; color: string; imageSrc?: string }
 const studentQuickActions: QuickAction[] = [
 { label: 'UniMail (@uniflow)', icon: 'messages', to: '/app/mail', color: TILE.blue, imageSrc: '/icons/nav/messages.png' },
 { label: 'Actualités Campus', icon: 'megaphone', to: '/app/actualites', color: TILE.teal, imageSrc: '/icons/nav/notifications.png' },
 { label: 'Mes cours', icon: 'courses', to: '/app/cours', color: TILE.blue, imageSrc: '/icons/nav/courses.png' },
 { label: 'Devoirs', icon: 'assignments', to: '/app/devoirs', color: TILE.amber, imageSrc: '/icons/nav/assignments.png' },
 { label: 'Visio', icon: 'video', to: '/app/visio', color: TILE.teal, imageSrc: '/icons/nav/visio.png' },
 { label: 'Bibliothèque', icon: 'library', to: '/app/bibliotheque', color: TILE.purple, imageSrc: '/icons/nav/library.png' },
 ]
 const teacherQuickActions: QuickAction[] = [
 { label: 'UniMail (@uniflow)', icon: 'messages', to: '/app/mail', color: TILE.blue, imageSrc: '/icons/nav/messages.png' },
 { label: 'Actualités Campus', icon: 'megaphone', to: '/app/actualites', color: TILE.teal, imageSrc: '/icons/nav/notifications.png' },
 { label: 'Espace pédago', icon: 'teacher', to: '/app/mes-cours-enseignant', color: TILE.blue, imageSrc: '/icons/nav/teacher.png' },
 { label: 'Visio', icon: 'video', to: '/app/visio', color: TILE.teal, imageSrc: '/icons/nav/visio.png' },
 { label: 'Messages', icon: 'messages', to: '/app/messages', color: TILE.purple, imageSrc: '/icons/nav/messages.png' },
 { label: 'Planning', icon: 'schedule', to: '/app/emploi-du-temps', color: TILE.amber, imageSrc: '/icons/nav/schedule.png' },
 ]
 const delegateQuickActions: QuickAction[] = [
 { label: 'UniMail (@uniflow)', icon: 'messages', to: '/app/mail', color: TILE.blue, imageSrc: '/icons/nav/messages.png' },
 { label: 'Actualités Campus', icon: 'megaphone', to: '/app/actualites', color: TILE.teal, imageSrc: '/icons/nav/notifications.png' },
 { label: 'Gérer présences', icon: 'attendance', to: '/app/gestion-presences', color: TILE.teal, imageSrc: '/icons/nav/attendance.png' },
 { label: 'Messages', icon: 'messages', to: '/app/messages', color: TILE.blue, imageSrc: '/icons/nav/messages.png' },
 { label: 'Planning', icon: 'schedule', to: '/app/emploi-du-temps', color: TILE.purple, imageSrc: '/icons/nav/schedule.png' },
 { label: 'Visio', icon: 'video', to: '/app/visio', color: TILE.amber, imageSrc: '/icons/nav/visio.png' },
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
 {/* ── Hero Header Bento Style ── */}
 <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0D9488] p-6 sm:p-8 shadow-xl text-white border border-blue-900/40">
  {/* Motifs géométriques & halos d'ambiance */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
  <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
   <div className="animate-slide-in-left max-w-xl">
    <div className="flex flex-wrap items-center gap-2 mb-2.5">
     <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/20">
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      {formattedToday}
     </span>
     <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30">
      <UniIcon name={roleIcon} weight="fill" size={13} />
      {roleLabel}
     </span>
     {currentUser.scopeLabel && (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-blue-200 border border-blue-400/30">
       {currentUser.scopeLabel}
      </span>
     )}
    </div>

    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
     {now.getHours() < 6 ? 'Bonne nuit,' : now.getHours() < 12 ? 'Bonjour,' : now.getHours() < 18 ? 'Bon après-midi,' : 'Bonsoir,'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-200">{firstName}</span>
    </h1>

    <p className="mt-2 text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
     Votre espace d'apprentissage UniFlow est actif · Données officielles UY1 synchronisées hors-ligne &amp; en direct.
    </p>

    {/* Boutons d'accès direct sur le Hero */}
    <div className="mt-5 flex flex-wrap items-center gap-2.5">
     <Link
      to="/app/mail"
      className="inline-flex items-center gap-2 rounded-xl bg-white text-[#0B132B] hover:bg-cyan-50 px-3.5 py-2 text-xs font-extrabold transition-all shadow-sm active:scale-95"
     >
      <img src="/icons/nav/messages.png" alt="" className="h-4 w-4 object-contain" />
      <span>UniMail (@uniflow)</span>
     </Link>
     <Link
      to="/app/actualites"
      className="inline-flex items-center gap-2 rounded-xl bg-amber-400/25 hover:bg-amber-400/35 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-amber-100 border border-amber-300/30 transition-all shadow-xs active:scale-95"
     >
      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      <span>Actualités Campus</span>
     </Link>
     <Link
      to="/app/visio"
      className="inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/25 transition-all shadow-xs active:scale-95"
     >
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
      <UniIcon name="video" weight="fill" size={15} />
      <span>Visioconférence</span>
     </Link>
     <Link
      to="/app/presences"
      className="inline-flex items-center gap-2 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-teal-100 border border-teal-300/30 transition-all shadow-xs active:scale-95"
     >
      <UniIcon name="attendance" weight="bold" size={15} />
      <span>Émarger</span>
     </Link>
    </div>
   </div>

   {/* Mascotte 3D Uni et actions de contrôle */}
   <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-in-right shrink-0">
    <div className="hidden xl:flex relative h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 shadow-lg">
     <img
      src="/illustrations/uni_copilot_3d.png"
      alt="Uni Copilote 3D"
      className="h-full w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
     />
    </div>

    <div className="flex items-center gap-2 sm:gap-3">
     <button
      onClick={() => refetchOverview()}
      disabled={overviewLoading}
      className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
      title="Actualiser les données en direct"
     >
      <UniIcon name="refresh" weight="bold" size={15} className={overviewLoading ? 'animate-spin' : ''} />
      <span>Actualiser</span>
     </button>
     {currentRole === 'student' && (
      <Link
       to="/app/accueil-compact"
       className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all text-center"
      >
       <span>Vue compacte</span>
      </Link>
     )}
     <Link
      to="/app/notifications"
      className="relative flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-2.5 text-white transition-all"
      aria-label="Notifications"
     >
      <UniIcon name="notifications" weight="fill" size={18} />
      {unreadCount > 0 && (
       <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
        {unreadCount > 9 ? '9+' : unreadCount}
       </span>
      )}
     </Link>
    </div>
   </div>
  </div>
 </div>

 {overviewError && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">{overviewError}</div>}

 {/* ── Bento Spotlight : UniMail (@uniflow) & Actualités Campus ── */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Link
   to="/app/mail"
   className="group relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-[#eff3ff] via-white to-blue-50/40 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
  >
   <div className="flex items-center gap-4 min-w-0">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#1E3A8A] p-2 shadow-md">
     <img src="/icons/nav/messages.png" alt="UniMail" className="h-full w-full object-contain" />
    </div>
    <div className="min-w-0">
     <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-[#1E3A8A] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
       Nouveau · UniMail
      </span>
      <span className="text-[11px] font-bold text-emerald-700">Certifié TLS 1.3 · Signé UniFlow</span>
     </div>
     <h3 className="mt-1 text-base font-black text-slate-900 group-hover:text-[#1E3A8A] truncate">
      Messagerie Officielle @uniflow.kernelforge.codes
     </h3>
     <p className="text-xs text-slate-600 line-clamp-1">
      Votre boîte e-mail académique complète rattachée à votre compte UniFlow.
     </p>
    </div>
   </div>
   <span className="shrink-0 rounded-xl bg-[#1E3A8A] px-3.5 py-2 text-xs font-extrabold text-white group-hover:bg-blue-800 transition-colors">
    Ouvrir →
   </span>
  </Link>

  <Link
   to="/app/actualites"
   className="group relative overflow-hidden rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/40 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
  >
   <div className="flex items-center gap-4 min-w-0">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] p-2 shadow-md">
     <img src="/icons/nav/notifications.png" alt="Actualités" className="h-full w-full object-contain" />
    </div>
    <div className="min-w-0">
     <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
       À La Une · Phase Bêta
      </span>
      <span className="text-[11px] font-bold text-[#0D9488]">Journal Officiel</span>
     </div>
     <h3 className="mt-1 text-base font-black text-slate-900 group-hover:text-[#0D9488] truncate">
      Actualités Campus &amp; Mises à jour UniFlow
     </h3>
     <p className="text-xs text-slate-600 line-clamp-1">
      Communiqués officiels, images, vidéos, documents PDF et annonces de la plateforme.
     </p>
    </div>
   </div>
   <span className="shrink-0 rounded-xl bg-[#0D9488] px-3.5 py-2 text-xs font-extrabold text-white group-hover:bg-teal-700 transition-colors">
    Lire →
   </span>
  </Link>
 </div>

 {/* ── Card Statut d'Abonnement / Plan Académique ── */}
 <div className="animate-fade-in">
  <SubscriptionStatus />
 </div>

 {/* ── Module Bento : Prochaine Séance & Copilote d'Études GROQ ── */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Carte 1 : Prochain Cours du Jour */}
  <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 p-5 shadow-sm hover:shadow-md transition-shadow">
   <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
     <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1E3A8A] text-white shadow-xs">
      <UniIcon name="schedule" weight="fill" size={16} />
     </span>
     <div>
      <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A8A]">Séance du jour</h2>
      <p className="text-[11px] text-slate-500 font-medium">Emploi du temps officiel UY1</p>
     </div>
    </div>
    <Link to="/app/emploi-du-temps" className="text-xs font-bold text-[#1E3A8A] hover:underline">
     Planning complet →
    </Link>
   </div>

   {upcomingEvents.length > 0 ? (
    <div className="rounded-2xl border border-blue-200/60 bg-white p-4 shadow-2xs">
     <div className="flex items-start justify-between gap-3">
      <div>
       <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5 ${typeColor[upcomingEvents[0].type] || 'bg-blue-100 text-blue-800'}`}>
        {upcomingEvents[0].type} · {upcomingEvents[0].time}
       </span>
       <h3 className="text-base font-bold text-slate-900 leading-snug">
        {upcomingEvents[0].title}
       </h3>
       <p className="mt-1 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Salle / Amphi : <strong>{upcomingEvents[0].room}</strong>
       </p>
      </div>
      <Link
       to="/app/presences"
       className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
      >
       <UniIcon name="attendance" weight="bold" size={14} />
       <span>Présence</span>
      </Link>
     </div>
    </div>
   ) : (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-center">
     <p className="text-xs font-semibold text-slate-600">Aucune séance restante prévue aujourd’hui.</p>
     <p className="text-[11px] text-slate-400 mt-0.5">Profitez-en pour réviser ou avancer sur vos devoirs.</p>
    </div>
   )}
  </div>

  {/* Carte 2 : Copilote Intelligent GROQ */}
  <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/80 via-white to-slate-50 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
   <div>
    <div className="flex items-center justify-between mb-3">
     <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0D9488] text-white shadow-xs">
       <UniIcon name="assistant" weight="fill" size={16} />
      </span>
      <div>
       <div className="flex items-center gap-1.5">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0D9488]">Uni Copilote</h2>
        <span className="rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.2">GROQ</span>
       </div>
       <p className="text-[11px] text-slate-500 font-medium">Inférence IA Llama 3.3 & GPT-OSS</p>
      </div>
     </div>
     <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      En ligne
     </span>
    </div>

    <p className="text-xs text-slate-600 leading-relaxed">
     Une question sur un théorème, un algorithme ou vos crédits LMD ? Posez-la directement à Uni via la bulle en bas à droite.
    </p>
   </div>

   <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
    <span className="text-[11px] text-slate-400 italic">Disponible 24h/24 hors-ligne & en direct</span>
    <Link
     to="/app/cours"
     className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-teal-300/80 bg-white px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-50 transition-colors shadow-2xs"
    >
     <span>Mes cours & supports</span>
     <span aria-hidden="true">→</span>
    </Link>
   </div>
  </div>
 </div>

 {/* ── KPI Stats Bento Cards ── */}
 <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
  {stats.map(({ label, value, delta, up, icon, color, to, imageSrc }, i) => (
   <div
    key={label}
    onClick={() => navigate(to)}
    className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive animate-stagger-${i + 1} cursor-pointer group`}
   >
    <div className="flex items-start justify-between gap-2 mb-3">
     <IconTile name={icon} imageSrc={imageSrc} color={color} variant="filled" size={56} index={i} />
     <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 text-right whitespace-nowrap ${up ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' : 'text-slate-600 bg-slate-100'}`}>
      {delta}
     </span>
    </div>
    <p className="text-2xl font-black text-slate-900 stat-number leading-none tracking-tight group-hover:text-[#1E3A8A] transition-colors">{value}</p>
    <p className="text-xs font-semibold text-slate-500 mt-1.5 leading-tight">{label}</p>
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
 {quickActions.map(({ label, icon, to, color, imageSrc }, i) => (
 <button
              key={to}
              onClick={() => navigate(to)}
              style={{ backgroundColor: hexWithAlpha(color, 0.08), borderColor: hexWithAlpha(color, 0.2) }}
              className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border py-4 px-3 text-xs font-semibold text-[#111827] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-stagger-${i + 1}`}
            >
              <IconTile name={icon} imageSrc={imageSrc} color={color} variant="filled" size={44} index={i} />
              <span className="mt-1 text-center font-bold text-slate-800 group-hover:text-[#1e3a8a] transition-colors truncate max-w-full">{label}</span>
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

 {/* Quests Summary Widget */}
 <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <span className="text-base"></span>
 <h2 className="text-sm font-bold text-[#111827]">Quêtes du jour</h2>
 </div>
 <Link to="/app/badges-quetes" className="text-xs font-semibold text-[#1e3a8a] hover:underline">
 Catalogue (250) →
 </Link>
 </div>
 {userXp && (
 <div className="mb-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-[#eff3ff] to-[#f0fdfa] p-2.5 text-xs border border-blue-100">
 <span className="font-bold text-[#1e3a8a]">Niveau {userXp.level}</span>
 <span className="font-bold text-[#0d9488]">{(userXp.totalXp ?? 1850).toLocaleString()} XP</span>
 </div>
 )}
 <div className="space-y-2.5">
 {dailyQuests.slice(0, 3).map((item) => (
 <div key={item.definition.$id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
 <div className="flex items-center justify-between text-xs font-bold mb-1">
 <span className="truncate text-slate-800 pr-2">{item.definition.title}</span>
 <span className="shrink-0 text-amber-600">+{item.definition.xpReward} XP</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
 <div
 className="h-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488]"
 style={{ width: `${item.percent}%` }}
 />
 </div>
 <span className="text-[10px] text-slate-500 font-semibold shrink-0">
 {item.completed ? '' : `${item.percent}%`}
 </span>
 </div>
 </div>
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
