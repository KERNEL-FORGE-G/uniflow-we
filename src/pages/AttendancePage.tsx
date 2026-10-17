import { useEffect, useRef, useState } from 'react'
import { SubjectIcon, UniIcon } from '../components/ui/UniIcon'
import { darkenHex, subjectColor } from '../lib/subjectIcon'
import { Badge } from '../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { useApi } from '../hooks/useApi'
import { attendanceApi, coursesApi, type AttendanceSession, type Course } from '../lib/api'

function statusIcon(s: string) {
  if (s === 'PRESENT')  return <UniIcon name="success" weight="fill" size={16} className="text-emerald-500" />
  if (s === 'ABSENT')   return <UniIcon name="error" weight="fill" size={16} className="text-red-500" />
  return <UniIcon name="time" weight="fill" size={16} className="text-amber-500" />
}
function statusBadge(s: string) {
  if (s === 'PRESENT')  return <Badge variant="success">Présent</Badge>
  if (s === 'ABSENT')   return <Badge variant="danger">Absent</Badge>
  if (s === 'RETARD')   return <Badge variant="warning">Retard</Badge>
  return <Badge variant="primary">Justifié</Badge>
}

type ProximityPosition = { latitude: number; longitude: number; accuracy: number }

function requestProximityPosition(): Promise<ProximityPosition> {
  if (!window.isSecureContext || !navigator.geolocation) {
    return Promise.reject(new Error('La vérification de proximité nécessite HTTPS et la géolocalisation du navigateur.'))
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }),
      (positionError) => reject(new Error(positionError.code === positionError.PERMISSION_DENIED ? 'La position est requise pour cet émargement QR. Aucun relevé n’a été créé.' : 'La position actuelle est indisponible. Réessayez depuis le lieu de la séance.')),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
    )
  })
}

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
  const { data: courses, loading: lCourses, error: eCourses, refetch } = useApi(() => coursesApi.mine(), [], { key: 'courses.mine' })

  // Sessions pour le cours sélectionné
  const { data: sessions, loading: lSessions } = useApi(
    () => selectedCourse ? attendanceApi.byCourse(selectedCourse) : Promise.resolve(null),
    [selectedCourse],
    { key: 'attendance.byCourse' },
  )

  // Stats globales calculées depuis toutes les sessions
  const { data: allSessions } = useApi(() =>
    courses
      ? Promise.all((courses as Course[]).map(c => attendanceApi.byCourse(c.id).catch(() => [] as AttendanceSession[])))
        .then(res => res.flat())
      : Promise.resolve([] as AttendanceSession[]),
    [courses?.length, refreshKey],
    { key: 'attendance.allSessions' },
  )

  const submitQr = async (value: string) => {
    if (!value.trim() || qrSubmitting) return
    setQrSubmitting(true)
    setQrError(null)
    try {
      const position = await requestProximityPosition()
      const result = await attendanceApi.scan({ qrCode: value.trim(), position })
      const proximity = typeof result.distanceMeters === 'number' ? ` Proximité vérifiée à ${result.distanceMeters} m.` : ''
      setQrStatus(result.alreadyRecorded ? `Votre émargement était déjà enregistré pour cette séance.${proximity}` : `Émargement sécurisé enregistré dans Appwrite.${proximity}`)
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
      <UniIcon name="alert" size={48} className="text-red-400" />
      <p className="text-sm text-[#6b7280]">{eCourses}</p>
      <button onClick={refetch} className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white">
        <UniIcon name="refresh" weight="bold" size={16} /> Réessayer
      </button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-800">
      {/* =========================================================================
          HERO BENTO - Design EdTech 2026 (Pointage Électronique & QR Certifié)
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Pointage Biométrique & QR Code de Proximité · UY1
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Mes présences
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-200/90 max-w-2xl leading-relaxed">
                Suivi personnel d'assiduité par matière · le scan QR vérifie votre proximité en amphithéâtre et certifie votre présence dans Appwrite.
              </p>
            </div>

            {/* Micro-Bento Métriques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Taux Global</span>
                <span className="text-2xl font-black text-emerald-300">{globalRate}%</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">Assiduité semestrielle</span>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Présences</span>
                <span className="text-2xl font-black text-white">{totalPresent}</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5 font-medium">Séances validées</span>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Absences</span>
                <span className="text-2xl font-black text-rose-300">{totalAbsent}</span>
                <span className="text-[10px] text-slate-300 block mt-0.5 font-medium">Séances manquées</span>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Retards</span>
                <span className="text-2xl font-black text-amber-300">{totalLate}</span>
                <span className="text-[10px] text-amber-200 block mt-0.5 font-medium">Pointages tardifs</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => { setQrStatus(null); setQrError(null); setQrValue(''); setShowQR(true) }}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 hover:bg-emerald-300 px-5 py-2.5 text-sm font-black text-slate-950 shadow-lg transition-all cursor-pointer"
              >
                <UniIcon name="attendance" weight="bold" size={18} /> Scanner QR
              </button>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-xs font-bold text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              >
                <UniIcon name="refresh" weight="bold" size={16} /> Actualiser
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <img
                src="/icons/nav/attendance.png"
                alt="Pointage QR 3D"
                className="relative z-10 w-40 sm:w-48 lg:w-56 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = '/illustrations/presence.jpg' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* KPI Bento Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4">
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
            <p className="text-2xl font-black text-slate-900">{globalRate}%</p>
            <p className="text-xs font-semibold text-slate-500">Taux global</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-2xl font-black text-emerald-600">{totalPresent}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Présences totales</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-2xl font-black text-red-600">{totalAbsent}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Absences totales</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-2xl font-black text-amber-600">{totalLate}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Retards</p>
        </div>
      </div>

      {/* Présences par cours */}
      <div className="grid gap-5 sm:grid-cols-2">
        {(courses ?? []).map((course: Course) => {
          const courseSessions = (allSessions ?? []).filter((s: AttendanceSession) => s.courseId === course.id)
          const records = courseSessions.flatMap((s: AttendanceSession) => s.records ?? [])
          const present = records.filter(r => r.status === 'PRESENT').length
          const absent  = records.filter(r => r.status === 'ABSENT').length
          const late    = records.filter(r => r.status === 'RETARD').length
          const tot = records.length || 1
          const rate = Math.round((present / tot) * 100)
          const color = subjectColor(course.code)
          const teacherName = course.teacher
            ? `${course.teacher.firstName} ${course.teacher.lastName}`
            : ''

          return (
            <div key={course.id} className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden hover:shadow-lg transition-all">
              <div className="p-5 text-white" style={{ backgroundImage: `linear-gradient(135deg, ${color} 0%, ${darkenHex(color, 0.3)} 100%)` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold"><SubjectIcon subject={course.name} code={course.code} weight="fill" size={14} />{course.code}</span>
                    <h3 className="text-base font-extrabold">{course.name}</h3>
                    <p className="text-xs opacity-85 mt-0.5">{teacherName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black">{rate}%</div>
                    <p className="text-xs opacity-75">Assiduité</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-2.5">
                    <UniIcon name="success" weight="fill" size={16} className="text-emerald-600 mx-auto mb-0.5" />
                    <p className="text-lg font-black text-emerald-900">{present}</p>
                    <p className="text-[10px] font-bold text-emerald-600">Présent</p>
                  </div>
                  <div className="rounded-2xl bg-red-50 border border-red-200/80 p-2.5">
                    <UniIcon name="error" weight="fill" size={16} className="text-red-600 mx-auto mb-0.5" />
                    <p className="text-lg font-black text-red-900">{absent}</p>
                    <p className="text-[10px] font-bold text-red-600">Absent</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-2.5">
                    <UniIcon name="time" weight="fill" size={16} className="text-amber-600 mx-auto mb-0.5" />
                    <p className="text-lg font-black text-amber-900">{late}</p>
                    <p className="text-[10px] font-bold text-amber-600">Retard</p>
                  </div>
                </div>

                {/* Dernières sessions */}
                {courseSessions.slice(-3).map((s: AttendanceSession) => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <UniIcon name="agenda" size={14} />
                      {new Date(s.date).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
                    </span>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const myRecord = (s.records ?? []).find(r => r.status)
                        return myRecord ? (
                          <>{statusIcon(myRecord.status)} {statusBadge(myRecord.status)}</>
                        ) : <span className="text-slate-400">—</span>
                      })()}
                    </div>
                  </div>
                ))}

                <button onClick={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                  {selectedCourse === course.id ? 'Masquer' : 'Voir tout l\'historique'}
                </button>

                {selectedCourse === course.id && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {lSessions ? (
                      <div className="h-8 rounded-xl bg-slate-100 animate-pulse" />
                    ) : (sessions ?? []).map((s: AttendanceSession) => (
                      <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                        <span className="text-slate-600 font-medium">
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
            <UniIcon name="stats" size={16} className="text-[#1e3a8a]" /> Taux par matière
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQR(false)}
              aria-label="Fermer"
              className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <UniIcon name="close" weight="bold" size={20} />
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
              {qrSubmitting ? <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> : <UniIcon name="camera" weight="fill" size={16} />}
              {qrSubmitting ? 'Validation Appwrite…' : 'Valider mon émargement'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
