import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, GraduationCap, Loader2, RefreshCw, TrendingUp, Trophy, Sparkles, BookOpen, AlertCircle } from 'lucide-react'
import { gradesApi, type Grade } from '../lib/api'

type GradeWithScale = Grade

function scoreValue(grade: GradeWithScale) {
  return Number(grade.grade)
}

function maxValue(grade: GradeWithScale) {
  return Math.max(Number(grade.maxScore || 20), 1)
}

function gradeLabel(grade: GradeWithScale) {
  return grade.title || 'Évaluation sans titre'
}

function subjectLabel(grade: GradeWithScale) {
  return grade.code?.trim() || grade.ue?.trim() || 'Matière non renseignée'
}

function scoreTone(percent: number) {
  if (percent >= 75) return { bar: 'from-emerald-400 to-teal-500', text: 'text-emerald-700', badge: 'Très bon niveau' }
  if (percent >= 50) return { bar: 'from-sky-400 to-blue-600', text: 'text-blue-700', badge: 'Niveau satisfaisant' }
  return { bar: 'from-amber-400 to-orange-500', text: 'text-orange-700', badge: 'À renforcer' }
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [semester] = useState('Tous les semestres')

  const loadGrades = async () => {
    setLoading(true)
    setError(null)
    try {
      setGrades(await gradesApi.mine())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les notes depuis Appwrite.')
      setGrades([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadGrades() }, [])

  const average = useMemo(() => {
    if (!grades.length) return null
    const weighted = grades.reduce((accumulator, rawGrade) => {
      const grade = rawGrade as GradeWithScale
      const coefficient = Math.max(Number(grade.coef || 1), 1)
      return {
        score: accumulator.score + ((scoreValue(grade) / maxValue(grade)) * 20 * coefficient),
        coefficient: accumulator.coefficient + coefficient,
      }
    }, { score: 0, coefficient: 0 })
    return weighted.coefficient > 0 ? (weighted.score / weighted.coefficient).toFixed(2) : null
  }, [grades])

  const averagePercent = average ? Math.min(100, (Number(average) / 20) * 100) : 0

  const bestGrade = useMemo(() => grades.reduce<GradeWithScale | null>((best, current) => {
    if (!best || scoreValue(current as GradeWithScale) / maxValue(current as GradeWithScale) > scoreValue(best) / maxValue(best)) return current as GradeWithScale
    return best
  }, null), [grades])

  const exportGrades = () => {
    const content = [
      'RELEVÉ DE NOTES UNIFLOW',
      `Moyenne calculée : ${average ? `${average}/20` : 'Aucune donnée'}`,
      '',
      ...grades.map((rawGrade) => {
        const grade = rawGrade as GradeWithScale
        return `${gradeLabel(grade)} — ${scoreValue(grade)}/${maxValue(grade)} — coefficient ${grade.coef} — ${subjectLabel(grade)}`
      }),
    ].join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'uniflow-releve-notes.txt'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative space-y-6 pb-10">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-40 h-56 w-56 rounded-full bg-teal-300/10 blur-3xl" />

      <motion.header initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#162e75] via-[#1e3a8a] to-[#0d9488] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/15" />
        <div className="absolute -bottom-24 right-16 h-48 w-48 rounded-full border border-white/10" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" /> Relevé personnel
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Mes notes</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Vos évaluations réelles, chargées depuis votre compte Appwrite.</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Moyenne actuelle</p>
            <p className="mt-1 text-4xl font-black tracking-tight">{average ? `${average}/20` : '—'}</p>
          </div>
        </div>
      </motion.header>

      <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <BookOpen className="h-4 w-4 text-teal-600" /> Évaluations enregistrées
        </div>
        <div className="flex items-center gap-2">
          <select value={semester} disabled className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800">
            <option>Tous les semestres</option>
          </select>
          <button type="button" onClick={() => void loadGrades()} disabled={loading} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Actualiser">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" onClick={exportGrades} disabled={!grades.length} className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900">
            <Download className="h-4 w-4" /> Exporter
          </button>
        </div>
      </div>

      {error && <div className="relative flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric icon={<TrendingUp className="h-5 w-5" />} label="Moyenne calculée" value={average ? `${average}/20` : '—'} accent="teal" />
            <Metric icon={<GraduationCap className="h-5 w-5" />} label="Évaluations" value={grades.length} accent="blue" />
            <Metric icon={<Trophy className="h-5 w-5" />} label="Meilleure note" value={bestGrade ? `${scoreValue(bestGrade)}/${maxValue(bestGrade)}` : '—'} accent="amber" />
          </div>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Évaluations enregistrées</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Chaque résultat est lu depuis Appwrite, sans donnée de démonstration.</p>
              </div>
              {average && <div className="w-full max-w-xs"><div className="mb-2 flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400"><span>Progression moyenne</span><span>{Math.round(averagePercent)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: `${averagePercent}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-600" /></div></div>}
            </div>

            <AnimatePresence mode="popLayout">
              {grades.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
                  <GraduationCap className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-200">Aucune note enregistrée</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Aucune évaluation Appwrite n’a encore été enregistrée pour votre parcours. Votre enseignant pourra les saisir depuis son espace pédagogique.</p>
                </motion.div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {grades.map((grade, index) => {
                    const percent = Math.min(100, Math.max(0, (scoreValue(grade) / maxValue(grade)) * 100))
                    const tone = scoreTone(percent)
                    return <motion.article key={grade.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-white hover:shadow-lg hover:shadow-teal-900/5 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0"><p className="truncate font-bold text-slate-900 dark:text-white">{gradeLabel(grade)}</p><p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">Matière : {subjectLabel(grade)} · Coefficient {grade.coef}</p></div>
                        <div className="shrink-0 text-right"><p className={`text-2xl font-black ${tone.text}`}>{scoreValue(grade)}<span className="text-sm font-bold text-slate-400">/{maxValue(grade)}</span></p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tone.badge}</p></div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.7, delay: index * 0.05 }} className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`} /></div>
                    </motion.article>
                  })}
                </div>
              )}
            </AnimatePresence>
          </motion.section>
        </>
      )}
    </div>
  )
}

function Metric({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent: 'teal' | 'blue' | 'amber' }) {
  const accents = { teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300', blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' }
  return <motion.div whileHover={{ y: -3 }} className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accents[accent]}`}>{icon}</div><div><p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p><p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p></div></motion.div>
}
