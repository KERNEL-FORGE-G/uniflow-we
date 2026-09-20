import { appwriteClient, APPWRITE_DATABASE_ID } from '../lib/appwrite'

export type AppwritePushRegistration = {
  state: 'registered' | 'not-configured' | 'unavailable'
  message: string
}

/** Document de la collection `notifications` (voir `scripts/appwrite-schema.mjs`). */
type RealtimeNotification = {
  title?: string
  message?: string
  type?: string
  link?: string
  ownerId?: string
}

/**
 * Canal de notification web d'UniFlow : **Appwrite Realtime, sans Firebase.**
 *
 * Le projet n'utilise qu'Appwrite. Le push web natif (Web Push via FCM)
 * imposerait un projet Firebase et une clé VAPID Google ; il a été retiré.
 * À la place, on s'abonne au flux temps réel de la collection `notifications`
 * et on affiche une notification navigateur locale (via le Service Worker
 * quand il est actif) à chaque document qui concerne l'utilisateur connecté.
 * Le fonctionnement est identique pour l'utilisateur tant que l'onglet est
 * ouvert, et n'exige aucun fournisseur tiers.
 */
let unsubscribe: (() => void) | null = null

export async function registerAppwritePushTarget(
  registration?: ServiceWorkerRegistration | null,
  currentUserId?: string,
): Promise<AppwritePushRegistration> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return { state: 'unavailable', message: 'Ce navigateur ne prend pas en charge les notifications.' }
  }
  if (Notification.permission !== 'granted') {
    return { state: 'not-configured', message: 'Autorisez les notifications du navigateur pour recevoir les alertes UniFlow.' }
  }

  unsubscribe?.()
  try {
    unsubscribe = appwriteClient.subscribe(
      `databases.${APPWRITE_DATABASE_ID}.collections.notifications.documents`,
      (event) => {
        if (!event.events.some((name) => name.endsWith('.create'))) return
        const payload = event.payload as RealtimeNotification
        if (currentUserId && payload.ownerId && payload.ownerId !== currentUserId) return
        const title = payload.title || 'UniFlow'
        const body = payload.message || ''
        const options: NotificationOptions = { body, icon: '/logo-principal.png', tag: payload.type || 'uniflow', data: { url: payload.link || '/notifications' } }
        if (registration) void registration.showNotification(title, options)
        else new Notification(title, options)
      },
    )
    return { state: 'registered', message: 'Alertes temps réel Appwrite actives pour cet appareil.' }
  } catch {
    return { state: 'unavailable', message: 'Impossible d’ouvrir le canal temps réel Appwrite.' }
  }
}

export function unregisterAppwritePushTarget() {
  unsubscribe?.()
  unsubscribe = null
}
