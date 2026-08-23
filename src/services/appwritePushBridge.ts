import { ID } from 'appwrite'
import { appwriteAccount } from '../lib/appwrite'

export type AppwritePushRegistration = {
  state: 'registered' | 'not-configured' | 'unavailable'
  message: string
}

const targetStorageKey = 'uniflow_appwrite_push_target_id'

function configured() {
  return Boolean(
    import.meta.env.VITE_APPWRITE_PUSH_PROVIDER_ID &&
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID &&
    import.meta.env.VITE_FIREBASE_VAPID_KEY,
  )
}

export async function registerAppwritePushTarget(registration?: ServiceWorkerRegistration | null): Promise<AppwritePushRegistration> {
  if (!configured()) {
    return {
      state: 'not-configured',
      message: 'Canal Appwrite distant non configuré : un fournisseur FCM et les paramètres web publics sont requis.',
    }
  }

  try {
    const [{ getApps, initializeApp }, { getMessaging, getToken }] = await Promise.all([
      import('firebase/app'),
      import('firebase/messaging'),
    ])
    const app = getApps()[0] || initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    })
    const messaging = getMessaging(app)
    const serviceWorkerRegistration = registration || await navigator.serviceWorker.ready
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration,
    })
    if (!token) return { state: 'unavailable', message: 'Le navigateur n’a pas fourni de jeton de notification FCM.' }

    const providerId = String(import.meta.env.VITE_APPWRITE_PUSH_PROVIDER_ID)
    const storedTarget = localStorage.getItem(targetStorageKey)
    const targetId = storedTarget || ID.unique()
    try {
      await appwriteAccount.createPushTarget(targetId, token, providerId)
    } catch {
      await appwriteAccount.updatePushTarget(targetId, token)
    }
    localStorage.setItem(targetStorageKey, targetId)
    return { state: 'registered', message: 'Appareil enregistré comme cible push Appwrite.' }
  } catch {
    return { state: 'unavailable', message: 'Impossible d’enregistrer cet appareil auprès du fournisseur push Appwrite.' }
  }
}
