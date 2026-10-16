import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ShieldAlert, CheckCircle2, LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ActionResultSlot } from '../../components/feedback/ActionResult'
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from './AuthShell'

function greeting() {
  const h = new Date().getHours()
  return h < 6 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'
}

export default function LoginPage() {
  const location = useLocation()
  const { login, loading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const isIdleTimeout = location.state?.reason === 'idle_timeout'
  const logoutNotice: string | null = !isIdleTimeout && typeof location.state?.notice === 'string' ? location.state.notice : null

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    try {
      // UniFlow est indépendant : tous les comptes sont de type PERSONAL.
      await login({ email, password, accountType: 'PERSONAL' })
    } catch {
      // Le hook expose déjà le message d'erreur dans `error`
    }
  }

  return (
    <AuthShell
      icon={LogIn}
      eyebrow="Connexion"
      title={greeting()}
      subtitle="Retrouvez vos cours, votre planning, vos devoirs et vos résultats là où vous les avez laissés."
      footer={
        <>Pas encore de compte ?{' '}
          <Link to="/register" className="font-bold text-[#1E3A8A] hover:text-[#0D9488] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">Créer mon espace</Link>
        </>
      }
    >
      {logoutNotice && (
        <div role="status" className="mb-4 flex items-start gap-2.5 rounded-2xl border border-teal-200 bg-teal-50 p-3 text-teal-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
          <p className="text-xs font-medium leading-relaxed">{logoutNotice}</p>
        </div>
      )}
      {isIdleTimeout && (
        <div role="status" className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs font-medium leading-relaxed">Vous avez été déconnecté après un moment d'inactivité, pour protéger votre compte.</p>
        </div>
      )}

      <ActionResultSlot result={error ? { status: 'error', title: 'Connexion refusée', description: error } : null} />

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className={authLabelClass}>Adresse email</label>
          <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@exemple.com" className={authInputClass} />
        </div>

        <div>
          <label htmlFor="login-password" className={authLabelClass}>Mot de passe</label>
          <div className="relative">
            <input id="login-password" type={showPwd ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••••••" className={`${authInputClass} pr-12`} />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer select-none items-center gap-2 text-slate-600">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 cursor-pointer rounded accent-[#1E3A8A]" />
            <span>Garder ma session active</span>
          </label>
          <Link to="/mot-de-passe-oublie" className="font-semibold text-slate-500 transition-colors hover:text-[#1E3A8A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E3A8A]">
            Mot de passe oublié ?
          </Link>
        </div>

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>Connexion en cours…</span></>) : <span>Se connecter</span>}
        </button>
      </form>
    </AuthShell>
  )
}
