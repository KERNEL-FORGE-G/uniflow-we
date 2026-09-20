import { Link } from 'react-router-dom'
import { BookOpen, Building2, CalendarClock, DoorOpen, GraduationCap, Landmark, Layers, Users } from 'lucide-react'
import type { StructureSummary } from '@/lib/structureModel'
import { levelLabel } from '@/lib/referenceModel'

export interface StructureViewProps {
  /** « Université de Yaoundé I · Faculté des Sciences » ou « Plateforme UniFlow · toutes les universités ». */
  scopeTitle: string
  summary: StructureSummary
  students: number
  delegates: number
  teachers: number
  /** Décompte d'UE et de séances par filière et niveau, pour le tableau. */
  perLevel: Record<string, Record<string, { courses: number; schedules: number }>>
  selectedLevel?: string
  error?: string | null
}

/**
 * Vue pure de la structure académique : aucun accès réseau, aucun hook de
 * données, ce qui la rend testable en rendu statique. Le propriétaire a vu en
 * production « 1 Parcours ICT4D · Niveau L1 » alors que la base porte 12
 * filières : tout ici est calculé depuis `summary`.
 */
export function StructureView({ scopeTitle, summary, students, delegates, teachers, perLevel, selectedLevel, error }: StructureViewProps) {
  const metrics = [
    { label: summary.universities === 1 ? 'Université' : 'Universités', value: summary.universities, icon: Landmark, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
    { label: summary.faculties === 1 ? 'Faculté' : 'Facultés', value: summary.faculties, icon: Building2, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
    { label: summary.programs === 1 ? 'Filière' : 'Filières', value: summary.programs, icon: GraduationCap, color: 'text-[#0d9488]', bg: 'bg-[#f0fdfa]' },
    { label: 'Unités d’enseignement', value: summary.courses, icon: BookOpen, color: 'text-[#0d9488]', bg: 'bg-[#f0fdfa]' },
    { label: 'Séances planifiées', value: summary.schedules, icon: CalendarClock, color: 'text-[#d97706]', bg: 'bg-amber-50' },
    { label: 'Salles', value: summary.classrooms, icon: DoorOpen, color: 'text-[#d97706]', bg: 'bg-amber-50' },
    { label: 'Étudiants et délégués', value: students, icon: Users, color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
    { label: 'Enseignants', value: teachers, icon: Users, color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-5" data-testid="structure-view">
      <p data-testid="structure-scope" className="inline-flex items-center gap-2 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-xs font-bold text-[#1e3a8a]">
        <Layers className="h-3.5 w-3.5" /> {scopeTitle}
      </p>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      <p className="text-sm text-[#475569]" data-testid="structure-headline">{summary.headline}</p>

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
          <h2 className="font-bold text-[#111827]">Filières et niveaux</h2>
          <p className="mt-1 text-xs text-[#64748b]">
            {summary.programs} filière(s), {summary.courses} UE et {summary.schedules} séance(s) lues dans `academic_programs`, `academic_courses` et `academic_schedules`.
            {delegates > 0 && ` ${delegates} délégué(s) identifié(s) dans le répertoire.`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <tr>
                {['Code', 'Filière', 'Niveaux · UE / séances', 'Total UE', 'Séances', 'Ouvrir'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6b7280]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {summary.byProgram.map((program) => {
                const levels = selectedLevel ? program.levels.filter((level) => level === selectedLevel) : program.levels
                return (
                  <tr key={program.code} data-program={program.code} className="align-top hover:bg-[#f9fafb]">
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-[#1e3a8a]">{program.code}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{program.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {levels.map((level) => {
                          const counts = perLevel[program.code]?.[level] ?? { courses: 0, schedules: 0 }
                          return (
                            <Link
                              key={level}
                              to={`/admin/ue?program=${encodeURIComponent(program.code)}&level=${encodeURIComponent(level)}`}
                              title={`${levelLabel(level)} — ${counts.courses} UE, ${counts.schedules} séance(s)`}
                              className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-white px-2 py-0.5 text-xs font-semibold text-[#374151] transition hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
                            >
                              {level} <span className="font-normal text-[#6b7280]">· {counts.courses} / {counts.schedules}</span>
                            </Link>
                          )
                        })}
                        {levels.length === 0 && <span className="text-xs text-[#9ca3af]">Aucun niveau ouvert</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827]">{program.courseCount}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827]">{program.scheduleCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <Link to={`/admin/ue?program=${encodeURIComponent(program.code)}`} className="text-[#1e3a8a] hover:underline">UE</Link>
                        <Link to={`/admin/salles?program=${encodeURIComponent(program.code)}`} className="text-[#0d9488] hover:underline">Emploi du temps</Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {summary.byProgram.length === 0 && <div className="py-12 text-center text-sm text-[#6b7280]">Aucune filière dans ce périmètre.</div>}
      </section>
    </div>
  )
}

/** Titre du périmètre affiché en en-tête : jamais une filière ni un niveau pour une administration. */
export function structureScopeTitle(input: { isPlatform: boolean; university?: string | null; faculty?: string | null }): string {
  if (input.isPlatform) return 'Plateforme UniFlow · toutes les universités'
  return [input.university, input.faculty].filter((part) => part && part.trim()).join(' · ') || 'Université non renseignée'
}
