import { useState } from 'react'
import { Activity, User, Settings, BookOpen, Edit, LogIn, AlertTriangle, CheckCircle, Search, Download, RefreshCw } from 'lucide-react'
import { auditLogsApi, type AuditLog } from '../../lib/api'
import { useApi } from '../../hooks/useApi'

interface LogEntry {
  id: string
  timestamp: string
  user: string
  role: string
  action: string
  target: string
  ip: string
  status: 'success' | 'warning' | 'error'
  category: 'auth' | 'user' | 'academic' | 'system' | 'content'
}

const categoryFor = (resource: string): LogEntry['category'] => {
  const value = resource.toLowerCase()
  if (value.includes('auth') || value.includes('login') || value.includes('session')) return 'auth'
  if (value.includes('user') || value.includes('student') || value.includes('teacher')) return 'user'
  if (value.includes('course') || value.includes('grade') || value.includes('attendance')) return 'academic'
  if (value.includes('setting') || value.includes('system')) return 'system'
  return 'content'
}

const mapAuditLog = (log: AuditLog): LogEntry => ({
  id: log.id,
  timestamp: new Date(log.createdAt).toLocaleString('fr-FR'),
  user: log.userId || 'Utilisateur système',
  role: log.userRole || '—',
  action: log.action,
  target: log.resourceId ? `${log.resource} #${log.resourceId}` : log.resource,
  ip: log.ipAddress || '—',
  status: (log.statusCode ?? 200) >= 500 ? 'error' : (log.statusCode ?? 200) >= 400 ? 'warning' : 'success',
  category: categoryFor(log.resource),
})

const actionIcon: Record<string, any> = {
  'auth': LogIn,
  'user': User,
  'academic': BookOpen,
  'system': Settings,
  'content': Edit,
}

const statusConfig = {
  success: { label: 'Succès',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  warning: { label: 'Attention',bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
  error:   { label: 'Erreur',   bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
}

export default function AdminActivityPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const { data: apiLogs, loading, error, refetch } = useApi(() => auditLogsApi.list())
  const logs = (apiLogs ?? []).map(mapAuditLog)

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.target.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCategory === 'all' || l.category === filterCategory
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  const stats = [
    { label: 'Événements aujourd\'hui', value: logs.length.toString(),                              color: 'text-[#1e3a8a] bg-[#eff3ff]', icon: Activity },
    { label: 'Succès',                  value: logs.filter(l => l.status === 'success').length.toString(), color: 'text-emerald-700 bg-emerald-50', icon: CheckCircle },
    { label: 'Avertissements',          value: logs.filter(l => l.status === 'warning').length.toString(), color: 'text-amber-700 bg-amber-50',   icon: AlertTriangle },
    { label: 'Erreurs',                 value: logs.filter(l => l.status === 'error').length.toString(),   color: 'text-red-700 bg-red-50',       icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-[#1e3a8a]" />
            <h1 className="text-xl font-bold text-[#111827]">Journal d'activité</h1>
          </div>
          <p className="text-sm text-[#6b7280]">Audit complet des actions sur la plateforme</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-md">
            <Download className="h-4 w-4" /> Exporter logs
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          Impossible de charger le journal : {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm card-hover">
            <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl mb-3 ${color}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-2xl font-extrabold text-[#111827] stat-number">{value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher utilisateur, action, cible..."
            className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
        >
          <option value="all">Toutes catégories</option>
          <option value="auth">Authentification</option>
          <option value="user">Utilisateurs</option>
          <option value="academic">Académique</option>
          <option value="system">Système</option>
          <option value="content">Contenu</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
        >
          <option value="all">Tous statuts</option>
          <option value="success">Succès</option>
          <option value="warning">Avertissement</option>
          <option value="error">Erreur</option>
        </select>
      </div>

      {/* Log table */}
      <div className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#111827]">{filtered.length} événements</span>
          <span className="text-xs text-[#6b7280]">Données du backend</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f9fafb]">
              <tr>
                {['Horodatage', 'Utilisateur', 'Action', 'Cible', 'IP', 'Statut'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.map((log, i) => {
                const Icon = actionIcon[log.category] || Activity
                const sc = statusConfig[log.status]
                return (
                  <tr key={log.id} className={`table-row-hover animate-stagger-${Math.min(i + 1, 8)}`}>
                    <td className="px-4 py-3 font-mono text-xs text-[#6b7280] whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 ${
                          log.role === 'Admin' ? 'bg-amber-50 text-amber-700' :
                          log.role === 'Enseignant' ? 'bg-[#f0fdfa] text-[#0d9488]' :
                          log.role === 'Délégué' ? 'bg-purple-50 text-purple-700' :
                          log.role === 'Système' ? 'bg-[#f3f4f6] text-[#6b7280]' :
                          'bg-[#eff3ff] text-[#1e3a8a]'
                        }`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#111827] text-xs">{log.user}</p>
                          <p className="text-[10px] text-[#6b7280]">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#111827] whitespace-nowrap">{log.action}</td>
                    <td className="px-4 py-3 text-[#374151] max-w-[200px] truncate">{log.target}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">{log.ip}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${sc.bg} ${sc.text} ${sc.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-[#9ca3af]">
            <Activity className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Aucun événement correspondant aux filtres.</p>
          </div>
        )}
      </div>
    </div>
  )
}
