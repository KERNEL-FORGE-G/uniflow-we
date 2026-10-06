import React, { useState, useEffect, useTransition } from 'react'
import {
  HiBookOpen,
  HiDocumentText,
  HiFilm,
  HiMusicalNote,
  HiSquares2X2,
  HiMagnifyingGlass,
  HiArrowDownTray,
  HiStar,
  HiPlay,
  HiPause,
  HiXMark,
  HiShare,
  HiListBullet,
  HiAdjustmentsHorizontal,
  HiFire,
  HiCheckCircle,
  HiCloudArrowDown,
  HiArrowPath,
  HiEye,
  HiSparkles
} from 'react-icons/hi2'
import { cn } from '../utils/cn'
import { libraryApi, type LibraryResource } from '../lib/api'
import { openLibraryService, type OpenBook, type BookCategory, BOOK_CATEGORIES } from '../lib/openLibraryService'
import { useApi } from '../hooks/useApi'
import { CornerSlot } from '../components/layout/CornerStack'

type MainMode = 'open-books' | 'course-docs'
type DocTabCategory = 'Tout' | 'Documents' | 'Vidéos' | 'Audios'
type ViewMode = 'grid' | 'list'
type SortOption = 'recent' | 'popular' | 'alpha' | 'cached'

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
  fileId?: string
}

