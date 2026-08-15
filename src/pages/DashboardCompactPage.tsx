import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { BookOpen, Clock, TrendingUp, UserCheck, ClipboardList } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { statsApi, getAccountType } from '../lib/api'
import { useUserRole } from '../utils/userRole'
import { SubscriptionWidget } from '../components/subscription/SubscriptionWidget'
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus'

const schedule: Array<{ time: string; course: string; teacher: string; room: string; type: string; status: 'Terminé' | 'À venir' }> = []

export default function DashboardCompactPage() {
  const { data: overview } = useApi(() => statsApi.overview())
  const { currentUser } = useUserRole()

  const now = new Date()
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
  const todayFormatted = capitalize(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

  const yesterdayFormatted = new Date(now.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const twoDaysAgoFormatted = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const examDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
  const examFormatted = capitalize(examDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

  const lateHomework: Array<{ title: string; due: string }> = []

  const quickStats = [
    { label: 'Cours inscrits', value: overview ? `${overview.courseCount}` : '—', change: '—', icon: BookOpen, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
    { label: 'Devoirs à rendre', value: overview?.assignmentCount == null ? '—' : `${overview.assignmentCount}`, change: '—', icon: ClipboardList, color: 'text-[#d97706]', bg: 'bg-[#fef3c7]' },
    { label: 'Prochain cours', value: '—', change: '—', icon: Clock, color: 'text-[#0d9488]', bg: 'bg-[#f0fdfa]' },
    { label: 'Moyenne', value: overview?.averageGrade == null ? '—' : `${overview.averageGrade}/20`, change: '—', icon: TrendingUp, color: 'text-[#7c3aed]', bg: 'bg-[#ede9fe]' },
    { label: 'Présences', value: overview?.attendanceRate == null ? '—' : `${overview.attendanceRate}%`, change: '—', icon: UserCheck, color: 'text-[#059669]', bg: 'bg-[#d1fae5]' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl bg-white border border-[#e5e7eb] px-5 py-4 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-[#111827]">Cours du jour — {todayFormatted}</h1>
          <p className="text-xs text-[#6b7280] mt-0.5">{currentUser.name} · {currentUser.roleLabel}{currentUser.filiere ? ` · ${currentUser.filiere}` : ''}</p>
        </div>
        <Link to="/app" className="text-sm font-medium text-[#1e3a8a] hover:underline">← Vue principale</Link>
      </div>

      <SubscriptionStatus compact />

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {quickStats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-sm flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.bg}`}><Icon className={`h-4 w-4 ${s.color}`} /></div>
              <div>
                <p className="text-base font-extrabold text-[#111827]">{s.value}</p>
                <p className="text-[10px] text-[#6b7280]">{s.label}</p>
                <p className={`text-[10px] font-semibold ${s.change.startsWith('+') || s.change.startsWith('↑') ? 'text-[#059669]' : 'text-[#dc2626]'}`}>{s.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Schedule + sidebar */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#f3f4f6]">
            <h2 className="text-sm font-bold text-[#111827]">Programme du jour</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#f3f4f6] bg-[#f9fafb]">
                <tr>
                  {['Heure', 'Cours', 'Enseignant', 'Salle', 'Type', 'Statut'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {schedule.map(row => (
                  <tr key={row.course} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-3 text-xs text-[#6b7280] font-mono whitespace-nowrap">{row.time}</td>
                    <td className="px-4 py-3 font-semibold text-[#111827]">{row.course}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{row.teacher}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{row.room}</td>
                    <td className="px-4 py-3"><Badge variant="info">{row.type}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={row.status === 'Terminé' ? 'success' : 'warning'}>{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {/* Late homework */}
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#111827]">Mes devoirs en retard</h2>
              <Badge variant="danger">{lateHomework.length}</Badge>
            </div>
            <div className="space-y-2">
              {lateHomework.map(hw => (
                <div key={hw.title} className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3">
                  <p className="text-sm font-semibold text-[#111827]">{hw.title}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">Échéance : {hw.due}</p>
                  <Badge variant="danger" className="mt-2">En retard</Badge>
                </div>
              ))}
            </div>
            <Link to="/app/devoirs" className="block mt-3 text-center text-xs font-medium text-[#1e3a8a] hover:underline">
              Voir tous les devoirs →
            </Link>
          </div>

          {/* Prochain partiel */}
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-center shadow-sm">
            <h2 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Prochain partiel dans</h2>
            <p className="text-5xl font-extrabold text-[#1e3a8a]">5</p>
            <p className="text-sm font-semibold text-[#374151] mt-1">jours</p>
            <p className="text-xs text-[#6b7280] mt-2">{examFormatted} · Mathématiques · 09h00</p>
          </div>
        </div>
      </div>
    </div>
  )
}
