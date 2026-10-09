import { useEffect, useRef, useState } from 'react'
import { UserRound } from 'lucide-react'
import { cn } from '../../utils/cn'
import { avatarViewUrl } from '../../lib/appwrite'

/**
 * Photo d'un membre de l'équipe.
 *
 * Stratégie de chargement :
 * 1. Génère l'URL Appwrite (bucket `uniflow_assets`).
 * 2. Pre-charge l'image via un objet `Image` côté JS pour détecter l'erreur
 *    avant que le `<img>` visible ne clignote avec une icône cassée.
 * 3. Affiche un shimmer pendant le chargement, l'image une fois prête,
 *    ou une silhouette neutre en cas d'échec.
 *
 * On n'utilise jamais ui-avatars.com ni d'initiales générées : un rond neutre
 * se lit comme « pas encore de photo », pas comme une photo ratée.
 */
const LOCAL_AVATAR_FALLBACKS: Record<string, string> = {
  'nghomsi feukouo ravel': '/team/ravel.jpg',
  'archlord': '/team/avatar_ravel_founder.jpg',
  'hassane youssouf oumar': '/team/hassane.jpg',
  'febnchak m. borelle sandra': '/team/sandra.jpg',
  'febnchak sandra borelle': '/team/sandra.jpg',
  'febnchak sandra': '/team/sandra.jpg',
  'meli william': '/team/william.jpg',
  'mokam zune ange gabrielle': '/team/mokam.jpg',
  'mokam ange': '/team/mokam.jpg',
  'ange gabrielle mokam': '/team/mokam.jpg',
}

const LOCAL_MASCOT_FALLBACKS: Record<string, string> = {
  'nghomsi feukouo ravel': '/team/avatar_ravel_founder.jpg',
  'archlord': '/team/avatar_ravel_founder.jpg',
  'hassane youssouf oumar': '/team/avatar_hassane_mascot.jpg',
  'febnchak m. borelle sandra': '/team/avatar_sandra_mascot.jpg',
  'febnchak sandra borelle': '/team/avatar_sandra_mascot.jpg',
  'febnchak sandra': '/team/avatar_sandra_mascot.jpg',
  'meli william': '/team/avatar_william_mascot.jpg',
  'mokam zune ange gabrielle': '/team/avatar_mokam_mascot.jpg',
  'mokam ange': '/team/avatar_mokam_mascot.jpg',
  'ange gabrielle mokam': '/team/avatar_mokam_mascot.jpg',
}

export function TeamMemberAvatar({
  avatarFileId,
  name,
  className,
  iconClassName = 'h-1/2 w-1/2',
}: {
  avatarFileId?: string | null
  name: string
  className?: string
  iconClassName?: string
}) {
  const normKey = name.toLowerCase().trim()
  const localFallback = LOCAL_AVATAR_FALLBACKS[normKey]
  const mascotFallback = LOCAL_MASCOT_FALLBACKS[normKey]
  const appwriteUrl = avatarViewUrl(avatarFileId)
  const initialSrc = appwriteUrl || localFallback || mascotFallback || ''

  const [currentSrc, setCurrentSrc] = useState(initialSrc)
  const [hasError, setHasError] = useState(!initialSrc)

  const handleError = () => {
    if (currentSrc && localFallback && currentSrc !== localFallback) {
      setCurrentSrc(localFallback)
    } else if (currentSrc && mascotFallback && currentSrc !== mascotFallback) {
      setCurrentSrc(mascotFallback)
    } else {
      setHasError(true)
    }
  }

  if (hasError || !currentSrc) {
    return (
      <div
        role="img"
        aria-label={`${name} — pas de photo`}
        className={cn(
          'flex items-center justify-center bg-slate-100 text-slate-400 shrink-0',
          className
        )}
      >
        <UserRound className={iconClassName} strokeWidth={1.5} aria-hidden />
      </div>
    )
  }

  return (
    <img
      src={currentSrc}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={handleError}
      className={cn('object-cover bg-slate-100 shrink-0', className)}
    />
  )
}
