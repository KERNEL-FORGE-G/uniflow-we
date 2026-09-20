import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Conventions d'animation UniFlow (voir docs/technique/design-et-animations.md) :
 * une seule courbe (`ease`), des durées courtes, et le respect de
 * `prefers-reduced-motion` — les animations sont alors réduites à un fondu.
 */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE } },
}

export const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
}

/** Enveloppe une page : entrée en fondu + glissement, sortie discrète. */
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      variants={reduced ? { initial: { opacity: 0 }, enter: { opacity: 1 }, exit: { opacity: 0 } } : pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className={cn('min-h-full', className)}
    >
      {children}
    </motion.div>
  )
}

/** Liste en cascade : chaque enfant direct doit être un `StaggerItem`. */
export function StaggerList({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'ul' | 'section' }) {
  const Component = motion[Tag]
  return (
    <Component variants={listVariants} initial="hidden" animate="show" className={className}>
      {children}
    </Component>
  )
}

export function StaggerItem({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const Component = motion[Tag]
  return (
    <Component variants={itemVariants} className={className}>
      {children}
    </Component>
  )
}

/** Carte interactive : légère élévation au survol, pression au clic. */
export function HoverCard({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      variants={itemVariants}
      whileHover={reduced ? undefined : { y: -3, transition: { duration: 0.2, ease: EASE } }}
      whileTap={reduced ? undefined : { scale: 0.99 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  )
}
