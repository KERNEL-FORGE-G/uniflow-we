import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole, X } from 'lucide-react'

export default function SessionExpiredModal() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleSessionExpired = () => setOpen(true)
    window.addEventListener('uniflow:session-expired', handleSessionExpired)
    return () => window.removeEventListener('uniflow:session-expired', handleSessionExpired)
  }, [])

  if (!open) return null

  const goToLogin = () => {
    setOpen(false)
    navigate('/login', { replace: true, state: { reason: 'session_expired' } })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          aria-label="Fermer"
          onClick={goToLogin}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 id="session-expired-title" className="text-xl font-bold text-slate-900">Session expirée</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Pour protéger vos données académiques, votre session a été fermée. Reconnectez-vous pour continuer.
        </p>
        <button
          type="button"
          onClick={goToLogin}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Se reconnecter
        </button>
      </div>
    </div>
  )
}
