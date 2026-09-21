/* ============================================================================
 * UniFlow PWA Service Worker
 * Handles Offline Caching, Push Notifications, and Background Sync
 * ============================================================================ */

// `__BUILD_ID__` est remplacé au build par le plugin Vite `uniflow-sw-precache`
// (voir vite.config.ts) : le fichier change donc à chaque déploiement et le
// worker se réinstalle, ce qui n'arrivait plus quand le nom était figé à la main.
const BUILD_ID = '__BUILD_ID__'
const CACHE_NAME = `uniflow-pwa-${BUILD_ID}`
const CACHE_PREFIX = 'uniflow-pwa-'
const PRECACHE_MANIFEST_URL = '/precache-manifest.json'
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/logos/icon-192.png',
  '/logos/icon-512.png',
  '/logos/uniflow-wordmark.png'
]

let manifestAssets = null

async function readManifest() {
  if (manifestAssets) return manifestAssets
  try {
    const response = await fetch(PRECACHE_MANIFEST_URL, { cache: 'no-store' })
    if (!response.ok) return []
    const manifest = await response.json()
    manifestAssets = Array.isArray(manifest.assets) ? manifest.assets : []
    return manifestAssets
  } catch {
    return []
  }
}

async function addAllTolerant(cache, urls, { bypassHttpCache = false } = {}) {
  // `cache.addAll` échoue en bloc au premier 404 ; ici chaque ressource est
  // indépendante pour qu'une image manquante ne prive pas du reste. Les fichiers
  // du shell (non empreintés) contournent le cache HTTP ; les chunks empreintés
  // peuvent venir du cache HTTP, leur contenu ne change jamais.
  await Promise.all(urls.map((url) => cache.add(bypassHttpCache ? new Request(url, { cache: 'no-store' }) : url).catch(() => undefined)))
}

// 1. Installation : app shell + chunks critiques (entrée + CSS) du manifeste.
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    await addAllTolerant(cache, SHELL_ASSETS, { bypassHttpCache: true })
    const assets = await readManifest()
    await addAllTolerant(cache, assets.filter((asset) => asset.critical).map((asset) => asset.url))
    await self.skipWaiting()
  })())
})

// 2. Activation : récupérer depuis l'ancien cache les chunks inchangés (même
// empreinte), supprimer les anciens caches, puis réchauffer le reste en
// arrière-plan sans bloquer l'activation.
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const assets = await readManifest()
    const wanted = new Set(assets.map((asset) => new URL(asset.url, self.location.origin).href))
    const oldNames = (await caches.keys()).filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
    for (const name of oldNames) {
      const oldCache = await caches.open(name)
      for (const request of await oldCache.keys()) {
        if (!wanted.has(request.url) || (await cache.match(request))) continue
        const response = await oldCache.match(request)
        if (response) await cache.put(request, response)
      }
      await caches.delete(name)
    }
    await self.clients.claim()
    warmRemainingAssets(cache, assets)
  })())
})

function warmRemainingAssets(cache, assets) {
  // En économie de données, on se limite aux ressources déjà visitées.
  if (self.navigator && self.navigator.connection && self.navigator.connection.saveData) return
  ;(async () => {
    for (const asset of assets) {
      try {
        if (await cache.match(asset.url)) continue
        await cache.add(asset.url)
      } catch {
        // Réseau coupé pendant le réchauffage : les prochains passages reprendront.
      }
    }
  })()
}

// Activate a waiting worker when the application confirms it is online.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

async function networkFirst(request, cache) {
  try {
    // Requête reconstruite depuis l'URL : `new Request(request, { cache })` lève
    // « Cannot construct a Request with a Request whose mode is 'navigate' » et
    // faisait échouer silencieusement toute la gestion hors ligne des navigations.
    const response = await fetch(request.url, { cache: 'no-store', credentials: 'same-origin' })
    if (response && response.status === 200 && response.type === 'basic') await cache.put(request, response.clone())
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) return cached
    throw error
  }
}

async function cacheFirst(request, cache) {
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response && response.status === 200 && response.type === 'basic') await cache.put(request, response.clone())
  return response
}

// 3. Stratégie : navigation et fichiers non empreintés en réseau d'abord ;
// `/assets/*` (noms empreintés, immuables) en cache d'abord.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  // Les requêtes vers d'autres origines (Google Fonts, Appwrite, avatars…) sont
  // laissées au navigateur : un fetch() relancé depuis le worker est soumis à la
  // directive connect-src de la page, ce qui produisait en production
  // « Fetch API cannot load https://fonts.googleapis.com/… Refused to connect »
  // et des réponses 408 fabriquées ici. Le navigateur, lui, applique img-src /
  // style-src / font-src, qui autorisent déjà ces ressources.
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  // Appwrite/API requests must always reach the network; never cache user data.
  if (url.pathname.includes('/api/')) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const isNavigation = event.request.mode === 'navigate'
    try {
      if (url.pathname.startsWith('/assets/')) return await cacheFirst(event.request, cache)
      return await networkFirst(event.request, cache)
    } catch {
      const isHtmlRequest = isNavigation || (event.request.headers.get('accept') || '').includes('text/html')
      if (isHtmlRequest) {
        const indexCached = (await cache.match('/index.html')) || (await cache.match('/'))
        if (indexCached) return indexCached
        return new Response('<!DOCTYPE html><html lang="fr"><body><h1>UniFlow</h1><p>Hors ligne : ouvrez l’application une première fois en ligne.</p></body></html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      }
      return new Response('', { status: 408, statusText: 'Offline or Network Error' })
    }
  })())
})

// 4. Push Notification Event Listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'UniFlow — Notification',
    body: 'Un nouvel événement universitaire est disponible.',
    url: '/#/app/notifications',
    type: 'general',
    icon: '/logos/icon-192.png',
    badge: '/logos/icon-192.png'
  }

  if (event.data) {
    try {
      const parsed = event.data.json()
      data = { ...data, ...parsed }
    } catch (e) {
      data.body = event.data.text() || data.body
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logos/icon-192.png',
    badge: data.badge || '/logos/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/#/app/notifications',
      type: data.type || 'general',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'explore',
        title: 'Consulter'
      },
      {
        action: 'close',
        title: 'Ignorer'
      }
    ],
    tag: data.type === 'devoir' ? 'assignment-notification' : 'announcement-notification',
    renotify: true
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// 5. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const targetUrl = event.notification.data?.url || '/#/app/notifications'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

// 6. Client PostMessage Handler (for local simulated pushes via SW)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, url, notificationType, tag } = event.data.payload || {}

    const options = {
      body: body || 'Nouveau message UniFlow',
      icon: '/logos/icon-192.png',
      badge: '/logos/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: url || '/#/app/notifications',
        type: notificationType || 'devoir',
        timestamp: Date.now()
      },
      actions: [
        { action: 'explore', title: 'Voir le devoir' },
        { action: 'close', title: 'Ignorer' }
      ],
      tag: tag || 'uniflow-push',
      renotify: true
    }

    self.registration.showNotification(title || 'UniFlow Push', options)
  }
})
