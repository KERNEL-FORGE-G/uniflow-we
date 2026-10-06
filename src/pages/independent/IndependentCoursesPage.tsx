import { FormEvent, useEffect, useMemo, useState } from 'react'
import { IconTile, SubjectIcon, UniIcon } from '../../components/ui/UniIcon'
import { subjectColor } from '../../lib/subjectIcon'
import {
  personalAppwriteApi as personalApi,
  type PersonalAssignmentRecord,
  type PersonalCourseRecord,
  type PersonalGradeRecord,
  type PersonalScheduleRecord,
} from '../../lib/appwrite'
import {
  errorMessage,
  PRESET_COURSE_COLORS,
} from './independentCommon'

type CourseForm = {
  code: string
  title: string
  instructor: string
  credits: number | ''
  colorHex: string
  classroom: string
  description: string
}

const emptyForm: CourseForm = {
  code: '',
  title: '',
  instructor: '',
  credits: '',
  colorHex: '#0d9488',
  classroom: '',
  description: '',
}

export default function IndependentCoursesPage() {
  const [courses, setCourses] = useState<PersonalCourseRecord[]>([])
  const [schedules, setSchedules] = useState<PersonalScheduleRecord[]>([])
  const [assignments, setAssignments] = useState<PersonalAssignmentRecord[]>([])
  const [grades, setGrades] = useState<PersonalGradeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<PersonalCourseRecord | null>(null)
  const [form, setForm] = useState<CourseForm>(emptyForm)

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

  useEffect(() => {
    void loadData()
  }, [])

  const openCreateModal = () => {
    setEditingCourse(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEditModal = (course: PersonalCourseRecord) => {
    setEditingCourse(course)
    setForm({
      code: course.code,
      title: course.title,
      instructor: course.instructor ?? '',
      credits: course.credits ?? '',
      colorHex: course.colorHex ?? '#0d9488',
      classroom: course.classroom ?? '',
      description: course.description ?? '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCourse(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.code.trim() || !form.title.trim()) {
      setError('Le code et le titre de la matière sont obligatoires.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        instructor: form.instructor.trim(),
        credits: form.credits === '' ? 0 : Number(form.credits),
        colorHex: form.colorHex || '#0d9488',
        classroom: form.classroom.trim(),
        description: form.description.trim(),
      }

      if (editingCourse) {
        const updated = await personalApi.courses.update(editingCourse.id, payload)
        setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? updated : c)))
        setNotice('Matière mise à jour avec succès.')
      } else {
        const created = await personalApi.courses.create(payload)
        setCourses((prev) => [created, ...prev])
        setNotice('Matière créée et ajoutée à votre cursus.')
      }
      closeModal()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (course: PersonalCourseRecord) => {
    if (!window.confirm(`Supprimer la matière « ${course.title} » ? Ses créneaux et devoirs associés ne seront plus liés.`)) {
      return
    }

    try {
      await personalApi.courses.delete(course.id)
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
      setNotice(`Matière « ${course.title} » supprimée.`)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.instructor ?? '').toLowerCase().includes(q) ||
        (c.classroom ?? '').toLowerCase().includes(q)
    )
  }, [courses, search])

  const totalCredits = useMemo(
    () => courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0),
    [courses]
  )

  const instructorsCount = useMemo(() => {
    const set = new Set(courses.map((c) => c.instructor?.trim()).filter(Boolean))
    return set.size
  }, [courses])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <UniIcon name="spinner" weight="bold" size={36} className="animate-spin text-[#0d9488]" />
          <span>Chargement de vos matières…</span>
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
            <UniIcon name="courses" weight="bold" size={16} />
            <span>Catalogue Personnel</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Mes Matières &amp; Cours
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organisez votre cursus, vos volumes horaires et suivez vos crédits ECTS en toute indépendance.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-5 py-3 text-xs font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <UniIcon name="plus" weight="bold" size={16} />
          <span>Ajouter une matière</span>
        </button>
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

      {/* ── Summary Counters ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-bold uppercase text-slate-500">Matières actives</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{courses.length}</p>
          <p className="mt-0.5 text-xs text-slate-400">Modules enregistrés</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-bold uppercase text-slate-500">Crédits ECTS cumulés</p>
          <p className="mt-1 text-2xl font-black text-[#0d9488]">{totalCredits}</p>
          <p className="mt-0.5 text-xs text-slate-400">Total des crédits académiques</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-bold uppercase text-slate-500">Enseignants référencés</p>
          <p className="mt-1 text-2xl font-black text-[#1e3a8a] dark:text-blue-400">{instructorsCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Professeurs / intervenants</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-bold uppercase text-slate-500">Créneaux de cours</p>
          <p className="mt-1 text-2xl font-black text-purple-700 dark:text-purple-400">{schedules.length}</p>
          <p className="mt-0.5 text-xs text-slate-400">Sessions au planning</p>
        </div>
      </section>

      {/* ── Search Bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <UniIcon
            name="search"
            weight="bold"
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, code ou enseignant…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
        <p className="text-xs text-slate-500">
          {filteredCourses.length} matière(s) affichée(s)
        </p>
      </div>

      {/* ── Courses Grid ── */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-12 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
            <UniIcon name="courses" weight="bold" size={32} />
          </div>
          <h3 className="mt-4 text-base font-black text-slate-800 dark:text-slate-200">
            {search ? 'Aucune matière ne correspond à votre recherche' : 'Aucune matière dans votre cursus'}
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500">
            {search
              ? 'Essayez de modifier votre requête de recherche ou effacez le filtre.'
              : 'Commencez par ajouter votre premier cours pour configurer vos créneaux, devoirs et évaluations.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0d9488] px-5 py-2.5 text-xs font-black text-white hover:bg-teal-700"
          >
            <UniIcon name="plus" size={14} />
            <span>Créer ma première matière</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, index) => {
            const color = subjectColor(course.code, course.colorHex)
            const courseSchedules = schedules.filter((s) => s.courseId === course.id)
            const courseAssignments = assignments.filter((a) => a.courseId === course.id && a.status !== 'DONE')
            const courseGrades = grades.filter((g) => g.courseId === course.id)

            // Course average if any
            let courseAvg: number | null = null
            if (courseGrades.length > 0) {
              const totalCoeff = courseGrades.reduce((sum, g) => sum + (Number(g.coefficient) || 1), 0)
              const totalPts = courseGrades.reduce(
                (sum, g) => sum + ((Number(g.score) / Math.max(Number(g.maxScore) || 20, 1)) * 20 * (Number(g.coefficient) || 1)),
                0
              )
              courseAvg = totalCoeff > 0 ? totalPts / totalCoeff : null
            }

            return (
              <div
                key={course.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Accent top bar */}
                <div
                  className="absolute left-0 right-0 top-0 h-1.5"
                  style={{ backgroundColor: color }}
                />

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <IconTile
                        subject={course.title}
                        subjectCode={course.code}
                        color={color}
                        variant="filled"
                        size={44}
                        index={index}
                      />
                      <div className="min-w-0">
                        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                          {course.code}
                        </span>
                        <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(course)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-teal-700 dark:hover:bg-slate-800"
                        title="Modifier"
                      >
                        <UniIcon name="edit" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(course)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        title="Supprimer"
                      >
                        <UniIcon name="trash" size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    {course.instructor && (
                      <p className="flex items-center gap-1.5">
                        <UniIcon name="teacher" size={14} className="text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{course.instructor}</span>
                      </p>
                    )}
                    {course.classroom && (
                      <p className="flex items-center gap-1.5">
                        <UniIcon name="room" size={14} className="text-slate-400" />
                        <span>{course.classroom}</span>
                      </p>
                    )}
                  </div>

                  {course.description && (
                    <p className="mt-3 line-clamp-2 rounded-xl bg-slate-50/70 p-2.5 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Footer stats pill */}
                <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="rounded-lg bg-teal-50 px-2.5 py-1 font-black text-teal-800 dark:bg-teal-950/50 dark:text-teal-300">
                      {course.credits ?? 0} crédits ECTS
                    </span>

                    <div className="flex items-center gap-2 text-slate-400">
                      <span title="Séances de planning">{courseSchedules.length} séance(s)</span>
                      <span>·</span>
                      <span title="Devoirs en attente">{courseAssignments.length} devoir(s)</span>
                      {courseAvg != null && (
                        <>
                          <span>·</span>
                          <span className="font-extrabold text-[#1e3a8a] dark:text-teal-400" title="Moyenne de la matière">
                            {courseAvg.toFixed(1)}/20
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal Dialog: Create / Edit Course ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
                  <UniIcon name="courses" weight="bold" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingCourse ? 'Modifier la matière' : 'Ajouter une matière'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Informations du cours dans votre cursus personnel
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Code de matière *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="ex. INFO101, MATH202"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Crédits ECTS
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="ex. 4"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Intitulé complet de la matière *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex. Algorithmique & Structures de Données"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Enseignant / Intervenant
                  </label>
                  <input
                    type="text"
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    placeholder="ex. Pr. Nguemo"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Lieu / Salle habituelle
                  </label>
                  <input
                    type="text"
                    value={form.classroom}
                    onChange={(e) => setForm({ ...form, classroom: e.target.value })}
                    placeholder="ex. Amphi 100, Distanciel"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Color swatch picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Couleur d'identification
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COURSE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, colorHex: c })}
                      className={`h-7 w-7 rounded-full border-2 transition ${
                        form.colorHex === c ? 'border-slate-900 scale-110 shadow-xs dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Description / Objectifs d'apprentissage
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Syllabus, références bibliographiques recommandées, coefficient…"
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
                  <span>{editingCourse ? 'Enregistrer les modifications' : 'Ajouter la matière'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
