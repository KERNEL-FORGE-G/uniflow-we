import { createHash } from 'node:crypto'
import { createClient, databaseId } from './appwrite-env.mjs'
import { TIMETABLES, expandSession, UNIVERSITY } from './data/fs-uy1-2026-2027.mjs'

const request = createClient()
const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36)
const COURSE_PREFIX = 'fs-'
const SCHEDULE_PREFIX = 'edt-'

const courseId = (program, level, code) => slug(`${COURSE_PREFIX}${program}-${level}-${code}`)
function scheduleId(session) {
  const digest = createHash('sha1')
    .update([session.program, session.level, session.day, session.startTime, session.endTime, session.code, session.room, session.type, session.group].join('|'))
    .digest('hex')
    .slice(0, 10)
  return slug(`${SCHEDULE_PREFIX}${session.program}-${session.level}-${digest}`)
}

async function upsert(collectionId, documentId, data, permissions) {
  const res = await request('POST', `/databases/${databaseId}/collections/${collectionId}/documents`, {
    documentId,
    data,
    permissions,
  })
  if (res.status === 201) return 'créé'
  if (res.status === 409) {
    const patch = await request('PATCH', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, {
      data,
      permissions,
    })
    return patch.status === 200 ? 'mis à jour' : `patch failed: ${patch.status}`
  }
  return `error: ${res.status} - ${res.payload?.message}`
}

async function run() {
  console.log('--- Provisioning ICT4D L1, L2, L3 schedules & courses ---')
  const ict4dTimetables = TIMETABLES.filter(t => t.program === 'ICT4D')
  console.log(`Found ${ict4dTimetables.length} ICT4D levels:`, ict4dTimetables.map(t => t.level).join(', '))

  for (const tt of ict4dTimetables) {
    console.log(`\nProcessing ICT4D ${tt.level} (${tt.sessions.length} sessions)...`)
    for (const rawSession of tt.sessions) {
      const session = expandSession(tt, rawSession)
      const cId = courseId(session.program, session.level, session.code)
      const sId = scheduleId(session)

      // Ensure course
      const courseDoc = {
        code: session.code,
        name: session.title || session.code,
        description: `${session.title || session.code} — Licence professionnelle ICT4D ${session.level}.`,
        university: UNIVERSITY.name,
        program: 'ICT4D',
        level: session.level,
        teacherId: '',
        teacherName: session.teachers || '',
        credits: 5,
        hours: 45,
        classroom: session.room,
        type: session.type,
      }
      const cState = await upsert('academic_courses', cId, courseDoc, ['read("any")', 'read("users")'])

      // Ensure schedule
      const schedDoc = {
        courseId: cId,
        courseCode: session.code,
        dayOfWeek: session.day,
        startTime: session.startTime,
        endTime: session.endTime,
        classroom: session.room,
        type: session.type,
        university: UNIVERSITY.name,
        program: 'ICT4D',
        level: session.level,
        courseName: session.title || session.code,
        teacherName: session.teachers || '',
        group: session.group || '',
        semester: 'S1',
        academicYear: '2026-2027',
      }
      const sState = await upsert('academic_schedules', sId, schedDoc, ['read("any")', 'read("users")'])
      console.log(`  [ICT4D ${session.level}] ${session.day} ${session.startTime} ${session.code} (${session.room}): course=${cState}, sched=${sState}`)
    }
  }

  console.log('\n--- Done! ---')
}

run().catch(console.error)
