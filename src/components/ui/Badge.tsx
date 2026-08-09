import { cn } from '../../utils/cn'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'purple'

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-[#eff3ff] text-[#1e3a8a] border border-[#dce5fd]',
  success: 'bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]',
  warning: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
  danger:  'bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]',
  info:    'bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]',
  neutral: 'bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]',
  purple:  'bg-[#ede9fe] text-[#5b21b6] border border-[#ddd6fe]',
}

export function Badge({
  children,
  variant = 'neutral',
  color,
  className,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  color?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variants[color || variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
