/**
 * Logique pure du mode hors ligne : libellé du bandeau, fraîcheur des données
 * en cache, file d'attente des écritures. Aucune dépendance navigateur, pour
 * rester testable avec `node --test`.
 */

export type QueuedWriteKind = 'message' | 'attendance'

export interface QueuedWrite<TPayload = unknown> {
  id: string
  kind: QueuedWriteKind
  payload: TPayload
  /** Clé de regroupement : deux écritures de même clé se remplacent (dernier appel gagne). */
  coalesceKey?: string
  createdAt: number
  attempts: number
  lastError?: string
}

const FR_DAY = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const FR_DAY_YEAR = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const FR_TIME = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

/**
 * « 21 sept. à 04:40 » ; l'année n'apparaît que si elle diffère de l'année
 * courante. Date et heure sont formatées séparément : le format combiné
 * d'Intl donne « 21 sept., 04:40 », moins naturel dans une phrase.
 */
export function formatDataDate(timestamp: number, now = Date.now()): string {
  const date = new Date(timestamp)
  const sameYear = date.getFullYear() === new Date(now).getFullYear()
  return `${(sameYear ? FR_DAY : FR_DAY_YEAR).format(date)} à ${FR_TIME.format(date)}`
}

export function offlineBannerTitle(latestDataAt: number | null, now = Date.now()): string {
  return latestDataAt ? `Hors ligne — données du ${formatDataDate(latestDataAt, now)}` : 'Hors ligne'
}

export function offlineBannerDetail(queuedWrites: number): string {
  if (queuedWrites <= 0) return 'Uni affiche ce qu’il a déjà en mémoire ; tout reprendra au retour du réseau.'
  return `${queuedWrites} action${queuedWrites > 1 ? 's' : ''} en attente d’envoi ; ${queuedWrites > 1 ? 'elles partiront' : 'elle partira'} au retour du réseau.`
}

/** Date la plus récente parmi les requêtes qui ont bien des données ; `null` si le cache est vide. */
export function latestDataTimestamp(entries: Array<{ dataUpdatedAt: number; hasData: boolean }>): number | null {
  let latest = 0
  for (const entry of entries) {
    if (entry.hasData && entry.dataUpdatedAt > latest) latest = entry.dataUpdatedAt
  }
  return latest || null
}

/**
 * Ajoute une écriture à la file. Une écriture porteuse d'une `coalesceKey`
 * remplace celle qui porte la même clé : pour un appel de présence, seule la
 * dernière version de la feuille du jour a un sens, pas les cinq intermédiaires.
 */
export function enqueueWrite<TPayload>(queue: QueuedWrite[], write: Omit<QueuedWrite<TPayload>, 'attempts'>): QueuedWrite[] {
  const kept = write.coalesceKey ? queue.filter((item) => item.coalesceKey !== write.coalesceKey) : queue
  return [...kept, { ...write, attempts: 0 }].sort((a, b) => a.createdAt - b.createdAt)
}

export function removeWrite(queue: QueuedWrite[], id: string): QueuedWrite[] {
  return queue.filter((item) => item.id !== id)
}

export function markWriteFailed(queue: QueuedWrite[], id: string, error: string): QueuedWrite[] {
  return queue.map((item) => (item.id === id ? { ...item, attempts: item.attempts + 1, lastError: error } : item))
}

/**
 * Une erreur réseau (fetch échoué, délai, 5xx, 408) mérite un nouvel essai au
 * prochain retour du réseau ; une erreur applicative (401, 403, 400…) signifie
 * que la requête est rejetée et ne passera jamais telle quelle : on l'abandonne
 * et on prévient l'utilisateur plutôt que de la rejouer indéfiniment.
 */
export function isRetryableReplayError(error: { status?: number; message?: string } | null | undefined, online: boolean): boolean {
  if (!online) return true
  const status = error?.status
  if (typeof status === 'number') return status === 0 || status === 408 || status === 429 || status >= 500
  const message = error?.message ?? ''
  return /failed to fetch|networkerror|network request failed|load failed|timeout|timed out|ERR_NETWORK|ECONN/i.test(message)
}

export type ReplayDecision = 'retry-later' | 'drop'

export function replayDecision(error: { status?: number; message?: string } | null | undefined, online: boolean): ReplayDecision {
  return isRetryableReplayError(error, online) ? 'retry-later' : 'drop'
}

export function attendanceCoalesceKey(courseId: string, isoDate: string): string {
  return `attendance:${courseId}:${isoDate.slice(0, 10)}`
}

export function queueSummary(queue: QueuedWrite[]): { total: number; byKind: Record<QueuedWriteKind, number> } {
  const byKind: Record<QueuedWriteKind, number> = { message: 0, attendance: 0 }
  for (const item of queue) byKind[item.kind] += 1
  return { total: queue.length, byKind }
}
