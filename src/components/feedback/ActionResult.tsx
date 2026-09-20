import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Loader2, XCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { EASE } from '@/components/motion/PageTransition'

export type ActionResultStatus = 'success' | 'error' | 'warning' | 'pending'

export interface ActionResultAction {
  label: string
  onClick?: () => void
  to?: string
  href?: string
  variant?: 'primary' | 'secondary'
}

export interface ActionResultProps {
  status: ActionResultStatus
  title: string
  description?: ReactNode
  /** Détail technique (message d'erreur brut) affiché en petit. */
  detail?: string
  actions?: ActionResultAction[]
  icon?: LucideIcon
  /** `inline` : encart dans une page ; `screen` : écran plein centré. */
  layout?: 'inline' | 'screen'
  className?: string
  children?: ReactNode
}

const PALETTE: Record<ActionResultStatus, { ring: string; bg: string; text: string; icon: LucideIcon }> = {
  success: { ring: 'ring-emerald-200', bg: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-800', icon: CheckCircle2 },
  error: { ring: 'ring-rose-200', bg: 'bg-rose-50 text-rose-600', text: 'text-rose-800', icon: XCircle },
  warning: { ring: 'ring-amber-200', bg: 'bg-amber-50 text-amber-600', text: 'text-amber-800', icon: AlertTriangle },
  pending: { ring: 'ring-blue-200', bg: 'bg-blue-50 text-blue-600', text: 'text-blue-800', icon: Loader2 },
}

/**
 * Retour d'action animé, commun à toutes les pages : connexion, inscription,
 * envoi de message, rendu de devoir, paiement… Le même composant sert de
 * bandeau (`inline`) ou d'écran (`screen`) pour que succès et échecs aient
 * partout la même signature visuelle.
 */
export function ActionResult({ status, title, description, detail, actions = [], icon, layout = 'inline', className, children }: ActionResultProps) {
  const reduced = useReducedMotion()
  const palette = PALETTE[status]
  const Icon = icon ?? palette.icon
  const isScreen = layout === 'screen'

  return (
    <motion.div
      role={status === 'error' ? 'alert' : 'status'}
      aria-live={status === 'error' ? 'assertive' : 'polite'}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE } }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, transition: { duration: 0.2 } }}
      className={cn(
        'rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        isScreen ? 'mx-auto w-full max-w-lg p-8 text-center sm:p-10' : 'flex items-start gap-4 p-4 sm:p-5',
        className,
      )}
    >
      <motion.div
        initial={reduced ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { delay: 0.1, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] } }}
        className={cn('flex shrink-0 items-center justify-center rounded-2xl ring-8', palette.bg, palette.ring, isScreen ? 'mx-auto h-20 w-20' : 'h-11 w-11')}
      >
        <Icon className={cn(isScreen ? 'h-10 w-10' : 'h-6 w-6', status === 'pending' && 'animate-spin')} strokeWidth={2} />
      </motion.div>
      <div className={cn('min-w-0 flex-1', isScreen && 'mt-6')}>
        <h2 className={cn('font-black tracking-tight text-slate-900 dark:text-white', isScreen ? 'text-2xl' : 'text-base')}>{title}</h2>
        {description && <p className={cn('mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300', isScreen && 'mx-auto max-w-md')}>{description}</p>}
        {detail && <p className={cn('mt-2 break-words font-mono text-[11px] leading-5', palette.text)}>{detail}</p>}
        {children && <div className="mt-4">{children}</div>}
        {actions.length > 0 && (
          <div className={cn('mt-4 flex flex-wrap gap-2', isScreen && 'justify-center')}>
            {actions.map((action) => <ResultButton key={action.label} {...action} />)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ResultButton({ label, onClick, to, href, variant = 'primary' }: ActionResultAction) {
  const className = cn(
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-black transition-all active:scale-[0.98]',
    variant === 'primary'
      ? 'bg-slate-900 text-white hover:bg-teal-700 dark:bg-white dark:text-slate-900 dark:hover:bg-teal-200'
      : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
  )
  if (to) return <Link to={to} className={className}>{label}</Link>
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={className}>{label}</a>
  return <button type="button" onClick={onClick} className={className}>{label}</button>
}

export function SuccessScreen(props: Omit<ActionResultProps, 'status' | 'layout'>) {
  return <ActionResult status="success" layout="screen" {...props} />
}

export function ErrorScreen(props: Omit<ActionResultProps, 'status' | 'layout'>) {
  return <ActionResult status="error" layout="screen" {...props} />
}

/** Affiche/masque un résultat avec animation, sans que la page saute. */
export function ActionResultSlot({ result }: { result: ActionResultProps | null }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {result && <ActionResult key={`${result.status}-${result.title}`} {...result} />}
    </AnimatePresence>
  )
}
