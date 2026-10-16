/**
 * Modèle commun des exports PDF/Excel : un document tabulaire indépendant de la
 * bibliothèque de rendu. La logique métier (lignes, totaux, nom de fichier) vit
 * ici, en pur TypeScript testable avec `node --test`, et les moteurs
 * (`exportPdf.ts`, `exportExcel.ts`) ne font que dessiner ce qu'on leur donne.
 */

export type ExportCell = string | number | null | undefined

export interface ExportColumn {
  key: string
  label: string
  /** Largeur en « caractères » (Excel) ; sert aussi de poids relatif en PDF. */
  width?: number
  align?: 'left' | 'center' | 'right'
}

export interface ExportDocument {
  /** Titre principal, repris dans l'en-tête de chaque page et dans le nom de l'onglet Excel. */
  title: string
  subtitle?: string
  /** Paires libellé/valeur affichées sous le titre (université, filière, enseignant…). */
  meta: Array<[string, string]>
  columns: ExportColumn[]
  rows: Array<Record<string, ExportCell>>
  /** Totaux ou synthèse affichés après le tableau. */
  summary: Array<[string, string]>
  /** Racine du nom de fichier, sans date ni extension ; sera « slugifiée ». */
  fileStem: string
  orientation: 'portrait' | 'landscape'
  generatedAt: Date
}

export const EXPORT_FOOTER = 'Généré par UniFlow — KERNEL FORGE'
export const EXPORT_BRAND_COLOR = '#1e3a8a'

/** Retire accents et caractères spéciaux pour un nom de fichier sûr sur tous les systèmes. */
export function slugifyFileStem(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return slug || 'export'
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/** `YYYY-MM-DD` en heure locale : le nom de fichier doit refléter la date vue par l'utilisateur, pas l'UTC. */
export function isoDateStamp(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function datedFileName(stem: string, extension: 'pdf' | 'xlsx', date = new Date()): string {
  return `${slugifyFileStem(stem)}-${isoDateStamp(date)}.${extension}`
}

/** Excel refuse les noms d'onglet de plus de 31 caractères ou contenant `[]:*?/\`, et un nom tronqué ne doit pas finir par une espace. */
export function sheetNameFor(title: string): string {
  const cleaned = title.replace(/[[\]:*?/\\]/g, ' ').replace(/\s+/g, ' ').trim()
  return (cleaned || 'Export').slice(0, 31).trim()
}

const FR_DATE_TIME = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
const FR_DATE_LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const FR_DATE_SHORT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const FR_DATE_COMPACT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' })

export function formatExportDateTime(date: Date): string {
  return FR_DATE_TIME.format(date)
}

export function formatLongDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : ''
  const formatted = FR_DATE_LONG.format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatShortDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? (typeof value === 'string' ? value : '') : FR_DATE_SHORT.format(date)
}

function formatCompactDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : FR_DATE_COMPACT.format(date)
}

/** Nombre au format français à deux décimales maximum, sans zéros inutiles (« 12,5 » et non « 12,50 »). */
export function formatScore(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)
}

function baseDocument(partial: Omit<ExportDocument, 'generatedAt' | 'orientation' | 'meta' | 'summary'> & Partial<Pick<ExportDocument, 'generatedAt' | 'orientation' | 'meta' | 'summary'>>): ExportDocument {
  return {
    orientation: 'portrait',
    meta: [],
    summary: [],
    generatedAt: new Date(),
    ...partial,
  }
}

// ---------------------------------------------------------------------------
// Présences
// ---------------------------------------------------------------------------

export type AttendanceStatusCode = 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatusCode, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  RETARD: 'Retard',
  JUSTIFIE: 'Justifié',
}

/** Abréviation utilisée dans la grille par UE, où chaque séance est une colonne étroite. */
export const ATTENDANCE_STATUS_SHORT: Record<AttendanceStatusCode, string> = {
  PRESENT: 'P',
  ABSENT: 'A',
  RETARD: 'R',
  JUSTIFIE: 'J',
}

