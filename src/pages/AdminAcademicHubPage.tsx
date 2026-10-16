import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  Building2,
  BookOpen,
  DoorOpen,
  GraduationCap,
  Users,
  QrCode,
  BarChart3,
  CheckCircle2,
  Download,
  Plus,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  ChevronRight,
  Clock,
  ShieldCheck,
  Award,
  Activity,
  Calendar,
  FileText,
} from 'lucide-react'

export type AdminHubSection =
  | 'structure'
  | 'ue'
  | 'salles'
  | 'etudiants'
  | 'enseignants'
  | 'historique-presences'
  | 'analytics'

interface StudentRecord {
  id: string
  matricule: string
  name: string
  email: string
  faculty: string
  department: string
  level: string
  attendanceRate: number
  gpa: string
  quitus: 'EN RÈGLE' | 'TRANCHE 2 DUE'
  delegate: boolean
}

const STUDENTS_DATA: StudentRecord[] = [
  {
    id: 'st-1',
    matricule: '22U2418',
    name: 'Ravel Nghomsi',
    email: 'ravel.nghomsi@facsciences-uy1.cm',
    faculty: 'Faculté des Sciences (UY1)',
    department: 'Informatique & ICT4D',
    level: 'Licence 3 (L3)',
    attendanceRate: 96,
    gpa: '16,10 / 20',
    quitus: 'EN RÈGLE',
    delegate: true,
  },
  {
    id: 'st-2',
    matricule: '22U2094',
    name: 'Aïcha Bello',
    email: 'aicha.bello@facsciences-uy1.cm',
    faculty: 'Faculté des Sciences (UY1)',
    department: 'Informatique & Génie Logiciel',
    level: 'Licence 3 (L3)',
    attendanceRate: 94,
    gpa: '15,45 / 20',
    quitus: 'EN RÈGLE',
    delegate: false,
  },
  {
    id: 'st-3',
    matricule: '23U1902',
    name: 'Franck Kamga',
    email: 'franck.kamga@facsciences-uy1.cm',
    faculty: 'Faculté des Sciences (UY1)',
    department: 'Mathématiques & Applications',
    level: 'Licence 2 (L2)',
    attendanceRate: 88,
    gpa: '13,80 / 20',
    quitus: 'TRANCHE 2 DUE',
    delegate: false,
  },
  {
    id: 'st-4',
    matricule: '21U0844',
    name: 'Clarisse Mebenga',
    email: 'clarisse.mebenga@facsciences-uy1.cm',
    faculty: 'Faculté des Sciences (UY1)',
    department: 'Intelligence Artificielle & Data',
    level: 'Master 1 (M1)',
    attendanceRate: 98,
    gpa: '16,75 / 20',
    quitus: 'EN RÈGLE',
    delegate: true,
  },
]

const ROOMS_DATA = [
  {
    code: 'AMPHI-500',
    name: 'Amphithéâtre 500',
    building: 'Bloc Pédagogique Central',
    capacity: 500,
    status: 'OCCUPÉE' as const,
    currentCourse: 'INF301 — Systèmes Distribués (Pr. Ndiaye)',
    equipment: ['Projecteur Laser 4K', 'Sonorisation HF', 'Serveur LiveKit LAN', 'QR Borne'],
  },
  {
    code: 'AMPHI-250',
    name: 'Amphithéâtre 250',
    building: 'Extension Faculté des Sciences',
    capacity: 250,
    status: 'DISPONIBLE' as const,
    currentCourse: 'Libre jusqu’à 13h30',
    equipment: ['Vidéoprojecteur HD', 'Micro Amphi', 'Wi-Fi Campus'],
  },
  {
    code: 'SALLE-S008',
    name: 'Salle de TD S008',
    building: 'Département Informatique',
    capacity: 85,
    status: 'DISPONIBLE' as const,
    currentCourse: 'Libre · Réservable par délégué',
    equipment: ['Tableau Blanc', 'Prises 220V', 'Routeur Local'],
  },
  {
    code: 'LAB-C205',
    name: 'Laboratoire Informatique C205',
    building: 'Bâtiment Recherche & TP',
    capacity: 60,
    status: 'OCCUPÉE' as const,
    currentCourse: 'INF304 — TP Machine Learning (Dr. Ewondo)',
    equipment: ['60 Postes Linux Ubuntu', 'Serveur GPU Local', 'Vigie Edge AI'],
  },
  {
    code: 'AMPHI-1000',
    name: 'Grand Amphithéâtre 1000',
    building: 'Esplanade Principale UY1',
    capacity: 1000,
    status: 'INDISPONIBLE' as const,
    currentCourse: 'Maintenance sonorisation (10h–12h)',
    equipment: ['Double Écran Géant', 'Sonorisation Amphi', 'Relais LiveKit'],
  },
]

