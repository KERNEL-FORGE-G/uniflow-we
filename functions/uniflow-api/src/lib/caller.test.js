import test from 'node:test'
import assert from 'node:assert/strict'
import { actorIdOf, canAssignRole, inCallerUniversity, isAdministrator, labelsForRole, resolveCaller, roleFromLabels } from './caller.js'

const UY1 = 'Université de Yaoundé I'
const UDS = 'Université de Dschang'

const superadmin = { userId: 'kernel', role: 'ADMIN', isSuperAdmin: true, university: UY1 }
const adminUy1 = { userId: 'admin-uy1', role: 'ADMIN', isSuperAdmin: false, university: UY1 }
const adminSansUniversite = { userId: 'admin-x', role: 'ADMIN', isSuperAdmin: false, university: '' }
const teacher = { userId: 'teacher', role: 'TEACHER', isSuperAdmin: false, university: UY1 }
const student = { userId: 'student', role: 'STUDENT', isSuperAdmin: false, university: UY1 }

test('roleFromLabels : les labels sont le nom du rôle tel quel, aucun label = STUDENT', () => {
  assert.equal(roleFromLabels(['ADMIN', 'superadmin']), 'ADMIN')
  assert.equal(roleFromLabels(['ADMIN']), 'ADMIN')
  assert.equal(roleFromLabels(['TEACHER']), 'TEACHER')
  assert.equal(roleFromLabels(['DELEGATE']), 'DELEGATE')
  assert.equal(roleFromLabels([]), 'STUDENT')
  assert.equal(roleFromLabels(undefined), 'STUDENT')
  assert.equal(roleFromLabels(['superadmin']), 'STUDENT', 'superadmin seul ne donne pas de rôle universitaire')
  assert.equal(roleFromLabels(['beta', 'teacher']), 'TEACHER', 'insensible à la casse')
  assert.equal(roleFromLabels(['DELEGATE', 'ADMIN']), 'ADMIN', 'le rôle le plus élevé l’emporte')
})

test('labelsForRole : remplace le label de rôle sans toucher aux autres', () => {
  assert.deepEqual(labelsForRole([], 'TEACHER'), ['TEACHER'])
  assert.deepEqual(labelsForRole(['ADMIN', 'superadmin'], 'TEACHER'), ['superadmin', 'TEACHER'])
  assert.deepEqual(labelsForRole(['TEACHER', 'beta'], 'STUDENT'), ['beta'], 'STUDENT = absence de label de rôle')
  assert.deepEqual(labelsForRole(['DELEGATE'], 'ADMIN'), ['ADMIN'])
  assert.deepEqual(labelsForRole(undefined, 'STUDENT'), [])
})

test('actorIdOf : lit l’en-tête Appwrite et retire le préfixe user:', () => {
  assert.equal(actorIdOf({ headers: { 'x-appwrite-user-id': 'abc' } }), 'abc')
  assert.equal(actorIdOf({ headers: { 'x-appwrite-user': 'user:abc' } }), 'abc')
  assert.equal(actorIdOf({ headers: {} }), '')
  assert.equal(actorIdOf(undefined), '')
})

test('matrice : le superadmin crée et modifie tout rôle, dans toute université', () => {
  for (const role of ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN']) {
    assert.equal(canAssignRole(superadmin, role, UY1).ok, true, role)
    assert.equal(canAssignRole(superadmin, role, UDS).ok, true, `${role} hors UY1`)
    assert.equal(canAssignRole(superadmin, role, UDS, 'ADMIN').ok, true, `${role} sur un ADMIN existant`)
  }
})

test('matrice : une administration crée TEACHER, DELEGATE, STUDENT de son université', () => {
  for (const role of ['STUDENT', 'DELEGATE', 'TEACHER']) {
    assert.equal(canAssignRole(adminUy1, role, UY1).ok, true, role)
  }
})