export default function LibraryPage() {
  // Navigation principale
  const [mainMode, setMainMode] = useState<MainMode>('open-books')

  // Livres numériques ouverts & Manuels universitaires
  const [openBooks, setOpenBooks] = useState<OpenBook[]>([])
  const [selectedBookCategory, setSelectedBookCategory] = useState<BookCategory>('Tous')
  const [bookSearch, setBookSearch] = useState('')
  const [bookSortBy, setBookSortBy] = useState<SortOption>('popular')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [bookFavorites, setBookFavorites] = useState<string[]>(() => openLibraryService.getFavoriteIds())
  const [isLoadingBooks, setIsLoadingBooks] = useState(false)
  const [cachingBookId, setCachingBookId] = useState<string | null>(null)
  const [activeBookModal, setActiveBookModal] = useState<OpenBook | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const toggleBookFavorite = (bookId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const isNowFav = openLibraryService.toggleFavorite(bookId)
    setBookFavorites(openLibraryService.getFavoriteIds())
    setToastMessage(isNowFav ? 'Ajouté à vos favoris de lecture' : 'Retiré de vos favoris')
  }

  // Supports de cours classiques
  const [activeTab, setActiveTab] = useState<DocTabCategory>('Tout')
  const [courseSearch, setCourseSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [courseSortBy, setCourseSortBy] = useState<SortOption>('recent')
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})

  // Médias audio / vidéo
  const [activeMediaModal, setActiveMediaModal] = useState<ResourceItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeAudioItem, setActiveAudioItem] = useState<ResourceItem | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  // API Integration pour les supports de cours
  const { data: backendData } = useApi(() => libraryApi.list(), [], { key: 'library.list' })

  // Chargement initial et recherche des livres numériques libres
  const loadOpenBooks = async (query = '', category: BookCategory = 'Tous') => {
    setIsLoadingBooks(true)
    try {
      const results = await openLibraryService.search(query, category)
      setOpenBooks(results)
    } catch (err) {
      console.error('Erreur chargement livres:', err)
    } finally {
      setIsLoadingBooks(false)
    }
  }

  useEffect(() => {
    loadOpenBooks(bookSearch, selectedBookCategory)
  }, [selectedBookCategory])

  // Déclencheur recherche en direct avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOpenBooks(bookSearch, selectedBookCategory)
    }, 450)
    return () => clearTimeout(timer)
  }, [bookSearch])

  // Toast auto-hide
  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Caching d'un livre dans le Bucket UniFlow + Téléchargement
  const handleCacheAndDownloadBook = async (book: OpenBook, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCachingBookId(book.id)
    try {
      const updatedBook = await openLibraryService.cacheBookToBucket(book)
      // Mettre à jour l'état local
      setOpenBooks(prev => prev.map(b => (b.id === book.id ? updatedBook : b)))
      if (activeBookModal?.id === book.id) {
        setActiveBookModal(updatedBook)
      }

      setToastMessage(`✓ « ${book.title} » sauvegardé dans le bucket UniFlow et prêt au téléchargement !`)

      // Lancer le téléchargement
      if (updatedBook.downloadUrl) {
        window.open(updatedBook.downloadUrl, '_blank')
      } else {
        const dummyBlob = new Blob([`Livre numérique UniFlow: ${book.title}\nAuteurs: ${book.authors.join(', ')}`], { type: 'text/plain' })
        const url = URL.createObjectURL(dummyBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Erreur mise en bucket:', err)
      setToastMessage(`Erreur lors de la mise en bucket. Téléchargement direct initié.`)
      if (book.downloadUrl) window.open(book.downloadUrl, '_blank')
    } finally {
      setCachingBookId(null)
    }
  }

  // Filtrage et Tri des Livres Numériques
  const sortedOpenBooks = [...openBooks].sort((a, b) => {
    if (bookSortBy === 'cached') {
      if (a.cachedInBucket && !b.cachedInBucket) return -1
      if (!a.cachedInBucket && b.cachedInBucket) return 1
      return (b.downloadsCount || 0) - (a.downloadsCount || 0)
    }
    if (bookSortBy === 'popular') {
      return (b.downloadsCount || 0) - (a.downloadsCount || 0)
    }
    if (bookSortBy === 'alpha') {
      return a.title.localeCompare(b.title)
    }
    // recent
    return String(b.year || 0).localeCompare(String(a.year || 0))
  })

  const visibleOpenBooks = sortedOpenBooks.filter(b => {
    if (showFavoritesOnly && !bookFavorites.includes(b.id)) return false
    return true
  })

  // Mapping des supports de cours classiques
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
      course: r.course || 'Cours général',
      type: fileType,
      category: cat,
      size: r.size || 'Taille non renseignée',
      date: r.date || 'Récemment',
      duration: r.duration,
      tags: [r.course || 'Général', cat.slice(0, -1)],
      isFavorite: !!favorites[r.id],
      videoThumbnailGradient: 'from-blue-900 via-indigo-950 to-slate-900',
      fileId: r.fileId
    }
  })

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredCourseResources = apiResources.filter(item => {
    const matchesTab = activeTab === 'Tout' || item.category === activeTab
    const matchesSearch =
      item.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      item.course.toLowerCase().includes(courseSearch.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(courseSearch.toLowerCase())) ||
      item.type.toLowerCase().includes(courseSearch.toLowerCase())

    return matchesTab && matchesSearch
  })

  const sortedCourseResources = [...filteredCourseResources].sort((a, b) => {
    if (courseSortBy === 'recent') return b.id.localeCompare(a.id)
    if (courseSortBy === 'popular') {
      const popA = (a.downloads || 0) + (a.views || 0) + (a.listens || 0)
      const popB = (b.downloads || 0) + (b.views || 0) + (b.listens || 0)
      return popB - popA
    }
    if (courseSortBy === 'alpha') return a.title.localeCompare(b.title)
    return 0
  })

  // Compteurs
  const cachedBooksCount = openBooks.filter(b => b.cachedInBucket).length
  const totalBooksCount = openBooks.length
  const totalCoursesCount = apiResources.length

  return (
    <div className="space-y-6 pb-20 animate-fade-in font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#0D9488] text-white px-5 py-3 rounded-2xl shadow-xl border border-teal-400/30 animate-fade-in text-sm font-bold">
          <HiCheckCircle className="h-5 w-5 text-teal-100 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white">
            <HiXMark className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 1. HERO HEADER UNIFLOW — DESKTOP WIDE VIEWPORT */}
      <div className="bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs relative overflow-hidden">
        {/* Cercles décoratifs de fond aux couleurs de marque */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-50/70 pointer-events-none -z-0" />
        <div className="absolute right-32 -bottom-20 w-48 h-48 rounded-full bg-teal-50/60 pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#1E3A8A] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/60 flex items-center gap-1.5">
                <HiSparkles className="h-3.5 w-3.5 text-[#0D9488]" />
                Bibliothèque Numérique & Open Access
              </span>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 hidden sm:inline-flex items-center gap-1">
                <HiCheckCircle className="h-3.5 w-3.5 text-[#0D9488]" />
                Bucket Storage Synchronisé
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
              Bibliothèque Universitaire <span className="font-medium text-slate-400">· Libre Accès</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Consultez et téléchargez gratuitement des manuels académiques et polycopiés de cours. Chaque livre recherché est automatiquement indexé et mis en cache dans le bucket sécurisé UniFlow.
            </p>
          </div>

          {/* Statistiques clés en badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 text-center min-w-[100px]">
              <div className="text-xl sm:text-2xl font-black text-[#1E3A8A]">{totalBooksCount}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Manuels Libres</div>
            </div>
            <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-3.5 text-center min-w-[100px]">
              <div className="text-xl sm:text-2xl font-black text-[#0D9488]">{cachedBooksCount}</div>
              <div className="text-[10px] font-bold text-teal-800 uppercase mt-0.5">Dans le Bucket</div>
            </div>
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 text-center min-w-[100px] col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl font-black text-slate-800">{totalCoursesCount}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Supports Cours</div>
            </div>
          </div>
        </div>

        {/* ONGLETS MAJEURS : MANUELS OUVERTS vs SUPPORTS DE COURS */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setMainMode('open-books')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all duration-150',
                mainMode === 'open-books'
                  ? 'bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] text-white shadow-md shadow-blue-900/20'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <HiSparkles className="h-4 w-4 text-amber-300" />
              <span>Uni Book · Bibliothèque Libre</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', mainMode === 'open-books' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')}>
                {totalBooksCount}
              </span>
            </button>

            <button
              onClick={() => setMainMode('course-docs')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all duration-150',
                mainMode === 'course-docs'
                  ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <HiDocumentText className="h-4 w-4" />
              <span>Supports de Cours (Campus)</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', mainMode === 'course-docs' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')}>
                {totalCoursesCount}
              </span>
            </button>
          </div>

          {/* Outils secondaires (Recherche & Tri) */}
          {mainMode === 'open-books' ? (
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80 flex items-center bg-slate-50 rounded-full border border-slate-200 px-4 py-2">
                <HiMagnifyingGlass className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                  placeholder="Rechercher par titre, auteur ou matière..."
                  className="w-full bg-transparent text-xs font-medium text-slate-900 placeholder-slate-400 outline-none"
                />
                {bookSearch && (
                  <button onClick={() => setBookSearch('')} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                    <HiXMark className="h-4 w-4" />
                  </button>
                )}
                {isLoadingBooks && (
                  <HiArrowPath className="h-4 w-4 text-blue-600 animate-spin shrink-0 ml-1" />
                )}
              </div>

              <div className="relative flex items-center bg-slate-50 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 shrink-0">
                <HiAdjustmentsHorizontal className="h-3.5 w-3.5 mr-2 text-slate-500" />
                <select
                  value={bookSortBy}
                  onChange={e => setBookSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="popular">Plus populaires</option>
                  <option value="recent">Plus récents</option>
                  <option value="alpha">Titre A-Z</option>
                  <option value="cached">Dans le Bucket d'abord</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80 flex items-center bg-slate-50 rounded-full border border-slate-200 px-4 py-2">
                <HiMagnifyingGlass className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                  placeholder="Rechercher un document de cours..."
                  className="w-full bg-transparent text-xs font-medium text-slate-900 placeholder-slate-400 outline-none"
                />
                {courseSearch && (
                  <button onClick={() => setCourseSearch('')} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                    <HiXMark className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center rounded-full bg-slate-100 border border-slate-200 p-1 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-1.5 rounded-full text-xs transition-colors', viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400')}
                >
                  <HiSquares2X2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-1.5 rounded-full text-xs transition-colors', viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400')}
                >
                  <HiListBullet className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1 : VUE LIVRES NUMÉRIQUES & MANUELS LIBRES (OPEN ACCESS) */}
      {/* ============================================================== */}
      {mainMode === 'open-books' && (
        <div className="space-y-6">
          {/* BARRE DES CATÉGORIES / DISCIPLINES */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {BOOK_CATEGORIES.map(category => {
              const countInCat = openBooks.filter(b => category === 'Tous' || b.category === category).length
              return (
                <button
                  key={category}
                  onClick={() => setSelectedBookCategory(category)}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-150 select-none shrink-0 border',
                    selectedBookCategory === category
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md shadow-blue-900/15'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  )}
                >
                  <span>{category}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', selectedBookCategory === category ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
                    {countInCat}
                  </span>
                </button>
              )
            })}

            {/* Filtre spécial Favoris */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                'flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-150 select-none shrink-0 border ml-auto sm:ml-0',
                showFavoritesOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              )}
            >
              <HiStar className={cn('h-3.5 w-3.5', showFavoritesOnly ? 'text-white' : 'text-amber-500')} />
              <span>Favoris</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', showFavoritesOnly ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
                {bookFavorites.length}
              </span>
            </button>
          </div>

          {/* ÉTAT DE CHARGEMENT OU RÉSULTATS */}
          {isLoadingBooks && openBooks.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs space-y-4">
              <HiArrowPath className="mx-auto h-10 w-10 text-blue-600 animate-spin" />
              <h3 className="text-base font-bold text-slate-900">Recherche dans la bibliothèque numérique...</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Interrogation des catalogues ouverts et synchronisation automatique avec la base UniFlow.
              </p>
            </div>
          ) : visibleOpenBooks.length > 0 ? (
            /* GRILLE DES LIVRES (DESKTOP MULTI-COLONNES : 1 sur mobile, 2 sm, 3 lg, 4 xl) */
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleOpenBooks.map(book => {
                const isCaching = cachingBookId === book.id
                const isFav = bookFavorites.includes(book.id)

                return (
                  <div
                    key={book.id}
                    onClick={() => setActiveBookModal(book)}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div>
                      {/* En-tête de la carte avec couverture / visuel */}
                      <div className="relative aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-3 flex items-center justify-center overflow-hidden shadow-inner mb-3.5">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="h-full w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={e => {
                              // Fallback si l'image externe échoue
                              ;(e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="text-center p-4">
                            <HiBookOpen className="h-12 w-12 text-teal-400/80 mx-auto mb-2" />
                            <span className="text-[11px] font-bold text-slate-300 line-clamp-2">
                              {book.title}
                            </span>
                          </div>
                        )}

                        {/* Badges flottants en haut de la couverture */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
                          <span className="rounded-lg bg-black/75 px-2 py-0.5 text-[10px] font-black text-white tracking-wide">
                            {book.format}
                          </span>
                          {book.cachedInBucket ? (
                            <span className="rounded-lg bg-teal-600/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                              <HiCheckCircle className="h-3 w-3" />
                              Bucket
                            </span>
                          ) : (
                            <span className="rounded-lg bg-blue-600/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                              <HiSparkles className="h-3 w-3" />
                              Open Access
                            </span>
                          )}
                        </div>

                        {/* Bouton favori en haut à droite */}
                        <button
                          onClick={e => toggleBookFavorite(book.id, e)}
                          className={cn(
                            'absolute top-2.5 right-2.5 p-1.5 rounded-xl z-20 transition-all backdrop-blur-xs',
                            isFav ? 'bg-amber-500 text-white shadow-md' : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'
                          )}
                          title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <HiStar className="h-3.5 w-3.5" />
                        </button>

                        {/* Téléchargements */}
                        {book.downloadsCount && (
                          <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-slate-200 flex items-center gap-1 z-10">
                            <HiFire className="h-3 w-3 text-amber-400" />
                            {book.downloadsCount}
                          </div>
                        )}
                      </div>

                      {/* Métadonnées du livre */}
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#0D9488] mb-1">
                          {book.category}
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-1">
                          {book.authors.join(', ')}
                        </p>
                        {book.year && (
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">
                            Édition : {book.year} • {book.language}
                          </span>
                        )}
                        {book.description && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {book.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions en bas de carte */}
                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setActiveBookModal(book)
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 transition-colors"
                      >
                        <HiEye className="h-3.5 w-3.5 text-slate-500" />
                        <span>Aperçu</span>
                      </button>

                      <button
                        onClick={e => handleCacheAndDownloadBook(book, e)}
                        disabled={isCaching}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 rounded-xl text-white text-xs font-bold py-2 transition-all shadow-sm',
                          book.cachedInBucket
                            ? 'bg-[#0D9488] hover:bg-teal-700'
                            : 'bg-[#1E3A8A] hover:bg-blue-900'
                        )}
                      >
                        {isCaching ? (
                          <>
                            <HiArrowPath className="h-3.5 w-3.5 animate-spin" />
                            <span>Mise en bucket...</span>
                          </>
                        ) : book.cachedInBucket ? (
                          <>
                            <HiArrowDownTray className="h-3.5 w-3.5" />
                            <span>Télécharger</span>
                          </>
                        ) : (
                          <>
                            <HiCloudArrowDown className="h-3.5 w-3.5" />
                            <span>Obtenir (Bucket)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <HiBookOpen className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900">Aucun livre trouvé</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Essayez d'autres mots-clés ou sélectionnez une autre catégorie pour explorer les manuels disponibles.
              </p>
              <button
                onClick={() => {
                  setBookSearch('')
                  setSelectedBookCategory('Tous')
                }}
                className="mt-3 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold px-4 py-2 hover:bg-blue-900 transition-all"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2 : VUE SUPPORTS DE COURS LOCAUX DU CAMPUS              */}
      {/* ============================================================== */}
      {mainMode === 'course-docs' && (
        <div className="space-y-6">
          {/* Sous-onglets types (Tous, Documents, Vidéos, Audios) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab('Tout')}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-150 select-none shrink-0',
                activeTab === 'Tout'
                  ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              )}
            >
              <HiSquares2X2 className="h-3.5 w-3.5" />
              <span>Tout</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', activeTab === 'Tout' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
                {apiResources.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Documents')}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-150 select-none shrink-0',
                activeTab === 'Documents'
                  ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              )}
            >
              <HiBookOpen className="h-3.5 w-3.5" />
              <span>Documents</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', activeTab === 'Documents' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
                {apiResources.filter(r => r.category === 'Documents').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Vidéos')}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-150 select-none shrink-0',
                activeTab === 'Vidéos'
                  ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              )}
            >
              <HiFilm className="h-3.5 w-3.5" />
              <span>Vidéos</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', activeTab === 'Vidéos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
                {apiResources.filter(r => r.category === 'Vidéos').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Audios')}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-150 select-none shrink-0',
                activeTab === 'Audios'
                  ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              )}
            >
              <HiMusicalNote className="h-3.5 w-3.5" />
              <span>Audios</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', activeTab === 'Audios' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>
                {apiResources.filter(r => r.category === 'Audios').length}
              </span>
            </button>
          </div>

          {/* Grille ou Liste des supports */}
          {sortedCourseResources.length > 0 ? (
            <div className={cn('grid gap-5', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}>
              {sortedCourseResources.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveMediaModal(item)}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A]">
                        {item.category === 'Vidéos' ? <HiFilm className="h-5 w-5" /> : item.category === 'Audios' ? <HiMusicalNote className="h-5 w-5" /> : <HiDocumentText className="h-5 w-5" />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {item.type}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{item.course}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Taille : {item.size}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">{item.date}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        const dummyBlob = new Blob([`Support de cours: ${item.title}`], { type: 'text/plain' })
                        const url = URL.createObjectURL(dummyBlob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${item.type.toLowerCase()}`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-[#1E3A8A] hover:text-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                    >
                      <HiArrowDownTray className="h-3.5 w-3.5" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <HiDocumentText className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900">Aucun document de cours disponible</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Aucun support n'a encore été publié pour ce filtre ou cette matière.
              </p>
            </div>
          )}
        </div>
      )}

      {/* BANDEAU CHARTE ÉTHIQUE & RESPECT DU DROIT D'AUTEUR */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <HiSparkles className="h-5 w-5 text-[#0D9488] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-800">Engagement de Libre Accès & Respect du Copyright :</strong> UniFlow indexe exclusivement des ressources éducatives libres, des publications du domaine public et des manuels sous licences ouvertes (OpenStax, Project Gutenberg, Open Library, dépôts académiques). Aucun document protégé n'est diffusé sans autorisation légale.
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-bold text-teal-800 bg-teal-100/70 border border-teal-200 px-3 py-1 rounded-lg self-start sm:self-center">
          Open Access & Creative Commons
        </span>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1 : DÉTAIL & LECTURE D'UN LIVRE NUMÉRIQUE EN LIBRE ACCÈS */}
      {/* ============================================================== */}
      {activeBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white text-slate-900 p-6 sm:p-8 shadow-2xl overflow-hidden space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0D9488] bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                    {activeBookModal.category}
                  </span>
                  {activeBookModal.cachedInBucket && (
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <HiCheckCircle className="h-3 w-3" />
                      En cache permanent Bucket UniFlow
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">{activeBookModal.title}</h3>
                <p className="text-xs font-semibold text-slate-500">Par {activeBookModal.authors.join(', ')}</p>
              </div>

              <button
                onClick={() => setActiveBookModal(null)}
                className="rounded-xl bg-slate-100 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            {/* Corps de la modale */}
            <div className="space-y-4">
              <div className="flex gap-4">
                {activeBookModal.coverUrl && (
                  <img
                    src={activeBookModal.coverUrl}
                    alt={activeBookModal.title}
                    className="h-36 w-24 object-cover rounded-xl shadow-md border border-slate-200 shrink-0"
                  />
                )}
                <div className="space-y-2 text-xs text-slate-600 leading-relaxed flex-1">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                    <div><span className="font-bold text-slate-700">Format :</span> {activeBookModal.format}</div>
                    <div><span className="font-bold text-slate-700">Langue :</span> {activeBookModal.language}</div>
                    <div><span className="font-bold text-slate-700">Édition :</span> {activeBookModal.year || 'Standard'}</div>
                    <div><span className="font-bold text-slate-700">Source :</span> {activeBookModal.source}</div>
                  </div>
                  <p className="line-clamp-4 text-xs mt-2 text-slate-700">
                    {activeBookModal.description || 'Ouvrage académique et scientifique indexé pour les étudiants.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pied de la modale */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Disponibilité : Accès libre et gratuit</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveBookModal(null)}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-bold transition-all"
                >
                  Fermer
                </button>
                <button
                  onClick={e => handleCacheAndDownloadBook(activeBookModal, e)}
                  disabled={cachingBookId === activeBookModal.id}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white px-5 py-2 text-xs font-bold shadow-md transition-all"
                >
                  {cachingBookId === activeBookModal.id ? (
                    <>
                      <HiArrowPath className="h-4 w-4 animate-spin" />
                      <span>Mise en bucket en cours...</span>
                    </>
                  ) : activeBookModal.cachedInBucket ? (
                    <>
                      <HiArrowDownTray className="h-4 w-4" />
                      <span>Télécharger depuis le Bucket</span>
                    </>
                  ) : (
                    <>
                      <HiCloudArrowDown className="h-4 w-4" />
                      <span>Sauvegarder dans le Bucket & Télécharger</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2 : PRÉVISUALISATION SUPPORTS DE COURS                   */}
      {/* ============================================================== */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white text-slate-900 p-6 sm:p-8 shadow-2xl overflow-hidden space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="inline-block rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A] mb-1">
                  {activeMediaModal.course} • {activeMediaModal.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeMediaModal.title}</h3>
              </div>

              <button
                onClick={() => {
                  setActiveMediaModal(null)
                  setIsPlaying(false)
                }}
                className="rounded-xl bg-slate-100 p-2 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-8 border border-slate-100 text-center">
              <HiDocumentText className="mx-auto h-12 w-12 text-[#1E3A8A]" />
              <p className="mt-3 text-xs text-slate-600 font-medium">Document universitaire déposé pour vos révisions.</p>
              <p className="text-[11px] text-slate-400 mt-1">Taille : {activeMediaModal.size}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">{activeMediaModal.date}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dummyBlob = new Blob([`Support: ${activeMediaModal.title}`], { type: 'text/plain' })
                    const url = URL.createObjectURL(dummyBlob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${activeMediaModal.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${activeMediaModal.type.toLowerCase()}`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white px-4 py-2 text-xs font-bold shadow-md transition-all"
                >
                  <HiArrowDownTray className="h-4 w-4" />
                  <span>Télécharger</span>
                </button>
                <button
                  onClick={() => setActiveMediaModal(null)}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-bold transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de lecture audio flottante */}
      {activeAudioItem && (
        <CornerSlot>
          <div className="w-[calc(100vw-2rem)] sm:w-96 rounded-2xl border border-teal-500/40 bg-slate-900/95 p-3 text-white shadow-2xl flex items-center justify-between gap-3 animate-bounce-short">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D9488] text-white font-bold">
                <HiMusicalNote className="h-5 w-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-extrabold text-white truncate">{activeAudioItem.title}</h5>
                <p className="text-[10px] text-teal-300 font-medium">{activeAudioItem.course}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D9488] text-white font-bold hover:bg-teal-400 transition-all"
              >
                {isAudioPlaying ? <HiPause className="h-4 w-4" /> : <HiPlay className="h-4 w-4 ml-0.5" />}
              </button>
              <button
                type="button"
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
        </CornerSlot>
      )}
    </div>
  )
}
