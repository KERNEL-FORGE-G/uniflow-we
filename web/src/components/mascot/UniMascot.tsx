import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { POSES, type UniPose } from './poses'

export type { UniPose } from './poses'

export interface UniMascotProps {
  pose: UniPose
  /** Hauteur en pixels (la largeur suit le ratio de la pose). */
  size?: number
  /** Coupe les boucles d'animation (les particules aussi). */
  still?: boolean
  /** Utilise la version inlinée dans le bundle : à préférer sur les écrans d'erreur / hors ligne. */
  safe?: boolean
  /** Petite bulle de dialogue à côté de la mascotte. */
  bubble?: ReactNode
  bubbleSide?: 'left' | 'right' | 'top'
  className?: string
  /** Effets décoratifs (confettis, « zzz », points d'interrogation…). */
  effects?: boolean
  onClick?: () => void
  title?: string
}

const LOOP: Transition = { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }

/**
 * Boucle « vivante » de chaque pose : c'est ce qui fait qu'Uni respire au
 * lieu d'être un autocollant. Les amplitudes restent faibles pour ne pas
 * fatiguer, et `prefers-reduced-motion` désactive tout.
 */
function loopFor(pose: UniPose): { animate: TargetAndTransition; transition: Transition } {
  switch (pose) {
    case 'wave':
      return { animate: { y: [0, -5, 0], rotate: [0, 2.5, -1.5, 0] }, transition: { ...LOOP, duration: 1.8 } }
    case 'thinking':
      return { animate: { rotate: [0, -2.5, 0, 2, 0], y: [0, -2, 0] }, transition: { ...LOOP, duration: 3.2 } }
    case 'celebrate':
      return {
        animate: { y: [0, -16, 0, -6, 0], scaleY: [1, 1.04, 0.96, 1.02, 1], rotate: [0, -3, 3, 0, 0] },
        transition: { duration: 1.4, repeat: Infinity, repeatDelay: 0.6, ease: 'easeOut' },
      }
    case 'sorry':
      return { animate: { rotate: [0, -1.5, 0, 1.5, 0], y: [0, 1.5, 0] }, transition: { ...LOOP, duration: 3.6 } }
    case 'search':
      return { animate: { x: [0, -8, 8, 0], rotate: [0, -3, 3, 0] }, transition: { ...LOOP, duration: 3 } }
    case 'sleeping':
      return { animate: { scale: [1, 1.025, 1], y: [0, 1, 0] }, transition: { ...LOOP, duration: 3.4 } }
    case 'graduate':
      return { animate: { y: [0, -6, 0], rotate: [0, 1.5, 0] }, transition: { ...LOOP, duration: 2.2 } }
    case 'pointing':
      return { animate: { x: [0, 7, 0], rotate: [0, -1.5, 0] }, transition: { duration: 1.3, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' } }
    case 'headset':
      return { animate: { y: [0, -4, 0], rotate: [0, -2, 0, 2, 0] }, transition: { ...LOOP, duration: 2.6 } }
    case 'shield':
      return { animate: { scale: [1, 1.03, 1], y: [0, -3, 0] }, transition: { ...LOOP, duration: 2.8 } }
    case 'peekRight':
      return { animate: { x: [0, -4, 0], rotate: [0, -3, 0] }, transition: { ...LOOP, duration: 2 } }
    case 'peekBottom':
      return { animate: { y: [0, -5, 0], rotate: [0, 2, -2, 0] }, transition: { ...LOOP, duration: 2 } }
    default:
      return { animate: { y: [0, -4, 0] }, transition: LOOP }
  }
}

/** Entrée sur scène : Uni arrive, il ne « pop » pas. */
function entranceFor(pose: UniPose, reduced: boolean): { initial: TargetAndTransition | false; animate: TargetAndTransition } {
  if (reduced) return { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.3 } } }
  switch (pose) {
    case 'sorry':
      return { initial: { opacity: 0, x: -14 }, animate: { opacity: 1, x: [-14, 10, -6, 4, 0], transition: { duration: 0.6, ease: 'easeOut' } } }
    case 'celebrate':
      return { initial: { opacity: 0, scale: 0.5, y: 30 }, animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 16 } } }
    case 'sleeping':
      return { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } } }
    default:
      return { initial: { opacity: 0, scale: 0.85, y: 16 }, animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 18 } } }
  }
}

export function UniMascot({ pose, size = 160, still = false, safe = false, bubble, bubbleSide = 'right', className, effects = true, onClick, title }: UniMascotProps) {
  const reduced = useReducedMotion() ?? false
  const asset = POSES[pose]
  const [src, setSrc] = useState(safe ? asset.safe : asset.src)
  useEffect(() => setSrc(safe ? asset.safe : asset.src), [asset, safe])
  const width = Math.round(size * asset.ratio)
  const loop = loopFor(pose)
  const entrance = entranceFor(pose, reduced)
  const animated = !still && !reduced

  const figure = (
    <motion.div
      initial={entrance.initial}
      animate={entrance.animate}
      className="relative"
      style={{ width, height: size }}
    >
      <motion.img
        src={src}
        alt={asset.alt}
        title={title}
        width={width}
        height={size}
        draggable={false}
        decoding="async"
        onError={() => { if (src !== asset.safe) setSrc(asset.safe) }}
        animate={animated ? loop.animate : undefined}
        transition={animated ? loop.transition : undefined}
        className="h-full w-full select-none object-contain drop-shadow-[0_10px_18px_rgba(30,58,138,0.18)]"
        style={{ transformOrigin: pose === 'peekBottom' ? '50% 100%' : pose === 'peekRight' ? '100% 50%' : '50% 90%' }}
      />
      {effects && animated && <PoseEffects pose={pose} size={size} />}
    </motion.div>
  )

  const content = bubble ? (
    <div className={cn('flex items-center gap-3', bubbleSide === 'left' && 'flex-row-reverse', bubbleSide === 'top' && 'flex-col-reverse items-center')}>
      {figure}
      <UniBubble side={bubbleSide}>{bubble}</UniBubble>
    </div>
  ) : figure

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn('group inline-flex cursor-pointer border-0 bg-transparent p-0 text-left', className)} aria-label={title || asset.alt}>
        {content}
      </button>
    )
  }
  return <div className={cn('inline-flex', className)}>{content}</div>
}

