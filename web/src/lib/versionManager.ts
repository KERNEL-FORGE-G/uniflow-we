import { del, createStore } from 'idb-keyval'

const STORAGE_BUILD_KEY = 'uniflow:active-build-id'
const RELOAD_GUARD_KEY = 'uniflow:version-reload-at'

export const CURRENT_BUILD_ID: string =
  (import.meta.env as Record<string, string | undefined>).VITE_APP_BUILD_ID || '__BUILD_ID__'

function isRealBuildId(id: string): boolean {
  return Boolean(id) && id !== '__BUILD' + '_ID__' && id !== 'dev'
}

function canAutoReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || '0')
    const now = Date.now()
    if (last && now - last < 12_000) return false
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(now))
    return true
  } catch {
    return true
  }
}

export async function purgeStaleBrowserCaches(keepBuildId?: string): Promise<void> {
  if (typeof window === 'undefined') return

  // 1. Purge CacheStorage
  if ('caches' in window) {
    try {
      const keys = await caches.keys()
      const keepName = keepBuildId ? `uniflow-pwa-${keepBuildId}` : null
      await Promise.all(
        keys.map((key) => {
          if (keepName && key === keepName) return Promise.resolve(false)
          return caches.delete(key)
        }),
      )
    } catch {
      // Ignore cache deletion errors
    }
  }

  // 2. Purge persisted React Query IndexedDB cache so fresh UI/API data loads cleanly
  try {
    const store = createStore('uniflow-offline', 'query-cache')
    await del('react-query-client', store)
  } catch {
    // Ignore IndexedDB errors
  }
}

/**
 * Checks `/precache-manifest.json` bypassing all HTTP and SW caches.
 * If a newer deployment is available on the server, purges old caches and reloads.
 */
export async function checkAndApplyAppUpdate(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.onLine) return false

  try {
    const response = await fetch(`/precache-manifest.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    })
    if (!response.ok) return false

    const manifest = (await response.json()) as { buildId?: string }
    const remoteBuildId = manifest?.buildId
    if (!remoteBuildId) return false

    const storedBuildId = localStorage.getItem(STORAGE_BUILD_KEY)
    const bundleMismatch = isRealBuildId(CURRENT_BUILD_ID) && CURRENT_BUILD_ID !== remoteBuildId

    if (storedBuildId !== remoteBuildId || bundleMismatch) {
      localStorage.setItem(STORAGE_BUILD_KEY, remoteBuildId)
      await purgeStaleBrowserCaches(remoteBuildId)

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(async (reg) => {
            await reg.update().catch(() => undefined)
            reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
          }),
        )
      }

      if (bundleMismatch && canAutoReload()) {
        const url = new URL(window.location.href)
        url.searchParams.set('_v', remoteBuildId)
        window.location.replace(url.toString())
        return true
      }
    } else {
      // Clean up temporary `_v` query param from URL bar once up to date
      try {
        const url = new URL(window.location.href)
        if (url.searchParams.has('_v')) {
          url.searchParams.delete('_v')
          window.history.replaceState({}, '', url.toString())
        }
      } catch {
        // Ignore URL cleanup errors
      }
    }
  } catch {
    // Offline or transient network error
  }
  return false
}

/**
 * Manual 1-click hard refresh: unregisters all Service Workers, deletes all
 * CacheStorage + IndexedDB query caches, and reloads from the network.
 */
export async function forceClearCacheAndReload(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    await purgeStaleBrowserCaches()
    localStorage.removeItem(STORAGE_BUILD_KEY)
    sessionStorage.removeItem(RELOAD_GUARD_KEY)

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((reg) => reg.unregister().catch(() => false)))
    }
  } catch {
    // Proceed with reload regardless
  }

  const url = new URL(window.location.href)
  url.searchParams.set('_v', String(Date.now()))
  window.location.replace(url.toString())
}

let watcherStarted = false

export function startVersionWatcher(): void {
  if (typeof window === 'undefined' || watcherStarted) return
  watcherStarted = true

  void checkAndApplyAppUpdate()

  const onVisibleOrFocus = () => {
    if (document.visibilityState === 'visible') {
      void checkAndApplyAppUpdate()
    }
  }

  window.addEventListener('focus', onVisibleOrFocus)
  window.addEventListener('online', onVisibleOrFocus)
  window.addEventListener('hashchange', onVisibleOrFocus)
  document.addEventListener('visibilitychange', onVisibleOrFocus)

  // Poll every 45 seconds for new deployments while the tab is open
  window.setInterval(() => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      void checkAndApplyAppUpdate()
    }
  }, 45_000)

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'UNIFLOW_SW_ACTIVATED') {
        const swBuildId = String(event.data.buildId || '')
        if (swBuildId && isRealBuildId(CURRENT_BUILD_ID) && swBuildId !== CURRENT_BUILD_ID) {
          if (canAutoReload()) {
            const url = new URL(window.location.href)
            url.searchParams.set('_v', swBuildId)
            window.location.replace(url.toString())
          }
        }
      }
    })
  }
}
