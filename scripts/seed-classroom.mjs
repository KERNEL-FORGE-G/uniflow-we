/**
 * Une vraie salle de classe de démonstration : ICT4D L1, Faculté des Sciences,
 * Université de Yaoundé I.
 *
 * Demande du propriétaire (2026-09-21) : « créer des comptes test pour les
 * différents comptes afin de simuler une véritable salle avec délégué,
 * étudiants et enseignant, devoirs et tout le reste ». Les comptes de
 * `seed-accounts.mjs` (un par rôle) et le jeu académique de
 * `seed-academic-demo.mjs` (cours, emploi du temps, devoirs) ne suffisaient
 * pas : un enseignant ouvrait un cours sans étudiant inscrit, une feuille de
 * présence vide et aucun rendu à corriger.
 *
 * Ce script ajoute, de façon idempotente (identifiants fixes) :
 *  - deux enseignants supplémentaires (Dr. Nkolo — ICT102, M. Essomba — ICT105)
 *    et huit étudiantes/étudiants de L1, tous UNIVERSITY / UY1 / ICT4D ;
 *  - les inscriptions de chaque étudiant (et du délégué) aux six UE de L1 ;
 *  - les `teacherId` réels sur les cours et les devoirs, pour que les
 *    tableaux de bord enseignants montrent « leurs » cours et rendus ;
 *  - trois semaines de séances de présence avec relevés (présents, retards,
 *    absences, justifiés) ;
 *  - des rendus de devoirs (TD rendu et corrigé, quiz complétés, PDF déposé) ;
 *  - les notes des nouveaux étudiants (même barème que le jeu de démo) ;
 *  - des conversations délégué ↔ enseignants / étudiants avec messages ;
 *  - des publications de forum avec réactions ;
 *  - des notifications réalistes pour chacun.
 *
 * Les mots de passe sont générés à la première exécution et écrits dans
 * `uniflow-backend/.comptes-classe.local` (ignoré par Git) — jamais dans un
 * fichier versionné ni dans un `.env` client.
 *
 * Usage : node scripts/seed-classroom.mjs
 *         node scripts/seed-classroom.mjs --purge-qa   (supprime aussi les comptes
 *         `qa-*@example.invalid` laissés par d'anciennes vérifications)
 */

import { createHash, randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createClient, databaseId, requireConfig } from './appwrite-env.mjs'

requireConfig()
const request = createClient()

const UNIVERSITY = 'Université de Yaoundé I'
const FACULTY = 'Faculté des Sciences'
const PROGRAM = 'ICT4D'
const LEVEL = 'L1'
const CREDENTIALS_FILE = new URL('../../uniflow-backend/.comptes-classe.local', import.meta.url)
const PURGE_QA = process.argv.includes('--purge-qa') || process.argv.includes('--only-purge-qa')
const ONLY_PURGE_QA = process.argv.includes('--only-purge-qa')

const scope = (level = '') => ({ university: UNIVERSITY, faculty: FACULTY, program: PROGRAM, level })

/** Comptes déjà créés par seed-accounts.mjs, réutilisés tels quels. */
const EXISTING = {
  teacherFouda: { id: 'uy1-teacher-01', name: 'Pr. Fouda' },
  delegate: { id: 'uy1-delegate-l1', name: 'Délégué ICT4D L1' },
  studentOne: { id: 'uy1-student-l1', name: 'Étudiante ICT4D L1' },
}

