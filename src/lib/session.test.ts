import test from 'node:test'
import assert from 'node:assert/strict'
import { LOCAL_SESSION_KEYS, logoutNavigationState, terminateSession } from './session.ts'

function harness(overrides: Partial<Parameters<typeof terminateSession>[0]> = {}) {
  const calls: string[] = []
  const removed: string[] = []
  const deps = {
    deleteRemoteSession: async () => { calls.push('remote') },
    clearSnapshot: async () => { calls.push('snapshot') },
    unsubscribeRealtime: () => { calls.push('realtime') },
    clearQueryCache: () => { calls.push('queries') },
    storage: { removeItem: (key: string) => { removed.push(key) } },
    announce: (reason: string) => { calls.push(`announce:${reason}`) },
    ...overrides,
  }
  return { deps, calls, removed }
}

test('déconnexion : session distante, realtime, stockage, instantané, caches, annonce', async () => {
  const { deps, calls, removed } = harness()
  const result = await terminateSession(deps)
  assert.equal(result.remoteDeleted, true)
  assert.deepEqual(calls, ['remote', 'realtime', 'snapshot', 'queries', 'announce:user'])
  assert.deepEqual(removed, [...LOCAL_SESSION_KEYS])
})

test('une session déjà expirée côté serveur n’empêche pas le nettoyage local', async () => {
  const { deps, calls } = harness({ deleteRemoteSession: async () => { throw new Error('user_session_not_found') } })
  const result = await terminateSession(deps, 'idle_timeout')
  assert.equal(result.remoteDeleted, false)
  assert.ok(calls.includes('snapshot') && calls.includes('queries'))
  assert.ok(calls.includes('announce:idle_timeout'))
})

test('l’état de navigation porte un message lisible', () => {
  assert.deepEqual(logoutNavigationState('user'), { reason: 'user', notice: 'Vous êtes déconnecté.' })
  assert.match(logoutNavigationState('account_deleted').notice, /supprimé/)
})
