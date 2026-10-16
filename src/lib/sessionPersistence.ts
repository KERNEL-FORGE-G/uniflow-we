import type { UniFlowUser } from './appwrite'

const DATABASE_NAME = 'uniflow-auth'
const STORE_NAME = 'session'
const SESSION_KEY = 'current'
const PERSONAL_CACHE_PREFIX = 'uniflow:personal-cache:'

export type PersistedUser = Omit<UniFlowUser, 'email'>

export type PersistedSession = {
  user: PersistedUser
  persistedAt: number
}

function databaseAvailable() {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

function clearPersonalCaches() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PERSONAL_CACHE_PREFIX)) localStorage.removeItem(key)
    }
  } catch {
    // Le nettoyage des caches ne doit jamais empêcher la fermeture de session.
  }
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!databaseAvailable()) return Promise.resolve(null)

  return new Promise((resolve) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
  })
}

async function runTransaction<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  const database = await openDatabase()
  if (!database) return null

  return new Promise((resolve) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = callback(transaction.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => resolve(null)
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => database.close()
  })
}

/**
 * Conserve uniquement un instantané de profil non sensible. Les cookies/session
 * Appwrite restent la seule preuve d’authentification et sont validés au démarrage.
 */
export async function persistSessionSnapshot(user: UniFlowUser) {
  const { email: _email, ...nonSensitiveUser } = user
  await runTransaction('readwrite', (store) => store.put({ user: nonSensitiveUser, persistedAt: Date.now() } satisfies PersistedSession, SESSION_KEY))
}

export async function readSessionSnapshot(): Promise<PersistedSession | null> {
  const snapshot = await runTransaction<PersistedSession & { user?: UniFlowUser }>('readonly', (store) => store.get(SESSION_KEY))
  if (!snapshot?.user) return null
  const { email: _email, ...nonSensitiveUser } = snapshot.user
  const sanitized = { user: nonSensitiveUser, persistedAt: snapshot.persistedAt } satisfies PersistedSession
  if ('email' in snapshot.user) await runTransaction('readwrite', (store) => store.put(sanitized, SESSION_KEY))
  return sanitized
}

export async function clearSessionSnapshot() {
  await runTransaction('readwrite', (store) => store.delete(SESSION_KEY))
  clearPersonalCaches()
}
