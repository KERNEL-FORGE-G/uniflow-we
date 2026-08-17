import { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react'
import { clearTokens, type BackendUser } from '@/lib/api'
import { getCurrentAccount, type UniFlowUser } from '@/lib/appwrite'
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
  accountType?: 'UNIVERSITY' | 'PERSONAL'
  countryCode?: string
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
  const studentLevel = user.student?.level ?? 'Niveau inconnu'
  const studentSpecialty = user.student?.specialty

  return {
    name: `${firstName}${lastName ? ` ${lastName}` : ''}`,
    email: user.email,
    roleLabel: role === 'student' ? 'Étudiant' : role === 'delegate' ? 'Délégué' : role === 'teacher' ? 'Enseignant' : 'Administrateur',
    status: 'En ligne',
    role,
    filiere: role === 'student' ? (studentSpecialty ? `${studentLevel} · ${studentSpecialty}` : studentLevel) : undefined,
    level: role === 'student' ? studentLevel : undefined,
    matricule: user.student?.matricule,
    accountType: user.accountType === 'PERSONAL' || user.accountCategory === 'PERSONAL' ? 'PERSONAL' : 'UNIVERSITY',
    countryCode: user.countryCode,
  }
}

function appwriteUserToBackendUser(user: UniFlowUser): BackendUser {
  return { id: user.id, email: user.email, role: user.role, fullName: user.name, accountType: user.accountType }
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
    const restored = await getCurrentAccount(snapshot?.user.accountType)

    if (restored) {
      const user = appwriteUserToBackendUser(restored)
      setAuthUser(user)
      setRoleState(mapRole(user.role))
      // Compatibilité de routage uniquement ; aucun profil ni secret n’est gardé dans localStorage.
      localStorage.setItem('uniflow_account_type', restored.accountType)
      localStorage.removeItem('uniflow_user')
      await persistSessionSnapshot(restored)
      try { window.dispatchEvent(new CustomEvent('uniflow:session-restored')) } catch {}
    } else if (!navigator.onLine && snapshot) {
      // Le cache permet la consultation hors ligne, mais ne remplace pas une session Appwrite en ligne.
      const user = appwriteUserToBackendUser(snapshot.user)
      setAuthUser(user)
      setRoleState(mapRole(user.role))
    } else {
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
