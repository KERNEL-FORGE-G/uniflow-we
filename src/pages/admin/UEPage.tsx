import { useEffect, useMemo, useState } from 'react'
import { BookMarked, CalendarClock, Download, FileText, Printer, Search, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ueApi, type UE } from '../../lib/api'

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`
}

export default function UEPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [units, setUnits] = useState<UE[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ueApi.list()
      .then((data) => { if (mounted) setUnits(data) })
      .catch((error) => { if (mounted) setLoadError(error instanceof Error ? error.message : 'Impossible de charger le référentiel Appwrite.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    const needle = searchTerm.trim().toLocaleLowerCase()
    if (!needle) return units
    return units.filter((unit) => [unit.code, unit.name, unit.teacherName, unit.type, unit.classroom]
      .some((value) => value.toLocaleLowerCase().includes(needle)))
  }, [searchTerm, units])

  const totals = useMemo(() => ({
    credits: units.reduce((sum, unit) => sum + unit.credits, 0),
    enrollments: units.reduce((sum, unit) => sum + unit.enrollmentCount, 0),
    schedules: units.reduce((sum, unit) => sum + unit.scheduleCount, 0),
    scheduledHours: units.reduce((sum, unit) => sum + unit.scheduledHours, 0),
  }), [units])

  const exportCsv = () => {
    const header = ['Code', 'Cours', 'Responsable', 'Type', 'Salle', 'Crédits', 'Heures déclarées', 'Créneaux', 'Heures planifiées', 'Inscriptions']
    const rows = filtered.map((unit) => [
      unit.code, unit.name, unit.teacherName, unit.type, unit.classroom, unit.credits, unit.hours,
      unit.scheduleCount, unit.scheduledHours.toFixed(1), unit.enrollmentCount,
    ].map(csvCell).join(','))
    const blob = new Blob([`\uFEFF${header.map(csvCell).join(',')}\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'uniflow-uy1-ict4d-l1-referentiel.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const stats = [
    { label: 'Cours référencés', value: units.length, icon: BookMarked, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
    { label: 'Crédits déclarés', value: totals.credits, icon: FileText, color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
    { label: 'Créneaux publiés', value: totals.schedules, icon: CalendarClock, color: 'text-[#d97706]', bg: 'bg-amber-50' },
    { label: 'Inscriptions relevées', value: totals.enrollments, icon: Users, color: 'text-[#059669]', bg: 'bg-emerald-50' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Référentiel pédagogique</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">Université de Yaoundé I · ICT4D · L1 · Lecture Appwrite</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={loading || filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exporter le référentiel
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={loading}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[#c7d2fe] bg-[#eff3ff] px-4 py-3 text-sm text-[#1e3a8a]">
        Les cours, créneaux et inscriptions ci-dessous proviennent des collections académiques Appwrite. Aucune collection d’unités d’enseignement ni flux de création sécurisé n’est provisionné : les actions de CRUD restent volontairement indisponibles.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <div className={`mb-3 inline-flex items-center justify-center rounded-lg p-2 ${stat.bg}`}><Icon className={`h-5 w-5 ${stat.color}`} /></div>
              <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
              <p className="mt-0.5 text-xs text-[#6b7280]">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="search"
            placeholder="Rechercher un cours, un code, un responsable ou une salle..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-[#d1d5db] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <tr>
                {['Code', 'Cours', 'Responsable', 'Format', 'Crédits', 'Volume déclaré', 'Planning Appwrite', 'Inscriptions'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6b7280]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.map((unit) => (
                <tr key={unit.id} className="hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-[#1e3a8a]">{unit.code}</td>
                  <td className="px-4 py-3"><p className="text-sm font-medium text-[#111827]">{unit.name}</p><p className="mt-0.5 text-xs text-[#6b7280]">ICT4D · L1</p></td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{unit.teacherName}</td>
                  <td className="px-4 py-3"><span className="inline-flex rounded-full bg-[#eff3ff] px-2.5 py-0.5 text-xs font-semibold text-[#1e3a8a]">{unit.type}</span></td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#111827]">{unit.credits}</td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{unit.hours > 0 ? `${unit.hours} h` : 'Non renseigné'}</td>
                  <td className="px-4 py-3"><p className="text-sm font-medium text-[#111827]">{unit.scheduleCount} créneau(x)</p><p className="mt-0.5 text-xs text-[#6b7280]">{unit.scheduledHours > 0 ? `${unit.scheduledHours.toFixed(1)} h planifiée(s) · ${unit.classroom}` : 'Aucun créneau enregistré'}</p></td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#111827]">{unit.enrollmentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="py-12 text-center text-sm text-[#6b7280]">Chargement du référentiel Appwrite…</div>}
        {!loading && filtered.length === 0 && <div className="py-12 text-center text-sm text-[#6b7280]">{loadError || 'Aucun cours ICT4D L1 ne correspond à la recherche.'}</div>}
      </div>

      {!loading && units.length > 0 && <p className="text-xs text-[#6b7280]">{totals.scheduledHours.toFixed(1)} heure(s) planifiée(s) calculée(s) depuis {totals.schedules} créneau(x) Appwrite.</p>}
    </div>
  )
}
