import { useEffect, useState } from 'react'
import { BookOpen, Building2, Database, GraduationCap, Loader2, Users } from 'lucide-react'
import { coursesApi, studentsApi, teachersApi, type Student, type Teacher } from '../../lib/api'

export default function AcademicStructurePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [courseCount, setCourseCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all([studentsApi.list(), teachersApi.list(), coursesApi.list()])
      .then(([studentRows, teacherRows, courseRows]) => {
        if (!active) return
        setStudents(studentRows)
        setTeachers(teacherRows)
        setCourseCount(courseRows.length)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Impossible de charger la structure Appwrite.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const delegates = students.filter((student) => student.status === 'delegate').length
  const metrics = [
    { label: 'Université', value: 1, icon: Building2, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
    { label: 'Parcours ICT4D', value: 1, icon: Database, color: 'text-[#0d9488]', bg: 'bg-[#f0fdfa]' },
    { label: 'Étudiants & délégués', value: students.length, icon: Users, color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
    { label: 'Enseignants', value: teachers.length, icon: BookOpen, color: 'text-[#d97706]', bg: 'bg-amber-50' },
  ]

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" /></div>

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Structure académique</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">Administration · périmètre lu depuis le répertoire académique Appwrite</p>
        </div>
        <span className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-xs font-bold text-[#1e3a8a]">Université de Yaoundé I · ICT4D · L1</span>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <div className={`mb-3 inline-flex items-center justify-center rounded-lg p-2 ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
            <p className="text-2xl font-bold text-[#111827]">{value}</p>
            <p className="mt-0.5 text-xs text-[#6b7280]">{label}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#e5e7eb] bg-[#f8fafc] px-5 py-4">
          <h2 className="font-bold text-[#111827]">Référentiel académique actif</h2>
          <p className="mt-1 text-xs text-[#64748b]">La structure ci-dessous est intentionnellement limitée au périmètre provisionné dans Appwrite.</p>
        </div>
        <div className="grid gap-0 divide-y divide-[#eef2f7] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <StructureRow icon={<Building2 className="h-5 w-5" />} label="Université" value="Université de Yaoundé I" />
          <StructureRow icon={<GraduationCap className="h-5 w-5" />} label="Filière" value="ICT4D" />
          <StructureRow icon={<Database className="h-5 w-5" />} label="Niveau" value="L1" />
          <StructureRow icon={<BookOpen className="h-5 w-5" />} label="Cours provisionnés" value={`${courseCount} cours académiques`} />
        </div>
        <div className="border-t border-[#eef2f7] px-5 py-4 text-sm text-[#475569]">
          <strong className="text-[#111827]">Gouvernance Appwrite :</strong> {delegates} délégué(s) identifié(s) dans le répertoire, avec rôles et effectifs synchronisés dans les vues administratives.
        </div>
      </section>
    </div>
  )
}

function StructureRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 px-5 py-4"><span className="rounded-lg bg-[#f0fdfa] p-2 text-[#0d9488]">{icon}</span><div><p className="text-xs font-bold uppercase tracking-wide text-[#64748b]">{label}</p><p className="mt-0.5 font-semibold text-[#111827]">{value}</p></div></div>
}
