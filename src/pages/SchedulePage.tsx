import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Building2,
  FileText,
  Filter,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Play,
  Video,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import { Query } from 'appwrite'
import { useUserRole } from '../utils/userRole'
import { appwriteDatabases, APPWRITE_DATABASE_ID } from '../lib/appwrite'
import { REAL_UY1_PROGRAMS, REAL_UY1_SCHEDULES, RealScheduleSlot } from '../data/realTimetablesUY1'
import { TIMETABLE_SCANS, getScanUrl } from '../data/timetableScans'
import IndependentSchedulePage from './independent/IndependentSchedulePage'

const DAYS: Array<'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi'> = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
]

export default function SchedulePage() {
  const navigate = useNavigate()
  const { authUser: user, currentUser, currentRole } = useUserRole()

  // Détection du statut d'administrateur
  const isAdmin = currentRole === 'admin' || user?.role === 'ADMIN' || Boolean(user?.isSuperAdmin)

  // Mode principal : Universitaire officiel vs Personnel
  const [tabMode, setTabMode] = useState<'UNIVERSITY' | 'PERSONAL'>('UNIVERSITY')

  // Résolution stricte de la filière et du niveau de l'étudiant / délégué connecté
  const userProgramRaw = (user?.program || currentUser?.program || (user as any)?.student?.specialty || currentUser?.filiere || '').trim()
  const detectedProgram = useMemo(() => {
    if (!userProgramRaw) return 'ICT4D'
    const found = REAL_UY1_PROGRAMS.find(
      (p) => p.code.toLowerCase() === userProgramRaw.toLowerCase() || userProgramRaw.toLowerCase().includes(p.code.toLowerCase())
    )
    return found ? found.code : userProgramRaw.toUpperCase()
  }, [userProgramRaw])

  const userLevelRaw = (user?.level || currentUser?.level || (user as any)?.student?.level || '').trim().toUpperCase()
  const detectedLevel = useMemo(() => {
    if (['L1', 'L2', 'L3', 'M1', 'M2'].includes(userLevelRaw)) return userLevelRaw
    if (userLevelRaw.includes('L3') || userLevelRaw.includes('3')) return 'L3'
    if (userLevelRaw.includes('L2') || userLevelRaw.includes('2')) return 'L2'
    if (userLevelRaw.includes('L1') || userLevelRaw.includes('1')) return 'L1'
    if (userLevelRaw.includes('M1')) return 'M1'
    if (userLevelRaw.includes('M2')) return 'M2'
    return 'L3'
  }, [userLevelRaw])

  // Filtres académiques : pour un étudiant ou délégué, ils sont STRICTEMENT fixés sur sa filière et son niveau
  const [selectedProgram, setSelectedProgram] = useState<string>(detectedProgram)
  const [selectedLevel, setSelectedLevel] = useState<string>(detectedLevel)

  // Synchroniser si l'utilisateur change ou termine de charger son profil
  useEffect(() => {
    if (user?.accountType === 'PERSONAL') {
      setTabMode('PERSONAL')
    } else if (!isAdmin) {
      setSelectedProgram(detectedProgram)
      setSelectedLevel(detectedLevel)
    }
  }, [user, detectedProgram, detectedLevel, isAdmin])

  const [selectedDayTab, setSelectedDayTab] = useState<'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi'>('Lundi')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showScanModal, setShowScanModal] = useState(false)

  // Données dynamiques depuis Appwrite
  const [dbSchedules, setDbSchedules] = useState<RealScheduleSlot[]>([])
  const [loading, setLoading] = useState(false)

  // Définir le jour d'aujourd'hui
  const currentDayName = useMemo(() => {
    const dayIndex = new Date().getDay() // 0 = Dimanche, 1 = Lundi ...
    if (dayIndex >= 1 && dayIndex <= 6) {
      return DAYS[dayIndex - 1]
    }
    return 'Lundi'
  }, [])

  useEffect(() => {
    setSelectedDayTab(currentDayName)
  }, [currentDayName])

  // Chargement strict des séances depuis la collection academic_schedules d'Appwrite
  useEffect(() => {
    let isMounted = true
    async function loadAppwriteSchedules() {
      setLoading(true)
      try {
        const queries = [
          Query.equal('program', selectedProgram),
          Query.equal('level', selectedLevel),
          Query.limit(100)
        ]
        const res = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, 'academic_schedules', queries)
        if (isMounted && res.documents?.length > 0) {
          const mapped: RealScheduleSlot[] = res.documents
            .filter((d: any) => d.program && d.dayOfWeek && d.startTime)
            .map((d: any) => ({
              id: d.$id,
              courseId: d.courseId || d.$id,
              courseCode: d.courseCode || 'UE',
              courseName: d.courseName || d.courseCode || 'Cours Universitaire',
              dayOfWeek: (d.dayOfWeek.charAt(0).toUpperCase() + d.dayOfWeek.slice(1).toLowerCase()) as any,
              startTime: d.startTime,
              endTime: d.endTime || '11:00',
              classroom: d.classroom || 'Amphithéâtre',
              type: d.type || 'CM',
              teacherName: d.teacherName || 'Enseignant UY1',
              program: d.program,
              programLabel: `${d.program} ${d.level}`,
              level: d.level || 'L1',
              group: d.group || '',
              color: d.program === 'ICT4D'
                ? 'from-blue-600 to-indigo-700'
                : d.program === 'SIGL'
                ? 'from-emerald-600 to-teal-700'
                : 'from-purple-600 to-pink-700',
            }))

          if (mapped.length > 0) {
            setDbSchedules(mapped)
          }
        }
      } catch (err) {
        console.warn('Appwrite sync: fallback to offline reference timetable', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadAppwriteSchedules()
    return () => {
      isMounted = false
    }
  }, [selectedProgram, selectedLevel])

  // Filtre par groupe (Groupe A, Groupe B, Groupe C, G1, G2, ou Tous)
  const [selectedGroup, setSelectedGroup] = useState<string>('Tous')

  // Calcul des groupes disponibles pour la promotion active
  const availableGroups = useMemo(() => {
    const rawSlots = dbSchedules.length > 0 ? dbSchedules : REAL_UY1_SCHEDULES
    const relevant = rawSlots.filter(
      (s) => s.program.toUpperCase() === selectedProgram.toUpperCase() && s.level.toUpperCase() === selectedLevel.toUpperCase()
    )
    const groupsSet = new Set<string>()
    relevant.forEach((s) => {
      if (s.group && s.group.trim() && s.group !== 'Tous Groupes') {
        groupsSet.add(s.group.trim())
      }
    })
    return ['Tous', ...Array.from(groupsSet).sort()]
  }, [dbSchedules, selectedProgram, selectedLevel])

  // Filtrage strict : filière + niveau + groupe sélectionné
  const filteredSchedules = useMemo(() => {
    const raw = dbSchedules.length > 0 ? dbSchedules : REAL_UY1_SCHEDULES
    return raw.filter((s) => {
      const matchScope = s.program.toUpperCase() === selectedProgram.toUpperCase() && s.level.toUpperCase() === selectedLevel.toUpperCase()
      if (!matchScope) return false
      if (selectedGroup === 'Tous') return true
      return s.group?.toLowerCase() === selectedGroup.toLowerCase() || s.group === 'Tous Groupes' || !s.group
    })
  }, [dbSchedules, selectedProgram, selectedLevel, selectedGroup])

  // Créneaux du jour sélectionné
  const daySchedules = useMemo(() => {
    return filteredSchedules
      .filter((s) => s.dayOfWeek === selectedDayTab)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [filteredSchedules, selectedDayTab])

  // Calcul de la séance en direct ou de la prochaine séance aujourd'hui
  const activeOrUpcomingSlot = useMemo(() => {
    const todaySlots = filteredSchedules
      .filter((s) => s.dayOfWeek === currentDayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    if (todaySlots.length === 0) return null

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const parseToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number)
      return (h || 0) * 60 + (m || 0)
    }

    // Y a-t-il un cours en ce moment précis ?
    const live = todaySlots.find((s) => {
      const start = parseToMinutes(s.startTime)
      const end = parseToMinutes(s.endTime)
      return currentMinutes >= start && currentMinutes <= end
    })

    if (live) return { slot: live, isLive: true }

    // Prochain cours de la journée
    const upcoming = todaySlots.find((s) => parseToMinutes(s.startTime) > currentMinutes)
    if (upcoming) return { slot: upcoming, isLive: false }

    // Si tout est fini aujourd'hui, on prend le premier cours de demain ou le premier du jour
    return { slot: todaySlots[0], isLive: false }
  }, [filteredSchedules, currentDayName])

  // Calcul du volume hebdomadaire en heures
  const totalWeeklyHours = useMemo(() => {
    return filteredSchedules.reduce((acc, slot) => {
      const [sh, sm] = slot.startTime.split(':').map(Number)
      const [eh, em] = slot.endTime.split(':').map(Number)
      const dur = ((eh || 0) * 60 + (em || 0)) - ((sh || 0) * 60 + (sm || 0))
      return acc + (dur > 0 ? dur / 60 : 2)
    }, 0)
  }, [filteredSchedules])

  // Scan officiel associé à cette promotion
  const currentScan = useMemo(() => {
    return TIMETABLE_SCANS.find(
      (s) => s.program.toUpperCase() === selectedProgram.toUpperCase() && s.level.toUpperCase() === selectedLevel.toUpperCase()
    )
  }, [selectedProgram, selectedLevel])

  // Nom complet du programme
  const programDetails = useMemo(() => {
    return REAL_UY1_PROGRAMS.find((p) => p.code === selectedProgram) || { code: selectedProgram, name: selectedProgram, levels: [selectedLevel] }
  }, [selectedProgram, selectedLevel])

  // Si l'utilisateur choisit le planning personnel
  if (tabMode === 'PERSONAL') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 font-bold text-xs">
                PERSO
              </span>
              <h2 className="text-sm font-bold text-slate-800">
                Mon Espace Travail & Planning Personnel
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Organisation de vos révisions, devoirs personnels et activités indépendantes.
            </p>
          </div>

          <button
            onClick={() => setTabMode('UNIVERSITY')}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <Building2 className="h-4 w-4" />
            <span>Voir l'Emploi du Temps Universitaire UY1</span>
          </button>
        </div>

        <IndependentSchedulePage />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans text-slate-800">
      {/* =========================================================================
          HERO BENTO - Design EdTech 2026 (Inspiration Pinterest / Bento Calendar)
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cyan-200 backdrop-blur-md border border-white/20">
                <Building2 className="h-3.5 w-3.5 text-cyan-300" />
                Faculté des Sciences · Université de Yaoundé I
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-200 border border-emerald-400/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Semestre 1 · 2026-2027
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Emploi du Temps Universitaire UY1
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-200/90 max-w-2xl leading-relaxed">
                Planning académique vérifié en temps réel. Salles, amphithéâtres, horaires officiels et visioconférences campus synchronisés pour votre promotion.
              </p>
            </div>

            {/* Micro-Bento Métriques */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Séances Hebdo</span>
                <span className="text-2xl font-black text-white">{filteredSchedules.length}</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">Programme {selectedProgram} {selectedLevel}</span>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Volume Horaire</span>
                <span className="text-2xl font-black text-white">{Math.round(totalWeeklyHours)}h</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5 font-medium">Heures d'enseignement / sem</span>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Jour Actuel</span>
                <span className="text-2xl font-black text-emerald-300">{currentDayName}</span>
                <span className="text-[10px] text-slate-200 block mt-0.5 font-medium">
                  {filteredSchedules.filter(s => s.dayOfWeek === currentDayName).length} cours aujourd'hui
                </span>
              </div>
            </div>

            {/* Actions Rapides */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setTabMode('PERSONAL')}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white border border-white/20 transition-all backdrop-blur-md cursor-pointer"
              >
                <CalendarIcon className="h-4 w-4 text-cyan-300" />
                <span>Mon Planning Perso</span>
              </button>
              {currentScan && (
                <button
                  onClick={() => setShowScanModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-all cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Scan Officiel UY1 (PDF)</span>
                </button>
              )}
              <button
                onClick={() => navigate('/app/visio')}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-all cursor-pointer"
              >
                <Video className="h-4 w-4" />
                <span>Visioconférence Campus</span>
              </button>
            </div>
          </div>

          {/* Colonne Droite : Visuel 3D Agenda / Calendrier */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <img
                src="/illustrations/schedule_calendar_hero_3d.png"
                alt="Calendrier 3D"
                className="relative z-10 w-48 sm:w-60 lg:w-68 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.currentTarget
                  target.src = '/illustrations/uni_copilot_3d.png'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BENTO CARD VEDETTE : SÉANCE DU JOUR EN DIRECT / PROCHAINE SÉANCE
         ========================================================================= */}
      {activeOrUpcomingSlot && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white ${
                activeOrUpcomingSlot.isLive
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-700 animate-pulse'
                  : 'bg-gradient-to-br from-[#1E3A8A] to-blue-700'
              }`}>
                {activeOrUpcomingSlot.isLive ? (
                  <Play className="h-7 w-7 text-white fill-white" />
                ) : (
                  <Clock className="h-7 w-7 text-white" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                    activeOrUpcomingSlot.isLive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${activeOrUpcomingSlot.isLive ? 'bg-emerald-500 animate-ping' : 'bg-blue-600'}`} />
                    {activeOrUpcomingSlot.isLive ? 'Séance en cours en ce moment' : 'Prochaine séance aujourd’hui'}
                  </span>
                  <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {activeOrUpcomingSlot.slot.courseCode}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {activeOrUpcomingSlot.slot.type}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {activeOrUpcomingSlot.slot.courseName}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5 font-bold text-[#1E3A8A]">
                    <Clock className="h-4 w-4" />
                    {activeOrUpcomingSlot.slot.startTime} – {activeOrUpcomingSlot.slot.endTime}
                  </span>
                  <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
                    <MapPin className="h-4 w-4" />
                    {activeOrUpcomingSlot.slot.classroom}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <User className="h-4 w-4 text-amber-600" />
                    {activeOrUpcomingSlot.slot.teacherName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-end lg:self-center shrink-0">
              <button
                onClick={() => navigate('/app/visio')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Video className="h-4 w-4" />
                <span>Rejoindre la visio de l'amphi</span>
              </button>
              <button
                onClick={() => navigate('/app/presence')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Émarger ma présence</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BANDEAU PROMOTION OU SUPERVISION ADMIN
         ========================================================================= */}
      {!isAdmin ? (
        <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] text-white font-black text-sm shadow-md shadow-blue-900/10">
              {selectedProgram}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#1E3A8A]">
                  Planning Officiel de Ma Filière
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                  {selectedLevel}
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  Semestre 1 · 2026-2027
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                {programDetails.name} · {selectedLevel === 'L1' ? 'Licence 1' : selectedLevel === 'L2' ? 'Licence 2' : selectedLevel === 'L3' ? 'Licence 3' : selectedLevel === 'M1' ? 'Master 1' : 'Master 2'}
              </h3>
              {availableGroups.length > 2 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Groupe :</span>
                  {availableGroups.map((grp) => {
                    const active = selectedGroup === grp
                    return (
                      <button
                        key={grp}
                        onClick={() => setSelectedGroup(grp)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#1E3A8A] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {grp}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="text-xs font-semibold text-slate-500">
              <strong>{filteredSchedules.length}</strong> séances {selectedGroup !== 'Tous' ? `(${selectedGroup})` : ''}
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Grille Hebdo
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Jour par Jour
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" /> Filière (Supervision) :
              </span>
              {REAL_UY1_PROGRAMS.map((prog) => {
                const active = selectedProgram === prog.code
                return (
                  <button
                    key={prog.code}
                    onClick={() => {
                      setSelectedProgram(prog.code)
                      if (!prog.levels.includes(selectedLevel)) {
                        setSelectedLevel(prog.levels[0])
                      }
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#1E3A8A] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {prog.name.split(' (')[0]}
                    <span className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded ${active ? 'bg-white/20 text-white' : 'bg-white text-slate-500'}`}>
                      {prog.code}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-1 self-end md:self-auto bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Grille Hebdo
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Jour par Jour
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <span className="text-xs font-bold text-slate-400 mr-2">Niveau académique :</span>
            {programDetails.levels.map((lvl) => {
              const active = selectedLevel === lvl
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0D9488] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'L1' ? 'Licence 1 (L1)' : lvl === 'L2' ? 'Licence 2 (L2)' : lvl === 'L3' ? 'Licence 3 (L3)' : lvl === 'M1' ? 'Master 1 (M1)' : 'Master 2 (M2)'}
                </button>
              )
            })}
            <div className="ml-auto text-xs text-slate-400 font-medium">
              <strong>{filteredSchedules.length}</strong> séances programmées
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 1 : GRILLE HEBDOMADAIRE BENTO
         ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* En-tête des jours avec statuts */}
              <div className="grid grid-cols-6 gap-3 pb-4 border-b border-slate-200">
                {DAYS.map((day) => {
                  const count = filteredSchedules.filter((s) => s.dayOfWeek === day).length
                  const isToday = currentDayName.toLowerCase() === day.toLowerCase()

                  return (
                    <div
                      key={day}
                      className={`p-3.5 rounded-2xl text-center transition-all ${
                        isToday
                          ? 'bg-blue-50/80 border-2 border-[#1E3A8A] shadow-sm'
                          : 'bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`text-xs font-black uppercase tracking-wider ${isToday ? 'text-[#1E3A8A]' : 'text-slate-700'}`}>
                          {day}
                        </span>
                        {isToday && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Aujourd'hui" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                        {count} séance{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Colonnes des créneaux par jour */}
              <div className="grid grid-cols-6 gap-3 pt-4 items-start min-h-[440px]">
                {DAYS.map((day) => {
                  const daySlots = filteredSchedules
                    .filter((s) => s.dayOfWeek === day)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))

                  if (daySlots.length === 0) {
                    return (
                      <div key={day} className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                        <span className="text-[11px] font-bold text-slate-400">Aucun cours</span>
                        <span className="text-[10px] text-slate-400 mt-1">Travail personnel & révisions</span>
                      </div>
                    )
                  }

                  return (
                    <div key={day} className="space-y-3">
                      {daySlots.map((slot) => {
                        const isSimultaneous = daySlots.filter((s) => s.startTime === slot.startTime).length > 1

                        return (
                          <div
                            key={slot.id}
                            className={`group relative rounded-2xl border p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
                              isSimultaneous
                                ? 'border-amber-300/80 bg-amber-50/30 hover:border-amber-500'
                                : 'border-slate-200/90 bg-white hover:border-[#1E3A8A]'
                            }`}
                          >
                            <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${slot.color} mb-2.5`} />

                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-mono text-xs font-black text-[#1E3A8A]">
                                  {slot.courseCode}
                                </span>
                                <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                                  isSimultaneous ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {slot.type} {slot.group ? `· ${slot.group}` : ''}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#1E3A8A] transition-colors">
                                {slot.courseName}
                              </h4>

                              {isSimultaneous && (
                                <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-amber-700">
                                  <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                                  <span>Séance simultanée ({slot.group || 'Parallèle'})</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                <span>{slot.startTime} – {slot.endTime}</span>
                              </div>

                              <div className="flex items-center gap-1.5 text-slate-500">
                                <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                <span className="truncate font-medium">{slot.classroom}</span>
                              </div>

                              <div className="flex items-center gap-1.5 text-slate-500">
                                <User className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                <span className="truncate">{slot.teacherName}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 2 : JOUR PAR JOUR (DETAIL BENTO AVEC TABS HORIZONTAUX)
         ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DAYS.map((day) => {
              const active = selectedDayTab === day
              const count = filteredSchedules.filter((s) => s.dayOfWeek === day).length
              const isToday = currentDayName.toLowerCase() === day.toLowerCase()

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDayTab(day)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#1E3A8A] text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {daySchedules.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center border border-slate-200 shadow-sm">
                <CalendarIcon className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Aucun cours prévu le {selectedDayTab}</h3>
                <p className="text-xs text-slate-400 mt-1">Profitez de ce créneau libre pour travailler vos projets ou consulter la bibliothèque.</p>
              </div>
            ) : (
              daySchedules.map((slot) => {
                const isSimultaneous = daySchedules.filter((s) => s.startTime === slot.startTime).length > 1

                return (
                  <div
                    key={slot.id}
                    className={`rounded-2xl bg-white p-5 shadow-sm border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md ${
                      isSimultaneous ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-[#1E3A8A]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 px-4 py-3 text-center shrink-0 border border-blue-100 min-w-[100px]">
                        <Clock className="h-4 w-4 text-[#1E3A8A] mb-1" />
                        <span className="text-xs font-black text-[#1E3A8A]">{slot.startTime}</span>
                        <span className="text-[10px] font-bold text-slate-400">à {slot.endTime}</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-black text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded">
                            {slot.courseCode}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                            {slot.type}
                          </span>
                          {slot.group && (
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                              {slot.group}
                            </span>
                          )}
                          {isSimultaneous && (
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Séance simultanée · Salles variables
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                          {slot.courseName}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-teal-600" />
                            <span className="font-semibold text-slate-700">{slot.classroom}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-amber-600" />
                            <span>{slot.teacherName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => navigate('/app/visio')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1E3A8A] text-xs font-bold transition-all cursor-pointer"
                      >
                        <Video className="h-3.5 w-3.5" /> Visio
                      </button>
                      <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600">
                        {programDetails.code} · {slot.level}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL SCAN OFFICIEL UY1
         ========================================================================= */}
      {showScanModal && currentScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  Document Officiel UY1
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {currentScan.label}
                </h3>
              </div>
              <button
                onClick={() => setShowScanModal(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto py-4 text-center">
              <img
                src={getScanUrl(currentScan).localUrl}
                onError={(e) => {
                  e.currentTarget.src = getScanUrl(currentScan).appwriteUrl
                }}
                alt={currentScan.label}
                className="max-h-[65vh] mx-auto rounded-xl shadow-md border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-700">
                  Université de Yaoundé I · Faculté des Sciences (Semestre 1 · 2026-2027)
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  ✓ Scan officiel certifié · Programmation académique en vigueur
                </p>
              </div>
              <a
                href={getScanUrl(currentScan).appwriteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline shrink-0"
              >
                Ouvrir en pleine résolution <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
