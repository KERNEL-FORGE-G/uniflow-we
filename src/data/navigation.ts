import type { UniIconName } from '../components/ui/UniIcon'
import { visibleNavEntries, type NavEntry, type NavRole } from './navigationModel'

export type Role = NavRole

/**
 * L'icône est un nom sémantique de la table `docs/icones-uniflow.md`, pas un
 * composant : le mobile et le desktop nomment les mêmes entrées avec les mêmes
 * icônes Phosphor, et ce fichier reste importable sans React.
 */
export interface NavItem extends NavEntry {
  icon: UniIconName
  /** Illustration 3D (public/icons/nav) ; l'icône Phosphor sert de repli. */
  image?: string
  badge?: string
}

/** Route → illustration 3D générée pour la navigation. */
const NAV_IMAGES: Record<string, string> = {
  '/app': 'dashboard',
  '/app/cours': 'courses',
  '/app/mes-cours-enseignant': 'teacher',
  '/app/emploi-du-temps': 'schedule',
  '/app/devoirs': 'assignments',
  '/app/notes': 'grades',
  '/app/evaluations': 'grades',
  '/app/presences': 'attendance',
  '/app/gestion-presences': 'coordination',
  '/app/messages': 'messages',
  '/app/notifications': 'notifications',
  '/app/bibliotheque': 'library',
  '/app/parametres': 'settings',
  '/app/visio': 'visio',
  '/app/gamification': 'gamification',
  '/app/sentinelle': 'sentinelle',
  '/app/abonnement': 'abonnement',
  '/app/aide': 'aide',
  '/app/actualites': 'analytics',
  '/app/mail': 'messages',
  '/admin': 'dashboard',
  '/admin/mail': 'messages',
  '/admin/actualites-notifications': 'notifications',
  '/admin/rapports': 'analytics',
  '/admin/analytics': 'analytics',
  '/admin/paiements': 'paiements',
  '/admin/historique-presences': 'attendance',
  '/admin/structure': 'structure',
  '/admin/ue': 'courses',
  '/admin/cours': 'library',
  '/admin/salles': 'rooms',
  '/admin/etudiants': 'students',
  '/admin/enseignants': 'teachers',
  '/admin/parametres': 'settings',
}

function withImage<T extends NavItem>(item: T): T {
  const key = NAV_IMAGES[item.to]
  return key && !item.image ? { ...item, image: `/icons/nav/${key}.png` } : item
}

/** Menus visibles pour un rôle et un type de compte (logique pure dans navigationModel). */
export function visibleNavItems(role: Role, accountType: 'UNIVERSITY' | 'PERSONAL'): NavItem[] {
  return visibleNavEntries(navItems, role, accountType)
}

export interface AdminNavGroup {
  title: string
  items: NavItem[]
}

