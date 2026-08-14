import { useEffect, useState } from 'react'
import { BookMarked, Search, Download, Plus, Eye, Edit, Trash2, Users, Clock, FileText } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ueApi, type UE as BackendUE } from '../../lib/api'

interface UE {
  id: string
  code: string
  name: string
  department: string
  level: string
  semester: string
  credits: number
  hours: number
  teacher: string
  studentsEnrolled: number
  capacity: number
  type: 'Cours Magistral' | 'Travaux Dirigés' | 'Travaux Pratiques' | 'Projet' | ''
  status: 'active' | 'archived' | 'planned' | ''
}

const normalizeUE = (item: BackendUE): UE => ({
  id: item.id,
  code: item.code || '',
  name: item.name || '',
  department: '',
  level: '',
  semester: '',
  credits: item.credits || 0,
  hours: 0,
  teacher: '',
  studentsEnrolled: 0,
  capacity: 0,
  type: '',
  status: '',
})

export default function UEPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDept, setFilterDept] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [ues, setUes] = useState<UE[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ueApi.list()
      .then(data => { if (mounted) setUes(data.map(normalizeUE)) })
      .catch(error => { if (mounted) setLoadError(error instanceof Error ? error.message : 'Impossible de charger les UE.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const filtered = ues.filter(ue => {
    const matchSearch = ue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ue.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ue.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    const matchDept = filterDept === 'all' || ue.department === filterDept
    const matchLevel = filterLevel === 'all' || ue.level === filterLevel
    const matchStatus = filterStatus === 'all' || ue.status === filterStatus
    return matchSearch && matchDept && matchLevel && matchStatus
  })

  const stats = [
    { label: 'Total UE', value: ues.length, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
    { label: 'Actives', value: ues.filter(u => u.status === 'active').length, color: 'text-[#059669]', bg: 'bg-emerald-50' },
    { label: 'Planifiées', value: ues.filter(u => u.status === 'planned').length, color: 'text-[#d97706]', bg: 'bg-amber-50' },
    { label: 'Crédits totaux', value: ues.reduce((sum, u) => sum + u.credits, 0), color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
  ]

  const statusConfig = {
    active: { label: 'Active', variant: 'success' as const },
    planned: { label: 'Planifiée', variant: 'warning' as const },
    archived: { label: 'Archivée', variant: 'neutral' as const },
  }

  const typeColors = {
    'Cours Magistral': 'bg-[#eff3ff] text-[#1e3a8a]',
    'Travaux Dirigés': 'bg-[#f0fdfa] text-[#0d9488]',
    'Travaux Pratiques': 'bg-purple-50 text-[#7c3aed]',
    'Projet': 'bg-amber-50 text-[#d97706]',
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Gestion des UE</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Administration · Unités d'Enseignement 2026</p>
        </div>
        <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle UE
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <div className={`inline-flex items-center justify-center rounded-lg p-2 ${s.bg} mb-3`}>
              <BookMarked className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#111827]">{s.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Rechercher par nom, code, enseignant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="all">Tous départements</option>
              <option value="Informatique">Informatique</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Économie">Économie</option>
            </select>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="all">Tous niveaux</option>
              <option value="L1">L1</option>
              <option value="L2">L2</option>
              <option value="L3">L3</option>
              <option value="M1">M1</option>
              <option value="M2">M2</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="all">Tous statuts</option>
              <option value="active">Active</option>
              <option value="planned">Planifiée</option>
              <option value="archived">Archivée</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">UE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Département</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Niveau</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Enseignant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Crédits</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Heures</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Inscrits</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.map(ue => {
                const fillRate = ue.capacity > 0 ? (ue.studentsEnrolled / ue.capacity) * 100 : 0
                return (
                  <tr key={ue.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-[#1e3a8a]">{ue.code}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{ue.name}</p>
                        <p className="text-xs text-[#6b7280]">{ue.semester}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{ue.department}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-[#eff3ff] px-2.5 py-0.5 text-xs font-semibold text-[#1e3a8a]">
                        {ue.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeColors[ue.type as keyof typeof typeColors] || 'bg-[#f3f4f6] text-[#6b7280]'}`}>

                        {ue.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{ue.teacher}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-[#7c3aed]" />
                        <span className="text-sm font-semibold text-[#111827]">{ue.credits}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-[#d97706]" />
                        <span className="text-sm text-[#374151]">{ue.hours}h</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#6b7280]" />
                        <span className="text-sm font-medium text-[#111827]">{ue.studentsEnrolled}/{ue.capacity}</span>
                        <span className={`text-xs font-semibold ${fillRate >= 90 ? 'text-red-600' : fillRate >= 70 ? 'text-[#d97706]' : 'text-[#059669]'}`}>
                          {fillRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig[ue.status as keyof typeof statusConfig]?.variant || 'neutral'}>
                        {statusConfig[ue.status as keyof typeof statusConfig]?.label || '—'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-lg p-1.5 hover:bg-[#eff3ff] text-[#6b7280] hover:text-[#1e3a8a] transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-1.5 hover:bg-[#eff3ff] text-[#6b7280] hover:text-[#1e3a8a] transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-1.5 hover:bg-red-50 text-[#6b7280] hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {loading && <div className="py-12 text-center"><p className="text-sm text-[#6b7280]">Chargement des UE…</p></div>}
        {!loading && filtered.length === 0 && <div className="py-12 text-center"><p className="text-sm text-[#9ca3af]">{loadError || 'Aucune UE fournie par le backend.'}</p></div>}
      </div>
    </div>
  )
}
