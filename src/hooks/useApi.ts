import { useState, useEffect, useCallback } from 'react'
import { ApiError } from '@/lib/api'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook générique pour appeler un endpoint API.
 * Gère automatiquement loading, error, et les erreurs 401.
 *
 * Usage:
 *   const { data, loading, error } = useApi(() => coursesApi.list())
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): ApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then(result => {
        if (!cancelled) setData(result)
      })
      .catch(err => {
        if (!cancelled) {
          const msg = err instanceof ApiError ? err.message : 'Erreur inattendue'
          setError(msg)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { data, loading, error, refetch }
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
