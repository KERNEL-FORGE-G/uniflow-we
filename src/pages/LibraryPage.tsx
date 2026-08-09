import { useState } from 'react'
import {
  Search,
  FileText,
  Video,
  Music,
  Download,
  Eye,
  BookOpen,
  FileType,
  Film,
  Headphones,
  File,
  Play,
  Pause,
  Sparkles,
  Star,
  HardDrive,
  X,
  Filter,
  Clock,
  RefreshCw
} from 'lucide-react'
import { cn } from '../utils/cn'
import { libraryApi, type LibraryResource } from '../lib/api'
import { useApi } from '../hooks/useApi'

type TabType = 'Documents' | 'Vidéos' | 'Audios' | 'Favoris'

interface ResourceItem {
  id: string
  title: string
  course: string
  type: string
  size: string
  date: string
  duration?: string
  category: TabType
  isFavorite?: boolean
  color: string
  btnColor: string
}

const initialResources: ResourceItem[] = [
  // Documents
  {
    id: 'doc-1',
    title: 'Cours Algorithmique & Structures de Données - Chapitre 1',
    course: 'INFO101',
    type: 'PDF',
    size: '2.4 MB',
    date: '12 Mai 2026',
    category: 'Documents',
    isFavorite: true,
    color: 'from-blue-600 to-indigo-700',
    btnColor: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-b-4 border-blue-900 shadow-lg shadow-blue-600/20'
  },
  {
    id: 'doc-2',
    title: 'TD Bases de données Relationnelles - Exercices Corrigés',
    course: 'INFO201',
    type: 'PDF',
    size: '1.8 MB',
    date: '10 Mai 2026',
    category: 'Documents',
    isFavorite: false,
    color: 'from-blue-600 to-indigo-700',
    btnColor: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-b-4 border-blue-900 shadow-lg shadow-blue-600/20'
  },
  {
    id: 'doc-3',
    title: 'Slides Présentation - Introduction aux Réseaux TCP/IP',
    course: 'INFO301',
    type: 'PPTX',
    size: '5.2 MB',
    date: '28 Avr 2026',
    category: 'Documents',
    isFavorite: true,
    color: 'from-amber-500 to-orange-600',
    btnColor: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white border-b-4 border-amber-950 shadow-lg shadow-amber-600/20'
  },
  {
    id: 'doc-4',
    title: 'Sujet Officiel Examen IA & Machine Learning 2025',
    course: 'INFO401',
    type: 'PDF',
    size: '850 KB',
    date: '15 Mar 2026',
    category: 'Documents',
    isFavorite: false,
    color: 'from-blue-600 to-indigo-700',
    btnColor: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-b-4 border-blue-900 shadow-lg shadow-blue-600/20'
  },

  // Vidéos
  {
    id: 'vid-1',
    title: 'Tutoriel - Introduction Pratique à l\'Algorithmique',
    course: 'INFO101',
    type: 'MP4 1080p',
    duration: '45:30',
    size: '120 MB',
    date: '14 Mai 2026',
    category: 'Vidéos',
    isFavorite: true,
    color: 'from-rose-500 to-red-600',
    btnColor: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border-b-4 border-rose-950 shadow-lg shadow-rose-600/20'
  },
  {
    id: 'vid-2',
    title: 'Conception Modèle Conceptuel de Données (MCD / MLD)',
    course: 'INFO201',
    type: 'MP4 4K',
    duration: '1:12:45',
    size: '280 MB',
    date: '08 Mai 2026',
    category: 'Vidéos',
    isFavorite: false,
    color: 'from-rose-500 to-red-600',
    btnColor: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border-b-4 border-rose-950 shadow-lg shadow-rose-600/20'
  },
  {
    id: 'vid-3',
    title: 'Analyse de Trames Wireshark & Modèle OSI (TP3)',
    course: 'INFO301',
    type: 'MP4 1080p',
    duration: '38:20',
    size: '95 MB',
    date: '25 Avr 2026',
    category: 'Vidéos',
    isFavorite: true,
    color: 'from-rose-500 to-red-600',
    btnColor: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border-b-4 border-rose-950 shadow-lg shadow-rose-600/20'
  },

  // Audios
  {
    id: 'aud-1',
    title: 'Podcast Étudiant - L\'Histoire de l\'Intelligence Artificielle',
    course: 'INFO401',
    type: 'MP3',
    duration: '28:45',
    size: '25 MB',
    date: '11 Mai 2026',
    category: 'Audios',
    isFavorite: true,
    color: 'from-teal-500 to-emerald-600',
    btnColor: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white border-b-4 border-teal-950 shadow-lg shadow-teal-600/20'
  },
  {
    id: 'aud-2',
    title: 'Interview Dr. Kamga - Méthodes de Travail en Université',
    course: 'Général',
    type: 'MP3',
    duration: '42:10',
    size: '38 MB',
    date: '29 Avr 2026',
    category: 'Audios',
    isFavorite: false,
    color: 'from-teal-500 to-emerald-600',
    btnColor: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white border-b-4 border-teal-950 shadow-lg shadow-teal-600/20'
  },
  {
    id: 'aud-3',
    title: 'Conférence - Blockchain, Web3 & Crypto-Monnaies',
    course: 'INFO301',
    type: 'MP3',
    duration: '1:18:20',
    size: '72 MB',
    date: '14 Fév 2026',
    category: 'Audios',
    isFavorite: true,
    color: 'from-teal-500 to-emerald-600',
    btnColor: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white border-b-4 border-teal-950 shadow-lg shadow-teal-600/20'
  }
]

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('Documents')
  const [search, setSearch] = useState('')
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('TOUS')
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ 'doc-1': true, 'doc-3': true, 'vid-1': true, 'vid-3': true, 'aud-1': true, 'aud-3': true })
  const [activeMedia, setActiveMedia] = useState<ResourceItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const { data: backendData, loading, refetch } = useApi(() => libraryApi.list())

  const apiResources: ResourceItem[] = (backendData ?? []).map((r: LibraryResource, i: number) => {
    const cat = (r.category === 'Vidéo' ? 'Vidéos' : r.category === 'Audio' ? 'Audios' : r.category || 'Documents') as TabType
    const isDoc = cat === 'Documents'
    const isVid = cat === 'Vidéos'
    return {
      id: r.id || `api-lib-${i}`,
      title: r.title,
      course: r.course || 'INFO101',
      type: r.type || (isDoc ? 'PDF' : isVid ? 'MP4' : 'MP3'),
      size: r.size || '2.0 MB',
      date: r.date || 'Mai 2026',
      duration: r.duration,
      category: cat,
      isFavorite: !!favorites[r.id],
      color: isDoc ? 'from-blue-600 to-indigo-700' : isVid ? 'from-rose-500 to-red-600' : 'from-teal-500 to-emerald-600',
      btnColor: isDoc
        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-b-4 border-blue-900 shadow-lg shadow-blue-600/20'
        : isVid
        ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border-b-4 border-rose-950 shadow-lg shadow-rose-600/20'
        : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white border-b-4 border-teal-950 shadow-lg shadow-teal-600/20'
    }
  })

  // Merge backend data with fallback resources if backend list is empty or complements
  const resources: ResourceItem[] = apiResources.length > 0 ? apiResources : initialResources

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const processedResources = resources.map(r => ({
    ...r,
    isFavorite: favorites[r.id] ?? r.isFavorite
  }))

  // Filter items
  const filtered = processedResources.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.course.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase())

    const matchesCourse = selectedCourseFilter === 'TOUS' || item.course === selectedCourseFilter

    if (activeTab === 'Favoris') return item.isFavorite && matchesSearch && matchesCourse
    return item.category === activeTab && matchesSearch && matchesCourse
  })

  // Stats calculation
  const docCount = processedResources.filter(r => r.category === 'Documents').length
  const videoCount = processedResources.filter(r => r.category === 'Vidéos').length
  const audioCount = processedResources.filter(r => r.category === 'Audios').length
  const favCount = processedResources.filter(r => r.isFavorite).length

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 3D Header & Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#0d9488] p-6 sm:p-8 text-white shadow-xl border-b-8 border-[#0f2560]">
        <div className="absolute -right-12 -bottom-12 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 h-40 w-40 rounded-full bg-teal-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md border border-white/30 text-white shadow-inner mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Espace Média 3D & Ressources</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              Bibliothèque Numérique Campus
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 max-w-xl leading-relaxed">
              Consultez, écoutez et téléchargez l'ensemble de vos supports de cours, vidéos HD et podcasts.
            </p>
          </div>

          {/* 3D Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md border border-white/25 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-transform hover:-translate-y-1">
              <div className="text-xl font-extrabold text-white">{docCount}</div>
              <div className="text-[10px] font-bold text-blue-100 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                <BookOpen className="h-3 w-3 text-blue-300" /> Docs
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md border border-white/25 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-transform hover:-translate-y-1">
              <div className="text-xl font-extrabold text-white">{videoCount}</div>
              <div className="text-[10px] font-bold text-rose-200 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                <Film className="h-3 w-3 text-rose-300" /> Vidéos
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md border border-white/25 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-transform hover:-translate-y-1">
              <div className="text-xl font-extrabold text-white">{audioCount}</div>
              <div className="text-[10px] font-bold text-teal-200 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                <Headphones className="h-3 w-3 text-teal-300" /> Audios
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md border border-white/25 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-transform hover:-translate-y-1">
              <div className="text-xl font-extrabold text-amber-300">{favCount}</div>
              <div className="text-[10px] font-bold text-amber-200 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                <Star className="h-3 w-3 text-amber-300 fill-amber-300" /> Favoris
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Tactile Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border-2 border-[#e5e7eb] shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto p-1">
          {/* TAB: Documents */}
          <button
            onClick={() => setActiveTab('Documents')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none shrink-0',
              activeTab === 'Documents'
                ? 'bg-blue-600 text-white shadow-[0_4px_0_0_#1e3a8a] border border-blue-400 -translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111827] shadow-[0_2px_0_0_#cbd5e1]'
            )}
          >
            <div className={cn(
              'flex h-6 w-6 items-center justify-center rounded-lg font-bold',
              activeTab === 'Documents' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
            )}>
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <span>Documents ({docCount})</span>
          </button>

          {/* TAB: Vidéos */}
          <button
            onClick={() => setActiveTab('Vidéos')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none shrink-0',
              activeTab === 'Vidéos'
                ? 'bg-rose-600 text-white shadow-[0_4px_0_0_#9f1239] border border-rose-400 -translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111827] shadow-[0_2px_0_0_#cbd5e1]'
            )}
          >
            <div className={cn(
              'flex h-6 w-6 items-center justify-center rounded-lg font-bold',
              activeTab === 'Vidéos' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
            )}>
              <Film className="h-3.5 w-3.5" />
            </div>
            <span>Vidéos ({videoCount})</span>
          </button>

          {/* TAB: Audios */}
          <button
            onClick={() => setActiveTab('Audios')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none shrink-0',
              activeTab === 'Audios'
                ? 'bg-teal-600 text-white shadow-[0_4px_0_0_#115e59] border border-teal-400 -translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111827] shadow-[0_2px_0_0_#cbd5e1]'
            )}
          >
            <div className={cn(
              'flex h-6 w-6 items-center justify-center rounded-lg font-bold',
              activeTab === 'Audios' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'
            )}>
              <Headphones className="h-3.5 w-3.5" />
            </div>
            <span>Audios ({audioCount})</span>
          </button>

          {/* TAB: Favoris */}
          <button
            onClick={() => setActiveTab('Favoris')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 select-none shrink-0',
              activeTab === 'Favoris'
                ? 'bg-amber-500 text-white shadow-[0_4px_0_0_#b45309] border border-amber-300 -translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111827] shadow-[0_2px_0_0_#cbd5e1]'
            )}
          >
            <div className={cn(
              'flex h-6 w-6 items-center justify-center rounded-lg font-bold',
              activeTab === 'Favoris' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
            )}>
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
            <span>Favoris ({favCount})</span>
          </button>
        </div>

        {/* Storage status */}
        <div className="hidden lg:flex items-center gap-2 bg-[#f8fafc] px-3 py-1.5 rounded-xl border border-[#e2e8f0] text-xs text-[#64748b]">
          <HardDrive className="h-4 w-4 text-[#0d9488]" />
          <span>Espace : <strong className="text-[#0f172a]">1.2 GB / 5 GB</strong></span>
        </div>
      </div>

      {/* 3D Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Bar */}
        <div className="sm:col-span-8 relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-[#9ca3af] pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Rechercher un cours, un mot-clé dans ${activeTab.toLowerCase()}...`}
            className="w-full rounded-2xl border-2 border-[#e5e7eb] bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/10 shadow-xs transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 rounded-lg p-1 text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Course Filter Dropdown */}
        <div className="sm:col-span-4 relative flex items-center">
          <Filter className="absolute left-3.5 h-4 w-4 text-[#1e3a8a] pointer-events-none" />
          <select
            value={selectedCourseFilter}
            onChange={e => setSelectedCourseFilter(e.target.value)}
            className="w-full rounded-2xl border-2 border-[#e5e7eb] bg-white py-2.5 pl-10 pr-8 text-sm font-bold text-[#1e3a8a] outline-none focus:border-[#1e3a8a] shadow-xs cursor-pointer appearance-none"
          >
            <option value="TOUS">Filtrer par cours (Tous)</option>
            <option value="INFO101">INFO101 — Algorithmique</option>
            <option value="INFO201">INFO201 — Bases de Données</option>
            <option value="INFO301">INFO301 — Réseaux TCP/IP</option>
            <option value="INFO401">INFO401 — Intelligence Artificielle</option>
            <option value="ECO101">ECO101 — Économie</option>
            <option value="Général">Général / Culture</option>
          </select>
          <div className="absolute right-3.5 pointer-events-none text-xs font-bold text-[#1e3a8a]">▼</div>
        </div>
      </div>

      {/* Main Resource Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(item => {
          const isDoc = item.category === 'Documents'
          const isVid = item.category === 'Vidéos'
          const isAud = item.category === 'Audios'

          return (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between rounded-3xl border-2 border-[#e5e7eb] bg-white p-5 shadow-md hover:shadow-2xl hover:border-blue-400/80 transition-all duration-200 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Colorful Accent Top Line */}
              <div className={cn('absolute top-0 left-0 right-0 h-2 bg-gradient-to-r', item.color)} />

              <div>
                {/* Header Badge & Action Icons */}
                <div className="flex items-start justify-between gap-3 mb-4 mt-1">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* 3D Solid Icon Badge Box */}
                    <div className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white font-black border-b-4 border-black/20 transform group-hover:scale-105 transition-transform shadow-md',
                      isDoc && 'bg-gradient-to-br from-blue-600 to-indigo-700',
                      isVid && 'bg-gradient-to-br from-rose-500 to-red-600',
                      isAud && 'bg-gradient-to-br from-teal-500 to-emerald-600'
                    )}>
                      {isDoc && (item.type === 'PPTX' ? <FileType className="h-6 w-6" /> : <FileText className="h-6 w-6" />)}
                      {isVid && <Film className="h-6 w-6" />}
                      {isAud && <Headphones className="h-6 w-6" />}
                    </div>

                    <div className="min-w-0">
                      <span className="inline-block rounded-lg bg-[#eff3ff] px-2.5 py-0.5 text-[11px] font-extrabold text-[#1e3a8a] border border-[#1e3a8a]/20">
                        {item.course}
                      </span>
                      <span className="ml-1.5 rounded-lg bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-bold text-[#6b7280]">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={cn(
                      'rounded-xl p-2 transition-all shadow-xs active:scale-90 border',
                      item.isFavorite
                        ? 'bg-amber-100 border-amber-300 text-amber-600 hover:bg-amber-200'
                        : 'bg-[#f8fafc] border-[#e2e8f0] text-[#94a3b8] hover:text-amber-500 hover:bg-amber-50'
                    )}
                    title={item.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Star className={cn('h-4 w-4', item.isFavorite && 'fill-amber-500')} />
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-[#111827] text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#1e3a8a] transition-colors">
                  {item.title}
                </h3>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#64748b] mb-5">
                  {item.duration && (
                    <span className="flex items-center gap-1 bg-[#f1f5f9] px-2 py-1 rounded-md text-[#334155]">
                      <Clock className="h-3.5 w-3.5 text-[#0d9488]" /> {item.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-[#f1f5f9] px-2 py-1 rounded-md text-[#334155]">
                    <HardDrive className="h-3.5 w-3.5 text-[#1e3a8a]" /> {item.size}
                  </span>
                  <span className="text-[11px] text-[#94a3b8] ml-auto">{item.date}</span>
                </div>
              </div>

              {/* 3D Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9]">
                <button
                  onClick={() => {
                    setActiveMedia(item)
                    setIsPlaying(true)
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 active:translate-y-0.5 select-none',
                    item.btnColor
                  )}
                >
                  {isDoc && <Eye className="h-4 w-4" />}
                  {isVid && <Play className="h-4 w-4 fill-current" />}
                  {isAud && <Music className="h-4 w-4" />}
                  <span>{isDoc ? 'Consulter' : isVid ? 'Visionner' : 'Écouter'}</span>
                </button>

                <button
                  onClick={() => {
                    alert(`Téléchargement initié pour : ${item.title} (${item.size})`)
                  }}
                  className="flex items-center justify-center rounded-xl bg-[#f1f5f9] border-2 border-[#cbd5e1] p-2.5 text-[#475569] hover:bg-[#e2e8f0] hover:text-[#0f172a] shadow-xs active:translate-y-0.5 transition-all"
                  title="Télécharger sur votre appareil"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-[#cbd5e1] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 border-2 border-blue-200 shadow-md">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-[#1e293b]">Aucun support trouvé</h3>
          <p className="text-xs text-[#64748b] mt-1 max-w-md mx-auto">
            Aucun élément ne correspond à votre recherche "{search}".
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedCourseFilter('TOUS'); setActiveTab('Documents') }}
            className="mt-4 rounded-xl bg-blue-600 text-white font-bold text-xs px-4 py-2 shadow-md hover:bg-blue-700 transition-all"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* 3D Interactive Media Preview Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border-4 border-slate-700 bg-slate-900 text-white p-6 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-md',
                  activeMedia.category === 'Documents' && 'bg-blue-600',
                  activeMedia.category === 'Vidéos' && 'bg-rose-600',
                  activeMedia.category === 'Audios' && 'bg-teal-600'
                )}>
                  {activeMedia.category === 'Documents' && <BookOpen className="h-5 w-5" />}
                  {activeMedia.category === 'Vidéos' && <Film className="h-5 w-5" />}
                  {activeMedia.category === 'Audios' && <Headphones className="h-5 w-5" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{activeMedia.course}</span>
                  <h3 className="text-base font-extrabold text-white leading-tight">{activeMedia.title}</h3>
                </div>
              </div>

              <button
                onClick={() => { setActiveMedia(null); setIsPlaying(false) }}
                className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Display */}
            {activeMedia.category === 'Vidéos' && (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-inner group">
                  {isPlaying ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="h-16 w-16 rounded-full bg-rose-600 text-white flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/30">
                        <Film className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-bold text-slate-200">Lecture vidéo interactive...</p>
                      <p className="text-xs text-slate-400">{activeMedia.title} ({activeMedia.type})</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="h-16 w-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all border-2 border-white/40"
                    >
                      <Play className="h-8 w-8 fill-current ml-1" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeMedia.category === 'Audios' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 p-6 border-2 border-teal-800/50 text-center space-y-4">
                  <div className="mx-auto h-20 w-20 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-500/20 border-2 border-teal-400">
                    <Music className="h-10 w-10 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-teal-300">{activeMedia.title}</p>
                    <p className="text-xs text-slate-400 mt-1">Durée : {activeMedia.duration} · Format : {activeMedia.type}</p>
                  </div>

                  {/* Audio Waveform */}
                  <div className="flex items-center justify-center gap-1 h-12 py-2">
                    {[40, 75, 30, 90, 60, 100, 45, 80, 20, 85, 50, 95, 35, 70, 90, 60, 40].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: isPlaying ? `${h}%` : '20%' }}
                        className={cn(
                          'w-1.5 rounded-full bg-teal-400 transition-all duration-300',
                          isPlaying && 'animate-pulse'
                        )}
                      />
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 text-slate-950 font-bold shadow-lg hover:bg-teal-400 transition-all"
                    >
                      {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeMedia.category === 'Documents' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-950 p-6 border-2 border-slate-800 text-center space-y-4 min-h-[220px] flex flex-col items-center justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 border-2 border-blue-400">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeMedia.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Taille : {activeMedia.size} · Mis à jour : {activeMedia.date}</p>
                  </div>
                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-300 max-w-md">
                    📄 Ce document PDF/PPTX est prêt pour la consultation interactive et l'annotation hors-ligne.
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Taille : {activeMedia.size}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Téléchargement de ${activeMedia.title}...`)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 font-bold text-white shadow-md transition-all"
                >
                  <Download className="h-4 w-4" /> Télécharger
                </button>
                <button
                  onClick={() => { setActiveMedia(null); setIsPlaying(false) }}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 font-bold text-slate-300 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

