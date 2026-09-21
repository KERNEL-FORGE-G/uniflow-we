import { useSyncExternalStore } from 'react'
import { createStore, get, set } from 'idb-keyval'
import { isOnline } from './networkStatus'
import { enqueueWrite, markWriteFailed, removeWrite, replayDecision, type QueuedWrite, type QueuedWriteKind } from './offlineModel'

/**
 * File d'attente des écritures simples faites hors ligne (messages, feuilles
 * de présence). Persistée dans IndexedDB pour survivre au rechargement, elle
 * est rejouée dans l'ordre au retour du réseau. Chaque type d'écriture
 * enregistre son exécuteur au démarrage (`registerReplayHandler`).
 */

const STORE = createStore('uniflow-offline', 'write-queue')
const QUEUE_KEY = 'pending-writes'

type ReplayHandler = (payload: unknown) => Promise<void>
const handlers = new Map<QueuedWriteKind, ReplayHandler>()
const listeners = new Set<() => void>()
let cachedQueue: QueuedWrite[] = []
let loaded: Promise<void> | null = null
let replaying = false

export interface ReplayReport {
  sent: QueuedWrite[]
  dropped: Array<{ item: QueuedWrite; error: string }>
  remaining: number
}

async function loadQueue(): Promise<QueuedWrite[]> {
  if (!loaded) {
    loaded = (async () => {
      try {
        cachedQueue = (await get<QueuedWrite[]>(QUEUE_KEY, STORE)) ?? []
      } catch {
        cachedQueue = []
      }
      notify()
    })()
  }
  await loaded
  return cachedQueue
}

async function saveQueue(queue: QueuedWrite[]) {
  cachedQueue = queue
  notify()
  try { await set(QUEUE_KEY, queue, STORE) } catch { /* IndexedDB indisponible : la file vit en mémoire le temps de l'onglet */ }
}

function notify() {
  for (const listener of listeners) listener()
}

export function registerReplayHandler<TPayload>(kind: QueuedWriteKind, handler: (payload: TPayload) => Promise<void>) {
  handlers.set(kind, handler as ReplayHandler)
}

export async function enqueueOfflineWrite<TPayload>(kind: QueuedWriteKind, payload: TPayload, coalesceKey?: string): Promise<QueuedWrite<TPayload>> {
  const queue = await loadQueue()
  const item: Omit<QueuedWrite<TPayload>, 'attempts'> = {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    payload,
    coalesceKey,
    createdAt: Date.now(),
  }
  await saveQueue(enqueueWrite(queue, item))
  return { ...item, attempts: 0 }
}

export async function pendingWrites(): Promise<QueuedWrite[]> {
  return [...(await loadQueue())]
}

function errorShape(error: unknown): { status?: number; message?: string } {
  if (error && typeof error === 'object') {
    const candidate = error as { status?: unknown; code?: unknown; message?: unknown }
    const status = typeof candidate.status === 'number' ? candidate.status : typeof candidate.code === 'number' ? candidate.code : undefined
    return { status, message: typeof candidate.message === 'string' ? candidate.message : String(error) }
  }
  return { message: String(error) }
}

/**
 * Rejoue la file dans l'ordre. Une erreur réseau arrête le passage (le reste
 * attend le prochain retour du réseau) ; une erreur applicative abandonne
 * l'élément et le signale, pour ne pas bloquer ceux qui suivent.
 */
export async function replayOfflineWrites(): Promise<ReplayReport> {
  const report: ReplayReport = { sent: [], dropped: [], remaining: 0 }
  if (replaying) { report.remaining = cachedQueue.length; return report }
  replaying = true
  try {
    let queue = await loadQueue()
    for (const item of [...queue]) {
      if (!isOnline()) break
      const handler = handlers.get(item.kind)
      if (!handler) continue
      try {
        await handler(item.payload)
        queue = removeWrite(queue, item.id)
        report.sent.push(item)
        await saveQueue(queue)
      } catch (error) {
        const shape = errorShape(error)
        if (replayDecision(shape, isOnline()) === 'drop') {
          queue = removeWrite(queue, item.id)
          report.dropped.push({ item, error: shape.message ?? 'Erreur inconnue' })
        } else {
          queue = markWriteFailed(queue, item.id, shape.message ?? 'Erreur réseau')
          await saveQueue(queue)
          break
        }
        await saveQueue(queue)
      }
    }
    report.remaining = queue.length
    if (report.sent.length || report.dropped.length) {
      try { window.dispatchEvent(new CustomEvent('uniflow:offline-replay', { detail: report })) } catch { /* hors navigateur */ }
    }
    return report
  } finally {
    replaying = false
  }
}

let started = false
/** À appeler une fois au démarrage : charge la file, rejoue si en ligne, puis à chaque retour du réseau. */
export function startOfflineWriteQueue() {
  if (started || typeof window === 'undefined') return
  started = true
  void loadQueue().then(() => { if (isOnline()) void replayOfflineWrites() })
  window.addEventListener('online', () => { void replayOfflineWrites() })
}

function subscribeCount(listener: () => void) {
  listeners.add(listener)
  void loadQueue()
  return () => { listeners.delete(listener) }
}

export function usePendingWriteCount(): number {
  return useSyncExternalStore(subscribeCount, () => cachedQueue.length, () => 0)
}
