import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, setTokens, clearTokens, type LoginDto, type RegisterDto, type BackendUser, ApiError } from '@/lib/api'
import { useUserRole } from '@/utils/userRole'
import type { Role } from '@/utils/userRole'

// Mapper le rôle backend → rôle frontend
function mapRole(backendRole: string): Role {
  switch (backendRole) {
    case 'ETUDIANT':
    case 'STUDENT':
    case 'INDEPENDENT_STUDENT': return 'student'
    case 'DELEGUE': return 'delegate'
    case 'ENSEIGNANT':
    case 'TEACHER':
    case 'INDEPENDENT_TEACHER': return 'teacher'
    case 'ADMIN': return 'admin'
    default: return 'student'
  }
}

export function useAuth() {
  const navigate = useNavigate()
  const { setCurrentRole, setAuthUser } = useUserRole()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (payload: LoginDto) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.login(payload)
      setTokens(data.accessToken, data.refreshToken)
      // Persister les infos utilisateur
      localStorage.setItem('uniflow_user', JSON.stringify(data.user))
      setAuthUser(data.user)
      try { window.dispatchEvent(new CustomEvent('uniflow:session-restored')) } catch {}
      const role = mapRole(data.user.role)
      setCurrentRole(role)
      // Rediriger selon le rôle
      if (role === 'admin') navigate('/admin')
      else navigate('/app')
      return data
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.message
        : 'Erreur de connexion. Vérifiez vos identifiants.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [navigate, setCurrentRole])

  const register = useCallback(async (payload: RegisterDto) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.register(payload)
      setTokens(data.accessToken, data.refreshToken)
      localStorage.setItem('uniflow_user', JSON.stringify(data.user))
      setAuthUser(data.user)
      const role = mapRole(data.user.role)
      setCurrentRole(role)
      navigate('/app')
      return data
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.message
        : 'Erreur lors de l\'inscription.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [navigate, setCurrentRole])

  const logout = useCallback(() => {
    clearTokens()
    localStorage.removeItem('uniflow_user')
    setAuthUser(null)
    setCurrentRole('student')
    navigate('/login')
  }, [navigate, setAuthUser, setCurrentRole])

  const getCurrentUser = useCallback((): BackendUser | null => {
    const raw = localStorage.getItem('uniflow_user')
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  }, [])

  const isAuthenticated = useCallback((): boolean => {
    return !!localStorage.getItem('uniflow_access_token')
  }, [])

  return { login, register, logout, getCurrentUser, isAuthenticated, loading, error, setError }
}
