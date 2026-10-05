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
  const src = avatarViewUrl(avatarFileId)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(
    src ? 'loading' : 'error'
  )
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!src) { setState('error'); return }
    setState('loading')
    const probe = new Image()
    probe.onload = () => setState('ready')
    probe.onerror = () => setState('error')
    probe.src = src
    imgRef.current = probe
    return () => { probe.onload = null; probe.onerror = null }
  }, [src])

  if (state === 'error' || !src) {
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

  if (state === 'loading') {
    return (
      <div
        aria-hidden
        className={cn('animate-pulse bg-slate-700/60 shrink-0', className)}
      />
    )
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={() => setState('error')}
      className={cn('object-cover bg-slate-100 shrink-0', className)}
    />
  )
}
