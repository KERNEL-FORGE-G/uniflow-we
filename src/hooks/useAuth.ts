import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAccount, loginAccount, logoutAccount, type UniFlowAccountType, type UniFlowRole, type UniFlowUser } from '@/lib/appwrite'
import { clearSessionSnapshot, persistSessionSnapshot } from '@/lib/sessionPersistence'
import { setAccountType, type BackendUser } from '@/lib/api'
import { useUserRole } from '@/utils/userRole'
import type { Role } from '@/utils/userRole'

export interface LoginPayload {
  email: string
  password: string
  accountType: UniFlowAccountType
  universityCode?: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  accountType: UniFlowAccountType
  countryCode?: string
  matricule?: string
  levelId?: string
  specialtyId?: string
  university?: string
  program?: string
  level?: 'L1'
}

function mapRole(role: string): Role {
  switch (role) {
    case 'ETUDIANT':
    case 'STUDENT':
    case 'INDEPENDENT_STUDENT': return 'student'
    case 'DELEGUE':
    case 'DELEGATE': return 'delegate'
    case 'ENSEIGNANT':
    case 'TEACHER':
    case 'INDEPENDENT_TEACHER': return 'teacher'
    case 'ADMIN': return 'admin'
    default: return 'student'
  }
}

function normalizeRole(role: string): UniFlowRole {
  if (role === 'ADMIN') return 'ADMIN'
  if (role === 'DELEGUE' || role === 'DELEGATE') return 'DELEGATE'
  if (role === 'ENSEIGNANT' || role === 'TEACHER' || role === 'INDEPENDENT_TEACHER') return 'TEACHER'
  return 'STUDENT'
}

async function persistUser(user: UniFlowUser) {
  // Seules les métadonnées de profil vont dans IndexedDB. Appwrite reste la
  // source de vérité pour le cookie ou la session effective.
  setAccountType(user.accountType)
  await persistSessionSnapshot(user)
}

function toBackendUser(user: UniFlowUser): BackendUser {
  return { id: user.id, email: user.email, role: user.role, fullName: user.name, accountType: user.accountType }
}

export function useAuth() {
  const navigate = useNavigate()
  const { setCurrentRole, setAuthUser, authUser } = useUserRole()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true)
    setError(null)
    try {
      const user = await loginAccount(payload.email, payload.password, payload.accountType)
      await persistUser(user)
      setAuthUser(toBackendUser(user))
      setCurrentRole(mapRole(user.role))
      try { window.dispatchEvent(new CustomEvent('uniflow:session-restored')) } catch {}
      navigate(user.role === 'ADMIN' ? '/admin' : '/app')
      return { user }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion Appwrite. Vérifiez vos identifiants.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [navigate, setAuthUser, setCurrentRole])

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true)
    setError(null)
    try {
      const user = await createAccount(
        payload.email,
        payload.password,
        `${payload.firstName.trim()} ${payload.lastName.trim()}`,
        payload.accountType,
        normalizeRole(payload.role),
        {
          university: payload.university,
          program: payload.program,
          level: payload.level,
          matricule: payload.matricule,
          country: payload.countryCode === 'CM' || !payload.countryCode ? 'Cameroun' : payload.countryCode,
        },
      )
      await persistUser(user)
      setAuthUser(toBackendUser(user))
      setCurrentRole(mapRole(user.role))
      try { window.dispatchEvent(new CustomEvent('uniflow:session-restored')) } catch {}
      navigate('/app')
      return { user }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l’inscription Appwrite.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [navigate, setAuthUser, setCurrentRole])

  const logout = useCallback(async () => {
    await logoutAccount()
    localStorage.removeItem('uniflow_account_type')
    localStorage.removeItem('uniflow_user')
    localStorage.removeItem('uniflow_access_token')
    localStorage.removeItem('uniflow_refresh_token')
    await clearSessionSnapshot()
    setAuthUser(null)
    setCurrentRole('student')
    try { window.dispatchEvent(new CustomEvent('uniflow:session-expired')) } catch {}
    navigate('/login')
  }, [navigate, setAuthUser, setCurrentRole])

  const getCurrentUser = useCallback((): UniFlowUser | null => {
    if (!authUser) return null
    const accountType = authUser.accountType === 'PERSONAL' || authUser.accountCategory === 'PERSONAL' ? 'PERSONAL' : 'UNIVERSITY'
    const role = authUser.role === 'ADMIN' || authUser.role === 'DELEGATE' || authUser.role === 'TEACHER' ? authUser.role : 'STUDENT'
    return { id: authUser.id, email: authUser.email, name: authUser.fullName || authUser.email, accountType, role }
  }, [authUser])

  const isAuthenticated = useCallback(() => Boolean(authUser), [authUser])

  return { login, register, logout, getCurrentUser, isAuthenticated, loading, error, setError }
}
