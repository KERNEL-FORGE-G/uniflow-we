import { useState } from 'react'
import { Search, MapPin, Users, CheckCircle, XCircle, AlertCircle, RefreshCw, Monitor, Wifi } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { useApi } from '../hooks/useApi'
import { classroomsApi, type Classroom } from '../lib/api'

const typeColor: Record<string, string> = {
  AMPHITHEATRE: 'from-blue-600 to-indigo-700',
  SALLE_TD:     'from-teal-600 to-emerald-700',
  LABORATOIRE:  'from-purple-600 to-pink-700',
}
const typeLabel: Record<string, string> = {
  AMPHITHEATRE: 'Amphithéâtre',
  SALLE_TD:     'Salle TD',
  LABORATOIRE:  'Laboratoire',
}

export default function ClassroomsPage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selected, setSelected] = useState<Classroom | null>(null)

  const { data: classrooms, loading, error, refetch } = useApi(() => classroomsApi.list())

  const filtered = (classrooms ?? []).filter((c: Classroom) => {
    const matchSearch = !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.building.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || c.type === filterType
    return matchSearch && matchType
  })

  const stats = {
    total:     (classrooms ?? []).length,
    available: (classrooms ?? []).filter((c: Classroom) => c.isAvailable).length,
    occupied:  (classrooms ?? []).filter((c: Classroom) => !c.isAvailable).length,
  }

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <div className="h-24 rounded-xl bg-[#f3f4f6] animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 rounded-xl bg-[#f3f4f6] animate-pulse" />)}
      </div>
    </div>
  )
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="text-sm text-[#6b7280]">{error}</p>
      <button onClick={refetch} className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white">
        <RefreshCw className="h-4 w-4" /> Réessayer
      </button>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">Salles</h1>
            <p className="text-sm text-[#6b7280] mt-0.5">Disponibilité en temps réel</p>
          </div>
          <button onClick={refetch} className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#374151] hover:bg-[#f9fafb]">
            <RefreshCw className="h-4 w-4" /> Actualiser
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input type="text" placeholder="Rechercher une salle..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-[#1e3a8a]" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm outline-none focus:border-[#1e3a8a]">
            <option value="all">Tous les types</option>
            <option value="AMPHITHEATRE">Amphithéâtre</option>
            <option value="SALLE_TD">Salle TD</option>
            <option value="LABORATOIRE">Laboratoire</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex items-center gap-3">
          <MapPin className="h-8 w-8 text-[#1e3a8a]" />
          <div><p className="text-2xl font-extrabold text-[#111827]">{stats.total}</p><p className="text-xs text-[#6b7280]">Salles</p></div>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
          <div><p className="text-2xl font-extrabold text-emerald-600">{stats.available}</p><p className="text-xs text-[#6b7280]">Disponibles</p></div>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex items-center gap-3">
          <XCircle className="h-8 w-8 text-red-600" />
          <div><p className="text-2xl font-extrabold text-red-600">{stats.occupied}</p><p className="text-xs text-[#6b7280]">Occupées</p></div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-[#9ca3af]">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucune salle trouvée</p>
          </div>
        )}
        {filtered.map((room: Classroom) => {
          const gradient = typeColor[room.type] ?? 'from-slate-600 to-slate-700'
          const available = room.isAvailable
          return (
            <div key={room.id} onClick={() => setSelected(room)}
              className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
              <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-bold">{room.name}</h3>
                    <p className="text-xs opacity-80">{room.building}</p>
                  </div>
                  {available
                    ? <CheckCircle className="h-5 w-5 text-emerald-300" />
                    : <XCircle     className="h-5 w-5 text-red-300" />}
                </div>
                <Badge variant={available ? 'success' : 'danger'}>
                  {available ? 'Disponible' : 'Occupée'}
                </Badge>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b7280]">Type</span>
                  <span className="font-semibold text-[#111827]">{typeLabel[room.type] ?? room.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-[#6b7280]"><Users className="h-3.5 w-3.5" />Capacité</span>
                  <span className="font-semibold text-[#111827]">{room.capacity} places</span>
                </div>
                {(room.equipment ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(room.equipment ?? []).slice(0, 3).map((eq: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-md bg-[#f9fafb] border border-[#e5e7eb] px-2 py-0.5 text-[10px] text-[#374151]">
                        {eq.includes('PC') || eq.includes('Projecteur') ? <Monitor className="h-2.5 w-2.5" /> : <Wifi className="h-2.5 w-2.5" />}
                        {eq}
                      </span>
                    ))}
                  </div>
                )}
                {available && (
                  <button onClick={e => { e.stopPropagation(); setSelected(room) }}
                    className="mt-1 w-full rounded-lg bg-[#1e3a8a] py-2 text-xs font-semibold text-white hover:bg-[#2d4fa8]">
                    Voir détails
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${typeColor[selected.type] ?? 'from-slate-600 to-slate-700'} p-6 text-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black">{selected.name}</h2>
                  <p className="text-sm opacity-80">{selected.building}</p>
                </div>
                <Badge variant={selected.isAvailable ? 'success' : 'danger'}>
                  {selected.isAvailable ? 'Disponible' : 'Occupée'}
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-[#e5e7eb] p-3">
                  <p className="text-xs text-[#6b7280]">Type</p>
                  <p className="font-bold text-[#111827]">{typeLabel[selected.type] ?? selected.type}</p>
                </div>
                <div className="rounded-lg border border-[#e5e7eb] p-3">
                  <p className="text-xs text-[#6b7280]">Capacité</p>
                  <p className="font-bold text-[#111827] flex items-center gap-1"><Users className="h-4 w-4" />{selected.capacity} places</p>
                </div>
              </div>
              {(selected.equipment ?? []).length > 0 && (
                <div>
                  <p className="text-sm font-bold text-[#111827] mb-2">Équipements</p>
                  <div className="flex flex-wrap gap-2">
                    {(selected.equipment ?? []).map((eq: string, i: number) => (
                      <span key={i} className="rounded-lg bg-[#eff3ff] border border-[#1e3a8a]/20 px-3 py-1.5 text-sm text-[#1e3a8a] flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5" />{eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelected(null)}
                  className="flex-1 rounded-xl border border-[#e5e7eb] py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
