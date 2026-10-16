import type { Role } from '../../utils/userRole'
import type { UniIconName } from '../ui/UniIcon'

/**
 * Navigation de l'espace connecté, par profil.
 *
 * Elle vit ici (et non plus dans `data/navigation.ts`) parce qu'UniFlow n'a
 * plus que trois profils indépendants : chacun gère SES cours, SON planning,
 * SES groupes. Une seule liste « à plat » avec un filtre par rôle suffit,
 * il n'y a plus de variante « université ».
 */
export interface AppNavItem {
  to: string
  icon: UniIconName
  /** Illustration 3D (public/icons/nav) ; l'icône Phosphor sert de repli. */
  image?: string
  labelFr: string
  labelEn: string
  roles: Role[]
  /** Regroupement visuel dans la barre latérale. */
  group: 'apprendre' | 'animer' | 'echanger' | 'compte'
}

const LEARNERS: Role[] = ['student', 'delegate']
const ALL: Role[] = ['student', 'delegate', 'teacher']

/** Route → illustration 3D générée (public/icons/nav/<nom>.png). */
export const NAV_IMAGES: Record<string, string> = {
  '/app': 'dashboard', '/app/cours': 'courses', '/app/mes-cours-enseignant': 'teacher', '/app/emploi-du-temps': 'schedule',
  '/app/devoirs': 'assignments', '/app/notes': 'grades', '/app/evaluations': 'grades', '/app/bibliotheque': 'library',
  '/app/presences': 'attendance', '/app/promotion': 'coordination', '/app/gestion-presences': 'attendance',
  '/app/messages': 'messages', '/app/notifications': 'notifications', '/app/badges-quetes': 'gamification',
  '/app/visio': 'visio', '/app/sentinelle': 'sentinelle',
  '/app/profil': 'students', '/app/abonnement': 'abonnement', '/app/parametres': 'settings', '/app/aide': 'aide',
}

const withImage = <T extends { to: string; image?: string }>(item: T): T =>
  NAV_IMAGES[item.to] && !item.image ? { ...item, image: `/icons/nav/${NAV_IMAGES[item.to]}.png` } : item

export const APP_NAV_ITEMS: AppNavItem[] = ([
  { to: '/app', icon: 'dashboard', labelFr: 'Tableau de bord', labelEn: 'Dashboard', roles: ALL, group: 'apprendre' },
  { to: '/app/cours', icon: 'courses', labelFr: 'Mes cours', labelEn: 'My courses', roles: LEARNERS, group: 'apprendre' },
  { to: '/app/mes-cours-enseignant', icon: 'teacher', labelFr: 'Mes cours & ateliers', labelEn: 'My courses & workshops', roles: ['teacher'], group: 'apprendre' },
  { to: '/app/emploi-du-temps', icon: 'schedule', labelFr: 'Planning', labelEn: 'Schedule', roles: ALL, group: 'apprendre' },
  { to: '/app/devoirs', icon: 'assignments', labelFr: 'Devoirs', labelEn: 'Assignments', roles: ALL, group: 'apprendre' },
  { to: '/app/notes', icon: 'grades', labelFr: 'Résultats', labelEn: 'Results', roles: ALL, group: 'apprendre' },
  { to: '/app/bibliotheque', icon: 'library', labelFr: 'Bibliothèque', labelEn: 'Library', roles: ALL, group: 'apprendre' },
  { to: '/app/evaluations', icon: 'grades', labelFr: 'Correction & évaluations', labelEn: 'Grading', roles: ['teacher'], group: 'apprendre' },
  { to: '/app/sentinelle', icon: 'assistant', labelFr: 'Sentinelle IA', labelEn: 'Sentinelle AI', roles: ALL, group: 'apprendre' },
  { to: '/app/presences', icon: 'attendance', labelFr: 'Mes présences', labelEn: 'My attendance', roles: LEARNERS, group: 'apprendre' },
  { to: '/app/promotion', icon: 'coordination', labelFr: 'Ma promotion', labelEn: 'My Class', roles: LEARNERS, group: 'animer' },
  { to: '/app/gestion-presences', icon: 'attendance', labelFr: 'Faire l’appel', labelEn: 'Take attendance', roles: ['delegate', 'teacher'], group: 'animer' },
  { to: '/app/visio', icon: 'video', labelFr: 'Visioconférence', labelEn: 'Video conference', roles: ALL, group: 'animer' },
  { to: '/app/messages', icon: 'messages', labelFr: 'Messages', labelEn: 'Messages', roles: ALL, group: 'echanger' },
  { to: '/app/notifications', icon: 'notifications', labelFr: 'Notifications', labelEn: 'Notifications', roles: ALL, group: 'echanger' },
  { to: '/app/badges-quetes', icon: 'badges', labelFr: 'Badges & quêtes', labelEn: 'Badges & quests', roles: ALL, group: 'echanger' },
  { to: '/app/profil', icon: 'profile', labelFr: 'Mon profil', labelEn: 'Profile', roles: ALL, group: 'compte' },
  { to: '/app/abonnement', icon: 'billing', labelFr: 'Abonnement', labelEn: 'Subscription', roles: ALL, group: 'compte' },
  { to: '/app/parametres', icon: 'settings', labelFr: 'Paramètres', labelEn: 'Settings', roles: ALL, group: 'compte' },
  { to: '/app/aide', icon: 'help', labelFr: 'Aide', labelEn: 'Help', roles: ALL, group: 'compte' },
] as AppNavItem[]).map(withImage)

export const NAV_GROUP_LABELS: Record<AppNavItem['group'], { fr: string; en: string }> = {
  apprendre: { fr: 'Apprendre', en: 'Learn' },
  animer: { fr: 'Animer mon groupe', en: 'Run my group' },
  echanger: { fr: 'Échanger', en: 'Connect' },
  compte: { fr: 'Mon compte', en: 'My account' },
}

export function navItemsForRole(role: Role): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => item.roles.includes(role))
}

export interface AdminNavItem {
  to: string
  icon: UniIconName
  label: string
  end?: boolean
}

/** Le seul admin restant est le propriétaire de la plateforme (label `superadmin`). */
export const ADMIN_NAV_GROUPS: Array<{ title: string; items: AdminNavItem[] }> = [
  {
    title: 'Pilotage',
    items: [
      { to: '/admin', icon: 'dashboard', label: 'Tableau de bord', end: true },
      { to: '/admin/audience', icon: 'audience', label: 'Audience du site' },
      { to: '/admin/rapports', icon: 'stats', label: 'Rapports' },
      { to: '/admin/paiements', icon: 'billing', label: 'Paiements' },
      { to: '/admin/activite', icon: 'activity', label: 'Journal d’activité' },
    ],
  },
  {
    title: 'Communauté',
    items: [
      { to: '/admin/utilisateurs', icon: 'accounts', label: 'Utilisateurs' },
      { to: '/admin/actualites-notifications', icon: 'notifications', label: 'Actualités & notifications' },
      { to: '/admin/equipe', icon: 'team', label: 'Équipe KERNEL FORGE' },
    ],
  },
  {
    title: 'Système',
    items: [
      { to: '/admin/parametres', icon: 'settings', label: 'Paramètres' },
      { to: '/admin/securite', icon: 'security', label: 'Sécurité & accès' },
    ],
  },
]
