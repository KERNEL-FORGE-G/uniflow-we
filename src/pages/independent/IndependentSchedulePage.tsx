import { FormEvent, useEffect, useMemo, useState } from 'react'
import { IconTile, SubjectIcon, UniIcon } from '../../components/ui/UniIcon'
import { subjectColor } from '../../lib/subjectIcon'
import {
  personalAppwriteApi as personalApi,
  type PersonalCourseRecord,
  type PersonalScheduleRecord,
} from '../../lib/appwrite'
import {
  DAY_LABELS,
  DAYS,
  errorMessage,
  timeToMinutes,
} from './independentCommon'

const SCHEDULE_GRID_START_HOUR = 7
const SCHEDULE_GRID_END_HOUR = 21
const SCHEDULE_GRID_ROW_HEIGHT = 54

type ScheduleForm = {
  courseId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  classroom: string
  type: string
}

const emptyForm: ScheduleForm = {
  courseId: '',
  dayOfWeek: 'LUNDI',
  startTime: '08:00',
  endTime: '10:00',
  classroom: '',
  type: 'CM',
}

const SESSION_TYPES = ['CM', 'TD', 'TP', 'Révision', 'Examen', 'Projet']

export default function IndependentSchedulePage() {
  const [courses, setCourses] = useState<PersonalCourseRecord[]>([])
  const [schedules, setSchedules] = useState<PersonalScheduleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Filters & views
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDay, setSelectedDay] = useState<string>('LUNDI')
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<PersonalScheduleRecord | null>(null)
  const [form, setForm] = useState<ScheduleForm>(emptyForm)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [courseData, scheduleData] = await Promise.all([
        personalApi.courses.list(),
        personalApi.schedules.list(),
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

      // Set today's day as default for list view
      const rawWeekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date()).toUpperCase()
      const normalized = rawWeekday.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (DAYS.includes(normalized as any)) {
        setSelectedDay(normalized)
      }
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
    setEditingSchedule(null)
    setForm({
      ...emptyForm,
      courseId: courses[0]?.id ?? '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (slot: PersonalScheduleRecord) => {
    setEditingSchedule(slot)
    setForm({
      courseId: slot.courseId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      classroom: slot.classroom ?? '',
      type: slot.type ?? 'CM',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSchedule(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.courseId) {
      setError('Veuillez sélectionner une matière.')
      return
    }
    if (form.startTime >= form.endTime) {
      setError("L'heure de fin doit être supérieure à l'heure de début.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        courseId: form.courseId,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        classroom: form.classroom.trim(),
        type: form.type,
      }

      if (editingSchedule) {
        const updated = await personalApi.schedules.update(editingSchedule.id, payload)
        const c = courseById.get(payload.courseId)
        const completeUpdated: PersonalScheduleRecord = {
          ...updated,
          courseTitle: c?.title,
          courseCode: c?.code,
        }
        setSchedules((prev) => prev.map((s) => (s.id === editingSchedule.id ? completeUpdated : s)))
        setNotice('Créneau mis à jour.')
      } else {
        const created = await personalApi.schedules.create(payload)
        const c = courseById.get(payload.courseId)
        const completeCreated: PersonalScheduleRecord = {
          ...created,
          courseTitle: c?.title,
          courseCode: c?.code,
        }
        setSchedules((prev) => [...prev, completeCreated])
        setNotice('Nouveau créneau ajouté à votre emploi du temps.')
      }
      closeModal()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slot: PersonalScheduleRecord) => {
    if (!window.confirm(`Supprimer ce créneau (${slot.dayOfWeek} ${slot.startTime}–${slot.endTime}) ?`)) {
      return
    }

    try {
      await personalApi.schedules.delete(slot.id)
      setSchedules((prev) => prev.filter((s) => s.id !== slot.id))
      setNotice('Créneau supprimé.')
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const filteredSchedules = useMemo(() => {
    if (!selectedCourseFilter) return schedules
    return schedules.filter((s) => s.courseId === selectedCourseFilter)
  }, [schedules, selectedCourseFilter])

  // Calculation for Weekly Grid
  const startMinutes = SCHEDULE_GRID_START_HOUR * 60
  const endMinutes = SCHEDULE_GRID_END_HOUR * 60
  const pixelsPerMinute = SCHEDULE_GRID_ROW_HEIGHT / 60
  const gridHeight = (SCHEDULE_GRID_END_HOUR - SCHEDULE_GRID_START_HOUR) * SCHEDULE_GRID_ROW_HEIGHT
  const hours = Array.from(
    { length: SCHEDULE_GRID_END_HOUR - SCHEDULE_GRID_START_HOUR },
    (_, i) => SCHEDULE_GRID_START_HOUR + i
  )

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <UniIcon name="spinner" weight="bold" size={36} className="animate-spin text-[#0d9488]" />
          <span>Chargement de votre emploi du temps…</span>
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
            <UniIcon name="schedule" weight="bold" size={16} />
            <span>Agenda &amp; Planning</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Mon Emploi du Temps
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Visualisez et planifiez vos séances de cours, TD, travaux pratiques et plages de révision autonome.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-3 py-1.5 transition ${
                viewMode === 'grid' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Grille semaine
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-1.5 transition ${
                viewMode === 'list' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Vue par jour
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-5 py-3 text-xs font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <UniIcon name="plus" weight="bold" size={16} />
            <span>Ajouter un créneau</span>
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

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">Filtrer par matière :</span>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Toutes les matières ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {filteredSchedules.length} créneau(x) configuré(s)
        </span>
      </div>

      {/* ── VIEW 1: Weekly Grid ── */}
      {viewMode === 'grid' && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              {/* Day headers */}
              <div
                className="grid border-b border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-800/60"
                style={{ gridTemplateColumns: '72px repeat(7, minmax(120px, 1fr))' }}
              >
                <div className="border-r border-slate-200 p-3 text-center text-[10px] font-black uppercase text-slate-400 dark:border-slate-800">
                  Heure
                </div>
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="border-r border-slate-200 p-3 text-center last:border-r-0 dark:border-slate-800"
                  >
                    <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {DAY_LABELS[day]}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {filteredSchedules.filter((s) => s.dayOfWeek === day).length} séance(s)
                    </span>
                  </div>
                ))}
              </div>

              {/* Grid content */}
              <div
                className="grid"
                style={{ gridTemplateColumns: '72px repeat(7, minmax(120px, 1fr))' }}
              >
                {/* Time ruler */}
                <div className="border-r border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-800/20">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="relative border-b border-slate-100 pr-2 text-right text-[10px] font-bold text-slate-400 dark:border-slate-800/80"
                      style={{ height: SCHEDULE_GRID_ROW_HEIGHT }}
                    >
                      <span className="relative -top-2">{String(hour).padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {DAYS.map((day) => {
                  const dayItems = filteredSchedules
                    .filter((item) => item.dayOfWeek === day)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))

                  return (
                    <div
                      key={day}
                      className="relative border-r border-slate-200 last:border-r-0 dark:border-slate-800"
                      style={{ height: gridHeight }}
                    >
                      {/* Hour background lines */}
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="border-b border-slate-100/90 dark:border-slate-800/50"
                          style={{ height: SCHEDULE_GRID_ROW_HEIGHT }}
                        />
                      ))}

                      {/* Course slots */}
                      {dayItems.map((item) => {
                        const course = courseById.get(item.courseId)
                        const itemStart = Math.max(startMinutes, Math.min(timeToMinutes(item.startTime), endMinutes - 15))
                        const itemEnd = Math.max(itemStart + 15, Math.min(timeToMinutes(item.endTime), endMinutes))
                        const top = (itemStart - startMinutes) * pixelsPerMinute
                        const height = Math.max((itemEnd - itemStart) * pixelsPerMinute - 4, 38)
                        const title = item.courseTitle ?? course?.title ?? 'Matière'
                        const code = item.courseCode ?? course?.code ?? ''
                        const color = subjectColor(code, course?.colorHex)

                        return (
                          <div
                            key={item.id}
                            className="group absolute left-1 right-1 overflow-hidden rounded-xl border border-white/60 p-2 text-white shadow-sm transition hover:z-20 hover:shadow-lg"
                            style={{ top, height, backgroundColor: color }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0">
                                <p className="flex items-center gap-1 truncate text-[11px] font-black">
                                  <SubjectIcon subject={title} code={code} size={12} weight="fill" className="shrink-0" />
                                  <span>{code ? `${code} · ` : ''}{title}</span>
                                </p>
                                <p className="mt-0.5 text-[9px] font-bold text-white/90">
                                  {item.startTime} – {item.endTime}
                                </p>
                              </div>

                              <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(item)}
                                  className="rounded p-1 text-white/80 hover:bg-white/20 hover:text-white"
                                  title="Modifier"
                                >
                                  <UniIcon name="edit" size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDelete(item)}
                                  className="rounded p-1 text-white/80 hover:bg-white/20 hover:text-white"
                                  title="Supprimer"
                                >
                                  <UniIcon name="trash" size={12} />
                                </button>
                              </div>
                            </div>

                            {height >= 60 && (
                              <div className="mt-1 flex items-center gap-1.5 truncate text-[9px] text-white/80">
                                {item.type && <span className="font-extrabold">{item.type}</span>}
                                {item.classroom && <span>· 📍 {item.classroom}</span>}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: Daily List Mode ── */}
      {viewMode === 'list' && (
        <div className="space-y-5">
          {/* Day Selector pills */}
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const count = filteredSchedules.filter((s) => s.dayOfWeek === day).length
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
                    selectedDay === day
                      ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white shadow-md'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <span>{DAY_LABELS[day]}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                    selectedDay === day ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Slots list for selected day */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Planning du {DAY_LABELS[selectedDay]}
            </h3>

            {filteredSchedules.filter((s) => s.dayOfWeek === selectedDay).length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun créneau ce jour-là</p>
                <p className="mt-1 text-xs text-slate-500">
                  Ajoutez vos sessions pour organiser votre journée.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...emptyForm, dayOfWeek: selectedDay, courseId: courses[0]?.id ?? '' })
                    setIsModalOpen(true)
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0d9488] px-4 py-2 text-xs font-black text-white hover:bg-teal-700"
                >
                  <UniIcon name="plus" size={14} />
                  <span>Ajouter une séance le {DAY_LABELS[selectedDay]}</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {filteredSchedules
                  .filter((s) => s.dayOfWeek === selectedDay)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((item, index) => {
                    const course = courseById.get(item.courseId)
                    const title = item.courseTitle ?? course?.title ?? 'Matière'
                    const code = item.courseCode ?? course?.code ?? ''
                    const color = subjectColor(code, course?.colorHex)

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-teal-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50"
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
                              {item.type && (
                                <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-black text-slate-700 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
                                  {item.type}
                                </span>
                              )}
                            </div>
                            <h4 className="truncate text-sm font-black text-slate-900 dark:text-white">
                              {title}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {item.classroom ? `Salle : ${item.classroom}` : 'Salle non spécifiée'}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="rounded-xl bg-teal-100/70 px-3 py-1.5 text-xs font-black text-teal-900 dark:bg-teal-950 dark:text-teal-300">
                            {item.startTime} – {item.endTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                            title="Modifier"
                          >
                            <UniIcon name="edit" size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
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
        </div>
      )}

      {/* ── Modal Dialog: Create / Edit Schedule ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
                  <UniIcon name="schedule" weight="bold" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingSchedule ? 'Modifier le créneau' : 'Ajouter un créneau'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configuration de votre plage horaire
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
                  Matière associée *
                </label>
                <select
                  required
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">Sélectionner une matière…</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Jour de la semaine *
                  </label>
                  <select
                    required
                    value={form.dayOfWeek}
                    onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {DAY_LABELS[day]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Type de séance
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {SESSION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Heure de début *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Heure de fin *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lieu / Salle / Format
                </label>
                <input
                  type="text"
                  value={form.classroom}
                  onChange={(e) => setForm({ ...form, classroom: e.target.value })}
                  placeholder="ex. Salle 204, Amphi B, Visioconférence…"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
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
                  <span>{editingSchedule ? 'Enregistrer les modifications' : 'Ajouter au planning'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
