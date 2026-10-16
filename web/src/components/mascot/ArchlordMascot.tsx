import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion'
import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { ARCHLORD_NAME, ARCHLORD_POSES, ARCHLORD_UNI_FISTBUMP, type ArchlordPose } from './archlord'
import { nextLineIndex, posesFor, shouldAutoAdvance, type DialogueSpeaker, type IdlePoses } from './dialogueModel'
import { UniBubble, UniMascot, type UniPose } from './UniMascot'

export type { ArchlordPose } from './archlord'
export type { DialogueSpeaker } from './dialogueModel'

export interface ArchlordMascotProps {
  pose: ArchlordPose
  /** Hauteur en pixels (la largeur suit le ratio de la pose). */
  size?: number
  /** Coupe les boucles d'animation. */
  still?: boolean
  bubble?: ReactNode
  bubbleSide?: 'left' | 'right' | 'top'
  className?: string
  /** Petits éléments décoratifs (étincelles, chevrons de code, points de réflexion). */
  effects?: boolean
  /** Le personnage parle : l'animation est plus marquée (hochements). */
  speaking?: boolean
  onClick?: () => void
  title?: string
}

const BREATH: Transition = { duration: 3, repeat: Infinity, ease: 'easeInOut' }

/**
 * Boucle « vivante » d'Archlord. Il est humain : on respire, on se balance
 * un peu, on hoche la tête quand on parle — jamais les sauts de robot d'Uni.
 * Amplitudes faibles pour ne pas fatiguer ; `prefers-reduced-motion` coupe tout.
 */
function loopFor(pose: ArchlordPose, speaking: boolean): { animate: TargetAndTransition; transition: Transition } {
  if (speaking) {
    return { animate: { y: [0, -3, 0, -2, 0], rotate: [0, 1.2, 0, -1, 0] }, transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }
  }
  switch (pose) {
    case 'wave':
      return { animate: { y: [0, -4, 0], rotate: [0, 1.5, -1, 0] }, transition: { ...BREATH, duration: 2 } }
    case 'explain':
      return { animate: { rotate: [0, -1.5, 0, 1.5, 0], x: [0, 3, 0] }, transition: { ...BREATH, duration: 2.8 } }
    case 'laptop':
      return { animate: { y: [0, -1.5, 0], scaleY: [1, 1.01, 1] }, transition: { ...BREATH, duration: 2.4 } }
    case 'thumbs':
      return { animate: { scale: [1, 1.03, 1], y: [0, -3, 0] }, transition: { duration: 1.5, repeat: Infinity, repeatDelay: 0.7, ease: 'easeInOut' } }
    case 'thinking':
      return { animate: { rotate: [0, -2, 0, 1.5, 0], y: [0, -1.5, 0] }, transition: { ...BREATH, duration: 3.4 } }
    case 'pointing':
      return { animate: { x: [0, 6, 0], rotate: [0, -1, 0] }, transition: { duration: 1.4, repeat: Infinity, repeatDelay: 0.9, ease: 'easeInOut' } }
    default:
      return { animate: { y: [0, -3, 0] }, transition: BREATH }
  }
}

export function ArchlordMascot({ pose, size = 160, still = false, bubble, bubbleSide = 'right', className, effects = true, speaking = false, onClick, title }: ArchlordMascotProps) {
  const reduced = useReducedMotion() ?? false
  const asset = ARCHLORD_POSES[pose]
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [asset])
  const width = Math.round(size * asset.ratio)
  const animated = !still && !reduced
  const loop = loopFor(pose, speaking)

  const figure = (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: reduced ? { duration: 0.3 } : { type: 'spring', stiffness: 240, damping: 20 } }}
      className="relative"
      style={{ width, height: size }}
    >
      {failed ? (
        <span
          aria-label={asset.alt}
          className="grid h-full w-full place-items-center rounded-full bg-[#1e3a8a] text-2xl font-black text-white"
          style={{ width, height: width }}
        >
          A
        </span>
      ) : (
        <motion.img
          src={asset.src}
          alt={asset.alt}
          title={title}
          width={width}
          height={size}
          draggable={false}
          decoding="async"
          onError={() => setFailed(true)}
          animate={animated ? loop.animate : undefined}
          transition={animated ? loop.transition : undefined}
          className="h-full w-full select-none object-contain drop-shadow-[0_10px_18px_rgba(30,58,138,0.18)]"
          style={{ transformOrigin: '50% 92%' }}
        />
      )}
      {effects && animated && <ArchlordEffects pose={pose} size={size} />}
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

