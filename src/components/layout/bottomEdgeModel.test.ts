import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BOTTOM_EDGE_KINDS,
  CORNER_ZONE_ORDER,
  cornerZoneOrder,
  edgeHidesLauncher,
  launcherVisible,
  resolveBottomEdge,
  type BottomEdgeKind,
} from './bottomEdgeModel.ts'

test('resolveBottomEdge : sans déclaration le coin est libre', () => {
  assert.equal(resolveBottomEdge([]), 'free')
  assert.equal(resolveBottomEdge(['free']), 'free')
  assert.equal(resolveBottomEdge(['free', 'free']), 'free')
})

test('resolveBottomEdge : une seule déclaration l’emporte sur le défaut', () => {
  assert.equal(resolveBottomEdge(['composer']), 'composer')
  assert.equal(resolveBottomEdge(['fullscreen']), 'fullscreen')
  assert.equal(resolveBottomEdge(['free', 'composer']), 'composer')
})

test('resolveBottomEdge : la plus contraignante gagne, quel que soit l’ordre', () => {
  assert.equal(resolveBottomEdge(['composer', 'fullscreen']), 'fullscreen')
  assert.equal(resolveBottomEdge(['fullscreen', 'composer']), 'fullscreen')
  assert.equal(resolveBottomEdge(['free', 'fullscreen', 'composer', 'free']), 'fullscreen')
  // Un Map.values() (ce que le fournisseur passe réellement) est accepté.
  assert.equal(resolveBottomEdge(new Map([['a', 'composer'], ['b', 'free']] as const).values()), 'composer')
})

test('la pile masque le lanceur pour composer et fullscreen, le garde sinon', () => {
  assert.equal(launcherVisible('free', false), true, 'coin libre, panneau fermé : lanceur visible')
  assert.equal(launcherVisible('composer', false), false, 'composeur en bas : le lanceur recouvrirait Envoyer')
  assert.equal(launcherVisible('fullscreen', false), false, 'grille plein écran : rien dans le coin')
})

test('un panneau déjà ouvert reste ouvert même sur une page à composeur', () => {
  assert.equal(launcherVisible('composer', true), true)
  assert.equal(launcherVisible('fullscreen', true), true)
  assert.equal(launcherVisible('free', true), true)
})

test('edgeHidesLauncher couvre exactement les genres autres que free', () => {
  const hidden = BOTTOM_EDGE_KINDS.filter((kind: BottomEdgeKind) => edgeHidesLauncher(kind))
  assert.deepEqual(hidden, ['composer', 'fullscreen'])
})

test('ordre des zones : les bandeaux au-dessus, le lanceur tout en bas', () => {
  assert.ok(cornerZoneOrder('notices') < cornerZoneOrder('launcher'))
  assert.deepEqual(Object.keys(CORNER_ZONE_ORDER).sort(), ['launcher', 'notices'])
})
