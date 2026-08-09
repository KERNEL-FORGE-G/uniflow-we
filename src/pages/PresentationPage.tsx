import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Play, CheckCircle, ArrowRight, GraduationCap, UserCheck, 
  Megaphone, Settings, Microscope, Wifi, Smartphone, Lock, Lightbulb, 
  BookOpen, ListChecks, Target, ChevronLeft, ChevronRight, Share2, 
  Sparkles, Monitor, Youtube, Film
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'

interface VideoItem {
  id: string
  title: string
  description: string
  type: 'youtube' | 'local'
  embedUrl?: string
  videoSrc?: string
  linkUrl: string
  category: string
  duration: string
  badgeColor: string
}

const VIDEOS: VideoItem[] = [
  {
    id: 'uniflow-intro',
    title: 'UniFlow — La Plateforme qui Simplifie la Gestion Universitaire',
    description: 'Présentation officielle complète de la solution tout-en-un UniFlow pour moderniser la gestion académique et la vie de campus.',
    type: 'youtube',
    embedUrl: 'https://www.youtube-nocookie.com/embed/cIXm0cJJH18?autoplay=0&rel=0',
    linkUrl: 'https://youtu.be/cIXm0cJJH18',
    category: 'Présentation Principale',
    duration: '3:45',
    badgeColor: 'bg-blue-100 text-[#1e3a8a] border-blue-200'
  },
  {
    id: 'uniflow-demo-platform',
    title: 'Démo Complète de la Plateforme UniFlow',
    description: 'Parcours interactif à travers l\'interface globale : espaces Étudiant, Enseignant, Délégué et le panneau Administration.',
    type: 'local',
    videoSrc: '/video/uniflow-presentation.mp4',
    linkUrl: 'https://uniflow.kernelforge.codes',
    category: 'Démonstration Produit',
    duration: '5:20',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  {
    id: 'uniflow-sentinelle-iot',
    title: 'UniFlow Sentinelle — Module IoT & Pré-diagnostic Santé',
    description: 'Aperçu du système embarqué intelligent avec Kiosque Santé autonome et surveillance de campus Edge AI.',
    type: 'youtube',
    embedUrl: 'https://www.youtube-nocookie.com/embed/cIXm0cJJH18?autoplay=0&rel=0',
    linkUrl: 'https://youtu.be/cIXm0cJJH18',
    category: 'Innovation & IoT',
    duration: '2:15',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'uniflow-arch-pwa',
    title: 'Architecture Technique & Synchronisation PWA Offline-First',
    description: 'Présentation de la couche de données IndexedDB, du cache applicatif hors-ligne et du moteur de synchronisation résilient UniFlow.',
    type: 'youtube',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0',
    linkUrl: 'https://youtu.be/dQw4w9WgXcQ',
    category: 'Architecture Technique',
    duration: '4:15',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  }
]

const agenda = [
  { icon: GraduationCap, title: 'Interface Étudiante', desc: 'Gestion des cours, devoirs, notes, relevés et emploi du temps dynamique' },
  { icon: UserCheck, title: 'Espace Enseignant', desc: 'Création de cours, gestion des présences, saisie des notes et messagerie' },
  { icon: Megaphone, title: 'Rôle Délégué', desc: 'Prise de présences QR/NFC, génération d\'exports et communication de classe' },
  { icon: Settings, title: 'Panneau Admin', desc: 'Gestion des infrastructures, statistiques d\'assiduité, audits et rôles' },
  { icon: Microscope, title: 'UniFlow Sentinelle', desc: 'Extension hardware IoT avec pré-diagnostic santé et sécurité Edge AI' },
]

const highlights = [
  { icon: Wifi, title: 'Offline-First', desc: 'PWA optimisée pour fonctionner sans connexion Internet permanente' },
  { icon: Smartphone, title: 'Multi-plateforme', desc: 'Adaptation fluide sur Mobile, Tablette, PC et Bornes tactiles' },
  { icon: Lock, title: 'Sécurité & RGPD', desc: 'Authentification JWT sécurisée, rôles granulaires (RBAC) et données isolées' },
  { icon: Lightbulb, title: 'Low-Cost & Sobriété', desc: 'Architecture sobre et économique adaptée au contexte universitaire' },
  { icon: BookOpen, title: 'Open Source', desc: 'Code source ouvert, extensible et auditable sous licence MIT' },
]

export default function PresentationPage() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const currentVideo = VIDEOS[activeVideoIndex]

  const handlePrev = () => {
    setActiveVideoIndex((prev) => (prev === 0 ? VIDEOS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveVideoIndex((prev) => (prev === VIDEOS.length - 1 ? 0 : prev + 1))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentVideo.title,
        url: currentVideo.linkUrl
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(currentVideo.linkUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-[#1e3a8a] selection:text-white">
      <LandingNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-16 pb-14 border-b border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 px-4 py-1.5 text-xs font-bold text-[#1e3a8a] dark:text-blue-300 mb-6 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-blue-300" />
            Vidéothèque & Démo Officielle
          </span>

          <div className="mx-auto mb-5 flex justify-center">
            <img 
              src="/logos/mascotte.png" 
              alt="Mascotte UniFlow" 
              loading="eager"
              decoding="async"
              className="h-20 w-20 object-contain drop-shadow-md animate-bounce" 
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/mascotte.png'
              }}
            />
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight mb-4 leading-tight">
            Découvrez <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] dark:from-blue-400 dark:via-indigo-300 dark:to-teal-300">UniFlow</span> en Vidéo
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Parcourez les présentations vidéo, le tutoriel complet de la plateforme et la démonstration des innovations IoT.
          </p>
        </div>
      </section>

      {/* VIDEO CAROUSEL SHOWCASE SECTION */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-6">
          
          {/* Main Player Container */}
          <div className="rounded-3xl bg-slate-900 text-white p-4 sm:p-6 shadow-xl mb-8">
            
            {/* Header / Info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                  {activeVideoIndex + 1}/{VIDEOS.length}
                </span>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-bold text-blue-400 border border-slate-700 mr-2">
                    {currentVideo.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Durée : {currentVideo.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {copied ? 'Lien copié !' : 'Partager'}
                </button>
                <a
                  href={currentVideo.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-xs active:scale-95"
                >
                  <Youtube className="h-4 w-4" />
                  Ouvrir le lien
                </a>
              </div>
            </div>

            {/* Video Player Display */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              {currentVideo.type === 'youtube' ? (
                <iframe
                  src={currentVideo.embedUrl}
                  title={currentVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                  preload="metadata"
                  key={currentVideo.id}
                >
                  <source src={currentVideo.videoSrc} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              )}
            </div>

            {/* Video Description & Carousel Controls */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="max-w-2xl">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
                  {currentVideo.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {currentVideo.description}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={handlePrev}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
                  title="Vidéo précédente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {VIDEOS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveVideoIndex(idx)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        activeVideoIndex === idx
                          ? 'w-7 bg-blue-500'
                          : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                      title={`Aller à la vidéo ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
                  title="Vidéo suivante"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Thumbnails Strip */}
          <div className="grid sm:grid-cols-3 gap-4">
            {VIDEOS.map((video, idx) => {
              const isActive = activeVideoIndex === idx
              return (
                <button
                  key={video.id}
                  onClick={() => setActiveVideoIndex(idx)}
                  className={`flex items-start gap-3.5 rounded-2xl p-4 text-left border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/80 border-[#1e3a8a] shadow-md ring-2 ring-[#1e3a8a]/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs relative overflow-hidden ${
                    video.type === 'youtube' ? 'bg-red-600 text-white' : 'bg-[#1e3a8a] text-white'
                  }`}>
                    {video.type === 'youtube' ? <Youtube className="h-5 w-5" /> : <Film className="h-5 w-5" />}
                    {isActive && (
                      <span className="absolute inset-0 bg-blue-900/30 flex items-center justify-center">
                        <Play className="h-4 w-4 fill-white text-white animate-pulse" />
                      </span>
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a] block mb-0.5">
                      Vidéo {idx + 1} • {video.category}
                    </span>
                    <p className={`text-xs font-bold truncate leading-tight ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                      {video.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {video.duration} • Cliquez pour lire
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

        </div>
      </section>

      {/* PROGRAM & KEY HIGHLIGHTS SECTION */}
      <section className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            
            {/* Agenda */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-[#1e3a8a] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Modules Présentés</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Fonctionnalités clés présentées dans la vidéo</p>
                </div>
              </div>

              <div className="space-y-3">
                {agenda.map((a, i) => {
                  const Icon = a.icon
                  return (
                    <div 
                      key={a.title} 
                      className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-[#1e3a8a] dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">Partie {i + 1}</span>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{a.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{a.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Highlights */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Atouts Stratégiques</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pourquoi UniFlow fait la différence</p>
                </div>
              </div>

              <div className="space-y-3">
                {highlights.map((h) => {
                  const Icon = h.icon
                  return (
                    <div 
                      key={h.title} 
                      className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{h.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{h.desc}</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#2546a3] to-[#0d9488] py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-white mb-5 border border-white/20">
            <Monitor className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Prêt à tester la plateforme ?</h2>
          <p className="text-sm text-blue-100 mb-8 max-w-lg mx-auto leading-relaxed">
            Accédez directement à la démonstration interactive avec les rôles Étudiant, Enseignant, Délégué ou Admin.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/app" 
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#1e3a8a] hover:bg-slate-100 transition-all shadow-lg active:scale-95"
            >
              Accéder à l'application <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              to="/sentinelle" 
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-7 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all active:scale-95"
            >
              Découvrir Sentinelle IoT
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
