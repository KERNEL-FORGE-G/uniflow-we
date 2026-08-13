import React, { useState } from 'react'
import {
  HiBookOpen,
  HiDocumentText,
  HiFilm,
  HiMusicalNote,
  HiSquares2X2,
  HiMagnifyingGlass,
  HiArrowDownTray,
  HiEye,
  HiStar,
  HiPlay,
  HiPause,
  HiXMark,
  HiShare,
  HiSpeakerWave,
  HiListBullet,
  HiAdjustmentsHorizontal,
  HiClock,
  HiFire,
  HiEllipsisVertical,
  HiCheckCircle,
  HiTag
} from 'react-icons/hi2'
import { cn } from '../utils/cn'
import { libraryApi, type LibraryResource } from '../lib/api'
import { useApi } from '../hooks/useApi'

type TabCategory = 'Tout' | 'Documents' | 'Vidéos' | 'Audios'
type ViewMode = 'grid' | 'list'
type SortOption = 'recent' | 'popular' | 'alpha'

interface ResourceItem {
  id: string
  title: string
  course: string
  type: 'PDF' | 'DOCX' | 'PPTX' | 'MP4' | 'MP3'
  category: 'Documents' | 'Vidéos' | 'Audios'
  size: string
  date: string
  downloads?: number
  views?: number
  listens?: number
  duration?: string
  tags: string[]
  isFavorite?: boolean
  videoThumbnailGradient?: string
  audioColor?: string
}

