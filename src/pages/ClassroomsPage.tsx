import { useState } from 'react'
import {
  Search,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Monitor,
  Wifi,
  Building2,
  Sparkles,
  Calendar,
  Clock,
  ChevronRight,
  ShieldCheck,
  X,
  Filter,
  Send,
  SlidersHorizontal,
  Info
} from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { classroomsApi, type Classroom } from '../lib/api'
import { cn } from '../utils/cn'

const typeColor: Record<string, { gradient: string; border: string; btn: string; iconBg: string }> = {
  AMPHITHEATRE: {
    gradient: 'from-blue-600 via-indigo-600 to-blue-800',
    border: 'border-blue-900',
    btn: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-b-4 border-blue-950 shadow-md shadow-blue-600/20',
    iconBg: 'bg-blue-100 text-blue-700'
  },
  SALLE_TD: {
    gradient: 'from-teal-600 via-emerald-600 to-teal-800',
    border: 'border-teal-900',
    btn: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white border-b-4 border-teal-950 shadow-md shadow-teal-600/20',
    iconBg: 'bg-teal-100 text-teal-700'
  },
  LABORATOIRE: {
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-700',
    border: 'border-purple-900',
    btn: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white border-b-4 border-purple-950 shadow-md shadow-purple-600/20',
    iconBg: 'bg-purple-100 text-purple-700'
  },
}

const typeLabel: Record<string, string> = {
  AMPHITHEATRE: 'Amphithéâtre',
  SALLE_TD:     'Salle de TD',
  LABORATOIRE:  'Laboratoire informatique',
}

type FilterType = 'all' | 'AMPHITHEATRE' | 'SALLE_TD' | 'LABORATOIRE' | 'AVAILABLE'

