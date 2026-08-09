import { cn } from '../../utils/cn'

const colorPalette = [
  'bg-[#1e3a8a] text-white',
  'bg-[#0d9488] text-white',
  'bg-[#7c3aed] text-white',
  'bg-[#dc2626] text-white',
  'bg-[#d97706] text-white',
  'bg-[#059669] text-white',
  'bg-[#0891b2] text-white',
  'bg-[#db2777] text-white',
]

function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colorPalette[Math.abs(hash) % colorPalette.length]
}

const sizes = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-20 w-20 text-2xl',
}

export function Avatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string
  name: string
  size?: keyof typeof sizes
  className?: string
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold shrink-0 select-none',
        sizes[size],
        getColor(name),
        className,
      )}
    >
      {initials}
    </div>
  )
}