const UES_DATA = [
  { code: 'INF301', title: 'Systèmes Distribués & Consensus', credits: 6, semester: 'S5 (L3)', dept: 'Informatique', teacher: 'Pr. Jean-Paul Ndiaye', enrolled: 184 },
  { code: 'INF304', title: 'Intelligence Artificielle & Apprentissage', credits: 6, semester: 'S5 (L3)', dept: 'Informatique', teacher: 'Dr. Thomas Ewondo', enrolled: 184 },
  { code: 'MAT205', title: 'Analyse Numérique & Optimisation', credits: 6, semester: 'S3 (L2)', dept: 'Mathématiques', teacher: 'Pr. Hélène Ngo Mback', enrolled: 240 },
  { code: 'PHY302', title: 'Électromagnétisme & Optique Ondulatoire', credits: 6, semester: 'S5 (L3)', dept: 'Physique', teacher: 'Pr. Samuel Atangana', enrolled: 155 },
  { code: 'CHM201', title: 'Chimie Organique & Cinétique', credits: 6, semester: 'S3 (L2)', dept: 'Chimie', teacher: 'Dr. Marthe Biya-Kotto', enrolled: 190 },
  { code: 'ICT401', title: 'Architecture Cloud & DevSecOps', credits: 6, semester: 'S7 (M1)', dept: 'ICT4D', teacher: 'Pr. Jean-Paul Ndiaye', enrolled: 92 },
]

const TEACHERS_DATA = [
  { id: 't-1', matricule: 'ENS-UY1-014', name: 'Pr. Jean-Paul Ndiaye', grade: 'Professeur Titulaire', dept: 'Informatique & ICT4D', hoursDone: 142, hoursTarget: 160, ues: ['INF301', 'ICT401'], rating: '98% Assiduité' },
  { id: 't-2', matricule: 'ENS-UY1-029', name: 'Dr. Thomas Ewondo', grade: 'Chargé de Cours', dept: 'Informatique', hoursDone: 118, hoursTarget: 140, ues: ['INF304', 'INF202'], rating: '96% Assiduité' },
  { id: 't-3', matricule: 'ENS-UY1-041', name: 'Pr. Hélène Ngo Mback', grade: 'Maître de Conférences', dept: 'Mathématiques', hoursDone: 134, hoursTarget: 150, ues: ['MAT205', 'MAT101'], rating: '99% Assiduité' },
  { id: 't-4', matricule: 'ENS-UY1-058', name: 'Pr. Samuel Atangana', grade: 'Maître de Conférences', dept: 'Physique & Énergies', hoursDone: 110, hoursTarget: 140, ues: ['PHY302'], rating: '95% Assiduité' },
]

