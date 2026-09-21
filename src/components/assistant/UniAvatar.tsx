import { motion, useReducedMotion, type TargetAndTransition } from 'framer-motion'
import { ASSISTANT_AVATAR, ASSISTANT_AVATAR_FALLBACK } from '@/lib/assistant'

export type UniMood = 'idle' | 'thinking' | 'speaking' | 'happy'

const MOTIONS: Record<UniMood, TargetAndTransition> = {
  idle: { y: [0, -3, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } },
  thinking: { rotate: [0, -8, 6, -4, 0], y: [0, -1, 0], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } },
  speaking: { scale: [1, 1.05, 0.98, 1.04, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } },
  happy: { y: [0, -6, 0, -3, 0], rotate: [0, -3, 3, 0], transition: { duration: 0.9, ease: 'easeOut' } },
}

/**
 * Avatar dynamique d'Uni : la même image, animée selon l'état de la
 * conversation. Au repos il flotte doucement ; quand il réfléchit il penche la
 * tête et un halo tourne ; quand il parle (synthèse vocale) des ondes sortent
 * de lui ; à l'accueil il fait un petit bond. Tout est désactivé si
 * l'utilisateur préfère réduire les animations.
 */
export function UniAvatar({ size = 40, mood = 'idle', className = '' }: { size?: number; mood?: UniMood; className?: string }) {
  const reduceMotion = useReducedMotion() ?? false
  const animate: TargetAndTransition = reduceMotion ? {} : MOTIONS[mood]

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {!reduceMotion && mood === 'thinking' && (
        <motion.span
          className="absolute inset-[-14%] rounded-full border-2 border-dashed border-[#0d9488]/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {!reduceMotion && mood === 'speaking' && [0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-[-10%] rounded-full border-2 border-[#1e3a8a]/40"
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
        />
      ))}
      <motion.picture className="relative block h-full w-full" animate={animate}>
        <source srcSet={ASSISTANT_AVATAR} type="image/webp" />
        <img src={ASSISTANT_AVATAR_FALLBACK} alt="" width={size} height={size} className="h-full w-full object-contain drop-shadow-sm" draggable={false} />
      </motion.picture>
    </span>
  )
}

export default UniAvatar
