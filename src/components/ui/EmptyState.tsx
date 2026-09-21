import type { ComponentType } from 'react'
import { cn } from '../../utils/cn'
import { UniMascot, type UniPose } from '@/components/mascot/UniMascot'
import { IconTile, type UniIconName } from './UniIcon'

/** Composant d'icône « à l'ancienne » (lucide ou Phosphor) : toléré pour les appelants pas encore migrés. */
type LegacyIcon = ComponentType<{ className?: string; size?: number | string; 'aria-hidden'?: boolean | 'true' | 'false' }>

interface EmptyStateProps {
  /** Nom sémantique UniFlow (tuile Phosphor `soft`) ou, à défaut, un composant d'icône. */
  icon?: UniIconName | LegacyIcon
  /** Teinte de la tuile quand `icon` est un nom sémantique. */
  color?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  /** Uni illustre l'état vide : `true` = loupe, ou une pose explicite. */
  mascot?: boolean | UniPose
  className?: string
}

export function EmptyState({
  icon,
  color = '#64748B',
  title,
  description,
  action,
  mascot = false,
  className,
}: EmptyStateProps) {
  const LegacyIcon = typeof icon === 'function' || (typeof icon === 'object' && icon !== null) ? (icon as LegacyIcon) : null
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in', className)}>
      <div className="mb-4 animate-bounce-in">
        {mascot ? (
          <UniMascot pose={mascot === true ? 'search' : mascot} size={128} />
        ) : typeof icon === 'string' ? (
          <IconTile name={icon} color={color} variant="soft" size={56} />
        ) : LegacyIcon ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3f4f6]">
            <LegacyIcon className="h-8 w-8 text-[#9ca3af]" aria-hidden="true" />
          </div>
        ) : null}
      </div>

      <h3 className="text-lg font-bold text-[#111827] mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-[#6b7280] max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] active:scale-95 transition-all shadow-sm hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
