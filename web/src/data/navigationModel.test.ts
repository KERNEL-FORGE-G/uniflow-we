import test from 'node:test'
import assert from 'node:assert/strict'
import { isNavEntryVisible, visibleNavEntries, type NavEntry } from './navigationModel.ts'

const entries: NavEntry[] = [
  { to: '/app', labelFr: 'Tableau de bord', labelEn: 'Dashboard', roles: ['student', 'delegate', 'teacher'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/presences', labelFr: 'Présences', labelEn: 'Attendance', roles: ['student', 'delegate'] },
  { to: '/app/gestion-presences', labelFr: 'Gérer', labelEn: 'Manage', roles: ['delegate', 'teacher'] },
  { to: '/app/parametres', labelFr: 'Paramètres', labelEn: 'Settings', roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
]

test('un étudiant universitaire voit le tableau de bord et les présences, pas la gestion', () => {
  assert.deepEqual(visibleNavEntries(entries, 'student', 'UNIVERSITY').map((entry) => entry.to), ['/app', '/app/presences', '/app/parametres'])
})

test('un compte indépendant ne voit aucun écran universitaire', () => {
  assert.deepEqual(visibleNavEntries(entries, 'student', 'PERSONAL').map((entry) => entry.to), ['/app', '/app/parametres'])
})

test('délégué : gestion des présences visible ; enseignant : présences personnelles masquées', () => {
  assert.equal(isNavEntryVisible(entries[2], 'delegate', 'UNIVERSITY'), true)
  assert.equal(isNavEntryVisible(entries[1], 'teacher', 'UNIVERSITY'), false)
})

test('une entrée sans `accounts` est universitaire par défaut', () => {
  assert.equal(isNavEntryVisible({ to: '/x', labelFr: 'x', labelEn: 'x' }, 'student', 'UNIVERSITY'), true)
  assert.equal(isNavEntryVisible({ to: '/x', labelFr: 'x', labelEn: 'x' }, 'student', 'PERSONAL'), false)
})
