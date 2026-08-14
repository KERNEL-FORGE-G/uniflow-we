import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileWarning,
  Filter,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from 'lucide-react'
import {
  ApiError,
  PERSONAL_API_URL,
  personalApi,
  type PersonalAssignment,
  type PersonalCourse,
  type PersonalGrade,
  type PersonalSchedule,
} from '../lib/api'
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus'

type Tab = 'courses' | 'schedule' | 'assignments' | 'grades'

type CourseForm = { code: string; title: string; instructor: string; credits: number; colorHex: string; classroom: string; description: string }
type ScheduleForm = { courseId: string; dayOfWeek: string; startTime: string; endTime: string; classroom: string; type: string }
type AssignmentForm = { courseId: string; title: string; dueDate: string; description: string; priority: string; status: string }
type GradeForm = { courseId: string; evaluationTitle: string; score: string; maxScore: string; coefficient: string }

const emptyCourse: CourseForm = { code: '', title: '', instructor: '', credits: 0, colorHex: '#0d9488', classroom: '', description: '' }
const emptySchedule: ScheduleForm = { courseId: '', dayOfWeek: 'LUNDI', startTime: '08:00', endTime: '10:00', classroom: '', type: 'CM' }
const emptyAssignment: AssignmentForm = { courseId: '', title: '', dueDate: '', description: '', priority: 'MEDIUM', status: 'TODO' }
const emptyGrade: GradeForm = { courseId: '', evaluationTitle: '', score: '', maxScore: '20', coefficient: '1' }
const days = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE']
const dayLabels: Record<string, string> = { LUNDI: 'Lundi', MARDI: 'Mardi', MERCREDI: 'Mercredi', JEUDI: 'Jeudi', VENDREDI: 'Vendredi', SAMEDI: 'Samedi', DIMANCHE: 'Dimanche' }
const priorityLabels: Record<string, string> = { LOW: 'Basse', MEDIUM: 'Moyenne', HIGH: 'Haute', URGENT: 'Urgente' }
const statusLabels: Record<string, string> = { TODO: 'À faire', IN_PROGRESS: 'En cours', DONE: 'Terminée', CANCELLED: 'Annulée' }

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return error instanceof Error ? error.message : 'Erreur de communication avec le backend personnel.'
}

function formatDate(value?: string, withTime = false): string {
  if (!value) return 'Date non renseignée'
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return 'Date non renseignée'
  return parsed.toLocaleDateString('fr-FR', withTime ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'long', year: 'numeric' })
}

function isOverdue(task: PersonalAssignment): boolean {
  return Boolean(task.dueDate && task.status !== 'DONE' && task.status !== 'CANCELLED' && new Date(task.dueDate).getTime() < Date.now())
}

