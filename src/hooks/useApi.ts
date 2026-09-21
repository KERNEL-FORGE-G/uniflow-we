import { useState, useCallback, useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
  /** Rafraîchissement en cours alors que des données sont déjà affichées. */
  refreshing: boolean
  /** Les données affichées viennent du cache et la dernière lecture réseau a échoué. */
  stale: boolean
  /** Horodatage de la dernière lecture réussie (0 si aucune). */
  updatedAt: number
}

export interface UseApiOptions {
  /**
   * Clé stable et lisible du cache (`schedules.mine`, `attendance.byCourse`).
   * Avec une clé, la lecture est partagée entre les pages et persistée dans
   * IndexedDB pour être servie hors ligne ; sans clé, elle reste éphémère.
   */
  key?: string
}

/**
 * Hook générique de lecture, adossé à react-query.
 *
 * Il a remplacé un `useState`/`useEffect` maison parce qu'un rechargement hors
 * ligne affichait des pages vides : rien ne survivait à l'onglet. Le contrat
 * (`data`, `loading`, `error`, `refetch`) est conservé pour les pages
 * existantes ; `loading` n'est vrai qu'en l'absence de données, et une erreur
 * réseau survenant alors que le cache est rempli ne masque plus les données —
 * elle est exposée par `stale`.
 *
 * Usage :
 *   const { data, loading, error } = useApi(() => coursesApi.mine(), [], { key: 'courses.mine' })
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseApiOptions = {},
): ApiState<T> {
  const instanceId = useId()
  const persisted = Boolean(options.key)
  const query = useQuery<T>({
    queryKey: persisted ? ['api', options.key, ...deps] : ['api-ephemeral', instanceId, ...deps],
    queryFn: fetcher,
    // Sans clé, chaque instance garde son propre résultat, comme avant, et
    // rien n'est écrit dans IndexedDB (voir `shouldDehydrateQuery`).
    meta: persisted ? undefined : { persist: false },
    gcTime: persisted ? undefined : 0,
  })

  const hasData = query.data !== undefined
  // Les erreurs Appwrite (`ApiError`) comme les `Error` génériques portent un
  // message utile ; seul un rejet sans message tombe sur le libellé neutre.
  const errorMessage = query.error ? ((query.error instanceof ApiError || query.error instanceof Error) && query.error.message ? query.error.message : 'Erreur inattendue') : null

  return {
    data: hasData ? (query.data as T) : null,
    loading: query.isPending,
    error: hasData ? null : errorMessage,
    refetch: () => { void query.refetch() },
    refreshing: hasData && query.isFetching,
    stale: hasData && query.error !== null,
    updatedAt: query.dataUpdatedAt,
  }
}

/**
 * Hook pour les mutations (POST/PUT/DELETE).
 *
 * Usage:
 *   const { mutate, loading, error } = useMutation((data) => api.post('/endpoint', data))
 */
export function useMutation<TInput, TOutput = void>(
  mutator: (input: TInput) => Promise<TOutput>,
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TOutput | null>(null)

  const mutate = useCallback(async (input: TInput): Promise<TOutput | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutator(input)
      setData(result)
      return result
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erreur inattendue'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [mutator])

  return { mutate, loading, error, data, setError }
}
