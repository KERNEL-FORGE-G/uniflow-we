/**
 * Logique pure de la page « Mon profil » (testée sous `node --test`) :
 * synthèse des présences et des notes de l'utilisateur connecté, par cours.
 * La page affichait jusqu'ici des valeurs inventées (« 80 séances, 87 % »,
 * parcours 2022-2024, bulletins…) quel que soit le compte.
 */
import { attendanceRate } from './assignmentModel.ts'
import { scoreOn20 } from './dashboardModel.ts'

export interface AttendanceRecordLike {
  courseId?: string | null
  status: string
}

export interface CourseAttendance {
  courseId: string
  name: string
  /** Séances comptées (les absences justifiées ne comptent pas). */
  counted: number
  rate: number | null
}

export interface LearnerAttendanceSummary {
  /** Nombre de relevés, justifiés compris. */
  sessions: number
  /** Présents + retards. */
  present: number
  rate: number | null
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

export function learnerAttendanceSummary(records: AttendanceRecordLike[]): LearnerAttendanceSummary {
  const present = records.filter((record) => ['present', 'retard'].includes(norm(record.status))).length
  return { sessions: records.length, present, rate: attendanceRate(records) }
}

/**
 * Taux par cours, trié du plus faible au plus fort : c'est le cours où l'on
 * décroche que l'étudiant doit voir en premier. Les relevés sans cours connu
 * sont regroupés sous « Autres séances ».
 */
export function attendanceByCourse(records: AttendanceRecordLike[], courseNames: Map<string, string>): CourseAttendance[] {
  const buckets = new Map<string, AttendanceRecordLike[]>()
  for (const record of records) {
    const key = record.courseId || ''
    const list = buckets.get(key) ?? []
    list.push(record)
    buckets.set(key, list)
  }
  return [...buckets.entries()]
    .map(([courseId, rows]) => ({
      courseId,
      name: courseId ? courseNames.get(courseId) ?? courseId : 'Autres séances',
      counted: rows.filter((row) => norm(row.status) !== 'justifie').length,
      rate: attendanceRate(rows),
    }))
    .sort((a, b) => (a.rate ?? 101) - (b.rate ?? 101) || a.name.localeCompare(b.name))
}

export interface GradeLikeForProfile {
  code: string
  ue?: string
  grade: number
  maxScore?: number
  coef?: number
}

export interface CourseGrades {
  code: string
  label: string
  count: number
  /** Moyenne pondérée par coefficient, ramenée sur 20, arrondie au dixième. */
  average: number
}

/**
 * Notes regroupées par code de cours. Le libellé est le nom du cours quand
 * on le connaît (`courseNames`, code → nom) ; `ue` ne porte que « filière
 * niveau », identique pour tous les cours d'un étudiant, donc inutile seul.
 */
export function gradesByCourse(grades: GradeLikeForProfile[], courseNames: Map<string, string> = new Map()): CourseGrades[] {
  const buckets = new Map<string, GradeLikeForProfile[]>()
  for (const grade of grades) {
    const list = buckets.get(grade.code) ?? []
    list.push(grade)
    buckets.set(grade.code, list)
  }
  return [...buckets.entries()]
    .map(([code, rows]) => {
      const weight = rows.reduce((sum, row) => sum + (row.coef && row.coef > 0 ? row.coef : 1), 0)
      const total = rows.reduce((sum, row) => sum + scoreOn20(row) * (row.coef && row.coef > 0 ? row.coef : 1), 0)
      return { code, label: courseNames.get(code) || rows.find((row) => row.ue)?.ue || code, count: rows.length, average: Math.round((total / weight) * 10) / 10 }
    })
    .sort((a, b) => a.code.localeCompare(b.code))
}

/** Moyenne générale (moyenne des moyennes de cours), `null` sans note. */
export function overallAverage(courses: CourseGrades[]): number | null {
  if (!courses.length) return null
  return Math.round((courses.reduce((sum, course) => sum + course.average, 0) / courses.length) * 10) / 10
}
