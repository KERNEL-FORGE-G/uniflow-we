import { useState } from 'react'
import { FileText, Download, BarChart3, TrendingUp, Users, BookOpen, Calendar, Filter, RefreshCw, Eye, Printer } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts'

const attendanceMonthly = [
  { month: 'Sep', rate: 88, target: 90 }, { month: 'Oct', rate: 85, target: 90 },
  { month: 'Nov', rate: 82, target: 90 }, { month: 'Déc', rate: 79, target: 90 },
  { month: 'Jan', rate: 91, target: 90 }, { month: 'Fév', rate: 87, target: 90 },
  { month: 'Mar', rate: 84, target: 90 }, { month: 'Avr', rate: 89, target: 90 },
  { month: 'Mai', rate: 92, target: 90 },
]

const gradesByDept = [
  { dept: 'Informatique', L1: 13.2, L2: 14.1, L3: 14.8, M1: 15.2 },
  { dept: 'Mathématiques', L1: 12.9, L2: 13.8, L3: 14.5, M1: 15.0 },
  { dept: 'Économie', L1: 13.5, L2: 14.0, L3: 14.6, M1: 15.1 },
  { dept: 'Droit', L1: 13.1, L2: 13.9, L3: 14.3, M1: 14.8 },
]

const enrollmentTrend = [
  { year: '2021', students: 2100 }, { year: '2022', students: 2380 },
  { year: '2023', students: 2600 }, { year: '2024', students: 2720 },
  { year: '2025', students: 2847 },
]

const deptDistrib = [
  { name: 'Informatique', value: 32, color: '#1e3a8a' },
  { name: 'Économie',     value: 22, color: '#0d9488' },
  { name: 'Mathématiques',value: 18, color: '#7c3aed' },
  { name: 'Droit',        value: 15, color: '#d97706' },
  { name: 'Médecine',     value: 8,  color: '#ef4444' },
  { name: 'Génie Civil',  value: 5,  color: '#059669' },
]

const savedReports = [
  { name: 'Rapport mensuel Mai 2026',       date: '01/06/2026', type: 'PDF',  size: '2.4 MB', scope: 'Global' },
  { name: 'Bilan présences S2 2025-2026',   date: '15/05/2026', type: 'XLSX', size: '1.8 MB', scope: 'Présences' },
  { name: 'Rapport notes par UE — INFO',    date: '10/05/2026', type: 'PDF',  size: '3.1 MB', scope: 'Académique' },
  { name: 'Statistiques inscriptions 2026', date: '01/05/2026', type: 'XLSX', size: '1.2 MB', scope: 'Inscriptions' },
  { name: 'Audit enseignants S1 2025-2026', date: '15/02/2026', type: 'PDF',  size: '4.5 MB', scope: 'Personnel' },
]

type ReportTab = 'presences' | 'notes' | 'inscriptions' | 'saved'

