import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeStructure } from './structureModel.ts'

const UY1 = 'Université de Yaoundé I'
const base = {
  universities: [{ code: 'UY1', name: UY1 }, { code: 'UD', name: 'Université de Douala' }],
  faculties: [{ code: 'FS', universityCode: 'UY1', name: 'Faculté des Sciences' }, { code: 'FGI', universityCode: 'UD', name: 'Faculté de Génie Industriel' }],
  programs: [
    { code: 'INF', name: 'Informatique', universityCode: 'UY1', facultyCode: 'FS', levels: ['L1', 'L2', 'L3', 'M1'] },
    { code: 'MAT', name: 'Mathématiques', universityCode: 'UY1', facultyCode: 'FS', levels: ['L1', 'L2', 'L3'] },
    { code: 'GIN', name: 'Génie industriel', universityCode: 'UD', facultyCode: 'FGI', levels: ['L1'] },
  ],
  classrooms: [{ code: 'A1' }, { code: 'A2' }],
  courses: [
    { $id: 'c1', university: UY1, program: 'INF', level: 'L1' },
    { $id: 'c2', university: UY1, program: 'INF', level: 'L2' },
    { $id: 'c3', university: UY1, program: 'MAT', level: 'L1' },
    { $id: 'c4', university: 'Université de Douala', program: 'GIN', level: 'L1' },
  ],
  schedules: [
    { $id: 's1', university: UY1, program: 'INF', level: 'L1' },
    { $id: 's2', university: UY1, program: 'MAT', level: 'L1' },
    { $id: 's3', university: 'Université de Douala', program: 'GIN', level: 'L1' },
  ],
}

test('le compte PLATFORM voit toute la base, sans périmètre implicite', () => {
  const summary = summarizeStructure({ ...base, scope: {} })
  assert.equal(summary.headline, '2 universités · 2 facultés · 3 filières · 4 UE · 3 séances')
  assert.deepEqual(summary.levels, ['L1', 'L2', 'L3', 'M1'])
  assert.equal(summary.byProgram.find((p) => p.code === 'INF')?.courseCount, 2)
})

test('une administration ne voit que sa faculté', () => {
  const summary = summarizeStructure({ ...base, universityCode: 'UY1', facultyCode: 'FS', scope: { university: UY1, faculty: 'Faculté des Sciences' } })
  assert.equal(summary.headline, '1 université · 1 faculté · 2 filières · 3 UE · 2 séances')
  assert.deepEqual(summary.byProgram.map((p) => p.code), ['INF', 'MAT'])
})

test('le sélecteur filière/niveau réduit les UE et les séances', () => {
  const summary = summarizeStructure({ ...base, universityCode: 'UY1', facultyCode: 'FS', scope: { university: UY1, program: 'INF', level: 'L2' } })
  assert.equal(summary.courses, 1)
  assert.equal(summary.schedules, 0)
  assert.deepEqual(summary.byProgram.map((p) => p.code), ['INF'])
})
