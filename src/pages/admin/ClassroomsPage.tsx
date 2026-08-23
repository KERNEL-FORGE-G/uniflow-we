import { useEffect, useMemo, useState } from 'react'
import { Building2, Calendar, Clock, Loader2, MapPin, Users } from 'lucide-react'
import { coursesApi, schedulesApi, type Course, type Schedule } from '../../lib/api'

const DAYS: Record<string, string> = {
  LUNDI: 'Lundi',
  MARDI: 'Mardi',
  MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi',
  VENDREDI: 'Vendredi',
  SAMEDI: 'Samedi',
  DIMANCHE: 'Dimanche',
}

interface RoomSlot {
  id: string
  courseCode: string
  courseName: string
  classroom: string
  day: string
  startTime: string
  endTime: string
  teacher: string
}

export default function ClassroomsPage() {
  const [slots, setSlots] = useState<RoomSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roomFilter, setRoomFilter] = useState('Toutes les salles')

  useEffect(() => {
    let active = true
    void Promise.all([coursesApi.list(), schedulesApi.list()])
      .then(([courses, schedules]) => {
        if (!active) return
        const byId = new Map((courses as Course[]).map((course) => [course.id, course]))
        setSlots((schedules as Schedule[]).map((schedule) => {
          const course = byId.get(schedule.course?.id || '')
          const teacher = course?.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}`.trim() : ''
          return {
            id: schedule.id,
            courseCode: schedule.course?.code || course?.code || '—',
            courseName: schedule.course?.name || course?.name || 'Cours académique',
            classroom: schedule.course?.classroom?.name || course?.classroom?.name || 'Salle non renseignée',
            day: DAYS[schedule.dayOfWeek] || schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            teacher: teacher || 'Non renseigné',
          }
        }))
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Impossible de charger le planning Appwrite.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const rooms = useMemo(() => ['Toutes les salles', ...Array.from(new Set(slots.map((slot) => slot.classroom))).sort()], [slots])
  const visibleSlots = roomFilter === 'Toutes les salles' ? slots : slots.filter((slot) => slot.classroom === roomFilter)
  const totalHours = visibleSlots.reduce((sum, slot) => {
    const [startHour, startMinute] = slot.startTime.split(':').map(Number)
    const [endHour, endMinute] = slot.endTime.split(':').map(Number)
    return sum + Math.max(0, (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60)
  }, 0)

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" /></div>
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header className="rounded-3xl border border-[#bfdbfe] bg-gradient-to-r from-[#1e3a8a] to-[#0f766e] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><Building2 className="h-3.5 w-3.5" /> RÉFÉRENTIEL APPWRITE</p>
            <h1 className="text-2xl font-black sm:text-3xl">Planning des salles</h1>
            <p className="mt-1 max-w-2xl text-sm text-blue-100">Occupation réellement planifiée pour Université de Yaoundé I · ICT4D · L1. Les créneaux sont lus depuis `academic_schedules`.</p>
          </div>
          <span className="rounded-xl bg-white/15 px-3 py-2 text-xs font-bold">Lecture synchronisée · pas de réservation simulée</span>
        </div>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Calendar className="h-5 w-5" />} label="Créneaux planifiés" value={visibleSlots.length} tone="blue" />
        <Metric icon={<MapPin className="h-5 w-5" />} label="Salles utilisées" value={new Set(visibleSlots.map((slot) => slot.classroom)).size} tone="teal" />
        <Metric icon={<Clock className="h-5 w-5" />} label="Heures planifiées" value={`${totalHours.toFixed(0)} h`} tone="amber" />
      </section>

      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#111827]">Occupation hebdomadaire</h2>
            <p className="text-xs text-[#6b7280]">Chaque ligne provient d’un créneau Appwrite lié à un cours académique.</p>
          </div>
          <label className="text-xs font-bold text-[#475569]">Salle
            <select value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)} className="ml-2 rounded-lg border border-[#d1d5db] px-3 py-2 text-sm font-medium text-[#111827]">
              {rooms.map((room) => <option key={room} value={room}>{room}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f8fafc] text-left text-xs font-bold uppercase tracking-wide text-[#64748b]">
              <tr><th className="px-5 py-3">Cours</th><th className="px-5 py-3">Salle</th><th className="px-5 py-3">Jour & horaire</th><th className="px-5 py-3">Enseignant</th><th className="px-5 py-3">Source</th></tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {visibleSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-[#f8fafc]">
                  <td className="px-5 py-4"><p className="font-mono text-xs font-bold text-[#1e3a8a]">{slot.courseCode}</p><p className="mt-1 font-semibold text-[#1e293b]">{slot.courseName}</p></td>
                  <td className="px-5 py-4 font-medium text-[#334155]">{slot.classroom}</td>
                  <td className="px-5 py-4"><p className="font-semibold text-[#334155]">{slot.day}</p><p className="mt-1 font-mono text-xs text-[#64748b]">{slot.startTime} — {slot.endTime}</p></td>
                  <td className="px-5 py-4 text-[#475569]">{slot.teacher}</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><Users className="h-3 w-3" /> Appwrite</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!error && visibleSlots.length === 0 && <p className="p-12 text-center text-sm text-[#6b7280]">Aucun créneau Appwrite ne correspond à ce filtre.</p>}
      </section>
    </div>
  )
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: 'blue' | 'teal' | 'amber' }) {
  const tones = {
    blue: 'bg-blue-50 text-[#1e3a8a]',
    teal: 'bg-teal-50 text-[#0f766e]',
    amber: 'bg-amber-50 text-[#b45309]',
  }
  return <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm"><div className={`mb-3 inline-flex rounded-xl p-2 ${tones[tone]}`}>{icon}</div><p className="text-2xl font-black text-[#111827]">{value}</p><p className="mt-1 text-xs font-medium text-[#64748b]">{label}</p></div>
}
