import { useEffect, useRef, useState } from 'react'
import { QrCode, CheckCircle, XCircle, Clock, Calendar, TrendingUp, RefreshCw, AlertCircle, X, Camera, Loader2 } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { useApi } from '../hooks/useApi'
import { attendanceApi, coursesApi, type AttendanceSession, type Course } from '../lib/api'

function statusIcon(s: string) {
  if (s === 'PRESENT')  return <CheckCircle className="h-4 w-4 text-emerald-500" />
  if (s === 'ABSENT')   return <XCircle     className="h-4 w-4 text-red-500" />
  return <Clock className="h-4 w-4 text-amber-500" />
}
function statusBadge(s: string) {
  if (s === 'PRESENT')  return <Badge variant="success">Présent</Badge>
  if (s === 'ABSENT')   return <Badge variant="danger">Absent</Badge>
  if (s === 'RETARD')   return <Badge variant="warning">Retard</Badge>
  return <Badge variant="primary">Justifié</Badge>
}

const courseGradients = [
  'from-blue-600 to-indigo-700', 'from-teal-600 to-emerald-700',
  'from-purple-600 to-pink-700', 'from-amber-600 to-orange-700',
]

export default function AttendancePage() {
  const [showQR, setShowQR] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [qrValue, setQrValue] = useState('')
  const [qrStatus, setQrStatus] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [qrSubmitting, setQrSubmitting] = useState(false)
  const [cameraAvailable, setCameraAvailable] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)

  // On charge les cours puis les sessions pour chacun
  const { data: courses, loading: lCourses, error: eCourses, refetch } = useApi(() => coursesApi.mine())

  // Sessions pour le cours sélectionné
  const { data: sessions, loading: lSessions } = useApi(
    () => selectedCourse ? attendanceApi.byCourse(selectedCourse) : Promise.resolve(null),
    [selectedCourse]
  )

  // Stats globales calculées depuis toutes les sessions
  const { data: allSessions } = useApi(() =>
    courses
      ? Promise.all((courses as Course[]).map(c => attendanceApi.byCourse(c.id).catch(() => [] as AttendanceSession[])))
        .then(res => res.flat())
      : Promise.resolve([] as AttendanceSession[]),
    [courses?.length, refreshKey]
  )

  const submitQr = async (value: string) => {
    if (!value.trim() || qrSubmitting) return
    setQrSubmitting(true)
    setQrError(null)
    try {
      const result = await attendanceApi.scan({ qrCode: value.trim() })
      setQrStatus(result.alreadyRecorded ? 'Votre émargement était déjà enregistré pour cette séance.' : 'Émargement enregistré dans Appwrite.')
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'Impossible de valider ce QR UniFlow.')
    } finally {
      setQrSubmitting(false)
    }
  }

  useEffect(() => {
    if (!showQR) return
    let cancelled = false
    const startCamera = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        const scanner = new Html5Qrcode('uniflow-qr-reader')
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            if (cancelled) return
            await scanner.stop().catch(() => undefined)
            scannerRef.current = null
            setQrValue(decodedText)
            await submitQr(decodedText)
          },
          () => undefined,
        )
      } catch {
        if (!cancelled) setCameraAvailable(false)
      }
    }
    setCameraAvailable(true)
    void startCamera()
    return () => {
      cancelled = true
      const scanner = scannerRef.current
      scannerRef.current = null
      if (scanner) void scanner.stop().catch(() => undefined)
    }
  // La caméra ne doit démarrer qu’à l’ouverture du modal; la soumission est déclenchée par le scanner.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQR])

  const myRecords = (allSessions ?? []).flatMap((s: AttendanceSession) => s.records ?? [])
  const totalPresent = myRecords.filter(r => r.status === 'PRESENT').length
  const totalAbsent  = myRecords.filter(r => r.status === 'ABSENT').length
  const totalLate    = myRecords.filter(r => r.status === 'RETARD').length
  const total = myRecords.length || 1
  const globalRate = Math.round((totalPresent / total) * 100)

  const pieData = [
    { name: 'Présent',  value: totalPresent,  color: '#059669' },
    { name: 'Absent',   value: totalAbsent,   color: '#dc2626' },
    { name: 'Retard',   value: totalLate,     color: '#d97706' },
  ].filter(d => d.value > 0)

  // Stats par cours pour le graphique
  const courseStats = (courses ?? []).map((c: Course) => {
    const courseSessions = (allSessions ?? []).filter((s: AttendanceSession) => s.courseId === c.id)
    const records = courseSessions.flatMap((s: AttendanceSession) => s.records ?? [])
    const present = records.filter(r => r.status === 'PRESENT').length
    const tot = records.length || 1
    return { name: c.code, rate: Math.round((present / tot) * 100) }
  })

  if (lCourses) return (
    <div className="space-y-4 animate-fade-in">
      {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-xl bg-[#f3f4f6] animate-pulse" />)}
    </div>
  )
  if (eCourses) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="text-sm text-[#6b7280]">{eCourses}</p>
      <button onClick={refetch} className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white">
        <RefreshCw className="h-4 w-4" /> Réessayer
      </button>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Mes présences</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Suivi personnel par matière</p>
        </div>
        <button onClick={() => { setQrStatus(null); setQrError(null); setQrValue(''); setShowQR(true) }}
          className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d4fa8]">
          <QrCode className="h-4 w-4" /> Scanner QR
        </button>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{value:globalRate},{value:100-globalRate}]}
                  cx="50%" cy="50%" innerRadius={20} outerRadius={26} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill="#059669" /><Cell fill="#f3f4f6" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-600">{globalRate}%</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#111827]">{globalRate}%</p>
            <p className="text-xs text-[#6b7280]">Taux global</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <p className="text-2xl font-extrabold text-emerald-600">{totalPresent}</p>
          <p className="text-xs text-[#6b7280] mt-0.5">Présences totales</p>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <p className="text-2xl font-extrabold text-red-600">{totalAbsent}</p>
          <p className="text-xs text-[#6b7280] mt-0.5">Absences totales</p>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <p className="text-2xl font-extrabold text-amber-600">{totalLate}</p>
          <p className="text-xs text-[#6b7280] mt-0.5">Retards</p>
        </div>
      </div>

      {/* Présences par cours */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(courses ?? []).map((course: Course, idx: number) => {
          const courseSessions = (allSessions ?? []).filter((s: AttendanceSession) => s.courseId === course.id)
          const records = courseSessions.flatMap((s: AttendanceSession) => s.records ?? [])
          const present = records.filter(r => r.status === 'PRESENT').length
          const absent  = records.filter(r => r.status === 'ABSENT').length
          const late    = records.filter(r => r.status === 'RETARD').length
          const tot = records.length || 1
          const rate = Math.round((present / tot) * 100)
          const gradient = courseGradients[idx % courseGradients.length]
          const teacherName = course.teacher
            ? `${course.teacher.firstName} ${course.teacher.lastName}`
            : ''

          return (
            <div key={course.id} className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold mb-1">{course.code}</span>
                    <h3 className="text-base font-bold">{course.name}</h3>
                    <p className="text-xs opacity-80">{teacherName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold">{rate}%</div>
                    <p className="text-xs opacity-70">Assiduité</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto mb-0.5" />
                    <p className="text-lg font-bold text-emerald-900">{present}</p>
                    <p className="text-[10px] text-emerald-600">Présent</p>
                  </div>
                  <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                    <XCircle className="h-4 w-4 text-red-600 mx-auto mb-0.5" />
                    <p className="text-lg font-bold text-red-900">{absent}</p>
                    <p className="text-[10px] text-red-600">Absent</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                    <Clock className="h-4 w-4 text-amber-600 mx-auto mb-0.5" />
                    <p className="text-lg font-bold text-amber-900">{late}</p>
                    <p className="text-[10px] text-amber-600">Retard</p>
                  </div>
                </div>

                {/* Dernières sessions */}
                {courseSessions.slice(-3).map((s: AttendanceSession) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-[#f9fafb] text-xs">
                    <span className="flex items-center gap-1.5 text-[#6b7280]">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(s.date).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
                    </span>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const myRecord = (s.records ?? []).find(r => r.status)
                        return myRecord ? (
                          <>{statusIcon(myRecord.status)} {statusBadge(myRecord.status)}</>
                        ) : <span className="text-[#9ca3af]">—</span>
                      })()}
                    </div>
                  </div>
                ))}

                <button onClick={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
                  {selectedCourse === course.id ? 'Masquer' : 'Voir tout l\'historique'}
                </button>

                {selectedCourse === course.id && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {lSessions ? (
                      <div className="h-8 rounded bg-[#f3f4f6] animate-pulse" />
                    ) : (sessions ?? []).map((s: AttendanceSession) => (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded bg-[#f9fafb] text-xs">
                        <span className="text-[#6b7280]">
                          {new Date(s.date).toLocaleDateString('fr-FR')}
                        </span>
                        {(() => {
                          const r = (s.records ?? [])[0]
                          return r ? statusBadge(r.status) : <span>—</span>
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#1e3a8a]" /> Taux par matière
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={courseStats}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v}%`]} />
              <Bar dataKey="rate" fill="#1e3a8a" radius={[4,4,0,0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm flex flex-col items-center justify-center">
          <h2 className="text-sm font-bold text-[#111827] mb-4 self-start">Répartition globale</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [v, 'séances']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#9ca3af]">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-[#111827] mb-1">Scanner le QR Code</h3>
            <p className="text-xs text-[#6b7280] mb-4">Pointez votre caméra vers le QR affiché par le délégué ou saisissez son contenu en secours.</p>
            <div id="uniflow-qr-reader" className="mx-auto overflow-hidden rounded-xl border-2 border-dashed border-[#1e3a8a] bg-[#eff3ff]" />
            {!cameraAvailable && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">Caméra indisponible. Utilisez la saisie de secours ci-dessous.</p>}
            <label className="mt-4 block text-left text-xs font-semibold text-[#374151]">Contenu du QR</label>
            <textarea value={qrValue} onChange={(event) => setQrValue(event.target.value)} placeholder="Collez le jeton UniFlow…" rows={3} className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#1e3a8a]" />
            {qrError && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-left text-xs text-red-700">{qrError}</p>}
            {qrStatus && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-left text-xs text-emerald-800">{qrStatus}</p>}
            <button
              onClick={() => void submitQr(qrValue)} disabled={qrSubmitting || !qrValue.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] py-2.5 text-xs font-bold text-white hover:bg-blue-900 shadow-sm disabled:opacity-50"
            >
              {qrSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {qrSubmitting ? 'Validation Appwrite…' : 'Valider mon émargement'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
