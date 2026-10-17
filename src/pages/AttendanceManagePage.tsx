import { useState, useEffect } from 'react'
import { IconTile, UniIcon } from '../components/ui/UniIcon'
import { subjectColor } from '../lib/subjectIcon'
import { QRCodeSVG } from 'qrcode.react'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { useUserRole } from '../utils/userRole'
import { cn } from '../utils/cn'
import { attendanceApi, Course, Student, type AttendanceSession } from '../lib/api'
import { ExportButtons } from '../components/exports/ExportButtons'
import { attendanceCourseDocument, attendanceSessionDocument, type AttendanceStatusCode } from '../lib/exports'
import { toAttendanceExportSession } from '../lib/exports/adapters'
import { isOnline } from '../lib/offline/networkStatus'
import { isRetryableReplayError } from '../lib/offline/offlineModel'
import { queueAttendanceRoll } from '../lib/offline/replayHandlers'

type RollStatus = 'Présent' | 'Absent' | 'Late' | 'Excusé'

interface StudentRoll {
  id: string
  name: string
  email: string
  matricule?: string
  status: RollStatus
}

const STATUS_TO_APPWRITE: Record<RollStatus, AttendanceStatusCode> = {
  'Présent': 'PRESENT',
  'Absent': 'ABSENT',
  'Late': 'RETARD',
  'Excusé': 'JUSTIFIE',
}

type ProximityPosition = { latitude: number; longitude: number; accuracy: number }

function requestProximityPosition(): Promise<ProximityPosition> {
  if (!window.isSecureContext || !navigator.geolocation) {
    return Promise.reject(new Error('La vérification de proximité nécessite HTTPS et la géolocalisation du navigateur.'))
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }),
      (positionError) => reject(new Error(positionError.code === positionError.PERMISSION_DENIED ? 'Vous devez autoriser la position pour émettre un QR de présence sécurisé.' : 'La position actuelle est indisponible. Réessayez depuis le lieu de la séance.')),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
    )
  })
}

