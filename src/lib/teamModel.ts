/**
 * Logique pure de la page Équipe (testée sous `node --test`), sans React ni
 * Appwrite : ordre d'affichage, liens d'un membre, présence d'une photo.
 */

export interface TeamMemberLike {
  $id: string
  slug: string
  name: string
  role: string
  team: string
  subTeam?: string
  bio?: string
  github?: string
  email?: string
  linkedin?: string
  website?: string
  avatarFileId?: string
  displayOrder: number
}

export interface TeamLink {
  kind: 'github' | 'linkedin' | 'website' | 'email'
  href: string
  label: string
}

/** `displayOrder` croissant ; à égalité, ordre alphabétique pour rester stable d'un rendu à l'autre. */
export function sortTeamMembers<T extends TeamMemberLike>(members: readonly T[]): T[] {
  return [...members].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || a.name.localeCompare(b.name, 'fr'))
}

export function hasPhoto(member: Pick<TeamMemberLike, 'avatarFileId'>): boolean {
  return typeof member.avatarFileId === 'string' && member.avatarFileId.trim().length > 0
}

export function teamMemberLinks(member: TeamMemberLike): TeamLink[] {
  const links: TeamLink[] = []
  if (member.github) links.push({ kind: 'github', href: `https://github.com/${member.github.replace(/^@/, '')}`, label: 'GitHub' })
  if (member.linkedin) links.push({ kind: 'linkedin', href: member.linkedin, label: 'LinkedIn' })
  if (member.website) links.push({ kind: 'website', href: member.website, label: 'Site web' })
  if (member.email) links.push({ kind: 'email', href: `mailto:${member.email}`, label: 'E-mail' })
  return links
}

/** Texte de la carte : la bio si elle existe, sinon le poste et la sous-équipe. */
export function teamMemberBlurb(member: TeamMemberLike): string {
  const bio = member.bio?.trim()
  if (bio) return bio
  return [member.role, member.subTeam].filter((part) => part && part.trim()).join(' · ')
}

/**
 * Décalage vertical d'une carte pour la grille « en escalier » de la référence
 * visuelle : la colonne centrale descend sur trois colonnes, une carte sur
 * deux sur deux colonnes, aucun décalage sur une colonne.
 */
export function staggerOffsetClass(index: number): string {
  const three = index % 3 === 1 ? 'lg:translate-y-12' : 'lg:translate-y-0'
  const two = index % 2 === 1 ? 'md:translate-y-8' : 'md:translate-y-0'
  return `${two} ${three}`
}
