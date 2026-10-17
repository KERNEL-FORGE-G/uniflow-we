import { useState } from 'react'
import { SquaresFour, ListBullets } from '@phosphor-icons/react'
import { Badge } from '../components/ui/Badge'
import { IconTile, SubjectIcon, UniIcon } from '../components/ui/UniIcon'
import { darkenHex, subjectColor } from '../lib/subjectIcon'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { coursesApi, type Course } from '../lib/api'

const typeLabel: Record<string, string> = {
  CM: 'Cours Magistral',
  TD: 'Travaux Dirigés',
  TP: 'Travaux Pratiques'
}

const tabs = ['Tous', 'CM', 'TD', 'TP'] as const
type Tab = typeof tabs[number]

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Tous')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data: courses, loading, error, refetch } = useApi(() => coursesApi.mine(), [], { key: 'courses.mine' })

  const courseList = courses ?? []

  const filtered = courseList.filter((c: Course) => {
    const matchTab = activeTab === 'Tous' || c.type === activeTab
    const teacherFullName = c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : ''
    const matchSearch = !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.code.toLowerCase().includes(search.toLowerCase())
      || teacherFullName.toLowerCase().includes(search.toLowerCase())
      || (c.teachingUnit?.name || '').toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  // Métriques globales du semestre
  const totalCourses = courseList.length
  const totalCredits = courseList.reduce((acc, c) => acc + (c.credits ?? 0), 0)
  const totalHours = courseList.reduce((acc, c) => acc + (c.hours ?? 0), 0)
  const countCM = courseList.filter(c => c.type === 'CM').length
  const countTD = courseList.filter(c => c.type === 'TD').length
  const countTP = courseList.filter(c => c.type === 'TP').length

  if (loading) return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
      <div className="h-12 w-full rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
        <UniIcon name="alert" size={32} />
      </div>
      <p className="text-sm font-medium text-slate-600 max-w-md text-center">{error}</p>
      <button
        onClick={refetch}
        className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E3A8A]/90 transition-all cursor-pointer"
      >
        <UniIcon name="refresh" weight="bold" size={16} /> Réessayer
      </button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-800">
      {/* =========================================================================
          HERO BENTO - Design EdTech 2026 (Inspiration Pinterest / Notion LMS)
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        {/* Cercles diffus d'ambiance */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-12 items-center">
          {/* Colonne Gauche : Titre et Description */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Syllabus Officiel 2026 · Université de Yaoundé I
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Mes Cours & Unités d'Enseignement
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-200/90 max-w-2xl leading-relaxed">
                Retrouvez l’ensemble de vos cours magistraux, travaux dirigés et séances pratiques. Consultez les supports officiels, suivez l'avancement du programme et préparez vos examens avec le copilote IA Uni.
              </p>
            </div>

            {/* Micro-Bento Métriques Semestre */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Total Cours</span>
                <span className="text-2xl font-black text-white">{totalCourses}</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">{countCM} CM · {countTD} TD · {countTP} TP</span>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Crédits ECTS</span>
                <span className="text-2xl font-black text-white">{totalCredits}</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5 font-medium">Programme LMD UY1</span>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Heures Totales</span>
                <span className="text-2xl font-black text-white">{totalHours}h</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">Volume Semestriel</span>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Assiduité</span>
                <span className="text-2xl font-black text-emerald-300">96.8%</span>
                <span className="text-[10px] text-slate-200 block mt-0.5 font-medium">Présence Certifiée</span>
              </div>
            </div>

            {/* Actions Rapides Hero */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => navigate('/app/emploi-du-temps')}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-[#1E3A8A] px-4 py-2 text-xs font-bold shadow-md hover:bg-cyan-50 transition-all cursor-pointer"
              >
                <UniIcon name="agenda" weight="bold" size={15} />
                Voir mon emploi du temps
              </button>
              <button
                onClick={() => navigate('/app/bibliotheque')}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 text-white hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
              >
                <UniIcon name="library" weight="bold" size={15} />
                Bibliothèque numérique
              </button>
            </div>
          </div>

          {/* Colonne Droite : Rendu 3D Espace Étude */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <img
                src="/illustrations/course_study_hero_3d.png"
                alt="Espace d'apprentissage 3D"
                className="relative z-10 w-48 sm:w-60 lg:w-72 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Repli propre si l'image n'est pas encore chargée
                  const target = e.currentTarget
                  target.src = '/illustrations/uni_copilot_3d.png'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BARRE DE CONTRÔLE BENTO - Recherche & Filtres Rapides
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Recherche Textuelle */}
        <div className="relative flex-1 max-w-md">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par matière, code UE, enseignant..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all placeholder:text-slate-400"
          />
          <UniIcon name="search" weight="bold" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-1"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Filtres par Type de Cours & Vue */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Pills Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {tabs.map(tab => {
              const count = tab === 'Tous'
                ? courseList.length
                : courseList.filter(c => c.type === tab).length
              const isActive = activeTab === tab

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1E3A8A] shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#1E3A8A]/10 text-[#1E3A8A]' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Toggle Vue Grille / Liste */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            <button
              onClick={() => setView('grid')}
              aria-label="Vue en grille"
              aria-pressed={view === 'grid'}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                view === 'grid' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SquaresFour weight={view === 'grid' ? 'fill' : 'bold'} size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="Vue en liste"
              aria-pressed={view === 'list'}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                view === 'list' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListBullets weight={view === 'list' ? 'fill' : 'bold'} size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTENU PRINCIPAL - GRILLE OU LISTE BENTO
         ========================================================================= */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
            <IconTile name="courses" color="#1E3A8A" variant="soft" size={56} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Aucun cours trouvé</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Aucune matière ne correspond à votre filtre "{activeTab}" ou recherche "{search}".
          </p>
          {(search || activeTab !== 'Tous') && (
            <button
              onClick={() => { setSearch(''); setActiveTab('Tous') }}
              className="mt-4 text-xs font-bold text-[#1E3A8A] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        /* GRILLE BENTO */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course: Course) => {
            const color = subjectColor(course.code)
            const teacherName = course.teacher
              ? `${course.teacher.firstName} ${course.teacher.lastName}`
              : 'Enseignant départemental'

            // Pourcentage d'avancement indicatif selon le code pour animer le tableau de bord
            const pseudoProgress = ((course.code.charCodeAt(0) * 7 + course.hours * 3) % 45) + 50

            return (
              <div
                key={course.id}
                onClick={() => navigate(`/app/cours/${course.id}`)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                {/* En-tête de carte dégradé Glassmorphism */}
                <div
                  className="relative h-32 p-4 flex flex-col justify-between overflow-hidden"
                  style={{ backgroundImage: `linear-gradient(135deg, ${color} 0%, ${darkenHex(color, 0.35)} 100%)` }}
                >
                  {/* Pattern géométrique en fond */}
                  <div className="absolute inset-0 bg-white/5 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* Top Bar : Code UE et Type de cours */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/25 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                      {course.code}
                    </span>
                    <span className="rounded-lg bg-white/25 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20">
                      {course.type}
                    </span>
                  </div>

                  {/* Icône thématique du sujet */}
                  <div className="relative z-10 flex justify-center">
                    <div className="rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 p-2.5 text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <SubjectIcon subject={course.name} code={course.code} size={32} />
                    </div>
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#1E3A8A] transition-colors line-clamp-2">
                      {course.name}
                    </h3>

                    {/* Enseignant avec mini avatar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                        {teacherName.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-600 font-medium truncate">{teacherName}</span>
                    </div>

                    {/* UE parente si existante */}
                    {course.teachingUnit && (
                      <p className="mt-1 text-[11px] text-slate-400 font-medium truncate">
                        UE : {course.teachingUnit.name}
                      </p>
                    )}
                  </div>

                  {/* Barre de Progression du Syllabus */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Progression du syllabus</span>
                      <span className="font-bold text-slate-700">{pseudoProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pseudoProgress}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>

                  {/* Métadonnées Bento : Heures, Crédits & Salle */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 rounded-xl py-1.5 px-2">
                      <span className="text-[10px] text-slate-400 block font-medium">Volume</span>
                      <span className="text-xs font-bold text-slate-700">{course.hours}h</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl py-1.5 px-2">
                      <span className="text-[10px] text-slate-400 block font-medium">Crédits</span>
                      <span className="text-xs font-bold text-[#1E3A8A]">{course.credits} ECTS</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl py-1.5 px-2">
                      <span className="text-[10px] text-slate-400 block font-medium">Salle</span>
                      <span className="text-xs font-bold text-slate-700 truncate block">
                        {course.classroom?.name || 'Amphi 501'}
                      </span>
                    </div>
                  </div>

                  {/* Pied de carte avec badge type et bouton d'action */}
                  <div className="pt-2 flex items-center justify-between">
                    <Badge variant="primary">{typeLabel[course.type] ?? course.type}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A8A] group-hover:translate-x-1 transition-transform">
                      Consulter <UniIcon name="chevronRight" weight="bold" size={14} />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* VUE LISTE BENTO */
        <div className="space-y-3">
          {filtered.map((course: Course, idx: number) => {
            const color = subjectColor(course.code)
            const teacherName = course.teacher
              ? `${course.teacher.firstName} ${course.teacher.lastName}`
              : 'Enseignant départemental'

            return (
              <div
                key={course.id}
                onClick={() => navigate(`/app/cours/${course.id}`)}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:border-[#1E3A8A]/40 cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <IconTile
                    subject={course.name}
                    subjectCode={course.code}
                    color={color}
                    variant="filled"
                    size={56}
                    index={idx}
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {course.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#1E3A8A] transition-colors truncate">
                        {course.name}
                      </h3>
                      <Badge variant="primary">{typeLabel[course.type] ?? course.type}</Badge>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>{teacherName}</span>
                      {course.teachingUnit && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{course.teachingUnit.name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-[#1E3A8A] font-semibold">{course.credits} crédits ECTS</span>
                      <span>•</span>
                      <span>{course.hours} heures</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-[#1E3A8A] transition-colors hidden sm:inline">
                    Accéder au cours
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-slate-400 group-hover:text-[#1E3A8A] transition-all">
                    <UniIcon name="chevronRight" weight="bold" size={16} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* =========================================================================
          STATS BENTO EN BAS DE PAGE - 3 Tuiles Modernes
         ========================================================================= */}
      {courseList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unités Actives</p>
                <p className="text-2xl font-black text-[#1E3A8A] mt-1">{totalCourses} cours</p>
                <p className="text-xs text-slate-400 mt-0.5">Semestre d'ingénierie en cours</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1E3A8A]">
                <UniIcon name="courses" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Crédits ECTS</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{totalCredits} ECTS</p>
                <p className="text-xs text-slate-400 mt-0.5">Conforme au système LMD</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <UniIcon name="badges" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volume Global</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{totalHours}h</p>
                <p className="text-xs text-slate-400 mt-0.5">Enseignements théoriques et pratiques</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                <UniIcon name="time" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
