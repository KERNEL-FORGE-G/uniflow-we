const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const password = process.env.APPWRITE_DEMO_USER_PASSWORD
const databaseId = 'uniflow'

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour le seed.')
if (!password || password.length < 15) throw new Error('APPWRITE_DEMO_USER_PASSWORD doit être fourni et comporter au moins 15 caractères.')

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
}

async function request(method, path, body, accepted = [200, 201, 202, 204, 409]) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : {}
  if (!accepted.includes(response.status)) throw new Error(`${method} ${path} a échoué (${response.status}) : ${payload.message || text}`)
  return { status: response.status, payload }
}

const string = (key, size, required = false, defaultValue) => ({ type: 'string', body: { key, size, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false, encrypt: false } })
const integer = (key, required = false, defaultValue) => ({ type: 'integer', body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false, min: undefined, max: undefined } })
const enumeration = (key, elements, required = false, defaultValue) => ({ type: 'enum', body: { key, elements, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false } })
const boolean = (key, required = false, defaultValue) => ({ type: 'boolean', body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false } })
const datetime = (key, required = false, defaultValue) => ({ type: 'datetime', body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false } })

async function waitForAttribute(collectionId, key) {
  for (let attempt = 0; attempt < 35; attempt += 1) {
    const result = await request('GET', `/databases/${databaseId}/collections/${collectionId}/attributes/${key}`, undefined, [200, 404])
    if (result.status === 200 && result.payload.status === 'available') return
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`L’attribut ${collectionId}.${key} n’est pas devenu disponible.`)
}

async function ensureCollection(schema) {
  await request('POST', `/databases/${databaseId}/collections`, {
    collectionId: schema.id,
    name: schema.name,
    permissions: ['create("users")'],
    documentSecurity: true,
    enabled: true,
  })

  for (const attribute of schema.attributes) {
    const existing = await request('GET', `/databases/${databaseId}/collections/${schema.id}/attributes/${attribute.body.key}`, undefined, [200, 404])
    if (existing.status === 404) await request('POST', `/databases/${databaseId}/collections/${schema.id}/attributes/${attribute.type}`, attribute.body)
    await waitForAttribute(schema.id, attribute.body.key)
  }
  for (const index of schema.indexes || []) {
    await request('POST', `/databases/${databaseId}/collections/${schema.id}/indexes`, index)
  }
}

