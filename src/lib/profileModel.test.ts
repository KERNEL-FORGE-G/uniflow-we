import test from 'node:test'
import assert from 'node:assert/strict'
import { attendanceByCourse, gradesByCourse, learnerAttendanceSummary, overallAverage } from './profileModel.ts'

const records = [
  { courseId: 'c1', status: 'PRESENT' },
  { courseId: 'c1', status: 'RETARD' },
  { courseId: 'c1', status: 'ABSENT' },
  { courseId: 'c2', status: 'PRESENT' },
  { courseId: 'c2', status: 'JUSTIFIE' },
  { courseId: '', status: 'ABSENT' },
]

test('learnerAttendanceSummary compte présents + retards, taux hors justifiés', () => {
  assert.deepEqual(learnerAttendanceSummary(records), { sessions: 6, present: 3, rate: 60 })
  assert.deepEqual(learnerAttendanceSummary([]), { sessions: 0, present: 0, rate: null })
})

test('attendanceByCourse trie du plus faible au plus fort et nomme les cours', () => {
  const rows = attendanceByCourse(records, new Map([['c1', 'Algorithmique'], ['c2', 'Réseaux']]))
  assert.deepEqual(rows.map((row) => [row.name, row.counted, row.rate]), [
    ['Autres séances', 1, 0],
    ['Algorithmique', 3, 67],
    ['Réseaux', 1, 100],
  ])
})

test('gradesByCourse pondère par coefficient et ramène sur 20', () => {
  const grades = [
    { code: 'ICT102', ue: 'ICT4D L1', grade: 12, maxScore: 20, coef: 3 },
    { code: 'ICT102', ue: 'ICT4D L1', grade: 16, maxScore: 20, coef: 7 },
    { code: 'ICT101', grade: 7, maxScore: 10 },
  ]
  const rows = gradesByCourse(grades, new Map([['ICT102', 'Algorithmique']]))
  assert.deepEqual(rows, [
    { code: 'ICT101', label: 'ICT101', count: 1, average: 14 },
    { code: 'ICT102', label: 'Algorithmique', count: 2, average: 14.8 },
  ])
  // Sans nom de cours connu, on retombe sur `ue` puis sur le code
  assert.equal(gradesByCourse(grades)[1].label, 'ICT4D L1')
  assert.equal(overallAverage(rows), 14.4)
  assert.equal(overallAverage([]), null)
})
