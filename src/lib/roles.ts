/**
 * Rôles UniFlow côté client — logique pure, sans React ni Appwrite, testée
 * avec `node --test src/lib/roles.test.ts`.
 *
 * Contrat commun aux trois clients : la preuve du rôle est constituée par les
 * **labels Appwrite** du compte (`account.get().labels`), posés uniquement
 * avec la clé serveur : `ADMIN`, `TEACHER`, `DELEGATE` (aucun label de rôle
 * = `STUDENT`) et `superadmin` pour l'administrateur de la plateforme. Le
 * champ `users.role` du document n'est qu'un miroir d'affichage : il sert de
 * repli quand les labels ne sont pas lisibles (instantané hors ligne), jamais
 * de preuve — le serveur revérifie de son côté.
 */

export type UniFlowRole = 'STUDENT' | 'DELEGATE' | 'TEACHER' | 'ADMIN'
/** `PLATFORM` : compte de l'administrateur de la plateforme, sans université ni périmètre. */
export type UniFlowAccountType = 'UNIVERSITY' | 'PERSONAL' | 'PLATFORM'

export const UNIFLOW_ROLES: readonly UniFlowRole[] = ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN']
export const SUPERADMIN_LABEL = 'superadmin'
/** Du plus élevé au plus bas : en cas de labels multiples, le premier gagne. */
const ROLE_LABELS: readonly UniFlowRole[] = ['ADMIN', 'TEACHER', 'DELEGATE']

export const ROLE_LABELS_FR: Record<UniFlowRole, string> = {
  STUDENT: 'Étudiant',
  DELEGATE: 'Délégué',
  TEACHER: 'Enseignant',
  ADMIN: 'Administration',
}

export function isUniFlowRole(value: unknown): value is UniFlowRole {
  return typeof value === 'string' && (UNIFLOW_ROLES as readonly string[]).includes(value)
}

/** Rôle porté par les labels ; `null` si aucun label de rôle (= STUDENT pour un compte universitaire). */
export function roleFromLabels(labels: readonly string[] | undefined | null): UniFlowRole | null {
  if (!Array.isArray(labels)) return null
  const present = new Set(labels.filter((label) => typeof label === 'string').map((label) => label.toUpperCase()))
  return ROLE_LABELS.find((role) => present.has(role)) ?? null
}

export function isSuperAdmin(labels: readonly string[] | undefined | null): boolean {
  return Array.isArray(labels) && labels.includes(SUPERADMIN_LABEL)
}

/**
 * Rôle effectif : labels d'abord, miroir `users.role` ensuite, STUDENT sinon.
 * Les labels sont **toujours** crus quand ils sont lisibles, y compris quand
 * ils ne contiennent aucun rôle : un document qui dit ADMIN sans label ADMIN
 * est un document bricolé, pas une promotion.
 */
export function resolveRole(labels: readonly string[] | undefined | null, mirrorRole?: string | null): UniFlowRole {
  if (Array.isArray(labels)) return roleFromLabels(labels) ?? 'STUDENT'
  return isUniFlowRole(mirrorRole) ? mirrorRole : 'STUDENT'
}

export interface RoleCaller {
  role: UniFlowRole
  isSuperAdmin: boolean
  university?: string
}

/**
 * Miroir client de la matrice serveur (`functions/uniflow-api/src/lib/caller.js`) :
 * sert à n'afficher que les actions qui aboutiront. Le serveur reste juge.
 */
export function assignableRoles(caller: RoleCaller | null | undefined): UniFlowRole[] {
  if (!caller) return []
  if (caller.isSuperAdmin) return ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN']
  if (caller.role === 'ADMIN') return ['STUDENT', 'DELEGATE', 'TEACHER']
  return []
}

export function canAssignRole(caller: RoleCaller | null | undefined, targetRole: UniFlowRole, targetUniversity?: string, existingRole?: UniFlowRole | null): boolean {
  if (!caller) return false
  if (caller.isSuperAdmin) return true
  if (caller.role !== 'ADMIN') return false
  if (targetRole === 'ADMIN' || existingRole === 'ADMIN') return false
  if (!caller.university || !targetUniversity) return false
  return caller.university === targetUniversity
}

/** Un compte peut-il gérer les comptes (page Annuaire admin) ? */
export function canManageAccounts(caller: RoleCaller | null | undefined): boolean {
  return Boolean(caller && (caller.isSuperAdmin || caller.role === 'ADMIN'))
}

/**
 * Espaces autorisés selon le type de compte. Un compte universitaire n'a pas
 * de gestion personnelle (ses données viennent de l'université) ; un compte
 * indépendant ne voit pas les écrans universitaires.
 */
export type Workspace = 'university' | 'personal'

export function workspaceOf(accountType: UniFlowAccountType | undefined | null): Workspace {
  // Le compte PLATFORM administre les universités : il partage l'espace universitaire, jamais le personnel.
  return accountType === 'PERSONAL' ? 'personal' : 'university'
}

export function canAccessWorkspace(accountType: UniFlowAccountType | undefined | null, workspace: Workspace): boolean {
  return workspaceOf(accountType) === workspace
}
