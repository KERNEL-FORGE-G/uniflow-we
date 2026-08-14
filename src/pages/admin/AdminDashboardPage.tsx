import { useState, useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Building2,
  BarChart3,
  Loader2,
  RefreshCw,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts'
import {
  statsApi,
  studentsApi,
  attendanceApi,
  type OverviewStats,
  type Student,
  type AttendanceSession
} from '../../lib/api'

const COLORS = ['#1e3a8a', '#0d9488', '#7c3aed', '#d97706', '#059669', '#dc2626']

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiliere, setSelectedFiliere] = useState<string>('Toutes')

  const now = new Date()
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const formattedToday = capitalize(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

  const fetchData = async () => {
    setError(null)
    try {
      const [statsRes, studentsRes, sessionsRes] = await Promise.all([
        statsApi.overview(),
        studentsApi.list(),
        attendanceApi.listSessions(),
      ])

      setStats(statsRes)
      setStudents(studentsRes)
      setSessions(sessionsRes)
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la récupération des données analytiques.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9fafb]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#1e3a8a]" />
          <p className="text-sm font-semibold text-[#374151]">Chargement de la vue analytique Admin...</p>
        </div>
      </div>
    )
  }

  // 1. Compute Répartition des étudiants par filière (/students)
  const filiereCounts: Record<string, number> = {}
  students.forEach((st) => {
    const filiereName = st.specialty?.name || st.level?.name || 'Non renseignée'
    filiereCounts[filiereName] = (filiereCounts[filiereName] || 0) + 1
  })

  const studentFiliereData = Object.entries(filiereCounts).map(([name, count], index) => ({
    name,
    value: count,
    percentage: Math.round((count / Math.max(students.length, 1)) * 100),
    color: COLORS[index % COLORS.length]
  }))

  // 2. Compute Taux de présence hebdomadaires (/attendance/sessions)
  // Sort sessions by date chronologically
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const weeklyAttendanceData = sortedSessions.map((session) => {
    const totalRecords = session.records?.length || 0
    const presentCount =
      session.records?.filter((r) => r.status === 'PRESENT' || r.status === 'RETARD').length || 0
    const absentCount = session.records?.filter((r) => r.status === 'ABSENT').length || 0
    const justifieCount = session.records?.filter((r) => r.status === 'JUSTIFIE').length || 0

    const rate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0

    // Format week label
    const dateObj = new Date(session.date)
    const formattedDate = !isNaN(dateObj.getTime())
      ? `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`
      : session.date

    return {
      date: session.date,
      label: `Sem. ${formattedDate}`,
      courseCode: session.course?.code || 'COURS',
      courseName: session.course?.name || 'Cours principal',
      rate,
      present: presentCount,
      absent: absentCount,
      justifie: justifieCount,
      total: totalRecords
    }
  })

  const attendanceTrendData = weeklyAttendanceData

  // KPI Metrics : aucune valeur n’est inventée lorsque la base est vide.
  const totalStudentsCount = stats?.studentCount ?? students.length
  const totalSessionsCount = sessions.length
  const avgAttendanceRate = attendanceTrendData.length > 0
    ? Math.round(attendanceTrendData.reduce((acc, curr) => acc + curr.rate, 0) / attendanceTrendData.length)
    : 0
  const topFiliere = studentFiliereData[0]?.name || '—'

  const filteredStudents =
    selectedFiliere === 'Toutes'
      ? students
      : students.filter(
          (s) =>
            (s.specialty?.name || s.level?.name || 'Non renseignée') === selectedFiliere
        )

  // Framer Motion Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    }
  }

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white border border-[#e5e7eb] p-6 shadow-sm"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-[#111827]">Tableau de bord Admin</h1>
            <span className="rounded-full bg-[#eff3ff] px-3 py-1 text-xs font-extrabold text-[#1e3a8a] border border-[#1e3a8a]/20">
              Vue Analytique API
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-bold text-[#374151] border border-[#e5e7eb]">
              <Calendar className="h-3.5 w-3.5 text-[#1e3a8a]" />
              {formattedToday}
            </span>
          </div>
          <p className="text-sm text-[#6b7280] mt-1">
            Analyse dynamique connectée aux endpoints{' '}
            <code className="rounded bg-[#f3f4f6] px-1.5 py-0.5 font-mono text-xs text-[#1e3a8a]">
              /students
            </code>{' '}
            et{' '}
            <code className="rounded bg-[#f3f4f6] px-1.5 py-0.5 font-mono text-xs text-[#1e3a8a]">
              /attendance/sessions
            </code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-xs font-bold text-[#374151] hover:bg-[#f9fafb] hover:border-[#1e3a8a] transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-[#1e3a8a] ${refreshing ? 'animate-spin' : ''}`} />
            Rafraîchir les données
          </button>
          <span className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs font-bold text-amber-800">
            <ShieldCheck className="h-4 w-4 text-amber-600" /> Super Admin
          </span>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-800 shadow-sm"
        >
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {/* KPI Stats Grid with Framer Motion Staggered Entry Transitions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-default"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-[#eff3ff] p-3 text-[#1e3a8a]">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              Actifs
            </span>
          </div>
          <p className="text-3xl font-black text-[#111827] mt-3">{totalStudentsCount}</p>
          <p className="text-xs font-bold text-[#6b7280] mt-0.5">Étudiants inscrits (/students)</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-default"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
              <UserCheck className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
              Hebdo
            </span>
          </div>
          <p className="text-3xl font-black text-[#111827] mt-3">{avgAttendanceRate}%</p>
          <p className="text-xs font-bold text-[#6b7280] mt-0.5">Taux de présence moyen</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-default"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800">
              Sessions
            </span>
          </div>
          <p className="text-3xl font-black text-[#111827] mt-3">{totalSessionsCount}</p>
          <p className="text-xs font-bold text-[#6b7280] mt-0.5">Sessions de cours enregistrées</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-default"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <Layers className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              Majoritaire
            </span>
          </div>
          <p className="text-xl font-black text-[#111827] mt-3 truncate">{topFiliere}</p>
          <p className="text-xs font-bold text-[#6b7280] mt-0.5">Filière la plus représentée</p>
        </motion.div>
      </motion.div>

      {/* Main Analytics Section: Recharts Visualizations */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.25 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* 1. Taux de présence hebdomadaires */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#1e3a8a]" /> Taux de présence hebdomadaires (%)
                </h2>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Évolution du taux d'assiduité calculée depuis <code className="text-[#1e3a8a] font-mono">/attendance/sessions</code>
                </p>
              </div>
              <span className="rounded-lg bg-[#eff3ff] px-2.5 py-1 text-xs font-bold text-[#1e3a8a]">
                Moyenne : {avgAttendanceRate}%
              </span>
            </div>

            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="presenceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-lg text-xs space-y-1">
                            <p className="font-bold text-[#111827]">{data.label} — {data.courseCode}</p>
                            {data.courseName && <p className="text-[#6b7280]">{data.courseName}</p>}
                            <p className="text-[#1e3a8a] font-extrabold text-sm">Taux de présence : {data.rate}%</p>
                            {data.present !== undefined && (
                              <div className="text-[11px] text-[#374151] pt-1 border-t border-[#f3f4f6]">
                                <span className="text-emerald-600 font-bold">Présents : {data.present}</span> ·{' '}
                                <span className="text-red-600 font-bold">Absents : {data.absent}</span>
                              </div>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    name="Taux (%)"
                    stroke="#1e3a8a"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#presenceGrad)"
                    dot={{ r: 5, fill: '#1e3a8a', strokeWidth: 2, stroke: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-[#f3f4f6] text-center">
            <div className="bg-[#f9fafb] p-2.5 rounded-xl border border-[#e5e7eb]">
              <p className="text-[11px] font-bold text-[#6b7280]">Présence Max</p>
              <p className="text-base font-extrabold text-emerald-600">
                {Math.max(...attendanceTrendData.map((d) => d.rate))}%
              </p>
            </div>
            <div className="bg-[#f9fafb] p-2.5 rounded-xl border border-[#e5e7eb]">
              <p className="text-[11px] font-bold text-[#6b7280]">Présence Min</p>
              <p className="text-base font-extrabold text-amber-600">
                {Math.min(...attendanceTrendData.map((d) => d.rate))}%
              </p>
            </div>
            <div className="bg-[#f9fafb] p-2.5 rounded-xl border border-[#e5e7eb]">
              <p className="text-[11px] font-bold text-[#6b7280]">Total Analyses</p>
              <p className="text-base font-extrabold text-[#1e3a8a]">{attendanceTrendData.length} Semaines</p>
            </div>
          </div>
        </div>

        {/* 2. Répartition des étudiants par filière */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#0d9488]" /> Répartition des étudiants par filière
                </h2>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Proportions d'effectifs calculées depuis l'API <code className="text-[#1e3a8a] font-mono">/students</code>
                </p>
              </div>
              <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                {studentFiliereData.length} Filières
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentFiliereData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {studentFiliereData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${value} étudiants`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-2.5">
                {studentFiliereData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-bold text-[#374151] truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-[#111827]">{item.value}</span>
                      <span className="text-[10px] font-bold text-[#6b7280] bg-[#f3f4f6] px-1.5 py-0.5 rounded">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#f3f4f6]">
            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">
              Vue en histogramme comparatif
            </h3>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentFiliereData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="value" name="Étudiants" radius={[6, 6, 0, 0]} maxBarSize={32}>
                    {studentFiliereData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Detail Table Filtered by Filière */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3f4f6] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#1e3a8a]" /> Effectif d'étudiants par filière
            </h2>
            <p className="text-xs text-[#6b7280]">
              Liste synchrone des étudiants récupérés depuis <code className="text-[#1e3a8a] font-mono">/students</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#374151]">Filtrer par filière :</span>
            <select
              value={selectedFiliere}
              onChange={(e) => setSelectedFiliere(e.target.value)}
              className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-bold text-[#374151] outline-none focus:border-[#1e3a8a]"
            >
              <option value="Toutes">Toutes les filières ({students.length})</option>
              {studentFiliereData.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.value})
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#9ca3af]">
            Aucun étudiant trouvé dans cette filière.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-[#6b7280] font-bold uppercase tracking-wider bg-[#f9fafb]">
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Nom & Prénom</th>
                  <th className="py-3 px-4">Filière / Spécialité</th>
                  <th className="py-3 px-4">Niveau</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {filteredStudents.slice(0, 8).map((st) => (
                  <tr key={st.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1e3a8a]">{st.matricule}</td>
                    <td className="py-3 px-4 font-bold text-[#111827]">
                      {st.firstName} {st.lastName}
                    </td>
                    <td className="py-3 px-4 text-[#374151]">
                      {st.specialty?.name || st.level?.name || 'Informatique'}
                    </td>
                    <td className="py-3 px-4 text-[#6b7280]">{st.level?.name || 'Licence 2'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {st.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Sessions Attendance Logs from /attendance/sessions */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.45 }}
        className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#7c3aed]" /> Historique des sessions d'assiduité
            </h2>
            <p className="text-xs text-[#6b7280]">
              Données de présence en direct des cours depuis <code className="text-[#1e3a8a] font-mono">/attendance/sessions</code>
            </p>
          </div>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
            {sessions.length} sessions au total
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((sess) => {
            const total = sess.records?.length || 0
            const present = sess.records?.filter((r) => r.status === 'PRESENT' || r.status === 'RETARD').length || 0
            const absent = sess.records?.filter((r) => r.status === 'ABSENT').length || 0
            const rate = total > 0 ? Math.round((present / total) * 100) : 100

            return (
              <motion.div
                key={sess.id}
                whileHover={{ y: -3 }}
                className="rounded-xl border border-[#e5e7eb] bg-[#fcfdfe] p-4 space-y-2 shadow-xs hover:border-[#1e3a8a]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                    {sess.course?.code || 'COURS'}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      rate >= 85
                        ? 'bg-emerald-100 text-emerald-800'
                        : rate >= 70
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rate}% de présence
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#111827]">{sess.course?.name || 'Cours magistral'}</h3>
                <p className="text-xs text-[#6b7280]">Date de la session : {sess.date}</p>
                <div className="flex items-center gap-3 pt-2 text-xs border-t border-[#f3f4f6]">
                  <span className="text-emerald-700 font-bold">✓ {present} présents</span>
                  <span className="text-red-600 font-bold">✗ {absent} absents</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
