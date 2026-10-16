/**
 * Devoirs vus par un étudiant : réunion des deux modèles qui cohabitent dans
 * `academic_assignments`.
 *
 * Symptôme (salle ICT4D L1 de démonstration, 2026-09-21) : le tableau de bord
 * web d'une étudiante affichait « Devoirs à rendre : 0 » alors que trois
 * énoncés publiés par ses enseignants la visaient, et « Présences : — » avec
 * quinze relevés à son nom. Le web ne lisait que le modèle « un document par
 * étudiant » (`studentId`), jamais les énoncés publiés une fois pour une
 * audience (`audience`, `teacherId`) dont les rendus vont dans
 * `academic_submissions` — le modèle qu'utilisent le desktop, le mobile et
 * les scripts de démonstration.
 */

export interface AssignmentAudience {
  filieres?: string[]
  niveaux?: string[]
}

export interface LearnerScope {
  program?: string | null
  level?: string | null
}

export interface SubmissionLike {
  status?: string | null
  score?: number | null
  submittedAt?: string | null
  feedback?: string | null
  fileName?: string | null
}

export type LearnerAssignmentStatus = 'À rendre' | 'En retard' | 'Soumis' | 'Noté'

/** `audience` est stocké en JSON texte ; un JSON invalide vaut « pas de ciblage ». */
export function parseAudience(raw: string | null | undefined): AssignmentAudience | null {
  if (!raw || !raw.trim()) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const { filieres, niveaux } = parsed as Record<string, unknown>
    return {
      filieres: Array.isArray(filieres) ? filieres.map(String) : undefined,
      niveaux: Array.isArray(niveaux) ? niveaux.map(String) : undefined,
    }
  } catch {
    return null
  }
}

const norm = (value: string | null | undefined) => (value ?? '').trim().toLowerCase()

/**
 * Un énoncé sans audience vise tout le cours ; avec une audience, la filière
 * et le niveau de l'étudiant doivent tous deux figurer dans les listes non
 * vides. Comparaison insensible à la casse et aux espaces (« ict4d » / « ICT4D »).
 */
export function matchesAudience(raw: string | null | undefined, learner: LearnerScope): boolean {
  const audience = parseAudience(raw)
  if (!audience) return true
  const programs = (audience.filieres ?? []).map(norm).filter(Boolean)
  const levels = (audience.niveaux ?? []).map(norm).filter(Boolean)
  if (programs.length && !programs.includes(norm(learner.program))) return false
  if (levels.length && !levels.includes(norm(learner.level))) return false
  return true
}

/** Un document est un énoncé publié (modèle desktop) s'il n'est rattaché à aucun étudiant précis. */
export function isPublishedStatement(row: { studentId?: string | null; teacherId?: string | null; status?: string | null }): boolean {
  if (row.studentId) return false
  return Boolean(row.teacherId) || norm(row.status) === 'published'
}

/** Statut affiché à l'étudiant pour un énoncé publié, d'après son rendu éventuel et l'échéance. */
export function learnerStatus(submission: SubmissionLike | null | undefined, dueDate: string | null | undefined, now: Date = new Date()): LearnerAssignmentStatus {
  const status = norm(submission?.status)
  if (status === 'graded' || (submission && submission.score != null)) return 'Noté'
  if (status === 'submitted' || submission?.submittedAt) return 'Soumis'
  const due = dueDate ? new Date(dueDate) : null
  if (due && !Number.isNaN(due.getTime()) && due.getTime() < now.getTime()) return 'En retard'
  return 'À rendre'
}

/** Note lisible « 15/20 » — vide tant que le rendu n'est pas corrigé. */
export function formatSubmissionGrade(submission: SubmissionLike | null | undefined, maxScore: number | null | undefined): string {
  if (!submission || submission.score == null) return ''
  const max = maxScore && maxScore > 0 ? maxScore : 20
  return `${submission.score}/${max}`
}

/**
 * Taux de présence d'un étudiant : présents et retards comptent comme
 * présence, les absences justifiées sortent du dénominateur (elles ne
 * pénalisent pas), les absences comptent contre. `null` sans relevé.
 */
export function attendanceRate(records: Array<{ status: string }>): number | null {
  const counted = records.filter((record) => norm(record.status) !== 'justifie')
  if (counted.length === 0) return null
  const present = counted.filter((record) => ['present', 'retard'].includes(norm(record.status))).length
  return Math.round((present / counted.length) * 100)
}
