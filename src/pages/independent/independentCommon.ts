import { ApiError } from '../../lib/api'
import type {
  PersonalAssignmentRecord,
  PersonalCourseRecord,
  PersonalGradeRecord,
  PersonalScheduleRecord,
} from '../../lib/appwrite'

export type PersonalCourse = PersonalCourseRecord
export type PersonalSchedule = PersonalScheduleRecord
export type PersonalAssignment = PersonalAssignmentRecord
export type PersonalGrade = PersonalGradeRecord

export const DAYS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'] as const
export type DayKey = typeof DAYS[number]

export const DAY_LABELS: Record<string, string> = {
  LUNDI: 'Lundi',
  MARDI: 'Mardi',
  MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi',
  VENDREDI: 'Vendredi',
  SAMEDI: 'Samedi',
  DIMANCHE: 'Dimanche',
}

export const PRIORITY_LABELS: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  LOW: { label: 'Basse', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dotClass: 'bg-slate-400' },
  MEDIUM: { label: 'Moyenne', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', dotClass: 'bg-blue-500' },
  HIGH: { label: 'Haute', badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', dotClass: 'bg-amber-500' },
  URGENT: { label: 'Urgente', badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300', dotClass: 'bg-rose-500' },
}

export const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  TODO: { label: 'À faire', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  IN_PROGRESS: { label: 'En cours', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' },
  DONE: { label: 'Terminée', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' },
  CANCELLED: { label: 'Annulée', badgeClass: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
}

export const PRESET_COURSE_COLORS = [
  '#0d9488', // Teal UniFlow
  '#1e3a8a', // Bleu Marine UniFlow
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Rose
  '#f59e0b', // Ambre
  '#10b981', // Émeraude
  '#0284c7', // Bleu Ciel
]

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return error instanceof Error ? error.message : 'Erreur de communication avec le serveur personnel.'
}

export function formatDate(value?: string, withTime = false): string {
  if (!value) return 'Date non renseignée'
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return 'Date non renseignée'
  return parsed.toLocaleDateString('fr-FR', withTime
    ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatRelativeDueDate(dueDate?: string): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!dueDate) return { text: 'Sans échéance', isOverdue: false, isToday: false }
  const due = new Date(dueDate)
  if (!Number.isFinite(due.getTime())) return { text: 'Sans échéance', isOverdue: false, isToday: false }

  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs < 0) {
    const daysAgo = Math.abs(diffDays)
    return { text: daysAgo <= 1 ? 'En retard (hier)' : `En retard (${daysAgo} j)`, isOverdue: true, isToday: false }
  }

  const isSameDay = due.getDate() === now.getDate() && due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear()
  if (isSameDay) {
    return { text: `Aujourd'hui à ${due.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, isOverdue: false, isToday: true }
  }

  if (diffDays === 1) return { text: 'Demain', isOverdue: false, isToday: false }
  if (diffDays <= 7) return { text: `Dans ${diffDays} jours`, isOverdue: false, isToday: false }

  return { text: formatDate(dueDate, false), isOverdue: false, isToday: false }
}

export function isOverdue(task: PersonalAssignmentRecord): boolean {
  return Boolean(
    task.dueDate &&
    task.status !== 'DONE' &&
    task.status !== 'CANCELLED' &&
    new Date(task.dueDate).getTime() < Date.now()
  )
}

export function calcWeightedAverage(grades: PersonalGradeRecord[]) {
  if (!grades.length) {
    return { average: null, totalCoefficients: 0, bestScore: null, worstScore: null }
  }

  let totalPoints = 0
  let totalCoefficients = 0
  let best = -Infinity
  let worst = Infinity

  for (const grade of grades) {
    const score = Number(grade.score)
    const maxScore = Math.max(Number(grade.maxScore) || 20, 1)
    const coeff = Number(grade.coefficient) || 1
    const normalizedScore20 = (score / maxScore) * 20

    if (normalizedScore20 > best) best = normalizedScore20
    if (normalizedScore20 < worst) worst = normalizedScore20

    totalPoints += normalizedScore20 * coeff
    totalCoefficients += coeff
  }

  const average = totalCoefficients > 0 ? totalPoints / totalCoefficients : null
  return {
    average,
    totalCoefficients,
    bestScore: best === -Infinity ? null : best,
    worstScore: worst === Infinity ? null : worst,
  }
}

export function calcGpaAppreciation(avg: number | null): { label: string; tone: 'emerald' | 'teal' | 'blue' | 'amber' | 'rose' } {
  if (avg === null) return { label: 'Aucune note', tone: 'teal' }
  if (avg >= 16) return { label: 'Très Bien', tone: 'emerald' }
  if (avg >= 14) return { label: 'Bien', tone: 'teal' }
  if (avg >= 12) return { label: 'Assez Bien', tone: 'blue' }
  if (avg >= 10) return { label: 'Passable', tone: 'amber' }
  return { label: 'Insuffisant', tone: 'rose' }
}

export function timeToMinutes(value: string, defaultHour = 8) {
  const [hours, minutes] = value.split(':').map(Number)
  return (Number.isFinite(hours) ? hours : defaultHour) * 60 + (Number.isFinite(minutes) ? minutes : 0)
}
