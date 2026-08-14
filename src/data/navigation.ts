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
  type LucideIcon,
} from 'lucide-react'

export type Role = 'student' | 'delegate' | 'teacher' | 'admin'

export interface NavItem {
  to: string
  icon: LucideIcon
  labelFr: string
  labelEn: string
  end?: boolean
  roles?: Role[]
  badge?: string
}

export interface AdminNavGroup {
  title: string
  items: NavItem[]
}

export const navItems: NavItem[] = [
  // Common
  { to: '/app',                    icon: Home,          labelFr: 'Tableau de bord',   labelEn: 'Dashboard',       end: true, roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/independent',        icon: ClipboardList, labelFr: 'Gestion personnelle', labelEn: 'Personal workspace', roles: ['student', 'teacher'] },
  { to: '/app/cours',              icon: BookOpen,      labelFr: 'Mes cours',          labelEn: 'My Courses',      roles: ['student', 'delegate'] },
  { to: '/app/emploi-du-temps',    icon: Calendar,      labelFr: 'Emploi du temps',    labelEn: 'Schedule',        roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/presences',          icon: UserCheck,     labelFr: 'Présences',          labelEn: 'My Attendance',   roles: ['student', 'delegate'] },
  { to: '/app/devoirs',            icon: ClipboardList, labelFr: 'Devoirs',            labelEn: 'Assignments',     roles: ['student', 'delegate'] },
  { to: '/app/notes',              icon: GraduationCap, labelFr: 'Mes notes',          labelEn: 'My Grades',       roles: ['student', 'delegate'] },
  // Delegate specific
  { to: '/app/gestion-presences',  icon: UserCheck,     labelFr: 'Gérer Présences',    labelEn: 'Manage Attendance', roles: ['delegate'] },
  // Teacher specific
  { to: '/app/mes-cours-enseignant', icon: BookMarked,  labelFr: 'Espace Pédagogique', labelEn: 'Teacher Space',   roles: ['teacher'] },
  { to: '/app/notes',              icon: TrendingUp,    labelFr: 'Évaluations',        labelEn: 'Grades',          roles: ['teacher'] },
  // Common
  { to: '/app/visio',              icon: Video,         labelFr: 'Visioconférence',    labelEn: 'Video Conf.',     roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/messages',           icon: MessageSquare, labelFr: 'Messages',           labelEn: 'Messages',        roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/notifications',      icon: Bell,          labelFr: 'Notifications',      labelEn: 'Notifications',   roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/bibliotheque',       icon: BookMarked,    labelFr: 'Bibliothèque',       labelEn: 'Library',         roles: ['student', 'delegate'] },
  { to: '/app/salles',             icon: MapPin,        labelFr: 'Salles',             labelEn: 'Classrooms',      roles: ['student', 'delegate', 'teacher'] },
  { to: '/app/promotion',          icon: Award,         labelFr: 'Postuler Délégué',   labelEn: 'Delegate Candidacy', roles: ['student', 'delegate'] },
  { to: '/app/parametres',         icon: Settings,      labelFr: 'Paramètres',         labelEn: 'Settings',        roles: ['student', 'delegate', 'teacher', 'admin'] },
  { to: '/app/aide',               icon: HelpCircle,    labelFr: 'Aide & FAQ',         labelEn: 'Help & FAQ',      roles: ['student', 'delegate', 'teacher'] },
]

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [
      { to: '/admin',           icon: BarChart3,  labelFr: 'Tableau de bord',      labelEn: 'Dashboard',         end: true },
      { to: '/admin/rapports',  icon: FileText,   labelFr: 'Rapports & Analyses',  labelEn: 'Reports',           end: false },
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