export default function ClassroomsPage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selected, setSelected] = useState<Classroom | null>(null)
  const [reservationPurpose, setReservationPurpose] = useState('')
  const [reservationDate, setReservationDate] = useState('2026-05-15')
  const [reservationTime, setReservationTime] = useState('14:00 - 16:00')
  const [isReserving, setIsReserving] = useState(false)
  const [reservedSuccess, setReservedSuccess] = useState(false)

  const { data: classrooms, loading, error, refetch } = useApi(() => classroomsApi.list())

  const allRooms = classrooms ?? []

  const filtered = allRooms.filter((c: Classroom) => {
    const matchSearch = !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.building.toLowerCase().includes(search.toLowerCase())
      || (c.equipment ?? []).some(e => e.toLowerCase().includes(search.toLowerCase()))

    let matchType = true
    if (filterType === 'AVAILABLE') {
      matchType = c.isAvailable
    } else if (filterType !== 'all') {
      matchType = c.type === filterType
    }

    return matchSearch && matchType
  })

  const stats = {
    total: allRooms.length,
    available: allRooms.filter((c: Classroom) => c.isAvailable).length,
    occupied: allRooms.filter((c: Classroom) => !c.isAvailable).length,
    totalCapacity: allRooms.reduce((acc, c) => acc + (c.capacity || 0), 0)
  }

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservationPurpose) return
    setIsReserving(true)
    setTimeout(() => {
      setIsReserving(false)
      setReservedSuccess(true)
      setTimeout(() => {
        setReservedSuccess(false)
        setSelected(null)
        setReservationPurpose('')
      }, 2000)
    }, 800)
  }

  if (loading) return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="h-40 rounded-3xl bg-gradient-to-r from-blue-100 to-indigo-100 animate-pulse border-2 border-blue-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse border-2 border-slate-200" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="h-16 w-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border-2 border-red-300 shadow-md">
        <AlertCircle className="h-8 w-8" />
      </div>
      <p className="text-sm font-semibold text-[#6b7280] text-center max-w-md">{error}</p>
      <button
        onClick={refetch}
        className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-extrabold border-b-4 border-blue-900 shadow-lg shadow-blue-600/20 active:translate-y-0.5 transition-all"
      >
        <RefreshCw className="h-4 w-4" /> Réessayer le chargement
      </button>
    </div>
  )

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 3D Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#0d9488] p-6 sm:p-8 text-white shadow-xl border-b-8 border-[#0f2560]">
        <div className="absolute -right-12 -bottom-12 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 h-40 w-40 rounded-full bg-teal-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md border border-white/30 text-white shadow-inner mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Campus Connecté & Occupation Temps Réel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              Gestion des Salles & Amphithéâtres
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 max-w-xl leading-relaxed">
              Consultez les disponibilités, le matériel informatique et réservez des espaces de travail pour vos cours ou TP.
            </p>
          </div>

          {/* 3D Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-md border border-white/25 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-transform hover:-translate-y-1">
              <div className="text-2xl font-black text-white">{stats.total}</div>
              <div className="text-[10px] font-bold text-blue-100 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                <Building2 className="h-3 w-3 text-blue-300" /> Salles
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-500/30 p-3.5 backdrop-blur-md border border-emerald-300/40 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-transform hover:-translate-y-1">
              <div className="text-2xl font-black text-emerald-200">{stats.available}</div>
              <div className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle className="h-3 w-3 text-emerald-300" /> Libres
              </div>
            </div>

            <div className="rounded-2xl bg-red-500/30 p-3.5 backdrop-blur-md border border-red-300/40 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-transform hover:-translate-y-1">
              <div className="text-2xl font-black text-red-200">{stats.occupied}</div>
              <div className="text-[10px] font-bold text-red-100 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                <XCircle className="h-3 w-3 text-red-300" /> Occupées
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Tactile Filter Buttons Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border-2 border-[#e5e7eb] shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto p-1">
          {/* TAB: Tous */}
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none shrink-0',
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-[0_4px_0_0_#1e3a8a] border border-blue-400 -translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111827] shadow-[0_2px_0_0_#cbd5e1]'
            )}
          >
            <Building2 className="h-4 w-4" />
            <span>Toutes ({stats.total})</span>
          </button>

          {/* TAB: Disponibles */}
          <button
            onClick={() => setFilterType('AVAILABLE')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none shrink-0',
              filterType === 'AVAILABLE'
                ? 'bg-emerald-600 text-white shadow-[0_4px_0_0_#065f46] border border-emerald-400 -translate-y-0.5'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-[0_2px_0_0_#a7f3d0]'
            )}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Disponibles ({stats.available})</span>
          </button>

          {/* TAB: Amphithéâtres */}
          <button
            onClick={() => setFilterType('AMPHITHEATRE')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none shrink-0',
              filterType === 'AMPHITHEATRE'
                ? 'bg-indigo-600 text-white shadow-[0_4px_0_0_#312e81] border border-indigo-400 -translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111827] shadow-[0_2px_0_0_#cbd5e1]'
            )}
          >
            <span>Amphis</span>
          </button>

          {/* TAB: Salle TD */}
          <button
            onClick={() => setFilterType('SALLE_TD')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none shrink-0',
              filterType === 'SALLE_TD'
                ? 'bg-teal-600 text-white shadow-[0_4px_0_0_#115e59] border border-teal-400 -translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111827] shadow-[0_2px_0_0_#cbd5e1]'
            )}
          >
            <span>Salles TD</span>
          </button>

          {/* TAB: Laboratoire */}
          <button
            onClick={() => setFilterType('LABORATOIRE')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none shrink-0',
              filterType === 'LABORATOIRE'
                ? 'bg-purple-600 text-white shadow-[0_4px_0_0_#581c87] border border-purple-400 -translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111827] shadow-[0_2px_0_0_#cbd5e1]'
            )}
          >
            <span>Labos</span>
          </button>
        </div>

        {/* Refresh Action */}
        <button
          onClick={refetch}
          className="flex items-center gap-2 rounded-xl border-2 border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2 text-xs font-extrabold text-[#334155] hover:bg-[#e2e8f0] hover:text-[#0f172a] shadow-xs active:translate-y-0.5 transition-all ml-auto"
          title="Actualiser les données"
        >
          <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-4 w-4 text-[#9ca3af] pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher par nom de salle (ex: A204, Amphi 500), bâtiment ou équipement (ex: Vidéoprojecteur)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-2xl border-2 border-[#e5e7eb] bg-white py-3 pl-11 pr-10 text-sm font-medium text-[#111827] placeholder-[#9ca3af] outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 shadow-xs transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 rounded-lg p-1 text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Classroom Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-[#cbd5e1] bg-white p-12 text-center shadow-sm">
            <MapPin className="mx-auto h-12 w-12 text-[#cbd5e1] mb-3" />
            <h3 className="text-base font-bold text-[#1e293b]">Aucune salle ne correspond</h3>
            <p className="text-xs text-[#64748b] mt-1">
              Essayez de modifier votre mot-clé de recherche ou les filtres par type.
            </p>
            <button
              onClick={() => { setSearch(''); setFilterType('all') }}
              className="mt-4 rounded-xl bg-blue-600 text-white font-bold text-xs px-4 py-2 shadow-md hover:bg-blue-700 transition-all"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          filtered.map((room: Classroom) => {
            const style = typeColor[room.type] ?? {
              gradient: 'from-slate-600 via-slate-700 to-slate-800',
              border: 'border-slate-900',
              btn: 'bg-slate-700 hover:bg-slate-800 text-white border-b-4 border-slate-950 shadow-md',
              iconBg: 'bg-slate-100 text-slate-700'
            }
            const available = room.isAvailable

            return (
              <div
                key={room.id}
                onClick={() => setSelected(room)}
                className="group relative flex flex-col justify-between rounded-3xl border-2 border-[#e5e7eb] bg-white shadow-md hover:shadow-2xl hover:border-blue-400/80 transition-all duration-200 transform hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                <div>
                  {/* Top Header Banner */}
                  <div className={cn('bg-gradient-to-r p-5 text-white relative overflow-hidden', style.gradient)}>
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <div>
                        <span className="inline-block rounded-md bg-black/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md mb-1 border border-white/20">
                          {typeLabel[room.type] ?? room.type}
                        </span>
                        <h3 className="text-xl font-black text-white leading-tight drop-shadow-sm">{room.name}</h3>
                        <p className="text-xs font-semibold text-blue-100/90 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {room.building} {room.floor !== undefined ? `· Étage ${room.floor}` : ''}
                        </p>
                      </div>

                      {/* Tactile Status Badge */}
                      <div className={cn(
                        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black border-2 shadow-sm shrink-0',
                        available
                          ? 'bg-emerald-500 text-white border-emerald-300 shadow-emerald-900/30'
                          : 'bg-red-500 text-white border-red-300 shadow-red-900/30'
                      )}>
                        {available ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        <span>{available ? 'Libre' : 'Occupée'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    {/* Capacity row */}
                    <div className="flex items-center justify-between rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-2.5">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#475569]">
                        <Users className="h-4 w-4 text-blue-600" /> Capacité d'accueil
                      </span>
                      <span className="text-xs font-black text-[#0f172a] bg-white px-2.5 py-1 rounded-lg border border-[#cbd5e1] shadow-2xs">
                        {room.capacity} places
                      </span>
                    </div>

                    {/* Equipment Tags */}
                    <div>
                      <p className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                        Équipements inclus :
                      </p>
                      {(room.equipment ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {(room.equipment ?? []).map((eq: string, i: number) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#eff3ff] border border-[#1e3a8a]/15 px-2.5 py-1 text-[11px] font-bold text-[#1e3a8a]"
                            >
                              {eq.toLowerCase().includes('pc') || eq.toLowerCase().includes('projecteur') ? (
                                <Monitor className="h-3 w-3 text-blue-600" />
                              ) : (
                                <Wifi className="h-3 w-3 text-teal-600" />
                              )}
                              {eq}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[#94a3b8] italic">Équipement standard (Tableau)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setSelected(room)
                    }}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none active:translate-y-0.5',
                      style.btn
                    )}
                  >
                    <span>{available ? 'Réserver / Détails' : 'Consulter l\'occupation'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 3D Classroom Detail & Reservation Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-xl rounded-3xl border-4 border-slate-700 bg-white shadow-2xl overflow-hidden text-slate-900"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={cn('bg-gradient-to-r p-6 text-white relative', typeColor[selected.type]?.gradient ?? 'from-blue-600 to-indigo-800')}>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="inline-block rounded-md bg-black/20 px-2.5 py-0.5 text-xs font-extrabold uppercase border border-white/20 mb-1">
                    {typeLabel[selected.type] ?? selected.type}
                  </span>
                  <h2 className="text-2xl font-black">{selected.name}</h2>
                  <p className="text-xs text-blue-100 font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" /> {selected.building} {selected.floor !== undefined ? `· Étage ${selected.floor}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="rounded-xl bg-black/20 p-2 text-white hover:bg-black/40 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Status Banner */}
              <div className={cn(
                'flex items-center justify-between rounded-2xl p-4 border-2 font-bold text-sm',
                selected.isAvailable
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              )}>
                <div className="flex items-center gap-2">
                  {selected.isAvailable ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                  <span>{selected.isAvailable ? 'Cette salle est actuellement disponible' : 'Cette salle est occupée ou réservée'}</span>
                </div>
                <span className="text-xs uppercase font-black px-2.5 py-1 rounded-lg bg-white border shadow-2xs">
                  {selected.capacity} Places
                </span>
              </div>

              {/* Equipment Breakdown */}
              {(selected.equipment ?? []).length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                    Équipements & Fiches Techniques
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(selected.equipment ?? []).map((eq, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs font-bold text-slate-800">
                        <Monitor className="h-4 w-4 text-blue-600" />
                        <span>{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reservation Form */}
              {selected.isAvailable ? (
                <form onSubmit={handleReserveSubmit} className="space-y-3 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-600" /> Formulaire de réservation rapide
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-600 uppercase">Date souhaitée</label>
                      <input
                        type="date"
                        value={reservationDate}
                        onChange={e => setReservationDate(e.target.value)}
                        className="w-full rounded-xl border-2 border-slate-200 p-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-600 uppercase">Créneau horaire</label>
                      <select
                        value={reservationTime}
                        onChange={e => setReservationTime(e.target.value)}
                        className="w-full rounded-xl border-2 border-slate-200 p-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                      >
                        <option>08:00 - 10:00</option>
                        <option>10:00 - 12:00</option>
                        <option>14:00 - 16:00</option>
                        <option>16:00 - 18:00</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-600 uppercase">Motif de la demande</label>
                    <input
                      type="text"
                      placeholder="Ex: TP de Réseaux / Réunion de projet Délégués"
                      value={reservationPurpose}
                      onChange={e => setReservationPurpose(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  {reservedSuccess ? (
                    <div className="p-3 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-800 text-xs font-bold text-center animate-fade-in">
                      ✓ Demande de réservation transmise à l'administration avec succès !
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isReserving}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-black uppercase tracking-wider border-b-4 border-blue-950 shadow-lg shadow-blue-600/30 active:translate-y-0.5 transition-all mt-2"
                    >
                      {isReserving ? (
                        <span>Envoi de la demande...</span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Confirmer la demande de réservation</span>
                        </>
                      )}
                    </button>
                  )}
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-xs font-medium space-y-1">
                  <p className="font-bold">⚠️ Salle actuellement indisponible</p>
                  <p>Un cours ou un événement est programmée dans ce créneau. Veuillez choisir une autre salle ou contacter le secrétariat académique.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