/** Bulle de dialogue avec sa petite pointe, qui apparaît après la mascotte. */
export function UniBubble({ children, side = 'right', className }: { children: ReactNode; side?: 'left' | 'right' | 'top'; className?: string }) {
  const reduced = useReducedMotion() ?? false
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, x: side === 'left' ? 8 : side === 'right' ? -8 : 0, y: side === 'top' ? 8 : 0 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0, transition: { delay: 0.35, type: 'spring', stiffness: 320, damping: 20 } }}
      role="status"
      className={cn(
        'relative max-w-[260px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-5 text-slate-800 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute h-3.5 w-3.5 rotate-45 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
          side === 'right' && 'left-[-8px] top-1/2 -translate-y-1/2 border-b border-l',
          side === 'left' && 'right-[-8px] top-1/2 -translate-y-1/2 border-r border-t',
          side === 'top' && 'bottom-[-8px] left-1/2 -translate-x-1/2 border-b border-r',
        )}
      />
      {children}
    </motion.div>
  )
}

const CONFETTI = ['#1e3a8a', '#14b8a6', '#f59e0b', '#ec4899', '#22c55e', '#3b82f6', '#f97316', '#a855f7']

/**
 * Petits éléments qui vivent autour de la pose : confettis qui tombent,
 * « Zzz » qui montent, points d'interrogation, gouttes… Pur CSS/motion, aucune
 * image supplémentaire.
 */
function PoseEffects({ pose, size }: { pose: UniPose; size: number }) {
  const scale = size / 160
  switch (pose) {
    case 'celebrate':
      return (
        <div aria-hidden className="pointer-events-none absolute -inset-x-6 -top-8 bottom-0 overflow-visible">
          {CONFETTI.map((color, index) => (
            <motion.span
              key={color}
              className="absolute block rounded-[2px]"
              style={{ left: `${8 + index * 12}%`, top: 0, width: 6 * scale, height: 10 * scale, background: color }}
              animate={{ y: [0, size * 0.9], x: [0, (index % 2 ? 1 : -1) * 14 * scale], rotate: [0, index % 2 ? 260 : -220], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.9 + (index % 3) * 0.35, repeat: Infinity, delay: index * 0.18, ease: 'easeIn' }}
            />
          ))}
        </div>
      )
    case 'sleeping':
      return (
        <div aria-hidden className="pointer-events-none absolute right-[-4%] top-[6%]">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="absolute font-black text-blue-900/70 dark:text-teal-200/80"
              style={{ fontSize: (12 + index * 5) * scale, left: index * 10 * scale }}
              animate={{ y: [6, -26 * scale], x: [0, 8 * scale], opacity: [0, 1, 0], scale: [0.7, 1.1] }}
              transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.8, ease: 'easeOut' }}
            >
              z
            </motion.span>
          ))}
        </div>
      )
    case 'thinking':
      return (
        <div aria-hidden className="pointer-events-none absolute right-[-10%] top-[-4%]">
          {['·', '·', '?'].map((glyph, index) => (
            <motion.span
              key={index}
              className="absolute font-black text-teal-600 dark:text-teal-300"
              style={{ fontSize: (14 + index * 6) * scale, left: index * 9 * scale }}
              animate={{ y: [4, -18 * scale], opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.55, ease: 'easeOut' }}
            >
              {glyph}
            </motion.span>
          ))}
        </div>
      )
    case 'sorry':
      return (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute block rounded-full bg-sky-400/80"
          style={{ right: '18%', top: '10%', width: 7 * scale, height: 10 * scale, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
          animate={{ y: [0, 22 * scale], opacity: [0, 1, 0], scaleY: [0.6, 1.2] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeIn' }}
        />
      )
    case 'search':
      return (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute block rounded-full bg-white"
          style={{ left: '18%', top: '30%', width: 10 * scale, height: 10 * scale, boxShadow: '0 0 12px 4px rgba(255,255,255,0.9)' }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
        />
      )
    case 'graduate':
    case 'shield':
      return (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[0, 1, 2, 3].map((index) => (
            <motion.span
              key={index}
              className="absolute block text-amber-400"
              style={{ left: `${[8, 84, 14, 78][index]}%`, top: `${[12, 18, 62, 58][index]}%`, fontSize: 14 * scale, lineHeight: 1 }}
              animate={{ opacity: [0, 1, 0], scale: [0.3, 1.1, 0.3], rotate: [0, 45] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.45, ease: 'easeInOut' }}
            >
              ✦
            </motion.span>
          ))}
        </div>
      )
    case 'headset':
      return (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[0, 1].map((index) => (
            <motion.span
              key={index}
              className="absolute rounded-full border-2 border-teal-400/60"
              style={{ width: size * 0.9, height: size * 0.9 }}
              animate={{ scale: [0.7, 1.25], opacity: [0.5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: index * 1.1, ease: 'easeOut' }}
            />
          ))}
        </div>
      )
    default:
      return null
  }
}

/** Trois points qui « respirent » — utilisé sous Uni quand il travaille. */
export function UniDots({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-hidden>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="block h-2 w-2 rounded-full bg-teal-500"
          animate={reduced ? undefined : { y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </span>
  )
}

export default UniMascot