export default function IndependentWorkspacePage({ initialTab }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab ?? 'courses')
  const [courses, setCourses] = useState<PersonalCourse[]>([])
  const [schedules, setSchedules] = useState<PersonalSchedule[]>([])
  const [assignments, setAssignments] = useState<PersonalAssignment[]>([])
  const [grades, setGrades] = useState<PersonalGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editingCourse, setEditingCourse] = useState<PersonalCourse | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<PersonalSchedule | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<PersonalAssignment | null>(null)
  const [editingGrade, setEditingGrade] = useState<PersonalGrade | null>(null)
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourse)
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(emptySchedule)
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>(emptyAssignment)
  const [gradeForm, setGradeForm] = useState<GradeForm>(emptyGrade)

  const courseById = useMemo(() => new Map(courses.map(course => [course.id, course])), [courses])
  const overdueAssignments = useMemo(() => assignments.filter(isOverdue), [assignments])
  const weightedAverage = useMemo(() => {
    const totalCoefficient = grades.reduce((sum, grade) => sum + Number(grade.coefficient || 0), 0)
    if (!totalCoefficient) return null
    const total = grades.reduce((sum, grade) => sum + (Number(grade.score) / Math.max(Number(grade.maxScore) || 20, 1)) * 20 * Number(grade.coefficient || 0), 0)
    return total / totalCoefficient
  }, [grades])
  const todaySchedules = useMemo(() => {
    const currentDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date()).toUpperCase()
    const normalized = currentDay.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return schedules.filter(schedule => schedule.dayOfWeek === normalized)
  }, [schedules])

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
      setCourses(courseData ?? [])
      setSchedules(scheduleData ?? [])
      setAssignments(assignmentData ?? [])
      setGrades(gradeData ?? [])
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadData() }, [])
  useEffect(() => { if (initialTab) setTab(initialTab) }, [initialTab])

  const closeForms = () => {
    setEditingCourse(null)
    setEditingSchedule(null)
    setEditingAssignment(null)
    setEditingGrade(null)
    setCourseForm(emptyCourse)
    setScheduleForm(emptySchedule)
    setAssignmentForm(emptyAssignment)
    setGradeForm(emptyGrade)
  }

  const beginCreate = (nextTab: Tab) => {
    setTab(nextTab)
    closeForms()
    setSearch('')
    setNotice(null)
  }

  const runMutation = async (action: () => Promise<void>, success: string) => {
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      await action()
      setNotice(success)
      closeForms()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleCourseSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!courseForm.code.trim() || !courseForm.title.trim()) return setError('Le code et le titre de la matière sont obligatoires.')
    const payload = { ...courseForm, code: courseForm.code.trim().toUpperCase(), title: courseForm.title.trim() }
    await runMutation(async () => {
      if (editingCourse) {
        const updated = await personalApi.courses.update(editingCourse.id, payload)
        setCourses(previous => previous.map(course => course.id === editingCourse.id ? updated : course))
      } else {
        const created = await personalApi.courses.create(payload)
        setCourses(previous => [created, ...previous])
      }
    }, editingCourse ? 'Matière mise à jour.' : 'Matière ajoutée à votre espace.')
  }

  const handleCourseDelete = async (course: PersonalCourse) => {
    if (!window.confirm(`Supprimer la matière « ${course.title} » ?`)) return
    await runMutation(async () => {
      await personalApi.courses.delete(course.id)
      setCourses(previous => previous.filter(item => item.id !== course.id))
      setSchedules(previous => previous.filter(item => item.courseId !== course.id))
      setAssignments(previous => previous.filter(item => item.courseId !== course.id))
      setGrades(previous => previous.filter(item => item.courseId !== course.id))
    }, 'Matière supprimée. Les éléments associés ont été retirés de l’affichage.')
  }

  const handleScheduleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!scheduleForm.courseId || !scheduleForm.startTime || !scheduleForm.endTime || scheduleForm.startTime >= scheduleForm.endTime) return setError('Sélectionnez une matière et une plage horaire valide.')
    await runMutation(async () => {
      if (editingSchedule) {
        const updated = await personalApi.schedules.update(editingSchedule.id, scheduleForm)
        setSchedules(previous => previous.map(item => item.id === editingSchedule.id ? updated : item))
      } else {
        const created = await personalApi.schedules.create(scheduleForm)
        setSchedules(previous => [created, ...previous])
      }
    }, editingSchedule ? 'Créneau mis à jour.' : 'Créneau ajouté à l’emploi du temps.')
  }

  const handleScheduleDelete = async (schedule: PersonalSchedule) => {
    if (!window.confirm('Supprimer ce créneau horaire ?')) return
    await runMutation(async () => {
      await personalApi.schedules.delete(schedule.id)
      setSchedules(previous => previous.filter(item => item.id !== schedule.id))
    }, 'Créneau supprimé.')
  }

  const handleAssignmentSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!assignmentForm.courseId || !assignmentForm.title.trim()) return setError('La matière et le titre de la tâche sont obligatoires.')
    await runMutation(async () => {
      if (editingAssignment) {
        const updated = await personalApi.assignments.update(editingAssignment.id, assignmentForm)
        setAssignments(previous => previous.map(item => item.id === editingAssignment.id ? updated : item))
      } else {
        const created = await personalApi.assignments.create(assignmentForm)
        setAssignments(previous => [created, ...previous])
      }
    }, editingAssignment ? 'Tâche mise à jour.' : 'Tâche ajoutée.')
  }

  const handleAssignmentDelete = async (assignment: PersonalAssignment) => {
    if (!window.confirm(`Supprimer la tâche « ${assignment.title} » ?`)) return
    await runMutation(async () => {
      await personalApi.assignments.delete(assignment.id)
      setAssignments(previous => previous.filter(item => item.id !== assignment.id))
    }, 'Tâche supprimée.')
  }

  const handleGradeSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const score = Number(gradeForm.score)
    const maxScore = Number(gradeForm.maxScore)
    const coefficient = Number(gradeForm.coefficient)
    if (!gradeForm.courseId || !gradeForm.evaluationTitle.trim() || !Number.isFinite(score) || !Number.isFinite(maxScore) || score < 0 || maxScore <= 0 || score > maxScore || coefficient <= 0) return setError('Renseignez une évaluation valide, une note comprise entre 0 et le maximum, et un coefficient positif.')
    const payload = { courseId: gradeForm.courseId, evaluationTitle: gradeForm.evaluationTitle.trim(), score, maxScore, coefficient }
    await runMutation(async () => {
      if (editingGrade) {
        const updated = await personalApi.grades.update(editingGrade.id, payload)
        setGrades(previous => previous.map(item => item.id === editingGrade.id ? updated : item))
      } else {
        const created = await personalApi.grades.create(payload)
        setGrades(previous => [created, ...previous])
      }
    }, editingGrade ? 'Note mise à jour.' : 'Note enregistrée.')
  }

  const handleGradeDelete = async (grade: PersonalGrade) => {
    if (!window.confirm(`Supprimer la note « ${grade.evaluationTitle} » ?`)) return
    await runMutation(async () => {
      await personalApi.grades.delete(grade.id)
      setGrades(previous => previous.filter(item => item.id !== grade.id))
    }, 'Note supprimée.')
  }

  const tabs = [
    { id: 'courses' as const, label: 'Matières', icon: BookOpen, count: courses.length },
    { id: 'schedule' as const, label: 'Planning', icon: CalendarDays, count: schedules.length },
    { id: 'assignments' as const, label: 'Tâches', icon: ClipboardList, count: assignments.length },
    { id: 'grades' as const, label: 'Notes', icon: GraduationCap, count: grades.length },
  ]

  const filteredCourses = courses.filter(course => !search.trim() || `${course.code} ${course.title} ${course.instructor ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  const filteredSchedules = schedules.filter(item => !search.trim() || `${item.courseTitle ?? ''} ${item.courseCode ?? ''} ${item.dayOfWeek} ${item.classroom ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  const filteredAssignments = assignments.filter(item => !search.trim() || `${item.title} ${item.description ?? ''} ${item.status ?? ''} ${item.priority ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  const filteredGrades = grades.filter(item => !search.trim() || `${item.evaluationTitle} ${courseById.get(item.courseId)?.title ?? ''}`.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <LoadingState />

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#1e3a8a] p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-100"><Sparkles className="h-4 w-4" /> Espace indépendant</div><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Votre parcours, vos données, votre rythme.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-teal-50">UniFlow vous donne un espace académique autonome. Les indicateurs ci-dessous sont calculés uniquement à partir de vos matières, créneaux, tâches et notes enregistrés dans votre compte personnel.</p></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => beginCreate('courses')} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-teal-800 shadow-lg transition hover:-translate-y-0.5"><Plus className="h-4 w-4" /> Ajouter une matière</button><button type="button" onClick={() => void loadData()} className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-extrabold text-white backdrop-blur transition hover:bg-white/20"><RefreshCw className="h-4 w-4" /> Actualiser</button></div>
        </div>
      </section>

      {!PERSONAL_API_URL && <InlineAlert tone="warning" icon={<FileWarning className="h-5 w-5" />} message="Le backend personnel n’est pas configuré dans cet environnement. Configurez VITE_PERSONAL_API_URL pour activer les opérations persistantes." />}
      {error && <InlineAlert tone="error" icon={<AlertCircle className="h-5 w-5" />} message={error} onClose={() => setError(null)} />}
      {notice && <InlineAlert tone="success" icon={<CheckCircle2 className="h-5 w-5" />} message={notice} onClose={() => setNotice(null)} />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={<BookOpen className="h-5 w-5" />} label="Matières suivies" value={courses.length} detail="dans votre espace" tone="teal" /><MetricCard icon={<Clock3 className="h-5 w-5" />} label="Tâches en retard" value={overdueAssignments.length} detail={overdueAssignments.length ? 'à traiter rapidement' : 'aucune échéance dépassée'} tone={overdueAssignments.length ? 'amber' : 'emerald'} /><MetricCard icon={<Trophy className="h-5 w-5" />} label="Moyenne personnelle" value={weightedAverage == null ? '—' : `${weightedAverage.toFixed(2)}/20`} detail={grades.length ? `${grades.length} évaluation(s)` : 'ajoutez vos premières notes'} tone="blue" /><MetricCard icon={<CalendarDays className="h-5 w-5" />} label="Créneaux planifiés" value={schedules.length} detail={todaySchedules.length ? `${todaySchedules.length} aujourd’hui` : 'aucun créneau aujourd’hui'} tone="violet" /></section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-teal-600">Vue d’ensemble</p><h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">Gérez votre espace</h2></div><div className="relative w-full sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Filtrer mes données…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" /></div></div><div className="mt-5 flex flex-wrap gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">{tabs.map(({ id, label, icon: Icon, count }) => <button key={id} type="button" onClick={() => { setTab(id); setSearch(''); closeForms() }} className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${tab === id ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Icon className="h-4 w-4" />{label}<span className={`rounded-full px-2 py-0.5 text-[10px] ${tab === id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>{count}</span></button>)}</div><div className="mt-5">{tab === 'courses' && <CoursesPanel courses={filteredCourses} editing={editingCourse} form={courseForm} setForm={setCourseForm} saving={saving} onSubmit={handleCourseSubmit} onCancel={closeForms} onEdit={course => { setEditingCourse(course); setCourseForm({ code: course.code, title: course.title, instructor: course.instructor ?? '', credits: course.credits ?? 0, colorHex: course.colorHex ?? '#0d9488', classroom: course.classroom ?? '', description: course.description ?? '' }) }} onDelete={handleCourseDelete} />}{tab === 'schedule' && <SchedulePanel schedules={filteredSchedules} courses={courses} editing={editingSchedule} form={scheduleForm} setForm={setScheduleForm} saving={saving} onSubmit={handleScheduleSubmit} onCancel={closeForms} onEdit={item => { setEditingSchedule(item); setScheduleForm({ courseId: item.courseId, dayOfWeek: item.dayOfWeek, startTime: item.startTime, endTime: item.endTime, classroom: item.classroom ?? '', type: item.type ?? 'CM' }) }} onDelete={handleScheduleDelete} />}{tab === 'assignments' && <AssignmentsPanel assignments={filteredAssignments} courses={courses} editing={editingAssignment} form={assignmentForm} setForm={setAssignmentForm} saving={saving} onSubmit={handleAssignmentSubmit} onCancel={closeForms} onEdit={item => { setEditingAssignment(item); setAssignmentForm({ courseId: item.courseId, title: item.title, dueDate: item.dueDate ? item.dueDate.slice(0, 16) : '', description: item.description ?? '', priority: item.priority ?? 'MEDIUM', status: item.status ?? 'TODO' }) }} onDelete={handleAssignmentDelete} />}{tab === 'grades' && <GradesPanel grades={filteredGrades} courseById={courseById} editing={editingGrade} form={gradeForm} setForm={setGradeForm} saving={saving} onSubmit={handleGradeSubmit} onCancel={closeForms} onEdit={item => { setEditingGrade(item); setGradeForm({ courseId: item.courseId, evaluationTitle: item.evaluationTitle, score: String(item.score), maxScore: String(item.maxScore), coefficient: String(item.coefficient) }) }} onDelete={handleGradeDelete} />}</div></div><aside className="space-y-6"><SubscriptionStatus /><TodayCard schedules={todaySchedules} /><UrgentTasks tasks={overdueAssignments.length ? overdueAssignments : assignments.filter(item => item.status !== 'DONE' && item.status !== 'CANCELLED').slice(0, 4)} courseById={courseById} onOpen={() => setTab('assignments')} /><GradeChart grades={grades} /></aside></section>
    </div>
  )
}

