import test from 'node:test'
import assert from 'node:assert/strict'
import {
  attendanceCourseDocument,
  attendanceRate,
  attendanceSessionDocument,
  courseFinalScore,
  courseGradesDocument,
  datedFileName,
  mentionForAverage,
  normalizeDay,
  scoreOnTwenty,
  sheetNameFor,
  slugifyFileStem,
  sortTimetableSlots,
  timetableDocument,
  transcriptDocument,
  weightedAverage,
} from './exportModel.ts'

const generatedAt = new Date(2026, 8, 21, 10, 30)

test('le nom de fichier est daté en heure locale et sans accent', () => {
  assert.equal(datedFileName('Présences — INFO101 / L1', 'pdf', generatedAt), 'presences-info101-l1-2026-09-21.pdf')
  assert.equal(slugifyFileStem('   '), 'export')
})

test('le nom d’onglet Excel est nettoyé, tronqué à 31 caractères et sans espace finale', () => {
  assert.equal(sheetNameFor('Relevé : notes [S1] ?'), 'Relevé notes S1')
  assert.equal(sheetNameFor('Emploi du temps — Informatique L1'), 'Emploi du temps — Informatique')
  assert.equal(sheetNameFor(''), 'Export')
})

test('la liste d’émargement est triée par nom et compte les statuts', () => {
  const doc = attendanceSessionDocument({
    id: 's1', date: '2026-09-14T08:00:00.000Z', courseCode: 'INFO101', courseName: 'Algorithmique',
    records: [
      { studentId: 'b', studentName: 'Zoé Martin', matricule: '22B002', status: 'ABSENT' },
      { studentId: 'a', studentName: 'Ada Lovelace', matricule: '22B001', status: 'PRESENT', markedAt: '2026-09-14T08:05:00.000Z' },
      { studentId: 'c', studentName: 'Émile Ngo', status: 'RETARD' },
    ],
  }, { program: 'Informatique', level: 'L1' }, generatedAt)

  assert.deepEqual(doc.rows.map((row) => row.name), ['Ada Lovelace', 'Émile Ngo', 'Zoé Martin'])
  assert.equal(doc.rows[1].matricule, '—')
  assert.deepEqual(doc.rows.map((row) => row.status), ['Présent', 'Retard', 'Absent'])
  assert.deepEqual(doc.summary.find(([label]) => label === 'Présents'), ['Présents', '1'])
  assert.deepEqual(doc.summary.find(([label]) => label === 'Taux de présence'), ['Taux de présence', '67 %'])
  assert.ok(doc.meta.some(([label, value]) => label === 'Filière / niveau' && value === 'Informatique — L1'))
  assert.equal(doc.fileStem, 'presence-INFO101-2026-09-14')
})

test('le taux de présence compte les retards comme présents et ignore une liste vide', () => {
  assert.equal(attendanceRate([]), 0)
  assert.equal(attendanceRate([
    { studentId: 'a', studentName: 'A', status: 'PRESENT' },
    { studentId: 'b', studentName: 'B', status: 'RETARD' },
    { studentId: 'c', studentName: 'C', status: 'JUSTIFIE' },
    { studentId: 'd', studentName: 'D', status: 'ABSENT' },
  ]), 50)
})

