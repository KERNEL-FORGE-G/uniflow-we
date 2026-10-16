import test from 'node:test'
import assert from 'node:assert/strict'
import { CLASSROOMS, PROGRAMS, TEACHER_ACCOUNTS, TIMETABLES, allSessions, expandSession } from './fs-uy1-2026-2027.mjs'

// Les emplois du temps ICT4D L2 et L3 sont fictifs (2026-09-21) : ils doivent
// au moins être cohérents — pas deux séances au même moment pour une même
// promotion, des salles connues, des codes du bon niveau — sinon l'écran
// « Emploi du temps » des étudiants montrerait des chevauchements absurdes.

const minutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const ict4dTimetables = TIMETABLES.filter((t) => t.program === 'ICT4D')
const siglTimetables = TIMETABLES.filter((t) => t.program === 'SIGL')

test('ICT4D (L1, L2, L3) et SIGL (M1, M2) ont chacun un emploi du temps officiel validé', () => {
  assert.deepEqual(ict4dTimetables.map((t) => `${t.program} ${t.level}`).sort(), ['ICT4D L1', 'ICT4D L2', 'ICT4D L3'])
  assert.deepEqual(siglTimetables.map((t) => `${t.program} ${t.level}`).sort(), ['SIGL M1', 'SIGL M2'])

  for (const timetable of [...ict4dTimetables, ...siglTimetables]) {
    assert.match(timetable.notes, /officiel|Master/i)
    assert.ok(timetable.sessions.length >= 7, `${timetable.program} ${timetable.level} : au moins sept séances`)
    for (const session of timetable.sessions) {
      const expanded = expandSession(timetable, session)
      assert.ok(expanded.code, 'chaque séance a un code UE')
      assert.ok(expanded.startTime && expanded.endTime, 'horaires renseignés')
    }
  }
})

test('aucune promotion ICT4D ou SIGL n’a deux séances qui se chevauchent le même jour (hors groupes distincts)', () => {
  for (const timetable of [...ict4dTimetables, ...siglTimetables]) {
    const sessions = timetable.sessions.map((session) => expandSession(timetable, session)).filter((s) => !s.group)
    for (let i = 0; i < sessions.length; i += 1) {
      for (let j = i + 1; j < sessions.length; j += 1) {
        const a = sessions[i]
        const b = sessions[j]
        if (a.day !== b.day) continue
        // Les UE optionnelles (« * ») ou de langues (ENG / FRA au choix de l'étudiant) partagent volontairement un créneau.
        if ((a.optional && b.optional) || (/^(ENG|FRA)/.test(a.code) && /^(ENG|FRA)/.test(b.code))) continue
        const overlap = minutes(a.startTime) < minutes(b.endTime) && minutes(b.startTime) < minutes(a.endTime)
        assert.ok(
          !overlap,
          `${timetable.program} ${timetable.level} ${a.day} : ${a.code} (${a.startTime}-${a.endTime}) chevauche ${b.code} (${b.startTime}-${b.endTime})`,
        )
      }
    }
  }
})

test('les séances ICT4D utilisent des codes de leur niveau', () => {
  for (const timetable of ict4dTimetables) {
    const digit = timetable.level.slice(1)
    for (const session of timetable.sessions.map((s) => expandSession(timetable, s))) {
      assert.match(session.code, new RegExp(`^(ICT|ENG|FRA)${digit}\\d{2}$`), `${session.code} n'est pas un code ${timetable.level}`)
      assert.ok(session.title, `${session.code} : doit porter un intitulé`)
    }
  }
})

test('la filière ICT4D du référentiel couvre bien L1 à L3', () => {
  const ict4d = PROGRAMS.find((program) => program.code === 'ICT4D')
  assert.equal(ict4d.levels, 'L1,L2,L3')
})
