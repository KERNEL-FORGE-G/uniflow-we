import { useState } from 'react'
import { cn } from '../../utils/cn'
import { getUiAvatarUrl } from '../../utils/avatarUtils'

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
  const [errorCount, setErrorCount] = useState(0)

  const initials = (name || 'User')
    .trim()
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  const avatarSrc = errorCount > 0 ? getUiAvatarUrl(name) : (src || getUiAvatarUrl(name))

  if (errorCount >= 2) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold select-none shrink-0 shadow-2xs',
          getColor(name),
          sizes[size],
          className
        )}
        title={name}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={avatarSrc}
      alt={name}
      onError={() => setErrorCount((c) => c + 1)}
      className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
    />
  )
}


