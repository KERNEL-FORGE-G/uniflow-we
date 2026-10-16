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
  if (typeof value !== 'string') return false
  return (UNIFLOW_ROLES as readonly string[]).includes(value.toUpperCase())
}

/** Rôle porté par les labels ; `null` si aucun label de rôle (= STUDENT pour un compte universitaire). */
export function roleFromLabels(labels: readonly string[] | undefined | null): UniFlowRole | null {
  if (!Array.isArray(labels)) return null
  const present = new Set(labels.filter((label) => typeof label === 'string').map((label) => label.toUpperCase()))
  return ROLE_LABELS.find((role) => present.has(role)) ?? null
}

export function isSuperAdmin(labels: readonly string[] | undefined | null, accountType?: string | null): boolean {
  if (accountType === 'PLATFORM') return true
  if (!Array.isArray(labels)) return false
  return labels.some((label) => typeof label === 'string' && (label.toLowerCase() === SUPERADMIN_LABEL || label.toUpperCase() === 'ADMIN' && accountType === 'PLATFORM'))
}

/**
 * Rôle effectif : labels d'abord si un rôle y est posé, miroir `users.role` ensuite, STUDENT sinon.
 * Si aucun rôle n'est spécifié dans les labels (ex: labels vides sur un client sans clé serveur),
 * le rôle du document en base fait foi.
 */
export function resolveRole(labels: readonly string[] | undefined | null, mirrorRole?: string | null): UniFlowRole {
  const fromLabels = roleFromLabels(labels)
  if (fromLabels) return fromLabels
  if (typeof mirrorRole === 'string') {
    const upper = mirrorRole.toUpperCase()
    if ((UNIFLOW_ROLES as readonly string[]).includes(upper)) {
      return upper as UniFlowRole
    }
  }
  return 'STUDENT'
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
