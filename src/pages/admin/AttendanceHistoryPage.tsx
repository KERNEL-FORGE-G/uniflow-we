import { useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, Clock3, Filter, Loader2, UserCheck, Users, XCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { attendanceApi, type AttendanceRecord, type AttendanceSession } from '../../lib/api'

const statusStyle: Record<AttendanceRecord['status'], { label: string; className: string }> = {
  PRESENT: { label: 'Présent', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  ABSENT: { label: 'Absent', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
  RETARD: { label: 'Retard', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  JUSTIFIE: { label: 'Justifié', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
}

function when(value?: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }) {
  if (!value) return 'Horodatage indisponible'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Horodatage indisponible' : date.toLocaleString('fr-FR', options)
}

export default function AttendanceHistoryPage() {
  const { data: sessions, loading, error, refetch } = useApi(() => attendanceApi.listSessions())
  const [courseId, setCourseId] = useState('all')
  const [status, setStatus] = useState<'all' | AttendanceRecord['status']>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const courses = useMemo(() => Array.from(new Map((sessions ?? []).map((session) => [session.courseId, session.course])).entries()), [sessions])
  const filtered = useMemo(() => (sessions ?? []).filter((session) => {
    if (courseId !== 'all' && session.courseId !== courseId) return false
    if (status !== 'all' && !session.records.some((record) => record.status === status)) return false
    return true
  }), [sessions, courseId, status])
  const recordsCount = filtered.reduce((total, session) => total + session.records.length, 0)

  if (loading) return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#1e3a8a]" /></div>
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800"><p>{error}</p><button onClick={refetch} className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white">Réessayer</button></div>

  return (
    <div className="space-y-5 animate-fade-in">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0f285f] via-[#1e3a8a] to-[#0d9488] px-6 py-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100"><CalendarClock className="h-4 w-4" /> Appwrite · journal vérifiable</p>
              <h1 className="mt-2 text-2xl font-black">Historique détaillé des séances</h1>
              <p className="mt-2 max-w-2xl text-sm text-blue-100">Chaque ligne est calculée depuis les séances et relevés persistés dans Appwrite. Les horodatages affichés proviennent des métadonnées de création des documents.</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-xl bg-white/15 px-3 py-2 text-center text-xs font-bold backdrop-blur"><span className="block text-xl text-white">{filtered.length}</span>Séances</span>
              <span className="rounded-xl bg-white/15 px-3 py-2 text-center text-xs font-bold backdrop-blur"><span className="block text-xl text-white">{recordsCount}</span>Relevés</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 bg-slate-50/70 p-4">
          <label className="grid gap-1 text-xs font-bold text-slate-600">Cours
            <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="min-w-52 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#1e3a8a]">
              <option value="all">Tous les cours</option>
              {courses.map(([id, course]) => <option key={id} value={id}>{course?.code ?? id} — {course?.name ?? 'Cours non résolu'}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-bold text-slate-600">Statut contenu
            <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#1e3a8a]">
              <option value="all">Tous</option>
              {Object.entries(statusStyle).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
            </select>
          </label>
          <button onClick={() => { setCourseId('all'); setStatus('all') }} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"><Filter className="h-3.5 w-3.5" /> Réinitialiser</button>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Aucune séance ne correspond aux filtres Appwrite sélectionnés.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session: AttendanceSession) => {
            const isExpanded = expanded === session.id
            const present = session.records.filter((record) => record.status === 'PRESENT').length
            return <article key={session.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200">
              <button onClick={() => setExpanded(isExpanded ? null : session.id)} className="flex w-full flex-wrap items-center gap-4 p-5 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1e3a8a]"><UserCheck className="h-5 w-5" /></span>
                <span className="min-w-[12rem] flex-1">
                  <span className="block text-xs font-black uppercase tracking-wider text-[#0d9488]">{session.course?.code ?? 'Cours'}</span>
                  <span className="mt-1 block font-bold text-slate-900">{session.course?.name ?? 'Cours académique'}</span>
                </span>
                <span className="text-xs text-slate-500"><span className="block font-bold text-slate-800">Séance · {when(session.date, { dateStyle: 'full' })}</span><span className="mt-1 flex items-center gap-1"><Clock3 className="h-3 w-3" /> Créée {when(session.createdAt)}</span></span>
                <span className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><span className="font-bold text-emerald-700">{present} présents</span><span>{session.records.length} relevés</span><span className="col-span-2 text-slate-400">{isExpanded ? 'Masquer le détail' : 'Voir le détail'}</span></span>
              </button>
              {isExpanded && <div className="border-t border-slate-100 bg-slate-50/60 p-4"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="text-left text-xs uppercase tracking-wide text-slate-400"><tr><th className="pb-2 font-bold">Apprenant</th><th className="pb-2 font-bold">Matricule</th><th className="pb-2 font-bold">Statut</th><th className="pb-2 font-bold">Relevé enregistré</th></tr></thead><tbody className="divide-y divide-slate-100">{session.records.map((record) => <tr key={record.id}><td className="py-3 font-semibold text-slate-800">{record.student ? `${record.student.firstName} ${record.student.lastName}` : 'Apprenant non résolu'}</td><td className="py-3 font-mono text-xs text-slate-500">{record.student?.matricule ?? record.studentId}</td><td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyle[record.status].className}`}>{statusStyle[record.status].label}</span></td><td className="py-3 text-xs text-slate-500">{when(record.createdAt)}</td></tr>)}</tbody></table></div>{session.records.length === 0 && <p className="py-4 text-center text-sm text-slate-500">Cette séance Appwrite ne contient encore aucun relevé.</p>}</div>}
            </article>
          })}
        </div>
      )}
    </div>
  )
}
