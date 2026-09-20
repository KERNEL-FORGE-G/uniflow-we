import test from 'node:test'
import assert from 'node:assert/strict'
import { assignableRoles, canAccessWorkspace, canAssignRole, canManageAccounts, isSuperAdmin, resolveRole, roleFromLabels } from './roles.ts'

const UY1 = 'Université de Yaoundé I'

test('roleFromLabels : labels nus, casse indifférente, plus élevé gagnant', () => {
  assert.equal(roleFromLabels(['ADMIN', 'superadmin']), 'ADMIN')
  assert.equal(roleFromLabels(['teacher']), 'TEACHER')
  assert.equal(roleFromLabels(['DELEGATE', 'TEACHER']), 'TEACHER')
  assert.equal(roleFromLabels([]), null)
  assert.equal(roleFromLabels(['superadmin']), null)
  assert.equal(roleFromLabels(undefined), null)
})

test('resolveRole : les labels lisibles priment toujours sur le miroir', () => {
  assert.equal(resolveRole(['TEACHER'], 'ADMIN'), 'TEACHER')
  assert.equal(resolveRole([], 'ADMIN'), 'STUDENT', 'document bricolé sans label : STUDENT')
  assert.equal(resolveRole(undefined, 'ADMIN'), 'ADMIN', 'hors ligne : le miroir sert de repli')
  assert.equal(resolveRole(undefined, 'ROOT'), 'STUDENT')
  assert.equal(resolveRole(null, null), 'STUDENT')
})

test('isSuperAdmin', () => {
  assert.equal(isSuperAdmin(['ADMIN', 'superadmin']), true)
  assert.equal(isSuperAdmin(['ADMIN']), false)
  assert.equal(isSuperAdmin(undefined), false)
})

test('assignableRoles : superadmin tout, administration sans ADMIN, autres rien', () => {
  assert.deepEqual(assignableRoles({ role: 'ADMIN', isSuperAdmin: true }), ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN'])
  assert.deepEqual(assignableRoles({ role: 'ADMIN', isSuperAdmin: false, university: UY1 }), ['STUDENT', 'DELEGATE', 'TEACHER'])
  assert.deepEqual(assignableRoles({ role: 'TEACHER', isSuperAdmin: false }), [])
  assert.deepEqual(assignableRoles(null), [])
})

test('canAssignRole : miroir de la matrice serveur', () => {
  const admin = { role: 'ADMIN' as const, isSuperAdmin: false, university: UY1 }
  assert.equal(canAssignRole(admin, 'TEACHER', UY1), true)
  assert.equal(canAssignRole(admin, 'ADMIN', UY1), false)
  assert.equal(canAssignRole(admin, 'TEACHER', UY1, 'ADMIN'), false)
  assert.equal(canAssignRole(admin, 'TEACHER', 'Université de Dschang'), false)
  assert.equal(canAssignRole({ role: 'ADMIN', isSuperAdmin: true }, 'ADMIN', 'Université de Dschang', 'ADMIN'), true)
  assert.equal(canAssignRole({ role: 'STUDENT', isSuperAdmin: false, university: UY1 }, 'STUDENT', UY1), false)
})

test('canManageAccounts et espaces de travail', () => {
  assert.equal(canManageAccounts({ role: 'ADMIN', isSuperAdmin: false }), true)
  assert.equal(canManageAccounts({ role: 'TEACHER', isSuperAdmin: false }), false)
  assert.equal(canAccessWorkspace('UNIVERSITY', 'university'), true)
  assert.equal(canAccessWorkspace('UNIVERSITY', 'personal'), false)
  assert.equal(canAccessWorkspace('PERSONAL', 'personal'), true)
  assert.equal(canAccessWorkspace('PERSONAL', 'university'), false)
  assert.equal(canAccessWorkspace(undefined, 'university'), true, 'type inconnu : universitaire par défaut')
})
