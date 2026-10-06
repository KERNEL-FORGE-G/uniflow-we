import { FormEvent, useEffect, useMemo, useState } from 'react'
import { IconTile, UniIcon } from '../../components/ui/UniIcon'
import { subjectColor } from '../../lib/subjectIcon'
import {
  personalAppwriteApi as personalApi,
  type PersonalAssignmentRecord,
  type PersonalCourseRecord,
} from '../../lib/appwrite'
import {
  errorMessage,
  formatDate,
  formatRelativeDueDate,
  isOverdue,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from './independentCommon'

type AssignmentForm = {
  courseId: string
  title: string
  dueDate: string
  priority: string
  status: string
  description: string
}

const emptyForm: AssignmentForm = {
  courseId: '',
  title: '',
  dueDate: '',
  priority: 'MEDIUM',
  status: 'TODO',
  description: '',
}

export default function IndependentAssignmentsPage() {
  const [courses, setCourses] = useState<PersonalCourseRecord[]>([])
  const [assignments, setAssignments] = useState<PersonalAssignmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Filters & display
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE'>('ALL')
  const [courseFilter, setCourseFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<PersonalAssignmentRecord | null>(null)
  const [form, setForm] = useState<AssignmentForm>(emptyForm)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [courseData, assignmentData] = await Promise.all([
        personalApi.courses.list(),
        personalApi.assignments.list(),
      ])
      setCourses(courseData ?? [])
      setAssignments(assignmentData ?? [])
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  const openCreateModal = () => {
    setEditingAssignment(null)
    setForm({
      ...emptyForm,
      courseId: courses[0]?.id ?? '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (task: PersonalAssignmentRecord) => {
    setEditingAssignment(task)
    setForm({
      courseId: task.courseId,
      title: task.title,
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
      priority: task.priority ?? 'MEDIUM',
      status: task.status ?? 'TODO',
      description: task.description ?? '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAssignment(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Le titre du devoir est obligatoire.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        courseId: form.courseId,
        title: form.title.trim(),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : '',
        priority: form.priority,
        status: form.status,
        description: form.description.trim(),
      }

      if (editingAssignment) {
        const updated = await personalApi.assignments.update(editingAssignment.id, payload)
        setAssignments((prev) => prev.map((a) => (a.id === editingAssignment.id ? updated : a)))
        setNotice('Devoir mis à jour.')
      } else {
        const created = await personalApi.assignments.create(payload)
        setAssignments((prev) => [created, ...prev])
        setNotice('Nouveau devoir enregistré.')
      }
      closeModal()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (task: PersonalAssignmentRecord) => {
    if (!window.confirm(`Supprimer le devoir « ${task.title} » ?`)) return

    try {
      await personalApi.assignments.delete(task.id)
      setAssignments((prev) => prev.filter((a) => a.id !== task.id))
      setNotice('Devoir supprimé.')
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const changeStatus = async (task: PersonalAssignmentRecord, newStatus: string) => {
    try {
      const updated = await personalApi.assignments.update(task.id, { status: newStatus })
      setAssignments((prev) => prev.map((a) => (a.id === task.id ? updated : a)))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  // Counters
  const overdueCount = useMemo(() => assignments.filter(isOverdue).length, [assignments])
  const todoCount = useMemo(() => assignments.filter((a) => a.status === 'TODO' && !isOverdue(a)).length, [assignments])
  const inProgressCount = useMemo(() => assignments.filter((a) => a.status === 'IN_PROGRESS' && !isOverdue(a)).length, [assignments])
  const doneCount = useMemo(() => assignments.filter((a) => a.status === 'DONE').length, [assignments])

  // Filtered
  const filteredAssignments = useMemo(() => {
    return assignments.filter((task) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase()
        const course = courseById.get(task.courseId)
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchDesc = (task.description ?? '').toLowerCase().includes(q)
        const matchCourse = course ? (course.code + ' ' + course.title).toLowerCase().includes(q) : false
        if (!matchTitle && !matchDesc && !matchCourse) return false
      }

      // Course
      if (courseFilter && task.courseId !== courseFilter) return false

      // Priority
      if (priorityFilter && task.priority !== priorityFilter) return false

      // Status
      if (statusFilter === 'OVERDUE') return isOverdue(task)
      if (statusFilter === 'TODO') return task.status === 'TODO'
      if (statusFilter === 'IN_PROGRESS') return task.status === 'IN_PROGRESS'
      if (statusFilter === 'DONE') return task.status === 'DONE'

      return true
    })
  }, [assignments, search, courseFilter, priorityFilter, statusFilter, courseById])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <UniIcon name="spinner" weight="bold" size={36} className="animate-spin text-[#0d9488]" />
          <span>Chargement de vos devoirs…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-14 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
            <UniIcon name="assignments" weight="bold" size={16} />
            <span>Gestion des Tâches</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Devoirs &amp; Échéances
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Suivez vos livrables, devoirs maison et révisions avec alertes d'échéances et priorités.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`rounded-lg px-3 py-1.5 transition ${
                viewMode === 'kanban' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Vue Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-1.5 transition ${
                viewMode === 'list' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Vue Liste
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-5 py-3 text-xs font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <UniIcon name="plus" weight="bold" size={16} />
            <span>Nouveau devoir</span>
          </button>
        </div>
      </div>

      {/* ── Alerts ── */}
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
      {notice && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          <div className="flex items-center gap-2">
            <UniIcon name="success" weight="fill" size={18} className="text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-500 hover:text-emerald-700">
            <UniIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* ── Stat Counters ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`rounded-2xl border p-4 text-left transition ${
            statusFilter === 'ALL'
              ? 'border-slate-900 bg-slate-900 text-white shadow-md dark:border-white dark:bg-white dark:text-slate-900'
              : 'border-slate-200/80 bg-white text-slate-900 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white'
          }`}
        >
          <p className="text-[10px] font-bold uppercase opacity-75">Total devoirs</p>
          <p className="mt-1 text-2xl font-black">{assignments.length}</p>
          <p className="mt-0.5 text-[11px] opacity-75">Toutes les tâches</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('OVERDUE')}
          className={`rounded-2xl border p-4 text-left transition ${
            statusFilter === 'OVERDUE'
              ? 'border-rose-600 bg-rose-600 text-white shadow-md'
              : 'border-rose-200 bg-rose-50/60 text-rose-900 hover:border-rose-300 dark:border-rose-950 dark:bg-rose-950/20 dark:text-rose-300'
          }`}
        >
          <p className="text-[10px] font-bold uppercase opacity-75">En retard</p>
          <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{overdueCount}</p>
          <p className="mt-0.5 text-[11px] opacity-75">Échéances dépassées</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('TODO')}
          className={`rounded-2xl border p-4 text-left transition ${
            statusFilter === 'TODO'
              ? 'border-blue-600 bg-blue-600 text-white shadow-md'
              : 'border-slate-200/80 bg-white text-slate-900 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white'
          }`}
        >
          <p className="text-[10px] font-bold uppercase opacity-75">À faire</p>
          <p className="mt-1 text-2xl font-black text-[#1e3a8a] dark:text-blue-400">{todoCount}</p>
          <p className="mt-0.5 text-[11px] opacity-75">Non commencées</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`rounded-2xl border p-4 text-left transition ${
            statusFilter === 'IN_PROGRESS'
              ? 'border-amber-600 bg-amber-600 text-white shadow-md'
              : 'border-slate-200/80 bg-white text-slate-900 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white'
          }`}
        >
          <p className="text-[10px] font-bold uppercase opacity-75">En cours</p>
          <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{inProgressCount}</p>
          <p className="mt-0.5 text-[11px] opacity-75">En préparation</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('DONE')}
          className={`rounded-2xl border p-4 text-left transition ${
            statusFilter === 'DONE'
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
              : 'border-slate-200/80 bg-white text-slate-900 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white'
          }`}
        >
          <p className="text-[10px] font-bold uppercase opacity-75">Terminées</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{doneCount}</p>
          <p className="mt-0.5 text-[11px] opacity-75">Devoirs rendus</p>
        </button>
      </section>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-64">
            <UniIcon
              name="search"
              weight="bold"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer devoirs…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Toutes les matières</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Toutes les priorités</option>
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {filteredAssignments.length} devoir(s) affiché(s)
        </span>
      </div>

      {/* ── VIEW 1: KANBAN MODE ── */}
      {viewMode === 'kanban' && (
        <div className="grid gap-5 md:grid-cols-3">
          {/* Column 1: TODO */}
          <div className="flex flex-col rounded-3xl border border-slate-200/90 bg-slate-50/70 p-4.5 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">À faire</h3>
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-slate-600 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
                {filteredAssignments.filter((a) => a.status === 'TODO').length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {filteredAssignments.filter((a) => a.status === 'TODO').map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  course={courseById.get(task.courseId)}
                  onEdit={() => openEditModal(task)}
                  onDelete={() => void handleDelete(task)}
                  onStatusChange={(status) => void changeStatus(task, status)}
                />
              ))}
              {filteredAssignments.filter((a) => a.status === 'TODO').length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  Aucun devoir à faire
                </div>
              )}
            </div>
          </div>

          {/* Column 2: IN_PROGRESS */}
          <div className="flex flex-col rounded-3xl border border-slate-200/90 bg-slate-50/70 p-4.5 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">En cours</h3>
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-slate-600 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
                {filteredAssignments.filter((a) => a.status === 'IN_PROGRESS').length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {filteredAssignments.filter((a) => a.status === 'IN_PROGRESS').map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  course={courseById.get(task.courseId)}
                  onEdit={() => openEditModal(task)}
                  onDelete={() => void handleDelete(task)}
                  onStatusChange={(status) => void changeStatus(task, status)}
                />
              ))}
              {filteredAssignments.filter((a) => a.status === 'IN_PROGRESS').length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  Aucun devoir en cours
                </div>
              )}
            </div>
          </div>

          {/* Column 3: DONE */}
          <div className="flex flex-col rounded-3xl border border-slate-200/90 bg-slate-50/70 p-4.5 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Terminées</h3>
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-slate-600 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
                {filteredAssignments.filter((a) => a.status === 'DONE').length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {filteredAssignments.filter((a) => a.status === 'DONE').map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  course={courseById.get(task.courseId)}
                  onEdit={() => openEditModal(task)}
                  onDelete={() => void handleDelete(task)}
                  onStatusChange={(status) => void changeStatus(task, status)}
                />
              ))}
              {filteredAssignments.filter((a) => a.status === 'DONE').length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  Aucun devoir terminé
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: LIST MODE ── */}
      {viewMode === 'list' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {filteredAssignments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-xs text-slate-400">
              Aucun devoir trouvé avec les filtres sélectionnés
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssignments.map((task) => {
                const course = courseById.get(task.courseId)
                const rel = formatRelativeDueDate(task.dueDate)
                const priorityMeta = PRIORITY_LABELS[task.priority ?? 'MEDIUM'] ?? PRIORITY_LABELS.MEDIUM
                const statusMeta = STATUS_LABELS[task.status ?? 'TODO'] ?? STATUS_LABELS.TODO

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                      rel.isOverdue && task.status !== 'DONE'
                        ? 'border-rose-200 bg-rose-50/40 dark:border-rose-950/40 dark:bg-rose-950/20'
                        : 'border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-2xs dark:border-slate-800 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => void changeStatus(task, task.status === 'DONE' ? 'TODO' : 'DONE')}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                          task.status === 'DONE'
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 bg-white hover:border-teal-600 dark:border-slate-700'
                        }`}
                      >
                        {task.status === 'DONE' && <UniIcon name="check" size={13} />}
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
                              rel.isOverdue && task.status !== 'DONE'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-200/70 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {rel.text}
                          </span>
                        </div>
                        <h4 className={`mt-1 truncate text-sm font-black ${
                          task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="line-clamp-1 text-xs text-slate-500">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        value={task.status ?? 'TODO'}
                        onChange={(e) => void changeStatus(task, e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <option value="TODO">À faire</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="DONE">Terminée</option>
                        <option value="CANCELLED">Annulée</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                        title="Modifier"
                      >
                        <UniIcon name="edit" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(task)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Supprimer"
                      >
                        <UniIcon name="trash" size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modal Dialog: Create / Edit Assignment ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  <UniIcon name="tasks" weight="bold" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingAssignment ? 'Modifier le devoir' : 'Ajouter un devoir'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Définition de la tâche et des échéances de rendu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <UniIcon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Matière associée
                </label>
                <select
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">Sans matière (tâche générale)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Intitulé du devoir ou de l'activité *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex. TP n°3 : Implémentation arbre binaire"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Date &amp; heure d'échéance
                  </label>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Priorité
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Statut
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="TODO">À faire</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="DONE">Terminée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Consignes / Remarques
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Instructions, format de rendu attendu, lien vers le cours…"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0d9488] px-5 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving && <UniIcon name="spinner" size={14} className="animate-spin" />}
                  <span>{editingAssignment ? 'Enregistrer les modifications' : 'Créer le devoir'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({
  task,
  course,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: PersonalAssignmentRecord
  course?: PersonalCourseRecord
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: string) => void
}) {
  const rel = formatRelativeDueDate(task.dueDate)
  const priorityMeta = PRIORITY_LABELS[task.priority ?? 'MEDIUM'] ?? PRIORITY_LABELS.MEDIUM
  const isDone = task.status === 'DONE'

  return (
    <div
      className={`group relative rounded-2xl border p-4 shadow-2xs transition hover:-translate-y-0.5 hover:shadow-sm dark:bg-slate-900 ${
        rel.isOverdue && !isDone
          ? 'border-rose-200 bg-rose-50/50 dark:border-rose-950/40 dark:bg-rose-950/20'
          : 'border-slate-200/80 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {course && (
            <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-400">
              {course.code}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${priorityMeta.badgeClass}`}>
            {priorityMeta.label}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
            title="Modifier"
          >
            <UniIcon name="edit" size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            title="Supprimer"
          >
            <UniIcon name="trash" size={13} />
          </button>
        </div>
      </div>

      <h4 className={`mt-2 text-xs font-black ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] dark:border-slate-800">
        <span
          className={`rounded-full px-2 py-0.5 font-bold ${
            rel.isOverdue && !isDone
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {rel.text}
        </span>

        {/* Status quick mover */}
        <select
          value={task.status ?? 'TODO'}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="TODO">À faire</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="DONE">Terminé</option>
        </select>
      </div>
    </div>
  )
}