function ArchlordEffects({ pose, size }: { pose: ArchlordPose; size: number }) {
  const scale = size / 160
  switch (pose) {
    case 'thumbs':
      return (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="absolute block text-amber-400"
              style={{ left: `${[6, 70, 20][index]}%`, top: `${[14, 10, 40][index]}%`, fontSize: 14 * scale, lineHeight: 1 }}
              animate={{ opacity: [0, 1, 0], scale: [0.3, 1.1, 0.3], rotate: [0, 45] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.5, ease: 'easeInOut' }}
            >
              ✦
            </motion.span>
          ))}
        </div>
      )
    case 'laptop':
      return (
        <div aria-hidden className="pointer-events-none absolute right-[-14%] top-[18%]">
          {['{ }', '</>', ';'].map((glyph, index) => (
            <motion.span
              key={glyph}
              className="absolute font-mono text-xs font-black text-teal-600 dark:text-teal-300"
              style={{ fontSize: 11 * scale, left: index * 6 * scale }}
              animate={{ y: [8, -26 * scale], opacity: [0, 1, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.7, ease: 'easeOut' }}
            >
              {glyph}
            </motion.span>
          ))}
        </div>
      )
    case 'thinking':
      return (
        <div aria-hidden className="pointer-events-none absolute right-[-12%] top-[-2%]">
          {['·', '·', '?'].map((glyph, index) => (
            <motion.span
              key={index}
              className="absolute font-black text-[#1e3a8a] dark:text-blue-200"
              style={{ fontSize: (14 + index * 6) * scale, left: index * 9 * scale }}
              animate={{ y: [4, -18 * scale], opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.55, ease: 'easeOut' }}
            >
              {glyph}
            </motion.span>
          ))}
        </div>
      )
    default:
      return null
  }
}

/** Archlord et Uni poing contre poing — l'image à deux, pour les pages qui parlent de l'équipe. */
export function ArchlordAndUni({ size = 220, className, still = false }: { size?: number; className?: string; still?: boolean }) {
  const reduced = useReducedMotion() ?? false
  const width = Math.round(size * ARCHLORD_UNI_FISTBUMP.ratio)
  const animated = !still && !reduced
  return (
    <motion.img
      src={ARCHLORD_UNI_FISTBUMP.src}
      alt={ARCHLORD_UNI_FISTBUMP.alt}
      width={width}
      height={size}
      draggable={false}
      decoding="async"
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      animate={animated ? { opacity: 1, scale: [1, 1.015, 1], y: [0, -4, 0], transition: { opacity: { duration: 0.4 }, duration: 3, repeat: Infinity, ease: 'easeInOut' } } : { opacity: 1, scale: 1 }}
      className={cn('select-none object-contain drop-shadow-[0_14px_24px_rgba(30,58,138,0.18)]', className)}
      style={{ width, height: size }}
    />
  )
}

export interface DialogueLine {
  who: DialogueSpeaker
  text: ReactNode
  /** Pose prise par le personnage pendant sa réplique (sinon celle par défaut). */
  archlordPose?: ArchlordPose
  uniPose?: UniPose
}

export interface MascotDialogueProps {
  lines: DialogueLine[]
  /** Hauteur des personnages. */
  size?: number
  /** Délai entre deux répliques (ms). */
  interval?: number
  /** Enchaîne les répliques automatiquement (sinon au clic uniquement). */
  autoplay?: boolean
  /** Reprend au début après la dernière réplique. */
  loop?: boolean
  className?: string
  /** Fond sombre : bulles et étiquettes adaptées. */
  tone?: 'light' | 'dark'
  /** Poses par défaut quand un personnage écoute. */
  idle?: IdlePoses
}

/**
 * Archlord et Uni échangent quelques répliques sur un point de la page
 * (demande du propriétaire du 2026-09-21 : « les deux en train de parler ou
 * d'échanger un commentaire à propos d'un point »). Une bulle à la fois, le
 * personnage qui parle s'anime, un clic passe à la suite. Sans animations
 * (préférence système), toute la conversation est affichée d'un bloc.
 */
