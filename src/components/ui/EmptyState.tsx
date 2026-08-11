import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  mascot?: boolean
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
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl overflow-hidden">
            <img 
              src="/logos/mascotte.png" 
              alt="UniFlow Mascotte" 
              className="h-full w-full object-contain opacity-60" 
              onError={(e) => {
                const target = e.currentTarget
                if (target.src.includes('/logos/mascotte.png')) {
                  target.src = '/mascotte.png'
                }
              }}
            />
          </div>
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
