import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconTile, UniIcon } from '../../components/ui/UniIcon'
import { subjectColor } from '../../lib/subjectIcon'
import {
  personalAppwriteApi as personalApi,
  type PersonalAssignmentRecord,
  type PersonalCourseRecord,
  type PersonalGradeRecord,
  type PersonalScheduleRecord,
} from '../../lib/appwrite'
import { SubscriptionStatus } from '../../components/subscription/SubscriptionStatus'
import { useUserRole } from '../../utils/userRole'
import {
  calcGpaAppreciation,
  calcWeightedAverage,
  DAY_LABELS,
  DAYS,
  errorMessage,
  formatRelativeDueDate,
  isOverdue,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from './independentCommon'

export default function IndependentDashboardPage() {
  const { currentUser } = useUserRole()
  const navigate = useNavigate()

  const [courses, setCourses] = useState<PersonalCourseRecord[]>([])
  const [schedules, setSchedules] = useState<PersonalScheduleRecord[]>([])
  const [assignments, setAssignments] = useState<PersonalAssignmentRecord[]>([])
  const [grades, setGrades] = useState<PersonalGradeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'Étudiant'

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [courseData, scheduleData, assignmentData, gradeData] = await Promise.all([
        personalApi.courses.list(),
        personalApi.schedules.list(),
        personalApi.assignments.list(),
        personalApi.grades.list(),
      ])

      const resolvedCourses = courseData ?? []
      const coursesById = new Map(resolvedCourses.map((c) => [c.id, c]))
      const resolvedSchedules = (scheduleData ?? []).map((s) => {
        const c = coursesById.get(s.courseId)
        return {
          ...s,
          courseTitle: s.courseTitle ?? c?.title,
          courseCode: s.courseCode ?? c?.code,
        }
      })

      setCourses(resolvedCourses)
      setSchedules(resolvedSchedules)
      setAssignments(assignmentData ?? [])
      setGrades(gradeData ?? [])
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    const handleNetworkRestored = () => { void loadData() }
    window.addEventListener('uniflow:network-restored', handleNetworkRestored)
    return () => window.removeEventListener('uniflow:network-restored', handleNetworkRestored)
  }, [])

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  const overdueTasks = useMemo(() => assignments.filter(isOverdue), [assignments])
  const pendingTasks = useMemo(
    () => assignments.filter((a) => a.status !== 'DONE' && a.status !== 'CANCELLED'),
    [assignments]
  )

  const { average: weightedAverage, totalCoefficients } = useMemo(
    () => calcWeightedAverage(grades),
    [grades]
  )
  const appreciation = useMemo(() => calcGpaAppreciation(weightedAverage), [weightedAverage])

  const totalCredits = useMemo(
    () => courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0),
    [courses]
  )

  const todaySchedules = useMemo(() => {
    const rawWeekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date()).toUpperCase()
    const normalized = rawWeekday.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return schedules
      .filter((s) => s.dayOfWeek === normalized)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [schedules])

  const toggleTaskDone = async (task: PersonalAssignmentRecord) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE'
    try {
      const updated = await personalApi.assignments.update(task.id, { status: newStatus })
      setAssignments((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <UniIcon name="spinner" weight="bold" size={36} className="animate-spin text-[#0d9488]" />
          <span>Chargement de votre tableau de bord personnel…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-14 animate-fade-in">
      {/* ── Top Hero Banner (SkillSet / Clean Modern style) ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#0d9488] p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-14 -top-14 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute right-40 -bottom-10 h-40 w-40 rounded-full bg-[#0d9488]/30 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide text-teal-200 backdrop-blur-sm">
              <UniIcon name="assistant" weight="fill" size={14} />
              <span>Espace Personnel & Apprentissage Autonome</span>
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Bonjour, {firstName} ! 👋
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-blue-100 sm:text-base">
              Votre cursus est à portée de main. Consultez votre emploi du temps, gérez vos tâches prioritaires et découvrez des ressources libres.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/app/emploi-du-temps"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#1e3a8a] shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <UniIcon name="schedule" weight="bold" size={16} />
              <span>Mon planning</span>
            </Link>
            <Link
              to="/app/devoirs"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-xs font-extrabold text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              <UniIcon name="plus" weight="bold" size={16} />
              <span>Nouveau devoir</span>
            </Link>
            <Link
              to="/app/bibliotheque"
              className="inline-flex items-center gap-2 rounded-xl border border-teal-300/40 bg-teal-500/25 px-4 py-2.5 text-xs font-extrabold text-teal-100 backdrop-blur-sm transition hover:bg-teal-500/40"
            >
              <UniIcon name="library" weight="bold" size={16} />
              <span>Bibliothèque</span>
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          <div className="flex items-center gap-2">
            <UniIcon name="alert" weight="fill" size={18} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <UniIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* ── 4 KPI Stats ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Courses */}
        <Link
          to="/app/cours"
          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <IconTile name="courses" color="#0D9488" variant="filled" size={56} index={0} />
            <span className="text-2xl font-black text-slate-900 dark:text-white">{courses.length}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-teal-700">Matières suivies</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{totalCredits} crédits ECTS cumulés</p>
        </Link>

        {/* Tasks */}
        <Link
          to="/app/devoirs"
          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <IconTile name="time" color={overdueTasks.length ? '#E11D48' : '#D97706'} variant="filled" size={56} index={1} />
            <span className="text-2xl font-black text-slate-900 dark:text-white">{pendingTasks.length}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-amber-700">Devoirs à faire</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {overdueTasks.length ? (
              <span className="font-bold text-rose-600">{overdueTasks.length} en retard</span>
            ) : (
              'Toutes les échéances sont à jour'
            )}
          </p>
        </Link>

        {/* GPA */}
        <Link
          to="/app/notes"
          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <IconTile name="trophy" color="#1E3A8A" variant="filled" size={56} index={2} />
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {weightedAverage != null ? `${weightedAverage.toFixed(2)}` : '—'}
              <span className="text-xs font-bold text-slate-400">/20</span>
            </span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-700">Moyenne pondérée</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {grades.length ? `${grades.length} note(s) · Mention ${appreciation.label}` : 'Aucune note saisie'}
          </p>
        </Link>

        {/* Today Schedule */}
        <Link
          to="/app/emploi-du-temps"
          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <IconTile name="agenda" color="#7C3AED" variant="filled" size={56} index={3} />
            <span className="text-2xl font-black text-slate-900 dark:text-white">{todaySchedules.length}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-purple-700">Créneaux aujourd'hui</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {todaySchedules.length ? 'Séances au programme' : 'Journée libre sans cours planifié'}
          </p>
        </Link>
      </section>

      {/* ── Main Two-Column Layout ── */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        {/* Left Column: Today's schedule + Urgent assignments + Quick courses */}
        <div className="space-y-6">
          {/* Today's Agenda */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                  <UniIcon name="agenda" weight="bold" size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Planning du jour</h2>
                  <p className="text-xs text-slate-500">Vos créneaux et cours planifiés aujourd'hui</p>
                </div>
              </div>
              <Link
                to="/app/emploi-du-temps"
                className="text-xs font-bold text-teal-700 hover:underline dark:text-teal-400"
              >
                Semaine complète →
              </Link>
            </div>

            <div className="mt-4">
              {todaySchedules.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun cours planifié aujourd'hui</p>
                  <p className="mt-1 text-xs text-slate-500">
                    C'est une bonne opportunité pour vous concentrer sur vos devoirs et révisions.
                  </p>
                  <Link
                    to="/app/emploi-du-temps"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-700 hover:text-teal-800"
                  >
                    <span>Ajouter ou consulter vos créneaux</span>
                    <UniIcon name="forward" size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todaySchedules.map((slot, index) => {
                    const course = courseById.get(slot.courseId)
                    const title = slot.courseTitle ?? course?.title ?? 'Matière'
                    const code = slot.courseCode ?? course?.code ?? ''
                    const color = subjectColor(code, course?.colorHex)

                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <IconTile
                            subject={title}
                            subjectCode={code}
                            color={color}
                            variant="filled"
                            size={44}
                            index={index}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black uppercase text-teal-700 dark:text-teal-400">
                                {code || 'COURS'}
                              </span>
                              {slot.type && (
                                <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
                                  {slot.type}
                                </span>
                              )}
                            </div>
                            <h3 className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                              {title}
                            </h3>
                            {slot.classroom && (
                              <p className="text-[11px] text-slate-500">
                                📍 Salle / Lieu : {slot.classroom}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="inline-block rounded-xl bg-teal-100/70 px-2.5 py-1 text-xs font-black text-teal-900 dark:bg-teal-950 dark:text-teal-300">
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Urgent & Upcoming Tasks */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                  <UniIcon name="tasks" weight="bold" size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Devoirs & Échéances urgentes</h2>
                  <p className="text-xs text-slate-500">Vos priorités à rendre ou finaliser prochainement</p>
                </div>
              </div>
              <Link
                to="/app/devoirs"
                className="text-xs font-bold text-amber-700 hover:underline dark:text-amber-400"
              >
                Gérer les devoirs ({assignments.length}) →
              </Link>
            </div>

            <div className="mt-4">
              {pendingTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-800 dark:bg-slate-800/40">
                  <UniIcon name="success" weight="fill" size={28} className="mx-auto text-emerald-500" />
                  <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">Aucune tâche en attente !</p>
                  <p className="mt-1 text-xs text-slate-500">Toutes vos échéances personnelles sont terminées ou à jour.</p>
                  <Link
                    to="/app/devoirs"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1e3a8a] hover:underline"
                  >
                    <span>Ajouter une nouvelle tâche</span>
                    <UniIcon name="forward" size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingTasks.slice(0, 5).map((task) => {
                    const course = courseById.get(task.courseId)
                    const rel = formatRelativeDueDate(task.dueDate)
                    const priorityMeta = PRIORITY_LABELS[task.priority ?? 'MEDIUM'] ?? PRIORITY_LABELS.MEDIUM

                    return (
                      <div
                        key={task.id}
                        className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition ${
                          rel.isOverdue
                            ? 'border-rose-200 bg-rose-50/40 dark:border-rose-950/40 dark:bg-rose-950/20'
                            : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <button
                            type="button"
                            onClick={() => void toggleTaskDone(task)}
                            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition hover:border-teal-600 dark:border-slate-700 dark:bg-slate-800"
                            title="Marquer comme terminée"
                          >
                            {task.status === 'DONE' && <UniIcon name="check" size={14} className="text-teal-600" />}
                          </button>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {course && (
                                <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-400">
                                  {course.code}
                                </span>
                              )}
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${priorityMeta.badgeClass}`}>
                                {priorityMeta.label}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  rel.isOverdue
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : rel.isToday
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {rel.text}
                              </span>
                            </div>
                            <h3 className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate('/app/devoirs')}
                          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                          title="Voir dans devoirs"
                        >
                          <UniIcon name="chevronRight" size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Access to Courses */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                  <UniIcon name="courses" weight="bold" size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Mes matières actives</h2>
                  <p className="text-xs text-slate-500">Modules et programmes suivis</p>
                </div>
              </div>
              <Link
                to="/app/cours"
                className="text-xs font-bold text-[#1e3a8a] hover:underline dark:text-blue-400"
              >
                Gérer mes cours ({courses.length}) →
              </Link>
            </div>

            <div className="mt-4">
              {courses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucune matière enregistrée</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Commencez par ajouter votre premier cours pour configurer votre planning et vos devoirs.
                  </p>
                  <Link
                    to="/app/cours"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0d9488] px-4 py-2 text-xs font-black text-white hover:bg-teal-700"
                  >
                    <UniIcon name="plus" size={14} />
                    <span>Créer une matière</span>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.slice(0, 6).map((course, index) => {
                    const color = subjectColor(course.code, course.colorHex)
                    return (
                      <Link
                        key={course.id}
                        to="/app/cours"
                        className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white hover:shadow-xs dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-start gap-3">
                          <IconTile
                            subject={course.title}
                            subjectCode={course.code}
                            color={color}
                            variant="filled"
                            size={36}
                            index={index}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-400">
                              {course.code}
                            </span>
                            <h3 className="truncate text-xs font-black text-slate-900 group-hover:text-[#1e3a8a] dark:text-white">
                              {course.title}
                            </h3>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2 text-[10px] text-slate-500 dark:border-slate-700">
                          <span>{course.credits ?? 0} crédits</span>
                          <span className="truncate max-w-[110px]">{course.instructor || 'Autonome'}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Subscription + Grade Gauge + Library Promo */}
        <aside className="space-y-6">
          {/* Subscription widget */}
          <SubscriptionStatus />

          {/* GPA Progress Widget */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UniIcon name="grades" weight="bold" size={18} className="text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Relevé & Progression</h3>
              </div>
              <Link to="/app/notes" className="text-xs font-bold text-blue-700 hover:underline">
                Détail →
              </Link>
            </div>

            <div className="mt-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50/50 p-4 text-center dark:from-slate-800 dark:to-slate-800/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Moyenne Générale</p>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-[#1e3a8a] dark:text-teal-300">
                    {weightedAverage != null ? weightedAverage.toFixed(2) : '—'}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/20</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-2xs dark:bg-slate-900 dark:text-slate-300">
                  <span className={`h-2 w-2 rounded-full ${
                    appreciation.tone === 'emerald' ? 'bg-emerald-500' :
                    appreciation.tone === 'teal' ? 'bg-teal-500' :
                    appreciation.tone === 'blue' ? 'bg-blue-500' :
                    appreciation.tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <span>Mention {appreciation.label}</span>
                </div>
              </div>

              {/* Recent grades breakdown */}
              <div className="mt-4 space-y-2.5">
                {grades.slice(0, 4).map((g) => {
                  const score = Number(g.score)
                  const max = Math.max(Number(g.maxScore) || 20, 1)
                  const pct = Math.min(100, Math.max(0, (score / max) * 100))
                  const course = courseById.get(g.courseId)

                  return (
                    <div key={g.id} className="text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="truncate font-bold text-slate-700 dark:text-slate-300">
                          {course ? `${course.code} · ` : ''}{g.evaluationTitle}
                        </span>
                        <span className="font-extrabold text-[#1e3a8a] dark:text-teal-400">
                          {score}/{max}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Digital Library Promo Banner (NO Z-LIB MENTION, PURE OPEN ACCESS & BUCKET UNIFLOW) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f766e] to-[#115e59] p-5 text-white shadow-md">
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                <UniIcon name="library" weight="fill" size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight">Bibliothèque Numérique</h3>
                <p className="mt-1 text-xs leading-relaxed text-teal-100">
                  Accédez à des millions d'ouvrages, manuels de référence et publications scientifiques en accès libre.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
              <span className="text-[10px] font-bold text-teal-200">
                ✓ Ouvrages libres &amp; Open Access
              </span>
              <Link
                to="/app/bibliotheque"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-black text-teal-900 shadow-sm transition hover:bg-teal-50"
              >
                <span>Explorer</span>
                <UniIcon name="forward" size={12} />
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
