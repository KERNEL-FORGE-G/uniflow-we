import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, ShieldAlert, Building2, User, CheckCircle2, Globe } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ActionResultSlot } from '../../components/feedback/ActionResult'

export default function LoginPage() {
  const location = useLocation()
  const { login, loading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [accountType, setAccountTypeSelection] = useState<'UNIVERSITY' | 'PERSONAL'>('UNIVERSITY')

  const isIdleTimeout = location.state?.reason === 'idle_timeout'
  const logoutNotice: string | null = !isIdleTimeout && typeof location.state?.notice === 'string' ? location.state.notice : null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    try {
      await login({ email, password, accountType })
    } catch {
      // Le hook expose déjà le message d'erreur Appwrite dans `error`
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">
      {/* ── Gauche pleine page (50vw) ── */}
      <div className="w-full lg:w-1/2 min-h-full lg:min-h-screen bg-[#F8FAFC] border-b lg:border-b-0 lg:border-r border-slate-200/70 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Cercles décoratifs pastel */}
        <div className="absolute w-96 h-96 rounded-full bg-blue-100/40 blur-3xl -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-80 h-80 rounded-full bg-sky-100/50 blur-3xl -bottom-20 -right-20 pointer-events-none" />
        <div className="absolute w-60 h-60 rounded-full bg-teal-100/30 blur-2xl top-1/3 left-1/4 pointer-events-none" />

        {/* Logo en haut à gauche */}
        <div className="z-10">
          <Link to="/" className="inline-block">
            <img
              src="/logos/uniflow_logo_horizontal.png"
              alt="UniFlow"
              className="h-9 md:h-11 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/logos/uniflow-wordmark.svg'
              }}
            />
          </Link>
        </div>

        {/* Mascotte Archlord & Uni Fistbump centrée */}
        <div className="my-auto py-10 flex flex-col items-center justify-center relative z-10">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <img
              src="/mascot/archlord_uni_fistbump.webp"
              alt="Archlord & Uni"
              className="h-64 sm:h-80 lg:h-96 object-contain drop-shadow-md select-none"
            />
          </motion.div>

          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
              Plateforme universitaire moderne · Fonctionne même hors ligne
            </span>
          </div>
        </div>

        {/* Bas de page gauche */}
        <div className="z-10 text-center lg:text-left">
          <p className="text-xs text-slate-500">
            Archlord et Uni vous accompagnent sur votre campus au quotidien.
          </p>
        </div>
      </div>

      {/* ── Droite pleine page (50vw) ── */}
      <div className="w-full lg:w-1/2 min-h-full lg:min-h-screen bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
        {/* Top bar avec sélecteur de langue */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Globe className="h-4 w-4 text-slate-400" />
            <span>FR 🇫🇷</span>
          </div>
        </div>

        {/* Contenu principal du formulaire */}
        <div className="my-auto max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Connexion</h1>
            <p className="text-slate-400 text-sm mt-2">
              Ravi de vous revoir ! Connectez-vous à votre espace UniFlow.
            </p>
          </div>

          {/* Alertes de statut */}
          {logoutNotice && (
            <div role="status" className="mb-4 flex items-start gap-2.5 rounded-xl border border-teal-200 bg-teal-50 p-3 text-teal-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">{logoutNotice}</p>
            </div>
          )}

          {isIdleTimeout && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 border border-amber-200 text-amber-800">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">
                Déconnexion automatique après inactivité pour sécuriser votre session.
              </p>
            </div>
          )}

          <ActionResultSlot result={error ? { status: 'error', title: 'Connexion refusée', description: error } : null} />

          {/* Sélecteur de type de compte */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAccountTypeSelection('UNIVERSITY')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  accountType === 'UNIVERSITY'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="h-4 w-4 text-[#1E3A8A]" /> Universitaire
              </button>
              <button
                type="button"
                onClick={() => setAccountTypeSelection('PERSONAL')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  accountType === 'PERSONAL'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="h-4 w-4 text-[#0D9488]" /> Indépendant
              </button>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Votre email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="exemple@campus.edu"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Votre mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Session active & Mot de passe oublié */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1E3A8A] border-slate-300 focus:ring-[#1E3A8A] cursor-pointer accent-[#1E3A8A]"
                />
                <span>Garder ma session active</span>
              </label>
              <Link to="/mot-de-passe-oublie" className="text-slate-400 hover:text-[#1E3A8A] transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion UniFlow Bleu & Teal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] hover:from-[#172554] hover:to-[#0F766E] py-3.5 px-4 text-sm font-semibold text-white shadow-md shadow-blue-900/20 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>

            {/* Séparateur "ou" */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">ou</span>
            </div>

            {/* Connexion Google */}
            <button
              type="button"
              onClick={() => {
                setError('La connexion Google pour cet établissement est synchronisée via votre compte ENT.')
              }}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>
          </form>

          {/* Lien vers Inscription */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="font-bold text-[#1E3A8A] hover:text-[#0D9488] hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Footer en bas à droite */}
        <div className="pt-6 border-t border-slate-100 text-center lg:text-right">
          <p className="text-[11px] text-slate-400">
            © 2026 Tous droits réservés · UniFlow KERNEL FORGE
          </p>
        </div>
      </div>
    </div>
  )
}
