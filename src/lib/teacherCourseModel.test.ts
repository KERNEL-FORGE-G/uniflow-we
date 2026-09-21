import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluationProgress, fileKind, humanFileSize, localInputToIso, summarizeStatement } from './teacherCourseModel.ts'

const now = new Date('2026-09-21T09:00:00.000Z')

test('summarizeStatement : en cours tant que l’échéance n’est pas passée, même tout noté', () => {
  const summary = summarizeStatement({ dueDate: '2026-09-25T23:59:00.000Z' }, [{ status: 'GRADED', score: 14 }, { status: 'graded' }], 10, now)
  assert.deepEqual(summary, { submitted: 2, corrected: 2, missing: 8, phase: 'En cours' })
})

test('summarizeStatement : échéance passée puis corrigé quand tous les rendus sont notés', () => {
  const partial = summarizeStatement({ dueDate: '2026-09-18T23:59:00.000Z' }, [{ status: 'SUBMITTED' }, { score: 12 }], 2, now)
  assert.equal(partial.phase, 'Échéance passée')
  assert.equal(partial.corrected, 1)
  assert.equal(partial.missing, 0)
  const done = summarizeStatement({ dueDate: '2026-09-18T23:59:00.000Z' }, [{ score: 12 }, { status: 'GRADED' }], 2, now)
  assert.equal(done.phase, 'Corrigé')
  // Aucun rendu : rien à corriger, on reste sur « échéance passée »
  assert.equal(summarizeStatement({ dueDate: '2026-09-18T23:59:00.000Z' }, [], 5, now).phase, 'Échéance passée')
  // Date illisible : jamais « passée »
  assert.equal(summarizeStatement({ dueDate: 'demain' }, [], 0, now).phase, 'En cours')
})

test('humanFileSize et fileKind', () => {
  assert.equal(humanFileSize(512), '512 o')
  assert.equal(humanFileSize(4 * 1024), '4 Ko')
  assert.equal(humanFileSize(1.8 * 1024 * 1024), '1,8 Mo')
  assert.equal(humanFileSize(-1), '')
  assert.equal(fileKind('TD2_Arbres.pdf'), 'PDF')
  assert.equal(fileKind('archive.tar.gz'), 'GZ')
  assert.equal(fileKind('sans-extension'), '')
  assert.equal(fileKind('.bashrc'), '')
})

test('evaluationProgress borné à 100 et nul sans inscrits', () => {
  assert.equal(evaluationProgress(0, 3), 0)
  assert.equal(evaluationProgress(8, 2), 25)
  assert.equal(evaluationProgress(3, 5), 100)
})

test('localInputToIso', () => {
  assert.equal(localInputToIso(''), null)
  assert.equal(localInputToIso('n’importe quoi'), null)
  const iso = localInputToIso('2026-09-30T18:00')
  assert.ok(iso && iso.endsWith('Z'))
  assert.equal(new Date(iso!).getTime(), new Date(2026, 8, 30, 18, 0).getTime())
})
