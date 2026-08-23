import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Clock, MapPin, User, CalendarDays, GraduationCap, Sparkles } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { schedulesApi, type Schedule } from '../lib/api'
import { useUserRole } from '../utils/userRole'

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAY_KEYS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI']
const CELL_H = 66

const typeColors: Record<string, string> = {
  CM: 'bg-[#1e3a8a] border-[#1e3a8a]',
  TD: 'bg-[#0d9488] border-[#0d9488]',
  TP: 'bg-orange-500 border-orange-500',
  Projet: 'bg-violet-600 border-violet-600',
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function timeToRow(time: string, firstHour: number) {
  return ((timeToMinutes(time) - firstHour * 60) / 60) * CELL_H
}

function timeDuration(start: string, end: string) {
  return ((timeToMinutes(end) - timeToMinutes(start)) / 60) * CELL_H
}

function toFrenchDate(value: Date) {
  return value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function SchedulePage() {
  const { currentRole } = useUserRole()
  const [selected, setSelected] = useState<Schedule | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [focusDay, setFocusDay] = useState<string | null>(null)
  const { data: schedules, loading, error, refetch } = useApi(() => schedulesApi.mine())

  const { weekDays, grouped, firstHour, hours, totalMinutes, focusedDay, focusEntries, focusMinutes, weekRangeLabel } = useMemo(() => {
    const now = new Date()
    const reference = new Date(now)
    reference.setDate(reference.getDate() + weekOffset * 7)
    const offset = (reference.getDay() + 6) % 7
    const monday = new Date(reference)
    monday.setDate(reference.getDate() - offset)

    const days = DAY_KEYS.map((key, index) => {
      const dateObj = new Date(monday)
      dateObj.setDate(monday.getDate() + index)
      return { key, label: DAY_LABELS[index], dateObj, formattedDate: toFrenchDate(dateObj), isToday: dateObj.toDateString() === now.toDateString() }
    })
    const byDay = (schedules ?? []).reduce<Record<string, Schedule[]>>((acc, schedule) => {
      const key = schedule.dayOfWeek?.toUpperCase() ?? ''
      if (!acc[key]) acc[key] = []
      acc[key].push(schedule)
      return acc
    }, {})
    Object.values(byDay).forEach((entries) => entries.sort((a, b) => a.startTime.localeCompare(b.startTime)))
    const scheduleMinutes = (schedules ?? []).flatMap((schedule) => [schedule.startTime, schedule.endTime]).filter(Boolean).map(timeToMinutes)
    const start = scheduleMinutes.length ? Math.max(7, Math.floor(Math.min(...scheduleMinutes) / 60)) : 8
    const end = scheduleMinutes.length ? Math.min(20, Math.max(13, Math.ceil(Math.max(...scheduleMinutes) / 60))) : 18
    const activeDay = days.find((day) => day.key === focusDay) ?? days.find((day) => day.isToday) ?? days[0]
    const dayEntries = activeDay ? byDay[activeDay.key] ?? [] : []
    const weekStart = toFrenchDate(monday)
    const saturday = new Date(monday)
    saturday.setDate(monday.getDate() + 5)
    return {
      weekDays: days,
      grouped: byDay,
      firstHour: start,
      hours: Array.from({ length: end - start + 1 }, (_, index) => `${String(start + index).padStart(2, '0')}:00`),
      totalMinutes: (schedules ?? []).reduce((total, schedule) => total + Math.max(0, timeToMinutes(schedule.endTime) - timeToMinutes(schedule.startTime)), 0),
      focusedDay: activeDay,
      focusEntries: dayEntries,
      focusMinutes: dayEntries.reduce((total, schedule) => total + Math.max(0, timeToMinutes(schedule.endTime) - timeToMinutes(schedule.startTime)), 0),
      weekRangeLabel: weekOffset === 0 ? `Cette semaine · ${weekStart} – ${toFrenchDate(saturday)}` : `Semaine du ${weekStart} au ${toFrenchDate(saturday)}`,
    }
  }, [schedules, weekOffset, focusDay])

  if (loading) return <div className="space-y-4 animate-fade-in"><div className="h-36 rounded-2xl bg-slate-100 animate-pulse" /><div className="h-[620px] rounded-2xl bg-slate-100 animate-pulse" /></div>
  if (error) return <div className="flex flex-col items-center justify-center gap-4 py-20"><AlertCircle className="h-12 w-12 text-red-400" /><p className="text-sm text-slate-600">{error}</p><button onClick={refetch} className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" /> Réessayer</button></div>

  return (
    <div className="space-y-5 animate-fade-in">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#0f285f] via-[#1e3a8a] to-[#0d9488] px-5 py-5 text-white">
          <div><p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-cyan-100"><CalendarDays className="h-4 w-4" /> UniFlow · Appwrite</p><h1 className="mt-1 text-2xl font-black">Emploi du temps</h1><p className="mt-1 text-sm text-blue-100">{currentRole === 'teacher' ? 'Vos cours programmés' : 'Grille ICT4D L1 synchronisée depuis Appwrite'}</p></div>
          <div className="flex flex-wrap items-center gap-2"><button onClick={() => setWeekOffset((value) => value - 1)} className="rounded-lg border border-white/25 bg-white/10 p-2 text-white hover:bg-white/20"><ChevronLeft className="h-4 w-4" /></button><span className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold">{weekRangeLabel}</span><button onClick={() => setWeekOffset((value) => value + 1)} className="rounded-lg border border-white/25 bg-white/10 p-2 text-white hover:bg-white/20"><ChevronRight className="h-4 w-4" /></button>{weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#1e3a8a] hover:bg-blue-50">Aujourd’hui</button>}<button onClick={refetch} className="flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"><RefreshCw className="h-4 w-4" /> Actualiser</button></div>
        </div>
        <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0"><div className="flex items-center gap-3 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1e3a8a]"><GraduationCap className="h-4 w-4" /></span><div><p className="text-lg font-black text-slate-900">{schedules?.length ?? 0}</p><p className="text-xs font-semibold text-slate-500">créneaux Appwrite</p></div></div><div className="flex items-center gap-3 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#0d9488]"><Clock className="h-4 w-4" /></span><div><p className="text-lg font-black text-slate-900">{Math.round(totalMinutes / 60)} h</p><p className="text-xs font-semibold text-slate-500">charge hebdomadaire</p></div></div><div className="flex items-center gap-3 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Sparkles className="h-4 w-4" /></span><div><p className="text-sm font-black text-slate-900">{focusedDay?.label ?? 'Aucun jour'}</p><p className="text-xs font-semibold text-slate-500">{focusEntries.length} créneau(x) · {Math.round((focusMinutes / 60) * 10) / 10} h</p></div></div></div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"><div className="flex flex-wrap gap-3">{Object.entries(typeColors).map(([type, className]) => <span key={type} className="flex items-center gap-1.5 text-xs font-bold text-slate-600"><span className={`h-2.5 w-2.5 rounded-sm ${className.split(' ')[0]}`} /> {type}</span>)}</div><p className="text-xs font-semibold text-slate-500">Sélectionnez un jour pour le mettre en avant.</p></section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto"><div className="min-w-[1080px]"><div className="grid border-b border-slate-200" style={{ gridTemplateColumns: '68px repeat(6, minmax(168px, 1fr))' }}><div className="bg-slate-50" />{weekDays.map((day) => <button type="button" key={day.key} onClick={() => setFocusDay(day.key)} className={`border-l border-slate-200 px-2 py-3 text-center transition ${day.key === focusedDay?.key ? 'bg-sky-50 text-[#0f285f]' : day.isToday ? 'bg-blue-50 text-[#1e3a8a]' : 'text-slate-600 hover:bg-slate-50'}`}><span className="block text-xs font-black uppercase tracking-wider">{day.label}</span><span className="mt-1 block text-xs font-semibold">{day.formattedDate}</span>{day.isToday && <span className="mt-1 inline-block rounded-full bg-[#1e3a8a] px-2 py-0.5 text-[9px] font-black text-white">AUJOURD’HUI</span>}</button>)}</div><div className="grid relative" style={{ gridTemplateColumns: '68px repeat(6, minmax(168px, 1fr))' }}><div className="border-r border-slate-200 bg-slate-50/80">{hours.map((hour) => <div key={hour} className="border-b border-slate-100 pr-2 text-right text-[10px] font-bold text-slate-400" style={{ height: CELL_H }}><span className="relative -top-2">{hour}</span></div>)}</div>{weekDays.map((day) => <div key={day.key} className={`relative border-r border-slate-200 ${day.key === focusedDay?.key ? 'bg-sky-50/40' : day.isToday ? 'bg-blue-50/30' : 'bg-white'}`}>{hours.map((hour) => <div key={hour} className="border-b border-slate-100" style={{ height: CELL_H }} />)}{(grouped[day.key] ?? []).map((schedule) => { const palette = typeColors[schedule.course?.type ?? 'CM'] ?? typeColors.CM; const height = timeDuration(schedule.startTime, schedule.endTime); return <button type="button" key={schedule.id} onClick={() => setSelected(schedule)} className={`absolute left-1 right-1 overflow-hidden rounded-xl border ${palette} p-2 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md ${day.key === focusedDay?.key ? 'ring-2 ring-sky-300 ring-offset-1' : ''}`} style={{ top: timeToRow(schedule.startTime, firstHour), height: Math.max(height - 6, 30) }}><span className="flex items-center justify-between gap-1"><span className="rounded bg-white/20 px-1 py-0.5 text-[8px] font-black tracking-wide">{schedule.course?.code}</span><span className="text-[8px] font-bold text-white/85">{schedule.course?.type ?? 'CM'}</span></span><span className="mt-1 block line-clamp-2 text-[10px] font-black leading-tight">{schedule.course?.name}</span><span className="mt-1 block text-[9px] font-semibold text-white/90">{schedule.startTime} – {schedule.endTime}</span>{height > 64 && <span className="mt-0.5 block truncate text-[9px] text-white/75">{schedule.course?.classroom?.name}</span>}</button> })}</div>)}</div></div></section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-wider text-[#0d9488]">Focus de journée</p><h2 className="mt-1 text-lg font-black text-slate-900">{focusedDay?.label ?? 'Aucun jour disponible'}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{focusEntries.length} créneau(x) réel(s)</span></div>{focusEntries.length ? <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{focusEntries.map((schedule) => { const palette = typeColors[schedule.course?.type ?? 'CM'] ?? typeColors.CM; return <button type="button" key={schedule.id} onClick={() => setSelected(schedule)} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#0d9488] hover:bg-teal-50/40"><span className={`h-10 w-1.5 rounded-full ${palette.split(' ')[0]}`} /><span className="min-w-0 flex-1"><span className="block text-xs font-black text-slate-900">{schedule.startTime} – {schedule.endTime}</span><span className="mt-1 block truncate text-sm font-bold text-slate-700">{schedule.course?.code} · {schedule.course?.name}</span><span className="mt-1 block truncate text-xs text-slate-500">{schedule.course?.classroom?.name ?? 'Salle non renseignée'}</span></span></button> })}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aucun créneau Appwrite n’est prévu pour ce jour.</p>}</section>

      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}><div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className={`p-5 text-white ${(typeColors[selected.course?.type ?? 'CM'] ?? typeColors.CM).split(' ')[0]}`}><p className="text-xs font-bold opacity-75">{selected.course?.code} · {selected.course?.type ?? 'CM'}</p><h2 className="mt-1 text-xl font-black">{selected.course?.name}</h2></div><div className="space-y-3 p-5 text-sm"><p className="flex items-center gap-2 text-slate-700"><Clock className="h-4 w-4 text-slate-400" />{selected.dayOfWeek} · {selected.startTime} – {selected.endTime}</p>{selected.course?.classroom && <p className="flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4 text-slate-400" />{selected.course.classroom.name} · {selected.course.classroom.building}</p>}{selected.course?.teacher && <p className="flex items-center gap-2 text-slate-700"><User className="h-4 w-4 text-slate-400" />{selected.course.teacher.firstName} {selected.course.teacher.lastName}</p>}<button onClick={() => setSelected(null)} className="mt-2 w-full rounded-xl bg-[#1e3a8a] py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8]">Fermer</button></div></div></div>}
    </div>
  )
}