export interface AttendanceExportRecord {
  studentId: string
  studentName: string
  matricule?: string
  status: AttendanceStatusCode
  markedAt?: string
}

export interface AttendanceExportSession {
  id: string
  date: string
  courseCode: string
  courseName: string
  teacherName?: string
  records: AttendanceExportRecord[]
}

export interface AttendanceExportContext {
  institution?: string
  program?: string
  level?: string
  group?: string
}

export function attendanceCounts(records: AttendanceExportRecord[]): Record<AttendanceStatusCode, number> {
  const counts: Record<AttendanceStatusCode, number> = { PRESENT: 0, ABSENT: 0, RETARD: 0, JUSTIFIE: 0 }
  for (const record of records) counts[record.status] += 1
  return counts
}

function sortByName<T extends { studentName: string }>(records: T[]): T[] {
  return [...records].sort((a, b) => a.studentName.localeCompare(b.studentName, 'fr', { sensitivity: 'base' }))
}

function contextMeta(context: AttendanceExportContext): Array<[string, string]> {
  const meta: Array<[string, string]> = []
  if (context.institution) meta.push(['Établissement', context.institution])
  if (context.program || context.level) meta.push(['Filière / niveau', [context.program, context.level].filter(Boolean).join(' — ')])
  if (context.group) meta.push(['Groupe', context.group])
  return meta
}

/** Liste d'émargement d'une séance : une ligne par étudiant, triée par nom. */
export function attendanceSessionDocument(session: AttendanceExportSession, context: AttendanceExportContext = {}, generatedAt = new Date()): ExportDocument {
  const records = sortByName(session.records)
  const counts = attendanceCounts(records)
  const meta: Array<[string, string]> = [['Séance du', formatLongDate(session.date)], ...contextMeta(context)]
  if (session.teacherName) meta.push(['Enseignant', session.teacherName])
  return baseDocument({
    title: `Liste de présence — ${session.courseCode} ${session.courseName}`.trim(),
    subtitle: `${records.length} étudiant${records.length > 1 ? 's' : ''} inscrit${records.length > 1 ? 's' : ''}`,
    meta,
    columns: [
      { key: 'index', label: 'N°', width: 5, align: 'right' },
      { key: 'matricule', label: 'Matricule', width: 16 },
      { key: 'name', label: 'Nom et prénom', width: 34 },
      { key: 'status', label: 'Statut', width: 12, align: 'center' },
      { key: 'markedAt', label: 'Relevé à', width: 10, align: 'center' },
      { key: 'signature', label: 'Émargement', width: 22 },
    ],
    rows: records.map((record, index) => ({
      index: index + 1,
      matricule: record.matricule || '—',
      name: record.studentName,
      status: ATTENDANCE_STATUS_LABELS[record.status],
      markedAt: record.markedAt ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(record.markedAt)) : '',
      signature: '',
    })),
    summary: [
      ['Présents', String(counts.PRESENT)],
      ['Retards', String(counts.RETARD)],
      ['Absents', String(counts.ABSENT)],
      ['Justifiés', String(counts.JUSTIFIE)],
      ['Taux de présence', `${attendanceRate(records)} %`],
    ],
    fileStem: `presence-${session.courseCode}-${isoDateStamp(new Date(session.date))}`,
    generatedAt,
  })
}

/** Présents et retards comptent comme présence effective ; justifiés et absents non. */
export function attendanceRate(records: AttendanceExportRecord[]): number {
  if (!records.length) return 0
  const present = records.filter((record) => record.status === 'PRESENT' || record.status === 'RETARD').length
  return Math.round((present / records.length) * 100)
}

/**
 * Grille de l'UE : une colonne par séance (date), une ligne par étudiant, avec
 * le total de présences et le taux. Les étudiants absents d'une séance mais
 * inscrits à d'autres apparaissent quand même : la grille est l'union des listes.
 */
