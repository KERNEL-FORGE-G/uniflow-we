/**
 * Référentiel académique réel : Université de Yaoundé I, Faculté des Sciences.
 *
 * Remplit les collections lues **sans session** par les formulaires
 * d'inscription (`universities`, `faculties`, `academic_programs`,
 * `classrooms`), puis les cours et emplois du temps (`academic_courses`,
 * `academic_schedules`) de toutes les filières du semestre 1 2026-2027,
 * transcrits depuis les emplois du temps officiels (voir
 * `scripts/data/fs-uy1-2026-2027.mjs`).
 *
 * Pourquoi : les trois clients proposaient une liste codée en dur réduite à
 * « Université de Yaoundé I / ICT4D / L1 », et l'emploi du temps affiché était
 * un jeu de démonstration inventé (`seed-academic-demo.mjs`). Le propriétaire
 * veut que ces données viennent de la base et correspondent au périmètre
 * réel : la Faculté des Sciences entière.
 *
 * Idempotent : chaque document porte un identifiant déterministe (dérivé de la
 * filière, du niveau et du contenu de la séance), une seconde exécution met
 * à jour au lieu de dupliquer. `--prune` supprime en plus les séances
 * précédemment créées par ce script qui n'existent plus dans les données.
 * `--dry-run` n'écrit rien et affiche le décompte.
 *
 * Usage : node scripts/seed-academic-reference-data.mjs [--dry-run] [--prune]
 */

import { createHash } from 'node:crypto'
import { createClient, databaseId } from './appwrite-env.mjs'
import {
  ACADEMIC_YEAR,
  CLASSROOMS,
  FACULTY,
  PROGRAMS,
  SEMESTER,
  TIMETABLES,
  UNIVERSITY,
  allSessions,
} from './data/fs-uy1-2026-2027.mjs'

const dryRun = process.argv.includes('--dry-run')
const prune = process.argv.includes('--prune')
const request = dryRun ? null : createClient()

/** Identifiant de document valide : Appwrite refuse point, espace et accents. */
const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36)

/** Préfixe commun des documents créés ici : sert au nettoyage (`--prune`). */
const COURSE_PREFIX = 'fs-'
const SCHEDULE_PREFIX = 'edt-'

const counters = { créé: 0, 'mis à jour': 0, échec: 0, supprimé: 0 }

async function upsert(collectionId, documentId, data, permissions) {
  if (dryRun) return 'simulé'
  const created = await request('POST', `/databases/${databaseId}/collections/${collectionId}/documents`, {
    documentId,
    data,
    permissions,
  })
  if (created.status === 201) return 'créé'
  if (created.status === 409) {
    await request('PATCH', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, { data, permissions })
    return 'mis à jour'
  }
  console.warn(`  ! ${collectionId}/${documentId} : ${created.payload.message}`)
  return 'échec'
}

function tally(state) {
  if (state in counters) counters[state] += 1
}

async function listAll(collectionId, queries) {
  const documents = []
  let cursor = null
  for (;;) {
    const all = [...queries, { method: 'limit', values: [100] }]
    if (cursor) all.push({ method: 'cursorAfter', values: [cursor] })
    const search = all.map((query, index) => `queries[${index}]=${encodeURIComponent(JSON.stringify(query))}`).join('&')
    const response = await request('GET', `/databases/${databaseId}/collections/${collectionId}/documents?${search}`)
    const page = response.payload.documents || []
    documents.push(...page)
    if (page.length < 100) return documents
    cursor = page[page.length - 1].$id
  }
}

/** Identifiant de cours : filière + niveau + code UE (« fs-phy-l3-phy-321 »). */
const courseId = (program, level, code) => slug(`${COURSE_PREFIX}${program}-${level}-${code}`)

/** Identifiant de séance : déterministe pour rester idempotent, court pour tenir en 36 caractères. */
function scheduleId(session) {
  const digest = createHash('sha1')
    .update([session.program, session.level, session.day, session.startTime, session.endTime, session.code, session.room, session.type, session.group].join('|'))
    .digest('hex')
    .slice(0, 10)
  return slug(`${SCHEDULE_PREFIX}${session.program}-${session.level}-${digest}`)
}

/** Regroupe les séances par cours pour en déduire enseignants, salle et volume horaire. */
function buildCourses(sessions) {
  const courses = new Map()
  for (const session of sessions) {
    const id = courseId(session.program, session.level, session.code)
    const course = courses.get(id) || {
      id,
      code: session.code,
      program: session.program,
      level: session.level,
      title: '',
      teachers: new Set(),
      rooms: new Map(),
      types: new Set(),
      minutes: 0,
      optional: false,
    }
    if (session.title && !course.title) course.title = session.title
    if (session.teachers) session.teachers.split('/').map((name) => name.trim()).filter(Boolean).forEach((name) => course.teachers.add(name))
    if (session.room) course.rooms.set(session.room, (course.rooms.get(session.room) || 0) + 1)
    course.types.add(session.type)
    course.optional = course.optional || session.optional
    const [sh, sm] = session.startTime.split(':').map(Number)
    const [eh, em] = session.endTime.split(':').map(Number)
    course.minutes += Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
    courses.set(id, course)
  }
  return [...courses.values()]
}

