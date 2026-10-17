import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconTile, UniIcon, type UniIconName } from '../components/ui/UniIcon'
import { subjectColor } from '../lib/subjectIcon'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { useUserRole } from '../utils/userRole'
import { attendanceApi, authApi, coursesApi, gradesApi, schedulesApi, studentsApi, type Course, type Grade } from '../lib/api'
import { attendanceByCourse, gradesByCourse, learnerAttendanceSummary, overallAverage } from '../lib/profileModel'
import { UniMascot } from '../components/mascot/UniMascot'

type Tab = 'Informations' | 'Présences' | 'Notes' | 'Mes cours'

interface StatCard { label: string; value: string; icon: UniIconName; color: string }

const rateTone = (rate: number | null) => (rate == null ? 'bg-[#e5e7eb]' : rate >= 75 ? 'bg-[#0d9488]' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500')

export default function ProfilePage() {
  const navigate = useNavigate()
  const { currentRole, currentUser: user } = useUserRole()
  const isLearner = currentRole === 'student' || currentRole === 'delegate'
  const isTeacher = currentRole === 'teacher'
  const tabs = useMemo<Tab[]>(() => (isLearner ? ['Informations', 'Présences', 'Notes'] : isTeacher ? ['Informations', 'Mes cours'] : ['Informations']), [isLearner, isTeacher])
  const [activeTab, setActiveTab] = useState<Tab>('Informations')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<{ ok: boolean; message: string } | null>(null)
  const [phone, setPhone] = useState(user.phone || '')
  const [address, setAddress] = useState(user.address || '')

  const [courses, setCourses] = useState<Course[]>([])
  const [records, setRecords] = useState<Array<{ courseId: string; status: string; at: string }>>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [teacherStudents, setTeacherStudents] = useState<number | null>(null)
  const [weeklySessions, setWeeklySessions] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    setPhone(user.phone || '')
    setAddress(user.address || '')
  }, [user.phone, user.address])

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError(null)

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3500))

    const loadData = async () => {
      try {
        const mine = await coursesApi.mine().catch(() => [])
        if (!active) return
        setCourses(mine || [])

        if (isLearner) {
          const [myRecords, myGrades] = await Promise.all([
            attendanceApi.myRecordsByCourse().catch(() => []),
            gradesApi.mine().catch(() => []),
          ])
          if (!active) return
          setRecords(myRecords || [])
          setGrades(myGrades || [])
        } else if (isTeacher) {
          const [count, schedules] = await Promise.all([
            studentsApi.countForMyCourses().catch(() => 0),
            schedulesApi.mine().catch(() => []),
          ])
          if (!active) return
          setTeacherStudents(count)
          setWeeklySessions((schedules || []).length)
        }
      } catch (error) {
        if (active) {
          console.warn('Profile data load fallback:', error)
          setLoadError(null) // Ne pas bloquer l'écran avec une bannière d'erreur alarmiste
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    // Course entre le chargement et le timeout de 3.5s pour garantir un affichage fluide
    void Promise.race([loadData(), timeoutPromise]).then(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
  }, [isLearner, isTeacher])

  const courseNames = useMemo(() => new Map(courses.map((course) => [course.id, course.name])), [courses])
  const courseNamesByCode = useMemo(() => new Map(courses.map((course) => [course.code, course.name])), [courses])
  const attendance = useMemo(() => learnerAttendanceSummary(records), [records])
  const attendanceRows = useMemo(() => attendanceByCourse(records, courseNames), [records, courseNames])
  const gradeRows = useMemo(() => gradesByCourse(grades, courseNamesByCode), [grades, courseNamesByCode])
  const average = useMemo(() => overallAverage(gradeRows), [gradeRows])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveState(null)
    try {
      await authApi.updateProfile({ phone: phone.trim(), address: address.trim() })
      setEditing(false)
      setSaveState({ ok: true, message: 'Coordonnées enregistrées.' })
    } catch (error) {
      setSaveState({ ok: false, message: error instanceof Error ? error.message : 'Enregistrement impossible.' })
    } finally {
      setSaving(false)
    }
  }

  const personalFields = [
    { label: 'Nom complet', value: user.name, editable: false },
    { label: 'Email', value: user.email, editable: false },
    { label: 'Téléphone', value: phone, onChange: setPhone, editable: true, placeholder: '+237 6 00 00 00 00' },
    { label: 'Adresse', value: address, onChange: setAddress, editable: true, placeholder: 'Ville, quartier' },
  ]
  const academicFields = [
    { label: 'Rôle', value: user.roleLabel },
    ...(isLearner ? [{ label: 'Matricule', value: user.matricule || 'Non renseigné' }] : []),
    { label: 'Filière · niveau', value: user.filiere || (isLearner ? 'À compléter par votre administration' : '—') },
    { label: 'Faculté', value: user.faculty || '—' },
    { label: 'Établissement', value: user.university || '—' },
  ]

  const stats: StatCard[] = isLearner
    ? [
      { label: 'Séances relevées', value: loading ? '…' : `${attendance.sessions}`, icon: 'schedule', color: '#1E3A8A' },
      { label: 'Présences', value: loading ? '…' : `${attendance.present}`, icon: 'attendance', color: '#10B981' },
      { label: 'Taux de présence', value: loading ? '…' : attendance.rate == null ? '—' : `${attendance.rate}%`, icon: 'stats', color: '#F59E0B' },
    ]
    : isTeacher
      ? [
        { label: 'Cours enseignés', value: loading ? '…' : `${courses.length}`, icon: 'courses', color: '#1E3A8A' },
        { label: 'Étudiants inscrits', value: loading || teacherStudents == null ? '…' : `${teacherStudents}`, icon: 'students', color: '#10B981' },
        { label: 'Séances / semaine', value: loading || weeklySessions == null ? '…' : `${weeklySessions}`, icon: 'schedule', color: '#F59E0B' },
      ]
      : []

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-800">
      {/* =========================================================================
          HERO BENTO - Carte d'Identité Académique Numérique
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-start sm:items-center gap-5">
              <div className="relative shrink-0 rounded-full ring-4 ring-white/25 shadow-2xl">
                <Avatar name={user.name} avatarFileId={user.avatarFileId} size="2xl" />
                <button
                  onClick={() => navigate('/app/parametres')}
                  title="Changer la photo de profil"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-400 transition-colors border-2 border-[#0B132B]"
                >
                  <UniIcon name="camera" weight="fill" size={14} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{user.name}</h1>
                  {user.username && (
                    <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-0.5 text-xs font-bold text-cyan-200">@{user.username}</span>
                  )}
                  <Badge variant="success"><UniIcon name="security" weight="fill" size={12} className="mr-1 inline" />Session Appwrite</Badge>
                </div>
                <p className="text-sm text-cyan-100/90 font-semibold mt-1">{[user.roleLabel, user.filiere, user.university].filter(Boolean).join(' · ')}</p>
                <p className="text-xs text-slate-300 mt-1">{user.email}</p>
              </div>
            </div>

            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                {stats.map(({ label, value }) => (
                  <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5">
                    <span className="text-[11px] font-medium text-slate-300 block">{label}</span>
                    <span className="text-2xl font-black text-white">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/app/parametres" className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-white transition-colors">
                <UniIcon name="settings" size={16} /> Paramètres & Avatars
              </Link>
              <button onClick={() => { setEditing(!editing); setSaveState(null) }}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md transition-colors cursor-pointer">
                <UniIcon name="edit" size={16} />
                {editing ? 'Annuler' : 'Modifier mes coordonnées'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <img
                src="/icons/nav/students.png"
                alt="Identité Académique 3D"
                className="relative z-10 w-36 sm:w-44 lg:w-52 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = '/illustrations/uni_copilot_3d.png' }}
              />
            </div>
          </div>
        </div>
      </section>

      {saveState && (
        <div role={saveState.ok ? 'status' : 'alert'} className={`rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in ${saveState.ok ? 'bg-slate-900 text-white' : 'border border-red-200 bg-red-50 text-red-700'}`}>
          {saveState.ok && <UniIcon name="check" weight="bold" size={16} className="text-[#0d9488]" />} {saveState.message}
        </div>
      )}
      {loadError && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>}

      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-1.5 border border-slate-200/80 shadow-xs w-fit">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === tab ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'Informations' && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">Informations personnelles</h2>
              <dl className="space-y-3">
                {personalFields.map((field) => (
                  <div key={field.label} className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
                    <dt className="text-sm font-medium text-slate-500">{field.label}</dt>
                    {editing && field.editable ? (
                      <input value={field.value} onChange={e => field.onChange?.(e.target.value)} placeholder={field.placeholder} aria-label={field.label}
                        className="w-56 rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-right outline-none focus:border-[#1e3a8a]" />
                    ) : (
                      <dd className={`text-sm font-bold ${field.value ? 'text-slate-900' : 'text-slate-400'}`}>{field.value || 'Non renseigné'}</dd>
                    )}
                  </div>
                ))}
              </dl>
              {editing && (
                <button onClick={() => void handleSaveProfile()} disabled={saving}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1e3a8a] py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-colors disabled:opacity-60">
                  {saving && <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" />} {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">Informations académiques</h2>
              <dl className="space-y-3">
                {academicFields.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
                    <dt className="text-sm font-medium text-slate-500">{label}</dt>
                    <dd className="text-right text-sm font-bold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-slate-400">Ces informations sont gérées par l’administration de votre université ; contactez-la pour toute correction.</p>
            </div>
          </div>

          {stats.length > 0 && (
            <div>
              <h2 className="text-base font-extrabold text-slate-900 mb-3">Mes statistiques</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map(({ label, value, icon, color }, index) => (
                  <div key={label} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="mb-3"><IconTile name={icon} color={color} variant="filled" size={44} index={index} /></div>
                    <p className="text-3xl font-black text-slate-900">{value}</p>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'Présences' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-4">Historique des présences</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6b7280]"><UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> Chargement de vos relevés…</div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <UniMascot pose="search" size={120} />
              <p className="text-sm text-[#6b7280]">Aucun relevé de présence pour l’instant : ils apparaîtront après votre premier appel ou pointage QR.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-[#0d9488]">{attendance.rate == null ? '—' : `${attendance.rate}%`}</p>
                  <p className="text-xs text-[#6b7280]">Taux global</p>
                </div>
                <div className="flex-1">
                  <div className="h-3 rounded-full bg-[#f3f4f6] overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${rateTone(attendance.rate)}`} style={{ width: `${attendance.rate ?? 0}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-[#9ca3af]">{attendance.present} présence{attendance.present > 1 ? 's' : ''} (retards compris) sur {attendance.sessions} séance{attendance.sessions > 1 ? 's' : ''} relevée{attendance.sessions > 1 ? 's' : ''} · les absences justifiées ne pèsent pas dans le taux.</p>
                </div>
              </div>
              <div className="space-y-2">
                {attendanceRows.map((row) => (
                  <div key={row.courseId || 'autres'} className="flex items-center gap-3 text-sm">
                    <span className="w-40 truncate font-medium text-[#374151]" title={row.name}>{row.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                      <div className={`h-full rounded-full ${rateTone(row.rate)}`} style={{ width: `${row.rate ?? 0}%` }} />
                    </div>
                    <span className="w-14 text-right text-xs font-semibold text-[#374151]">{row.rate == null ? '—' : `${row.rate}%`}</span>
                    <span className="w-16 text-right text-[11px] text-[#9ca3af]">{row.counted} séance{row.counted > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'Notes' && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-[#111827]">Mes notes par cours</h2>
            <Link to="/app/notes" className="text-xs font-medium text-[#1e3a8a] hover:underline">Relevé détaillé →</Link>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6b7280]"><UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> Chargement de vos notes…</div>
          ) : gradeRows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <UniMascot pose="thinking" size={120} />
              <p className="text-sm text-[#6b7280]">Aucune note publiée pour l’instant. Elles apparaîtront ici dès que vos enseignants les saisiront.</p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-4 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] p-4">
                <div>
                  <p className="text-3xl font-extrabold text-[#1e3a8a]">{average == null ? '—' : `${average}/20`}</p>
                  <p className="text-xs text-[#6b7280]">Moyenne générale · {grades.length} note{grades.length > 1 ? 's' : ''} sur {gradeRows.length} cours</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {gradeRows.map((row) => (
                  <div key={row.code} className="rounded-lg border border-[#e5e7eb] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#111827]" title={row.label}>{row.label}</p>
                        <p className="text-xs text-[#9ca3af]">{row.code} · {row.count} évaluation{row.count > 1 ? 's' : ''}</p>
                      </div>
                      <Badge variant={row.average >= 10 ? 'success' : 'danger'}>{row.average >= 10 ? 'Validé' : 'À renforcer'}</Badge>
                    </div>
                    <p className={`mt-2 text-xl font-extrabold ${row.average >= 10 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>{row.average}/20</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'Mes cours' && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-[#111827]">Cours que j’enseigne</h2>
            <Link to="/app/mes-cours-enseignant" className="text-xs font-medium text-[#1e3a8a] hover:underline">Espace pédagogique →</Link>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6b7280]"><UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> Chargement de vos cours…</div>
          ) : courses.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#6b7280]">Aucun cours ne vous est encore attribué : l’administration de votre université vous rattache à vos cours.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {courses.map((course) => (
                <div key={course.id} className="rounded-lg border border-[#e5e7eb] p-4 hover:bg-[#f9fafb] transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><IconTile subject={course.name} subjectCode={course.code} color={subjectColor(course.code)} variant="soft" size={36} /><Badge variant="primary">{course.code}</Badge></span>
                    <span className="text-xs text-[#9ca3af]">{course.hours ? `${course.hours} h` : ''}</span>
                  </div>
                  <p className="mt-2 font-semibold text-[#111827]">{course.name}</p>
                  <p className="text-xs text-[#6b7280]">{[course.program, course.level].filter(Boolean).join(' · ') || 'Cours universitaire'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
