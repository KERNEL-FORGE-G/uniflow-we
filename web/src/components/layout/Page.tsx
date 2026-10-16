import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE } from '@/components/motion/PageTransition'
import { cn } from '@/utils/cn'

/**
 * Système de mise en page commun aux pages publiques et à l'application.
 *
 * Avant : chaque page choisissait sa largeur (`max-w-5xl`, `max-w-7xl`,
 * `max-w-[1920px]`), ses marges et sa hiérarchie de titres, d'où des sauts
 * visibles d'une page à l'autre. Ici une seule grille : conteneur 1280 px,
 * gouttières 24/32 px, sections espacées de 80–112 px, en-têtes de section
 * identiques partout.
 */

export const CONTAINER_WIDTHS = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[1400px]',
} as const

export function Container({ children, className, width = 'default', as: Tag = 'div' }: { children: ReactNode; className?: string; width?: keyof typeof CONTAINER_WIDTHS; as?: 'div' | 'section' | 'header' | 'footer' | 'main' | 'nav' }) {
  return <Tag className={cn('mx-auto w-full px-6 sm:px-8', CONTAINER_WIDTHS[width], className)}>{children}</Tag>
}

export function Section({ children, className, id, tone = 'white', padding = 'default' }: { children: ReactNode; className?: string; id?: string; tone?: 'white' | 'muted' | 'dark' | 'brand'; padding?: 'default' | 'compact' | 'none' }) {
  const tones = {
    white: 'bg-white text-slate-900',
    muted: 'bg-[#f8fafc] text-slate-900',
    dark: 'bg-[#0f172a] text-white',
    brand: 'bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#0d9488] text-white',
  }
  const paddings = { default: 'py-20 sm:py-24 lg:py-28', compact: 'py-12 sm:py-16', none: '' }
  return <section id={id} className={cn('relative', tones[tone], paddings[padding], className)}>{children}</section>
}

export function Eyebrow({ children, className, tone = 'teal' }: { children: ReactNode; className?: string; tone?: 'teal' | 'blue' | 'light' }) {
  const tones = {
    teal: 'bg-[#f0fdfa] text-[#0d9488] ring-[#0d9488]/15',
    blue: 'bg-[#eff3ff] text-[#1e3a8a] ring-[#1e3a8a]/15',
    light: 'bg-white/10 text-white ring-white/20',
  }
  return <span className={cn('inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ring-1', tones[tone], className)}>{children}</span>
}

export function SectionHeader({ eyebrow, title, description, align = 'center', tone = 'dark', className }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; align?: 'center' | 'left'; tone?: 'dark' | 'light'; className?: string }) {
  return (
    <Reveal className={cn('mb-12 sm:mb-16', align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl text-left', className)}>
      {eyebrow && <div className="mb-4">{typeof eyebrow === 'string' ? <Eyebrow tone={tone === 'light' ? 'light' : 'teal'}>{eyebrow}</Eyebrow> : eyebrow}</div>}
      <h2 className={cn('text-3xl font-black tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]', tone === 'light' ? 'text-white' : 'text-slate-900')}>{title}</h2>
      {description && <p className={cn('mt-4 text-base leading-7 sm:text-lg sm:leading-8', tone === 'light' ? 'text-blue-100' : 'text-slate-600')}>{description}</p>}
    </Reveal>
  )
}

/** Apparition au défilement, une seule fois, respectant `prefers-reduced-motion`. */
export function Reveal({ children, className, delay = 0, as: Tag = 'div', y = 24 }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'article' | 'li' | 'section' | 'figure' | 'header'; y?: number }) {
  const reduced = useReducedMotion()
  const MotionTag = motion[Tag] as typeof motion.div
  return (
    <MotionTag
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}

/** Grille d'éléments qui apparaissent en cascade au défilement. */
export function RevealGrid({ children, className, stagger = 0.08 }: { children: ReactNode; className?: string; stagger?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'article' | 'li' }) {
  const reduced = useReducedMotion()
  const MotionTag = motion[Tag] as typeof motion.div
  return (
    <MotionTag variants={{ hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }} className={className}>
      {children}
    </MotionTag>
  )
}

/** Carte standard : rayon 24 px, bordure fine, ombre douce, survol qui soulève. */
export function SurfaceCard({ children, className, hover = true, as: Tag = 'div' }: { children: ReactNode; className?: string; hover?: boolean; as?: 'div' | 'article' | 'li' | 'section' }) {
  return (
    <Tag className={cn('rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 sm:p-7', hover && 'hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10', className)}>
      {children}
    </Tag>
  )
}

/** En-tête de page applicative : fil d'Ariane discret, titre, description, actions à droite. */
export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d9488]">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