export function attendanceCourseDocument(sessions: AttendanceExportSession[], context: AttendanceExportContext = {}, generatedAt = new Date()): ExportDocument {
  const ordered = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const first = ordered[0]
  const students = new Map<string, { name: string; matricule?: string; statuses: Map<string, AttendanceStatusCode> }>()
  for (const session of ordered) {
    for (const record of session.records) {
      const entry = students.get(record.studentId) ?? { name: record.studentName, matricule: record.matricule, statuses: new Map() }
      entry.statuses.set(session.id, record.status)
      if (!entry.matricule && record.matricule) entry.matricule = record.matricule
      students.set(record.studentId, entry)
    }
  }
  const studentRows = [...students.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name, 'fr', { sensitivity: 'base' }))
  const sessionColumns: ExportColumn[] = ordered.map((session) => ({ key: `s_${session.id}`, label: formatCompactDate(session.date), width: 7, align: 'center' }))
  const rows = studentRows.map(([, student], index) => {
    const row: Record<string, ExportCell> = { index: index + 1, matricule: student.matricule || '—', name: student.name }
    let attended = 0
    for (const session of ordered) {
      const status = student.statuses.get(session.id)
      row[`s_${session.id}`] = status ? ATTENDANCE_STATUS_SHORT[status] : '·'
      if (status === 'PRESENT' || status === 'RETARD') attended += 1
    }
    row.attended = `${attended}/${ordered.length}`
    row.rate = ordered.length ? `${Math.round((attended / ordered.length) * 100)} %` : '—'
    return row
  })
  const allRecords = ordered.flatMap((session) => session.records)
  return baseDocument({
    title: first ? `Présences de l'UE — ${first.courseCode} ${first.courseName}`.trim() : 'Présences de l’UE',
    subtitle: `${ordered.length} séance${ordered.length > 1 ? 's' : ''} · ${studentRows.length} étudiant${studentRows.length > 1 ? 's' : ''} · P = présent, R = retard, A = absent, J = justifié`,
    meta: contextMeta(context),
    columns: [
      { key: 'index', label: 'N°', width: 5, align: 'right' },
      { key: 'matricule', label: 'Matricule', width: 16 },
      { key: 'name', label: 'Nom et prénom', width: 32 },
      ...sessionColumns,
      { key: 'attended', label: 'Présences', width: 11, align: 'center' },
      { key: 'rate', label: 'Taux', width: 8, align: 'center' },
    ],
    rows,
    summary: [
      ['Séances', String(ordered.length)],
      ['Taux de présence global', `${attendanceRate(allRecords)} %`],
    ],
    fileStem: `presences-ue-${first?.courseCode ?? 'ue'}`,
    orientation: sessionColumns.length > 6 ? 'landscape' : 'portrait',
    generatedAt,
  })
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export interface GradeExportEntry {
  courseCode: string
  courseTitle: string
  evaluationTitle: string
  type?: string
  score: number
  maxScore: number
  coefficient: number
}

export interface TranscriptExportStudent {
  name: string
  matricule?: string
  program?: string
  level?: string
  institution?: string
}

/** Note ramenée sur 20 quel que soit le barème de l'évaluation, pour comparer et moyenner. */
export function scoreOnTwenty(entry: Pick<GradeExportEntry, 'score' | 'maxScore'>): number {
  const max = entry.maxScore > 0 ? entry.maxScore : 20
  return Number(((entry.score / max) * 20).toFixed(2))
}

/** Moyenne pondérée sur 20 ; `null` sans évaluation pour ne pas afficher un faux 0. */
export function weightedAverage(entries: Array<Pick<GradeExportEntry, 'score' | 'maxScore' | 'coefficient'>>): number | null {
  if (!entries.length) return null
  const totalCoefficient = entries.reduce((sum, entry) => sum + (entry.coefficient > 0 ? entry.coefficient : 1), 0)
  const weighted = entries.reduce((sum, entry) => sum + scoreOnTwenty(entry) * (entry.coefficient > 0 ? entry.coefficient : 1), 0)
  return Number((weighted / totalCoefficient).toFixed(2))
}

