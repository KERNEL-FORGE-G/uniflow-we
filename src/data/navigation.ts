import {
  Home,
  BookOpen,
  Calendar,
  UserCheck,
  MessageSquare,
  Settings,
  GraduationCap,
  BarChart3,
  Users,
  BookMarked,
  CircleDollarSign,
  Database,
  ClipboardList,
  HelpCircle,
  Video,
  MapPin,
  Bell,
  FileText,
  TrendingUp,
  Award,
  Shield,
  Activity,
  CalendarClock,
  Code2,
  type LucideIcon,
} from 'lucide-react'
import { visibleNavEntries, type NavEntry, type NavRole } from './navigationModel'

export type Role = NavRole

export interface NavItem extends NavEntry {
  icon: LucideIcon
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
  { to: '/app',                    icon: Home,          labelFr: 'Tableau de bord',    labelEn: 'Dashboard',       end: true, roles: ['student', 'delegate', 'teacher'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/cours',              icon: BookOpen,      labelFr: 'Mes cours',          labelEn: 'My Courses',      roles: ['student', 'delegate'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/emploi-du-temps',    icon: Calendar,      labelFr: 'Emploi du temps',    labelEn: 'Schedule',        roles: ['student', 'delegate', 'teacher'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/devoirs',            icon: ClipboardList, labelFr: 'Devoirs',            labelEn: 'Assignments',     roles: ['student', 'delegate'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/notes',              icon: GraduationCap, labelFr: 'Mes notes',          labelEn: 'My Grades',       roles: ['student', 'delegate'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  // Universitaire uniquement
  { to: '/app/presences',          icon: UserCheck,     labelFr: 'Présences',          labelEn: 'My Attendance',   roles: ['student', 'delegate'] },
  { to: '/app/gestion-presences',  icon: UserCheck,     labelFr: 'Gérer les présences', labelEn: 'Manage Attendance', roles: ['delegate', 'teacher'] },
  { to: '/app/mes-cours-enseignant', icon: BookMarked,  labelFr: 'Espace pédagogique', labelEn: 'Teacher Space',   roles: ['teacher'] },
  { to: '/app/notes',              icon: TrendingUp,    labelFr: 'Évaluations',        labelEn: 'Grades',          roles: ['teacher'] },
  { to: '/app/messages',           icon: MessageSquare, labelFr: 'Messages',           labelEn: 'Messages',        roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/notifications',      icon: Bell,          labelFr: 'Notifications',      labelEn: 'Notifications',   roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/bibliotheque',       icon: BookMarked,    labelFr: 'Bibliothèque',       labelEn: 'Library',         roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/salles',             icon: MapPin,        labelFr: 'Salles',             labelEn: 'Classrooms',      roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/promotion',          icon: Award,         labelFr: 'Candidature délégué', labelEn: 'Delegate Candidacy', roles: ['student', 'delegate'] },
  // Commun
  { to: '/app/parametres',         icon: Settings,      labelFr: 'Paramètres',         labelEn: 'Settings',        roles: ['student', 'delegate', 'teacher', 'admin'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/pricing',                icon: CircleDollarSign, labelFr: 'Abonnement',      labelEn: 'Subscription',    roles: ['student', 'delegate', 'teacher'], accounts: ['UNIVERSITY', 'PERSONAL'] },
  { to: '/app/aide',               icon: HelpCircle,    labelFr: 'Aide & FAQ',         labelEn: 'Help & FAQ',      roles: ['student', 'delegate', 'teacher'], accounts: ['UNIVERSITY', 'PERSONAL'] },
]

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [
      { to: '/admin',           icon: BarChart3,  labelFr: 'Tableau de bord',      labelEn: 'Dashboard',         end: true },
      { to: '/admin/rapports',  icon: FileText,   labelFr: 'Rapports & Analyses',  labelEn: 'Reports',           end: false },
      { to: '/admin/paiements', icon: CircleDollarSign, labelFr: 'Paiements WhatsApp', labelEn: 'WhatsApp payments', end: false },
      { to: '/admin/historique-presences', icon: CalendarClock, labelFr: 'Historique présences', labelEn: 'Attendance history', end: false },
      { to: '/admin/activite',  icon: Activity,   labelFr: 'Journal d\'activité',  labelEn: 'Activity Log',      end: false },
    ],
  },
  {
    title: 'Gestion Académique',
    items: [
      { to: '/admin/structure', icon: Database,   labelFr: 'Structure Académique', labelEn: 'Academic Structure' },
      { to: '/admin/ue',        icon: BookOpen,   labelFr: 'Unités Enseignement',  labelEn: 'Teaching Units' },
      { to: '/admin/cours',     icon: BookMarked, labelFr: 'Cours',                labelEn: 'Courses' },
      { to: '/admin/salles',    icon: Calendar,   labelFr: 'Salles & Ressources',  labelEn: 'Rooms & Resources' },
    ],
  },
  {
    title: 'Gestion Utilisateurs',
    items: [
      { to: '/admin/utilisateurs', icon: Users,        labelFr: 'Tous les utilisateurs', labelEn: 'All Users' },
      { to: '/admin/etudiants',    icon: GraduationCap,labelFr: 'Étudiants',             labelEn: 'Students' },
      { to: '/admin/enseignants',  icon: UserCheck,    labelFr: 'Enseignants',            labelEn: 'Teachers' },
      { to: '/admin/equipe',       icon: Code2,        labelFr: 'Équipe KERNEL FORGE',    labelEn: 'KERNEL FORGE Team' },
    ],
  },
  {
    title: 'Système',
    items: [
      { to: '/admin/parametres',   icon: Settings, labelFr: 'Paramètres système',  labelEn: 'System Settings' },
      { to: '/admin/securite',     icon: Shield,   labelFr: 'Sécurité & Accès',    labelEn: 'Security & Access' },
    ],
  },
]
