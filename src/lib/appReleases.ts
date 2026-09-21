import { useQuery } from '@tanstack/react-query'
import { executeService } from './appwrite'
import { CACHE_KEY, readCachedReleases, sanitizeReleases, type AppRelease, type AppReleaseInput } from './appReleasesModel'

/**
 * Accès au service `/app-releases` (liste et upsert) et hooks react-query.
 * La logique pure (types, formats, validation) vit dans `appReleasesModel.ts`,
 * testable avec `node --test` sans SDK Appwrite ; elle est réexportée ici.
 */
export * from './appReleasesModel'

type ListResponse = { ok?: boolean; message?: string; releases?: AppRelease[]; includeDisabled?: boolean }
type UpsertResponse = { ok?: boolean; code?: string; message?: string; release?: AppRelease }

/**
 * Liste des releases via le routeur. `all` n'a d'effet que pour un superadmin
 * (la Function l'ignore sinon) : la page admin l'utilise pour revoir un lien
 * dépublié ; la landing ne reçoit que les liens publiés.
 */
export async function fetchAppReleases(options: { all?: boolean } = {}): Promise<AppRelease[]> {
  const execution = await executeService('/app-releases', { action: 'list', all: options.all === true })
  const body = JSON.parse(execution.responseBody || '{}') as ListResponse
  if (execution.responseStatusCode >= 400 || !body.ok) throw new Error(body.message || 'Liens de téléchargement indisponibles.')
  const releases = sanitizeReleases(body.releases)
  if (!options.all) {
    // Miroir local pour la landing hors ligne : dernière liste publique connue.
    try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(releases)) } catch { /* stockage plein ou privé */ }
  }
  return releases
}

export async function upsertAppRelease(input: AppReleaseInput): Promise<AppRelease> {
  const execution = await executeService('/app-releases', { action: 'upsert', ...input })
  const body = JSON.parse(execution.responseBody || '{}') as UpsertResponse
  if (execution.responseStatusCode >= 400 || !body.ok || !body.release) {
    throw new Error(body.message || 'La mise à jour du lien de téléchargement a échoué.')
  }
  return sanitizeReleases([body.release])[0]
}

export const APP_RELEASES_QUERY_KEY = ['app-releases'] as const
export const APP_RELEASES_ADMIN_QUERY_KEY = ['app-releases', 'admin'] as const

/**
 * Releases publiées, pour la landing et le pied de page : dernière liste
 * connue affichée tout de suite (miroir local + cache react-query persistant),
 * rafraîchie en arrière-plan. Une version publiée reste donc visible hors ligne.
 */
export function useAppReleases() {
  const cached = () => readCachedReleases(typeof window === 'undefined' ? undefined : window.localStorage) ?? undefined
  const query = useQuery({
    queryKey: APP_RELEASES_QUERY_KEY,
    queryFn: () => fetchAppReleases(),
    staleTime: 10 * 60_000,
    placeholderData: cached,
    retry: 1,
  })
  // react-query abandonne le placeholder quand la requête échoue : une Function
  // indisponible ferait alors afficher « bientôt disponible » à un visiteur
  // qui avait déjà vu le lien. On garde le miroir local dans ce cas.
  return { ...query, data: query.data ?? (query.isError ? cached() : undefined) }
}

/** Toutes les releases, publiées ou non — page admin (superadmin). */
export function useAdminAppReleases(enabled: boolean) {
  return useQuery({
    queryKey: APP_RELEASES_ADMIN_QUERY_KEY,
    queryFn: () => fetchAppReleases({ all: true }),
    enabled,
    staleTime: 60_000,
    retry: 1,
    // Réglage d'administration : ne pas le rejouer depuis le cache hors ligne d'un autre compte.
    meta: { persist: false },
  })
}
