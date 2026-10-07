import type { UniFlowUser } from './appwrite'
import type { BackendUser } from './api'
import { persistSessionSnapshot } from './sessionPersistence'
import { setAccountType } from './api'

export type DemoRoleKey = 'student' | 'teacher' | 'delegate' | 'admin'

export interface DemoPersona {
  key: DemoRoleKey
  title: string
  badge: string
  description: string
  features: string[]
  accentColor: string
  user: UniFlowUser
  backendUser: BackendUser
}

export const DEMO_PERSONAS: Record<DemoRoleKey, DemoPersona> = {
  student: {
    key: 'student',
    title: 'Étudiant (L3 Informatique)',
    badge: 'Apprentissage & Réussite',
    description: 'Expérimentez le quotidien d’un étudiant camerounais : cours, planning, devoirs, calcul prédictif de moyenne, badges académiques et mode hors-ligne.',
    features: [
      'Emploi du temps synchronisé & alertes de cours',
      'Calcul automatique des moyennes pondérées LMD',
      'Accès aux supports de cours & devoirs à rendre',
      'Catalogue de badges, quêtes & niveau d’assiduité',
      'Messagerie directe avec délégué et professeurs'
    ],
    accentColor: 'from-blue-600 to-indigo-600',
    user: {
      id: 'demo-student-uy1',
      email: 'etudiant.demo@uniflow.cm',
      name: 'Paul Mvondo',
      role: 'STUDENT',
      accountType: 'UNIVERSITY',
      isSuperAdmin: false,
      university: 'Université de Yaoundé I',
      faculty: 'Faculté des Sciences',
      program: 'Informatique',
      level: 'L3',
      country: 'Cameroun',
      username: 'paul_mvondo'
    },
    backendUser: {
      id: 'demo-student-uy1',
      email: 'etudiant.demo@uniflow.cm',
      fullName: 'Paul Mvondo',
      role: 'STUDENT',
      accountType: 'UNIVERSITY',
      isSuperAdmin: false,
      university: 'Université de Yaoundé I',
      faculty: 'Faculté des Sciences',
      program: 'Informatique',
      level: 'L3',
      countryCode: 'CM',
      username: 'paul_mvondo',
      student: {
        firstName: 'Paul',
        lastName: 'Mvondo',
        matricule: '21T2458',
        level: 'L3',
        specialty: 'Informatique'
      }
    }
  },
  teacher: {
    key: 'teacher',
    title: 'Enseignant (Dr. Jeanne Ngono)',
    badge: 'Pédagogie & Évaluations',
    description: 'Gérez vos unités d’enseignement, la validation des présences d’amphi, la publication des devoirs et la saisie pondérée des notes.',
    features: [
      'Vue consolidée des cohortes et cours attribués',
      'Saisie et pondération des notes (CC, TP, Examen)',
      'Validation des feuilles d’émargement transmises',
      'Dépôt de supports de cours et énoncés d’exercices',
      'Communication ciblée par promotion et groupe'
    ],
    accentColor: 'from-teal-600 to-emerald-600',
    user: {
      id: 'demo-teacher-uy1',
      email: 'enseignant.demo@uniflow.cm',
      name: 'Dr. Jeanne Ngono',
      role: 'TEACHER',
      accountType: 'UNIVERSITY',
      isSuperAdmin: false,
      university: 'Université de Yaoundé I',
      faculty: 'Faculté des Sciences',
      program: 'Informatique',
      country: 'Cameroun',
      username: 'dr_ngono'
    },
    backendUser: {
      id: 'demo-teacher-uy1',
      email: 'enseignant.demo@uniflow.cm',
      fullName: 'Dr. Jeanne Ngono',
      role: 'TEACHER',
      accountType: 'UNIVERSITY',
      isSuperAdmin: false,
      university: 'Université de Yaoundé I',
      faculty: 'Faculté des Sciences',
      program: 'Informatique',
      countryCode: 'CM',
      username: 'dr_ngono',
      teacher: {
        firstName: 'Dr. Jeanne',
        lastName: 'Ngono'
      }
    }
  },
  delegate: {
    key: 'delegate',
    title: 'Délégué de Promotion (Alexandre Nkoa)',
    badge: 'Gestion Amphi & Émargement',
    description: 'Le rôle clé sur le terrain : émargement haute vitesse en amphi par QR Code/NFC même sans connexion, et génération d’exports académiques.',
    features: [
      'Pointage instantané par scan QR Code & badges NFC',
      'Mode 100% hors-ligne pour amphis saturés sans 4G',
      'Génération d’exports officiels (PDF & Excel)',
      'Signalement d’incidents de salle ou changement d’amphi',
      'Canal de diffusion officiel de la classe'
    ],
    accentColor: 'from-amber-600 to-orange-600',
    user: {
      id: 'demo-delegate-uy1',
      email: 'delegue.demo@uniflow.cm',
      name: 'Alexandre Nkoa',
      role: 'DELEGATE',
      accountType: 'UNIVERSITY',
      isSuperAdmin: false,
      university: 'Université de Yaoundé I',
      faculty: 'Faculté des Sciences',
      program: 'Informatique',
      level: 'L3',
      country: 'Cameroun',
      username: 'alex_delegue'
    },
    backendUser: {
      id: 'demo-delegate-uy1',
      email: 'delegue.demo@uniflow.cm',
      fullName: 'Alexandre Nkoa',
      role: 'DELEGATE',
      accountType: 'UNIVERSITY',
      isSuperAdmin: false,
      university: 'Université de Yaoundé I',
      faculty: 'Faculté des Sciences',
      program: 'Informatique',
      level: 'L3',
      countryCode: 'CM',
      username: 'alex_delegue',
      student: {
        firstName: 'Alexandre',
        lastName: 'Nkoa',
        matricule: '21T2104',
        level: 'L3',
        specialty: 'Informatique'
      }
    }
  },
  admin: {
    key: 'admin',
    title: 'Administration Campus & Établissement',
    badge: 'Gouvernance & Sécurité',
    description: 'Pilotez l’ensemble de l’infrastructure : structure académique L1-M1, cohortes, assiduité globale, sécurité RBAC et métriques d’audience.',
    features: [
      'Gouvernance multi-filières et gestion des maquettes LMD',
      'Supervision globale des présences et alertes de décrochage',
      'Contrôle d’accès granulaire et gestion des rôles (RBAC)',
      'Statistiques d’audience et rapports académiques',
      'Surveillance des bornes connectées Sentinelle'
    ],
    accentColor: 'from-purple-600 to-indigo-700',
    user: {
      id: 'demo-admin-uy1',
      email: 'admin.demo@uniflow.cm',
      name: 'Administration Démo UniFlow',
      role: 'ADMIN',
      accountType: 'UNIVERSITY',
      isSuperAdmin: true,
      labels: ['admin', 'superadmin'],
      university: 'Université de Yaoundé I',
      faculty: 'Faculté des Sciences',
      country: 'Cameroun',
      username: 'admin_demo'
    },
    backendUser: {
      id: 'demo-admin-uy1',
      email: 'admin.demo@uniflow.cm',
      fullName: 'Administration Démo UniFlow',
      role: 'ADMIN',
      accountType: 'UNIVERSITY',
      isSuperAdmin: true,
      labels: ['admin', 'superadmin'],
      university: 'Université de Yaoundé I',
      faculty: 'Faculté des Sciences',
      countryCode: 'CM',
      username: 'admin_demo'
    }
  }
}

/**
 * Active une session de démonstration instantanée sans authentification réseau.
 * Met à jour le snapshot IndexedDB et les drapeaux locaux pour permettre
 * une exploration immédiate de l'interface en conditions réelles.
 */
export async function activateDemoSession(key: DemoRoleKey): Promise<{ persona: DemoPersona; targetUrl: string }> {
  const persona = DEMO_PERSONAS[key]
  setAccountType('UNIVERSITY')
  await persistSessionSnapshot(persona.user)
  try {
    localStorage.setItem('uniflow_demo_active', key)
    localStorage.setItem('uniflow_account_type', 'UNIVERSITY')
  } catch {}

  try {
    window.dispatchEvent(new CustomEvent('uniflow:session-restored'))
  } catch {}

  const targetUrl = key === 'admin' ? '/admin' : '/app'
  return { persona, targetUrl }
}

export function isDemoSessionActive(): boolean {
  try {
    return localStorage.getItem('uniflow_demo_active') !== null
  } catch {
    return false
  }
}