export function MascotDialogue({ lines, size = 150, interval = 3800, autoplay = true, loop = true, className, tone = 'light', idle }: MascotDialogueProps) {
  const reduced = useReducedMotion() ?? false
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const labelId = useId()
  const total = lines.length

  const next = useCallback(() => {
    setIndex((current) => nextLineIndex(current, total, loop))
  }, [loop, total])

  useEffect(() => {
    if (!shouldAutoAdvance({ autoplay, reduced, paused, total, loop, index })) return
    const timer = window.setTimeout(next, interval)
    return () => window.clearTimeout(timer)
  }, [autoplay, reduced, paused, total, loop, index, interval, next])

  if (total === 0) return null
  const current = lines[Math.min(index, total - 1)]
  const { archlord: archlordPose, uni: uniPose } = posesFor(current, idle)
  const dark = tone === 'dark'

  if (reduced) {
    return (
      <div className={cn('flex flex-col gap-4', className)} role="group" aria-labelledby={labelId}>
        <p id={labelId} className="sr-only">Conversation entre Archlord et Uni</p>
        <div className="flex items-end justify-center gap-6">
          <ArchlordMascot pose={archlordPose} size={size} still effects={false} />
          <UniMascot pose={uniPose} size={size} still effects={false} />
        </div>
        <ul className="space-y-2">
          {lines.map((line, i) => (
            <li key={i} className={cn('flex gap-2 text-sm', line.who === 'uni' && 'flex-row-reverse text-right')}>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black uppercase tracking-wide', line.who === 'archlord' ? 'bg-[#1e3a8a] text-white' : 'bg-teal-500 text-white')}>
                {line.who === 'archlord' ? ARCHLORD_NAME : 'Uni'}
              </span>
              <span className={cn('rounded-2xl px-3 py-2', dark ? 'bg-white/10 text-white' : 'bg-white text-slate-800 shadow-sm')}>{line.text}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div
      className={cn('flex flex-col items-center gap-3', className)}
      role="group"
      aria-labelledby={labelId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p id={labelId} className="sr-only">Conversation entre Archlord et Uni — cliquer pour passer à la réplique suivante</p>
      <button
        type="button"
        onClick={next}
        aria-live="polite"
        className="group relative flex w-full cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-left focus:outline-none"
        title="Réplique suivante"
      >
        <div className="flex h-[112px] w-full items-end justify-center px-2 sm:h-[104px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className={cn('relative max-w-[320px] rounded-2xl border px-4 py-3 text-sm font-semibold leading-5 shadow-lg', dark ? 'border-white/15 bg-white text-slate-800 shadow-black/20' : 'border-slate-200 bg-white text-slate-800 shadow-slate-900/5')}
              style={{ alignSelf: 'flex-end', marginLeft: current.who === 'archlord' ? 0 : 'auto', marginRight: current.who === 'uni' ? 0 : 'auto' }}
            >
              <span className={cn('mb-1 block text-[10px] font-black uppercase tracking-wider', current.who === 'archlord' ? 'text-[#1e3a8a]' : 'text-teal-600')}>
                {current.who === 'archlord' ? ARCHLORD_NAME : 'Uni'}
              </span>
              {current.text}
              <span
                aria-hidden
                className={cn('absolute -bottom-[7px] h-3.5 w-3.5 rotate-45 border-b border-r bg-white', dark ? 'border-white/15' : 'border-slate-200', current.who === 'archlord' ? 'left-6' : 'right-6')}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-end justify-center gap-4 sm:gap-8">
          <motion.div animate={{ scale: current.who === 'archlord' ? 1.04 : 0.96, opacity: current.who === 'archlord' ? 1 : 0.82 }} transition={{ duration: 0.4 }}>
            <ArchlordMascot pose={archlordPose} size={size} speaking={current.who === 'archlord'} effects={current.who === 'archlord'} />
          </motion.div>
          <motion.div animate={{ scale: current.who === 'uni' ? 1.04 : 0.96, opacity: current.who === 'uni' ? 1 : 0.82 }} transition={{ duration: 0.4 }}>
            <UniMascot pose={uniPose} size={Math.round(size * 0.92)} effects={current.who === 'uni'} />
          </motion.div>
        </div>
      </button>
      {total > 1 && (
        <div className="flex items-center gap-1.5" aria-hidden>
          {lines.map((_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => setIndex(i)}
              className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-5 bg-teal-500' : dark ? 'w-1.5 bg-white/40 hover:bg-white/70' : 'w-1.5 bg-slate-300 hover:bg-slate-400')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ArchlordMascot
