import { useState } from 'react'
import { cn } from '../../utils/cn'
import { avatarFileUrl, getUiAvatarUrl } from '../../utils/avatarUtils'

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

export const OFFICIAL_PRESET_AVATARS = [
  { id: 'uni-copilot-3d', label: 'Uni Copilote 3D', url: '/mascot/uni_copilot_3d.png', category: 'Mascottes Uni' },
  { id: 'uni-graduate', label: 'Uni Diplômé', url: '/mascot/uni_graduate.webp', category: 'Mascottes Uni' },
  { id: 'uni-headset', label: 'Uni En Ligne', url: '/mascot/uni_headset.webp', category: 'Mascottes Uni' },
  { id: 'uni-celebrate', label: 'Uni Trophée', url: '/mascot/uni_celebrate.webp', category: 'Mascottes Uni' },
  { id: 'uni-shield', label: 'Uni Sentinelle', url: '/mascot/uni_shield.webp', category: 'Mascottes Uni' },
  { id: 'uni-wave', label: 'Uni Salut', url: '/mascot/uni_wave.webp', category: 'Mascottes Uni' },
  { id: 'uni-search', label: 'Uni Recherche', url: '/mascot/uni_search.webp', category: 'Mascottes Uni' },
  { id: 'aliya-anime', label: 'Aliya · IA & Data', url: '/team/avatar_aliya_anime.jpg', category: 'Avatars Membres & Anime' },
  { id: 'marcel-anime', label: 'Marcel · Systèmes', url: '/team/avatar_marcel_anime.jpg', category: 'Avatars Membres & Anime' },
  { id: 'judith-anime', label: 'Judith · Déléguée UI', url: '/team/avatar_judith_anime.jpg', category: 'Avatars Membres & Anime' },
  { id: 'juvenal-anime', label: 'Juvénal · Cloud Dev', url: '/team/avatar_juvenal_anime.jpg', category: 'Avatars Membres & Anime' },
  { id: 'miguel-anime', label: 'Miguel · Cybersécurité', url: '/team/avatar_miguel_anime.jpg', category: 'Avatars Membres & Anime' },
  { id: 'ravel-founder', label: 'Ravel · Leader Tech', url: '/team/avatar_ravel_founder.jpg', category: 'Avatars Membres & Anime' },
  { id: 'sandra-anime', label: 'Sandra · Mobile Dev', url: '/team/avatar_sandra_mascot.jpg', category: 'Avatars Membres & Anime' },
  { id: 'william-anime', label: 'William · Architecte', url: '/team/avatar_william_mascot.jpg', category: 'Avatars Membres & Anime' },
]

export function getDefaultAvatarByName(name: string): string {
  let hash = 0
  for (let i = 0; i < (name || 'User').length; i++) {
    hash = (name || 'User').charCodeAt(i) + ((hash << 5) - hash)
  }
  return OFFICIAL_PRESET_AVATARS[Math.abs(hash) % OFFICIAL_PRESET_AVATARS.length].url
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
  avatarFileId,
  name,
  size = 'md',
  className,
}: {
  src?: string
  /**
   * Identifiant du fichier dans le bucket `uniflow_avatars` ou chemin d'avatar prédéfini (ex: `/mascot/...`).
   * Prioritaire sur `src`.
   */
  avatarFileId?: string | null
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

  const resolvedDirectUrl = avatarFileUrl(avatarFileId) || src
  const defaultFallback = getDefaultAvatarByName(name)

  const avatarSrc = errorCount === 0
    ? (resolvedDirectUrl || defaultFallback)
    : errorCount === 1
      ? defaultFallback
      : getUiAvatarUrl(name)

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


