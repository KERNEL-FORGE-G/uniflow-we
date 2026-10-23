import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { executeService } from './appwrite'

export type DownloadPlatform = 'android' | 'windows' | 'linux' | 'macos' | 'web'

export interface DownloadStats {
  total: number
  platforms: Record<DownloadPlatform, number>
  /** Comptes créés et ouverts : plancher du total. */
  accounts?: number
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
const SENT_KEY = 'uniflow:download-sent'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

/** Compteurs à zéro : aucun chiffre n'est inventé, seuls les clics réels comptent. */
export const EMPTY_DOWNLOAD_STATS: DownloadStats = {
  total: 0,
  platforms: { android: 0, windows: 0, linux: 0, macos: 0, web: 0 },
  lastUpdated: '',
}

export function readCachedDownloadStats(): DownloadStats {
  try {
    if (typeof window === 'undefined') return EMPTY_DOWNLOAD_STATS
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_DOWNLOAD_STATS
    const parsed = JSON.parse(raw) as DownloadStats
    if (parsed && typeof parsed.total === 'number' && parsed.platforms) return parsed
  } catch {
    // stockage inaccessible ou illisible
  }
  return EMPTY_DOWNLOAD_STATS
}

function writeCachedDownloadStats(stats: DownloadStats): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // stockage plein ou mode privé
  }
}

async function callDownloads(payload: { action: 'stats' } | { action: 'track'; platform: DownloadPlatform }): Promise<DownloadStats> {
  const execution = await executeService('/downloads', payload)
  const body = JSON.parse(execution.responseBody || '{}') as { ok?: boolean; total?: number; accounts?: number; platforms?: Record<DownloadPlatform, number>; generatedAt?: string }
  if (execution.responseStatusCode >= 400 || !body.ok || !body.platforms) throw new Error('Compteur indisponible.')
  const stats: DownloadStats = {
    total: body.total ?? 0,
    accounts: body.accounts ?? 0,
    platforms: { ...EMPTY_DOWNLOAD_STATS.platforms, ...body.platforms },
    lastUpdated: body.generatedAt ?? new Date().toISOString(),
  }
  writeCachedDownloadStats(stats)
  return stats
}

export async function fetchDownloadStats(): Promise<DownloadStats> {
  try {
    return await callDownloads({ action: 'stats' })
  } catch {
    return readCachedDownloadStats()
  }
}

/** Un clic par navigateur, par plateforme et par jour : un double-clic ne gonfle pas le chiffre. */
function alreadyCountedToday(platform: DownloadPlatform): boolean {
  try {
    const sent = JSON.parse(window.localStorage.getItem(SENT_KEY) || '{}') as Record<string, number>
    if (Date.now() - (sent[platform] || 0) < ONE_DAY_MS) return true
    sent[platform] = Date.now()
    window.localStorage.setItem(SENT_KEY, JSON.stringify(sent))
  } catch {
    // sans stockage, on compte
  }
  return false
}

export async function trackDownloadApi(platform: DownloadPlatform): Promise<DownloadStats> {
  if (typeof window === 'undefined' || alreadyCountedToday(platform)) return fetchDownloadStats()
  try {
    return await callDownloads({ action: 'track', platform })
  } catch {
    return readCachedDownloadStats()
  }
}

export const trackDownload = trackDownloadApi

export const DOWNLOAD_STATS_QUERY_KEY = ['download-stats'] as const

export function useDownloadStats() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: DOWNLOAD_STATS_QUERY_KEY,
    queryFn: fetchDownloadStats,
    staleTime: 30_000,
    placeholderData: readCachedDownloadStats,
  })

  const mutation = useMutation({
    mutationFn: trackDownloadApi,
    onSuccess: (stats) => queryClient.setQueryData(DOWNLOAD_STATS_QUERY_KEY, stats),
  })

  const stats = query.data ?? readCachedDownloadStats()
  return {
    stats,
    totalDownloads: stats.total,
    platformCounts: stats.platforms,
    trackDownload: (platform: DownloadPlatform) => mutation.mutate(platform),
    isLoading: query.isPending,
  }
}