export default function AttendanceManagePage() {
  const { isOfflineMode, currentUser } = useUserRole()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [students, setStudents] = useState<StudentRoll[]>([])
  const [courseSessions, setCourseSessions] = useState<AttendanceSession[]>([])
  const [showQR, setShowQR] = useState(false)
  const [qrSession, setQrSession] = useState<{ payload: string; expiresAt: string; sessionId: string } | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [pending, setPending] = useState(0)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'appel'|'annonces'>('appel')
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queuedNotice, setQueuedNotice] = useState<string | null>(null)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentEmail, setNewStudentEmail] = useState('')

  const announcements: Array<{ id: string; title: string; desc: string; time: string; type: string }> = []

  // Les cours sont chargés une fois ; la liste d’appel est ensuite résolue par
  // inscription académique pour chaque cours sélectionné.
  useEffect(() => {
    async function loadData() {
      try {
        const { courses: myCourses } = await attendanceApi.bootstrap()

        setCourses(myCourses)
        if (myCourses.length > 0) {
          setSelectedCode(myCourses[0].code)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les cours et les étudiants.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const selectedCourse = courses.find((item) => item.code === selectedCode)
    if (!selectedCourse?.id) {
      setStudents([])
      setCourseSessions([])
      return
    }
    const courseId: string = selectedCourse.id

    let mounted = true
    const statusFromAppwrite: Record<'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE', RollStatus> = {
      PRESENT: 'Présent',
      ABSENT: 'Absent',
      RETARD: 'Late',
      JUSTIFIE: 'Excusé',
    }

    async function loadCourseRoster() {
      setAttendanceLoading(true)
      try {
        const todayKey = new Date().toISOString().slice(0, 10)
        const [enrolledStudents, courseSessions] = await Promise.all([
          attendanceApi.roster(courseId),
          attendanceApi.byCourse(courseId),
        ])
        const todaySession = courseSessions.find((session) => session.date.slice(0, 10) === todayKey)
        if (!mounted) return
        setCourseSessions(courseSessions)
        const persistedStatuses = new Map(todaySession?.records.map((record) => [record.studentId, record.status]) ?? [])
        setStudents(enrolledStudents.map((student) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`.trim(),
          email: student.user?.email || '',
          matricule: student.matricule || undefined,
          status: persistedStatuses.get(student.id)
            ? statusFromAppwrite[persistedStatuses.get(student.id) as keyof typeof statusFromAppwrite]
            : 'Présent',
        })))
      } catch (err) {
        if (mounted) setError(err instanceof Error ? `Le relevé existant reste indisponible : ${err.message}` : 'Le relevé existant reste indisponible.')
      } finally {
        if (mounted) setAttendanceLoading(false)
      }
    }

    loadCourseRoster()
    return () => { mounted = false }
  }, [courses, selectedCode])

  const course = courses.find(c => c.code === selectedCode)
  const present  = students.filter(s => s.status === 'Présent').length
  const absent   = students.filter(s => s.status === 'Absent').length
  const late     = students.filter(s => s.status === 'Late').length
  const excused  = students.filter(s => s.status === 'Excusé').length
  const rate     = students.length > 0 ? Math.round((present / students.length) * 100) : 0

  const setStatus = (id: string, status: RollStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    if (isOfflineMode) setPending(p => p + 1)
  }

  const handleSave = async () => {
    if (!course) return
    const payload = {
      courseId: course.id,
      date: new Date().toISOString(),
      rows: students.map((student) => ({ studentId: student.id, status: STATUS_TO_APPWRITE[student.status] })),
    }
    // Sans réseau (ou en mode hors ligne choisi), la feuille est mise en file
    // d'attente et partira au retour du réseau ; l'ancienne alerte bloquante
    // obligeait à ressaisir tout l'appel plus tard.
    const defer = async () => {
      await queueAttendanceRoll(payload)
      setQueuedNotice('Feuille du jour mise en attente : elle sera enregistrée automatiquement au retour du réseau.')
      setSaved(true)
      setPending(0)
      setTimeout(() => setSaved(false), 3500)
    }
    setSaving(true)
    setError(null)
    setQueuedNotice(null)
    try {
      if (isOfflineMode || !isOnline()) {
        await defer()
        return
      }
      await attendanceApi.saveTodayRoll(payload)
      setSaved(true)
      setPending(0)
      setTimeout(() => setSaved(false), 3500)
    } catch (err) {
      const shape = { status: typeof (err as { status?: unknown })?.status === 'number' ? (err as { status: number }).status : undefined, message: err instanceof Error ? err.message : String(err) }
      if (isRetryableReplayError(shape, isOnline())) {
        await defer()
      } else {
        setError(`Erreur lors de la validation Appwrite : ${err instanceof Error ? err.message : 'échec inconnu.'}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateQr = async () => {
    if (!course || isOfflineMode) return
    setQrLoading(true)
    setError(null)
    try {
      const origin = await requestProximityPosition()
      const opened = await attendanceApi.openQrSession({ courseId: course.id, origin })
      setQrSession({ payload: opened.payload, expiresAt: opened.expiresAt, sessionId: opened.sessionId })
      setShowQR(true)
    } catch (err) {
      setError(`Impossible de générer le QR Appwrite : ${err instanceof Error ? err.message : 'échec inconnu.'}`)
    } finally {
      setQrLoading(false)
    }
  }

  const exportContext = { institution: undefined, program: course?.program, level: course?.level }
  // La liste du jour exporte l'appel tel qu'affiché, même non encore validé :
  // c'est la feuille que le délégué fait signer en salle, avant l'enregistrement.
  const todayRollExport = () => (course && students.length
    ? attendanceSessionDocument({
      id: 'today',
      date: new Date().toISOString(),
      courseCode: course.code,
      courseName: course.name,
      teacherName: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}`.trim() : undefined,
      records: students.map((student) => ({ studentId: student.id, studentName: student.name, matricule: student.matricule, status: STATUS_TO_APPWRITE[student.status] })),
    }, exportContext)
    : null)
  const recordedSessions = courseSessions.filter((session) => session.records.length > 0)
  const courseHistoryExport = () => (recordedSessions.length ? attendanceCourseDocument(recordedSessions.map((session) => toAttendanceExportSession(session)), exportContext) : null)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <UniIcon name="spinner" weight="bold" size={32} className="animate-spin text-[#1e3a8a]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
      {queuedNotice && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">{queuedNotice}</div>}

      {/* =========================================================================
          HERO BENTO - Gestion des présences
         ========================================================================= */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-semibold text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <UniIcon name="megaphone" weight="fill" size={14} /> ESPACE DÉLÉGUÉ / ENSEIGNANT
            </span>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Gestion des présences</h1>
              <p className="text-sm sm:text-base text-slate-200/90 mt-1.5 leading-relaxed">
                {currentUser.name} · {currentUser.status} · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Micro-cartes Bento de statistiques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Cours gérés</span>
                <span className="text-2xl font-black text-white">{courses.length}</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">{course?.code || 'Aucun sélectionné'}</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Effectif inscrit</span>
                <span className="text-2xl font-black text-white">{students.length}</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5 font-medium">{present} présents · {absent} absents</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Taux du jour</span>
                <span className="text-2xl font-black text-emerald-300">{rate}%</span>
                <span className="text-[10px] text-slate-200 block mt-0.5 font-medium">Seuil requis ≥75%</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Séances archivées</span>
                <span className="text-2xl font-black text-white">{recordedSessions.length}</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">Synchronisation Appwrite</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {course && (
                <button onClick={handleGenerateQr} disabled={qrLoading || isOfflineMode}
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-[#1E3A8A] px-4 py-2.5 text-xs font-bold shadow-md hover:bg-cyan-50 transition-all disabled:opacity-50 cursor-pointer">
                  {qrLoading ? <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> : <UniIcon name="attendance" weight="bold" size={16} />}
                  {qrLoading ? 'Création Appwrite…' : 'Générer QR'}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <img
                src="/icons/nav/attendance.png"
                alt="Illustration 3D Présences"
                className="relative z-10 w-40 sm:w-52 lg:w-60 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = '/illustrations/uni_copilot_3d.png' }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-3xl border border-slate-200/80 bg-white px-6 py-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">Feuille du jour</span>
          <ExportButtons getDocument={todayRollExport} disabled={attendanceLoading || students.length === 0} disabledReason="Aucun étudiant inscrit à ce cours." />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">Historique du cours ({recordedSessions.length} séance{recordedSessions.length > 1 ? 's' : ''})</span>
          <ExportButtons getDocument={courseHistoryExport} disabled={attendanceLoading || recordedSessions.length === 0} disabledReason="Aucune séance enregistrée pour ce cours." />
        </div>
      </div>

      {/* Offline / Online banner */}
      {isOfflineMode ? (
        <div className="flex items-start gap-3 rounded-3xl bg-amber-50 border border-amber-200 p-4 text-amber-800 shadow-sm">
          <UniIcon name="warning" weight="fill" size={20} className="text-amber-500 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Mode hors ligne</p>
            <p className="text-xs mt-0.5">La consultation reste limitée aux données déjà chargées. La feuille du jour validée est mise en attente et partira au retour du réseau ; le QR de présence, lui, exige une connexion.</p>
          </div>
          {pending > 0 && (
            <button onClick={() => setPending(0)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 px-3 py-1.5 text-xs font-bold text-amber-900 shrink-0">
              <UniIcon name="refresh" weight="bold" size={14} /> Sync ({pending})
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 shadow-sm">
          <UniIcon name="wifi" weight="fill" size={20} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-medium">Mode connecté — les présences sont lues et enregistrées directement dans Appwrite.</p>
        </div>
      )}

      {/* Saved toast */}
      {saved && (
        <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in">
          <UniIcon name="success" weight="fill" size={16} className="text-emerald-400" />
          {queuedNotice ? 'Feuille du jour mise en attente d’envoi.' : 'Présences enregistrées dans Appwrite.'}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200/80">
        {[{id:'appel',label:'Appel de présence'},{id:'annonces',label:'Annonces cohorte'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${activeTab === t.id ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-[#6b7280] hover:text-[#374151]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'appel' && (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Course selector */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all">
            <h2 className="text-sm font-bold text-[#111827] mb-3">1. Sélection du cours</h2>
            {courses.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun cours disponible.</p>
            ) : (
              <div className="space-y-2.5">
                {courses.map(c => (
                  <button key={c.code} onClick={() => setSelectedCode(c.code)}
                    className={cn('w-full text-left rounded-2xl border p-3.5 text-sm transition-all', selectedCode === c.code ? 'border-[#1e3a8a] bg-[#f0f4ff] shadow-xs' : 'border-slate-200/80 hover:bg-[#f9fafb]')}>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 font-bold text-[#111827]"><IconTile subject={c.name} subjectCode={c.code} color={subjectColor(c.code)} variant={selectedCode === c.code ? 'filled' : 'soft'} size={36} />{c.code}</span>
                      <Badge variant="neutral">{c.classroom?.name || 'Salle N/A'}</Badge>
                    </div>
                    <p className="font-medium text-[#374151] mt-0.5 truncate">{c.name}</p>
                    <div className="flex justify-between text-xs text-[#9ca3af] mt-1">
                      <span className="flex items-center gap-1"><UniIcon name="teacher" size={12} /> {c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'N/A'}</span>
                      <span className="flex items-center gap-1 font-semibold text-[#1e3a8a]"><UniIcon name="time" size={12} /> {c.hours}h</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* KPIs + table */}
          <div className="lg:col-span-2 space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Présents',  val: present, color: 'text-[#059669]', bg: 'bg-[#d1fae5]' },
                { label: 'Absents',   val: absent,  color: 'text-[#dc2626]', bg: 'bg-[#fee2e2]' },
                { label: 'Retards',   val: late,    color: 'text-[#d97706]', bg: 'bg-[#fef3c7]' },
                { label: 'Excusés',   val: excused, color: 'text-[#7c3aed]', bg: 'bg-[#ede9fe]' },
              ].map(k => (
                <div key={k.label} className={`rounded-3xl p-4 ${k.bg} border border-slate-200/40 shadow-sm hover:shadow-md transition-all`}>
                  <p className={`text-2xl font-extrabold ${k.color}`}>{k.val}</p>
                  <p className="text-xs font-medium text-[#374151] mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>
            {/* Rate bar */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#111827]">Taux de présence</span>
                <span className="text-2xl font-extrabold text-[#0d9488]">{rate}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#f3f4f6] overflow-hidden">
                <div className="h-full rounded-full bg-[#0d9488] transition-all" style={{ width: `${rate}%` }} />
              </div>
              <p className="text-xs text-[#9ca3af] mt-1.5">Seuil requis : ≥75% · {students.length} étudiants</p>
            </div>

            {/* Roll call table */}
            {course ? (
              <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#f3f4f6] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-[#111827]">2. Liste d'appel — {course.code}</h3>
                    <span className="text-xs text-[#9ca3af]">{students.length} étudiants</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddStudent((prev) => !prev)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#e0f2fe] px-3 py-1.5 text-xs font-bold text-[#0369a1] hover:bg-[#bae6fd] transition-colors"
                  >
                    <UniIcon name="user" size={14} />
                    {showAddStudent ? 'Fermer la saisie' : '+ Ajouter un participant libre'}
                  </button>
                </div>

                {showAddStudent && (
                  <div className="p-4 bg-[#f8fafc] border-b border-slate-200/80 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Nom complet de l'apprenant"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                    />
                    <input
                      type="email"
                      placeholder="Email ou identifiant"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newStudentName.trim()) return
                        const newEntry: StudentRoll = {
                          id: `ext-${Date.now().toString(36)}`,
                          name: newStudentName.trim(),
                          email: newStudentEmail.trim() || 'participant@libre.local',
                          matricule: `IND-${Math.floor(1000 + Math.random() * 9000)}`,
                          status: 'Présent',
                        }
                        setStudents((curr) => [...curr, newEntry])
                        setNewStudentName('')
                        setNewStudentEmail('')
                        setShowAddStudent(false)
                        setPending((p) => p + 1)
                      }}
                      className="rounded-xl bg-[#1e3a8a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2d4fa8]"
                    >
                      Ajouter à l'appel
                    </button>
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead className="border-b border-[#f3f4f6]">
                    <tr>
                      {['Étudiant','Matricule','Présent','Absent','Retard','Excusé'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f9fafb]">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-[#f9fafb]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={s.name} size="sm" />
                            <div>
                              <p className="font-semibold text-[#111827]">{s.name}</p>
                              <p className="text-xs text-[#9ca3af] font-mono">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">{s.id}</td>
                        {(['Présent','Absent','Late','Excusé'] as RollStatus[]).map(st => (
                          <td key={st} className="px-4 py-3 text-center">
                            <button onClick={() => setStatus(s.id, st)}
                              className={cn('flex h-7 w-7 items-center justify-center rounded-full border mx-auto transition-all',
                                s.status === st
                                  ? st === 'Présent' ? 'bg-emerald-500 border-emerald-600 text-white'
                                    : st === 'Absent' ? 'bg-red-500 border-red-600 text-white'
                                    : st === 'Late' ? 'bg-amber-500 border-amber-600 text-white'
                                    : 'bg-purple-600 border-purple-700 text-white'
                                  : 'border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] text-[#d1d5db]'
                              )}>
                              {st === 'Présent' ? <UniIcon name="check" weight="bold" size={14} />
                                : st === 'Absent' ? <UniIcon name="close" weight="bold" size={14} />
                                : st === 'Late' ? <UniIcon name="time" weight="bold" size={14} />
                                : <span className="text-[10px] font-bold">E</span>}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-4 border-t border-[#f3f4f6] bg-[#f9fafb] flex items-center justify-between gap-4">
                  <p className="text-xs text-[#9ca3af] flex items-center gap-1.5">
                    <UniIcon name="help" size={16} /> Les absences sont persistées dans Appwrite ; les notifications distantes exigent un fournisseur FCM configuré.
                  </p>
                  <button onClick={handleSave} disabled={saving || attendanceLoading || !course}
                    className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors disabled:opacity-50">
                    {saving || attendanceLoading ? <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> : <UniIcon name="attendance" weight="bold" size={16} />}
                    {attendanceLoading ? 'Chargement du relevé…' : saving ? 'Sauvegarde Appwrite…' : 'Valider et sauvegarder'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all text-center text-gray-500">
                Sélectionnez un cours à gauche pour faire l'appel.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'annonces' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#111827]">Annonces de la cohorte</h2>
            <button className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d4fa8]">
              <UniIcon name="megaphone" weight="bold" size={16} /> Nouvelle annonce
            </button>
          </div>
          {announcements.map(a => (
            <div key={a.id} className={`rounded-3xl border p-5 ${a.type === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-slate-200/80 bg-white'} shadow-sm hover:shadow-md transition-all`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-semibold text-[#111827]">{a.title}</h3>
                <span className="text-xs text-[#9ca3af]">{a.time}</span>
              </div>
              <p className="text-sm text-[#374151]">{a.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {showQR && course && qrSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-[#111827]">Jeton QR de présence</span>
              <button onClick={() => { setShowQR(false); setQrSession(null) }} aria-label="Fermer" className="rounded-lg p-1.5 hover:bg-[#f3f4f6] text-[#9ca3af]"><UniIcon name="close" weight="bold" size={20} /></button>
            </div>
            <p className="text-xs text-[#6b7280] mb-4">{course.code} · {course.classroom?.name || 'Salle N/A'} · {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'N/A'}</p>
            <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-3">
              <QRCodeSVG value={qrSession.payload} size={184} level="M" includeMargin aria-label="QR d’émargement UniFlow" />
            </div>
            <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-left text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <UniIcon name="time" weight="fill" size={14} className="shrink-0" /> Jeton Appwrite actif jusqu’à {new Date(qrSession.expiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. Un apprenant inscrit ne peut émarger qu’une fois.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => { setShowQR(false); setQrSession(null) }} className="rounded-xl border border-slate-200/80 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">Fermer</button>
              <button onClick={() => navigator.clipboard?.writeText(qrSession.payload)} className="rounded-xl bg-[#1e3a8a] py-2 text-sm font-semibold text-white flex items-center justify-center gap-1.5 hover:bg-[#2d4fa8]">
                <UniIcon name="download" weight="bold" size={16} /> Copier le jeton
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
