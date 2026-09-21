/**
 * Logique pure de l'espace enseignant (`TeacherCoursesPage`) : résumé d'un
 * énoncé publié d'après ses rendus, taille lisible d'un fichier, avancement
 * de l'évaluation. Sans dépendance Appwrite pour être testable.
 */

export interface StatementLike {
  dueDate?: string | null
  allowLate?: boolean | null
}

export interface SubmissionCountLike {
  status?: string | null
  score?: number | null
}

export type StatementPhase = 'En cours' | 'Échéance passée' | 'Corrigé'

export interface StatementSummary {
  submitted: number
  corrected: number
  /** Nombre d'inscrits qui n'ont rien rendu (0 si l'effectif est inconnu). */
  missing: number
  phase: StatementPhase
}

/**
 * Résumé affiché sur la carte d'un devoir. « Corrigé » ne s'affiche que si
 * l'échéance est passée ET que tous les rendus sont notés : avant l'échéance,
 * de nouveaux rendus peuvent encore arriver, un devoir n'est donc jamais
 * « terminé » même si tout ce qui a été remis est déjà noté.
 */
export function summarizeStatement(statement: StatementLike, submissions: SubmissionCountLike[], enrolledCount = 0, now: Date = new Date()): StatementSummary {
  const submitted = submissions.length
  const corrected = submissions.filter((row) => (row.status ?? '').toUpperCase() === 'GRADED' || row.score != null).length
  const due = statement.dueDate ? new Date(statement.dueDate).getTime() : Number.NaN
  const overdue = Number.isFinite(due) && due < now.getTime()
  const phase: StatementPhase = overdue ? (submitted > 0 && corrected === submitted ? 'Corrigé' : 'Échéance passée') : 'En cours'
  return { submitted, corrected, missing: Math.max(0, enrolledCount - submitted), phase }
}

/** « 1,8 Mo » : même format que le desktop pour que les deux listes se ressemblent. */
export function humanFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

/** Extension en majuscules (« PDF »), vide si le nom n'en a pas. */
export function fileKind(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  if (dot <= 0 || dot === fileName.length - 1) return ''
  return fileName.slice(dot + 1).toUpperCase()
}

/**
 * Part des inscrits ayant au moins une note, en pourcentage entier. Remplace
 * la barre « Progression 0 % » codée en dur : c'est la seule progression que
 * le cours mesure vraiment côté enseignant.
 */
export function evaluationProgress(enrolledCount: number, evaluatedCount: number): number {
  if (enrolledCount <= 0) return 0
  return Math.min(100, Math.round((evaluatedCount / enrolledCount) * 100))
}

/**
 * Convertit la valeur d'un `<input type="datetime-local">` (heure locale,
 * sans fuseau) en ISO UTC, le format que le desktop écrit dans `dueDate`.
 * Retourne `null` si la saisie est vide ou illisible.
 */
export function localInputToIso(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : null
}