/** Relevé d'un étudiant : évaluations regroupées par matière, moyenne par matière puis générale. */
export function transcriptDocument(entries: GradeExportEntry[], student: TranscriptExportStudent, generatedAt = new Date()): ExportDocument {
  const byCourse = new Map<string, GradeExportEntry[]>()
  for (const entry of entries) {
    const key = entry.courseCode || entry.courseTitle
    byCourse.set(key, [...(byCourse.get(key) ?? []), entry])
  }
  const rows: Array<Record<string, ExportCell>> = []
  const courseAverages: Array<{ average: number; coefficient: number }> = []
  for (const [, courseEntries] of [...byCourse.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr'))) {
    for (const entry of courseEntries) {
      rows.push({
        course: `${entry.courseCode} — ${entry.courseTitle}`.replace(/^ — /, ''),
        evaluation: entry.evaluationTitle,
        type: entry.type || '—',
        score: `${formatScore(entry.score)} / ${formatScore(entry.maxScore)}`,
        coefficient: formatScore(entry.coefficient),
        onTwenty: formatScore(scoreOnTwenty(entry)),
      })
    }
    const average = weightedAverage(courseEntries)
    if (average !== null) {
      courseAverages.push({ average, coefficient: 1 })
      rows.push({ course: '', evaluation: 'Moyenne de la matière', type: '', score: '', coefficient: '', onTwenty: formatScore(average), _emphasis: 1 })
    }
  }
  const general = courseAverages.length ? Number((courseAverages.reduce((sum, item) => sum + item.average, 0) / courseAverages.length).toFixed(2)) : null
  const meta: Array<[string, string]> = [['Étudiant', student.name]]
  if (student.matricule) meta.push(['Matricule', student.matricule])
  if (student.institution) meta.push(['Établissement', student.institution])
  if (student.program || student.level) meta.push(['Filière / niveau', [student.program, student.level].filter(Boolean).join(' — ')])
  return baseDocument({
    title: 'Relevé de notes',
    subtitle: `${entries.length} évaluation${entries.length > 1 ? 's' : ''} · ${byCourse.size} matière${byCourse.size > 1 ? 's' : ''}`,
    meta,
    columns: [
      { key: 'course', label: 'Matière', width: 34 },
      { key: 'evaluation', label: 'Évaluation', width: 26 },
      { key: 'type', label: 'Type', width: 8, align: 'center' },
      { key: 'score', label: 'Note', width: 12, align: 'center' },
      { key: 'coefficient', label: 'Coef.', width: 7, align: 'center' },
      { key: 'onTwenty', label: 'Sur 20', width: 9, align: 'center' },
    ],
    rows,
    summary: [
      ['Moyenne générale', general === null ? '—' : `${formatScore(general)} / 20`],
      ['Mention', general === null ? '—' : mentionForAverage(general)],
    ],
    fileStem: `releve-notes-${student.matricule || student.name}`,
    generatedAt,
  })
}

/** Mentions du système LMD camerounais (seuils 10/12/14/16). */
export function mentionForAverage(average: number): string {
  if (average >= 16) return 'Très bien'
  if (average >= 14) return 'Bien'
  if (average >= 12) return 'Assez bien'
  if (average >= 10) return 'Passable'
  return 'Insuffisant'
}

export interface CourseGradeExportRow {
  studentId: string
  name: string
  matricule?: string
  /** Notes /20 déjà saisies ; `undefined` = non évalué. */
  cc?: number
  exam?: number
}

export interface CourseGradeExportContext {
  courseCode: string
  courseName: string
  ccWeight: number
  examWeight: number
  teacherName?: string
  program?: string
  level?: string
  institution?: string
}

/** Moyenne CC/Examen avec les seules composantes saisies : un CC seul donne la note du CC, pas une moyenne divisée par deux. */
export function courseFinalScore(row: Pick<CourseGradeExportRow, 'cc' | 'exam'>, weights: Pick<CourseGradeExportContext, 'ccWeight' | 'examWeight'>): number | null {
  const parts = [
    typeof row.cc === 'number' ? { score: row.cc, weight: weights.ccWeight } : null,
    typeof row.exam === 'number' ? { score: row.exam, weight: weights.examWeight } : null,
  ].filter((part): part is { score: number; weight: number } => part !== null)
  if (!parts.length) return null
  const total = parts.reduce((sum, part) => sum + part.weight, 0)
  return Number((parts.reduce((sum, part) => sum + part.score * part.weight, 0) / total).toFixed(2))
}

/** Procès-verbal des notes d'une UE : une ligne par étudiant inscrit, moyenne et taux de réussite en synthèse. */
export function courseGradesDocument(students: CourseGradeExportRow[], context: CourseGradeExportContext, generatedAt = new Date()): ExportDocument {
  const ordered = [...students].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  const finals = ordered.map((student) => courseFinalScore(student, context))
  const known = finals.filter((value): value is number => value !== null)
  const classAverage = known.length ? Number((known.reduce((sum, value) => sum + value, 0) / known.length).toFixed(2)) : null
  const passRate = known.length ? Math.round((known.filter((value) => value >= 10).length / known.length) * 100) : null
  const ccPercent = Math.round(context.ccWeight * 100)
  const examPercent = Math.round(context.examWeight * 100)
  const meta: Array<[string, string]> = []
  if (context.institution) meta.push(['Établissement', context.institution])
  if (context.program || context.level) meta.push(['Filière / niveau', [context.program, context.level].filter(Boolean).join(' — ')])
  if (context.teacherName) meta.push(['Enseignant', context.teacherName])
  meta.push(['Pondération', `CC ${ccPercent} % · Examen ${examPercent} %`])
  return baseDocument({
    title: `Procès-verbal des notes — ${context.courseCode} ${context.courseName}`.trim(),
    subtitle: `${ordered.length} étudiant${ordered.length > 1 ? 's' : ''} inscrit${ordered.length > 1 ? 's' : ''} · notes sur 20`,
    meta,
    columns: [
      { key: 'index', label: 'N°', width: 5, align: 'right' },
      { key: 'matricule', label: 'Matricule', width: 16 },
      { key: 'name', label: 'Nom et prénom', width: 34 },
      { key: 'cc', label: `CC (${ccPercent} %)`, width: 11, align: 'center' },
      { key: 'exam', label: `Examen (${examPercent} %)`, width: 14, align: 'center' },
      { key: 'final', label: 'Note finale', width: 12, align: 'center' },
      { key: 'decision', label: 'Décision', width: 12, align: 'center' },
    ],
    rows: ordered.map((student, index) => {
      const final = finals[index]
      return {
        index: index + 1,
        matricule: student.matricule || '—',
        name: student.name,
        cc: formatScore(student.cc),
        exam: formatScore(student.exam),
        final: formatScore(final),
        decision: final === null ? 'Non évalué' : final >= 10 ? 'Validé' : 'Non validé',
      }
    }),
    summary: [
      ['Étudiants évalués', `${known.length} / ${ordered.length}`],
      ['Moyenne de la classe', classAverage === null ? '—' : `${formatScore(classAverage)} / 20`],
      ['Taux de réussite', passRate === null ? '—' : `${passRate} %`],
    ],
    fileStem: `notes-${context.courseCode}`,
    generatedAt,
  })
}

// ---------------------------------------------------------------------------
// Emploi du temps
// ---------------------------------------------------------------------------

export interface TimetableExportSlot {
  dayOfWeek: string
  startTime: string
  endTime: string
  courseCode: string
  courseName: string
  type?: string
  teacherName?: string
  room?: string
  group?: string
}

export interface TimetableExportContext {
  scopeLabel: string
  institution?: string
  weekLabel?: string
}

const DAY_ORDER = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE']
const DAY_LABELS: Record<string, string> = {
  LUNDI: 'Lundi', MONDAY: 'Lundi',
  MARDI: 'Mardi', TUESDAY: 'Mardi',
  MERCREDI: 'Mercredi', WEDNESDAY: 'Mercredi',
  JEUDI: 'Jeudi', THURSDAY: 'Jeudi',
  VENDREDI: 'Vendredi', FRIDAY: 'Vendredi',
  SAMEDI: 'Samedi', SATURDAY: 'Samedi',
  DIMANCHE: 'Dimanche', SUNDAY: 'Dimanche',
}
const DAY_ALIASES: Record<string, string> = { MONDAY: 'LUNDI', TUESDAY: 'MARDI', WEDNESDAY: 'MERCREDI', THURSDAY: 'JEUDI', FRIDAY: 'VENDREDI', SATURDAY: 'SAMEDI', SUNDAY: 'DIMANCHE' }

/** Les jours arrivent en français ou en anglais selon la source (Appwrite académique vs agenda personnel). */
export function normalizeDay(day: string): string {
  const upper = day.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return DAY_ALIASES[upper] ?? upper
}

export function dayLabel(day: string): string {
  return DAY_LABELS[normalizeDay(day)] ?? day
}

export function dayIndex(day: string): number {
  const index = DAY_ORDER.indexOf(normalizeDay(day))
  return index === -1 ? DAY_ORDER.length : index
}

/** Tri chronologique : jour de la semaine puis heure de début (« 8:00 » et « 08:00 » sont égaux). */
export function sortTimetableSlots<T extends Pick<TimetableExportSlot, 'dayOfWeek' | 'startTime'>>(slots: T[]): T[] {
  const minutes = (time: string) => {
    const [hours = '0', mins = '0'] = time.split(':')
    return Number(hours) * 60 + Number(mins)
  }
  return [...slots].sort((a, b) => dayIndex(a.dayOfWeek) - dayIndex(b.dayOfWeek) || minutes(a.startTime) - minutes(b.startTime))
}

export function timetableDocument(slots: TimetableExportSlot[], context: TimetableExportContext, generatedAt = new Date()): ExportDocument {
  const ordered = sortTimetableSlots(slots)
  const totalMinutes = ordered.reduce((sum, slot) => {
    const toMinutes = (time: string) => { const [h = '0', m = '0'] = time.split(':'); return Number(h) * 60 + Number(m) }
    return sum + Math.max(0, toMinutes(slot.endTime) - toMinutes(slot.startTime))
  }, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const meta: Array<[string, string]> = [['Filière / niveau', context.scopeLabel]]
  if (context.institution) meta.unshift(['Établissement', context.institution])
  if (context.weekLabel) meta.push(['Semaine', context.weekLabel])
  const days = new Set(ordered.map((slot) => normalizeDay(slot.dayOfWeek)))
  return baseDocument({
    title: `Emploi du temps — ${context.scopeLabel}`,
    subtitle: `${ordered.length} créneau${ordered.length > 1 ? 'x' : ''} sur ${days.size} jour${days.size > 1 ? 's' : ''} · ${hours} h${minutes ? ` ${pad2(minutes)}` : ''} de cours par semaine`,
    meta,
    columns: [
      { key: 'day', label: 'Jour', width: 11 },
      { key: 'time', label: 'Horaire', width: 14, align: 'center' },
      { key: 'code', label: 'Code', width: 10 },
      { key: 'course', label: 'Cours', width: 34 },
      { key: 'type', label: 'Type', width: 7, align: 'center' },
      { key: 'room', label: 'Salle', width: 16 },
      { key: 'teacher', label: 'Enseignant', width: 22 },
      { key: 'group', label: 'Groupe', width: 9, align: 'center' },
    ],
    rows: ordered.map((slot, index) => ({
      // Le jour n'est répété que sur le premier créneau de la journée : la lecture par bloc est plus rapide.
      day: index > 0 && normalizeDay(ordered[index - 1].dayOfWeek) === normalizeDay(slot.dayOfWeek) ? '' : dayLabel(slot.dayOfWeek),
      time: `${slot.startTime} – ${slot.endTime}`,
      code: slot.courseCode,
      course: slot.courseName,
      type: slot.type || '—',
      room: slot.room || '—',
      teacher: slot.teacherName || '—',
      group: slot.group || 'Tous',
    })),
    summary: [],
    fileStem: `emploi-du-temps-${context.scopeLabel}`,
    orientation: 'landscape',
    generatedAt,
  })
}
