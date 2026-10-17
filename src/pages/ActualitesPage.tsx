import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Newspaper,
  Calendar,
  User,
  Tag,
  Share2,
  FileText,
  Video,
  Download,
  ExternalLink,
  Search,
  Sparkles,
  Megaphone,
  CheckCircle2,
  ArrowRight,
  Flame,
  Info,
  Clock,
  Pin,
  AlertTriangle,
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { newsApi, type NewsItem } from '../lib/api'

const CHANNELS = [
  'Toutes les actualités',
  'Communiqué Officiel',
  'Pédagogie & Emploi du Temps',
  'Bibliothèque Universitaire',
  'Mises à jour & Tests',
]

export default function ActualitesPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChannel, setSelectedChannel] = useState('Toutes les actualités')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function fetchNews() {
      setLoading(true)
      try {
        const items = await newsApi.list()
        if (isMounted) setNews(items)
      } catch (err) {
        console.warn('Erreur de chargement des actualités:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchNews()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchChannel =
        selectedChannel === 'Toutes les actualités' ||
        item.channel?.toLowerCase() === selectedChannel.toLowerCase() ||
        (selectedChannel === 'Mises à jour & Tests' && item.tags?.some((t) => t.toLowerCase().includes('test') || t.toLowerCase().includes('mise à jour')))

      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))

      return matchChannel && matchQuery
    })
  }, [news, selectedChannel, searchQuery])

  const handleShare = (item: NewsItem) => {
    const url = window.location.href.split('#')[0] + `#/actualites`
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(`${item.title}\n\nÀ lire sur UniFlow : ${url}`)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 3000)
    }
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return 'Date récente'
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 font-sans selection:bg-[#0D9488] selection:text-white flex flex-col justify-between">
      <div>
        <LandingNavbar />

        {/* =========================================================================
            HERO BANNER - Design Pinterest Bento Newsroom
           ========================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] text-white py-16 sm:py-20 px-6 border-b border-white/10">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-6xl relative z-10 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 text-cyan-200">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Fil d’Actualités &amp; Journal Officiel</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Actualités, Communiqués &amp; Mises à Jour UniFlow
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-200/90 leading-relaxed font-medium">
              Suivez en direct les annonces de la direction académique, les nouveautés de déploiement de la plateforme, les notes de version et la vie du campus universitaire.
            </p>

            {/* Barre de recherche intégrée au hero */}
            <div className="max-w-xl mx-auto pt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une annonce, un mot-clé (ex: test, emploi du temps, Z-Library)..."
                  className="w-full rounded-2xl bg-white/95 backdrop-blur-md pl-12 pr-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none shadow-xl focus:ring-4 focus:ring-cyan-400/30 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BARRE DE FILTRES PAR CANAUX / CATÉGORIES
           ========================================================================= */}
        <section className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 shadow-xs">
          <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              {CHANNELS.map((ch) => {
                const active = selectedChannel === ch
                return (
                  <button
                    key={ch}
                    onClick={() => setSelectedChannel(ch)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#1E3A8A] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {ch}
                  </button>
                )
              })}
            </div>

            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
              <strong>{filteredNews.length}</strong> publication(s)
            </span>
          </div>
        </section>

        {/* =========================================================================
            LISTE DES ARTICLES ET CARTES D'ACTUALITÉ BENTO
           ========================================================================= */}
        <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl bg-slate-200/70 animate-pulse border border-slate-300/50"
                />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Info className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-800">Aucune actualité trouvée</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                Aucun article ne correspond à votre recherche « {searchQuery} » ou à ce canal.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedChannel('Toutes les actualités')
                }}
                className="mt-4 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredNews.map((item, idx) => {
                const isFeatured = item.pinned || idx === 0
                return (
                  <article
                    key={item.id}
                    className={`relative rounded-3xl bg-white border transition-all duration-300 shadow-sm hover:shadow-lg overflow-hidden ${
                      isFeatured
                        ? 'border-blue-300/80 ring-1 ring-blue-500/10'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Ruban pour article épinglé / important */}
                    {item.pinned && (
                      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-1.5 text-white flex items-center justify-between text-xs font-black uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Pin className="h-3.5 w-3.5" /> À La Une · Information Majeure
                        </span>
                        <span className="font-mono text-[10px] bg-black/20 px-2 py-0.5 rounded">
                          Phase Pilote Actuelle
                        </span>
                      </div>
                    )}

                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Métadonnées de l'article */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-[#1E3A8A] px-3 py-1 text-xs font-black uppercase tracking-wider">
                            <Megaphone className="h-3.5 w-3.5" />
                            {item.channel}
                          </span>
                          {item.important && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-xs font-bold">
                              <AlertTriangle className="h-3 w-3" /> Important
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                            <Calendar className="h-3.5 w-3.5" /> {formatDate(item.createdAt)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleShare(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1E3A8A] p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Partager cette actualité"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>{copiedId === item.id ? 'Lien copié !' : 'Partager'}</span>
                        </button>
                      </div>

                      {/* Titre */}
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                        {item.title}
                      </h2>

                      {/* Auteur */}
                      {item.author && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[10px]">
                            KF
                          </div>
                          <span>Publié par <strong>{item.author}</strong></span>
                        </div>
                      )}

                      {/* Médias 1 : Image avec légende détaillée (si présente) */}
                      {item.imageUrl && (
                        <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full max-h-[440px] object-cover sm:object-contain bg-slate-900/5 mx-auto"
                            onError={(e) => {
                              // Repli vers un visuel sûr si l'URL ne répond pas
                              e.currentTarget.src = '/illustrations/uni_copilot_3d.png'
                            }}
                          />
                          {item.imageCaption && (
                            <figcaption className="p-3 text-xs text-slate-600 bg-slate-100/80 border-t border-slate-200 flex items-center gap-2">
                              <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="italic">{item.imageCaption}</span>
                            </figcaption>
                          )}
                        </figure>
                      )}

                      {/* Corps de texte avec paragraphes bien espacés */}
                      <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line font-normal">
                        {item.content}
                      </div>

                      {/* Médias 2 : Vidéo intégrée (si présente) */}
                      {item.videoUrl && (
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <Video className="h-4 w-4 text-rose-600" />
                            <span>Vidéo Associée</span>
                          </div>
                          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 shadow-md">
                            {item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be') ? (
                              <iframe
                                src={item.videoUrl.replace('watch?v=', 'embed/')}
                                title={item.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={item.videoUrl}
                                controls
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Médias 3 : Document téléchargeable joint (si présent) */}
                      {item.documentUrl && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900">
                                {item.documentName || 'Document Officiel Joint (PDF)'}
                              </p>
                              <p className="text-[11px] text-emerald-800 font-medium">
                                Document vérifié par l'administration académique
                              </p>
                            </div>
                          </div>

                          <a
                            href={item.documentUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Télécharger le document</span>
                          </a>
                        </div>
                      )}

                      {/* Médias 4 : Bouton / Lien d'action externe (si présent) */}
                      {item.linkUrl && (
                        <div className="pt-2">
                          <Link
                            to={item.linkUrl}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
                          >
                            <span>{item.linkLabel || 'En savoir plus'}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* Étiquettes / Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                          <Tag className="h-3 w-3 text-slate-400 mr-1" />
                          {item.tags.map((tg) => (
                            <span
                              key={tg}
                              onClick={() => setSearchQuery(tg)}
                              className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                            >
                              #{tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>
      </div>

      <LandingFooter />
    </div>
  )
}