test('la grille par UE fait l’union des étudiants et une colonne par séance dans l’ordre chronologique', () => {
  const doc = attendanceCourseDocument([
    { id: 's2', date: '2026-09-21T08:00:00.000Z', courseCode: 'INFO101', courseName: 'Algorithmique', records: [
      { studentId: 'a', studentName: 'Ada', status: 'ABSENT' },
      { studentId: 'c', studentName: 'Chloé', status: 'PRESENT' },
    ] },
    { id: 's1', date: '2026-09-14T08:00:00.000Z', courseCode: 'INFO101', courseName: 'Algorithmique', records: [
      { studentId: 'a', studentName: 'Ada', status: 'PRESENT' },
      { studentId: 'b', studentName: 'Bob', status: 'RETARD' },
    ] },
  ], {}, generatedAt)

  const sessionColumns = doc.columns.filter((column) => column.key.startsWith('s_')).map((column) => column.key)
  assert.deepEqual(sessionColumns, ['s_s1', 's_s2'])
  assert.deepEqual(doc.rows.map((row) => row.name), ['Ada', 'Bob', 'Chloé'])
  const ada = doc.rows[0]
  assert.equal(ada.s_s1, 'P')
  assert.equal(ada.s_s2, 'A')
  assert.equal(ada.attended, '1/2')
  assert.equal(ada.rate, '50 %')
  // Bob n'était pas dans la liste de la seconde séance : la case reste neutre plutôt que « absent ».
  assert.equal(doc.rows[1].s_s2, '·')
  assert.equal(doc.orientation, 'portrait')
  assert.equal(doc.fileStem, 'presences-ue-INFO101')
})

test('la grille passe en paysage au-delà de six séances', () => {
  const sessions = Array.from({ length: 7 }, (_, index) => ({
    id: `s${index}`, date: `2026-09-${String(index + 1).padStart(2, '0')}T08:00:00.000Z`, courseCode: 'X', courseName: 'Y',
    records: [{ studentId: 'a', studentName: 'Ada', status: 'PRESENT' as const }],
  }))
  assert.equal(attendanceCourseDocument(sessions, {}, generatedAt).orientation, 'landscape')
})

test('les notes sont ramenées sur 20 et la moyenne pondérée ignore les coefficients nuls', () => {
  assert.equal(scoreOnTwenty({ score: 45, maxScore: 50 }), 18)
  assert.equal(scoreOnTwenty({ score: 7, maxScore: 0 }), 7)
  assert.equal(weightedAverage([]), null)
  assert.equal(weightedAverage([
    { score: 10, maxScore: 20, coefficient: 1 },
    { score: 20, maxScore: 20, coefficient: 3 },
  ]), 17.5)
  assert.equal(weightedAverage([{ score: 12, maxScore: 20, coefficient: 0 }, { score: 14, maxScore: 20, coefficient: 0 }]), 13)
})

test('le relevé groupe par matière avec une ligne de moyenne et une mention', () => {
  const doc = transcriptDocument([
    { courseCode: 'INFO201', courseTitle: 'Bases de données', evaluationTitle: 'Examen', type: 'EXAM', score: 16, maxScore: 20, coefficient: 0.7 },
    { courseCode: 'INFO101', courseTitle: 'Algorithmique', evaluationTitle: 'CC', type: 'CC', score: 30, maxScore: 40, coefficient: 0.3 },
    { courseCode: 'INFO101', courseTitle: 'Algorithmique', evaluationTitle: 'Examen', type: 'EXAM', score: 12, maxScore: 20, coefficient: 0.7 },
  ], { name: 'Ada Lovelace', matricule: '22B001', program: 'Informatique', level: 'L1' }, generatedAt)

  assert.equal(doc.rows[0].course, 'INFO101 — Algorithmique')
  assert.equal(doc.rows[0].onTwenty, '15')
  const averages = doc.rows.filter((row) => row.evaluation === 'Moyenne de la matière')
  assert.equal(averages.length, 2)
  // INFO101 : (15×0,3 + 12×0,7) / 1 = 12,9 ; INFO201 : 16 ; moyenne générale 14,45 → Bien.
  assert.equal(averages[0].onTwenty, '12,9')
  assert.deepEqual(doc.summary, [['Moyenne générale', '14,45 / 20'], ['Mention', 'Bien']])
  assert.equal(doc.fileStem, 'releve-notes-22B001')
})

test('les mentions suivent les seuils LMD', () => {
  assert.equal(mentionForAverage(9.99), 'Insuffisant')
  assert.equal(mentionForAverage(10), 'Passable')
  assert.equal(mentionForAverage(12), 'Assez bien')
  assert.equal(mentionForAverage(14), 'Bien')
  assert.equal(mentionForAverage(16), 'Très bien')
})

