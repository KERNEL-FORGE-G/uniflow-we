import { useState, useEffect, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Building2,
  FileText,
  Download,
  Share2,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
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

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
]

export default function SchedulePage() {
  const { authUser: user } = useUserRole()

  // Mode principal : Universitaire officiel vs Personnel
  const [tabMode, setTabMode] = useState<'UNIVERSITY' | 'PERSONAL'>('UNIVERSITY')

  // Filtres académiques
  const [selectedProgram, setSelectedProgram] = useState<string>('ICT4D')
  const [selectedLevel, setSelectedLevel] = useState<string>('L3')
  const [selectedDayTab, setSelectedDayTab] = useState<'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi'>('Lundi')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showScanModal, setShowScanModal] = useState(false)

  // Données dynamiques depuis Appwrite
  const [dbSchedules, setDbSchedules] = useState<RealScheduleSlot[]>([])
  const [loading, setLoading] = useState(false)

  // Initialisation intelligente selon le profil de l'utilisateur connecté
  useEffect(() => {
    if (user?.accountType === 'PERSONAL') {
      setTabMode('PERSONAL')
    } else if (user?.program) {
      const match = REAL_UY1_PROGRAMS.find(
        (p) => p.code.toLowerCase() === user.program?.toLowerCase() || user.program?.includes(p.code)
      )
      if (match) setSelectedProgram(match.code)
      if (user?.level) setSelectedLevel(user.level)
    }

    // Définir le jour d'aujourd'hui
    const dayIndex = new Date().getDay() // 0 = Dimanche, 1 = Lundi ...
    if (dayIndex >= 1 && dayIndex <= 6) {
      setSelectedDayTab(DAYS[dayIndex - 1])
    }
  }, [user])

  // Chargement des données Appwrite avec repli immédiat sur les données réelles locales
  useEffect(() => {
    let isMounted = true
    async function loadAppwriteSchedules() {
      setLoading(true)
      try {
        const res = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, 'academic_schedules', [
          // Récupération de tous les créneaux pour le filtre sélectionné
        ])
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
              programLabel: d.program,
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
        // En cas d'erreur ou d'absence réseau, on conserve le jeu officiel REAL_UY1_SCHEDULES
        console.warn('Appwrite sync: fallback to offline reference timetable', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadAppwriteSchedules()
    return () => {
      isMounted = false
    }
  }, [])

  // Fusion des données Appwrite et locales (sans duplicata)
  const allSchedules = useMemo(() => {
    const combined = [...REAL_UY1_SCHEDULES]
    for (const d of dbSchedules) {
      if (!combined.some((s) => s.id === d.id || (s.courseCode === d.courseCode && s.dayOfWeek === d.dayOfWeek && s.startTime === d.startTime))) {
        combined.push(d)
      }
    }
    return combined
  }, [dbSchedules])

  // Créneaux filtrés par filière et niveau
  const filteredSchedules = useMemo(() => {
    return allSchedules.filter((s) => {
      const progMatch = s.program.toUpperCase() === selectedProgram.toUpperCase()
      const levelMatch = !selectedLevel || s.level.toUpperCase() === selectedLevel.toUpperCase()
      return progMatch && levelMatch
    })
  }, [allSchedules, selectedProgram, selectedLevel])

  // Créneaux du jour sélectionné
  const daySchedules = useMemo(() => {
    return filteredSchedules
      .filter((s) => s.dayOfWeek === selectedDayTab)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [filteredSchedules, selectedDayTab])

  // Scan officiel associé
  const currentScan = useMemo(() => {
    return TIMETABLE_SCANS.find(
      (s) => s.program.toUpperCase() === selectedProgram.toUpperCase() && s.level.toUpperCase() === selectedLevel.toUpperCase()
    )
  }, [selectedProgram, selectedLevel])

  // Si l'utilisateur choisit le planning personnel
  if (tabMode === 'PERSONAL') {
    return (
      <div className="space-y-6">
        {/* Barre de bascule rapide */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 font-bold text-xs">
                PERSO
              </span>
              <h2 className="text-lg font-black text-slate-900">Mon Planning Personnel & Révisions</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Vos créneaux de travail individuel et de tutorat indépendant.
            </p>
          </div>
          <button
            onClick={() => setTabMode('UNIVERSITY')}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition-colors"
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
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      {/* ── HEADER OFFICIEL UY1 ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md border border-white/20">
                <Building2 className="h-3.5 w-3.5 text-teal-300" />
                Université de Yaoundé I · Faculté des Sciences
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-200 border border-emerald-400/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Semestre 1 · 2026-2027
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Emploi du Temps Universitaire
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              Planning hebdomadaire officiel avec amphis, salles et enseignants habilités. Conforme à la répartition académique LMD.
            </p>
          </div>

          {/* Actions : Bascule Perso & Scan */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setTabMode('PERSONAL')}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white border border-white/20 transition-all backdrop-blur-md"
            >
              <CalendarIcon className="h-4 w-4 text-teal-300" />
              <span>Mon Planning Perso</span>
            </button>
            {currentScan && (
              <button
                onClick={() => setShowScanModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all"
              >
                <FileText className="h-4 w-4" />
                <span>Affichage Officiel UY1 (Scan)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BARRE DE SÉLECTION DE FILIÈRE & NIVEAU ── */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sélecteur de filière */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Filière :
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
                  className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20'
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

          {/* Mode de vue (Grille vs Liste) */}
          <div className="flex items-center gap-1 self-end md:self-auto bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Grille Hebdo
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Jour par Jour
            </button>
          </div>
        </div>

        {/* Niveaux disponibles pour la filière sélectionnée */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-400 mr-2">Niveau académique :</span>
          {REAL_UY1_PROGRAMS.find((p) => p.code === selectedProgram)?.levels.map((lvl) => {
            const active = selectedLevel === lvl
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all ${
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

      {/* ── VUE 1 : GRILLE HEBDOMADAIRE (LUNDI À SAMEDI) ── */}
      {viewMode === 'grid' && (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              {/* Entête des jours */}
              <div className="grid grid-cols-6 gap-3 pb-4 border-b border-slate-200">
                {DAYS.map((day) => {
                  const count = filteredSchedules.filter((s) => s.dayOfWeek === day).length
                  const isToday = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase() === day.toLowerCase()
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-2xl text-center ${
                        isToday ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`text-xs font-extrabold uppercase tracking-wider ${isToday ? 'text-[#1E3A8A]' : 'text-slate-700'}`}>
                          {day}
                        </span>
                        {isToday && <span className="h-2 w-2 rounded-full bg-blue-600" title="Aujourd'hui" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {count} cours
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Colonnes des cours par jour */}
              <div className="grid grid-cols-6 gap-3 pt-4 items-start min-h-[420px]">
                {DAYS.map((day) => {
                  const slots = filteredSchedules
                    .filter((s) => s.dayOfWeek === day)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))

                  if (slots.length === 0) {
                    return (
                      <div key={day} className="flex flex-col items-center justify-center h-44 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                        <span className="text-[11px] font-medium text-slate-400">Aucun cours</span>
                        <span className="text-[10px] text-slate-300 mt-1">Travail autonome</span>
                      </div>
                    )
                  }

                  return (
                    <div key={day} className="space-y-3">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="group relative rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm hover:shadow-md transition-all hover:border-[#1E3A8A] flex flex-col justify-between"
                        >
                          {/* Ruban coloré en tête */}
                          <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${slot.color} mb-2.5`} />

                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono text-xs font-black text-[#1E3A8A]">
                                {slot.courseCode}
                              </span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                                {slot.type} {slot.group ? `· ${slot.group}` : ''}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                              {slot.courseName}
                            </h4>
                          </div>

                          <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
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
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VUE 2 : JOUR PAR JOUR (DETAIL AVEC TABS) ── */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Onglets des jours */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DAYS.map((day) => {
              const active = selectedDayTab === day
              const count = filteredSchedules.filter((s) => s.dayOfWeek === day).length
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDayTab(day)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Liste détaillée des cours du jour */}
          <div className="space-y-3">
            {daySchedules.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center border border-slate-200">
                <CalendarIcon className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Aucun cours prévu le {selectedDayTab}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Profitez de cette journée pour réviser, avancer vos projets ou préparer vos devoirs sur la plateforme.
                </p>
              </div>
            ) : (
              daySchedules.map((slot) => (
                <div
                  key={slot.id}
                  className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 p-3 w-28 shrink-0 text-center">
                      <Clock className="h-4 w-4 text-[#1E3A8A] mb-1" />
                      <span className="text-xs font-black text-[#1E3A8A]">{slot.startTime}</span>
                      <span className="text-[10px] text-slate-400 font-medium">à {slot.endTime}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-black text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded-md">
                          {slot.courseCode}
                        </span>
                        <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
                          {slot.type} {slot.group ? `· Groupe ${slot.group}` : ''}
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {slot.program} {slot.level}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">{slot.courseName}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MapPin className="h-4 w-4 text-teal-600" />
                          <span>{slot.classroom}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <User className="h-4 w-4 text-amber-600" />
                          <span>Enseignant : <strong>{slot.teacherName}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Appel QR Prévu
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODAL SCAN OFFICIEL ── */}
      {showScanModal && currentScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">{currentScan.label}</h3>
                <p className="text-xs text-slate-500">
                  Affichage original photographié / scanné de la Faculté des Sciences UY1
                </p>
              </div>
              <button
                onClick={() => setShowScanModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold"
              >
                ✕ Fermer
              </button>
            </div>

            <div className="overflow-auto flex-1 rounded-2xl bg-slate-900 p-2 flex items-center justify-center">
              <img
                src={getScanUrl(currentScan).localUrl}
                alt={currentScan.label}
                className="max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  // Repli sur l'URL Appwrite si local indisponible
                  e.currentTarget.src = getScanUrl(currentScan).appwriteUrl
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span>Salle assignée : <strong>{currentScan.classroom || 'Amphi officiel'}</strong></span>
              <a
                href={getScanUrl(currentScan).appwriteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#1E3A8A] hover:underline"
              >
                <span>Ouvrir en plein écran</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
