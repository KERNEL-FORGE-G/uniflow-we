/**
 * Jeu de données académiques de démonstration.
 *
 * Le serveur Appwrite d'UniFlow ne contenait, côté académique, que des
 * collections vides — et quatre d'entre elles n'existaient même pas. Une
 * connexion réussie menait donc à des écrans vides : c'est ce que décrit le
 * symptôme « le login marche mais il n'y a pas de données ».
 *
 * Ce script remplit les collections lues par le mobile et le desktop :
 * cours, emploi du temps, annuaire, notes, bibliothèque et devoirs, pour le
 * programme ICT4D en L1 de l'Université de Yaoundé I — le profil réel des
 * comptes présents sur le serveur.
 *
 * Idempotent : chaque document porte un identifiant fixe, donc une seconde
 * exécution met à jour au lieu de dupliquer.
 *
 * Usage : node scripts/seed-academic-demo.mjs
 */

import { createClient, databaseId } from './appwrite-env.mjs'

const request = createClient()

const UNIVERSITY = 'Université de Yaoundé I'
const PROGRAM = 'ICT4D'
const LEVEL = 'L1'
/** Enseignant de démonstration : aucun compte enseignant n'existe encore. */
const DEMO_TEACHER = { id: 'seed-teacher-ict4d', name: 'Pr. Fouda' }

const courses = [
  { id: 'ict101', code: 'ICT101', name: 'Introduction aux TIC', credits: 6, hours: 60, teacher: 'Pr. Mbarga', classroom: 'Amphi 250', type: 'CM' },
  { id: 'ict102', code: 'ICT102', name: 'Algorithmique et programmation', credits: 6, hours: 60, teacher: 'Dr. Nkolo', classroom: 'Salle B12', type: 'CM' },
  { id: 'ict103', code: 'ICT103', name: 'Mathématiques pour l’informatique', credits: 5, hours: 45, teacher: 'Dr. Atangana', classroom: 'Amphi 150', type: 'CM' },
  { id: 'ict104', code: 'ICT104', name: 'Bases de données relationnelles', credits: 5, hours: 45, teacher: 'Pr. Fouda', classroom: 'Salle B07', type: 'CM' },
  { id: 'ict105', code: 'ICT105', name: 'Développement web', credits: 6, hours: 60, teacher: 'M. Essomba', classroom: 'Salle info 3', type: 'TP' },
  { id: 'ict106', code: 'ICT106', name: 'Anglais scientifique', credits: 3, hours: 30, teacher: 'Mme Bilé', classroom: 'Salle C04', type: 'TD' },
]

const schedules = [
  { id: 'sched-lun-1', courseId: 'ict101', day: 'Lundi', start: '08:00', end: '10:00', room: 'Amphi 250', type: 'CM' },
  { id: 'sched-lun-2', courseId: 'ict102', day: 'Lundi', start: '10:15', end: '12:15', room: 'Salle B12', type: 'CM' },
  { id: 'sched-mar-1', courseId: 'ict103', day: 'Mardi', start: '07:30', end: '09:30', room: 'Amphi 150', type: 'CM' },
  { id: 'sched-mar-2', courseId: 'ict105', day: 'Mardi', start: '13:00', end: '16:00', room: 'Salle info 3', type: 'TP' },
  { id: 'sched-mer-1', courseId: 'ict104', day: 'Mercredi', start: '08:00', end: '10:00', room: 'Salle B07', type: 'CM' },
  { id: 'sched-mer-2', courseId: 'ict106', day: 'Mercredi', start: '10:15', end: '12:15', room: 'Salle C04', type: 'TD' },
  { id: 'sched-jeu-1', courseId: 'ict102', day: 'Jeudi', start: '08:00', end: '11:00', room: 'Salle info 1', type: 'TP' },
  { id: 'sched-jeu-2', courseId: 'ict103', day: 'Jeudi', start: '13:00', end: '15:00', room: 'Amphi 150', type: 'TD' },
  { id: 'sched-ven-1', courseId: 'ict104', day: 'Vendredi', start: '09:00', end: '12:00', room: 'Salle B07', type: 'TP' },
  { id: 'sched-ven-2', courseId: 'ict101', day: 'Vendredi', start: '14:00', end: '16:00', room: 'Amphi 250', type: 'TD' },
]

const evaluations = [
  { suffix: 'cc1', title: 'Contrôle continu 1', type: 'CC', scores: [14.5, 12, 16, 9.5, 13, 11, 15.5] },
  { suffix: 'tp', title: 'Travaux pratiques', type: 'TP', scores: [16, 14, 12.5, 11, 17, 13.5, 15] },
  { suffix: 'partiel', title: 'Examen partiel', type: 'EXAM', scores: [12, 9.5, 14, 8, 15, 10.5, 13] },
]

