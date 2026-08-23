import { useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Clock, MapPin, User } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { schedulesApi, type Schedule } from '../lib/api'
import { useUserRole } from '../utils/userRole'

const DAY_LABELS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
const DAY_KEYS   = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI']
const CELL_H = 64

const typeColors: Record<string, string> = {
  CM: 'bg-[#1e3a8a] border-[#1e3a8a]',
  TD: 'bg-[#0d9488] border-[#0d9488]',
  TP: 'bg-orange-500 border-orange-500',
  Projet: 'bg-violet-600 border-violet-600',
}

function timeToRow(time: string, firstHour: number): number {
  const [h, m] = time.split(':').map(Number)
  return (h - firstHour) * CELL_H + (m / 60) * CELL_H
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
  const displayDays = weekDays.filter((day) => (grouped[day.key] ?? []).length > 0)
  const timetableDays = displayDays.length ? displayDays : weekDays
  const scheduledMinutes = (schedules ?? []).flatMap((schedule) => [schedule.startTime, schedule.endTime]).map((time) => {
    const [hour, minute] = time.split(':').map(Number)
    return hour * 60 + minute
  })
  const firstHour = scheduledMinutes.length ? Math.max(7, Math.floor(Math.min(...scheduledMinutes) / 60)) : 8
  const lastHour = scheduledMinutes.length ? Math.min(20, Math.max(13, Math.ceil(Math.max(...scheduledMinutes) / 60))) : 18
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, index) => `${String(firstHour + index).padStart(2, '0')}:00`)
  const totalMinutes = (schedules ?? []).reduce((total, schedule) => total + Math.max(0, timeDuration(schedule.startTime, schedule.endTime) / CELL_H * 60), 0)

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
          <p className="text-sm text-[#6b7280]">{currentRole === 'teacher' ? 'Vos cours programmés' : 'Grille ICT4D L1 synchronisée depuis Appwrite'}</p>
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
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-semibold text-[#374151] hover:bg-[#f9fafb] hover:text-[#1e3a8a] transition-all disabled:opacity-50"
            title="Actualiser l'emploi du temps"
          >
            <RefreshCw className={`h-4 w-4 text-[#1e3a8a] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Légende et indicateurs issus des créneaux persistés */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
        {Object.entries(typeColors).map(([type, cls]) => (
          <span key={type} className="flex items-center gap-1.5 text-xs font-semibold text-[#374151]">
            <span className={`h-2.5 w-2.5 rounded-sm ${cls.split(' ')[0]}`} /> {type}
          </span>
        ))}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">{schedules?.length || 0} créneaux</span>
          <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">{timetableDays.length} jours actifs</span>
          <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">{Math.round(totalMinutes / 60)} h planifiées</span>
        </div>
      </div>

      {/* Grille */}
      <div className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-x-auto">
        <div className="min-w-[860px]">
          {/* Header jours */}
          <div className="grid border-b border-[#e5e7eb]" style={{ gridTemplateColumns: `64px repeat(${timetableDays.length}, minmax(168px, 1fr))` }}>
            <div className="border-r border-[#e5e7eb] bg-slate-50" />
            {timetableDays.map(d => (
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
          <div className="grid relative" style={{ gridTemplateColumns: `64px repeat(${timetableDays.length}, minmax(168px, 1fr))` }}>
            {/* Colonne heures */}
            <div className="border-r border-[#e5e7eb] bg-slate-50/70">
              {hours.map(h => (
                <div key={h} className="border-b border-[#f3f4f6] text-right pr-2 text-[10px] font-semibold text-[#64748b]" style={{ height: CELL_H }}>
                  <span className="relative -top-2">{h}</span>
                </div>
              ))}
            </div>

            {/* Colonnes jours */}
            {timetableDays.map(d => (
              <div
                key={d.key}
                className={`relative border-r border-[#e5e7eb] ${d.isToday ? 'bg-[#eff3ff]/20' : ''}`}
              >
                {hours.map(h => <div key={h} className="border-b border-[#f3f4f6]" style={{ height: CELL_H }} />)}
                {(grouped[d.key] ?? []).map(s => {
                  const top = timeToRow(s.startTime ?? `${String(firstHour).padStart(2, '0')}:00`, firstHour)
                  const height = timeDuration(s.startTime ?? '08:00', s.endTime ?? '09:30')
                  const type = s.course?.type ?? 'CM'
                  const color = typeColors[type] ?? typeColors.CM
                  return (
                    <div key={s.id}
                      onClick={() => setSelected(s)}
                      className={`absolute left-1 right-1 rounded-xl border ${color} bg-opacity-95 p-2 cursor-pointer shadow-sm ring-1 ring-white/20 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md transition-all`}
                      style={{ top, height: Math.max(height - 6, 28) }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="rounded bg-white/20 px-1 py-0.5 text-[8px] font-black tracking-wide text-white">{s.course?.code}</span>
                        <span className="text-[8px] font-semibold text-white/80">{s.course?.type}</span>
                      </div>
                      <p className="mt-1 text-[10px] font-bold text-white leading-tight line-clamp-2">{s.course?.name}</p>
                      <p className="mt-1 text-[9px] font-semibold text-white/90 truncate">{s.startTime} – {s.endTime}</p>
                      {height > 64 && (
                        <p className="mt-0.5 text-[9px] text-white/75 truncate">{s.course?.classroom?.name}</p>
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
