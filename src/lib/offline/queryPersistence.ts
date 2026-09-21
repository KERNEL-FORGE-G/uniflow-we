import { QueryClient } from '@tanstack/react-query'
import { persistQueryClientRestore, persistQueryClientSubscribe, type PersistedClient, type Persister } from '@tanstack/query-persist-client-core'
import { createStore, del, get, set } from 'idb-keyval'

/**
 * Cache react-query persistant dans IndexedDB. Sans lui, un rechargement hors
 * ligne affichait des pages vides alors que les données venaient d'être vues :
 * la mémoire du QueryClient ne survit pas à l'onglet.
 */

const STORE = createStore('uniflow-offline', 'query-cache')
const CLIENT_KEY = 'react-query-client'
/** À incrémenter quand la forme des données mises en cache change de façon incompatible. */
export const PERSIST_BUSTER = 'uniflow-query-cache-v1'
/** Une semaine : au-delà, les données ont plus de chances d'induire en erreur que d'aider. */
export const PERSIST_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
/** Attente maximale de la restauration avant de rendre l'application quand même. */
const RESTORE_TIMEOUT_MS = 1_500

export function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try { await set(CLIENT_KEY, client, STORE) } catch { /* quota plein ou IndexedDB privé : le cache mémoire suffit */ }
    },
    restoreClient: async () => {
      try { return await get<PersistedClient>(CLIENT_KEY, STORE) } catch { return undefined }
    },
    removeClient: async () => {
      try { await del(CLIENT_KEY, STORE) } catch { /* rien à supprimer */ }
    },
  }
}

export const queryPersister = createIdbPersister()

export function createOfflineQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
        // Le cache doit survivre à la navigation pour être persisté : avec les
        // 5 minutes par défaut, une page quittée disparaissait d'IndexedDB.
        gcTime: PERSIST_MAX_AGE_MS,
        // Hors ligne, la requête part quand même une fois (elle échoue vite)
        // puis les données en cache restent affichées au lieu d'un chargement infini.
        networkMode: 'offlineFirst',
      },
      mutations: { networkMode: 'offlineFirst' },
    },
  })
}

const persistOptions = {
  persister: queryPersister,
  maxAge: PERSIST_MAX_AGE_MS,
  buster: PERSIST_BUSTER,
  dehydrateOptions: {
    // Seules les lectures réussies sont conservées ; une requête marquée
    // `meta.persist: false` (clés éphémères de `useApi` sans clé) ne l'est jamais.
    shouldDehydrateQuery: (query: { state: { status: string }; meta?: Record<string, unknown> }) => query.state.status === 'success' && query.meta?.persist !== false,
  },
}

/** Restaure le cache avant le premier rendu, avec un délai de garde pour ne jamais bloquer l'application. */
export async function restorePersistedQueries(queryClient: QueryClient): Promise<void> {
  await Promise.race([
    persistQueryClientRestore({ queryClient, ...persistOptions }).catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, RESTORE_TIMEOUT_MS)),
  ])
}

export function subscribePersistedQueries(queryClient: QueryClient): () => void {
  return persistQueryClientSubscribe({ queryClient, ...persistOptions })
}

/** À la déconnexion : le cache d'un compte ne doit pas réapparaître pour le suivant sur le même navigateur. */
export async function clearPersistedQueries(queryClient: QueryClient): Promise<void> {
  queryClient.clear()
  await queryPersister.removeClient()
}