/** Quiz de démonstration, au format attendu par `QuizDefinition.fromJson`. */
const demoQuiz = {
  title: 'Quiz — Bases de données relationnelles',
  durationMinutes: 20,
  questions: [
    {
      id: 'q1',
      type: 'single',
      prompt: 'Quelle clause permet de filtrer les lignes d’une requête SQL ?',
      choices: ['GROUP BY', 'WHERE', 'ORDER BY', 'HAVING'],
      correct: [1],
      points: 2,
      explanation: 'WHERE filtre les lignes avant l’agrégation ; HAVING filtre après.',
    },
    {
      id: 'q2',
      type: 'multiple',
      prompt: 'Quelles contraintes garantissent l’intégrité d’une table ?',
      choices: ['PRIMARY KEY', 'FOREIGN KEY', 'NOT NULL', 'VARCHAR'],
      correct: [0, 1, 2],
      points: 3,
      explanation: 'VARCHAR est un type, pas une contrainte.',
    },
    {
      id: 'q3',
      type: 'text',
      prompt: 'Comment nomme-t-on la propriété qui rend une transaction indivisible ?',
      expected: 'atomicité',
      points: 2,
      explanation: 'Atomicité : tout ou rien (propriété ACID).',
    },
  ],
}

/** PDF minimal, valide, utilisé comme support de cours et comme énoncé. */
function minimalPdf(title) {
  const safe = title.replace(/[()\\]/g, '')
  const body = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${28 + safe.length * 2} >> stream`,
    `BT /F1 18 Tf 60 760 Td (UniFlow) Tj ET`,
    `BT /F1 12 Tf 60 730 Td (${safe}) Tj ET`,
    'endstream endobj',
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    'trailer << /Root 1 0 R /Size 6 >>',
    '%%EOF',
  ].join('\n')
  return new TextEncoder().encode(body)
}

async function uploadPdf(fileId, title) {
  const form = new FormData()
  form.set('fileId', fileId)
  // En multipart, Appwrite attend des champs répétés `permissions[]` et non un
  // tableau sérialisé en JSON : `{"permissions":"[...]"}` répond
  // « Permissions must be an array of strings ».
  form.append('permissions[]', 'read("users")')
  form.set('file', new Blob([minimalPdf(title)], { type: 'application/pdf' }), `${fileId}.pdf`)
  const result = await request('POST', '/storage/buckets/uniflow_assets/files', form)
  if (result.status === 201) return result.payload.$id
  const existing = await request('GET', `/storage/buckets/uniflow_assets/files/${fileId}`)
  if (existing.status === 200) return fileId
  console.warn(`  ! Téléversement de ${fileId} impossible : ${result.payload.message}`)
  return ''
}

async function upsert(collectionId, documentId, data, permissions) {
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

/** Identifiant de document valide : Appwrite n'accepte ni point ni espace. */
const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 36)

async function main() {
  const usersResponse = await request('GET', `/databases/${databaseId}/collections/users/documents?queries%5B0%5D=${encodeURIComponent(JSON.stringify({ method: 'limit', values: [100] }))}`)
  const users = usersResponse.payload.documents || []
  // Seuls les étudiants et délégués universitaires reçoivent notes, devoirs et
  // inscriptions : le seed traitait aussi les administrateurs et enseignants,
  // qui se retrouvaient avec des notes.
  const students = users.filter((user) => user.accountType === 'UNIVERSITY'
    && ['STUDENT', 'DELEGATE'].includes(user.role || 'STUDENT')
    && (user.program || PROGRAM) === PROGRAM)
  console.log(`${users.length} compte(s) lu(s), ${students.length} en ${PROGRAM}.`)

  console.log('\n— Cours')
  for (const course of courses) {
    const state = await upsert('academic_courses', course.id, {
      code: course.code,
      name: course.name,
      description: `${course.name} — ${LEVEL} ${PROGRAM}.`,
      university: UNIVERSITY,
      program: PROGRAM,
      level: LEVEL,
      teacherId: '',
      teacherName: course.teacher,
      credits: course.credits,
      hours: course.hours,
      classroom: course.classroom,
      type: course.type,
    }, [`read("users")`])
    console.log(`  ${course.code} ${course.name} (${state})`)
  }

  console.log('\n— Emploi du temps')
  for (const slot of schedules) {
    const course = courses.find((item) => item.id === slot.courseId)
    const state = await upsert('academic_schedules', slot.id, {
      courseId: slot.courseId,
      courseCode: course.code,
      dayOfWeek: slot.day,
      startTime: slot.start,
      endTime: slot.end,
      classroom: slot.room,
      type: slot.type,
    }, [`read("users")`])
    console.log(`  ${slot.day} ${slot.start} ${course.code} (${state})`)
  }

  console.log('\n— Annuaire')
  for (const [index, student] of students.entries()) {
    // `userId` est unique dans l'annuaire : si `seed-accounts.mjs` a déjà
    // inscrit ce compte (sous un autre identifiant de document), on met à jour
    // l'entrée existante au lieu de heurter l'index.
    const existing = await request('GET', `/databases/${databaseId}/collections/academic_directory/documents?queries%5B0%5D=${encodeURIComponent(JSON.stringify({ method: 'equal', attribute: 'userId', values: [student.$id] }))}`)
    const documentId = existing.payload.documents?.[0]?.$id || slug(student.$id)
    const state = await upsert('academic_directory', documentId, {
      userId: student.$id,
      name: student.name || student.username || student.email,
      role: student.role || 'STUDENT',
      university: student.university || UNIVERSITY,
      program: student.program || PROGRAM,
      level: student.level || LEVEL,
      matricule: student.matricule || `UY1-${program_matricule(index)}`,
      status: 'ACTIVE',
    }, [`read("users")`])
    console.log(`  ${student.name || student.username} (${state})`)
  }

  console.log('\n— Notes')
  for (const student of students) {
    for (const [courseIndex, course] of courses.entries()) {
      for (const evaluation of evaluations) {
        const score = evaluation.scores[(students.indexOf(student) + courseIndex) % evaluation.scores.length]
        await upsert('academic_grades', slug(`${student.$id}-${course.id}-${evaluation.suffix}`), {
          studentId: student.$id,
          courseId: course.id,
          courseCode: course.code,
          evaluationTitle: `${evaluation.title} — ${course.code}`,
          type: evaluation.type,
          score,
          maxScore: 20,
          coefficient: evaluation.type === 'EXAM' ? 2 : 1,
        }, [`read("users")`])
      }
    }
    console.log(`  notes de ${student.name || student.username}`)
  }

  console.log('\n— Bibliothèque')
  const library = [
    { id: 'lib-ict101-poly', title: 'Polycopié — Introduction aux TIC', course: courses[0], type: 'COURS', category: 'Polycopié', file: true },
    { id: 'lib-ict102-td', title: 'TD 1 — Boucles et fonctions', course: courses[1], type: 'TD', category: 'Travaux dirigés', file: true },
    { id: 'lib-ict104-poly', title: 'Polycopié — Modèle relationnel', course: courses[3], type: 'COURS', category: 'Polycopié', file: true },
    { id: 'lib-ict104-annale', title: 'Annale — Examen 2025', course: courses[3], type: 'ANNALE', category: 'Annales', file: false },
    { id: 'lib-ict105-tp', title: 'TP — Application web complète', course: courses[4], type: 'TP', category: 'Travaux pratiques', file: false },
    { id: 'lib-ict103-fiche', title: 'Fiche de révision — Algèbre linéaire', course: courses[2], type: 'FICHE', category: 'Fiches', file: false },
  ]
  for (const entry of library) {
    const fileId = entry.file ? await uploadPdf(entry.id, entry.title) : ''
    const state = await upsert('academic_library', entry.id, {
      title: entry.title,
      courseId: entry.course.id,
      course: `${entry.course.code} — ${entry.course.name}`,
      type: entry.type,
      category: entry.category,
      size: entry.file ? '1 page' : '',
      description: `${entry.category} pour ${entry.course.code}.`,
      fileId,
      publishedAt: new Date().toISOString(),
    }, [`read("users")`])
    console.log(`  ${entry.title} (${state})`)
  }

  console.log('\n— Devoirs')
  const audience = JSON.stringify({ filieres: [PROGRAM], niveaux: [LEVEL] })
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const assignments = [
    {
      id: 'devoir-quiz-bdd',
      title: 'Quiz — Bases de données relationnelles',
      description: 'Trois questions sur le modèle relationnel et les contraintes d’intégrité. Correction automatique immédiate.',
      course: courses[3],
      type: 'QUIZ',
      due: new Date(now + 7 * day).toISOString(),
      maxScore: 7,
      quiz: JSON.stringify(demoQuiz),
      file: false,
    },
    {
      id: 'devoir-pdf-algo',
      title: 'Devoir maison — Algorithmes de tri',
      description: 'Rédigez la comparaison des tris par insertion, fusion et rapide. Rendu en PDF.',
      course: courses[1],
      type: 'PDF',
      due: new Date(now + 10 * day).toISOString(),
      maxScore: 20,
      file: true,
    },
    {
      id: 'devoir-td-web',
      title: 'TD 2 — Formulaire HTML et validation',
      description: 'Construisez un formulaire accessible avec validation côté client. Rendu en photo ou en PDF.',
      course: courses[4],
      type: 'TD',
      due: new Date(now + 4 * day).toISOString(),
      maxScore: 20,
      file: false,
    },
  ]
  for (const assignment of assignments) {
    const fileId = assignment.file ? await uploadPdf(`enonce-${assignment.id}`, assignment.title) : ''
    const state = await upsert('academic_assignments', assignment.id, {
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.course.id,
      courseCode: assignment.course.code,
      teacherId: DEMO_TEACHER.id,
      teacherName: assignment.course.teacher,
      type: assignment.type,
      status: 'PUBLISHED',
      dueDate: assignment.due,
      publishedAt: new Date().toISOString(),
      maxScore: assignment.maxScore,
      allowLate: true,
      quizJson: assignment.quiz || '',
      fileId,
      fileName: fileId ? `${assignment.title}.pdf` : '',
      audience,
    }, [`read("users")`])
    console.log(`  ${assignment.title} (${state})`)
  }

  console.log('\nJeu de données académique en place.')
}

function program_matricule(index) {
  return String(index + 1).padStart(4, '0')
}

await main()
