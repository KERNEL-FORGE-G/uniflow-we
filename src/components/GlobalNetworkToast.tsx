import { useState, useEffect, useCallback } from 'react'
import { ToastContainer, ToastType } from './ui/Toast'

interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

export function GlobalNetworkToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    setToasts((prev) => {
      // Éviter d'accumuler trop de toasts identiques sur l'écran
      const filtered = prev.filter((t) => t.title !== toast.title || t.message !== toast.message)
      return [...filtered.slice(-3), { ...toast, id }]
    })
  }, [])

  useEffect(() => {
    // Écouteur pour les erreurs réseau, CORS, ou Timeouts émis par l'API client
    const handleNetworkError = (e: Event) => {
      const customEvent = e as CustomEvent<{ url?: string; message?: string }>
      const url = customEvent.detail?.url || ''
      const shortUrl = url.length > 40 ? `${url.substring(0, 37)}...` : url

      addToast({
        type: 'warning',
        title: 'Serveur distant indisponible (CORS / Timeout)',
        message: shortUrl
          ? `Accès à ${shortUrl} bloqué ou en délai dépassé. Basculement automatique en mode local PWA.`
          : 'Problème de connexion avec le serveur distant. Données chargées depuis le stockage local.',
        duration: 7000,
      })
    }

    // Écouteur pour la perte de connexion Internet (Navigateur Offline)
    const handleOffline = () => {
      addToast({
        type: 'error',
        title: 'Connexion réseau interrompue',
        message: 'Vous êtes actuellement hors-ligne. UniFlow fonctionne en mode autonome local.',
        duration: 8000,
      })
    }

    // Écouteur pour le rétablissement de la connexion Internet
    const handleOnline = () => {
      addToast({
        type: 'success',
        title: 'Connexion réseau rétablie',
        message: 'L\'application est de nouveau connectée aux services réseau.',
        duration: 5000,
      })
    }

    // Écouteur pour l'expiration de session
    const handleSessionExpired = () => {
      addToast({
        type: 'warning',
        title: 'Session expirée',
        message: 'Votre session d\'authentification a expiré. Veuillez vous re-connecter.',
        duration: 6000,
      })
    }

    window.addEventListener('uniflow:network-error', handleNetworkError)
    window.addEventListener('uniflow:session-expired', handleSessionExpired)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('uniflow:network-error', handleNetworkError)
      window.removeEventListener('uniflow:session-expired', handleSessionExpired)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [addToast])

  if (toasts.length === 0) return null

  return <ToastContainer toasts={toasts} onClose={removeToast} />
}

export default GlobalNetworkToast
