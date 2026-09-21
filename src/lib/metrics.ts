import { executeService } from './appwrite'
import { detectBrowser, detectDevice, detectOs, normalizePath, startSessionIfNeeded, visitorIdFrom, type MetricsAdmin, type MetricsSummary } from './metricsModel'

export * from './metricsModel'

/**
 * Appels au service `/metrics` de la Function. Une « session » est une
 * ouverture d'onglet : le premier hit compte une visite, les suivants des
 * pages vues. Jamais bloquant : hors ligne, la visite n'est simplement pas
 * comptée.
 */
async function callMetrics<T>(payload: Record<string, unknown>): Promise<T> {
  const execution = await executeService('/metrics', payload)
  const response = JSON.parse(execution.responseBody || '{}') as T & { ok?: boolean; message?: string }
  if (execution.responseStatusCode >= 400 || !response.ok) throw new Error(response.message || "Mesure d'audience indisponible.")
  return response
}

let lastTracked = ''

/** Journalise une page vue (et une visite si la session commence). Silencieux en cas d'échec. */
export async function trackPageView(hashOrPath: string, authenticated: boolean): Promise<void> {
  if (typeof window === 'undefined') return
  if (navigator.webdriver) return
  const path = normalizePath(hashOrPath)
  if (path === lastTracked) return
  lastTracked = path
  const ua = navigator.userAgent
  try {
    await callMetrics({
      action: 'hit',
      visitorId: visitorIdFrom(window.localStorage),
      newSession: startSessionIfNeeded(window.sessionStorage),
      platform: 'web',
      device: detectDevice(ua, window.innerWidth),
      browser: detectBrowser(ua),
      os: detectOs(ua),
      language: (navigator.language || '').slice(0, 16),
      path,
      referrer: document.referrer ? new URL(document.referrer).hostname.slice(0, 255) : '',
      authenticated,
    })
  } catch {
    // L'audience n'est jamais bloquante : hors ligne, la visite n'est pas comptée, c'est tout.
    lastTracked = ''
  }
}

export function fetchMetricsSummary(): Promise<MetricsSummary> {
  return callMetrics<MetricsSummary>({ action: 'summary' })
}

export function fetchMetricsAdmin(): Promise<MetricsAdmin> {
  return callMetrics<MetricsAdmin>({ action: 'admin' })
}
