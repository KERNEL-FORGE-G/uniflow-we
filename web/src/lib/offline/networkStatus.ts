import { useSyncExternalStore } from 'react'

/**
 * Statut réseau partagé. `navigator.onLine` est la seule source : un échec
 * Appwrite isolé n'est pas « hors ligne » et ne doit pas afficher le bandeau.
 */

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, isOnline, () => true)
}
