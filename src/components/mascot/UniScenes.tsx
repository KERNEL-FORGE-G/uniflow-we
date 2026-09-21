import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { UniDots, UniMascot, type UniPose } from './UniMascot'

/**
 * Scènes prêtes à l'emploi : Uni qui charge, Uni qui s'excuse, Uni qui dort
 * (hors ligne), Uni qui passe la tête. Toutes utilisent les poses embarquées
 * dans le bundle ; les scènes d'erreur forcent la version inlinée pour
 * s'afficher même sans réseau.
 */

export function UniLoading({ label = 'Uni prépare vos données', size = 150, className, compact = false }: { label?: ReactNode; size?: number; className?: string; compact?: boolean }) {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center gap-3 text-center', compact ? 'py-6' : 'py-14', className)}>
      <UniMascot pose="thinking" size={compact ? Math.min(size, 96) : size} safe />
      <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <UniDots />
      </div>
    </div>
  )
}

export function UniOops({
  title = 'Oups, Uni est désolé',
  description,
  detail,
  children,
  size = 170,
  pose = 'sorry',
  className,
}: {
  title?: ReactNode
  description?: ReactNode
  detail?: string
  children?: ReactNode
  size?: number
  pose?: Extract<UniPose, 'sorry' | 'search' | 'sleeping'>
  className?: string
}) {
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-5 text-center', className)}>
      <UniMascot pose={pose} size={size} safe />
      <div className="max-w-md">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>}
        {detail && <p className="mt-2 break-words font-mono text-[11px] leading-5 text-rose-700 dark:text-rose-300">{detail}</p>}
      </div>
      {children}
    </div>
  )
}

/** Bandeau hors ligne : Uni dort tant que le réseau n'est pas revenu. */
export function UniOfflineBanner({ className }: { className?: string }) {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          role="status"
          className={cn('fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95', className)}
        >
          <UniMascot pose="sleeping" size={44} safe effects={false} />
          <div className="text-left">
            <p className="text-sm font-black text-slate-900 dark:text-white">Vous êtes hors ligne</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Uni affiche ce qu’il a déjà en mémoire ; tout reprendra au retour du réseau.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export interface UniPeekProps {
  /** Bord d'apparition. */
  edge?: 'right' | 'bottom'
  /** Texte de la bulle. */
  message: ReactNode
  /** Délai avant l'apparition (ms). */
  delay?: number
  /** Durée d'affichage (ms) avant de repartir ; 0 = reste jusqu'au clic. */
  duration?: number
  /** Clé de session : Uni ne réapparaît pas pour cette clé pendant la session. */
  once?: string
  onClick?: () => void
  className?: string
}

/**
 * Uni passe la tête depuis le bord de l'écran (à la Duo) pour un conseil, une
 * nouveauté ou un rappel, puis repart. Une fois par session et par clé pour
 * ne jamais devenir agaçant.
 */
export function UniPeek({ edge = 'right', message, delay = 2500, duration = 7000, once, onClick, className }: UniPeekProps) {
  const reduced = useReducedMotion() ?? false
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const key = once ? `uniflow:peek:${once}` : ''
    try {
      if (key && window.sessionStorage.getItem(key)) return
    } catch { /* stockage indisponible : on affiche quand même */ }
    const show = window.setTimeout(() => {
      setVisible(true)
      try { if (key) window.sessionStorage.setItem(key, '1') } catch { /* ignoré */ }
    }, delay)
    return () => window.clearTimeout(show)
  }, [delay, once])

  useEffect(() => {
    if (!visible || !duration) return
    const hide = window.setTimeout(() => setVisible(false), duration)
    return () => window.clearTimeout(hide)
  }, [visible, duration])

  const fromRight = edge === 'right'
  const hidden = fromRight ? { x: 180, opacity: 0 } : { y: 200, opacity: 0 }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduced ? { opacity: 0 } : hidden}
          animate={{ x: 0, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 220, damping: 20 } }}
          exit={reduced ? { opacity: 0 } : { ...hidden, transition: { duration: 0.35, ease: 'easeIn' } }}
          className={cn(
            'fixed z-[65] flex items-end gap-2',
            fromRight ? 'bottom-24 right-0 flex-row-reverse' : 'bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center',
            className,
          )}
        >
          <UniMascot pose={fromRight ? 'peekRight' : 'peekBottom'} size={fromRight ? 150 : 140} effects={false} onClick={() => { setVisible(false); onClick?.() }} title="Fermer" />
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.4, type: 'spring', stiffness: 300, damping: 20 } }}
            className={cn('relative max-w-[240px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100', fromRight ? 'mb-10 mr-1' : 'mb-2')}
          >
            {message}
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white shadow dark:bg-white dark:text-slate-900"
              aria-label="Fermer le message d’Uni"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
