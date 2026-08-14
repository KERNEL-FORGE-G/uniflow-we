import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  BookOpen, CalendarDays, CheckCircle2, ClipboardList, FileWarning,
  GraduationCap, Loader2, Plus, Save, Trash2, X
} from 'lucide-react'
import {
  ApiError, PERSONAL_API_URL, personalApi,
  type PersonalAssignment, type PersonalCourse, type PersonalGrade, type PersonalSchedule
} from '../lib/api'

 type Tab = 'courses' | 'schedule' | 'assignments' | 'grades'

const emptyCourse = { code: '', title: '', instructor: '', credits: 0, colorHex: '#2563eb', classroom: '', description: '' }
const emptySchedule = { courseId: '', dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '10:00', classroom: '', type: 'CM' }
const emptyAssignment = { courseId: '', title: '', dueDate: '', description: '', priority: 'MEDIUM', status: 'PENDING' }
const emptyGrade = { courseId: '', evaluationTitle: '', score: '', maxScore: '20', coefficient: '1' }

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return error instanceof Error ? error.message : 'Erreur de communication avec le backend personnel.'
}

export default function IndependentWorkspacePage() {
  const [tab, setTab] = useState<Tab>('courses')
  const [courses, setCourses] = useState<PersonalCourse[]>([])
  const [schedules, setSchedules] = useState<PersonalSchedule[]>([])
  const [assignments, setAssignments] = useState<PersonalAssignment[]>([])
  const [grades, setGrades] = useState<PersonalGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editingCourse, setEditingCourse] = useState<PersonalCourse | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<PersonalSchedule | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<PersonalAssignment | null>(null)
  const [courseForm, setCourseForm] = useState(emptyCourse)
  const [scheduleForm, setScheduleForm] = useState(emptySchedule)
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignment)
  const [gradeForm, setGradeForm] = useState(emptyGrade)

  const courseById = useMemo(() => new Map(courses.map(course => [course.id, course])), [courses])

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

  useEffect(() => { loadData() }, [])

  const closeForms = () => {
    setEditingCourse(null)
    setEditingSchedule(null)
    setEditingAssignment(null)
    setCourseForm(emptyCourse)
    setScheduleForm(emptySchedule)
    setAssignmentForm(emptyAssignment)
    setGradeForm(emptyGrade)
    setError(null)
  }

  const handleCourseSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!courseForm.code.trim() || !courseForm.title.trim()) {
      setError('Le code et le titre du cours sont obligatoires.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = { ...courseForm, code: courseForm.code.trim().toUpperCase(), title: courseForm.title.trim() }
      if (editingCourse) {
        const updated = await personalApi.courses.update(editingCourse.id, payload)
        setCourses(previous => previous.map(course => course.id === editingCourse.id ? updated : course))
        setNotice('Cours mis à jour dans votre espace personnel.')
      } else {
        const created = await personalApi.courses.create(payload)
        setCourses(previous => [created, ...previous])
        setNotice('Cours créé dans votre espace personnel.')
      }
      closeForms()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleCourseDelete = async (course: PersonalCourse) => {
    if (!window.confirm(`Supprimer le cours « ${course.title} » ?`)) return
    setSaving(true)
    setError(null)
    try {
      await personalApi.courses.delete(course.id)
      setCourses(previous => previous.filter(item => item.id !== course.id))
      setSchedules(previous => previous.filter(item => item.courseId !== course.id))
      setNotice('Cours supprimé.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleScheduleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!scheduleForm.courseId || !scheduleForm.startTime || !scheduleForm.endTime) {
      setError('Le cours, l’heure de début et l’heure de fin sont obligatoires.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingSchedule) {
        const updated = await personalApi.schedules.update(editingSchedule.id, scheduleForm)
        setSchedules(previous => previous.map(item => item.id === editingSchedule.id ? updated : item))
        setNotice('Créneau mis à jour.')
      } else {
        const created = await personalApi.schedules.create(scheduleForm)
        setSchedules(previous => [created, ...previous])
        setNotice('Créneau ajouté à votre emploi du temps.')
      }
      closeForms()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleScheduleDelete = async (schedule: PersonalSchedule) => {
    if (!window.confirm('Supprimer ce créneau horaire ?')) return
    setSaving(true)
    setError(null)
    try {
      await personalApi.schedules.delete(schedule.id)
      setSchedules(previous => previous.filter(item => item.id !== schedule.id))
      setNotice('Créneau supprimé.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleAssignmentSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!assignmentForm.courseId || !assignmentForm.title.trim() || !assignmentForm.dueDate) {
      setError('Le cours, le titre et la date limite sont obligatoires.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingAssignment) {
        const updated = await personalApi.assignments.update(editingAssignment.id, assignmentForm)
        setAssignments(previous => previous.map(item => item.id === editingAssignment.id ? updated : item))
        setNotice('Devoir mis à jour.')
      } else {
        const created = await personalApi.assignments.create(assignmentForm)
        setAssignments(previous => [created, ...previous])
        setNotice('Devoir créé.')
      }
      closeForms()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleAssignmentDelete = async (assignment: PersonalAssignment) => {
    if (!window.confirm(`Supprimer le devoir « ${assignment.title} » ?`)) return
    setSaving(true)
    setError(null)
    try {
      await personalApi.assignments.delete(assignment.id)
      setAssignments(previous => previous.filter(item => item.id !== assignment.id))
      setNotice('Devoir supprimé.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleGradeSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const score = Number(gradeForm.score)
    const maxScore = Number(gradeForm.maxScore)
    const coefficient = Number(gradeForm.coefficient)
    if (!gradeForm.courseId || !gradeForm.evaluationTitle.trim() || !Number.isFinite(score) || !Number.isFinite(maxScore) || score < 0 || score > maxScore || coefficient <= 0) {
      setError('Renseignez une évaluation valide, une note comprise entre 0 et le maximum, et un coefficient positif.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const created = await personalApi.grades.create({
        courseId: gradeForm.courseId,
        evaluationTitle: gradeForm.evaluationTitle.trim(),
        score,
        maxScore,
        coefficient,
      })
      setGrades(previous => [created, ...previous])
      setGradeForm(emptyGrade)
      setNotice('Note enregistrée.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'courses' as const, label: 'Mes cours', icon: BookOpen, count: courses.length },
    { id: 'schedule' as const, label: 'Emploi du temps', icon: CalendarDays, count: schedules.length },
    { id: 'assignments' as const, label: 'Devoirs', icon: ClipboardList, count: assignments.length },
    { id: 'grades' as const, label: 'Notes', icon: GraduationCap, count: grades.length },
  ]

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#0d9488]" /></div>
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-3xl bg-gradient-to-r from-[#0f766e] via-[#0d9488] to-[#1e3a8a] p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Espace indépendant</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Gérez vous-même votre parcours</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50">Créez et modifiez vos matières, créneaux, devoirs et notes. Toutes les données affichées ici sont chargées et enregistrées par votre backend personnel.</p>
      </div>

      {!PERSONAL_API_URL && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <FileWarning className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Le backend personnel n’est pas configuré dans cet environnement. Configurez <code className="font-mono font-bold">VITE_PERSONAL_API_URL</code> pour activer les CRUD indépendants et conserver les données côté serveur.</p>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p>{error}</p>
          <button type="button" onClick={() => setError(null)} aria-label="Fermer" className="text-rose-600"><X className="h-4 w-4" /></button>
        </div>
      )}
      {notice && <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" />{notice}</div>}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} type="button" onClick={() => { setTab(id); closeForms(); setNotice(null) }} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${tab === id ? 'bg-[#1e3a8a] text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
            <Icon className="h-4 w-4" />{label}<span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] dark:bg-white/10">{count}</span>
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {courses.length === 0 ? <EmptyState label="Aucun cours personnel enregistré." /> : courses.map(course => <div key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-teal-600">{course.code}</p><h2 className="mt-1 font-bold text-slate-900 dark:text-white">{course.title}</h2><p className="mt-1 text-xs text-slate-500">{course.instructor || 'Enseignant non renseigné'} · {course.credits ?? 0} crédit(s){course.classroom ? ` · ${course.classroom}` : ''}</p></div><div className="flex gap-1"><button type="button" onClick={() => { setEditingCourse(course); setCourseForm({ code: course.code, title: course.title, instructor: course.instructor || '', credits: course.credits || 0, colorHex: course.colorHex || '#2563eb', classroom: course.classroom || '', description: course.description || '' }); setNotice(null) }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Save className="h-4 w-4" /></button><button type="button" onClick={() => handleCourseDelete(course)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></div></div>{course.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{course.description}</p>}</div>)}
          </div>
          <CourseForm form={courseForm} setForm={setCourseForm} editing={Boolean(editingCourse)} saving={saving} onSubmit={handleCourseSubmit} onCancel={closeForms} />
        </section>
      )}

      {tab === 'schedule' && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">{schedules.length === 0 ? <EmptyState label="Aucun créneau personnel enregistré." /> : schedules.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-teal-600">{item.dayOfWeek} · {item.startTime}–{item.endTime}</p><h2 className="mt-1 font-bold text-slate-900 dark:text-white">{item.courseTitle || courseById.get(item.courseId)?.title || 'Cours non renseigné'}</h2><p className="mt-1 text-xs text-slate-500">{item.type || 'Type non renseigné'}{item.classroom ? ` · ${item.classroom}` : ''}</p></div><div className="flex gap-1"><button type="button" onClick={() => { setEditingSchedule(item); setScheduleForm({ courseId: item.courseId, dayOfWeek: item.dayOfWeek, startTime: item.startTime, endTime: item.endTime, classroom: item.classroom || '', type: item.type || 'CM' }); setNotice(null) }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Save className="h-4 w-4" /></button><button type="button" onClick={() => handleScheduleDelete(item)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></div></div></div>)}</div>
          <ScheduleForm form={scheduleForm} setForm={setScheduleForm} courses={courses} editing={Boolean(editingSchedule)} saving={saving} onSubmit={handleScheduleSubmit} onCancel={closeForms} />
        </section>
      )}

      {tab === 'assignments' && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">{assignments.length === 0 ? <EmptyState label="Aucun devoir personnel enregistré." /> : assignments.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-teal-600">{item.dueDate ? new Date(item.dueDate).toLocaleDateString('fr-FR') : 'Date non renseignée'}</p><h2 className="mt-1 font-bold text-slate-900 dark:text-white">{item.title}</h2><p className="mt-1 text-xs text-slate-500">{courseById.get(item.courseId)?.title || 'Cours non renseigné'} · {item.priority || 'Priorité non renseignée'}</p></div><div className="flex gap-1"><button type="button" onClick={() => { setEditingAssignment(item); setAssignmentForm({ courseId: item.courseId, title: item.title, dueDate: item.dueDate.slice(0, 16), description: item.description || '', priority: item.priority || 'MEDIUM', status: item.status || 'PENDING' }); setNotice(null) }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Save className="h-4 w-4" /></button><button type="button" onClick={() => handleAssignmentDelete(item)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></div></div>{item.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>}</div>)}</div>
          <AssignmentForm form={assignmentForm} setForm={setAssignmentForm} courses={courses} editing={Boolean(editingAssignment)} saving={saving} onSubmit={handleAssignmentSubmit} onCancel={closeForms} />
        </section>
      )}

      {tab === 'grades' && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">{grades.length === 0 ? <EmptyState label="Aucune note personnelle enregistrée." /> : grades.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold text-teal-600">{courseById.get(item.courseId)?.code || 'Cours non renseigné'}</p><h2 className="mt-1 font-bold text-slate-900 dark:text-white">{item.evaluationTitle}</h2><p className="mt-1 text-xs text-slate-500">Coefficient {item.coefficient}</p></div><p className="text-2xl font-black text-[#1e3a8a]">{item.score}/{item.maxScore}</p></div></div>)}</div>
          <GradeForm form={gradeForm} setForm={setGradeForm} courses={courses} saving={saving} onSubmit={handleGradeSubmit} />
        </section>
      )}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">{label}</div>
}

function Field({ label, value, onChange, type = 'text', required = false, placeholder }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">{label}<input type={type} required={required} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800" /></label>
}

function FormCard({ title, children, onSubmit, onCancel, editing, saving }: { title: string; children: React.ReactNode; onSubmit: (event: FormEvent) => void; onCancel?: () => void; editing?: boolean; saving: boolean }) {
  return <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-900 dark:text-white">{editing ? 'Modifier' : 'Ajouter'} {title}</h2>{editing && onCancel && <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}</div><div className="space-y-3">{children}</div><button type="submit" disabled={saving || !PERSONAL_API_URL} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{editing ? 'Enregistrer' : 'Ajouter'}</button></form>
}

function CourseForm({ form, setForm, editing, saving, onSubmit, onCancel }: any) {
  return <FormCard title="un cours" editing={editing} saving={saving} onSubmit={onSubmit} onCancel={onCancel}><Field label="Code" value={form.code} required onChange={(value) => setForm({ ...form, code: value })} /><Field label="Titre" value={form.title} required onChange={(value) => setForm({ ...form, title: value })} /><Field label="Enseignant" value={form.instructor} onChange={(value) => setForm({ ...form, instructor: value })} /><Field label="Crédits" type="number" value={form.credits} onChange={(value) => setForm({ ...form, credits: Number(value) })} /><Field label="Salle" value={form.classroom} onChange={(value) => setForm({ ...form, classroom: value })} /><Field label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} /></FormCard>
}

function ScheduleForm({ form, setForm, courses, editing, saving, onSubmit, onCancel }: any) {
  return <FormCard title="un créneau" editing={editing} saving={saving} onSubmit={onSubmit} onCancel={onCancel}><label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Cours<select required value={form.courseId} onChange={event => setForm({ ...form, courseId: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="">Sélectionner un cours</option>{courses.map((course: PersonalCourse) => <option key={course.id} value={course.id}>{course.code} — {course.title}</option>)}</select></label><label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Jour<select value={form.dayOfWeek} onChange={event => setForm({ ...form, dayOfWeek: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">{['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].map(day => <option key={day}>{day}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><Field label="Début" type="time" value={form.startTime} onChange={(value) => setForm({ ...form, startTime: value })} /><Field label="Fin" type="time" value={form.endTime} onChange={(value) => setForm({ ...form, endTime: value })} /></div><Field label="Salle" value={form.classroom} onChange={(value) => setForm({ ...form, classroom: value })} /><Field label="Type" value={form.type} onChange={(value) => setForm({ ...form, type: value })} /></FormCard>
}

function AssignmentForm({ form, setForm, courses, editing, saving, onSubmit, onCancel }: any) {
  return <FormCard title="un devoir" editing={editing} saving={saving} onSubmit={onSubmit} onCancel={onCancel}><label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Cours<select required value={form.courseId} onChange={event => setForm({ ...form, courseId: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="">Sélectionner un cours</option>{courses.map((course: PersonalCourse) => <option key={course.id} value={course.id}>{course.code} — {course.title}</option>)}</select></label><Field label="Titre" required value={form.title} onChange={(value) => setForm({ ...form, title: value })} /><Field label="Échéance" required type="datetime-local" value={form.dueDate} onChange={(value) => setForm({ ...form, dueDate: value })} /><Field label="Priorité" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} /><Field label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} /></FormCard>
}

function GradeForm({ form, setForm, courses, saving, onSubmit }: any) {
  return <FormCard title="une note" saving={saving} onSubmit={onSubmit}><label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Cours<select required value={form.courseId} onChange={event => setForm({ ...form, courseId: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="">Sélectionner un cours</option>{courses.map((course: PersonalCourse) => <option key={course.id} value={course.id}>{course.code} — {course.title}</option>)}</select></label><Field label="Évaluation" required value={form.evaluationTitle} onChange={(value) => setForm({ ...form, evaluationTitle: value })} /><div className="grid grid-cols-2 gap-3"><Field label="Note" required type="number" value={form.score} onChange={(value) => setForm({ ...form, score: value })} /><Field label="Maximum" required type="number" value={form.maxScore} onChange={(value) => setForm({ ...form, maxScore: value })} /></div><Field label="Coefficient" required type="number" value={form.coefficient} onChange={(value) => setForm({ ...form, coefficient: value })} /></FormCard>
}