export default function AdminAcademicHubPage({ section }: { section?: AdminHubSection }) {
  const { pathname } = useLocation()
  const activeSection: AdminHubSection =
    section ||
    (pathname.includes('/ue')
      ? 'ue'
      : pathname.includes('/salles')
        ? 'salles'
        : pathname.includes('/etudiants')
          ? 'etudiants'
          : pathname.includes('/enseignants')
            ? 'enseignants'
            : pathname.includes('/historique-presences')
              ? 'historique-presences'
              : pathname.includes('/analytics')
                ? 'analytics'
                : 'structure')

  const [roomViewMode, setRoomViewMode] = useState<'grid' | 'table'>('grid')
  const [roomFilter, setRoomFilter] = useState<'ALL' | 'DISPONIBLE' | 'OCCUPÉE' | 'INDISPONIBLE'>('ALL')
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord>(STUDENTS_DATA[0])
  const [studentTab, setStudentTab] = useState<
    'infos' | 'parcours' | 'presences' | 'notes' | 'edt' | 'activite'
  >('infos')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const navPills: { key: AdminHubSection; to: string; label: string; icon: typeof Building2 }[] = [
    { key: 'structure', to: '/admin/structure', label: 'Structure LMD', icon: Building2 },
    { key: 'ue', to: '/admin/ue', label: 'Catalogue UEs', icon: BookOpen },
    { key: 'salles', to: '/admin/salles', label: 'Salles & Amphis', icon: DoorOpen },
    { key: 'etudiants', to: '/admin/etudiants', label: 'Fiche Étudiants (6 onglets)', icon: GraduationCap },
    { key: 'enseignants', to: '/admin/enseignants', label: 'Corps Enseignant', icon: Users },
    { key: 'historique-presences', to: '/admin/historique-presences', label: 'Historique Présences', icon: QrCode },
    { key: 'analytics', to: '/admin/analytics', label: 'Analytics Direction', icon: BarChart3 },
  ]

  const filteredRooms = ROOMS_DATA.filter((r) => roomFilter === 'ALL' || r.status === roomFilter)

  return (
    <div className="space-y-6 pb-12">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-bold text-white shadow-xl border border-teal-500/40">
          <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navigation Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#1d4ed8] to-[#0D9488] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-100">
              <Sparkles className="h-3.5 w-3.5" /> Gouvernance Académique & Pilotage Direction · UY1
            </span>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Administration Centrale — Université de Yaoundé I
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Supervision temps réel des structures LMD, amphithéâtres, dossiers étudiants, enseignants et indicateurs rectoraux.
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerToast('Rapport consolidé Rectorat / Décanat exporté en PDF & Excel !')}
            className="inline-flex items-center gap-2 self-start lg:self-center rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-[#1E3A8A] shadow-md hover:bg-blue-50"
          >
            <Download className="h-4 w-4" />
            <span>Exporter Rapport Officiel</span>
          </button>
        </div>

        {/* Sub-navigation across the 7 Admin Hub routes */}
        <div className="mt-5 flex flex-wrap gap-2">
          {navPills.map((pill) => {
            const Icon = pill.icon
            const active = activeSection === pill.key
            return (
              <Link
                key={pill.key}
                to={pill.to}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${
                  active
                    ? 'bg-white text-[#1E3A8A] shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{pill.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 1. STRUCTURE ACADÉMIQUE (/admin/structure) */}
      {activeSection === 'structure' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Arborescence Académique : Facultés › Départements › Filières › Niveaux (L1–M2)
                </h2>
                <p className="text-xs text-slate-500">
                  Référentiel officiel 2026–2027 de l’Université de Yaoundé I
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('Formulaire de création de filière LMD ouvert')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-black text-white"
              >
                <Plus className="h-4 w-4" /> Ajouter une Filière
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                {
                  faculty: 'Faculté des Sciences (FS)',
                  dean: 'Décanat FS · Campus Ngoa-Ekellé',
                  departments: [
                    { name: 'Informatique & ICT4D', tracks: ['Informatique Fondamentale', 'ICT4D', 'Génie Logiciel & IA'], levels: ['L1', 'L2', 'L3', 'M1', 'M2'] },
                    { name: 'Mathématiques', tracks: ['Maths Pures', 'Maths Appliquées & Statistique'], levels: ['L1', 'L2', 'L3', 'M1', 'M2'] },
                    { name: 'Physique & Énergies Renouvelables', tracks: ['Physique Fondamentale', 'Énergies Solaire & Biomasse'], levels: ['L1', 'L2', 'L3', 'M1'] },
                  ],
                },
                {
                  faculty: 'Faculté des Arts, Lettres et Sciences Humaines (FALSH)',
                  dean: 'Décanat FALSH · Ngoa-Ekellé',
                  departments: [
                    { name: 'Géographie & Aménagement', tracks: ['Géomatique & SIG', 'Urbanisme'], levels: ['L1', 'L2', 'L3', 'M1', 'M2'] },
                    { name: 'Lettres Bilingues & Traduction', tracks: ['Études Bilingues FR/EN'], levels: ['L1', 'L2', 'L3'] },
                  ],
                },
                {
                  faculty: 'École Nationale Supérieure Polytechnique (ENSPY)',
                  dean: 'Direction ENSPY · UY1',
                  departments: [
                    { name: 'Génie Informatique (GI)', tracks: ['Ingénieur Conception IA & Réseaux'], levels: ['Niv 1', 'Niv 2', 'Niv 3', 'Niv 4', 'Niv 5'] },
                    { name: 'Génie Électrique & Télécoms', tracks: ['Systèmes Embarqués & IoT Sentinelle'], levels: ['Niv 3', 'Niv 4', 'Niv 5'] },
                  ],
                },
              ].map((fac) => (
                <div key={fac.faculty} className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50/50">
                  <div>
                    <span className="rounded-lg bg-[#1E3A8A] px-2.5 py-0.5 text-[10px] font-black text-white uppercase">
                      Établissement UY1
                    </span>
                    <h3 className="mt-2 text-base font-black text-slate-900">{fac.faculty}</h3>
                    <p className="text-xs text-slate-500">{fac.dean}</p>
                  </div>

                  <div className="space-y-3">
                    {fac.departments.map((d) => (
                      <div key={d.name} className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-2">
                        <p className="text-xs font-extrabold text-[#1E3A8A] flex items-center gap-1.5">
                          <ChevronRight className="h-3.5 w-3.5 text-[#0D9488]" /> {d.name}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {d.tracks.map((tr) => (
                            <span key={tr} className="rounded-lg bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-[#0D9488]">
                              {tr}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {d.levels.map((lv) => (
                            <span key={lv} className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900">
                              {lv}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. UNITÉS D'ENSEIGNEMENT (/admin/ue) */}
      {activeSection === 'ue' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Catalogue des Unités d’Enseignement (UEs)</h2>
              <p className="text-xs text-slate-500">Crédits ECTS, semestres, départements et enseignants responsables</p>
            </div>
            <button
              type="button"
              onClick={() => triggerToast('Nouvelle Unité d’Enseignement ajoutée au catalogue LMD !')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-black text-white"
            >
              <Plus className="h-4 w-4" /> Créer une UE
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Code UE</th>
                  <th className="py-3 px-3">Intitulé Officiel</th>
                  <th className="py-3 px-3">Département</th>
                  <th className="py-3 px-3">Semestre</th>
                  <th className="py-3 px-3">Crédits</th>
                  <th className="py-3 px-3">Responsable</th>
                  <th className="py-3 px-3 text-right">Inscrits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {UES_DATA.map((u) => (
                  <tr key={u.code} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-mono font-black text-[#1E3A8A]">{u.code}</td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">{u.title}</td>
                    <td className="py-3.5 px-3 text-slate-600">{u.dept}</td>
                    <td className="py-3.5 px-3">
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-[#1E3A8A]">{u.semester}</span>
                    </td>
                    <td className="py-3.5 px-3 font-black text-[#0D9488]">{u.credits} ECTS</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{u.teacher}</td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900">{u.enrolled} étud.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SALLES & AMPHITHÉÂTRES (/admin/salles — Vue Grille + Vue Tableau) */}
      {activeSection === 'salles' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Gestion des Salles & Amphithéâtres (Vue Grille & Vue Tableau)
              </h2>
              <p className="text-xs text-slate-500">
                Occupation en temps réel, capacité et équipements multimédias / LiveKit LAN
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'DISPONIBLE', 'OCCUPÉE', 'INDISPONIBLE'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setRoomFilter(st)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${
                    roomFilter === st
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'Toutes' : st}
                </button>
              ))}

              <div className="inline-flex rounded-xl border border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setRoomViewMode('grid')}
                  className={`rounded-lg p-1.5 ${
                    roomViewMode === 'grid' ? 'bg-[#1E3A8A] text-white' : 'text-slate-500'
                  }`}
                  title="Vue Grille"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRoomViewMode('table')}
                  className={`rounded-lg p-1.5 ${
                    roomViewMode === 'table' ? 'bg-[#1E3A8A] text-white' : 'text-slate-500'
                  }`}
                  title="Vue Tableau"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {roomViewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((r) => (
                <div key={r.code} className="rounded-2xl border border-slate-200 p-5 space-y-3 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#1E3A8A]">{r.code}</span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase ${
                        r.status === 'DISPONIBLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'OCCUPÉE'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{r.name}</h3>
                    <p className="text-xs text-slate-500">
                      {r.building} · Capacité : <strong>{r.capacity} places</strong>
                    </p>
                  </div>
                  <p className="rounded-xl bg-slate-50 p-2.5 text-xs font-bold text-slate-700 border border-slate-200/70">
                    {r.currentCourse}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.equipment.map((eq) => (
                      <span key={eq} className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1E3A8A]">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Salle / Amphithéâtre</th>
                    <th className="py-3 px-3">Bâtiment</th>
                    <th className="py-3 px-3">Capacité</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3">Occupation actuelle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRooms.map((r) => (
                    <tr key={r.code} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-black text-[#1E3A8A]">{r.code}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">{r.name}</td>
                      <td className="py-3 px-3 text-slate-500">{r.building}</td>
                      <td className="py-3 px-3 font-black text-slate-800">{r.capacity} pl.</td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                            r.status === 'DISPONIBLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'OCCUPÉE'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">{r.currentCourse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. GESTION DES ÉTUDIANTS + FICHE ÉTUDIANT DÉTAILLÉE 6 ONGLETS (/admin/etudiants) */}
      {activeSection === 'etudiants' && (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Left: Directory list */}
          <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Matricule ou nom étudiant…"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold"
              />
            </div>

            <div className="space-y-2">
              {STUDENTS_DATA.filter(
                (s) =>
                  !searchQuery ||
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.matricule.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((st) => {
                const active = st.id === selectedStudent.id
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStudent(st)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                      active
                        ? 'border-[#1E3A8A] bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-[#1E3A8A]">{st.matricule}</span>
                      {st.delegate && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900">
                          Délégué
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-black text-slate-900">{st.name}</p>
                    <p className="text-xs text-slate-500">
                      {st.department} · {st.level}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Fiche Étudiant Détaillée avec 6 Onglets */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#1E3A8A] px-2.5 py-1 font-mono text-xs font-black text-white">
                    {selectedStudent.matricule}
                  </span>
                  <h2 className="text-xl font-black text-slate-900">{selectedStudent.name}</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedStudent.faculty} · {selectedStudent.department} ({selectedStudent.level})
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-black text-emerald-800">
                {selectedStudent.quitus}
              </span>
            </div>

            {/* 6 Onglets : Informations, Parcours, Présences, Notes, Emploi du temps, Activité */}
            <div className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-100 p-1.5">
              {(
                [
                  { id: 'infos', label: '1. Informations' },
                  { id: 'parcours', label: '2. Parcours LMD' },
                  { id: 'presences', label: '3. Présences QR' },
                  { id: 'notes', label: '4. Notes & Jury' },
                  { id: 'edt', label: '5. Emploi du temps' },
                  { id: 'activite', label: '6. Activité & Quêtes' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setStudentTab(t.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${
                    studentTab === t.id
                      ? 'bg-[#1E3A8A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {studentTab === 'infos' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Email Institutionnel</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{selectedStudent.email}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Moyenne Semestrielle</p>
                  <p className="mt-1 text-sm font-black text-[#0D9488]">{selectedStudent.gpa}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Taux d’Assiduité</p>
                  <p className="mt-1 text-sm font-black text-[#1E3A8A]">{selectedStudent.attendanceRate}%</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Responsabilité Promotion</p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {selectedStudent.delegate ? 'Délégué de Promotion Titulaire' : 'Étudiant Régulier'}
                  </p>
                </div>
              </div>
            )}

            {studentTab === 'parcours' && (
              <div className="space-y-2.5 text-xs">
                <div className="rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                  <span><strong>2026–2027 :</strong> {selectedStudent.level} — {selectedStudent.department}</span>
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 font-black text-amber-900">EN COURS</span>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                  <span><strong>2025–2026 :</strong> Niveau inférieur validé (60 / 60 ECTS)</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 font-black text-emerald-800">ADMIS</span>
                </div>
              </div>
            )}

            {studentTab === 'presences' && (
              <div className="rounded-2xl bg-teal-50/70 border border-teal-200 p-4 space-y-2 text-xs">
                <p className="font-black text-teal-900">
                  Assiduité vérifiée par QR Code : {selectedStudent.attendanceRate}% (46 / 48 séances émargées)
                </p>
                <p className="text-teal-700">Dernier pointage : Aujourd’hui 08h00 en Amphi 500 (INF301).</p>
              </div>
            )}

            {studentTab === 'notes' && (
              <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 space-y-2 text-xs">
                <p className="font-black text-[#1E3A8A]">Moyenne Générale Pondérée : {selectedStudent.gpa}</p>
                <p className="text-slate-600">INF301 : 18.5/20 · INF304 : 16.0/20 · MAT205 : 15.0/20</p>
              </div>
            )}

            {studentTab === 'edt' && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-1.5">
                <p className="font-black text-slate-900">Emploi du temps Semestre Impair (S5) :</p>
                <p className="text-slate-600">• Lundi 08h–10h : INF301 (Amphi 500)</p>
                <p className="text-slate-600">• Mardi 13h30–15h30 : INF304 (Lab C205)</p>
                <p className="text-slate-600">• Jeudi 10h–12h : MAT205 (Salle S008)</p>
              </div>
            )}

            {studentTab === 'activite' && (
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 text-xs space-y-1.5">
                <p className="font-black text-amber-950">Engagement Gamification & Bibliothèque :</p>
                <p className="text-amber-800">• Niveau 12 · 3 450 XP · Badge « Étudiant Assidu » & « Major » débloqués.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. ENSEIGNANTS (/admin/enseignants) */}
      {activeSection === 'enseignants' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Corps Enseignant & Charge Horaire</h2>
              <p className="text-xs text-slate-500">Suivi des heures magistrales effectuées et UEs attribuées</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {TEACHERS_DATA.map((t) => {
              const pct = Math.round((t.hoursDone / t.hoursTarget) * 100)
              return (
                <div key={t.id} className="rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#1E3A8A]">{t.matricule}</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                      {t.rating}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{t.name}</h3>
                    <p className="text-xs text-slate-500">
                      {t.grade} · Département {t.dept}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Volume horaire annuel</span>
                      <span className="text-[#1E3A8A]">
                        {t.hoursDone}h / {t.hoursTarget}h ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#0D9488]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.ues.map((u) => (
                      <span key={u} className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-black text-[#1E3A8A]">
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 6. HISTORIQUE DES PRÉSENCES (/admin/historique-presences) */}
      {activeSection === 'historique-presences' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Suivi & Historique des Présences QR Code par Filière
              </h2>
              <p className="text-xs text-slate-500">
                Sessions d’émargement numérique signées par les enseignants et délégués
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerToast('Journal global des présences exporté en CSV / PDF !')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-black text-white"
            >
              <Download className="h-4 w-4" /> Exporter les feuilles d’émargement
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { code: 'INF301 · L3 Info', date: 'Aujourd’hui 08h00', room: 'Amphi 500', present: 172, total: 184, rate: '93,5%' },
              { code: 'INF304 · L3 Info', date: 'Hier 13h30', room: 'Lab C205', present: 178, total: 184, rate: '96,7%' },
              { code: 'MAT205 · L2 Maths', date: 'Hier 10h00', room: 'Amphi 250', present: 218, total: 240, rate: '90,8%' },
            ].map((sess) => (
              <div key={sess.code} className="rounded-2xl border border-slate-200 p-4 space-y-2 bg-slate-50/60">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-[#1E3A8A]">{sess.code}</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                    {sess.rate}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {sess.date} · <strong>{sess.room}</strong>
                </p>
                <p className="text-xs font-bold text-slate-900">
                  {sess.present} présents / {sess.total} inscrits
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. ANALYTICS D'ENGAGEMENT & VUE DIRECTION (/admin/analytics — Partie 9) */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Étudiants Actifs (UY1)', value: '14 820', delta: '+18,4% ce semestre', color: 'text-[#1E3A8A]' },
              { label: 'Taux Moyen d’Assiduité QR', value: '93,8%', delta: '+6,2 pts vs papier', color: 'text-[#0D9488]' },
              { label: 'Taux de Recouvrement Droits', value: '91,4%', delta: 'Quitus Mobile Money', color: 'text-amber-600' },
              { label: 'Sessions Visio & LAN Campus', value: '1 240', delta: '0 Mo data Internet en amphi', color: 'text-purple-700' },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-500">{kpi.label}</p>
                <p className={`mt-1 text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">{kpi.delta}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900">
              Performance & Engagement par Département (Vue Rectorat & Décanat)
            </h2>
            <div className="space-y-3">
              {[
                { dept: 'Département d’Informatique & ICT4D', attendance: 96, success: 89, digitalAdoption: 99 },
                { dept: 'Département de Mathématiques', attendance: 93, success: 84, digitalAdoption: 95 },
                { dept: 'Département de Physique & Énergies', attendance: 91, success: 82, digitalAdoption: 92 },
                { dept: 'Département de Chimie & Biochimie', attendance: 90, success: 85, digitalAdoption: 90 },
              ].map((row) => (
                <div key={row.dept} className="rounded-2xl border border-slate-200 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between text-xs font-extrabold text-slate-900">
                    <span>{row.dept}</span>
                    <span className="text-[#0D9488]">
                      Assiduité {row.attendance}% · Réussite {row.success}% · Adoption Numérique {row.digitalAdoption}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#0D9488]" style={{ width: `${row.digitalAdoption}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
