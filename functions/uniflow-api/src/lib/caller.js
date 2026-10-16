/**
 * Identité et rôle de l'appelant d'un service `uniflow-api`.
 *
 * La source de vérité du rôle est constituée par les **labels Appwrite** du
 * compte : le nom du rôle tel quel — `ADMIN`, `TEACHER`, `DELEGATE` (aucun
 * label de rôle = `STUDENT`) — et `superadmin` pour le compte d'administration
 * de la plateforme. Appwrite n'accepte que des lettres et des chiffres dans un
 * label : la forme `role:ADMIN` envisagée au départ est refusée en 400, d'où
 * ces valeurs nues. Ils ne se posent qu'avec la clé serveur : un client ne
 * peut pas les modifier. Le champ `users.role` du
 * document n'est qu'un miroir d'affichage — le document `users` appartient à
 * son propriétaire, un étudiant pourrait s'y écrire `ADMIN`. Avant ce module,
 * plusieurs services lisaient ce document (ou `academic_directory`) pour
 * décider d'un droit : c'est ce trou que ferme `resolveCaller`.
 *
 * Aucune dépendance : `users` et `databases` sont injectés, ce qui permet de
 * tester la matrice de droits avec `node --test` sans `node-appwrite`.
 */

export const DATABASE_ID = 'uniflow'
export const ROLES = ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN']
export const SUPERADMIN_LABEL = 'superadmin'
/** Labels qui portent un rôle ; STUDENT n'en a pas. */
const ROLE_LABELS = ['ADMIN', 'TEACHER', 'DELEGATE']
const isRoleLabel = (label) => typeof label === 'string' && ROLE_LABELS.includes(label.toUpperCase())

/** Identifiant de l'appelant, tel que posé par Appwrite sur l'exécution. */
export function actorIdOf(req) {
  const raw = req?.headers?.['x-appwrite-user-id'] || req?.headers?.['x-appwrite-user']
  return typeof raw === 'string' ? raw.replace(/^user:/, '') : ''
}

/**
 * Rôle porté par les labels ; l'absence de label de rôle vaut STUDENT. Si
 * plusieurs sont présents (état incohérent), le plus élevé l'emporte : c'est
 * l'ordre de `ROLE_LABELS`.
 */
export function roleFromLabels(labels) {
  const list = Array.isArray(labels) ? labels : []
  const present = new Set(list.filter(isRoleLabel).map((label) => label.toUpperCase()))
  return ROLE_LABELS.find((role) => present.has(role)) || 'STUDENT'
}

export function isSuperAdmin(labels) {
  return Array.isArray(labels) && labels.includes(SUPERADMIN_LABEL)
}

/**
 * Labels à écrire pour donner `role` à un compte, sans toucher aux autres
 * labels (dont `superadmin`). STUDENT se traduit par l'absence de label.
 */
export function labelsForRole(existingLabels, role) {
  const kept = (Array.isArray(existingLabels) ? existingLabels : []).filter(
    (label) => typeof label === 'string' && !isRoleLabel(label),
  )
  return ROLE_LABELS.includes(role) ? [...kept, role] : kept
}

/**
 * Matrice de droits pour attribuer `targetRole` à un compte de
 * `targetUniversity`.
 *
 * - `superadmin` : tout rôle, toute université.
 * - `ADMIN` (administration d'une université) : TEACHER, DELEGATE, STUDENT,
 *   et uniquement dans sa propre université.
 * - tout autre appelant : refusé.
 *
 * `existingRole` est le rôle actuel du compte ciblé (modification) : une
 * administration ne peut pas retoucher un compte ADMIN, même pour le
 * rétrograder — sinon deux administrations pourraient se neutraliser.
 */
export function canAssignRole(caller, targetRole, targetUniversity, existingRole = null) {
  if (!caller) return { ok: false, code: 'AUTH_REQUIRED', message: 'Connexion Appwrite requise.' }
  if (!ROLES.includes(targetRole)) return { ok: false, code: 'ROLE_INVALID', message: 'Rôle universitaire invalide.' }
  if (caller.isSuperAdmin) return { ok: true }
  if (caller.role !== 'ADMIN') {
    return { ok: false, code: 'ADMIN_REQUIRED', message: 'Seule l’administration de l’université peut créer ou modifier des comptes.' }
  }
  if (targetRole === 'ADMIN' || existingRole === 'ADMIN') {
    return { ok: false, code: 'SUPERADMIN_REQUIRED', message: 'Les comptes d’administration ne se créent et ne se modifient que depuis le compte administrateur de la plateforme.' }
  }
  if (!caller.university || !targetUniversity || caller.university !== targetUniversity) {
    return { ok: false, code: 'UNIVERSITY_SCOPE_DENIED', message: 'Une administration ne gère que les comptes de sa propre université.' }
  }
  return { ok: true }
}

/**
 * Résout l'appelant : rôle depuis les labels, université / filière / niveau
 * depuis le document `users` (ces trois champs ne sont pas des droits, le
 * document suffit).
 */
export async function resolveCaller(req, users, databases) {
  const userId = actorIdOf(req)
  if (!userId) return null
  const account = await users.get(userId)
  const labels = Array.isArray(account?.labels) ? account.labels : []
  let profile = null
  if (databases) {
    try {
      profile = await databases.getDocument(DATABASE_ID, 'users', userId)
    } catch {
      // Profil pas encore créé (inscription en cours) : l'identité reste
      // valable, seul le périmètre académique est inconnu.
    }
  }
  return {
    userId,
    labels,
    role: roleFromLabels(labels),
    isSuperAdmin: isSuperAdmin(labels),
    name: typeof account?.name === 'string' ? account.name : '',
    email: typeof account?.email === 'string' ? account.email : '',
    // `PLATFORM` : l'admin de la plateforme, sans université ni filière.
    accountType: profile?.accountType === 'PERSONAL' ? 'PERSONAL'
      : profile?.accountType === 'PLATFORM' || isSuperAdmin(labels) ? 'PLATFORM'
        : 'UNIVERSITY',
    university: typeof profile?.university === 'string' ? profile.university : '',
    faculty: typeof profile?.faculty === 'string' ? profile.faculty : '',
    program: typeof profile?.program === 'string' ? profile.program : '',
    level: typeof profile?.level === 'string' ? profile.level : '',
  }
}

/** L'appelant peut-il agir en administration (locale ou plateforme) ? */
export function isAdministrator(caller) {
  return Boolean(caller && (caller.isSuperAdmin || caller.role === 'ADMIN'))
}

/**
 * Un document académique (cours, entrée d'annuaire) est-il dans le périmètre
 * de l'appelant ? Le superadmin voit tout ; un compte sans université renseignée
 * n'est limité par rien (compatibilité avec les comptes créés avant que ce
 * champ ne soit systématique) ; sinon l'université doit correspondre.
 */
export function inCallerUniversity(caller, document) {
  if (!caller) return false
  if (caller.isSuperAdmin) return true
  if (!caller.university) return true
  return document?.university === caller.university
}
