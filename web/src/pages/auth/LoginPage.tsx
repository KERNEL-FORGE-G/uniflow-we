import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Buildings,
  Globe,
  EnvelopeSimple,
  LockKey,
  Eye,
  EyeSlash,
  SignIn,
  CircleNotch,
  ShieldWarning,
  CheckCircle,
} from '@phosphor-icons/react'
import { useAuth } from '../../hooks/useAuth'
import { ActionResultSlot } from '../../components/feedback/ActionResult'
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from './AuthShell'

type AccountCategory = 'UNIVERSITY' | 'PERSONAL'

function greeting() {
  const h = new Date().getHours()
  return h < 6 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'
}

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, loading, error, setError } = useAuth()
  const [accountType, setAccountType] = useState<AccountCategory>('UNIVERSITY')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const isIdleTimeout = location.state?.reason === 'idle_timeout'
  const logoutNotice: string | null =
    !isIdleTimeout && typeof location.state?.notice === 'string' ? location.state.notice : null

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!identifier.trim() || !password) {
      setError('Veuillez renseigner vos identifiants.')
      return
    }

    try {
      const res = await login({
        email: identifier.trim(),
        password,
        accountType,
      })
      const from = (location.state as any)?.from
      const dest = from || (res?.user?.role === 'ADMIN' || res?.user?.isSuperAdmin ? '/admin' : '/app')
      navigate(dest, { replace: true })
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          window.location.href = dest
        }
      }, 100)
    } catch {
      // Le hook useAuth positionne déjà le message dans error
    }
  }

  return (
    <AuthShell
      icon={SignIn}
      eyebrow="Portail d'accès unifié"
      title={greeting()}
      subtitle={
        accountType === 'UNIVERSITY'
          ? 'Connectez-vous à votre espace universitaire (Étudiant, Délégué, Enseignant ou Administration).'
          : 'Retrouvez votre espace d’apprentissage ou de tutorat indépendant.'
      }
      footer={
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-500">Pas encore de compte ?</span>
          <Link
            to="/register"
            className="font-bold text-[#1E3A8A] transition-colors hover:text-[#0D9488] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            Créer mon espace
          </Link>
        </div>
      }
    >
      {/* ── Sélecteur de mode de connexion ergonomique : Académique vs Indépendant ── */}
      <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100/90 p-1.5 border border-slate-200/70" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={accountType === 'UNIVERSITY'}
          onClick={() => {
            setAccountType('UNIVERSITY')
            setError(null)
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all duration-200 ${
            accountType === 'UNIVERSITY'
              ? 'bg-white text-[#1E3A8A] shadow-sm shadow-slate-300/50 ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Buildings weight={accountType === 'UNIVERSITY' ? 'fill' : 'regular'} className="h-4 w-4" />
          <span>Espace Académique</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={accountType === 'PERSONAL'}
          onClick={() => {
            setAccountType('PERSONAL')
            setError(null)
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all duration-200 ${
            accountType === 'PERSONAL'
              ? 'bg-white text-[#0D9488] shadow-sm shadow-slate-300/50 ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Globe weight={accountType === 'PERSONAL' ? 'fill' : 'regular'} className="h-4 w-4" />
          <span>Espace Indépendant</span>
        </button>
      </div>

      {logoutNotice && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2.5 rounded-2xl border border-teal-200 bg-teal-50/90 p-3.5 text-teal-900 shadow-xs"
        >
          <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
          <p className="text-xs font-medium leading-relaxed">{logoutNotice}</p>
        </div>
      )}

      {isIdleTimeout && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-amber-900 shadow-xs"
        >
          <ShieldWarning weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs font-medium leading-relaxed">
            Vous avez été déconnecté après un moment d'inactivité, pour protéger votre compte.
          </p>
        </div>
      )}

      <ActionResultSlot
        result={error ? { status: 'error', title: 'Connexion refusée', description: error } : null}
      />

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-identifier" className={authLabelClass}>
            {accountType === 'UNIVERSITY'
              ? 'Adresse email ou identifiant universitaire'
              : 'Adresse email'}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <EnvelopeSimple weight="duotone" className="h-4.5 w-4.5" />
            </span>
            <input
              id="login-identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder={
                accountType === 'UNIVERSITY'
                  ? 'prenom.nom@facsciences-uy1.cm ou email'
                  : 'vous@exemple.com'
              }
              className={`${authInputClass} pl-10`}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className={authLabelClass.replace('mb-1.5', '')}>
              Mot de passe
            </label>
            <Link
              to="/mot-de-passe-oublie"
              className="text-xs font-semibold text-slate-500 transition-colors hover:text-[#1E3A8A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <LockKey weight="duotone" className="h-4.5 w-4.5" />
            </span>
            <input
              id="login-password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className={`${authInputClass} pl-10 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
            >
              {showPwd ? (
                <EyeSlash weight="bold" className="h-4 w-4" />
              ) : (
                <Eye weight="bold" className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex cursor-pointer select-none items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded-md border-slate-300 accent-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/30"
            />
            <span className="font-medium">Garder ma session active</span>
          </label>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`${authButtonClass} mt-2`}
        >
          {loading ? (
            <>
              <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
              <span>Connexion en cours…</span>
            </>
          ) : (
            <>
              <span>Se connecter</span>
              <SignIn weight="bold" className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>
    </AuthShell>
  )
}