/** Nouveaux comptes de la salle. `id` = identifiant Appwrite ET du document `users`. */
export const classroomAccounts = [
  { id: 'uy1-teacher-02', email: 'enseignant.nkolo@uniflow.test', name: 'Dr. Nkolo', username: 'dr.nkolo', role: 'TEACHER', ...scope(), matricule: '' },
  { id: 'uy1-teacher-03', email: 'enseignant.essomba@uniflow.test', name: 'M. Essomba', username: 'm.essomba', role: 'TEACHER', ...scope(), matricule: '' },
  { id: 'uy1-l1-etu-03', email: 'amina.ngo@uniflow.test', name: 'Amina Ngo Bassong', username: 'amina.ngo', role: 'STUDENT', ...scope(LEVEL), matricule: 'UY1-ICT4D-L1-2026-003' },
  { id: 'uy1-l1-etu-04', email: 'boris.tchoupo@uniflow.test', name: 'Boris Tchoupo', username: 'boris.tchoupo', role: 'STUDENT', ...scope(LEVEL), matricule: 'UY1-ICT4D-L1-2026-004' },
  { id: 'uy1-l1-etu-05', email: 'clarisse.mbianda@uniflow.test', name: 'Clarisse Mbianda', username: 'clarisse.mbianda', role: 'STUDENT', ...scope(LEVEL), matricule: 'UY1-ICT4D-L1-2026-005' },
  { id: 'uy1-l1-etu-06', email: 'dieudonne.fotso@uniflow.test', name: 'Dieudonné Fotso', username: 'dieudonne.fotso', role: 'STUDENT', ...scope(LEVEL), matricule: 'UY1-ICT4D-L1-2026-006' },
  { id: 'uy1-l1-etu-07', email: 'esther.nkeng@uniflow.test', name: 'Esther Nkeng', username: 'esther.nkeng', role: 'STUDENT', ...scope(LEVEL), matricule: 'UY1-ICT4D-L1-2026-007' },
  { id: 'uy1-l1-etu-08', email: 'franck.abega@uniflow.test', name: 'Franck Abega', username: 'franck.abega', role: 'STUDENT', ...scope(LEVEL), matricule: 'UY1-ICT4D-L1-2026-008' },
  { id: 'uy1-l1-etu-09', email: 'grace.ewane@uniflow.test', name: 'Grâce Ewane', username: 'grace.ewane', role: 'STUDENT', ...scope(LEVEL), matricule: 'UY1-ICT4D-L1-2026-009' },
  { id: 'uy1-l1-etu-10', email: 'herve.kamdem@uniflow.test', name: 'Hervé Kamdem', username: 'herve.kamdem', role: 'STUDENT', ...scope(LEVEL), matricule: 'UY1-ICT4D-L1-2026-010' },
]

/** Cours de L1 (créés par seed-academic-demo.mjs) et leur enseignant réel. */
const COURSES = [
  { id: 'ict101', code: 'ICT101', teacherId: EXISTING.teacherFouda.id, teacherName: 'Pr. Fouda' },
  { id: 'ict102', code: 'ICT102', teacherId: 'uy1-teacher-02', teacherName: 'Dr. Nkolo' },
  { id: 'ict103', code: 'ICT103', teacherId: '', teacherName: 'Dr. Atangana' },
  { id: 'ict104', code: 'ICT104', teacherId: EXISTING.teacherFouda.id, teacherName: 'Pr. Fouda' },
  { id: 'ict105', code: 'ICT105', teacherId: 'uy1-teacher-03', teacherName: 'M. Essomba' },
  { id: 'ict106', code: 'ICT106', teacherId: '', teacherName: 'Mme Bilé' },
]

/** Devoirs du jeu de démo, rattachés à leur enseignant réel. */
const ASSIGNMENTS = [
  { id: 'devoir-quiz-bdd', courseId: 'ict104', teacherId: EXISTING.teacherFouda.id, teacherName: 'Pr. Fouda' },
  { id: 'devoir-pdf-algo', courseId: 'ict102', teacherId: 'uy1-teacher-02', teacherName: 'Dr. Nkolo' },
  { id: 'devoir-td-web', courseId: 'ict105', teacherId: 'uy1-teacher-03', teacherName: 'M. Essomba' },
]

