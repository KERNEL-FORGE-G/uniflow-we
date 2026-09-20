import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Play } from 'lucide-react'
import { youtubeEmbedUrl, youtubeThumbnailUrl, youtubeWatchUrl } from '@/lib/videoEmbed'
import { cn } from '@/utils/cn'

/**
 * Lecteur YouTube à chargement différé : vignette cliquable, puis iframe
 * `youtube-nocookie` en lecture automatique. Le lien « Regarder sur YouTube »
 * reste toujours visible : une iframe inter-origine ne signale jamais son
 * échec, c'est le seul repli fiable.
 */
export function YouTubePlayer({ videoId, title, className }: { videoId: string; title: string; className?: string }) {
  const [playing, setPlaying] = useState(false)
  const [thumbnailFailed, setThumbnailFailed] = useState(false)

  // Changer de vidéo revient à l'état vignette : l'iframe précédente est démontée.
  useEffect(() => { setPlaying(false); setThumbnailFailed(false) }, [videoId])

  return (
    <figure className={cn('group relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {playing ? (
          <motion.iframe
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            src={youtubeEmbedUrl(videoId, { autoplay: true })}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <motion.button
            key="poster"
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Lire la vidéo : ${title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="absolute inset-0 flex h-full w-full items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
          >
            {!thumbnailFailed ? (
              <img
                src={youtubeThumbnailUrl(videoId, 'maxresdefault')}
                onError={(event) => {
                  // maxresdefault n'existe pas pour toutes les vidéos : on retombe sur hqdefault avant d'abandonner.
                  const target = event.currentTarget
                  if (!target.dataset.fallback) { target.dataset.fallback = '1'; target.src = youtubeThumbnailUrl(videoId, 'hqdefault') } else setThumbnailFailed(true)
                }}
                alt=""
                decoding="async"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-slate-900 to-[#0d9488]" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <motion.span
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#1e3a8a] shadow-2xl ring-8 ring-white/20 sm:h-20 sm:w-20"
            >
              <Play className="ml-1 h-7 w-7 fill-current sm:h-9 sm:w-9" />
            </motion.span>
            <span className="absolute bottom-4 left-4 right-4 truncate text-left text-sm font-bold text-white drop-shadow sm:text-base">{title}</span>
          </motion.button>
        )}
      </AnimatePresence>
      <a
        href={youtubeWatchUrl(videoId)}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur transition hover:bg-black/80"
      >
        <ExternalLink className="h-3.5 w-3.5" /> Regarder sur YouTube
      </a>
    </figure>
  )
}
