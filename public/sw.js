/* ============================================================================
 * UniFlow PWA Service Worker
 * Handles Offline Caching, Push Notifications, and Background Sync
 * ============================================================================ */

// Bump à chaque changement du shell d’authentification afin d’éviter qu’une
// ancienne version conserve des règles de session obsolètes dans le navigateur.
const CACHE_NAME = 'uniflow-pwa-cache-v7'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/logos/icon-192.png',
  '/logos/icon-512.png'
]

// 1. Installation: Cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Continue if some non-critical static assets fail
      })
    }).then(() => self.skipWaiting())
  )
})

// 2. Activation: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// Activate a waiting worker when the application confirms it is online.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// 3. Fetch Strategy: Network First with Cache Fallback for offline resilience
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  // Appwrite/API requests must always reach the network; never cache user data.
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('appwrite.io') ||
    event.request.url.includes('api-uniflow') ||
    event.request.url.includes('185.181.10.106')
  ) return

  const isAppShellRequest = event.request.mode === 'navigate' || ['script', 'style'].includes(event.request.destination)
  const networkRequest = isAppShellRequest
    ? new Request(event.request, { cache: 'no-store' })
    : event.request

  event.respondWith(
    fetch(networkRequest)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return networkResponse
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          const isHtmlRequest = event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))
          if (isHtmlRequest) {
            return caches.match('/index.html').then((indexCached) => {
              if (indexCached) return indexCached
              return fetch('/index.html').catch(() => new Response('<!DOCTYPE html><html><body><h1>UniFlow App</h1></body></html>', { headers: { 'Content-Type': 'text/html' } }))
            })
          }
          return new Response('', { status: 408, statusText: 'Offline or Network Error' })
        })
      })
  )
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