/** Créneaux d'appel de la semaine : (jour ISO 1 = lundi, cours, qui fait l'appel). */
const ATTENDANCE_SLOTS = [
  { weekday: 1, courseId: 'ict101', hour: 8, createdBy: EXISTING.delegate.id },
  { weekday: 1, courseId: 'ict102', hour: 10, createdBy: 'uy1-teacher-02' },
  { weekday: 3, courseId: 'ict104', hour: 8, createdBy: EXISTING.teacherFouda.id },
  { weekday: 4, courseId: 'ict102', hour: 8, createdBy: 'uy1-teacher-02' },
  { weekday: 5, courseId: 'ict104', hour: 9, createdBy: EXISTING.teacherFouda.id },
]

const evaluations = [
  { suffix: 'cc1', title: 'Contrôle continu 1', type: 'CC', scores: [14.5, 12, 16, 9.5, 13, 11, 15.5] },
  { suffix: 'tp', title: 'Travaux pratiques', type: 'TP', scores: [16, 14, 12.5, 11, 17, 13.5, 15] },
  { suffix: 'partiel', title: 'Examen partiel', type: 'EXAM', scores: [12, 9.5, 14, 8, 15, 10.5, 13] },
]

// ─── Outils ──────────────────────────────────────────────────────────────

function loadCredentials() {
  if (!existsSync(CREDENTIALS_FILE)) return {}
  const values = {}
  for (const line of readFileSync(CREDENTIALS_FILE, 'utf8').split('\n')) {
    const match = /^([^#=\s]+)=(.*)$/.exec(line.trim())
    if (match) values[match[1]] = match[2]
  }
  return values
}

function saveCredentials(values) {
  const lines = [
    '# Salle de classe ICT4D L1 de démonstration — généré par uniflow-we/scripts/seed-classroom.mjs',
    '# Fichier ignoré par Git. Ne jamais recopier ces valeurs dans un dépôt ni dans un .env client.',
    ...classroomAccounts.map((account) => `${account.email}=${values[account.email]}`),
  ]
  writeFileSync(CREDENTIALS_FILE, `${lines.join('\n')}\n`, { mode: 0o600 })
}

function generatePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!$%*+-=?'
  return Array.from(randomBytes(20), (byte) => alphabet[byte % alphabet.length]).join('')
}

const owner = (userId) => [`read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`]
const readUsers = ['read("users")']

/** Même fabrique d'identifiants que la Function attendance-secure : un appel manuel ultérieur retombe sur la même séance. */
const deterministicId = (prefix, value) => `${prefix}_${createHash('sha256').update(value).digest('hex').slice(0, 24)}`
/** Même identifiant de conversation que la Function messaging (paire triée puis hachée). */
function conversationIdFor(first, second) {
  const [a, b] = [first, second].sort()
  return { id: `conv_${createHash('sha256').update(`${a}:${b}`).digest('hex').slice(0, 28)}`, a, b }
}
/** Pseudo-aléa stable : la même graine donne toujours la même salle. */
function roll(seed) {
  return parseInt(createHash('sha256').update(seed).digest('hex').slice(0, 8), 16) / 0xffffffff
}

async function upsert(collectionId, documentId, data, permissions) {
  const created = await request('POST', `/databases/${databaseId}/collections/${collectionId}/documents`, { documentId, data, permissions })
  if (created.status === 201) return 'créé'
  if (created.status === 409) {
    const updated = await request('PATCH', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, { data, permissions })
    if (updated.status >= 400) console.warn(`  ! ${collectionId}/${documentId} : ${updated.payload?.message}`)
    return 'mis à jour'
  }
  console.warn(`  ! ${collectionId}/${documentId} : ${created.payload?.message}`)
  return 'échec'
}

async function patch(collectionId, documentId, data) {
  const updated = await request('PATCH', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, { data })
  if (updated.status >= 400) console.warn(`  ! ${collectionId}/${documentId} : ${updated.payload?.message}`)
  return updated.status < 400
}

/** Un lundi 08:00 (heure de Yaoundé, UTC+1) `weeksAgo` semaines avant cette semaine, décalé au jour voulu. */
function sessionDate(weeksAgo, weekday, hour) {
  const now = new Date()
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const isoDay = monday.getUTCDay() === 0 ? 7 : monday.getUTCDay()
  monday.setUTCDate(monday.getUTCDate() - (isoDay - 1) - weeksAgo * 7)
  const date = new Date(monday)
  date.setUTCDate(monday.getUTCDate() + (weekday - 1))
  date.setUTCHours(hour - 1, 0, 0, 0)
  return date
}

// ─── Étapes ──────────────────────────────────────────────────────────────

async function ensureAccount(account, password) {
  const created = await request('POST', '/users', { userId: account.id, email: account.email, password, name: account.name })
  if (created.status >= 400 && created.status !== 409) {
    console.warn(`  ! compte ${account.email} : ${created.payload?.message}`)
  }
  await request('PATCH', `/users/${account.id}/prefs`, { prefs: { uniflowAccountType: 'UNIVERSITY' } })
  // Label Appwrite = preuve du rôle (voir seed-accounts.mjs) ; un étudiant n'en a aucun.
  await request('PUT', `/users/${account.id}/labels`, { labels: account.role === 'STUDENT' ? [] : [account.role] })

  const profileState = await upsert('users', account.id, {
    email: account.email,
    name: account.name,
    username: account.username,
    accountType: 'UNIVERSITY',
    role: account.role,
    university: account.university,
    faculty: account.faculty,
    program: account.program,
    ...(account.level ? { level: account.level } : { level: null }),
    country: 'Cameroun',
  }, owner(account.id))

  const directoryState = await upsert('academic_directory', `directory_${account.id}`, {
    userId: account.id,
    name: account.name,
    role: account.role,
    university: account.university,
    faculty: account.faculty,
    program: account.program,
    level: account.level || '',
    matricule: account.matricule,
    status: 'ACTIVE',
  }, ['read("users")', `update("user:${account.id}")`])

  console.log(`  ${account.role.padEnd(8)} ${account.email.padEnd(36)} compte ${created.status === 201 ? 'créé' : 'existant'}, profil ${profileState}, annuaire ${directoryState}`)
}

/** Suppression tolérante : le client de script lève une erreur sur 404, or un document annexe peut déjà manquer. */
async function remove(path) {
  try {
    await request('DELETE', path)
    return true
  } catch (error) {
    if (!String(error.message).includes('(404)')) throw error
    return false
  }
}

async function purgeQaAccounts() {
  console.log('\n— Nettoyage des comptes de vérification (qa-*@example.invalid)')
  const list = await request('GET', `/users?search=${encodeURIComponent('example.invalid')}`)
  for (const user of list.payload?.users || []) {
    if (!String(user.email).endsWith('@example.invalid')) continue
    await remove(`/databases/${databaseId}/collections/users/documents/${user.$id}`)
    await remove(`/databases/${databaseId}/collections/academic_directory/documents/directory_${user.$id}`)
    const removed = await remove(`/users/${user.$id}`)
    console.log(`  ${user.email} ${removed ? 'supprimé' : 'déjà absent'}`)
  }
}

async function main() {
  if (ONLY_PURGE_QA) { await purgeQaAccounts(); return }
  const credentials = loadCredentials()
  let generated = 0
  for (const account of classroomAccounts) {
    if (!credentials[account.email]) { credentials[account.email] = generatePassword(); generated += 1 }
  }
  saveCredentials(credentials)

  console.log('— Comptes de la salle')
  for (const account of classroomAccounts) await ensureAccount(account, credentials[account.email])
  console.log(`  ${classroomAccounts.length} compte(s), ${generated} mot(s) de passe généré(s) → ${fileURLToPath(CREDENTIALS_FILE)}`)

  const students = [
    EXISTING.delegate,
    EXISTING.studentOne,
    ...classroomAccounts.filter((account) => account.role === 'STUDENT').map(({ id, name }) => ({ id, name })),
  ]
  const teachersById = Object.fromEntries([
    [EXISTING.teacherFouda.id, EXISTING.teacherFouda.name],
    ...classroomAccounts.filter((account) => account.role === 'TEACHER').map((account) => [account.id, account.name]),
  ])

  console.log('\n— Enseignants réels sur les cours et les devoirs')
  for (const course of COURSES) {
    const ok = await patch('academic_courses', course.id, { teacherId: course.teacherId, teacherName: course.teacherName })
    console.log(`  ${course.code} → ${course.teacherName}${course.teacherId ? '' : ' (sans compte)'} ${ok ? '' : '!'}`)
  }
  for (const assignment of ASSIGNMENTS) {
    await patch('academic_assignments', assignment.id, { teacherId: assignment.teacherId, teacherName: assignment.teacherName })
  }

  console.log('\n— Inscriptions aux UE')
  let enrollments = 0
  for (const student of students) {
    for (const course of COURSES) {
      await upsert('academic_enrollments', `enr-${student.id}-${course.id}`.slice(0, 36), { studentId: student.id, courseId: course.id, status: 'ACTIVE' }, readUsers)
      enrollments += 1
    }
  }
  console.log(`  ${enrollments} inscription(s) (${students.length} étudiants × ${COURSES.length} UE)`)

  console.log('\n— Présences (trois dernières semaines)')
  let sessions = 0
  let records = 0
  for (const weeksAgo of [3, 2, 1]) {
    for (const slot of ATTENDANCE_SLOTS) {
      const date = sessionDate(weeksAgo, slot.weekday, slot.hour)
      if (date > new Date()) continue
      const dateKey = date.toISOString().slice(0, 10)
      const sessionId = deterministicId('ses', `${slot.courseId}:${dateKey}`)
      await upsert('attendance_sessions', sessionId, { courseId: slot.courseId, date: date.toISOString(), createdBy: slot.createdBy }, ['read("users")', ...owner(slot.createdBy).slice(1)])
      sessions += 1
      for (const student of students) {
        const r = roll(`${sessionId}:${student.id}`)
        const status = r < 0.8 ? 'PRESENT' : r < 0.9 ? 'RETARD' : r < 0.97 ? 'ABSENT' : 'JUSTIFIE'
        await upsert('attendance_records', deterministicId('att', `${sessionId}:${student.id}`), {
          sessionId,
          courseId: slot.courseId,
          studentId: student.id,
          status,
          verificationMethod: 'MANUAL',
          proximityStatus: 'NOT_REQUIRED',
          proximityDistanceMeters: -1,
          locationAccuracyMeters: -1,
          verifiedAt: new Date(date.getTime() + 10 * 60 * 1000).toISOString(),
        }, ['read("users")', ...owner(slot.createdBy).slice(1)])
        records += 1
      }
    }
  }
  console.log(`  ${sessions} séance(s), ${records} relevé(s)`)

  console.log('\n— Rendus de devoirs')
  const day = 24 * 60 * 60 * 1000
  const submissionPermissions = (studentId, teacherId) => [...owner(studentId), `read("user:${teacherId}")`, `update("user:${teacherId}")`]
  // TD 2 (ICT105, M. Essomba) : sept rendus, quatre déjà corrigés.
  const tdSubmitters = students.slice(0, 7)
  for (const [index, student] of tdSubmitters.entries()) {
    const graded = index < 4
    const score = [15, 12.5, 17, 9][index]
    await upsert('academic_submissions', `sub-td-web-${student.id}`.slice(0, 36), {
      assignmentId: 'devoir-td-web',
      studentId: student.id,
      studentName: student.name,
      submittedAt: new Date(Date.now() - (2 + index % 3) * day).toISOString(),
      answersJson: JSON.stringify({ note: 'Formulaire HTML avec validation JS, capture jointe en commentaire.' }),
      fileId: '',
      fileName: '',
      ...(graded ? { score, feedback: score >= 12 ? 'Bon travail : validation claire, pensez aux messages d’erreur accessibles.' : 'Le formulaire fonctionne mais la validation côté client est incomplète. À revoir avant l’examen.', status: 'GRADED', gradedAt: new Date(Date.now() - day).toISOString() } : { status: 'SUBMITTED' }),
    }, submissionPermissions(student.id, 'uy1-teacher-03'))
  }
  // Quiz BDD (ICT104, Pr. Fouda) : six étudiants l'ont passé, correction automatique.
  const quizAnswers = [
    { q1: [1], q2: [0, 1, 2], q3: 'atomicité' },
    { q1: [1], q2: [0, 1], q3: 'atomicité' },
    { q1: [3], q2: [0, 1, 2], q3: 'isolation' },
    { q1: [1], q2: [0, 1, 2], q3: 'Atomicité' },
    { q1: [1], q2: [0, 2], q3: '' },
    { q1: [0], q2: [3], q3: 'durabilité' },
  ]
  const quizScores = [7, 4, 3, 7, 2, 0]
  for (const [index, student] of students.slice(1, 7).entries()) {
    await upsert('academic_submissions', `sub-quiz-bdd-${student.id}`.slice(0, 36), {
      assignmentId: 'devoir-quiz-bdd',
      studentId: student.id,
      studentName: student.name,
      submittedAt: new Date(Date.now() - (1 + index % 2) * day).toISOString(),
      answersJson: JSON.stringify(quizAnswers[index]),
      score: quizScores[index],
      feedback: 'Correction automatique.',
      status: 'GRADED',
      gradedAt: new Date(Date.now() - (1 + index % 2) * day).toISOString(),
    }, submissionPermissions(student.id, EXISTING.teacherFouda.id))
  }
  // Devoir maison PDF (ICT102, Dr. Nkolo) : deux dépôts, pas encore corrigés.
  for (const student of students.slice(2, 4)) {
    await upsert('academic_submissions', `sub-pdf-algo-${student.id}`.slice(0, 36), {
      assignmentId: 'devoir-pdf-algo',
      studentId: student.id,
      studentName: student.name,
      submittedAt: new Date(Date.now() - day / 2).toISOString(),
      answersJson: '',
      fileId: 'enonce-devoir-pdf-algo',
      fileName: `Tris-${student.name.split(' ')[0]}.pdf`,
      status: 'SUBMITTED',
    }, submissionPermissions(student.id, 'uy1-teacher-02'))
  }
  console.log(`  ${tdSubmitters.length} rendus TD (4 corrigés), 6 quiz corrigés, 2 PDF déposés`)

  console.log('\n— Notes des nouveaux étudiants')
  const newStudents = classroomAccounts.filter((account) => account.role === 'STUDENT')
  for (const [studentIndex, student] of newStudents.entries()) {
    for (const [courseIndex, course] of COURSES.entries()) {
      for (const evaluation of evaluations) {
        const score = evaluation.scores[(studentIndex + 2 + courseIndex) % evaluation.scores.length]
        await upsert('academic_grades', `${student.id}-${course.id}-${evaluation.suffix}`.slice(0, 36), {
          studentId: student.id,
          courseId: course.id,
          courseCode: course.code,
          evaluationTitle: `${evaluation.title} — ${course.code}`,
          type: evaluation.type,
          score,
          maxScore: 20,
          coefficient: evaluation.type === 'EXAM' ? 2 : 1,
        }, readUsers)
      }
    }
  }
  console.log(`  ${newStudents.length * COURSES.length * evaluations.length} note(s)`)

  console.log('\n— Messagerie')
  const conversations = [
    {
      between: [EXISTING.delegate.id, EXISTING.teacherFouda.id],
      messages: [
        [EXISTING.delegate.id, 'Bonjour Professeur, la salle B07 est occupée mercredi 8h par un examen de Physique. Peut-on basculer en Amphi 150 ?'],
        [EXISTING.teacherFouda.id, 'Bonjour. Oui, Amphi 150 convient. Prévenez la promotion et pensez à la feuille de présence.'],
        [EXISTING.delegate.id, 'C’est fait, l’annonce est publiée et l’emploi du temps corrigé. Merci !'],
        [EXISTING.teacherFouda.id, 'Parfait. Les corrections du quiz BDD sont disponibles dans Devoirs.'],
      ],
    },
    {
      between: [EXISTING.delegate.id, 'uy1-teacher-02'],
      messages: [
        [EXISTING.delegate.id, 'Dr Nkolo, plusieurs étudiants demandent un délai pour le devoir sur les tris (PDF).'],
        ['uy1-teacher-02', 'Rendu accepté jusqu’à dimanche minuit, sans pénalité. Au-delà, -2 points par jour.'],
      ],
    },
    {
      between: [EXISTING.delegate.id, 'uy1-l1-etu-03'],
      messages: [
        ['uy1-l1-etu-03', 'Salut ! Tu as le lien du groupe de révision pour le CC de maths ?'],
        [EXISTING.delegate.id, 'Oui, regarde le forum : Grâce a créé le sujet « Révision maths pour l’informatique ». On se voit jeudi 13h Amphi 150.'],
        ['uy1-l1-etu-03', 'Top, merci Délégué !'],
      ],
    },
    {
      between: ['uy1-l1-etu-04', EXISTING.delegate.id],
      messages: [
        ['uy1-l1-etu-04', 'Je n’arrive pas à ouvrir l’énoncé du TD 2 hors ligne, il dit « fichier non téléchargé ».'],
        [EXISTING.delegate.id, 'Ouvre-le une fois avec du réseau : il reste ensuite en cache un mois. Sinon je te l’envoie ici.'],
      ],
    },
  ]
  for (const conversation of conversations) {
    const { id, a, b } = conversationIdFor(...conversation.between)
    const base = Date.now() - 3 * day
    let lastMessage = ''
    let lastMessageAt = ''
    for (const [index, [senderId, body]] of conversation.messages.entries()) {
      const createdAt = new Date(base + index * 40 * 60 * 1000).toISOString()
      await upsert('chat_messages', `${id}-m${index + 1}`.slice(0, 36), {
        conversationId: id,
        senderId,
        body,
        createdAt,
        readByA: true,
        readByB: index < conversation.messages.length - 1,
        kind: 'text',
        urgent: false,
      }, [`read("user:${a}")`, `read("user:${b}")`])
      lastMessage = body
      lastMessageAt = createdAt
    }
    await upsert('chat_conversations', id, { participantA: a, participantB: b, lastMessage, lastMessageAt }, [`read("user:${a}")`, `read("user:${b}")`])
  }
  console.log(`  ${conversations.length} conversation(s), ${conversations.reduce((n, c) => n + c.messages.length, 0)} message(s)`)

  console.log('\n— Forum')
  const posts = [
    { id: 'post-classe-td2', authorId: EXISTING.delegate.id, authorName: EXISTING.delegate.name, role: 'DELEGATE', title: 'Rappel : TD 2 Formulaire HTML à rendre jeudi', content: 'Le TD 2 de Développement web (M. Essomba) est à rendre jeudi avant minuit dans Devoirs. Rendu en photo ou PDF accepté. Pensez à la validation côté client !', category: 'Annonces', likes: 6, daysAgo: 2 },
    { id: 'post-classe-sql', authorId: 'uy1-l1-etu-04', authorName: 'Boris Tchoupo', role: 'STUDENT', title: 'Différence entre WHERE et HAVING ?', content: 'Dans le quiz BDD je me suis trompé : quand utilise-t-on HAVING plutôt que WHERE ? Un exemple concret m’aiderait.', category: 'Questions', likes: 3, daysAgo: 1 },
    { id: 'post-classe-maths', authorId: 'uy1-l1-etu-09', authorName: 'Grâce Ewane', role: 'STUDENT', title: 'Révision maths pour l’informatique — jeudi 13h', content: 'On se retrouve jeudi à 13h en Amphi 150 pour réviser l’algèbre linéaire avant le CC. Apportez la fiche de révision de la bibliothèque.', category: 'Entraide', likes: 8, daysAgo: 3 },
    { id: 'post-classe-cc1', authorId: EXISTING.teacherFouda.id, authorName: EXISTING.teacherFouda.name, role: 'TEACHER', title: 'Corrections du CC1 — ICT104 disponibles', content: 'Les notes du contrôle continu 1 de Bases de données sont publiées. Moyenne de la promotion : 12,8/20. Séance de correction mercredi.', category: 'Annonces', likes: 11, daysAgo: 4 },
  ]
  for (const post of posts) {
    await upsert('forum_posts', post.id, {
      authorId: post.authorId,
      authorName: post.authorName,
      role: post.role,
      university: UNIVERSITY,
      title: post.title,
      content: post.content,
      category: post.category,
      rating: 0,
      likes: post.likes,
      createdAt: new Date(Date.now() - post.daysAgo * day).toISOString(),
    }, ['read("any")', ...owner(post.authorId)])
    for (const student of students.slice(0, post.likes)) {
      await upsert('forum_reactions', `rx-${post.id.replace('post-classe-', '')}-${student.id}`.slice(0, 36), { postId: post.id, userId: student.id, createdAt: new Date(Date.now() - post.daysAgo * day + 3600_000).toISOString() }, owner(student.id))
    }
  }
  console.log(`  ${posts.length} publication(s) avec réactions`)

  console.log('\n— Notifications')
  let notifications = 0
  const notify = async (ownerId, eventKey, type, title, message, link = '') => {
    await upsert('notifications', deterministicId('ntf', `${ownerId}:${eventKey}`), {
      ownerId, type, title, message, isRead: false, createdAt: new Date(Date.now() - day).toISOString(), eventKey, link,
    }, owner(ownerId))
    notifications += 1
  }
  for (const student of students) {
    await notify(student.id, 'classe-td2', 'ASSIGNMENT', 'Nouveau devoir : TD 2 — Formulaire HTML', 'M. Essomba a publié un TD à rendre jeudi. Rendu en photo ou PDF.', '/assignments')
    await notify(student.id, 'classe-amphi150', 'SCHEDULE', 'Cours ICT104 déplacé', 'Mercredi 8h : Bases de données a lieu en Amphi 150 (au lieu de B07).', '/schedule')
  }
  await notify('uy1-teacher-03', 'classe-rendus-td2', 'SUBMISSION', '7 rendus reçus pour TD 2', 'Sept étudiants ont rendu le TD 2 ; trois restent à corriger.', '/assignments')
  await notify(EXISTING.teacherFouda.id, 'classe-quiz-bdd', 'SUBMISSION', 'Quiz BDD : 6 participations', 'Six étudiants ont passé le quiz ; moyenne 3,8/7.', '/assignments')
  await notify(EXISTING.delegate.id, 'classe-absences', 'ATTENDANCE', 'Relevé de présence à vérifier', 'Deux absences non justifiées cette semaine en ICT102.', '/attendance')
  console.log(`  ${notifications} notification(s)`)

  if (PURGE_QA) await purgeQaAccounts()

  console.log('\nSalle ICT4D L1 en place : 3 enseignants, 1 délégué, 9 étudiants, présences, rendus, messages, forum et notifications.')
}

await main()
