/**
 * Périmètre académique d'un utilisateur — logique pure, testée sous `node --test`.
 *
 * Symptôme corrigé (2026-09-20) : la couche données filtrait tout sur
 * « Université de Yaoundé I / ICT4D / L1 » alors que la base porte 12
 * filières, 296 UE et 527 séances. Le périmètre vient désormais du profil
 * (`users.university/faculty/program/level`) ou d'un sélecteur, jamais d'une
 * constante.
 *
 * - PLATFORM / superadmin : aucun périmètre implicite (tout est visible).
 * - ADMIN : son université et sa faculté ; filière et niveau par sélecteur.
 * - TEACHER : son université ; ses cours sont ceux qui le nomment.
 * - STUDENT / DELEGATE : université, filière et niveau du profil.
 */

export type AcademicLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2'
export const ACADEMIC_LEVELS: readonly AcademicLevel[] = ['L1', 'L2', 'L3', 'M1', 'M2']

export interface AcademicScope {
  university?: string
  faculty?: string
  program?: string
  level?: string
}

export interface ScopedUser {
  accountType?: 'UNIVERSITY' | 'PERSONAL' | 'PLATFORM' | string | null
  isSuperAdmin?: boolean
  role?: string | null
  university?: string | null
  faculty?: string | null
  program?: string | null
  level?: string | null
}

export interface ScopedDocument {
  university?: string | null
  faculty?: string | null
  program?: string | null
  level?: string | null
}

const clean = (value: string | null | undefined) => (typeof value === 'string' ? value.trim() : '')

export function isPlatformAccount(user: ScopedUser | null | undefined): boolean {
  return Boolean(user && (user.accountType === 'PLATFORM' || user.isSuperAdmin))
}

/** Périmètre implicite déduit du profil. Vide = tout voir. */
export function scopeOf(user: ScopedUser | null | undefined): AcademicScope {
  if (!user || isPlatformAccount(user)) return {}
  const scope: AcademicScope = {}
  const university = clean(user.university)
  if (university) scope.university = university
  if (user.role === 'ADMIN') {
    const faculty = clean(user.faculty)
    if (faculty) scope.faculty = faculty
    return scope
  }
  if (user.role === 'TEACHER') return scope
  const program = clean(user.program)
  const level = clean(user.level).toUpperCase()
  if (program) scope.program = program
  if (level) scope.level = level
  return scope
}

/** Étudiant ou délégué : un compte dont la grille est celle de sa filière et de son niveau, sans choix possible. */
export function isLearnerRole(role: string | null | undefined): boolean {
  return role === 'STUDENT' || role === 'DELEGATE'
}

/**
 * Un étudiant ne doit voir que sa filière **et** son niveau, rien d'autre.
 * Un profil sans l'un des deux ne retombe donc jamais sur « toute
 * l'université » : il n'a pas d'emploi du temps affichable tant que son
 * rattachement n'est pas complété par l'administration.
 */
export function isLearnerScopeComplete(scope: AcademicScope): boolean {
  return Boolean(clean(scope.program) && clean(scope.level))
}

/** Fusionne le périmètre implicite et une sélection explicite (les champs choisis l'emportent). */
export function mergeScope(base: AcademicScope, selection: Partial<AcademicScope> | null | undefined): AcademicScope {
  const merged: AcademicScope = { ...base }
  for (const key of ['university', 'faculty', 'program', 'level'] as const) {
    const value = clean(selection?.[key])
    if (value) merged[key] = key === 'level' ? value.toUpperCase() : value
  }
  return merged
}

export function matchesScope(document: ScopedDocument, scope: AcademicScope): boolean {
  if (scope.university && clean(document.university) !== scope.university) return false
  if (scope.faculty && clean(document.faculty) && clean(document.faculty) !== scope.faculty) return false
  if (scope.program && clean(document.program) !== scope.program) return false
  if (scope.level && clean(document.level).toUpperCase() !== scope.level.toUpperCase()) return false
  return true
}

export function filterByScope<T extends ScopedDocument>(documents: readonly T[], scope: AcademicScope): T[] {
  return documents.filter((document) => matchesScope(document, scope))
}

/** Champs à transmettre à `Query.equal` : seuls ceux indexés côté serveur (program, level). */
export function scopeEqualities(scope: AcademicScope): Array<{ field: 'program' | 'level'; value: string }> {
  const equalities: Array<{ field: 'program' | 'level'; value: string }> = []
  if (scope.program) equalities.push({ field: 'program', value: scope.program })
  if (scope.level) equalities.push({ field: 'level', value: scope.level.toUpperCase() })
  return equalities
}

export function isAcademicLevel(value: unknown): value is AcademicLevel {
  return typeof value === 'string' && (ACADEMIC_LEVELS as readonly string[]).includes(value.toUpperCase())
}

/** Libellé court : « INF · L2 », « Toutes les filières · L1 », « Tout le périmètre ». */
export function scopeLabel(scope: AcademicScope): string {
  if (scope.program && scope.level) return `${scope.program} · ${scope.level}`
  if (scope.program) return `${scope.program} · tous niveaux`
  if (scope.level) return `Toutes les filières · ${scope.level}`
  if (scope.faculty) return scope.faculty
  if (scope.university) return scope.university
  return 'Tout le périmètre'
}

/** Un enseignant est rattaché à une séance ou un cours quand son nom y figure. */
export function teacherMatches(teacherName: string | null | undefined, userName: string | null | undefined): boolean {
  const haystack = clean(teacherName).toLowerCase()
  const parts = clean(userName).toLowerCase().split(/\s+/).filter((part) => part.length >= 3)
  if (!haystack || parts.length === 0) return false
  return parts.every((part) => haystack.includes(part)) || haystack === clean(userName).toLowerCase()
}
