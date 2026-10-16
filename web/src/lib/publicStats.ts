import { useQuery } from '@tanstack/react-query'
import { executeService } from './appwrite'

/** Chiffres publics du service `/public-stats` : des totaux, jamais de ligne brute. */
export type PublicStats = {
  universities: number
  faculties: number
  programs: number
  courses: number
  sessions: number
  classrooms: number
  students: number
  teachers: number
  users: number
  teamMembers: number
  documents: number
  visitors: number
  visits: number
  visitsToday: number
  platforms: { web: number; mobile: number; desktop: number }
  generatedAt: string
}

const CACHE_KEY = 'uniflow:public-stats'

export function readCachedStats(storage: Pick<Storage, 'getItem'> | undefined): PublicStats | null {
  try {
    const raw = storage?.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as PublicStats) : null
  } catch {
    return null
  }
}

export async function fetchPublicStats(): Promise<PublicStats> {
  const execution = await executeService('/public-stats', {})
  const body = JSON.parse(execution.responseBody || '{}') as PublicStats & { ok?: boolean; message?: string }
  if (execution.responseStatusCode >= 400 || !body.ok) throw new Error(body.message || 'Chiffres indisponibles.')
  try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(body)) } catch { /* stockage plein ou privé */ }
  return body
}

/**
 * Les chiffres de la page d'accueil : dernière valeur connue affichée tout de
 * suite (cache local), rafraîchie en arrière-plan. Hors ligne, la landing
 * garde donc ses chiffres au lieu d'un bandeau vide.
 */
export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: fetchPublicStats,
    staleTime: 5 * 60_000,
    placeholderData: () => readCachedStats(typeof window === 'undefined' ? undefined : window.localStorage) ?? undefined,
    retry: 1,
  })
}
