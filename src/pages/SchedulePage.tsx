import { useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Clock, MapPin, User } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { schedulesApi, type Schedule } from '../lib/api'
import { useUserRole } from '../utils/userRole'

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
const DAY_LABELS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
const DAY_KEYS   = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI']
const CELL_H = 56

const typeColors: Record<string, string> = {
  CM: 'bg-[#1e3a8a] border-[#1e3a8a]',
  TD: 'bg-[#0d9488] border-[#0d9488]',
  TP: 'bg-orange-500 border-orange-500',
}

function timeToRow(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h - 8) * CELL_H + (m / 60) * CELL_H
}
function timeDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60 * CELL_H
}

export default function SchedulePage() {
  const { currentRole } = useUserRole()
  const [selected, setSelected] = useState<Schedule | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const { data: schedules, loading, error, refetch } = useApi(() => schedulesApi.mine())

  // Dynamic week dates calculation
  const getMonday = (d: Date) => {
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + weekOffset * 7)
  const monday = getMonday(new Date(baseDate))

  const weekDays = DAY_KEYS.map((key, index) => {
    const dateObj = new Date(monday)
    dateObj.setDate(monday.getDate() + index)
    const isToday = dateObj.toDateString() === new Date().toDateString()
    const dayNum = dateObj.getDate().toString().padStart(2, '0')
    const monthNum = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    return {
      key,
      label: DAY_LABELS[index],
      formattedDate: `${dayNum}/${monthNum}`,
      isToday,
      dateObj
    }
  })

  const saturday = weekDays[5].dateObj
  const startStr = monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const endStr = saturday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  const weekRangeLabel = weekOffset === 0 ? `Cette semaine (${startStr} – ${endStr})` : `Semaine du ${startStr} au ${endStr}`

  const grouped = (schedules ?? []).reduce<Record<string, Schedule[]>>((acc, s) => {
    const d = s.dayOfWeek?.toUpperCase() ?? ''
    if (!acc[d]) acc[d] = []
    acc[d].push(s)
    return acc
  }, {})

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <div className="h-8 w-64 rounded-lg bg-[#f3f4f6] animate-pulse" />
      <div className="h-[600px] rounded-xl bg-[#f3f4f6] animate-pulse" />
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
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Emploi du temps</h1>
          <p className="text-sm text-[#6b7280]">
            {currentRole === 'teacher' ? 'Vos cours programmés' : 'Planning hebdomadaire'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(w => w - 1)} className="rounded-lg border border-[#e5e7eb] p-2 hover:bg-[#f9fafb]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-[#111827] px-2">{weekRangeLabel}</span>
          <button onClick={() => setWeekOffset(w => w + 1)} className="rounded-lg border border-[#e5e7eb] p-2 hover:bg-[#f9fafb]">
            <ChevronRight className="h-4 w-4" />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="rounded-lg border border-[#1e3a8a] bg-[#eff3ff] px-2.5 py-1 text-xs font-bold text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all"
            >
              Aujourd'hui
            </button>
          )}
          <button onClick={refetch} className="rounded-lg border border-[#e5e7eb] p-2 hover:bg-[#f9fafb] text-[#6b7280]">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-3 px-1">
        {Object.entries(typeColors).map(([type, cls]) => (
          <span key={type} className="flex items-center gap-1.5 text-xs font-semibold text-[#374151]">
            <span className={`h-2.5 w-2.5 rounded-sm ${cls.split(' ')[0]}`} /> {type}
          </span>
        ))}
      </div>

      {/* Grille */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header jours */}
          <div className="grid border-b border-[#e5e7eb]" style={{ gridTemplateColumns: '60px repeat(6,1fr)' }}>
            <div className="border-r border-[#e5e7eb]" />
            {weekDays.map(d => (
              <div
                key={d.key}
                className={`border-r border-[#e5e7eb] px-2 py-2 text-center transition-colors ${
                  d.isToday ? 'bg-[#eff3ff] text-[#1e3a8a]' : 'text-[#374151]'
                }`}
              >
                <div className="text-xs font-bold">{d.label}</div>
                <div className={`text-[11px] font-semibold mt-0.5 ${d.isToday ? 'text-[#1e3a8a]' : 'text-[#6b7280]'}`}>
                  {d.formattedDate}
                </div>
                {d.isToday && (
                  <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full bg-[#1e3a8a] text-[9px] font-extrabold text-white uppercase">
                    Aujourd'hui
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="grid relative" style={{ gridTemplateColumns: '60px repeat(6,1fr)' }}>
            {/* Colonne heures */}
            <div className="border-r border-[#e5e7eb]">
              {HOURS.map(h => (
                <div key={h} className="border-b border-[#f3f4f6] text-right pr-2 text-[10px] text-[#9ca3af]" style={{ height: CELL_H }}>
                  <span className="relative -top-2">{h}</span>
                </div>
              ))}
            </div>

            {/* Colonnes jours */}
            {weekDays.map(d => (
              <div
                key={d.key}
                className={`relative border-r border-[#e5e7eb] ${d.isToday ? 'bg-[#eff3ff]/20' : ''}`}
              >
                {HOURS.map(h => <div key={h} className="border-b border-[#f3f4f6]" style={{ height: CELL_H }} />)}
                {(grouped[d.key] ?? []).map(s => {
                  const top = timeToRow(s.startTime ?? '08:00')
                  const height = timeDuration(s.startTime ?? '08:00', s.endTime ?? '09:30')
                  const type = s.course?.type ?? 'CM'
                  const color = typeColors[type] ?? typeColors.CM
                  return (
                    <div key={s.id}
                      onClick={() => setSelected(s)}
                      className={`absolute left-0.5 right-0.5 rounded-lg border ${color} bg-opacity-90 p-1.5 cursor-pointer hover:brightness-110 transition-all`}
                      style={{ top, height: Math.max(height - 4, 20) }}
                    >
                      <p className="text-[10px] font-bold text-white leading-tight truncate">{s.course?.name}</p>
                      <p className="text-[9px] text-white/80 truncate">{s.startTime} - {s.endTime}</p>
                      {height > 50 && (
                        <p className="text-[9px] text-white/70 truncate">{s.course?.classroom?.name}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Détail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`p-5 ${typeColors[selected.course?.type ?? 'CM'].split(' ')[0]} text-white`}>
              <p className="text-xs font-bold opacity-70 mb-1">{selected.course?.code} · {selected.course?.type}</p>
              <h2 className="text-xl font-black">{selected.course?.name}</h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#374151]">
                <Clock className="h-4 w-4 text-[#6b7280]" />
                {selected.dayOfWeek} · {selected.startTime} – {selected.endTime}
              </div>
              {selected.course?.classroom && (
                <div className="flex items-center gap-2 text-[#374151]">
                  <MapPin className="h-4 w-4 text-[#6b7280]" />
                  {selected.course.classroom.name} · {selected.course.classroom.building}
                </div>
              )}
              {selected.course?.teacher && (
                <div className="flex items-center gap-2 text-[#374151]">
                  <User className="h-4 w-4 text-[#6b7280]" />
                  {selected.course.teacher.firstName} {selected.course.teacher.lastName}
                </div>
              )}
              <button onClick={() => setSelected(null)}
                className="mt-2 w-full rounded-xl bg-[#1e3a8a] py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8]">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
