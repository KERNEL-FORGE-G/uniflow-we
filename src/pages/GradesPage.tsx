import { useEffect, useMemo, useState } from 'react'
import { Download, GraduationCap, Loader2, RefreshCw, TrendingUp } from 'lucide-react'
import { listPersonalGrades, type PersonalGrade } from '../lib/appwrite'

export default function GradesPage() {
  const [grades, setGrades] = useState<PersonalGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [semester, setSemester] = useState('Tous les semestres')

  const loadGrades = async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = localStorage.getItem('uniflow_user')
      const user = raw ? JSON.parse(raw) as { id?: string } : null
      if (!user?.id) throw new Error('Connectez-vous pour afficher vos notes réelles.')
      setGrades(await listPersonalGrades(user.id))
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
    const total = grades.reduce((sum, grade) => sum + (Number(grade.score) / Math.max(Number((grade as PersonalGrade & { maxScore?: string }).maxScore || 20), 1)) * 20, 0)
    return (total / grades.length).toFixed(2)
  }, [grades])

  const exportGrades = () => {
    const content = [
      'RELEVÉ DE NOTES UNIFLOW',
      `Moyenne calculée : ${average ? `${average}/20` : 'Aucune donnée'}`,
      '',
      ...grades.map((grade) => `${grade.label} — ${grade.score}`),
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
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Mes notes</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">Données chargées depuis votre compte Appwrite.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={semester} onChange={(event) => setSemester(event.target.value)} className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm">
            <option>Tous les semestres</option>
            <option>Semestre 1</option>
            <option>Semestre 2</option>
          </select>
          <button type="button" onClick={() => void loadGrades()} className="rounded-lg border border-[#e5e7eb] p-2 text-[#374151]" aria-label="Actualiser"><RefreshCw className="h-4 w-4" /></button>
          <button type="button" onClick={exportGrades} disabled={!grades.length} className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" /> Exporter</button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="flex items-center justify-center rounded-xl border border-[#e5e7eb] bg-white p-12 text-sm text-[#6b7280]"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Chargement des notes Appwrite…</div> : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric icon={<TrendingUp className="h-5 w-5" />} label="Moyenne calculée" value={average ? `${average}/20` : '—'} />
            <Metric icon={<GraduationCap className="h-5 w-5" />} label="Évaluations" value={grades.length} />
            <Metric icon={<GraduationCap className="h-5 w-5" />} label="Semestre" value={semester === 'Tous les semestres' ? 'Tous' : semester} />
          </div>
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#111827]">Évaluations enregistrées</h2>
            {grades.length === 0 ? <div className="rounded-xl border border-dashed border-[#cbd5e1] p-10 text-center text-sm text-[#64748b]">Aucune note réelle n’est encore enregistrée dans votre compte Appwrite.</div> : <div className="space-y-3">{grades.map((grade) => <div key={grade.$id} className="flex items-center justify-between rounded-xl border border-[#e5e7eb] p-4"><div><p className="font-semibold text-[#111827]">{grade.label}</p><p className="text-xs text-[#6b7280]">Matière : {grade.subjectId}</p></div><strong className="text-lg text-[#1e3a8a]">{grade.score}</strong></div>)}</div>}
          </div>
        </>
      )}
    </div>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff3ff] text-[#1e3a8a]">{icon}</div><div><p className="text-xl font-extrabold text-[#1e3a8a]">{value}</p><p className="text-xs text-[#6b7280]">{label}</p></div></div>
}
