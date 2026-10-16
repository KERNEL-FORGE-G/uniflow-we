import test from 'node:test'
import assert from 'node:assert/strict'
import { ARCHLORD_SPEAKING_POSE, DEFAULT_IDLE, UNI_SPEAKING_POSE, nextLineIndex, posesFor, shouldAutoAdvance } from './dialogueModel.ts'

test('nextLineIndex avance puis boucle au début quand loop est vrai', () => {
  assert.equal(nextLineIndex(0, 3, true), 1)
  assert.equal(nextLineIndex(1, 3, true), 2)
  assert.equal(nextLineIndex(2, 3, true), 0)
})

test('nextLineIndex reste sur la dernière réplique sans boucle et ne sort jamais de la liste', () => {
  assert.equal(nextLineIndex(2, 3, false), 2)
  assert.equal(nextLineIndex(7, 3, false), 2)
  assert.equal(nextLineIndex(0, 0, true), 0)
})

test('posesFor : celui qui parle prend sa pose de parole, l’autre sa pose d’écoute', () => {
  assert.deepEqual(posesFor({ who: 'archlord' }), { archlord: ARCHLORD_SPEAKING_POSE, uni: DEFAULT_IDLE.uni })
  assert.deepEqual(posesFor({ who: 'uni' }), { archlord: DEFAULT_IDLE.archlord, uni: UNI_SPEAKING_POSE })
})

test('posesFor : une pose explicite ou une pose d’écoute personnalisée l’emportent', () => {
  assert.deepEqual(posesFor({ who: 'archlord', archlordPose: 'laptop', uniPose: 'sleeping' }), { archlord: 'laptop', uni: 'sleeping' })
  assert.deepEqual(posesFor({ who: 'uni' }, { archlord: 'thinking', uni: 'graduate' }), { archlord: 'thinking', uni: UNI_SPEAKING_POSE })
})

test('shouldAutoAdvance : pas de minuteur si une seule réplique, mouvement réduit, survol ou fin sans boucle', () => {
  const base = { autoplay: true, reduced: false, paused: false, total: 3, loop: true, index: 0 }
  assert.equal(shouldAutoAdvance(base), true)
  assert.equal(shouldAutoAdvance({ ...base, total: 1 }), false)
  assert.equal(shouldAutoAdvance({ ...base, reduced: true }), false)
  assert.equal(shouldAutoAdvance({ ...base, paused: true }), false)
  assert.equal(shouldAutoAdvance({ ...base, autoplay: false }), false)
  assert.equal(shouldAutoAdvance({ ...base, loop: false, index: 2 }), false)
  assert.equal(shouldAutoAdvance({ ...base, loop: false, index: 1 }), true)
})
