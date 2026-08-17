/**
 * UniFlow PWA Push Notification Service
 * Integrates ServiceWorker API to deliver real-time push alerts to students
 * for new assignments, academic announcements, and schedule updates.
 */

export interface PushNotificationPayload {
  title: string
  body: string
  url?: string
  notificationType?: 'devoir' | 'annonce' | 'system' | 'note' | 'general'
  tag?: string
  icon?: string
}

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null
  private storageKey = 'uniflow_push_notifications_enabled'
  private updateBound = false

  /**
   * Initialize Service Worker and Push Notification Service
   */
  async init(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[UniFlow PWA] Service Workers not supported in this browser.')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      this.swRegistration = registration

      // Apply a newly installed worker on the next safe navigation instead of
      // keeping an obsolete app shell alive indefinitely.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (this.updateBound) window.location.reload()
      })

      // Listen for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[UniFlow PWA] New Service Worker content available.')
              } else {
                console.log('[UniFlow PWA] Content cached for offline use.')
              }
            }
          }
        }
      }

      this.updateBound = true
      console.log('[UniFlow PWA] Service Worker registered successfully:', registration.scope)
      return registration
    } catch (error) {
      console.error('[UniFlow PWA] Service Worker registration failed:', error)
      return null
    }
  }

  /** Ask the browser for a fresh service-worker script and app shell. */
  async update(): Promise<void> {
    if (!this.swRegistration) {
      await this.init()
    }
    try {
      await this.swRegistration?.update()
      this.swRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    } catch (error) {
      console.warn('[UniFlow PWA] Update check failed:', error)
    }
  }

  /**
   * Check if notifications are supported in browser
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'Notification' in window
  }

  /**
   * Get current browser notification permission
   */
  getPermissionState(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission
  }

  /**
   * Get user preference setting from localStorage
   */
  isEnabled(): boolean {
    if (!this.isSupported()) return false
    const saved = localStorage.getItem(this.storageKey)
    if (saved !== null) {
      return saved === 'true' && Notification.permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  /**
   * Set user push notification setting
   */
  async setEnabled(enabled: boolean): Promise<boolean> {
    localStorage.setItem(this.storageKey, enabled ? 'true' : 'false')

    if (enabled) {
      const permission = await this.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  /**
   * Request notification permissions from user
   */
  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported'

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        localStorage.setItem(this.storageKey, 'true')
        await this.init() // Ensure SW registration
      } else {
        localStorage.setItem(this.storageKey, 'false')
      }
      return permission
    } catch (error) {
      console.error('[UniFlow PWA] Error requesting notification permission:', error)
      return 'denied'
    }
  }

  private toAppUrl(url?: string): string {
    if (!url) return '/#/app/notifications'
    if (/^(https?:|mailto:|tel:)/i.test(url) || url.includes('#/')) return url
    return `/#${url.startsWith('/') ? url : `/${url}`}`
  }

  /**
   * Dispatch a push notification using ServiceWorker registration
   */
  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('[UniFlow PWA] Notifications unsupported.')
      return false
    }

    if (Notification.permission !== 'granted') {
      console.warn('[UniFlow PWA] Notification permission not granted.')
      return false
    }

    // Ensure SW is registered
    if (!this.swRegistration) {
      this.swRegistration = await this.init()
    }

    const {
      title,
      body,
      url = '/#/app/notifications',
      notificationType = 'general',
      tag = 'uniflow-alert',
      icon = '/logos/icon-192.png'
    } = payload

    const targetUrl = this.toAppUrl(url)

    // Method 1: Use active ServiceWorker registration showNotification
    if (this.swRegistration && this.swRegistration.active) {
      try {
        await this.swRegistration.showNotification(title, {
          body,
          icon,
          badge: icon,
          vibrate: [100, 50, 100],
          data: {
            url: targetUrl,
            type: notificationType,
            timestamp: Date.now()
          },
          actions: [
            { action: 'explore', title: 'Consulter' },
            { action: 'close', title: 'Ignorer' }
          ],
          tag,
          renotify: true
        } as any)
        return true
      } catch (err) {
        console.warn('[UniFlow PWA] SW showNotification failed, using fallback:', err)
      }
    }

    // Method 2: Fallback to standard Notification API
    try {
      const notif = new Notification(title, {
        body,
        icon,
        tag
      })
      notif.onclick = () => {
        window.focus()
        window.location.href = targetUrl
        notif.close()
      }
      return true
    } catch (err) {
      console.error('[UniFlow PWA] Failed to display notification fallback:', err)
      return false
    }
  }

  /**
   * Helper: Alert student about a new assignment
   */
  async notifyNewAssignment(assignment: {
    title: string
    courseName?: string
    dueDate?: string
    id?: string
  }): Promise<boolean> {
    const title = `📝 Nouveau Devoir : ${assignment.title}`
    const course = assignment.courseName ? `Matière : ${assignment.courseName}` : 'Nouveau travail à faire'
    const date = assignment.dueDate ? ` • À rendre le ${assignment.dueDate}` : ''
    const body = `${course}${date}`

    return this.sendPushNotification({
      title,
      body,
      url: '/#/app/devoirs',
      notificationType: 'devoir',
      tag: `assignment-${assignment.id || Date.now()}`
    })
  }

  /**
   * Helper: Alert student about a new academic announcement
   */
  async notifyNewAnnouncement(announcement: {
    title: string
    author?: string
    content?: string
    id?: string
  }): Promise<boolean> {
    const title = `📢 Annonce : ${announcement.title}`
    const author = announcement.author ? `Par ${announcement.author} — ` : ''
    const snippet = announcement.content ? announcement.content.slice(0, 100) : 'Nouvelle information importante disponible sur UniFlow.'
    const body = `${author}${snippet}`

    return this.sendPushNotification({
      title,
      body,
      url: '/#/app/notifications',
      notificationType: 'annonce',
      tag: `announcement-${announcement.id || Date.now()}`
    })
  }

  /**
   * Helper: Send a test PWA Push Notification
   */
  async sendTestNotification(): Promise<boolean> {
    return this.sendPushNotification({
      title: '🔔 Test Notification Push PWA UniFlow',
      body: 'Le ServiceWorker UniFlow fonctionne parfaitement ! Vous recevrez désormais les alertes de devoirs et d\'annonces.',
      url: '/#/app/devoirs',
      notificationType: 'system',
      tag: 'test-push'
    })
  }
}

export const pushNotificationService = new PushNotificationService()
export default pushNotificationService
