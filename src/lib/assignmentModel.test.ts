import test from 'node:test'
import assert from 'node:assert/strict'
import { attendanceRate, formatSubmissionGrade, isPublishedStatement, learnerStatus, matchesAudience, parseAudience } from './assignmentModel.ts'

test('parseAudience lit le JSON stocké et tolère un texte invalide', () => {
  assert.deepEqual(parseAudience('{"filieres":["ICT4D"],"niveaux":["L1"]}'), { filieres: ['ICT4D'], niveaux: ['L1'] })
  assert.equal(parseAudience(''), null)
  assert.equal(parseAudience('pas du json'), null)
  assert.equal(parseAudience('[1,2]')?.filieres, undefined)
})

test('matchesAudience : sans audience tout le cours est visé, sinon filière ET niveau', () => {
  const learner = { program: 'ICT4D', level: 'L1' }
  assert.equal(matchesAudience('', learner), true)
  assert.equal(matchesAudience('{"filieres":["ICT4D"],"niveaux":["L1"]}', learner), true)
  assert.equal(matchesAudience('{"filieres":["ict4d"],"niveaux":["l1"]}', learner), true)
  assert.equal(matchesAudience('{"filieres":["ICT4D"],"niveaux":["L2"]}', learner), false)
  assert.equal(matchesAudience('{"filieres":["INF"],"niveaux":["L1"]}', learner), false)
  assert.equal(matchesAudience('{"filieres":[],"niveaux":["L1"]}', learner), true)
  assert.equal(matchesAudience('{"filieres":["ICT4D"]}', { program: 'ICT4D', level: null }), true)
})

test('isPublishedStatement distingue l’énoncé publié du devoir par étudiant', () => {
  assert.equal(isPublishedStatement({ studentId: '', teacherId: 'uy1-teacher-01', status: 'PUBLISHED' }), true)
  assert.equal(isPublishedStatement({ studentId: '', teacherId: '', status: 'PUBLISHED' }), true)
  assert.equal(isPublishedStatement({ studentId: 'uy1-student-l1', teacherId: '', status: 'À rendre' }), false)
  assert.equal(isPublishedStatement({ studentId: '', teacherId: '', status: 'À rendre' }), false)
})

test('learnerStatus suit le rendu puis l’échéance', () => {
  const now = new Date('2026-09-21T12:00:00Z')
  assert.equal(learnerStatus(null, '2026-09-25T00:00:00Z', now), 'À rendre')
  assert.equal(learnerStatus(null, '2026-09-20T00:00:00Z', now), 'En retard')
  assert.equal(learnerStatus({ status: 'SUBMITTED', submittedAt: '2026-09-19T10:00:00Z' }, '2026-09-20T00:00:00Z', now), 'Soumis')
  assert.equal(learnerStatus({ status: 'GRADED', score: 15 }, '2026-09-25T00:00:00Z', now), 'Noté')
  assert.equal(learnerStatus({ status: 'SUBMITTED', score: 12 }, '2026-09-25T00:00:00Z', now), 'Noté')
  assert.equal(learnerStatus(null, 'pas une date', now), 'À rendre')
})

test('formatSubmissionGrade affiche la note sur le barème du devoir', () => {
  assert.equal(formatSubmissionGrade({ score: 7 }, 7), '7/7')
  assert.equal(formatSubmissionGrade({ score: 15 }, null), '15/20')
  assert.equal(formatSubmissionGrade({ status: 'SUBMITTED' }, 20), '')
  assert.equal(formatSubmissionGrade(null, 20), '')
})

test('attendanceRate compte présents et retards, ignore les justifiés, null sans relevé', () => {
  assert.equal(attendanceRate([]), null)
  assert.equal(attendanceRate([{ status: 'JUSTIFIE' }]), null)
  assert.equal(attendanceRate([{ status: 'PRESENT' }, { status: 'RETARD' }, { status: 'ABSENT' }, { status: 'JUSTIFIE' }]), 67)
  assert.equal(attendanceRate([{ status: 'PRESENT' }, { status: 'PRESENT' }]), 100)
})
