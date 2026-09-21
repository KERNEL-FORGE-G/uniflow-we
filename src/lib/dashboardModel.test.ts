import test from 'node:test'
import assert from 'node:assert/strict'
import { eventDaysInMonth, gradeDistribution, isoWeekNumber, relativeTime, scoreOn20, startOfWeek, teacherAverages, todaysSessions, weekdayKey, weeklyAttendanceTrend } from './dashboardModel.ts'

const monday = new Date(2026, 8, 21, 9, 0) // lundi 21 septembre 2026

const schedules = [
  { dayOfWeek: 'Lundi', startTime: '10:15', endTime: '12:15', course: { name: 'Algorithmique', code: 'ICT102', type: 'CM', classroom: { name: 'Salle B12' } } },
  { dayOfWeek: 'LUNDI', startTime: '08:00', endTime: '10:00', course: { name: 'Introduction aux TIC', code: 'ICT101', type: 'cm', classroom: { name: 'Amphi 250', building: 'Bloc A' } } },
  { dayOfWeek: 'Mercredi', startTime: '08:00', endTime: '10:00', course: { name: 'BDD', code: 'ICT104', type: 'CM' } },
]

test('weekdayKey ignore casse et accents', () => {
  assert.equal(weekdayKey('LUNDI'), 'lundi')
  assert.equal(weekdayKey(' Mercredi '), 'mercredi')
  assert.equal(weekdayKey(undefined), '')
})

test('todaysSessions ne garde que le jour courant, triées par heure', () => {
  const today = todaysSessions(schedules, monday)
  assert.deepEqual(today.map((event) => event.time), ['08:00', '10:15'])
  assert.equal(today[0].title, 'ICT101 — Introduction aux TIC')
  assert.equal(today[0].room, 'Amphi 250 · Bloc A')
  assert.equal(today[0].type, 'CM')
  assert.equal(todaysSessions(schedules, new Date(2026, 8, 22)).length, 0)
})

test('eventDaysInMonth marque tous les lundis et mercredis de septembre 2026', () => {
  assert.deepEqual(eventDaysInMonth(schedules, 2026, 8), [2, 7, 9, 14, 16, 21, 23, 28, 30])
  assert.deepEqual(eventDaysInMonth([], 2026, 8), [])
})

test('scoreOn20 et gradeDistribution ramènent tout sur 20 et somment à 100', () => {
  assert.equal(scoreOn20({ grade: 7, maxScore: 7 }), 20)
  assert.equal(scoreOn20({ grade: 15 }), 15)
  const distribution = gradeDistribution([{ grade: 17 }, { grade: 6, maxScore: 7 }, { grade: 13 }, { grade: 8 }])
  assert.equal(distribution.reduce((sum, slice) => sum + slice.value, 0), 100)
  assert.equal(distribution.find((slice) => slice.name.startsWith('Excellent'))?.value, 50)
  assert.equal(distribution.some((slice) => slice.name.startsWith('Bien')), false)
  // Les arrondis sont compensés sur la plus grande part : la somme reste 100.
  const drifted = gradeDistribution([{ grade: 17 }, { grade: 15 }, { grade: 13 }, { grade: 11 }, { grade: 8 }, { grade: 6, maxScore: 7 }])
  assert.equal(drifted.reduce((sum, slice) => sum + slice.value, 0), 100)
  assert.deepEqual(gradeDistribution([]), [])
})

test('teacherAverages regroupe par type d’évaluation', () => {
  const points = teacherAverages([
    { grade: 12, type: 'CC' }, { grade: 16, type: 'CC' }, { grade: 10, type: 'EXAM' },
  ])
  assert.deepEqual(points, [{ week: 'CC', average: 14 }, { week: 'EXAM', average: 10 }])
})

test('startOfWeek et isoWeekNumber', () => {
  assert.equal(startOfWeek(new Date(2026, 8, 24)).getDate(), 21)
  assert.equal(startOfWeek(new Date(2026, 8, 20)).getDate(), 14)
  assert.equal(isoWeekNumber(monday), 39)
})

test('weeklyAttendanceTrend calcule un point par semaine relevée', () => {
  const records = [
    { status: 'PRESENT', at: '2026-09-14T08:10:00' },
    { status: 'ABSENT', at: '2026-09-16T08:10:00' },
    { status: 'JUSTIFIE', at: '2026-09-17T08:10:00' },
    { status: 'RETARD', at: '2026-09-21T08:10:00' },
    { status: 'PRESENT', at: '2026-08-01T08:10:00' },
  ]
  const trend = weeklyAttendanceTrend(records, monday, 6)
  assert.deepEqual(trend, [{ week: 'S38', rate: 50 }, { week: 'S39', rate: 100 }])
  assert.deepEqual(weeklyAttendanceTrend([], monday), [])
})

test('relativeTime en français', () => {
  const now = new Date('2026-09-21T12:00:00Z')
  assert.equal(relativeTime('2026-09-21T11:58:00Z', now), 'il y a 2 min')
  assert.equal(relativeTime('2026-09-21T09:00:00Z', now), 'il y a 3 h')
  assert.equal(relativeTime('2026-09-20T12:00:00Z', now), 'hier')
  assert.equal(relativeTime('2026-09-17T12:00:00Z', now), 'il y a 4 j')
  assert.equal(relativeTime('n/a', now), '')
})
