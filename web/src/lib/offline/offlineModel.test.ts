import test from 'node:test'
import assert from 'node:assert/strict'
import {
  attendanceCoalesceKey,
  enqueueWrite,
  formatDataDate,
  isRetryableReplayError,
  latestDataTimestamp,
  markWriteFailed,
  offlineBannerDetail,
  offlineBannerTitle,
  queueSummary,
  removeWrite,
  replayDecision,
  type QueuedWrite,
} from './offlineModel.ts'

const now = new Date(2026, 8, 21, 10, 0).getTime()

test('le bandeau porte la date des données en cache, sans année quand c’est la même', () => {
  const cachedAt = new Date(2026, 8, 20, 18, 5).getTime()
  assert.equal(offlineBannerTitle(cachedAt, now), `Hors ligne — données du ${formatDataDate(cachedAt, now)}`)
  assert.equal(formatDataDate(cachedAt, now), '20 sept. à 18:05')
  assert.match(formatDataDate(new Date(2025, 8, 20, 18, 5).getTime(), now), /2025/)
  assert.equal(offlineBannerTitle(null, now), 'Hors ligne')
})

test('le détail du bandeau annonce les écritures en attente', () => {
  assert.match(offlineBannerDetail(0), /déjà en mémoire/)
  assert.equal(offlineBannerDetail(1), '1 action en attente d’envoi ; elle partira au retour du réseau.')
  assert.equal(offlineBannerDetail(3), '3 actions en attente d’envoi ; elles partiront au retour du réseau.')
})

test('la date des données est la plus récente parmi les requêtes qui en ont', () => {
  assert.equal(latestDataTimestamp([]), null)
  assert.equal(latestDataTimestamp([{ dataUpdatedAt: 50, hasData: false }]), null)
  assert.equal(latestDataTimestamp([{ dataUpdatedAt: 50, hasData: true }, { dataUpdatedAt: 900, hasData: false }, { dataUpdatedAt: 120, hasData: true }]), 120)
})

test('une écriture avec clé de regroupement remplace la précédente, les autres s’empilent dans l’ordre', () => {
  let queue: QueuedWrite[] = []
  queue = enqueueWrite(queue, { id: 'a', kind: 'attendance', payload: { v: 1 }, coalesceKey: attendanceCoalesceKey('c1', '2026-09-21T08:00:00.000Z'), createdAt: 1 })
  queue = enqueueWrite(queue, { id: 'm1', kind: 'message', payload: { text: 'salut' }, createdAt: 2 })
  queue = enqueueWrite(queue, { id: 'b', kind: 'attendance', payload: { v: 2 }, coalesceKey: attendanceCoalesceKey('c1', '2026-09-21T15:00:00.000Z'), createdAt: 3 })
  queue = enqueueWrite(queue, { id: 'm2', kind: 'message', payload: { text: 're' }, createdAt: 4 })

  assert.deepEqual(queue.map((item) => item.id), ['m1', 'b', 'm2'])
  assert.deepEqual(queue.find((item) => item.id === 'b')?.payload, { v: 2 })
  assert.deepEqual(queueSummary(queue), { total: 3, byKind: { message: 2, attendance: 1 } })
})

test('la clé de regroupement des présences ne garde que le jour', () => {
  assert.equal(attendanceCoalesceKey('c1', '2026-09-21T08:00:00.000Z'), 'attendance:c1:2026-09-21')
})

test('un échec incrémente le compteur et garde le message ; la suppression retire l’élément', () => {
  const queue = enqueueWrite([], { id: 'm1', kind: 'message', payload: {}, createdAt: 1 })
  const failed = markWriteFailed(queue, 'm1', 'Failed to fetch')
  assert.equal(failed[0].attempts, 1)
  assert.equal(failed[0].lastError, 'Failed to fetch')
  assert.deepEqual(removeWrite(failed, 'm1'), [])
})

test('seules les erreurs réseau sont rejouées ; une erreur applicative abandonne l’écriture', () => {
  assert.equal(isRetryableReplayError({ message: 'Failed to fetch' }, true), true)
  assert.equal(isRetryableReplayError({ status: 503 }, true), true)
  assert.equal(isRetryableReplayError({ status: 408 }, true), true)
  assert.equal(isRetryableReplayError({ status: 401, message: 'Unauthorized' }, true), false)
  assert.equal(isRetryableReplayError({ status: 400 }, true), false)
  // Hors ligne, même une erreur inconnue est mise de côté : rien ne peut aboutir.
  assert.equal(isRetryableReplayError({ status: 400 }, false), true)
  assert.equal(replayDecision({ status: 403 }, true), 'drop')
  assert.equal(replayDecision({ message: 'NetworkError when attempting to fetch resource.' }, true), 'retry-later')
})
