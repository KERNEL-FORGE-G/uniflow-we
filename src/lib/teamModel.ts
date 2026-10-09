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

/** Roster de secours complet si le BaaS Appwrite est inaccessible ou en cours d'initialisation. */
export const DEFAULT_TEAM_ROSTER = [
  {
    $id: 'ravel',
    slug: 'ravel',
    name: 'NGHOMSI FEUKOUO RAVEL',
    github: 'Archlord12345',
    email: 'ravelnghomsi@gmail.com',
    team: 'Leadership',
    subTeam: 'Architecture & Direction',
    role: 'Fondateur KERNEL FORGE & Architecte',
    badge: 'Fondateur & Lead',
    accent: 'cyan' as const,
    avatarFileId: '/team/ravel.jpg',
    displayOrder: 0,
    website: 'https://ravelnghomsi.me',
    linkedin: 'https://www.linkedin.com/in/kernelforge',
    bio: "Fondateur de KERNEL FORGE (kernelforge.codes) et architecte principal d'UniFlow. Étudiant à l'UY1.",
  },
  {
    $id: 'hassane',
    slug: 'hassane',
    name: 'HASSANE YOUSSOUF OUMAR',
    github: 'Hawadja',
    email: 'h.hawadja1@gmail.com',
    team: 'Backend',
    subTeam: 'Backend Microservices & Réseaux',
    role: 'Backend Developer & Systèmes',
    badge: 'NestJS Backend',
    accent: 'rose' as const,
    avatarFileId: '/team/hassane.jpg',
    displayOrder: 1,
    website: 'https://hawadja.github.io/portfolio/',
    bio: 'Développeur Backend KERNEL FORGE. Spécialisé en microservices et architectures distribuées.',
  },
  {
    $id: 'sandra',
    slug: 'sandra',
    name: 'FEBNCHAK SANDRA BORELLE',
    github: 'FEBNCHAK',
    email: 'sandraborelle0@gmail.com',
    team: 'Frontend',
    subTeam: 'Frontend Mobile App & Web',
    role: 'Développeuse Full-Stack & Mobile UI/UX',
    badge: 'Mobile & Web',
    accent: 'emerald' as const,
    avatarFileId: '/team/sandra.jpg',
    displayOrder: 2,
    bio: 'Développeuse Full-Stack chez KERNEL FORGE. Spécialisée en interfaces mobiles et web réactives (Flutter & React) et ergonomie UX.',
  },
  {
    $id: 'william',
    slug: 'william',
    name: 'MELI WILLIAM',
    github: 'WilliamMeli27',
    email: 'meliwilliam74@gmail.com',
    team: 'Backend',
    subTeam: 'Infrastructure, Réseaux & Sécurité',
    role: 'Infrastructure Réseau & Cybersécurité',
    badge: 'Infra & Cybersec',
    accent: 'amber' as const,
    avatarFileId: '/team/william.jpg',
    displayOrder: 3,
    bio: 'Technicien & Développeur chez KERNEL FORGE. Spécialisé en infrastructure réseau, sécurité des systèmes et bases de données.',
  },
  {
    $id: 'ange',
    slug: 'ange',
    name: 'MOKAM ZUNE Ange Gabrielle',
    github: 'Ange55-star',
    email: 'gabriellemokam9@gmail.com',
    team: 'Backend',
    subTeam: 'Backend, Sécurité & APIs REST',
    role: 'Ingénieure Backend, Sécurité & APIs REST',
    badge: 'Backend & Sécurité',
    accent: 'cyan' as const,
    avatarFileId: '/team/mokam.jpg',
    displayOrder: 4,
    linkedin: 'https://www.linkedin.com/in/gabrielle-mokam-968389326',
    bio: 'Développeuse Backend & Sécurité chez KERNEL FORGE. Experte en APIs REST NestJS/TypeScript, PostgreSQL, webhooks sécurisés MoMo/OM et architecture BaaS Appwrite.',
  },
  {
    $id: 'aliya',
    slug: 'aliya',
    name: 'Aliyatou Rachid Oumou Tourab',
    github: 'aliya-nadi',
    email: 'oumou.aliyatou@facsciences-uy1.cm',
    team: 'Frontend',
    subTeam: 'Frontend Desktop & Web',
    role: 'Frontend Developer',
    badge: 'Web Desktop',
    accent: 'purple' as const,
    avatarFileId: '',
    displayOrder: 5,
  },
  {
    $id: 'judith',
    slug: 'judith',
    name: 'Mandeng Judith Oceanne',
    github: 'oceannemj',
    email: 'judithoceanne12@gmail.com',
    team: 'Frontend',
    subTeam: 'Frontend Mobile App',
    role: 'Mobile Developer',
    badge: 'Mobile App',
    accent: 'emerald' as const,
    avatarFileId: '',
    displayOrder: 6,
  },
  {
    $id: 'juvenal',
    slug: 'juvenal',
    name: 'SINENG KENGNI JUVENAL',
    github: 'skjuv',
    email: 'sinengjuvenal@gmail.com',
    team: 'Frontend',
    subTeam: 'Multiplateforme',
    role: 'Frontend Developer',
    badge: 'Fullstack UI',
    accent: 'indigo' as const,
    avatarFileId: '',
    displayOrder: 7,
  },
  {
    $id: 'tessoh-pekam-marcel',
    slug: 'tessoh-pekam-marcel',
    name: 'Tessoh pekam marcel',
    github: '',
    email: 'tesmarcel48@gmail.com',
    team: 'Frontend',
    subTeam: 'MARKETING',
    role: 'Chef branche marketing',
    badge: 'MARKETING & Dev frontend',
    accent: 'blue' as const,
    avatarFileId: '',
    displayOrder: 8,
  },
  {
    $id: 'miguel',
    slug: 'miguel',
    name: 'DJOMGUE Miguel',
    github: '',
    email: '',
    team: 'Frontend',
    subTeam: 'Frontend Desktop',
    role: 'Desktop Developer',
    badge: 'Desktop App',
    accent: 'purple' as const,
    avatarFileId: '',
    displayOrder: 9,
  },
]
