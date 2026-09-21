import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { UniMascot, type UniPose } from '@/components/mascot/UniMascot'

interface EmptyStateProps {
  icon?: LucideIcon
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
  icon: Icon,
  title,
  description,
  action,
  mascot = false,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in', className)}>
      {/* Icon or Mascot */}
      <div className="mb-4 animate-bounce-in">
        {mascot ? (
          <UniMascot pose={mascot === true ? 'search' : mascot} size={128} />
        ) : Icon ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3f4f6]">
            <Icon className="h-8 w-8 text-[#9ca3af]" strokeWidth={1.5} />
          </div>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[#111827] mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-[#6b7280] max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Action Button */}
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