function LoadingState() { return <div className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center"><div className="flex flex-col items-center gap-3 text-sm text-slate-500"><Loader2 className="h-9 w-9 animate-spin text-teal-600" /><span>Chargement de votre espace personnel…</span></div></div> }
function InlineAlert({ tone, icon, message, onClose }: { tone: 'warning' | 'error' | 'success'; icon: ReactNode; message: string; onClose?: () => void }) { const classes = tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'; return <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${classes}`}><span className="mt-0.5 shrink-0">{icon}</span><p className="flex-1 leading-6">{message}</p>{onClose && <button type="button" onClick={onClose} aria-label="Fermer" className="opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>}</div> }
function MetricCard({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string | number; detail: string; tone: 'teal' | 'amber' | 'emerald' | 'blue' | 'violet' }) { const palette = { teal: 'bg-teal-50 text-teal-700', amber: 'bg-amber-50 text-amber-700', emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', violet: 'bg-violet-50 text-violet-700' }[tone]; return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${palette}`}>{icon}</div><span className="text-2xl font-black text-slate-900 dark:text-white">{value}</span></div><p className="mt-4 text-xs font-bold text-slate-600 dark:text-slate-300">{label}</p><p className="mt-1 text-[11px] text-slate-400">{detail}</p></div> }
function TodayCard({ schedules }: { schedules: PersonalSchedule[] }) { return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aujourd’hui</p><h3 className="mt-1 font-black text-slate-900 dark:text-white">Mon planning</h3></div><CalendarDays className="h-5 w-5 text-teal-600" /></div>{schedules.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-800">Aucun créneau personnel enregistré pour aujourd’hui.</p> : <div className="mt-4 space-y-2">{schedules.slice().sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-teal-50/70 p-3 dark:bg-teal-950/30"><span className="w-20 text-xs font-black text-teal-800 dark:text-teal-300">{item.startTime}–{item.endTime}</span><span className="min-w-0 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{item.courseTitle ?? 'Matière supprimée'}</span></div>)}</div>}</section> }
function UrgentTasks({ tasks, courseById, onOpen }: { tasks: PersonalAssignment[]; courseById: Map<string, PersonalCourse>; onOpen: () => void }) { return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Priorités</p><h3 className="mt-1 font-black text-slate-900 dark:text-white">Tâches à surveiller</h3></div><button type="button" onClick={onOpen} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><ArrowRight className="h-4 w-4" /></button></div>{tasks.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-800">Aucune tâche en attente. Ajoutez vos prochaines échéances pour les suivre ici.</p> : <div className="mt-4 space-y-2">{tasks.slice(0, 4).map(task => <div key={task.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"><div className="flex items-start justify-between gap-3"><p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{task.title}</p><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isOverdue(task) ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{isOverdue(task) ? 'En retard' : statusLabels[task.status ?? 'TODO']}</span></div><p className="mt-1 text-[11px] text-slate-500">{courseById.get(task.courseId)?.code ?? 'Sans matière'} · {task.dueDate ? formatDate(task.dueDate, true) : 'Sans échéance'}</p></div>)}</div>}</section> }
function GradeChart({ grades }: { grades: PersonalGrade[] }) { return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Progression</p><h3 className="mt-1 font-black text-slate-900 dark:text-white">Vos dernières notes</h3></div><GraduationCap className="h-5 w-5 text-blue-600" /></div>{grades.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-800">Aucune note personnelle enregistrée.</p> : <div className="mt-5 space-y-3">{grades.slice(0, 5).map(grade => { const percentage = Math.max(0, Math.min(100, (Number(grade.score) / Math.max(Number(grade.maxScore), 1)) * 100)); return <div key={grade.id}><div className="mb-1 flex items-center justify-between gap-3 text-[11px]"><span className="truncate font-bold text-slate-700 dark:text-slate-300">{grade.evaluationTitle}</span><span className="font-black text-blue-700">{grade.score}/{grade.maxScore}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all" style={{ width: `${percentage}%` }} /></div></div> })}</div>}</section> }
function SectionEmpty({ title, description }: { title: string; description: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center dark:border-slate-700 dark:bg-slate-800/50"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-900"><Filter className="h-5 w-5" /></div><h3 className="mt-4 text-sm font-black text-slate-800 dark:text-slate-200">{title}</h3><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">{description}</p></div> }
function CardActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div className="flex items-center gap-1"><button type="button" onClick={onEdit} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-700" title="Modifier"><Check className="h-4 w-4" /></button><button type="button" onClick={onDelete} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Supprimer"><Trash2 className="h-4 w-4" /></button></div> }
function CoursesPanel({ courses, editing, form, setForm, saving, onSubmit, onCancel, onEdit, onDelete }: { courses: PersonalCourse[]; editing: PersonalCourse | null; form: CourseForm; setForm: (value: CourseForm) => void; saving: boolean; onSubmit: (event: FormEvent) => void; onCancel: () => void; onEdit: (course: PersonalCourse) => void; onDelete: (course: PersonalCourse) => void }) { return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-3">{courses.length === 0 ? <SectionEmpty title="Aucune matière personnelle" description="Commencez par enregistrer une matière pour l’utiliser dans votre planning, vos tâches et vos notes." /> : courses.map(course => <div key={course.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-teal-200 hover:shadow-sm dark:border-slate-800"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 h-10 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: course.colorHex ?? '#0d9488' }} /><div className="min-w-0"><p className="text-[11px] font-black uppercase tracking-wider text-teal-700">{course.code}</p><h3 className="mt-1 truncate font-black text-slate-900 dark:text-white">{course.title}</h3><p className="mt-1 text-xs text-slate-500">{course.instructor || 'Enseignant non renseigné'} · {course.credits ?? 0} crédit(s){course.classroom ? ` · ${course.classroom}` : ''}</p></div></div><CardActions onEdit={() => onEdit(course)} onDelete={() => onDelete(course)} /></div>{course.description && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{course.description}</p>}</div>)}</div><CourseForm form={form} setForm={setForm} editing={Boolean(editing)} saving={saving} onSubmit={onSubmit} onCancel={onCancel} /></div> }
function SchedulePanel({ schedules, courses, editing, form, setForm, saving, onSubmit, onCancel, onEdit, onDelete }: { schedules: PersonalSchedule[]; courses: PersonalCourse[]; editing: PersonalSchedule | null; form: ScheduleForm; setForm: (value: ScheduleForm) => void; saving: boolean; onSubmit: (event: FormEvent) => void; onCancel: () => void; onEdit: (item: PersonalSchedule) => void; onDelete: (item: PersonalSchedule) => void }) { const grouped = days.map(day => ({ day, items: schedules.filter(item => item.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime)) })).filter(group => group.items.length > 0); return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><div>{schedules.length === 0 ? <SectionEmpty title="Emploi du temps vide" description="Ajoutez vos créneaux personnels pour les retrouver dans votre calendrier." /> : <div className="grid gap-3 sm:grid-cols-2">{grouped.map(group => <div key={group.day} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-[11px] font-black uppercase tracking-wider text-teal-700">{dayLabels[group.day]}</p><div className="mt-3 space-y-2">{group.items.map(item => <div key={item.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-black text-slate-800 dark:text-slate-100">{item.startTime}–{item.endTime}</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.courseTitle ?? courses.find(course => course.id === item.courseId)?.title ?? 'Matière supprimée'}</p><p className="mt-1 text-[11px] text-slate-400">{item.type ?? 'Type non renseigné'}{item.classroom ? ` · ${item.classroom}` : ''}</p></div><CardActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} /></div></div>)}</div></div>)}</div>}</div><ScheduleForm form={form} setForm={setForm} courses={courses} editing={Boolean(editing)} saving={saving} onSubmit={onSubmit} onCancel={onCancel} /></div> }
function AssignmentsPanel({ assignments, courses, editing, form, setForm, saving, onSubmit, onCancel, onEdit, onDelete }: { assignments: PersonalAssignment[]; courses: PersonalCourse[]; editing: PersonalAssignment | null; form: AssignmentForm; setForm: (value: AssignmentForm) => void; saving: boolean; onSubmit: (event: FormEvent) => void; onCancel: () => void; onEdit: (item: PersonalAssignment) => void; onDelete: (item: PersonalAssignment) => void }) { return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-3">{assignments.length === 0 ? <SectionEmpty title="Aucune tâche personnelle" description="Ajoutez vos devoirs, révisions et rappels pour suivre vos échéances." /> : assignments.map(item => <div key={item.id} className={`rounded-2xl border p-4 dark:border-slate-800 ${isOverdue(item) ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${isOverdue(item) ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{isOverdue(item) ? 'En retard' : statusLabels[item.status ?? 'TODO']}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800">{priorityLabels[item.priority ?? 'MEDIUM']}</span></div><h3 className="mt-2 truncate font-black text-slate-900 dark:text-white">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{courses.find(course => course.id === item.courseId)?.code ?? 'Matière supprimée'} · {item.dueDate ? formatDate(item.dueDate, true) : 'Sans échéance'}</p></div><CardActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} /></div>{item.description && <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">{item.description}</p>}</div>)}</div><AssignmentForm form={form} setForm={setForm} courses={courses} editing={Boolean(editing)} saving={saving} onSubmit={onSubmit} onCancel={onCancel} /></div> }
function GradesPanel({ grades, courseById, editing, form, setForm, saving, onSubmit, onCancel, onEdit, onDelete }: { grades: PersonalGrade[]; courseById: Map<string, PersonalCourse>; editing: PersonalGrade | null; form: GradeForm; setForm: (value: GradeForm) => void; saving: boolean; onSubmit: (event: FormEvent) => void; onCancel: () => void; onEdit: (item: PersonalGrade) => void; onDelete: (item: PersonalGrade) => void }) { return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-3">{grades.length === 0 ? <SectionEmpty title="Aucune note personnelle" description="Enregistrez vos évaluations et coefficients pour suivre votre moyenne pondérée." /> : grades.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-black uppercase tracking-wider text-blue-700">{courseById.get(item.courseId)?.code ?? 'Matière supprimée'}</p><h3 className="mt-1 truncate font-black text-slate-900 dark:text-white">{item.evaluationTitle}</h3><p className="mt-1 text-xs text-slate-500">Coefficient {item.coefficient}</p></div><div className="flex items-center gap-3"><strong className="text-2xl font-black text-blue-700">{item.score}/{item.maxScore}</strong><CardActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} /></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, Number(item.score) / Math.max(Number(item.maxScore), 1) * 100))}%` }} /></div></div>)}</div><GradeForm form={form} setForm={setForm} courses={Array.from(courseById.values())} editing={Boolean(editing)} saving={saving} onSubmit={onSubmit} onCancel={onCancel} /></div> }
function FormCard({ title, children, onSubmit, onCancel, editing, saving }: { title: string; children: ReactNode; onSubmit: (event: FormEvent) => void; onCancel: () => void; editing: boolean; saving: boolean }) { return <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/60"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-teal-700">{editing ? 'Modification' : 'Nouveau'}</p><h3 className="mt-1 font-black text-slate-900 dark:text-white">{title}</h3></div>{editing && <button type="button" onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-white"><X className="h-4 w-4" /></button>}</div><div className="space-y-3">{children}</div><button type="submit" disabled={saving || !PERSONAL_API_URL} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editing ? 'Enregistrer' : 'Ajouter'}</button></form> }
function Field({ label, value, onChange, type = 'text', required = false, placeholder }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) { return <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">{label}<input type={type} required={required} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900" /></label> }
function SelectField({ label, value, onChange, options, required = false }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; required?: boolean }) { return <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">{label}<select required={required} value={value} onChange={event => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900"><option value="">Sélectionner…</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label> }
function CourseForm({ form, setForm, editing, saving, onSubmit, onCancel }: { form: CourseForm; setForm: (value: CourseForm) => void; editing: boolean; saving: boolean; onSubmit: (event: FormEvent) => void; onCancel: () => void }) { return <FormCard title="une matière" editing={editing} saving={saving} onSubmit={onSubmit} onCancel={onCancel}><div className="grid grid-cols-2 gap-3"><Field label="Code" value={form.code} required onChange={value => setForm({ ...form, code: value })} /><Field label="Crédits" type="number" value={form.credits} onChange={value => setForm({ ...form, credits: Number(value) })} /></div><Field label="Nom de la matière" value={form.title} required onChange={value => setForm({ ...form, title: value })} /><Field label="Enseignant" value={form.instructor} onChange={value => setForm({ ...form, instructor: value })} /><Field label="Semestre ou salle" value={form.classroom} onChange={value => setForm({ ...form, classroom: value })} /><Field label="Description" value={form.description} onChange={value => setForm({ ...form, description: value })} /></FormCard> }
function ScheduleForm({ form, setForm, courses, editing, saving, onSubmit, onCancel }: { form: ScheduleForm; setForm: (value: ScheduleForm) => void; courses: PersonalCourse[]; editing: boolean; saving: boolean; onSubmit: (event: FormEvent) => void; onCancel: () => void }) { return <FormCard title="un créneau" editing={editing} saving={saving} onSubmit={onSubmit} onCancel={onCancel}><SelectField label="Matière" value={form.courseId} required onChange={value => setForm({ ...form, courseId: value })} options={courses.map(course => ({ value: course.id, label: `${course.code} — ${course.title}` }))} /><SelectField label="Jour" value={form.dayOfWeek} required onChange={value => setForm({ ...form, dayOfWeek: value })} options={days.map(day => ({ value: day, label: dayLabels[day] }))} /><div className="grid grid-cols-2 gap-3"><Field label="Début" type="time" value={form.startTime} required onChange={value => setForm({ ...form, startTime: value })} /><Field label="Fin" type="time" value={form.endTime} required onChange={value => setForm({ ...form, endTime: value })} /></div><Field label="Salle" value={form.classroom} onChange={value => setForm({ ...form, classroom: value })} /><Field label="Type ou note" value={form.type} onChange={value => setForm({ ...form, type: value })} /></FormCard> }
function AssignmentForm({ form, setForm, courses, editing, saving, onSubmit, onCancel }: { form: AssignmentForm; setForm: (value: AssignmentForm) => void; courses: PersonalCourse[]; editing: boolean; saving: boolean; onSubmit: (event: FormEvent) => void; onCancel: () => void }) { return <FormCard title="une tâche" editing={editing} saving={saving} onSubmit={onSubmit} onCancel={onCancel}><SelectField label="Matière" value={form.courseId} required onChange={value => setForm({ ...form, courseId: value })} options={courses.map(course => ({ value: course.id, label: `${course.code} — ${course.title}` }))} /><Field label="Titre" value={form.title} required onChange={value => setForm({ ...form, title: value })} /><Field label="Échéance" type="datetime-local" value={form.dueDate} onChange={value => setForm({ ...form, dueDate: value })} /><div className="grid grid-cols-2 gap-3"><SelectField label="Priorité" value={form.priority} onChange={value => setForm({ ...form, priority: value })} options={Object.entries(priorityLabels).map(([value, label]) => ({ value, label }))} /><SelectField label="Statut" value={form.status} onChange={value => setForm({ ...form, status: value })} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} /></div><Field label="Description" value={form.description} onChange={value => setForm({ ...form, description: value })} /></FormCard> }
function GradeForm({ form, setForm, courses, editing, saving, onSubmit, onCancel }: { form: GradeForm; setForm: (value: GradeForm) => void; courses: PersonalCourse[]; editing: boolean; saving: boolean; onSubmit: (event: FormEvent) => void; onCancel: () => void }) { return <FormCard title="une note" editing={editing} saving={saving} onSubmit={onSubmit} onCancel={onCancel}><SelectField label="Matière" value={form.courseId} required onChange={value => setForm({ ...form, courseId: value })} options={courses.map(course => ({ value: course.id, label: `${course.code} — ${course.title}` }))} /><Field label="Évaluation" value={form.evaluationTitle} required onChange={value => setForm({ ...form, evaluationTitle: value })} /><div className="grid grid-cols-2 gap-3"><Field label="Note obtenue" type="number" value={form.score} required onChange={value => setForm({ ...form, score: value })} /><Field label="Maximum" type="number" value={form.maxScore} required onChange={value => setForm({ ...form, maxScore: value })} /></div><Field label="Coefficient" type="number" value={form.coefficient} required onChange={value => setForm({ ...form, coefficient: value })} /></FormCard> }
