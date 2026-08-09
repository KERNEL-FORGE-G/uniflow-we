import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { clearTokens, getToken } from '../lib/api'
import { useUserRole } from '../utils/userRole'
import { LogOut, ShieldAlert } from 'lucide-react'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes in milliseconds
const WARNING_THRESHOLD_MS = 28 * 60 * 1000 // Show warning at 28 minutes (2 minutes remaining)

export function IdleTimer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuthUser } = useUserRole()
  const lastActivityRef = useRef<number>(Date.now())
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [showAutoLogoutToast, setShowAutoLogoutToast] = useState<boolean>(false)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120)

  // Only activate idle timer when user is on authenticated routes (/app/* or /admin/*)
  const isAuthenticatedRoute = location.pathname.startsWith('/app') || location.pathname.startsWith('/admin')
  const isLoggedIn = Boolean(getToken() || localStorage.getItem('uniflow_user'))

  useEffect(() => {
    if (!isAuthenticatedRoute || !isLoggedIn) {
      setShowWarning(false)
      return
    }

    const updateActivity = () => {
      lastActivityRef.current = Date.now()
      if (showWarning) {
        setShowWarning(false)
      }
    }

    // Events that signify user activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'pointerdown']
    
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, updateActivity, { passive: true })
    })

    const intervalId = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastActivityRef.current

      if (elapsed >= IDLE_TIMEOUT_MS) {
        // Auto-logout user after 30 minutes of inactivity
        clearTokens()
        setAuthUser(null)
        setShowWarning(false)
        setShowAutoLogoutToast(true)
        navigate('/login', { replace: true, state: { reason: 'idle_timeout' } })
      } else if (elapsed >= WARNING_THRESHOLD_MS) {
        // Show warning popup during the last 2 minutes
        setShowWarning(true)
        setSecondsRemaining(Math.max(1, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000)))
      } else {
        if (showWarning) setShowWarning(false)
      }
    }, 1000)

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, updateActivity)
      })
      clearInterval(intervalId)
    }
  }, [isAuthenticatedRoute, isLoggedIn, navigate, setAuthUser, showWarning])

  const handleStayLoggedIn = () => {
    lastActivityRef.current = Date.now()
    setShowWarning(false)
  }

  const handleLogoutNow = () => {
    clearTokens()
    setAuthUser(null)
    setShowWarning(false)
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Logout Notification Toast */}
      {showAutoLogoutToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-white shadow-2xl border border-slate-700 animate-slide-in-right">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">Session fermée (30 min d'inactivité)</p>
            <p className="text-[11px] text-slate-300">Veuillez vous réauthentifier pour continuer.</p>
          </div>
          <button
            onClick={() => setShowAutoLogoutToast(false)}
            className="ml-2 text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
