import { useState } from 'react'
import { UserRound } from 'lucide-react'
import { cn } from '../../utils/cn'
import { avatarViewUrl } from '../../lib/appwrite'

/**
 * Photo d'un membre de l'équipe.
 *
 * Quand il n'y a pas de photo — ou que celle-ci ne se charge pas — on affiche
 * une **silhouette neutre** : un rond gris et une icône de personne, sans
 * aucune lettre. C'est une demande explicite du propriétaire : les initiales
 * dessinées dans l'image (ui-avatars.com, et le repli de `Avatar.tsx`) donnent
 * l'impression d'une photo ratée, alors qu'un rond neutre se lit comme « pas
 * encore de photo ». Le repli de `handleAvatarError` est donc délibérément
 * écarté ici.
 *
 * Ce composant est partagé par la page publique `/teams` et par
 * l'administration, pour que les deux montrent exactement la même chose.
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
  const [broken, setBroken] = useState(false)
  const src = broken ? '' : avatarViewUrl(avatarFileId)

  if (!src) {
    return (
      <div
        role="img"
        aria-label={`${name} — pas de photo`}
        className={cn('flex items-center justify-center bg-slate-100 text-slate-400 shrink-0', className)}
      >
        <UserRound className={iconClassName} strokeWidth={1.5} aria-hidden />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className={cn('object-cover bg-slate-100 shrink-0', className)}
    />
  )
}
