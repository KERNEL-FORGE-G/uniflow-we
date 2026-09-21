import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { createAccount, deleteOwnAccount, loginAccount, logoutAccount, type UniFlowAccountType, type UniFlowUser } from '@/lib/appwrite'
import { clearSessionSnapshot, persistSessionSnapshot } from '@/lib/sessionPersistence'
import { setAccountType, type BackendUser } from '@/lib/api'
import { logoutNavigationState, terminateSession, type LogoutReason } from '@/lib/session'
import { unregisterAppwritePushTarget } from '@/services/appwritePushBridge'
import { useUserRole } from '@/utils/userRole'
import type { Role } from '@/utils/userRole'
import { clearPersistedQueries } from '@/lib/offline/queryPersistence'

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
  faculty?: string
  program?: string
  level?: string
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

async function persistUser(user: UniFlowUser) {
  // Seules les métadonnées de profil vont dans IndexedDB. Appwrite reste la
  // source de vérité pour le cookie ou la session effective.
  setAccountType(user.accountType)
  await persistSessionSnapshot(user)
}

function toBackendUser(user: UniFlowUser): BackendUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.name,
    accountType: user.accountType,
    username: user.username,
    avatarFileId: user.avatarFileId,
    labels: user.labels,
    isSuperAdmin: user.isSuperAdmin,
    university: user.university,
    program: user.program,
    level: user.level,
  }
}

export function useAuth() {
  const queryClient = useQueryClient()
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
        // Aucun rôle transmis : un auto-inscrit universitaire est STUDENT,
        // le serveur l'impose aussi.
        {
          university: payload.university,
          faculty: payload.faculty,
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

  /**
   * Déconnexion unique pour toute l'application (voir `lib/session.ts`).
   * `reason` choisit le message affiché sur la page de connexion ; `redirect`
   * permet à la suppression de compte de renvoyer vers l'accueil.
   */
  const logout = useCallback(async (reason: LogoutReason = 'user', redirect = '/login') => {
    await terminateSession({
      deleteRemoteSession: logoutAccount,
      clearSnapshot: clearSessionSnapshot,
      unsubscribeRealtime: unregisterAppwritePushTarget,
      // Vide aussi le cache persisté dans IndexedDB : sans cela, les données du
      // compte précédent réapparaissaient au prochain utilisateur du navigateur.
      clearQueryCache: () => { void clearPersistedQueries(queryClient) },
      // Événement distinct de « session expirée » : un clic volontaire ne doit
      // pas déclencher la modale d'expiration ni son toast d'avertissement.
      announce: (why) => { try { window.dispatchEvent(new CustomEvent('uniflow:logged-out', { detail: { reason: why } })) } catch { /* environnement sans window */ } },
    }, reason)
    setAuthUser(null)
    setCurrentRole('student')
    navigate(redirect, { replace: true, state: logoutNavigationState(reason) })
  }, [navigate, queryClient, setAuthUser, setCurrentRole])

  const getCurrentUser = useCallback((): UniFlowUser | null => {
    if (!authUser) return null
    const accountType: UniFlowAccountType = authUser.accountType === 'PERSONAL' || authUser.accountCategory === 'PERSONAL'
      ? 'PERSONAL'
      : authUser.accountType === 'PLATFORM' ? 'PLATFORM' : 'UNIVERSITY'
    const role = authUser.role === 'ADMIN' || authUser.role === 'DELEGATE' || authUser.role === 'TEACHER' ? authUser.role : 'STUDENT'
    return { id: authUser.id, email: authUser.email, name: authUser.fullName || authUser.email, accountType, role, isSuperAdmin: Boolean(authUser.isSuperAdmin), labels: authUser.labels, university: authUser.university, faculty: authUser.faculty, program: authUser.program, level: authUser.level }
  }, [authUser])

  const isAuthenticated = useCallback(() => Boolean(authUser), [authUser])

  /**
   * Droit à l'effacement : le serveur supprime le compte et ses données, puis
   * l'appareil est nettoyé comme pour une déconnexion (le compte n'existant
   * plus, la fermeture de session distante échoue silencieusement).
   */
  const deleteAccount = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteOwnAccount()
      await logout('account_deleted')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'La suppression du compte a échoué.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [logout])

  return { login, register, logout, deleteAccount, getCurrentUser, isAuthenticated, loading, error, setError }
}
