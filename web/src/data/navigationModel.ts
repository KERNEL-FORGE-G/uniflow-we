/**
 * Logique pure des menus (testée sous `node --test`, sans icônes ni React).
 * Un menu est visible si le rôle y a droit **et** si le type de compte y a
 * droit : un compte indépendant ne voit jamais les écrans universitaires
 * (présences, messagerie de promotion, salles…), et inversement l'espace
 * personnel n'apparaît pas à un étudiant inscrit.
 */

export type NavRole = 'student' | 'delegate' | 'teacher' | 'admin'
export type NavAccountType = 'UNIVERSITY' | 'PERSONAL'

export interface NavEntry {
  to: string
  labelFr: string
  labelEn: string
  end?: boolean
  roles?: NavRole[]
  /** Types de compte autorisés ; absent = universitaire uniquement. */
  accounts?: NavAccountType[]
}

export function isNavEntryVisible(entry: NavEntry, role: NavRole, accountType: NavAccountType): boolean {
  if (entry.roles && !entry.roles.includes(role)) return false
  const accounts = entry.accounts ?? ['UNIVERSITY']
  return accounts.includes(accountType)
}

export function visibleNavEntries<T extends NavEntry>(entries: T[], role: NavRole, accountType: NavAccountType): T[] {
  return entries.filter((entry) => isNavEntryVisible(entry, role, accountType))
}
