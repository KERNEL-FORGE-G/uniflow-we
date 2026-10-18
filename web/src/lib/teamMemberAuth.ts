import { DEFAULT_TEAM_ROSTER, type TeamMemberLike } from './teamModel.ts'

export interface UserLike {
  email?: string | null
  name?: string | null
  fullName?: string | null
  isSuperAdmin?: boolean
  labels?: string[]
}

export type CreatorMemberLike = TeamMemberLike & { $id: string }

export const CREATOR_MODE_STORAGE_KEY = 'uniflow_creator_interface_mode'
export const CREATOR_REMEMBER_PROMPT_KEY = 'uniflow_creator_prompt_dismissed'

export type CreatorInterfaceMode = 'standard' | 'member'

/**
 * Liste des e-mails des bâtisseurs de KERNEL FORGE ayant créé le projet.
 */
export const CREATOR_EMAILS = new Set(
  DEFAULT_TEAM_ROSTER.map((m) => m.email.toLowerCase().trim()).filter(Boolean)
)

/**
 * Vérifie si l'utilisateur connecté est reconnu comme l'un des membres
 * du groupe ayant créé le projet (équipe KERNEL FORGE).
 */
function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function nameMatches(a: string, b: string): boolean {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return false
  if (na === nb || na.includes(nb) || nb.includes(na)) return true
  const wordsA = new Set(na.split(/\s+/).filter((w) => w.length >= 3))
  const wordsB = nb.split(/\s+/).filter((w) => w.length >= 3)
  const matches = wordsB.filter((w) => wordsA.has(w) || Array.from(wordsA).some((wa) => wa.startsWith(w) || w.startsWith(wa)))
  return matches.length >= 1
}

export function isProjectCreatorMember(user: UserLike | null | undefined): boolean {
  if (!user) return false
  const email = (user.email || '').toLowerCase().trim()
  if (email && CREATOR_EMAILS.has(email)) return true

  // Ravel (superadmin fondateur) ou comptes marqués avec label creator / team
  if ('isSuperAdmin' in user && user.isSuperAdmin) return true
  if ('labels' in user && Array.isArray(user.labels)) {
    const labels = user.labels.map((l) => String(l).toLowerCase().trim())
    if (labels.some((l) => l === 'creator' || l === 'team' || l === 'kernel_forge' || l === 'superadmin')) {
      return true
    }
  }

  // Vérification par slug ou nom
  const name = ('name' in user ? user.name : user.fullName || '') || ''
  return DEFAULT_TEAM_ROSTER.some(
    (m) => (m.email && m.email.toLowerCase() === email) || nameMatches(m.name, name) || (m.slug && normalize(name).includes(normalize(m.slug)))
  )
}

/**
 * Récupère la fiche membre correspondante au compte connecté.
 */
export function getMatchedTeamMember<T extends TeamMemberLike = CreatorMemberLike>(
  user: UserLike | null | undefined,
  roster: T[] = []
): T | null {
  if (!user) return null
  const email = (user.email || '').toLowerCase().trim()
  const name = ('name' in user ? user.name : user.fullName || '') || ''
  const candidatePool = roster.length > 0 ? roster : (DEFAULT_TEAM_ROSTER as unknown as T[])

  // 1. Recherche par e-mail
  if (email) {
    const byEmail = candidatePool.find((m) => (m.email || '').toLowerCase().trim() === email)
    if (byEmail) return byEmail
  }

  // 2. Recherche par nom
  if (name.trim()) {
    const byExactName = candidatePool.find((m) => normalize(m.name) === normalize(name))
    if (byExactName) return byExactName

    const byFuzzyName = candidatePool.find((m) => nameMatches(m.name, name))
    if (byFuzzyName) return byFuzzyName
  }

  // 3. Fallback pour superadmin si aucune correspondance directe (par défaut le lead Ravel)
  if ('isSuperAdmin' in user && user.isSuperAdmin) {
    return candidatePool.find((m) => m.slug === 'ravel') || candidatePool[0] || null
  }

  return null
}

/**
 * Récupère le mode d'interface choisi ('standard' ou 'member').
 */
export function getCreatorInterfacePreference(): CreatorInterfaceMode {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(CREATOR_MODE_STORAGE_KEY) : null
  return stored === 'member' ? 'member' : 'standard'
}

/**
 * Enregistre le mode d'interface choisi.
 */
export function setCreatorInterfacePreference(mode: CreatorInterfaceMode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CREATOR_MODE_STORAGE_KEY, mode)
    window.dispatchEvent(new CustomEvent('uniflow:creator-mode-changed', { detail: mode }))
  }
}