const schemas = [
  {
    id: 'academic_courses', name: 'Cours universitaires',
    attributes: [
      string('code', 64, true), string('name', 255, true), string('description', 5000, false, ''),
      string('university', 255, true), string('program', 100, true), enumeration('level', ['L1'], true),
      string('teacherId', 36, false, ''), string('teacherName', 255, false, ''), integer('credits', false, 0),
      integer('hours', false, 0), string('classroom', 100, false, ''), string('type', 32, false, 'CM'),
    ],
    indexes: [{ key: 'course_scope', type: 'key', attributes: ['program', 'level'] }],
  },
  {
    id: 'academic_enrollments', name: 'Inscriptions universitaires',
    attributes: [string('studentId', 36, true), string('courseId', 64, true), string('status', 32, false, 'ACTIVE')],
    indexes: [{ key: 'enrollment_student', type: 'key', attributes: ['studentId'] }, { key: 'enrollment_course', type: 'key', attributes: ['courseId'] }],
  },
  {
    id: 'academic_schedules', name: 'Emplois du temps universitaires',
    attributes: [
      string('courseId', 64, true), string('courseCode', 64, true), string('dayOfWeek', 16, true),
      string('startTime', 8, true), string('endTime', 8, true), string('classroom', 100, true), string('type', 32, false, 'CM'),
    ],
    indexes: [{ key: 'schedule_course', type: 'key', attributes: ['courseId'] }],
  },
  {
    id: 'academic_library', name: 'Bibliothèque universitaire',
    attributes: [
      string('title', 255, true), string('courseId', 64, true), string('course', 255, true),
      string('type', 64, true), string('category', 32, true), string('size', 32, false, ''),
      string('description', 5000, false, ''), string('fileId', 36, false, ''), string('publishedAt', 64, true),
    ],
    indexes: [{ key: 'library_course', type: 'key', attributes: ['courseId'] }, { key: 'library_category', type: 'key', attributes: ['category'] }],
  },
  {
    id: 'academic_directory', name: 'Répertoire universitaire',
    attributes: [
      string('userId', 36, true), string('name', 255, true), enumeration('role', ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN'], true),
      string('university', 255, true), string('program', 100, true), enumeration('level', ['L1'], true),
      string('matricule', 64, false, ''), string('status', 32, false, 'ACTIVE'),
    ],
    indexes: [{ key: 'directory_role', type: 'key', attributes: ['role'] }, { key: 'directory_user', type: 'unique', attributes: ['userId'] }],
  },
  {
    id: 'academic_assignments', name: 'Devoirs universitaires',
    attributes: [
      string('courseId', 64, true), string('courseCode', 64, true), string('studentId', 36, true), string('title', 255, true),
      string('description', 5000, false, ''), string('dueDate', 64, true), string('status', 32, false, 'À rendre'),
      string('grade', 32, false, ''), string('feedback', 5000, false, ''), string('submittedAt', 64, false, ''),
      string('submittedFile', 255, false, ''), string('submissionNote', 5000, false, ''),
    ],
    indexes: [{ key: 'assignment_student', type: 'key', attributes: ['studentId'] }, { key: 'assignment_course', type: 'key', attributes: ['courseId'] }],
  },
  {
    id: 'academic_grades', name: 'Notes universitaires',
    attributes: [
      string('studentId', 36, true), string('courseId', 64, true), string('courseCode', 64, true), string('evaluationTitle', 255, true),
      string('type', 64, false, 'CC'), integer('score', true), integer('maxScore', false, 20), integer('coefficient', false, 1),
    ],
    indexes: [{ key: 'grade_student', type: 'key', attributes: ['studentId'] }, { key: 'grade_course', type: 'key', attributes: ['courseId'] }],
  },
  {
    id: 'attendance_sessions', name: 'Séances de présence universitaires',
    attributes: [string('courseId', 64, true), datetime('date', true), string('createdBy', 36, false, '')],
    indexes: [{ key: 'attendance_session_course', type: 'key', attributes: ['courseId'] }],
  },
  {
    id: 'attendance_records', name: 'Présences universitaires',
    attributes: [
      string('sessionId', 64, true), string('courseId', 64, true), string('studentId', 36, true),
      enumeration('status', ['PRESENT', 'ABSENT', 'RETARD', 'JUSTIFIE'], true),
    ],
    indexes: [{ key: 'attendance_record_student', type: 'key', attributes: ['studentId'] }, { key: 'attendance_record_session', type: 'key', attributes: ['sessionId'] }],
  },
  {
    id: 'subscription_plans', name: 'Formules UniFlow',
    attributes: [
      string('code', 64, true), string('name', 255, true), enumeration('category', ['PERSONAL', 'TEACHER', 'INSTITUTION', 'ACADEMIC'], true),
      string('countryCode', 8, true), enumeration('currency', ['XAF', 'EUR', 'USD'], true), integer('priceMonthlyAmount', true),
      integer('priceAnnuallyAmount', true), string('period', 64, false, 'Accès académique'), string('badge', 100, false, ''),
      boolean('highlight', false, false), string('description', 5000, true), string('providers', 500, false, '[]'), string('status', 32, true),
    ],
    indexes: [{ key: 'subscription_plan_code', type: 'unique', attributes: ['code'] }, { key: 'subscription_plan_status', type: 'key', attributes: ['status'] }],
  },
  {
    id: 'subscription_statuses', name: 'Statuts de souscription UniFlow',
    attributes: [
      string('userId', 36, true), enumeration('status', ['NONE', 'ACTIVE'], true), string('planCode', 64, false, ''),
      string('countryCode', 8, false, 'CM'), enumeration('currency', ['XAF', 'EUR', 'USD'], false, 'XAF'), integer('monthlyAmount', false, 0),
      datetime('currentPeriodEnd', false), boolean('isAutoRenew', false, false),
    ],
    indexes: [{ key: 'subscription_status_user', type: 'unique', attributes: ['userId'] }],
  },
]

const demoUsers = [
  { id: 'demo_uy1_student_01', email: 'etudiant.ict4d.l1@uniflow.test', name: 'Étudiant ICT4D L1', role: 'STUDENT' },
  { id: 'demo_uy1_delegate_01', email: 'delegue.ict4d.l1@uniflow.test', name: 'Délégué ICT4D L1', role: 'DELEGATE' },
  { id: 'demo_uy1_teacher_01', email: 'enseignant.algorithmique@uniflow.test', name: 'Enseignant Algorithmique', role: 'TEACHER' },
  { id: 'demo_uy1_admin_01', email: 'admin.uy1.ict4d@uniflow.test', name: 'Administrateur ICT4D', role: 'ADMIN' },
]

const courses = [
  ['ICT101', 'Fondamentaux du numérique', 'Panorama des usages et infrastructures numériques.', 4, 30, 'Amphi 1', 'LUNDI', '08:00', '10:00', 'CM'],
  ['ICT102', 'Algorithmique et programmation I', 'Conception d’algorithmes et bases de la programmation structurée.', 6, 45, 'Labo 2', 'LUNDI', '10:15', '12:15', 'TP'],
  ['ICT103', 'Mathématiques discrètes', 'Logique, ensembles, relations et structures discrètes.', 5, 40, 'Salle B12', 'MARDI', '08:00', '10:00', 'CM'],
  ['ICT104', 'Architecture des systèmes', 'Composants, représentation de l’information et systèmes informatiques.', 5, 40, 'Salle B14', 'MARDI', '10:15', '12:15', 'CM'],
  ['ICT105', 'Communication et expression', 'Méthodes de communication académique et professionnelle.', 3, 25, 'Salle C03', 'MERCREDI', '08:00', '10:00', 'TD'],
  ['ICT106', 'Anglais scientifique', 'Compréhension et production de documents techniques en anglais.', 3, 25, 'Salle C05', 'MERCREDI', '10:15', '12:15', 'TD'],
  ['ICT107', 'Bases de données I', 'Modélisation relationnelle et initiation au langage SQL.', 5, 40, 'Labo 1', 'JEUDI', '08:00', '10:00', 'TP'],
  ['ICT108', 'Réseaux informatiques I', 'Principes de communication, adressage et topologies de réseaux.', 5, 40, 'Labo Réseau', 'JEUDI', '10:15', '12:15', 'TP'],
  ['ICT109', 'Introduction au développement web', 'Fondements HTML, CSS, accessibilité et publication web.', 4, 35, 'Labo Web', 'VENDREDI', '08:00', '10:00', 'TP'],
  ['ICT110', 'Projet tutoré ICT4D', 'Projet collaboratif appliqué aux enjeux numériques de développement.', 4, 30, 'Salle Projet', 'VENDREDI', '10:15', '12:15', 'Projet'],
]

const userReadable = ['read("users")']
async function upsertDocument(collectionId, documentId, data, permissions = userReadable) {
  const created = await request('POST', `/databases/${databaseId}/collections/${collectionId}/documents`, { documentId, data, permissions })
  if (created.status === 409) await request('PATCH', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, { data, permissions }, [200])
}

async function deleteUniversityProfilesAndAccounts() {
  const result = await request('GET', `/databases/${databaseId}/collections/users/documents`, undefined, [200])
  const universityProfiles = (result.payload.documents || []).filter((document) => document.accountType === 'UNIVERSITY')
  for (const profile of universityProfiles) {
    await request('DELETE', `/databases/${databaseId}/collections/users/documents/${profile.$id}`, undefined, [204, 404])
    await request('DELETE', `/users/${profile.$id}`, undefined, [204, 404])
  }
  return universityProfiles.length
}

async function ensureDemoUser(user) {
  const created = await request('POST', '/users', { userId: user.id, email: user.email, password, name: user.name }, [201, 409])
  if (created.status === 201) await request('PATCH', `/users/${user.id}/prefs`, { prefs: { uniflowAccountType: 'UNIVERSITY' } }, [200])
  await upsertDocument('users', user.id, {
    email: user.email, name: user.name, accountType: 'UNIVERSITY', role: user.role,
    university: 'Université de Yaoundé I', program: 'ICT4D', level: 'L1', country: 'Cameroun',
  }, [`read("user:${user.id}")`, `update("user:${user.id}")`, `delete("user:${user.id}")`])
}

for (const schema of schemas) await ensureCollection(schema)
const removedUniversityProfiles = await deleteUniversityProfilesAndAccounts()
for (const user of demoUsers) await ensureDemoUser(user)
await upsertDocument('subscription_plans', 'academic_uy1_free', {
  code: 'academic_uy1_free', name: 'Accès académique UY1', category: 'ACADEMIC', countryCode: 'CM', currency: 'XAF',
  priceMonthlyAmount: 0, priceAnnuallyAmount: 0, period: 'Accès académique', badge: 'Université partenaire', highlight: true,
  description: 'Accès gratuit aux fonctionnalités académiques UniFlow pour le parcours ICT4D L1 de l’Université de Yaoundé I.', providers: '[]', status: 'ACTIVE',
})
for (const user of demoUsers) {
  await upsertDocument('subscription_statuses', `sub_${user.id.replace('demo_uy1_', '')}`, {
    userId: user.id, status: 'ACTIVE', planCode: 'academic_uy1_free', countryCode: 'CM', currency: 'XAF', monthlyAmount: 0,
    currentPeriodEnd: '2027-08-31T23:59:59.000Z', isAutoRenew: false,
  }, [`read("user:${user.id}")`, `update("user:${user.id}")`])
}
for (const [index, user] of demoUsers.entries()) {
  await upsertDocument('academic_directory', `directory_${user.id}`, {
    userId: user.id, name: user.name, role: user.role, university: 'Université de Yaoundé I', program: 'ICT4D', level: 'L1',
    matricule: user.role === 'STUDENT' || user.role === 'DELEGATE' ? `UY1-ICT4D-L1-2026-${String(index + 1).padStart(3, '0')}` : '', status: 'ACTIVE',
  })
}

for (let index = 0; index < courses.length; index += 1) {
  const [code, name, description, credits, hours, classroom, dayOfWeek, startTime, endTime, type] = courses[index]
  const courseId = `course_ict4d_l1_${String(index + 1).padStart(2, '0')}`
  const teacher = index === 1 ? demoUsers[2] : { id: '', name: '' }
  await upsertDocument('academic_courses', courseId, {
    code, name, description, university: 'Université de Yaoundé I', program: 'ICT4D', level: 'L1',
    teacherId: teacher.id, teacherName: teacher.name, credits, hours, classroom, type,
  })
  await upsertDocument('academic_schedules', `schedule_ict4d_l1_${String(index + 1).padStart(2, '0')}`, { courseId, courseCode: code, dayOfWeek, startTime, endTime, classroom, type })
  for (const student of demoUsers.slice(0, 2)) {
    await upsertDocument('academic_enrollments', `enroll_${student.id}_${String(index + 1).padStart(2, '0')}`, { studentId: student.id, courseId, status: 'ACTIVE' })
    const assignmentNumber = String(index + 1).padStart(2, '0')
    const assignmentStatus = index % 3 === 0 ? 'Noté' : index % 3 === 1 ? 'Soumis' : 'À rendre'
    await upsertDocument('academic_assignments', `assignment_${student.id}_${assignmentNumber}`, {
      courseId, courseCode: code, studentId: student.id, title: `Travail pratique ${assignmentNumber} — ${code}`,
      description: `Exercice appliqué de ${name}, enregistré dans Appwrite pour le parcours ICT4D L1.`,
      dueDate: new Date(Date.UTC(2026, 8, 1 + index, 16, 0, 0)).toISOString(), status: assignmentStatus,
      grade: assignmentStatus === 'Noté' ? `${12 + (index % 7)}/20` : '', feedback: assignmentStatus === 'Noté' ? 'Évaluation enregistrée par l’enseignant.' : '',
      submittedAt: assignmentStatus === 'Soumis' || assignmentStatus === 'Noté' ? new Date(Date.UTC(2026, 7, 18 + index, 10, 0, 0)).toISOString() : '',
      submittedFile: assignmentStatus === 'Soumis' || assignmentStatus === 'Noté' ? `rendu_${code.toLowerCase()}_${student.id}.pdf` : '',
      submissionNote: assignmentStatus === 'Soumis' || assignmentStatus === 'Noté' ? 'Rendu enregistré dans le cadre de la démonstration.' : '',
    })
    await upsertDocument('academic_grades', `grade_${student.id}_${assignmentNumber}`, {
      studentId: student.id, courseId, courseCode: code, evaluationTitle: `Contrôle continu — ${code}`, type: 'CC',
      score: 11 + ((index + (student.role === 'DELEGATE' ? 2 : 0)) % 8), maxScore: 20, coefficient: index % 2 === 0 ? 2 : 1,
    })
  }
  const sessionId = `attendance_session_ict4d_l1_${String(index + 1).padStart(2, '0')}`
  await upsertDocument('attendance_sessions', sessionId, { courseId, date: new Date(Date.UTC(2026, 7, 3 + index, 8, 0, 0)).toISOString(), createdBy: demoUsers[2].id })
  for (const [studentIndex, student] of demoUsers.slice(0, 2).entries()) {
    const statuses = ['PRESENT', 'PRESENT', 'RETARD', 'ABSENT']
    await upsertDocument('attendance_records', `att_${String(index + 1).padStart(2, '0')}_${String(studentIndex + 1).padStart(2, '0')}`, { sessionId, courseId, studentId: student.id, status: statuses[(index + studentIndex) % statuses.length] })
  }
}

const resourceKinds = [
  ['Documents', 'PDF', 'Fiche de cours'],
  ['Documents', 'PDF', 'Exercice guidé'],
  ['Vidéos', 'Vidéo', 'Capsule pédagogique'],
  ['Audios', 'Audio', 'Synthèse audio'],
  ['Documents', 'PDF', 'Étude de cas'],
]
for (let index = 0; index < 110; index += 1) {
  const courseIndex = index % courses.length
  const [code, courseName] = courses[courseIndex]
  const [category, type, label] = resourceKinds[index % resourceKinds.length]
  const number = String(index + 1).padStart(3, '0')
  const courseId = `course_ict4d_l1_${String(courseIndex + 1).padStart(2, '0')}`
  await upsertDocument('academic_library', `library_ict4d_l1_${number}`, {
    title: `${label} ${number} — ${code}`,
    courseId,
    course: `${code} · ${courseName}`,
    type,
    category,
    size: '',
    description: `Ressource pédagogique de démonstration ICT4D L1 enregistrée dans Appwrite pour ${courseName}.`,
    fileId: '',
    publishedAt: new Date(Date.UTC(2026, 7, 1 + (index % 20), 8, 0, 0)).toISOString(),
  })
}

console.log(JSON.stringify({
  endpoint,
  removedUniversityProfiles,
  demoUsers: demoUsers.map(({ id, role }) => ({ id, role })),
  academicCourses: courses.length,
  academicSchedules: courses.length,
  enrollments: courses.length * 2,
  academicAssignments: courses.length * 2,
  academicGrades: courses.length * 2,
  attendanceSessions: courses.length,
  attendanceRecords: courses.length * 2,
  subscriptionPlans: 1,
  activeAcademicSubscriptions: demoUsers.length,
  academicLibraryResources: 110,
}, null, 2))