export const navItems: NavItem[] = ([
  // Commun aux deux types de compte
  { to: '/app',                    icon: 'dashboard',   labelFr: 'Tableau de bord',    labelEn: 'Dashboard',       end: true, roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/actualites',         icon: 'notifications', labelFr: 'Actualités Campus', labelEn: 'Campus News',   roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/mail',               icon: 'email',       labelFr: 'UniMail (@uniflow)', labelEn: 'UniFlow Mail',    roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  // Cours & Enseignement
  { to: '/app/cours',              icon: 'courses',     labelFr: 'Mes cours',          labelEn: 'My Courses',      roles: ['student', 'delegate', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/mes-cours-enseignant', icon: 'teacher',   labelFr: 'Espace pédagogique', labelEn: 'Teacher Space',   roles: ['teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/emploi-du-temps',    icon: 'schedule',    labelFr: 'Emploi du temps',    labelEn: 'Schedule',        roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/devoirs',            icon: 'assignments', labelFr: 'Devoirs & Projets', labelEn: 'Assignments',     roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/notes',              icon: 'grades',      labelFr: 'Mes notes',          labelEn: 'My Grades',       roles: ['student', 'delegate', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/evaluations',        icon: 'grades',      labelFr: 'Évaluations',        labelEn: 'Grades',          roles: ['teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  // Coordination & Présences
  { to: '/app/presences',          icon: 'attendance',  labelFr: 'Présences',          labelEn: 'My Attendance',   roles: ['student', 'delegate', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/gestion-presences',  icon: 'attendance',  labelFr: 'Coordination groupe', labelEn: 'Group Coordination', roles: ['delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  // Communication & Ressources
  { to: '/app/messages',           icon: 'messages',    labelFr: 'Messages',           labelEn: 'Messages',        roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/notifications',      icon: 'notifications', labelFr: 'Notifications',    labelEn: 'Notifications',   roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/bibliotheque',       icon: 'library',     labelFr: 'Bibliothèque',       labelEn: 'Library',         roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  // Commun
  { to: '/app/parametres',         icon: 'settings',    labelFr: 'Paramètres',         labelEn: 'Settings',        roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/visio',              icon: 'video',      labelFr: 'Visioconférence',    labelEn: 'Video Conference', roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/gamification',      icon: 'trophy',     labelFr: 'Gamification',       labelEn: 'Gamification',      roles: ['student', 'delegate', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/sentinelle',        icon: 'assistant',  labelFr: 'Sentinelle IA',      labelEn: 'Sentinelle AI',     roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/abonnement',         icon: 'billing',     labelFr: 'Abonnement',         labelEn: 'Subscription',    roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/aide',               icon: 'help',        labelFr: 'Aide & FAQ',         labelEn: 'Help & FAQ',      roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
] as NavItem[]).map(withImage)

export const adminNavGroups: AdminNavGroup[] = ([
  {
    title: "Vue d'ensemble & Services",
    items: [
      { to: '/admin',           icon: 'dashboard',  labelFr: 'Tableau de bord',      labelEn: 'Dashboard',         end: true },
      { to: '/admin/mail',      icon: 'email',      labelFr: 'Messagerie UniMail (@uniflow)', labelEn: 'UniMail (@uniflow)', end: false },
      { to: '/admin/actualites-notifications', icon: 'notifications', labelFr: 'Actualités & Notifications', labelEn: 'News & Notifications', end: false },
      { to: '/actualites',      icon: 'globe',      labelFr: 'Page Actualités (Public)', labelEn: 'Public News Page', end: false },
      { to: '/app',             icon: 'students',   labelFr: 'Espace Étudiant / App', labelEn: 'User Workspace',   end: false },
      { to: '/admin/rapports',  icon: 'stats',      labelFr: 'Rapports & Analyses',  labelEn: 'Reports',           end: false },
      { to: '/admin/paiements', icon: 'billing',    labelFr: 'Paiements WhatsApp',   labelEn: 'WhatsApp payments', end: false },
      { to: '/admin/audience',  icon: 'audience',   labelFr: 'Audience du site',     labelEn: 'Site audience',     end: false },
      { to: '/admin/historique-presences', icon: 'agenda', labelFr: 'Historique présences', labelEn: 'Attendance history', end: false },
      { to: '/admin/activite',  icon: 'activity',   labelFr: 'Journal d\'activité',  labelEn: 'Activity Log',      end: false },
    ],
  },
  {
    title: 'Gestion Académique',
    items: [
      { to: '/admin/structure', icon: 'university', labelFr: 'Structure Académique', labelEn: 'Academic Structure' },
      { to: '/admin/ue',        icon: 'courseUnit', labelFr: 'Unités Enseignement',  labelEn: 'Teaching Units' },
      { to: '/admin/cours',     icon: 'courses',    labelFr: 'Cours',                labelEn: 'Courses' },
      { to: '/admin/salles',    icon: 'room',       labelFr: 'Salles & Ressources',  labelEn: 'Rooms & Resources' },
    ],
  },
  {
    title: 'Gestion Utilisateurs',
    items: [
      { to: '/admin/utilisateurs', icon: 'accounts',  labelFr: 'Tous les utilisateurs', labelEn: 'All Users' },
      { to: '/admin/etudiants',    icon: 'students',  labelFr: 'Étudiants',             labelEn: 'Students' },
      { to: '/admin/enseignants',  icon: 'teachers',  labelFr: 'Enseignants',            labelEn: 'Teachers' },
      { to: '/admin/equipe',       icon: 'team',      labelFr: 'Équipe KERNEL FORGE',    labelEn: 'KERNEL FORGE Team' },
    ],
  },
  {
    title: 'Système',
    items: [
      { to: '/admin/parametres',   icon: 'settings', labelFr: 'Paramètres système',  labelEn: 'System Settings' },
      { to: '/admin/securite',     icon: 'security', labelFr: 'Sécurité & Accès',    labelEn: 'Security & Access' },
    ],
  },
] as AdminNavGroup[]).map((group) => ({ ...group, items: group.items.map(withImage) }))
