import { useEffect, useMemo, useState } from 'react'
import { BarChart3, BookOpen, Download, Loader2, TrendingUp, UserCheck, Users } from 'lucide-react'
import { attendanceApi, coursesApi, studentsApi, teachersApi, type AttendanceSession } from '../../lib/api'

export default function AdminReportsPage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [teacherCount, setTeacherCount] = useState(0)
  const [courseCount, setCourseCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all([attendanceApi.listSessions(), studentsApi.list(), teachersApi.list(), coursesApi.list()])
      .then(([attendanceRows, studentRows, teacherRows, courseRows]) => {
        if (!active) return
        setSessions(attendanceRows)
        setStudentCount(studentRows.length)
        setTeacherCount(teacherRows.length)
        setCourseCount(courseRows.length)
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Impossible de charger les rapports Appwrite.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const attendance = useMemo(() => {
    const records = sessions.flatMap((session) => session.records)
    const present = records.filter((record) => record.status === 'PRESENT' || record.status === 'RETARD').length
    return { records: records.length, rate: records.length ? Math.round((present / records.length) * 100) : 0 }
  }, [sessions])

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" /></div>

  const metrics = [
    { icon: <Users className="h-5 w-5" />, label: 'Étudiants suivis', value: studentCount, color: 'text-[#1e3a8a] bg-[#eff6ff]' },
    { icon: <BookOpen className="h-5 w-5" />, label: 'Cours actifs', value: courseCount, color: 'text-[#0f766e] bg-[#f0fdfa]' },
    { icon: <UserCheck className="h-5 w-5" />, label: 'Séances analysées', value: sessions.length, color: 'text-[#7c3aed] bg-[#f5f3ff]' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Assiduité observée', value: `${attendance.rate}%`, color: 'text-[#b45309] bg-[#fffbeb]' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="rounded-2xl border border-[#dbeafe] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1e3a8a]"><BarChart3 className="h-5 w-5" /></div><div><h1 className="text-xl font-bold text-[#111827]">Rapports & analyses</h1><p className="mt-1 text-sm text-[#64748b]">Synthèse calculée depuis les collections académiques Appwrite, sans donnée simulée.</p></div></div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-[#d1d5db] px-3 py-2 text-xs font-bold text-[#374151] hover:bg-[#f8fafc]"><Download className="h-4 w-4" /> Imprimer la synthèse</button>
        </div>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => <div key={metric.label} className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm"><span className={`mb-3 inline-flex rounded-lg p-2 ${metric.color}`}>{metric.icon}</span><p className="text-2xl font-black text-[#111827]">{metric.value}</p><p className="mt-1 text-xs font-medium text-[#64748b]">{metric.label}</p></div>)}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm"><h2 className="font-bold text-[#111827]">Assiduité consolidée</h2><p className="mt-1 text-sm text-[#64748b]">Calculée à partir de {attendance.records} relevé(s) de présence réellement enregistrés.</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e5e7eb]"><div className="h-full rounded-full bg-[#0d9488]" style={{ width: `${attendance.rate}%` }} /></div><div className="mt-3 flex justify-between text-sm"><span className="font-bold text-[#0f766e]">{attendance.rate}% de présence</span><span className="text-[#64748b]">{sessions.length} séance(s)</span></div></div>
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm"><h2 className="font-bold text-[#111827]">Périmètre de référence</h2><dl className="mt-4 divide-y divide-[#eef2f7] text-sm"><Row label="Université" value="Université de Yaoundé I" /><Row label="Filière" value="ICT4D" /><Row label="Niveau" value="L1" /><Row label="Enseignants du répertoire" value={`${teacherCount}`} /></dl></div>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 py-3"><dt className="text-[#64748b]">{label}</dt><dd className="text-right font-semibold text-[#111827]">{value}</dd></div>
}