function courseDocument(course) {
  const programName = PROGRAMS.find((program) => program.code === course.program)?.name || course.program
  const mainRoom = [...course.rooms.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || ''
  const teacherName = [...course.teachers].join(' / ')
  const kind = course.types.has('CM') ? 'CM' : course.types.has('TP') ? 'TP' : 'TD'
  const name = course.title
    || (course.code === 'TD' ? 'Travaux dirigés' : course.code)
  const parts = [
    `${name} — ${programName} ${course.level}, semestre ${SEMESTER} ${ACADEMIC_YEAR}, Faculté des Sciences (UY1).`,
    teacherName ? `Enseignant(s) : ${teacherName}.` : '',
    course.optional ? 'UE optionnelle : une semaine sur deux ou 1h30 par semaine.' : '',
  ].filter(Boolean)
  return {
    code: course.code.slice(0, 32),
    name: name.slice(0, 255),
    description: parts.join(' ').slice(0, 2000),
    university: UNIVERSITY.name,
    program: course.program,
    level: course.level,
    teacherId: '',
    teacherName: teacherName.slice(0, 255),
    credits: 0,
    // Volume hebdomadaire arrondi à l'heure : la maquette (crédits, volume
    // total) n'est pas imprimée sur les emplois du temps.
    hours: Math.round(course.minutes / 60),
    classroom: mainRoom.slice(0, 64),
    type: kind,
  }
}

function scheduleDocument(session) {
  const typeLabel = [session.type, session.group].filter(Boolean).join(' ')
  return {
    courseId: courseId(session.program, session.level, session.code),
    courseCode: session.code.slice(0, 32),
    dayOfWeek: session.day,
    startTime: session.startTime,
    endTime: session.endTime,
    classroom: session.room.slice(0, 64),
    type: typeLabel.slice(0, 32),
  }
}

async function main() {
  const sessions = allSessions()
  const courses = buildCourses(sessions)
  console.log(`${TIMETABLES.length} emplois du temps, ${courses.length} cours, ${sessions.length} séances, ${CLASSROOMS.length} salles, ${PROGRAMS.length} filières.${dryRun ? ' (simulation)' : ''}`)

  console.log('\n— Université et faculté')
  tally(await upsert('universities', slug(UNIVERSITY.code), {
    code: UNIVERSITY.code,
    name: UNIVERSITY.name,
    shortName: UNIVERSITY.shortName,
    city: UNIVERSITY.city,
    country: UNIVERSITY.country,
    website: UNIVERSITY.website,
    active: true,
  }))
  tally(await upsert('faculties', slug(`${UNIVERSITY.code}-${FACULTY.code}`), {
    universityCode: UNIVERSITY.code,
    code: FACULTY.code,
    name: FACULTY.name,
    active: true,
  }))
  console.log(`  ${UNIVERSITY.name} / ${FACULTY.name}`)

  console.log('\n— Filières')
  for (const program of PROGRAMS) {
    const state = await upsert('academic_programs', slug(`${UNIVERSITY.code}-${program.code}`), {
      universityCode: UNIVERSITY.code,
      facultyCode: FACULTY.code,
      code: program.code,
      name: program.name,
      levels: program.levels,
      description: program.description || '',
      active: true,
    })
    tally(state)
    console.log(`  ${program.code.padEnd(6)} ${program.name} [${program.levels}] (${state})`)
  }

  console.log('\n— Salles')
  for (const room of CLASSROOMS) {
    const state = await upsert('classrooms', slug(`${UNIVERSITY.code}-${room.code}`), {
      universityCode: UNIVERSITY.code,
      facultyCode: FACULTY.code,
      code: room.code,
      name: room.name || room.code,
      kind: room.kind || 'SALLE',
      capacity: room.capacity || 0,
      building: room.building || '',
      active: true,
    })
    tally(state)
  }
  console.log(`  ${CLASSROOMS.length} salles traitées.`)

  console.log('\n— Cours')
  for (const course of courses) {
    tally(await upsert('academic_courses', course.id, courseDocument(course), ['read("users")']))
  }
  console.log(`  ${courses.length} cours traités.`)

  console.log('\n— Emplois du temps')
  const keptIds = new Set()
  for (const session of sessions) {
    const id = scheduleId(session)
    keptIds.add(id)
    tally(await upsert('academic_schedules', id, scheduleDocument(session), ['read("users")']))
  }
  console.log(`  ${sessions.length} séances traitées.`)

  if (prune && !dryRun) {
    console.log('\n— Nettoyage des séances obsolètes')
    const existing = await listAll('academic_schedules', [{ method: 'startsWith', attribute: 'courseId', values: [COURSE_PREFIX] }])
    for (const document of existing) {
      if (keptIds.has(document.$id)) continue
      await request('DELETE', `/databases/${databaseId}/collections/academic_schedules/documents/${document.$id}`)
      counters.supprimé += 1
    }
    console.log(`  ${counters.supprimé} séance(s) supprimée(s).`)
  }

  console.log(`\nBilan : ${counters.créé} créé(s), ${counters['mis à jour']} mis à jour, ${counters.échec} échec(s)${prune ? `, ${counters.supprimé} supprimé(s)` : ''}.`)
  if (counters.échec > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
