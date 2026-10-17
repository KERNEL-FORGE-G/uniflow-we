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
      <header className="rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src="/icons/nav/analytics.png"
              alt=""
              className="hidden sm:block h-20 w-20 object-contain drop-shadow-2xl shrink-0"
            />
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-cyan-200">
                <BarChart3 className="h-3.5 w-3.5 text-cyan-300" /> Synthèse Exécutive
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">Rapports & analyses</h1>
              <p className="mt-1 text-sm text-slate-200">Synthèse calculée à partir des cours, séances et comptes réellement enregistrés.</p>
            </div>
          </div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-[#0B132B] shadow-lg hover:bg-cyan-50 transition-all"><Download className="h-4 w-4 text-[#1E3A8A]" /> Imprimer la synthèse</button>
        </div>
      </header>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => <div key={metric.label} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className={`mb-3 inline-flex rounded-2xl p-2.5 ${metric.color}`}>{metric.icon}</span><p className="text-2xl font-black text-[#111827]">{metric.value}</p><p className="mt-1 text-xs font-medium text-[#64748b]">{metric.label}</p></div>)}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"><h2 className="font-bold text-[#111827]">Assiduité consolidée</h2><p className="mt-1 text-sm text-[#64748b]">Calculée à partir de {attendance.records} relevé(s) de présence réellement enregistrés.</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e5e7eb]"><div className="h-full rounded-full bg-[#0d9488]" style={{ width: `${attendance.rate}%` }} /></div><div className="mt-3 flex justify-between text-sm"><span className="font-bold text-[#0f766e]">{attendance.rate}% de présence</span><span className="text-[#64748b]">{sessions.length} séance(s)</span></div></div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"><h2 className="font-bold text-[#111827]">Communauté</h2><dl className="mt-4 divide-y divide-[#eef2f7] text-sm"><Row label="Périmètre" value="Toute la plateforme UniFlow" /><Row label="Étudiants et délégués" value={`${studentCount}`} /><Row label="Enseignants" value={`${teacherCount}`} /></dl></div>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 py-3"><dt className="text-[#64748b]">{label}</dt><dd className="text-right font-semibold text-[#111827]">{value}</dd></div>
}