test('matrice : une administration ne crée ni ne modifie un compte ADMIN', () => {
  const creation = canAssignRole(adminUy1, 'ADMIN', UY1)
  assert.equal(creation.ok, false)
  assert.equal(creation.code, 'SUPERADMIN_REQUIRED')
  const retrogradation = canAssignRole(adminUy1, 'TEACHER', UY1, 'ADMIN')
  assert.equal(retrogradation.ok, false, 'rétrograder un ADMIN reste interdit à une administration')
  assert.equal(retrogradation.code, 'SUPERADMIN_REQUIRED')
})

test('matrice : une administration ne sort pas de son université', () => {
  const result = canAssignRole(adminUy1, 'TEACHER', UDS)
  assert.equal(result.ok, false)
  assert.equal(result.code, 'UNIVERSITY_SCOPE_DENIED')
  assert.equal(canAssignRole(adminSansUniversite, 'TEACHER', UY1).code, 'UNIVERSITY_SCOPE_DENIED', 'université de l’appelant inconnue')
  assert.equal(canAssignRole(adminUy1, 'TEACHER', '').code, 'UNIVERSITY_SCOPE_DENIED', 'université de la cible inconnue')
})

test('matrice : enseignant, étudiant ou anonyme sont refusés', () => {
  assert.equal(canAssignRole(teacher, 'STUDENT', UY1).code, 'ADMIN_REQUIRED')
  assert.equal(canAssignRole(student, 'ADMIN', UY1).code, 'ADMIN_REQUIRED')
  assert.equal(canAssignRole(null, 'STUDENT', UY1).code, 'AUTH_REQUIRED')
})

test('matrice : un rôle inconnu est refusé même au superadmin', () => {
  assert.equal(canAssignRole(superadmin, 'ROOT', UY1).code, 'ROLE_INVALID')
  assert.equal(canAssignRole(superadmin, undefined, UY1).code, 'ROLE_INVALID')
})

test('isAdministrator et inCallerUniversity', () => {
  assert.equal(isAdministrator(superadmin), true)
  assert.equal(isAdministrator(adminUy1), true)
  assert.equal(isAdministrator(teacher), false)
  assert.equal(isAdministrator(null), false)
  assert.equal(inCallerUniversity(superadmin, { university: UDS }), true)
  assert.equal(inCallerUniversity(adminUy1, { university: UDS }), false)
  assert.equal(inCallerUniversity(adminUy1, { university: UY1 }), true)
  assert.equal(inCallerUniversity(adminSansUniversite, { university: UDS }), true, 'sans université connue, pas de restriction')
})

test('resolveCaller : rôle depuis les labels, périmètre depuis le document users', async () => {
  const users = { get: async (id) => ({ $id: id, name: 'Pr. Fouda', email: 'f@uy1.cm', labels: ['TEACHER'] }) }
  const databases = { getDocument: async () => ({ role: 'ADMIN', accountType: 'UNIVERSITY', university: UY1, program: 'ICT4D', level: 'L2' }) }
  const caller = await resolveCaller({ headers: { 'x-appwrite-user-id': 'u1' } }, users, databases)
  assert.equal(caller.userId, 'u1')
  assert.equal(caller.role, 'TEACHER', 'le document users prétend ADMIN : il n’est pas cru')
  assert.equal(caller.isSuperAdmin, false)
  assert.equal(caller.university, UY1)
  assert.equal(caller.program, 'ICT4D')
  assert.equal(caller.level, 'L2')
})

test('resolveCaller : sans document users, l’identité reste valable', async () => {
  const users = { get: async () => ({ labels: ['ADMIN', 'superadmin'] }) }
  const databases = { getDocument: async () => { throw Object.assign(new Error('not found'), { code: 404 }) } }
  const caller = await resolveCaller({ headers: { 'x-appwrite-user-id': 'kernel' } }, users, databases)
  assert.equal(caller.role, 'ADMIN')
  assert.equal(caller.isSuperAdmin, true)
  assert.equal(caller.university, '')
})

test('resolveCaller : aucun en-tête utilisateur → null, sans appel réseau', async () => {
  let called = false
  const users = { get: async () => { called = true; return {} } }
  assert.equal(await resolveCaller({ headers: {} }, users, null), null)
  assert.equal(called, false)
})