export default function AdminReportsPage() {
  const [tab, setTab] = useState<ReportTab>('presences')
  const [period, setPeriod] = useState('2025-2026')
  const [dept, setDept] = useState('all')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 2000)
  }

  const tabs: { id: ReportTab; label: string; icon: any }[] = [
    { id: 'presences',    label: 'Présences',    icon: Users },
    { id: 'notes',        label: 'Notes',        icon: TrendingUp },
    { id: 'inscriptions', label: 'Inscriptions', icon: BookOpen },
    { id: 'saved',        label: 'Rapports sauvegardés', icon: FileText },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-[#1e3a8a]" />
            <h1 className="text-xl font-bold text-[#111827]">Rapports & Analyses</h1>
          </div>
          <p className="text-sm text-[#6b7280]">Statistiques et rapports de la plateforme UniFlow</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e3a8a]"
          >
            <option>2025-2026</option>
            <option>2024-2025</option>
            <option>2023-2024</option>
          </select>
          <select
            value={dept}
            onChange={e => setDept(e.target.value)}
            className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e3a8a]"
          >
            <option value="all">Tous les départements</option>
            <option value="info">Informatique</option>
            <option value="math">Mathématiques</option>
            <option value="eco">Économie</option>
            <option value="droit">Droit</option>
          </select>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-md"
          >
            {generating ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Génération...</>
            ) : (
              <><Download className="h-4 w-4" /> Exporter PDF</>
            )}
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Présence globale', value: '87%', change: '+2%', up: true, color: 'text-[#0d9488] bg-[#f0fdfa]' },
          { label: 'Moyenne générale', value: '14.2/20', change: '+0.3', up: true, color: 'text-[#1e3a8a] bg-[#eff3ff]' },
          { label: 'Taux de réussite', value: '91%', change: '+4%', up: true, color: 'text-[#059669] bg-[#d1fae5]' },
          { label: 'Abandons', value: '2.1%', change: '-0.8%', up: true, color: 'text-[#d97706] bg-[#fef3c7]' },
        ].map(({ label, value, change, up, color }) => (
          <div key={label} className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm card-hover">
            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold mb-3 ${color}`}>
              {up ? '↑' : '↓'} {change}
            </div>
            <p className="text-2xl font-extrabold text-[#111827] stat-number">{value}</p>
            <p className="text-xs text-[#6b7280] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f3f4f6] p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              tab === id ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'presences' && (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#111827] mb-4">Taux de présence mensuel (%) — vs. objectif 90%</h2>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={attendanceMonthly}>
                  <defs>
                    <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1e3a8a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any, n: any) => [`${v}%`, n === 'rate' ? 'Présence' : 'Objectif']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="target" name="Objectif" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Area type="monotone" dataKey="rate" name="Présence" stroke="#1e3a8a" strokeWidth={2.5} fill="url(#rateGrad)" dot={{ r: 4, fill: '#1e3a8a' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#111827] mb-4">Par département</h2>
              <div className="space-y-3">
                {[
                  { dept: 'Informatique', rate: 91, color: '#1e3a8a' },
                  { dept: 'Mathématiques', rate: 88, color: '#0d9488' },
                  { dept: 'Économie', rate: 85, color: '#7c3aed' },
                  { dept: 'Droit', rate: 83, color: '#d97706' },
                  { dept: 'Médecine', rate: 94, color: '#059669' },
                ].map(({ dept: d, rate, color }) => (
                  <div key={d}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#374151]">{d}</span>
                      <span className="font-bold" style={{ color }}>{rate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#111827] mb-4">Étudiants à risque (présence {'<'} 75%)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    {['Matricule', 'Nom', 'Département', 'Niveau', 'Présence', 'Absences', 'Statut'].map(h => (
                      <th key={h} className="pb-3 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {[
                    { mat: '21INFO089', name: 'Fotso Divine',    dept: 'Informatique', level: 'L1', rate: 62, absences: 12, status: 'Critique' },
                    { mat: '20INFO078', name: 'Tchoumba Alice',  dept: 'Informatique', level: 'L2', rate: 68, absences: 9,  status: 'Attention' },
                    { mat: '21MAT034',  name: 'Bindzi Roger',    dept: 'Maths',        level: 'L1', rate: 71, absences: 8,  status: 'Attention' },
                    { mat: '20ECO112',  name: 'Moto Carine',     dept: 'Économie',     level: 'L2', rate: 73, absences: 7,  status: 'Attention' },
                  ].map(s => (
                    <tr key={s.mat} className="table-row-hover">
                      <td className="py-3 font-mono text-xs text-[#6b7280]">{s.mat}</td>
                      <td className="py-3 font-semibold text-[#111827]">{s.name}</td>
                      <td className="py-3 text-[#374151]">{s.dept}</td>
                      <td className="py-3 text-[#374151]">{s.level}</td>
                      <td className="py-3">
                        <span className={`font-bold ${s.rate < 70 ? 'text-red-600' : 'text-amber-600'}`}>{s.rate}%</span>
                      </td>
                      <td className="py-3 text-[#374151]">{s.absences} jours</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${s.status === 'Critique' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#111827] mb-4">Moyennes par département et niveau</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gradesByDept}>
                <XAxis dataKey="dept" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[10, 18]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`${v}/20`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend />
                <Bar dataKey="L1" name="L1" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="L2" name="L2" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="L3" name="L3" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="M1" name="M1" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {[
              { dept: 'Informatique', avg: 14.5, pass: 93, excellent: 28, courses: ['Algorithmique', 'Réseaux', 'IA', 'BDD'] },
              { dept: 'Mathématiques', avg: 13.9, pass: 89, excellent: 22, courses: ['Analyse', 'Algèbre', 'Stats', 'Proba'] },
            ].map(({ dept: d, avg, pass, excellent, courses }) => (
              <div key={d} className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#111827] mb-4">{d}</h3>
                <div className="flex gap-4 mb-4">
                  {[
                    { v: `${avg}/20`, l: 'Moyenne', c: 'text-[#1e3a8a]' },
                    { v: `${pass}%`,  l: 'Réussite', c: 'text-emerald-600' },
                    { v: `${excellent}%`, l: 'Excellents', c: 'text-[#7c3aed]' },
                  ].map(({ v, l, c }) => (
                    <div key={l} className="text-center flex-1">
                      <p className={`text-xl font-extrabold stat-number ${c}`}>{v}</p>
                      <p className="text-xs text-[#6b7280]">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {courses.map(c => (
                    <div key={c} className="flex items-center justify-between text-xs">
                      <span className="text-[#374151]">{c}</span>
                      <span className="font-bold text-[#111827]">{(13 + Math.random() * 3).toFixed(1)}/20</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'inscriptions' && (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#111827] mb-4">Évolution des inscriptions</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={enrollmentTrend}>
                  <defs>
                    <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [`${v} étudiants`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="students" name="Étudiants" stroke="#0d9488" strokeWidth={2.5} fill="url(#enrollGrad)" dot={{ r: 4, fill: '#0d9488' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#111827] mb-4">Répartition par département</h2>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={deptDistrib} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {deptDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [`${v}%`, n]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {deptDistrib.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-[#6b7280] truncate">{d.name}</span>
                    <span className="ml-auto font-bold text-[#111827]">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'saved' && (
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-[#111827]">Rapports générés</h2>
            <button className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all">
              <FileText className="h-4 w-4" /> Nouveau rapport
            </button>
          </div>
          <div className="space-y-3">
            {savedReports.map((r, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] p-4 bg-[#f9fafb] hover:bg-white transition-colors group">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${r.type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{r.name}</p>
                  <p className="text-xs text-[#6b7280]">{r.date} · {r.size} · {r.scope}</p>
                </div>
                <span className={`hidden md:block rounded-lg px-2.5 py-1 text-xs font-bold ${r.type === 'PDF' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {r.type}
                </span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="rounded-lg p-2 text-[#6b7280] hover:bg-[#eff3ff] hover:text-[#1e3a8a] transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f0fdfa] hover:text-[#0d9488] transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827] transition-colors">
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
