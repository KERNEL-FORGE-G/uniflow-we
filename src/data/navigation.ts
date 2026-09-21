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
  badge?: string
}

/** Menus visibles pour un rôle et un type de compte (logique pure dans navigationModel). */
export function visibleNavItems(role: Role, accountType: 'UNIVERSITY' | 'PERSONAL'): NavItem[] {
  return visibleNavEntries(navItems, role, accountType)
}

export interface AdminNavGroup {
  title: string
  items: NavItem[]
}

export const navItems: NavItem[] = [
  // Commun aux deux types de compte
  { to: '/app',                    icon: 'dashboard',   labelFr: 'Tableau de bord',    labelEn: 'Dashboard',       end: true, roles: ['student', 'delegate', 'teacher'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/cours',              icon: 'courses',     labelFr: 'Mes cours',          labelEn: 'My Courses',      roles: ['student', 'delegate'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/emploi-du-temps',    icon: 'schedule',    labelFr: 'Emploi du temps',    labelEn: 'Schedule',        roles: ['student', 'delegate', 'teacher'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/devoirs',            icon: 'assignments', labelFr: 'Devoirs',            labelEn: 'Assignments',     roles: ['student', 'delegate'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/notes',              icon: 'grades',      labelFr: 'Mes notes',          labelEn: 'My Grades',       roles: ['student', 'delegate'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  // Universitaire uniquement
  { to: '/app/presences',          icon: 'attendance',  labelFr: 'Présences',          labelEn: 'My Attendance',   roles: ['student', 'delegate'] },
  { to: '/app/gestion-presences',  icon: 'attendance',  labelFr: 'Gérer les présences', labelEn: 'Manage Attendance', roles: ['delegate', 'teacher'] },
  { to: '/app/mes-cours-enseignant', icon: 'teacher',   labelFr: 'Espace pédagogique', labelEn: 'Teacher Space',   roles: ['teacher'] },
  { to: '/app/notes',              icon: 'grades',      labelFr: 'Évaluations',        labelEn: 'Grades',          roles: ['teacher'] },
  { to: '/app/messages',           icon: 'messages',    labelFr: 'Messages',           labelEn: 'Messages',        roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/notifications',      icon: 'notifications', labelFr: 'Notifications',    labelEn: 'Notifications',   roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/bibliotheque',       icon: 'library',     labelFr: 'Bibliothèque',       labelEn: 'Library',         roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/salles',             icon: 'room',        labelFr: 'Salles',             labelEn: 'Classrooms',      roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/promotion',          icon: 'badges',      labelFr: 'Candidature délégué', labelEn: 'Delegate Candidacy', roles: ['student', 'delegate'] },
  // Commun
  { to: '/app/parametres',         icon: 'settings',    labelFr: 'Paramètres',         labelEn: 'Settings',        roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  // Pointait vers la page tarifaire publique : la personne connectée sortait de
  // son espace et ne retrouvait ni sa référence ni l'état de sa demande.
  { to: '/app/abonnement',         icon: 'billing',     labelFr: 'Abonnement',         labelEn: 'Subscription',    roles: ['student', 'delegate', 'teacher'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/aide',               icon: 'help',        labelFr: 'Aide & FAQ',         labelEn: 'Help & FAQ',      roles: ['student', 'delegate', 'teacher'], accounts: ['UNIVERSITY', 'PERSONAL'] },
]

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [
      { to: '/admin',           icon: 'dashboard',  labelFr: 'Tableau de bord',      labelEn: 'Dashboard',         end: true },
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
]
