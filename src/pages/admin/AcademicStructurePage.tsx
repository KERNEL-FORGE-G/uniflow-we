import { Database, Building2, Users, BookOpen } from 'lucide-react'

const metrics = [
  { label: 'Facultés', value: '—', icon: Building2, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
  { label: 'Départements', value: '—', icon: Database, color: 'text-[#0d9488]', bg: 'bg-[#f0fdfa]' },
  { label: 'Étudiants', value: '—', icon: Users, color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
  { label: 'Enseignants', value: '—', icon: BookOpen, color: 'text-[#d97706]', bg: 'bg-amber-50' },
]

export default function AcademicStructurePage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Structure académique</h1>
        <p className="mt-0.5 text-sm text-[#6b7280]">Administration · données fournies par le backend</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <div className={`mb-3 inline-flex items-center justify-center rounded-lg p-2 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-[#111827]">{value}</p>
            <p className="mt-0.5 text-xs text-[#6b7280]">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-[#d1d5db] bg-white p-8 text-center shadow-sm">
        <Database className="mx-auto h-10 w-10 text-[#9ca3af]" />
        <h2 className="mt-3 text-base font-bold text-[#111827]">Structure académique indisponible</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[#6b7280]">
          Aucun endpoint backend de facultés et de départements n’est actuellement exposé par le contrat API. Les données fictives ont été retirées pour éviter d’afficher une structure inventée.
        </p>
      </div>
    </div>
  )
}
