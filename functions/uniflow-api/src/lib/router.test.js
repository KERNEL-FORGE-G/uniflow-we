import test from 'node:test'
import assert from 'node:assert/strict'
import { SERVICE_PATHS, resolveServicePath } from './router.js'

test('resolveServicePath normalise casse, barre initiale et barres finales', () => {
  assert.equal(resolveServicePath('/messaging'), '/messaging')
  assert.equal(resolveServicePath('messaging'), '/messaging')
  assert.equal(resolveServicePath('/Messaging/'), '/messaging')
  assert.equal(resolveServicePath('  /team-roster//  '), '/team-roster')
  assert.equal(resolveServicePath(''), '/')
  assert.equal(resolveServicePath(undefined), '/')
})

test('les neuf services documentés sont des chemins déjà normalisés', () => {
  assert.equal(SERVICE_PATHS.length, 9)
  for (const path of SERVICE_PATHS) assert.equal(resolveServicePath(path), path)
})
