import { FormEvent, useEffect, useMemo, useState } from 'react'
import { IconTile, UniIcon } from '../../components/ui/UniIcon'
import { subjectColor } from '../../lib/subjectIcon'
import {
  personalAppwriteApi as personalApi,
  type PersonalCourseRecord,
  type PersonalGradeRecord,
} from '../../lib/appwrite'
import {
  calcGpaAppreciation,
  calcWeightedAverage,
  errorMessage,
} from './independentCommon'

type GradeForm = {
  courseId: string
  evaluationTitle: string
  score: string
  maxScore: string
  coefficient: string
}

const emptyForm: GradeForm = {
  courseId: '',
  evaluationTitle: '',
  score: '',
  maxScore: '20',
  coefficient: '1',
}

export default function IndependentGradesPage() {
  const [courses, setCourses] = useState<PersonalCourseRecord[]>([])
  const [grades, setGrades] = useState<PersonalGradeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Filters
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<PersonalGradeRecord | null>(null)
  const [form, setForm] = useState<GradeForm>(emptyForm)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [courseData, gradeData] = await Promise.all([
        personalApi.courses.list(),
        personalApi.grades.list(),
      ])
      setCourses(courseData ?? [])
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

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  const openCreateModal = () => {
    setEditingGrade(null)
    setForm({
      ...emptyForm,
      courseId: courses[0]?.id ?? '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (grade: PersonalGradeRecord) => {
    setEditingGrade(grade)
    setForm({
      courseId: grade.courseId,
      evaluationTitle: grade.evaluationTitle,
      score: String(grade.score),
      maxScore: String(grade.maxScore),
      coefficient: String(grade.coefficient),
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingGrade(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.courseId) {
      setError('Veuillez sélectionner une matière.')
      return
    }
    if (!form.evaluationTitle.trim()) {
      setError("L'intitulé de l'évaluation est obligatoire.")
      return
    }

    const numScore = Number(form.score)
    const numMax = Number(form.maxScore) || 20
    const numCoeff = Number(form.coefficient) || 1

    if (!Number.isFinite(numScore) || numScore < 0) {
      setError('La note obtenue doit être un nombre positif.')
      return
    }
    if (numMax <= 0) {
      setError('La note maximale doit être strictement supérieure à 0.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        courseId: form.courseId,
        evaluationTitle: form.evaluationTitle.trim(),
        score: numScore,
        maxScore: numMax,
        coefficient: numCoeff,
      }

      if (editingGrade) {
        const updated = await personalApi.grades.update(editingGrade.id, payload)
        setGrades((prev) => prev.map((g) => (g.id === editingGrade.id ? updated : g)))
        setNotice('Note mise à jour.')
      } else {
        const created = await personalApi.grades.create(payload)
        setGrades((prev) => [created, ...prev])
        setNotice('Nouvelle note enregistrée dans votre relevé.')
      }
      closeModal()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (grade: PersonalGradeRecord) => {
    if (!window.confirm(`Supprimer la note « ${grade.evaluationTitle} » (${grade.score}/${grade.maxScore}) ?`)) {
      return
    }

    try {
      await personalApi.grades.delete(grade.id)
      setGrades((prev) => prev.filter((g) => g.id !== grade.id))
      setNotice('Note supprimée.')
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  // GPA calculation
  const { average: weightedAverage, totalCoefficients, bestScore, worstScore } = useMemo(
    () => calcWeightedAverage(grades),
    [grades]
  )
  const appreciation = useMemo(() => calcGpaAppreciation(weightedAverage), [weightedAverage])

  // Filtered grades
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      if (selectedCourseFilter && g.courseId !== selectedCourseFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const c = courseById.get(g.courseId)
        const matchTitle = g.evaluationTitle.toLowerCase().includes(q)
        const matchCourse = c ? (c.code + ' ' + c.title).toLowerCase().includes(q) : false
        if (!matchTitle && !matchCourse) return false
      }
      return true
    })
  }, [grades, selectedCourseFilter, search, courseById])

  // Grouped by course for course breakdown
  const gradesByCourse = useMemo(() => {
    const map = new Map<string, PersonalGradeRecord[]>()
    for (const g of filteredGrades) {
      const list = map.get(g.courseId) ?? []
      list.push(g)
      map.set(g.courseId, list)
    }
    return map
  }, [filteredGrades])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <UniIcon name="spinner" weight="bold" size={36} className="animate-spin text-[#0d9488]" />
          <span>Chargement de vos notes et calcul de moyenne…</span>
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
            <UniIcon name="grades" weight="bold" size={16} />
            <span>Relevé Académique</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Mes Notes &amp; Moyenne
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enregistrez vos contrôles continus, partiels et examens pour simuler votre moyenne générale pondérée.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-5 py-3 text-xs font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <UniIcon name="plus" weight="bold" size={16} />
          <span>Ajouter une note</span>
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

      {/* ── Big GPA Hero Analytics Card ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#0d9488] p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 text-center shadow-inner">
              <span className="text-3xl font-black">
                {weightedAverage != null ? weightedAverage.toFixed(2) : '—'}
              </span>
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider">sur 20</span>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-black text-teal-200 backdrop-blur-sm">
                <span className={`h-2 w-2 rounded-full ${
                  appreciation.tone === 'emerald' ? 'bg-emerald-400' :
                  appreciation.tone === 'teal' ? 'bg-teal-300' :
                  appreciation.tone === 'blue' ? 'bg-blue-300' :
                  appreciation.tone === 'amber' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
                <span>Mention {appreciation.label}</span>
              </div>
              <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                Moyenne Générale Pondérée
              </h2>
              <p className="mt-1 max-w-xl text-xs text-blue-100 sm:text-sm">
                Calculée selon les coefficients attribués à chaque note. Les notes sur d'autres bases sont automatiquement normalisées sur 20.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-black/15 p-4 backdrop-blur-sm border border-white/10 sm:min-w-[320px]">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase text-teal-200">Évaluations</p>
              <p className="mt-1 text-lg font-black">{grades.length}</p>
            </div>
            <div className="text-center border-x border-white/15">
              <p className="text-[10px] font-bold uppercase text-teal-200">Total Coeff.</p>
              <p className="mt-1 text-lg font-black">{totalCoefficients}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase text-teal-200">Meilleure</p>
              <p className="mt-1 text-lg font-black">
                {bestScore != null ? `${bestScore.toFixed(1)}/20` : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
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
              placeholder="Filtrer évaluations…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Toutes les matières</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {filteredGrades.length} note(s) au relevé
        </span>
      </div>

      {/* ── Grades Content Grouped by Course ── */}
      {filteredGrades.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-12 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <UniIcon name="grades" weight="bold" size={32} />
          </div>
          <h3 className="mt-4 text-base font-black text-slate-800 dark:text-slate-200">
            {search ? 'Aucune note ne correspond aux filtres' : 'Aucune note enregistrée'}
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500">
            {search
              ? 'Réinitialisez la recherche pour voir toutes vos notes.'
              : 'Enregistrez vos premières évaluations pour suivre votre progression et estimer votre moyenne semestrielle.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0d9488] px-5 py-2.5 text-xs font-black text-white hover:bg-teal-700"
          >
            <UniIcon name="plus" size={14} />
            <span>Ajouter ma première note</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {Array.from(gradesByCourse.entries()).map(([courseId, courseGradeList], groupIndex) => {
            const course = courseById.get(courseId)
            const title = course?.title ?? 'Matière'
            const code = course?.code ?? ''
            const color = subjectColor(code, course?.colorHex)

            // Course sub-average
            const courseTotalCoeff = courseGradeList.reduce((sum, g) => sum + (Number(g.coefficient) || 1), 0)
            const courseTotalPts = courseGradeList.reduce(
              (sum, g) => sum + ((Number(g.score) / Math.max(Number(g.maxScore) || 20, 1)) * 20 * (Number(g.coefficient) || 1)),
              0
            )
            const courseAvg = courseTotalCoeff > 0 ? courseTotalPts / courseTotalCoeff : null

            return (
              <div
                key={courseId}
                className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Course Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <IconTile
                      subject={title}
                      subjectCode={code}
                      color={color}
                      variant="filled"
                      size={44}
                      index={groupIndex}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                          {code}
                        </span>
                        {course?.credits != null && (
                          <span className="text-[11px] text-slate-400">
                            · {course.credits} crédits
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {title}
                      </h3>
                    </div>
                  </div>

                  {courseAvg != null && (
                    <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-1.5 shadow-2xs dark:bg-slate-800">
                      <span className="text-xs font-bold text-slate-500">Moyenne matière :</span>
                      <span className="text-sm font-black text-[#1e3a8a] dark:text-teal-300">
                        {courseAvg.toFixed(2)}/20
                      </span>
                    </div>
                  )}
                </div>

                {/* Evaluations Table */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {courseGradeList.map((g) => {
                    const score = Number(g.score)
                    const maxScore = Math.max(Number(g.maxScore) || 20, 1)
                    const norm20 = (score / maxScore) * 20
                    const pct = Math.min(100, Math.max(0, (score / maxScore) * 100))

                    return (
                      <div
                        key={g.id}
                        className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {g.evaluationTitle}
                            </h4>
                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              Coeff. {g.coefficient}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-2 flex items-center gap-3 max-w-md">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  norm20 >= 14
                                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                                    : norm20 >= 10
                                    ? 'bg-gradient-to-r from-blue-600 to-teal-500'
                                    : 'bg-gradient-to-r from-amber-500 to-rose-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {norm20.toFixed(1)}/20
                            </span>
                          </div>
                        </div>

                        {/* Right: Score display & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-5">
                          <div className="text-right">
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                              {score}
                              <span className="text-xs font-semibold text-slate-400">/{maxScore}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(g)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                              title="Modifier"
                            >
                              <UniIcon name="edit" size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(g)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Supprimer"
                            >
                              <UniIcon name="trash" size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal Dialog: Create / Edit Grade ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                  <UniIcon name="grades" weight="bold" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingGrade ? 'Modifier la note' : 'Enregistrer une note'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saisie de l'évaluation et du coefficient
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
                  Matière évaluée *
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Intitulé de l'évaluation *
                </label>
                <input
                  type="text"
                  required
                  value={form.evaluationTitle}
                  onChange={(e) => setForm({ ...form, evaluationTitle: e.target.value })}
                  placeholder="ex. Partiel de mi-semestre, CC n°2, Examen final…"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Note obtenue *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    required
                    value={form.score}
                    onChange={(e) => setForm({ ...form, score: e.target.value })}
                    placeholder="ex. 15.5"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Barème / Max *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={form.maxScore}
                    onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                    placeholder="20"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Coefficient *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={form.coefficient}
                    onChange={(e) => setForm({ ...form, coefficient: e.target.value })}
                    placeholder="1"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
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
                  <span>{editingGrade ? 'Enregistrer les modifications' : 'Ajouter la note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