test('la note finale d’UE n’utilise que les composantes saisies', () => {
  const weights = { ccWeight: 0.3, examWeight: 0.7 }
  assert.equal(courseFinalScore({}, weights), null)
  assert.equal(courseFinalScore({ cc: 14 }, weights), 14)
  assert.equal(courseFinalScore({ cc: 10, exam: 20 }, weights), 17)
})

test('le procès-verbal de l’UE calcule moyenne et taux de réussite sur les seuls étudiants évalués', () => {
  const doc = courseGradesDocument([
    { studentId: 'b', name: 'Bob', matricule: 'B', cc: 8, exam: 6 },
    { studentId: 'a', name: 'Ada', matricule: 'A', cc: 10, exam: 20 },
    { studentId: 'c', name: 'Chloé' },
  ], { courseCode: 'INFO101', courseName: 'Algorithmique', ccWeight: 0.3, examWeight: 0.7, teacherName: 'Dr Ngo' }, generatedAt)

  assert.deepEqual(doc.rows.map((row) => row.name), ['Ada', 'Bob', 'Chloé'])
  assert.deepEqual(doc.rows.map((row) => row.decision), ['Validé', 'Non validé', 'Non évalué'])
  assert.equal(doc.rows[2].final, '—')
  assert.deepEqual(doc.summary, [
    ['Étudiants évalués', '2 / 3'],
    ['Moyenne de la classe', '11,8 / 20'],
    ['Taux de réussite', '50 %'],
  ])
  assert.ok(doc.meta.some(([label, value]) => label === 'Pondération' && value === 'CC 30 % · Examen 70 %'))
})

test('les jours en anglais et en français sont triés dans le même ordre, puis par heure', () => {
  assert.equal(normalizeDay('Monday'), 'LUNDI')
  assert.equal(normalizeDay('mercredi'), 'MERCREDI')
  const sorted = sortTimetableSlots([
    { dayOfWeek: 'TUESDAY', startTime: '08:00' },
    { dayOfWeek: 'LUNDI', startTime: '14:00' },
    { dayOfWeek: 'LUNDI', startTime: '8:00' },
  ])
  assert.deepEqual(sorted.map((slot) => `${slot.dayOfWeek} ${slot.startTime}`), ['LUNDI 8:00', 'LUNDI 14:00', 'TUESDAY 08:00'])
})

test('l’emploi du temps ne répète pas le jour et totalise les heures hebdomadaires', () => {
  const doc = timetableDocument([
    { dayOfWeek: 'MARDI', startTime: '10:00', endTime: '12:00', courseCode: 'INFO201', courseName: 'BD', type: 'TD', room: 'S12' },
    { dayOfWeek: 'LUNDI', startTime: '08:00', endTime: '10:00', courseCode: 'INFO101', courseName: 'Algo', type: 'CM', teacherName: 'Dr Ngo' },
    { dayOfWeek: 'LUNDI', startTime: '10:00', endTime: '11:30', courseCode: 'INFO101', courseName: 'Algo', type: 'TD', group: 'G1' },
  ], { scopeLabel: 'Informatique L1', weekLabel: 'Semaine du 21 septembre 2026' }, generatedAt)

  assert.deepEqual(doc.rows.map((row) => row.day), ['Lundi', '', 'Mardi'])
  assert.equal(doc.rows[0].teacher, 'Dr Ngo')
  assert.equal(doc.rows[1].group, 'G1')
  assert.equal(doc.rows[2].group, 'Tous')
  assert.match(doc.subtitle ?? '', /3 créneaux sur 2 jours · 5 h 30 de cours/)
  assert.equal(doc.orientation, 'landscape')
  assert.equal(doc.fileStem, 'emploi-du-temps-Informatique L1')
})
