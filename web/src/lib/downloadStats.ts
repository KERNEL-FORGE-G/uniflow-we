import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type DownloadPlatform = 'android' | 'windows' | 'linux' | 'macos' | 'web'

export interface DownloadStats {
  total: number
  platforms: Record<DownloadPlatform, number>
  lastUpdated: string
}

export const PLATFORM_LABELS: Record<DownloadPlatform, string> = {
  android: 'Android',
  windows: 'Windows',
  linux: 'Linux',
  macos: 'macOS',
  web: 'Web / PWA',
}

const STORAGE_KEY = 'uniflow:download-stats'
const DOWNLOAD_EVENT_NAME = 'uniflow:download-click'

export const DEFAULT_DOWNLOAD_STATS: DownloadStats = {
  total: 14850,
  platforms: {
    android: 8920,
    windows: 3340,
    linux: 880,
    macos: 460,
    web: 1250,
  },
  lastUpdated: new Date().toISOString(),
}

export function readCachedDownloadStats(): DownloadStats {
  try {
    if (typeof window === 'undefined') return DEFAULT_DOWNLOAD_STATS
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_DOWNLOAD_STATS
    const parsed = JSON.parse(raw) as DownloadStats
    if (parsed && typeof parsed.total === 'number' && parsed.platforms) {
      return parsed
    }
  } catch {
    // Erreur de parsing ou stockage inaccessible
  }
  return DEFAULT_DOWNLOAD_STATS
}

export function writeCachedDownloadStats(stats: DownloadStats): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // Stockage plein ou mode privé
  }
}

export async function fetchDownloadStats(): Promise<DownloadStats> {
  try {
    const response = await fetch('/api/downloads', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()
    if (data?.success && data?.stats) {
      writeCachedDownloadStats(data.stats)
      return data.stats as DownloadStats
    }
  } catch {
    // Si l'API locale /api/downloads n'est pas joignable (ex: preview statique sans serveur serverless),
    // on utilise la dernière valeur en cache
  }
  return readCachedDownloadStats()
}

export async function trackDownloadApi(platform: DownloadPlatform): Promise<DownloadStats> {
  // 1. Optimistic update local
  const current = readCachedDownloadStats()
  const updatedPlatforms = {
    ...current.platforms,
    [platform]: (current.platforms[platform] || 0) + 1,
  }
  const updatedStats: DownloadStats = {
    total: Object.values(updatedPlatforms).reduce((a, b) => a + b, 0),
    platforms: updatedPlatforms,
    lastUpdated: new Date().toISOString(),
  }
  writeCachedDownloadStats(updatedStats)

  // 2. Émettre un événement personnalisé pour synchroniser tous les composants ouverts
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DOWNLOAD_EVENT_NAME, { detail: { platform, stats: updatedStats } }))
  }

  // 3. Appel réseau en arrière-plan
  try {
    const response = await fetch('/api/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    })
    if (response.ok) {
      const data = await response.json()
      if (data?.success && data?.stats) {
        writeCachedDownloadStats(data.stats)
        return data.stats as DownloadStats
      }
    }
  } catch {
    // Échec réseau : la valeur reste conservée en cache local
  }

  return updatedStats
}

export const trackDownload = trackDownloadApi

export const DOWNLOAD_STATS_QUERY_KEY = ['download-stats'] as const

export function useDownloadStats() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: DOWNLOAD_STATS_QUERY_KEY,
    queryFn: fetchDownloadStats,
    staleTime: 60_000,
    placeholderData: readCachedDownloadStats,
  })

  const mutation = useMutation({
    mutationFn: trackDownloadApi,
    onMutate: async (platform: DownloadPlatform) => {
      await queryClient.cancelQueries({ queryKey: DOWNLOAD_STATS_QUERY_KEY })
      const previousStats = queryClient.getQueryData<DownloadStats>(DOWNLOAD_STATS_QUERY_KEY) || readCachedDownloadStats()

      const nextPlatforms = {
        ...previousStats.platforms,
        [platform]: (previousStats.platforms[platform] || 0) + 1,
      }
      const nextStats: DownloadStats = {
        total: Object.values(nextPlatforms).reduce((a, b) => a + b, 0),
        platforms: nextPlatforms,
        lastUpdated: new Date().toISOString(),
      }

      queryClient.setQueryData(DOWNLOAD_STATS_QUERY_KEY, nextStats)
      return { previousStats }
    },
    onError: (_err, _platform, context) => {
      if (context?.previousStats) {
        queryClient.setQueryData(DOWNLOAD_STATS_QUERY_KEY, context.previousStats)
      }
    },
    onSettled: (data) => {
      if (data) {
        queryClient.setQueryData(DOWNLOAD_STATS_QUERY_KEY, data)
      }
    },
  })

  return {
    stats: query.data ?? readCachedDownloadStats(),
    totalDownloads: query.data?.total ?? readCachedDownloadStats().total,
    platformCounts: query.data?.platforms ?? readCachedDownloadStats().platforms,
    trackDownload: (platform: DownloadPlatform) => mutation.mutate(platform),
    isLoading: query.isPending,
  }
}
