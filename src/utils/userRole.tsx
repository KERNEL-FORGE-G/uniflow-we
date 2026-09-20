import { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react'
import { clearTokens, type BackendUser } from '@/lib/api'
import { getCurrentAccount, type UniFlowUser } from '@/lib/appwrite'
import { isUniFlowRole, ROLE_LABELS_FR, type UniFlowRole } from '@/lib/roles'
import { avatarFileUrl } from '@/utils/avatarUtils'
import { clearSessionSnapshot, persistSessionSnapshot, readSessionSnapshot } from '@/lib/sessionPersistence'

export type Role = 'student' | 'delegate' | 'teacher' | 'admin'

export interface UserProfile {
  name: string
  roleLabel: string
  email: string
  avatar?: string
  status: 'En ligne' | 'Hors ligne' | 'Synchro...'
  filiere?: string
  role?: string
  phone?: string
  address?: string
  level?: string
  matricule?: string
  accountType?: 'UNIVERSITY' | 'PERSONAL' | 'PLATFORM'
  countryCode?: string
  /** Pseudo unique : c'est lui que la messagerie utilise pour adresser un contact. */
  username?: string
  /** Identifiant du fichier de la photo de profil, tel qu'enregistré sur le profil. */
  avatarFileId?: string
  /** Administrateur de la plateforme (label Appwrite `superadmin`). */
  isSuperAdmin?: boolean
  /** Rôle normalisé UniFlow, tel que résolu depuis les labels. */
  uniflowRole?: UniFlowRole
  university?: string
  faculty?: string
  program?: string
  /** Libellé du périmètre : « Faculté des Sciences », « INF · L2 », « Toute la plateforme ». */
  scopeLabel?: string
}

const EMPTY_PROFILE: UserProfile = {
  name: 'Utilisateur non connecté',
  roleLabel: 'Non connecté',
  email: '—',
  status: 'Hors ligne',
}

interface RoleContextProps {
  currentRole: Role
  setCurrentRole: (role: Role) => void
  setAuthUser: (user: BackendUser | null) => void
  authUser: BackendUser | null
  isSessionReady: boolean
  currentUser: UserProfile
  isOfflineMode: boolean
  setIsOfflineMode: (offline: boolean) => void
  language: 'FR' | 'EN'
  setLanguage: (lang: 'FR' | 'EN') => void
}

const RoleContext = createContext<RoleContextProps | undefined>(undefined)

function mapRole(raw: string | undefined): Role {
  switch (raw) {
    case 'ETUDIANT':
    case 'STUDENT':
    case 'INDEPENDENT_STUDENT':
    case 'student': return 'student'
    case 'DELEGUE':
    case 'DELEGATE':
    case 'delegate': return 'delegate'
    case 'ENSEIGNANT':
    case 'TEACHER':
    case 'INDEPENDENT_TEACHER':
    case 'teacher': return 'teacher'
    case 'ADMIN':
    case 'admin': return 'admin'
    default: return 'student'
  }
}

function buildUserProfile(user: BackendUser | null): UserProfile {
  if (!user) return EMPTY_PROFILE
  const role = mapRole(user.role)
  const fullNameParts = user.fullName?.trim().split(/\s+/).filter(Boolean) ?? []
  const firstName = user.student?.firstName ?? user.teacher?.firstName ?? fullNameParts[0] ?? user.email.split('@')[0]
  const lastName = user.student?.lastName ?? user.teacher?.lastName ?? fullNameParts.slice(1).join(' ')
  const studentLevel = user.student?.level ?? user.level
  const studentSpecialty = user.student?.specialty ?? user.program
  const uniflowRole: UniFlowRole = isUniFlowRole(user.role) ? user.role : 'STUDENT'
  const accountType: UserProfile['accountType'] = user.accountType === 'PERSONAL' || user.accountCategory === 'PERSONAL'
    ? 'PERSONAL'
    : user.accountType === 'PLATFORM' || user.isSuperAdmin ? 'PLATFORM' : 'UNIVERSITY'
  const learner = role === 'student' || role === 'delegate'
  const scopeLabel = accountType === 'PLATFORM'
    ? 'Toute la plateforme'
    : accountType === 'PERSONAL'
      ? undefined
      : learner
        ? [user.program, studentLevel].filter(Boolean).join(' · ') || undefined
        : user.faculty || user.university || undefined

  return {
    name: `${firstName}${lastName ? ` ${lastName}` : ''}`,
    email: user.email,
    roleLabel: accountType === 'PERSONAL' ? 'Compte indépendant' : accountType === 'PLATFORM' ? 'Administrateur de la plateforme' : ROLE_LABELS_FR[uniflowRole],
    status: 'En ligne',
    role,
    uniflowRole,
    isSuperAdmin: Boolean(user.isSuperAdmin),
    university: user.university,
    faculty: user.faculty,
    program: user.program,
    scopeLabel,
    // Filière et niveau viennent du profil ; rien n'est présumé quand ils manquent.
    filiere: learner && accountType === 'UNIVERSITY' ? [studentLevel, studentSpecialty].filter(Boolean).join(' · ') || undefined : undefined,
    level: learner ? studentLevel : undefined,
    matricule: user.student?.matricule,
    accountType,
    countryCode: user.countryCode,
    username: user.username,
    avatarFileId: user.avatarFileId,
    // Résolu ici une fois pour toutes : les composants de présentation
    // reçoivent une URL affichable et n'ont pas à connaître Appwrite.
    avatar: avatarFileUrl(user.avatarFileId) || undefined,
  }
}

function appwriteUserToBackendUser(user: Pick<UniFlowUser, 'id' | 'name' | 'role' | 'accountType'> & Partial<Pick<UniFlowUser, 'email' | 'username' | 'avatarFileId' | 'labels' | 'isSuperAdmin' | 'university' | 'faculty' | 'program' | 'level'>>): BackendUser {
  return {
    id: user.id,
    email: user.email || '',
    role: user.role,
    fullName: user.name,
    accountType: user.accountType,
    username: user.username,
    avatarFileId: user.avatarFileId,
    labels: user.labels,
    isSuperAdmin: Boolean(user.isSuperAdmin),
    university: user.university,
    faculty: user.faculty,
    program: user.program,
    level: user.level,
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<BackendUser | null>(null)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [currentRole, setRoleState] = useState<Role>('student')
  const currentUser = useMemo(() => buildUserProfile(authUser), [authUser])
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => localStorage.getItem('uniflow_offline') === 'true')
  const [language, setLanguage] = useState<'FR' | 'EN'>(() => (localStorage.getItem('uniflow_lang') as 'FR' | 'EN') || 'FR')

  const restoreSession = useCallback(async () => {
    const snapshot = await readSessionSnapshot()
    let restored: UniFlowUser | null = null
    let unavailable = false
    try {
      restored = await getCurrentAccount(snapshot?.user.accountType)
    } catch {
      unavailable = true
    }

    if (restored) {
      const user = appwriteUserToBackendUser(restored)
      setAuthUser(user)
      setRoleState(mapRole(user.role))
      // Compatibilité de routage uniquement ; aucun profil ni secret n’est gardé dans localStorage.
      localStorage.setItem('uniflow_account_type', restored.accountType)
      localStorage.removeItem('uniflow_user')
      await persistSessionSnapshot(restored)
      try { window.dispatchEvent(new CustomEvent('uniflow:session-restored')) } catch {}
    } else if (snapshot && (!navigator.onLine || unavailable)) {
      // Les seules données IndexedDB sont des métadonnées de profil. Elles
      // maintiennent la navigation pendant une indisponibilité temporaire, mais
      // ne remplacent jamais le cookie Appwrite comme preuve d’authentification.
      const user = appwriteUserToBackendUser(snapshot.user)
      setAuthUser(user)
      setRoleState(mapRole(user.role))
    } else {
      // Une réponse 401 Appwrite sans instantané valide signifie que la session
      // est réellement expirée : on nettoie alors l’état local.
      clearTokens()
      localStorage.removeItem('uniflow_account_type')
      await clearSessionSnapshot()
      setAuthUser(null)
      setRoleState('student')
    }
    setIsSessionReady(true)
  }, [])

  useEffect(() => {
    void restoreSession()
    const retry = () => { void restoreSession() }
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [restoreSession])

  const setCurrentRole = (role: Role) => setRoleState(role)
  const toggleOffline = (offline: boolean) => {
    setIsOfflineMode(offline)
    localStorage.setItem('uniflow_offline', String(offline))
  }
  const toggleLanguage = (lang: 'FR' | 'EN') => {
    setLanguage(lang)
    localStorage.setItem('uniflow_lang', lang)
  }

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, setAuthUser, authUser, isSessionReady, currentUser, isOfflineMode, setIsOfflineMode: toggleOffline, language, setLanguage: toggleLanguage }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useUserRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error('useUserRole must be used within a RoleProvider')
  return context
}
