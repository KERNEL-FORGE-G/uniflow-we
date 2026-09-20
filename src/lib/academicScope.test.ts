import test from 'node:test'
import assert from 'node:assert/strict'
import { filterByScope, isPlatformAccount, matchesScope, mergeScope, scopeEqualities, scopeLabel, scopeOf, teacherMatches } from './academicScope.ts'

const UY1 = 'Université de Yaoundé I'
const docs = [
  { $id: '1', university: UY1, program: 'ICT4D', level: 'L1' },
  { $id: '2', university: UY1, program: 'INF', level: 'L2' },
  { $id: '3', university: UY1, program: 'MAT', level: 'M1' },
  { $id: '4', university: 'Université de Douala', program: 'INF', level: 'L2' },
]

test('le compte PLATFORM et le superadmin n’ont aucun périmètre implicite', () => {
  assert.deepEqual(scopeOf({ accountType: 'PLATFORM', role: 'ADMIN' }), {})
  assert.deepEqual(scopeOf({ accountType: 'UNIVERSITY', role: 'ADMIN', isSuperAdmin: true, university: UY1 }), {})
  assert.equal(isPlatformAccount({ accountType: 'PLATFORM' }), true)
  assert.equal(filterByScope(docs, scopeOf({ accountType: 'PLATFORM' })).length, 4)
})

test('une administration voit toute sa faculté, sans filière ni niveau implicites', () => {
  const scope = scopeOf({ accountType: 'UNIVERSITY', role: 'ADMIN', university: UY1, faculty: 'Faculté des Sciences', program: '', level: '' })
  assert.deepEqual(scope, { university: UY1, faculty: 'Faculté des Sciences' })
  assert.deepEqual(filterByScope(docs, scope).map((d) => d.$id), ['1', '2', '3'])
})

test('un étudiant est limité à sa filière et son niveau (niveau insensible à la casse)', () => {
  const scope = scopeOf({ accountType: 'UNIVERSITY', role: 'STUDENT', university: UY1, program: 'INF', level: 'l2' })
  assert.deepEqual(scope, { university: UY1, program: 'INF', level: 'L2' })
  assert.deepEqual(filterByScope(docs, scope).map((d) => d.$id), ['2'])
  assert.equal(matchesScope({ university: UY1, program: 'INF', level: 'L2' }, scope), true)
})

test('un enseignant n’est borné que par son université', () => {
  assert.deepEqual(scopeOf({ accountType: 'UNIVERSITY', role: 'TEACHER', university: UY1, program: 'ICT4D', level: 'L1' }), { university: UY1 })
})

test('le sélecteur admin complète le périmètre et alimente les requêtes', () => {
  const merged = mergeScope({ university: UY1 }, { program: 'MAT', level: 'm1' })
  assert.deepEqual(merged, { university: UY1, program: 'MAT', level: 'M1' })
  assert.deepEqual(scopeEqualities(merged), [{ field: 'program', value: 'MAT' }, { field: 'level', value: 'M1' }])
  assert.deepEqual(scopeEqualities({ university: UY1 }), [])
  assert.deepEqual(filterByScope(docs, merged).map((d) => d.$id), ['3'])
})

test('libellés de périmètre lisibles, jamais ICT4D par défaut', () => {
  assert.equal(scopeLabel({}), 'Tout le périmètre')
  assert.equal(scopeLabel({ university: UY1, faculty: 'Faculté des Sciences' }), 'Faculté des Sciences')
  assert.equal(scopeLabel({ program: 'INF', level: 'L2' }), 'INF · L2')
  assert.equal(scopeLabel({ level: 'L1' }), 'Toutes les filières · L1')
})

test('rattachement d’un enseignant par son nom', () => {
  assert.equal(teacherMatches('Dr. Amina NGUEMA', 'Amina Nguema'), true)
  assert.equal(teacherMatches('Pr. Paul ESSOMBA', 'Amina Nguema'), false)
  assert.equal(teacherMatches('', 'Amina Nguema'), false)
})
