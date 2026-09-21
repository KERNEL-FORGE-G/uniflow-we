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

const provisional = TIMETABLES.filter((timetable) => timetable.provisional)

test('ICT4D L2 et L3 ont chacun un emploi du temps provisoire fictif, signalé comme tel', () => {
  assert.deepEqual(provisional.map((t) => `${t.program} ${t.level}`).sort(), ['ICT4D L2', 'ICT4D L3'])
  for (const timetable of provisional) {
    assert.match(timetable.notes, /provisoire/i)
    assert.ok(timetable.sessions.length >= 10, `${timetable.level} : au moins deux semaines pleines de cours`)
    for (const session of timetable.sessions) {
      assert.equal(expandSession(timetable, session).provisional, true)
    }
  }
  // Les emplois du temps officiels ne sont pas marqués provisoires.
  assert.equal(expandSession(TIMETABLES[0], TIMETABLES[0].sessions[0]).provisional, false)
})

test('aucune promotion n’a deux séances qui se chevauchent le même jour (hors groupes distincts)', () => {
  for (const timetable of TIMETABLES) {
    const sessions = timetable.sessions.map((session) => expandSession(timetable, session)).filter((s) => !s.group)
    for (let i = 0; i < sessions.length; i += 1) {
      for (let j = i + 1; j < sessions.length; j += 1) {
        const a = sessions[i]
        const b = sessions[j]
        if (a.day !== b.day) continue
        // Les UE optionnelles (« * ») partagent volontairement un créneau : une semaine sur deux.
        if (a.optional && b.optional) continue
        const overlap = minutes(a.startTime) < minutes(b.endTime) && minutes(b.startTime) < minutes(a.endTime)
        assert.ok(
          !overlap || !timetable.provisional,
          `${timetable.program} ${timetable.level} ${a.day} : ${a.code} (${a.startTime}-${a.endTime}) chevauche ${b.code} (${b.startTime}-${b.endTime})`,
        )
      }
    }
  }
})

test('les séances fictives ICT4D utilisent des salles du référentiel et des codes de leur niveau', () => {
  const rooms = new Set(CLASSROOMS.map((room) => room.code))
  for (const timetable of provisional) {
    const digit = timetable.level.slice(1)
    for (const session of timetable.sessions.map((s) => expandSession(timetable, s))) {
      assert.ok(rooms.has(session.room), `${session.code} : salle « ${session.room} » inconnue du référentiel`)
      assert.match(session.code, new RegExp(`^ICT${digit}\\d{2}$`), `${session.code} n'est pas un code ${timetable.level}`)
      assert.ok(session.title, `${session.code} : un cours fictif doit porter un intitulé`)
      assert.ok(['CM', 'TD', 'TP'].includes(session.type))
    }
  }
})

test('chaque cours fictif a un cours magistral et les enseignants de démonstration y sont rattachés', () => {
  for (const timetable of provisional) {
    const byCode = new Map()
    for (const session of timetable.sessions.map((s) => expandSession(timetable, s))) {
      if (!byCode.has(session.code)) byCode.set(session.code, new Set())
      byCode.get(session.code).add(session.type)
    }
    assert.ok(byCode.size >= 7, `${timetable.level} : au moins sept UE au semestre`)
    for (const [code, types] of byCode) {
      // Les UE de langue et de projet sont en TD/TP seulement ; les autres ont un CM.
      const practicalOnly = /ICT[23]0[78]$/.test(code)
      assert.ok(practicalOnly || types.has('CM'), `${code} : aucun cours magistral`)
    }
  }
  assert.deepEqual(Object.keys(TEACHER_ACCOUNTS).sort(), ['Dr. Nkolo', 'M. Essomba', 'Pr. Fouda'])
  const teachersInvolved = new Set(allSessions().filter((s) => s.provisional).flatMap((s) => s.teachers.split('/').map((t) => t.trim())))
  for (const teacher of Object.keys(TEACHER_ACCOUNTS)) assert.ok(teachersInvolved.has(teacher), `${teacher} n'enseigne dans aucune UE fictive`)
})

test('la filière ICT4D du référentiel couvre bien L1 à L3', () => {
  const ict4d = PROGRAMS.find((program) => program.code === 'ICT4D')
  assert.equal(ict4d.levels, 'L1,L2,L3')
})