const initialResources: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'Cours Algorithmique - Chapitre 1',
    course: 'INFO101',
    type: 'PDF',
    category: 'Documents',
    size: '2.4 MB',
    date: '15 mai 2026',
    downloads: 245,
    tags: ['Algorithmique', 'Cours'],
    isFavorite: true
  },
  {
    id: 'res-2',
    title: "Introduction à l'Algorithmique",
    course: 'INFO101',
    type: 'MP4',
    category: 'Vidéos',
    size: '120 MB',
    date: '14 mai 2026',
    duration: '45:30',
    views: 1250,
    tags: ['Algorithmique'],
    isFavorite: false,
    videoThumbnailGradient: 'from-blue-900 via-indigo-900 to-slate-900'
  },
  {
    id: 'res-3',
    title: "Podcast - Histoire de l'IA",
    course: 'INFO401',
    type: 'MP3',
    category: 'Audios',
    size: '25 MB',
    date: '11 mai 2026',
    duration: '28:45',
    listens: 456,
    tags: ['IA', 'Podcast'],
    isFavorite: true
  },
  {
    id: 'res-4',
    title: 'TD Bases de données - Exercices',
    course: 'INFO201',
    type: 'PDF',
    category: 'Documents',
    size: '1.8 MB',
    date: '12 mai 2026',
    downloads: 189,
    tags: ['BDD', 'TD'],
    isFavorite: false
  },
  {
    id: 'res-5',
    title: 'TP Python - Structures de données',
    course: 'INFO102',
    type: 'DOCX',
    category: 'Documents',
    size: '1.2 MB',
    date: '10 mai 2026',
    downloads: 310,
    tags: ['Python', 'TP'],
    isFavorite: true
  },
  {
    id: 'res-6',
    title: 'Conception Modèle Conceptuel (MCD)',
    course: 'INFO201',
    type: 'MP4',
    category: 'Vidéos',
    size: '280 MB',
    date: '08 mai 2026',
    duration: '1:12:45',
    views: 890,
    tags: ['BDD', 'SGBD'],
    isFavorite: false,
    videoThumbnailGradient: 'from-indigo-900 via-purple-900 to-slate-900'
  },
  {
    id: 'res-7',
    title: 'Rapport Projet Web Fullstack',
    course: 'INFO302',
    type: 'DOCX',
    category: 'Documents',
    size: '3.5 MB',
    date: '05 mai 2026',
    downloads: 142,
    tags: ['Web', 'Projet'],
    isFavorite: false
  },
  {
    id: 'res-8',
    title: 'Interview Dr. Kamga - Méthodologie',
    course: 'GÉNÉRAL',
    type: 'MP3',
    category: 'Audios',
    size: '38 MB',
    date: '01 mai 2026',
    duration: '42:10',
    listens: 820,
    tags: ['Orientation', 'Podcast'],
    isFavorite: false
  },
  {
    id: 'res-9',
    title: 'Analyse Trames Wireshark & TCP/IP',
    course: 'INFO301',
    type: 'MP4',
    category: 'Vidéos',
    size: '195 MB',
    date: '25 avr 2026',
    duration: '2:15:30',
    views: 1890,
    tags: ['Réseaux', 'TP'],
    isFavorite: true,
    videoThumbnailGradient: 'from-blue-950 via-teal-900 to-slate-900'
  },
  {
    id: 'res-10',
    title: 'Cours Réseaux - Modèle OSI & TCP/IP',
    course: 'INFO301',
    type: 'PDF',
    category: 'Documents',
    size: '4.1 MB',
    date: '20 avr 2026',
    downloads: 520,
    tags: ['Réseaux', 'Cours'],
    isFavorite: false
  },
  {
    id: 'res-11',
    title: 'Conférence - Web3 & Cryptographie',
    course: 'INFO301',
    type: 'MP3',
    category: 'Audios',
    size: '72 MB',
    date: '14 fev 2026',
    duration: '1:18:20',
    listens: 630,
    tags: ['Crypto', 'Podcast'],
    isFavorite: true
  }
]

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabCategory>('Tout')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'res-1': true,
    'res-3': true,
    'res-5': true,
    'res-9': true,
    'res-11': true
  })

  // Active Media Players
  const [activeMediaModal, setActiveMediaModal] = useState<ResourceItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeAudioItem, setActiveAudioItem] = useState<ResourceItem | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  // API Integration
  const { data: backendData } = useApi(() => libraryApi.list())

  const apiResources: ResourceItem[] = (backendData ?? []).map((r: LibraryResource, i: number) => {
    const cat: 'Documents' | 'Vidéos' | 'Audios' =
      r.category === 'Vidéo' || r.category === 'Vidéos'
        ? 'Vidéos'
        : r.category === 'Audio' || r.category === 'Audios'
        ? 'Audios'
        : 'Documents'

    const fileType = (r.type as any) || (cat === 'Documents' ? 'PDF' : cat === 'Vidéos' ? 'MP4' : 'MP3')

    return {
      id: r.id || `api-res-${i}`,
      title: r.title,
      course: r.course || 'INFO101',
      type: fileType,
      category: cat,
      size: r.size || '2.0 MB',
      date: r.date || 'Mai 2026',
      duration: r.duration || (cat === 'Vidéos' ? '15:00' : cat === 'Audios' ? '20:00' : undefined),
      downloads: Math.floor(Math.random() * 300) + 50,
      views: cat === 'Vidéos' ? Math.floor(Math.random() * 1000) + 200 : undefined,
      listens: cat === 'Audios' ? Math.floor(Math.random() * 500) + 100 : undefined,
      tags: [r.course || 'Général', cat.slice(0, -1)],
      isFavorite: !!favorites[r.id],
      videoThumbnailGradient: 'from-blue-900 via-indigo-950 to-slate-900'
    }
  })

  const resourcesList = apiResources.length > 0 ? [...apiResources, ...initialResources] : initialResources

  // Toggle favorite
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Filter & Search
  const filtered = resourcesList.filter(item => {
    const matchesTab = activeTab === 'Tout' || item.category === activeTab
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.course.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      item.type.toLowerCase().includes(search.toLowerCase())

    return matchesTab && matchesSearch
  })

  // Sorting
  const sortedResources = [...filtered].sort((a, b) => {
    if (sortBy === 'recent') return b.id.localeCompare(a.id)
    if (sortBy === 'popular') {
      const popA = (a.downloads || 0) + (a.views || 0) + (a.listens || 0)
      const popB = (b.downloads || 0) + (b.views || 0) + (b.listens || 0)
      return popB - popA
    }
    if (sortBy === 'alpha') return a.title.localeCompare(b.title)
    return 0
  })

  // Counters
  const totalCount = resourcesList.length
  const docCount = resourcesList.filter(r => r.category === 'Documents').length
  const videoCount = resourcesList.filter(r => r.category === 'Vidéos').length
  const audioCount = resourcesList.filter(r => r.category === 'Audios').length

  const handleDownload = (item: ResourceItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    // Trigger download feedback
    const blob = new Blob([`UniFlow Resource: ${item.title}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.${item.type.toLowerCase()}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in font-sans text-slate-800">
      {/* 1. HERO GRADIENT BANNER WITH KPI STATS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1739] via-[#0f2869] to-[#0d7870] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        {/* Glow visual effects */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 h-56 w-56 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Bibliothèque
            </h1>
            <p className="text-sm sm:text-base text-blue-100/80 mt-1.5 max-w-2xl font-normal leading-relaxed">
              Accédez à tous vos supports de cours, vidéos et contenus audio en un seul endroit
            </p>
          </div>

          {/* KPI STAT CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* KPI 1: Total */}
            <div className="flex items-center gap-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 transition-transform hover:scale-[1.02]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <HiSquares2X2 className="h-5 w-5 text-blue-200" />
              </div>
              <div>
                <div className="text-2xl font-black text-white leading-none">{totalCount}</div>
                <div className="text-xs font-semibold text-blue-200/90 mt-1">Total</div>
              </div>
            </div>

            {/* KPI 2: Documents */}
            <div className="flex items-center gap-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 transition-transform hover:scale-[1.02]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <HiBookOpen className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <div className="text-2xl font-black text-white leading-none">{docCount}</div>
                <div className="text-xs font-semibold text-blue-200/90 mt-1">Documents</div>
              </div>
            </div>

            {/* KPI 3: Vidéos */}
            <div className="flex items-center gap-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 transition-transform hover:scale-[1.02]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <HiFilm className="h-5 w-5 text-indigo-200" />
              </div>
              <div>
                <div className="text-2xl font-black text-white leading-none">{videoCount}</div>
                <div className="text-xs font-semibold text-blue-200/90 mt-1">Vidéos</div>
              </div>
            </div>

            {/* KPI 4: Audios */}
            <div className="flex items-center gap-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 transition-transform hover:scale-[1.02]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <HiMusicalNote className="h-5 w-5 text-teal-300" />
              </div>
              <div>
                <div className="text-2xl font-black text-white leading-none">{audioCount}</div>
                <div className="text-xs font-semibold text-blue-200/90 mt-1">Audios</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & TOOLBAR ROW */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar Input */}
        <div className="relative flex-1 w-full">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre, cours ou tags..."
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-100/80 dark:bg-slate-800/80 py-3 pl-11 pr-10 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Right Tools: Sort & View Toggle */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sort Dropdown Selector */}
          <div className="relative flex items-center bg-slate-100/90 rounded-2xl border border-slate-200/90 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition-all cursor-pointer">
            <HiAdjustmentsHorizontal className="h-3.5 w-3.5 mr-2 text-slate-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-transparent outline-none cursor-pointer pr-4 font-semibold text-slate-700 appearance-none"
            >
              <option value="recent">Plus récents</option>
              <option value="popular">Plus populaires</option>
              <option value="alpha">Nom (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200/90 bg-slate-100/90 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-xl p-2 transition-all',
                viewMode === 'grid'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
              title="Vue en grille"
            >
              <HiSquares2X2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-xl p-2 transition-all',
                viewMode === 'list'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
              title="Vue en liste"
            >
              <HiListBullet className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY PILLS FILTER BAR */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* Tab: Tout */}
        <button
          onClick={() => setActiveTab('Tout')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-150 select-none shrink-0',
            activeTab === 'Tout'
              ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-900/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          )}
        >
          <HiSquares2X2 className="h-3.5 w-3.5" />
          <span>Tout</span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', activeTab === 'Tout' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
            {totalCount}
          </span>
        </button>

        {/* Tab: Documents */}
        <button
          onClick={() => setActiveTab('Documents')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-150 select-none shrink-0',
            activeTab === 'Documents'
              ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-900/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          )}
        >
          <HiBookOpen className="h-3.5 w-3.5" />
          <span>Documents</span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', activeTab === 'Documents' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
            {docCount}
          </span>
        </button>

        {/* Tab: Vidéos */}
        <button
          onClick={() => setActiveTab('Vidéos')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-150 select-none shrink-0',
            activeTab === 'Vidéos'
              ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-900/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          )}
        >
          <HiFilm className="h-3.5 w-3.5" />
          <span>Vidéos</span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', activeTab === 'Vidéos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
            {videoCount}
          </span>
        </button>

        {/* Tab: Audios */}
        <button
          onClick={() => setActiveTab('Audios')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-150 select-none shrink-0',
            activeTab === 'Audios'
              ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-900/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          )}
        >
          <HiMusicalNote className="h-3.5 w-3.5" />
          <span>Audios</span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', activeTab === 'Audios' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
            {audioCount}
          </span>
        </button>
      </div>

      {/* 4. RESOURCE ITEMS DISPLAY GRID OR LIST */}
      {viewMode === 'grid' ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {sortedResources.map(item => {
            const isFav = favorites[item.id] ?? item.isFavorite

            // A. VIDEO CARD LAYOUT
            if (item.category === 'Vidéos') {
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveMediaModal(item)
                    setIsPlaying(true)
                  }}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-2.5 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {/* Top Video Thumbnail Box */}
                  <div className={cn('relative aspect-video w-full rounded-2xl bg-gradient-to-br p-3 flex items-center justify-center overflow-hidden shadow-inner', item.videoThumbnailGradient || 'from-slate-900 to-indigo-950')}>
                    {/* Floating Badges Top Left */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white tracking-wide">
                        {item.duration || '45:30'}
                      </span>
                      {item.views && (
                        <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-slate-200 flex items-center gap-1">
                          <HiFire className="h-3 w-3 text-emerald-400" />
                          {item.views}
                        </span>
                      )}
                    </div>

                    {/* Floating Share Button Bottom Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`Lien copié pour : ${item.title}`)
                      }}
                      className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/50 backdrop-blur-md p-1.5 text-white/80 hover:text-white hover:bg-black/70 transition-all z-10"
                      title="Partager"
                    >
                      <HiShare className="h-3.5 w-3.5" />
                    </button>

                    {/* Center Big White Play Circle */}
                    <div className="h-12 w-12 rounded-full bg-white text-[#1e3a8a] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <HiPlay className="h-6 w-6 ml-0.5 text-[#1e3a8a]" />
                    </div>
                  </div>

                  {/* Below Thumbnail Info */}
                  <div className="p-2 pt-3 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                        <span className="font-bold text-slate-700">{item.course}</span>
                        {item.size && <span>• {item.size}</span>}
                      </div>

                      {/* Tag Pill */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            // B. AUDIO CARD LAYOUT
            if (item.category === 'Audios') {
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-200 overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Row: Audio Icon Box & Meta */}
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                        <HiMusicalNote className="h-6 w-6" />
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className={cn(
                          'p-1.5 rounded-xl transition-all',
                          isFav ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-300 hover:text-slate-500'
                        )}
                      >
                        <HiStar className={cn('h-4 w-4', isFav && 'text-amber-500')} />
                      </button>
                    </div>

                    {/* Title & Course */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-xs font-bold text-slate-500 mt-0.5 block">{item.course}</span>
                    </div>

                    {/* Audio Waveform Equalizer Graphic */}
                    <div className="flex items-center gap-1 h-6 py-1 my-1">
                      {[30, 65, 45, 90, 75, 40, 85, 60, 95, 50, 70, 35, 80, 55, 90, 45].map((h, idx) => (
                        <div
                          key={idx}
                          style={{ height: `${h}%` }}
                          className="flex-1 rounded-full bg-emerald-300 dark:bg-emerald-600/60"
                        />
                      ))}
                    </div>

                    {/* Meta info row */}
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span>{item.duration || '28:45'}</span>
                      {item.listens && <span>👁 {item.listens} écoutes</span>}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-3">
                    <button
                      onClick={() => {
                        setActiveAudioItem(item)
                        setIsAudioPlaying(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <HiPlay className="h-3.5 w-3.5" />
                      <span>Écouter</span>
                    </button>

                    <button
                      onClick={(e) => handleDownload(item, e)}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
                      title="Télécharger"
                    >
                      <HiArrowDownTray className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => alert(`Son activé pour ${item.title}`)}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
                      title="Aperçu audio"
                    >
                      <HiSpeakerWave className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            }

            // C. DOCUMENT / PDF / DOCX CARD LAYOUT
            const isPdf = item.type === 'PDF'
            const isDocx = item.type === 'DOCX'

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Top Row: File Badge + Menu */}
                  <div className="flex items-start justify-between">
                    {/* Badge File Format */}
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-black uppercase tracking-wider shadow-xs',
                        isPdf && 'bg-rose-100 text-rose-700 border border-rose-200',
                        isDocx && 'bg-blue-100 text-blue-700 border border-blue-200',
                        !isPdf && !isDocx && 'bg-amber-100 text-amber-700 border border-amber-200'
                      )}>
                        <HiDocumentText className="h-3.5 w-3.5" />
                        <span>{item.type.toLowerCase()}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`Menu option pour : ${item.title}`)
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <HiEllipsisVertical className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Title & Course */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs font-bold text-slate-400 mt-1 block">{item.course}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta stats */}
                  <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400 pt-1">
                    <span>{item.size}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HiArrowDownTray className="h-3 w-3" /> {item.downloads || 240}
                    </span>
                    <span className="ml-auto text-[10px] text-slate-400">{item.date}</span>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-3">
                  <button
                    onClick={(e) => handleDownload(item, e)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-[#1e3a8a] hover:bg-blue-900 text-white py-2.5 px-4 text-xs font-bold shadow-md shadow-blue-900/20 active:scale-95 transition-all"
                  >
                    <HiArrowDownTray className="h-3.5 w-3.5" />
                    <span>Télécharger</span>
                  </button>

                  <button
                    onClick={() => setActiveMediaModal(item)}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
                    title="Aperçu"
                  >
                    <HiEye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className={cn(
                      'p-2.5 rounded-xl border transition-all',
                      isFav
                        ? 'border-amber-200 bg-amber-50 text-amber-500'
                        : 'border-slate-200 text-slate-400 hover:bg-slate-100'
                    )}
                    title="Favori"
                  >
                    <HiStar className={cn('h-4 w-4', isFav && 'text-amber-500')} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW MODE */
        <div className="space-y-3">
          {sortedResources.map(item => {
            const isFav = favorites[item.id] ?? item.isFavorite
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-bold',
                    item.category === 'Documents' && 'bg-blue-600',
                    item.category === 'Vidéos' && 'bg-indigo-600',
                    item.category === 'Audios' && 'bg-emerald-600'
                  )}>
                    {item.category === 'Documents' && <HiDocumentText className="h-5 w-5" />}
                    {item.category === 'Vidéos' && <HiFilm className="h-5 w-5" />}
                    {item.category === 'Audios' && <HiMusicalNote className="h-5 w-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm truncate">{item.title}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 shrink-0">
                        {item.course}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => setActiveMediaModal(item)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5"
                  >
                    <HiEye className="h-3.5 w-3.5" />
                    <span>Aperçu</span>
                  </button>

                  <button
                    onClick={(e) => handleDownload(item, e)}
                    className="rounded-xl bg-[#1e3a8a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-900 transition-all flex items-center gap-1.5"
                  >
                    <HiArrowDownTray className="h-3.5 w-3.5" />
                    <span>Télécharger</span>
                  </button>

                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className={cn('p-2 rounded-xl border transition-all', isFav ? 'bg-amber-50 border-amber-200 text-amber-500' : 'border-slate-200 text-slate-400')}
                  >
                    <HiStar className={cn('h-4 w-4', isFav && 'text-amber-500')} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* EMPTY SEARCH STATE */}
      {sortedResources.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
            <HiBookOpen className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Aucune ressource trouvée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Aucun document, vidéo ou audio ne correspond à votre filtre "{search}".
          </p>
          <button
            onClick={() => { setSearch(''); setActiveTab('Tout') }}
            className="mt-4 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold px-4 py-2 hover:bg-blue-900 transition-all"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* 5. INTERACTIVE VIDEO & RESOURCE PREVIEW MODAL */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 text-white p-6 shadow-2xl overflow-hidden space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="inline-block rounded-md bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 mb-1">
                  {activeMediaModal.course} • {activeMediaModal.category}
                </span>
                <h3 className="text-lg font-bold text-white">{activeMediaModal.title}</h3>
              </div>

              <button
                onClick={() => {
                  setActiveMediaModal(null)
                  setIsPlaying(false)
                }}
                className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Preview */}
            {activeMediaModal.category === 'Vidéos' ? (
              <div className="relative aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-800">
                <video
                  controls
                  autoPlay
                  playsInline
                  src="/video/demo.mp4"
                  poster="https://i.imgur.com/GAiZ7WY.png"
                  className="w-full h-full object-contain"
                >
                  Votre navigateur ne supporte pas la vidéo.
                </video>
              </div>
            ) : activeMediaModal.category === 'Audios' ? (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 border border-emerald-800/40 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                  <HiMusicalNote className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-300">{activeMediaModal.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Durée : {activeMediaModal.duration} • Taille : {activeMediaModal.size}</p>
                </div>
                {/* Audio Waveform */}
                <div className="flex items-center justify-center gap-1.5 h-10 py-1">
                  {[40, 80, 50, 100, 65, 85, 30, 95, 70, 45, 90, 60, 80, 40].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-full bg-emerald-400 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Document Viewer Mock */
              <div className="rounded-2xl bg-slate-950 p-8 border border-slate-800 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                  <HiDocumentText className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{activeMediaModal.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Format : {activeMediaModal.type} • Taille : {activeMediaModal.size} • Date : {activeMediaModal.date}</p>
                </div>
                <div className="rounded-xl bg-slate-900 p-4 text-xs text-slate-300 max-w-md mx-auto border border-slate-800">
                  📄 Aperçu du document pédagogique révisé pour l'université. Vous pouvez le télécharger ou le consulter en mode plein écran.
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Taille : {activeMediaModal.size}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDownload(activeMediaModal, e)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold shadow-md transition-all"
                >
                  <HiArrowDownTray className="h-4 w-4" />
                  <span>Télécharger le fichier</span>
                </button>
                <button
                  onClick={() => setActiveMediaModal(null)}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 text-xs font-bold transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. FLOATING AUDIO PLAYER BAR */}
      {activeAudioItem && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 rounded-2xl border border-emerald-500/40 bg-slate-900/95 backdrop-blur-md p-3 text-white shadow-2xl flex items-center justify-between gap-3 animate-bounce-short">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
              <HiMusicalNote className="h-5 w-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-extrabold text-white truncate">{activeAudioItem.title}</h5>
              <p className="text-[10px] text-emerald-400 font-medium">{activeAudioItem.course} • {activeAudioItem.duration}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAudioPlaying(!isAudioPlaying)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all"
            >
              {isAudioPlaying ? <HiPause className="h-4 w-4" /> : <HiPlay className="h-4 w-4 ml-0.5" />}
            </button>
            <button
              onClick={() => {
                setActiveAudioItem(null)
                setIsAudioPlaying(false)
              }}
              className="p-1 text-slate-400 hover:text-white"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
