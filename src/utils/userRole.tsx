import { useState, useEffect, useMemo, createContext, useContext } from 'react'
import { authApi, clearTokens, getToken, type BackendUser } from '@/lib/api'

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
    case 'INDEPENDENT_STUDENT': return 'student'
    case 'DELEGUE':
    case 'delegate': return 'delegate'
    case 'ENSEIGNANT':
    case 'TEACHER':
    case 'INDEPENDENT_TEACHER':
    case 'teacher': return 'teacher'
    case 'ADMIN':
    case 'admin': return 'admin'
    case 'student': return 'student'
    default: return 'student'
  }
}

function buildUserProfile(user: BackendUser | null): UserProfile {
  if (!user) return EMPTY_PROFILE

  const role = mapRole(user.role)
  const fullNameParts = user.fullName?.trim().split(/\s+/).filter(Boolean) ?? []
  const firstName = user.student?.firstName ?? user.teacher?.firstName ?? fullNameParts[0] ?? user.email.split('@')[0]
  const lastName = user.student?.lastName ?? user.teacher?.lastName ?? fullNameParts.slice(1).join(' ')
  const name = `${firstName}${lastName ? ` ${lastName}` : ''}`
  const roleLabel = role === 'student'
    ? 'Étudiant'
    : role === 'delegate'
      ? 'Délégué'
      : role === 'teacher'
        ? 'Enseignant'
        : 'Administrateur'

  const studentLevel = user.student?.level ?? 'Niveau inconnu'
  const studentSpecialty = user.student?.specialty
  const filiereValue = role === 'student'
    ? studentSpecialty
      ? `${studentLevel} · ${studentSpecialty}`
      : studentLevel
    : undefined

  return {
    name,
    email: user.email,
    roleLabel,
    status: 'En ligne',
    role,
    filiere: filiereValue,
    level: role === 'student' ? studentLevel : undefined,
    matricule: user.student?.matricule,
    accountType: user.accountType === 'PERSONAL' || user.accountCategory === 'PERSONAL' ? 'PERSONAL' : 'UNIVERSITY',
    countryCode: user.countryCode,
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<BackendUser | null>(() => {
    const raw = localStorage.getItem('uniflow_user')
    if (!raw) return null
    try { return JSON.parse(raw) as BackendUser } catch { return null }
  })

  const [currentRole, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('uniflow_role')
    return authUser ? mapRole(authUser.role) : ((saved as Role) || 'student')
  })

  const currentUser = useMemo(() => buildUserProfile(authUser), [authUser])

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    return localStorage.getItem('uniflow_offline') === 'true'
  })

  const [language, setLanguage] = useState<'FR' | 'EN'>(() => {
    return (localStorage.getItem('uniflow_lang') as 'FR' | 'EN') || 'FR'
  })

  useEffect(() => {
    const token = getToken()
    if (!token) return

    authApi.me()
      .then(user => {
        const role = mapRole(user.role)
        setAuthUser(user)
        setRoleState(role)
        localStorage.setItem('uniflow_user', JSON.stringify(user))
        localStorage.setItem('uniflow_role', role)
      })
      .catch(() => {
        clearTokens()
        localStorage.removeItem('uniflow_user')
        setAuthUser(null)
        setRoleState('student')
      })
  }, [])

  const setCurrentRole = (role: Role) => {
    setRoleState(role)
    localStorage.setItem('uniflow_role', role)
  }

  const toggleOffline = (offline: boolean) => {
    setIsOfflineMode(offline)
    localStorage.setItem('uniflow_offline', String(offline))
  }

  const toggleLanguage = (lang: 'FR' | 'EN') => {
    setLanguage(lang)
    localStorage.setItem('uniflow_lang', lang)
  }

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        setAuthUser,
        currentUser,
        isOfflineMode,
        setIsOfflineMode: toggleOffline,
        language,
        setLanguage: toggleLanguage,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useUserRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useUserRole must be used within a RoleProvider')
  }
  return context
}
