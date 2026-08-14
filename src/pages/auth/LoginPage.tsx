import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, GraduationCap, Wifi, ShieldCheck, ArrowRight, Lock, Mail, Sparkles, ShieldAlert, Building2, User } from 'lucide-react'
import { fadeInUp, staggerContainer } from '../../utils/animations'
import { useAuth } from '../../hooks/useAuth'
import { UNIVERSITIES } from '../../data/universities'

const demoAccounts = [
  { role: 'student' as const,  label: 'Étudiant (UY1)',   email: 'emma.martin@uniflow.edu',  gradient: 'from-[#1e3a8a] to-[#2d4fa8]', icon: GraduationCap },
  { role: 'delegate' as const, label: 'Délégué (UDLA)',    email: 'lucas.dubois@uniflow.edu', gradient: 'from-[#0d9488] to-[#14b8a8]', icon: ShieldCheck },
  { role: 'teacher' as const,  label: 'Enseignant (UB)', email: 'dr.martin@uniflow.edu',    gradient: 'from-[#7c3aed] to-[#a855f7]', icon: Wifi },
  { role: 'admin' as const,    label: 'Admin',      email: 'admin@uniflow.edu',        gradient: 'from-[#d97706] to-[#f59e0b]', icon: Sparkles },
]

const features = [
  { 
    icon: GraduationCap, 
    title: 'Gestion académique complète', 
    desc: 'Cours, devoirs, notes et emploi du temps centralisés en un seul endroit.',
    color: 'text-emerald-400'
  },
  { 
    icon: Wifi, 
    title: 'Mode Offline First', 
    desc: 'Fonctionne sans Internet avec synchronisation automatique au retour du réseau.',
    color: 'text-blue-400'
  },
  { 
    icon: ShieldCheck, 
    title: 'Sécurisé & Multi-rôles', 
    desc: 'JWT + RBAC pour chaque type d\'utilisateur. Données protégées et chiffrées.',
    color: 'text-purple-400'
  },
]

export default function LoginPage() {
  const location = useLocation()
  const { login, loading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [accountType, setAccountTypeSelection] = useState<'UNIVERSITY' | 'PERSONAL'>('UNIVERSITY')
  const [universityCode, setUniversityCode] = useState('UY1')

  const isIdleTimeout = location.state?.reason === 'idle_timeout'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    await login({
      email,
      password,
      accountType,
      universityCode: accountType === 'UNIVERSITY' ? universityCode : undefined,
      demo: demoMode,
    })
  }

  const handleDemo = (demoEmail: string) => {
    setDemoMode(true)
    setEmail(demoEmail)
    setPassword('password123')
    setError(null)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] p-12 relative overflow-hidden">
        {/* Animated background */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 left-10 h-96 w-96 rounded-full bg-white blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-white blur-3xl"
        />
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-lg text-white relative z-10 space-y-8"
        >
          {/* Logo */}
          <motion.div variants={fadeInUp} className="text-center">
            <img
              src="https://i.imgur.com/GAiZ7WY.png"
              alt="UniFlow"
              className="mx-auto h-20 mb-6 object-contain drop-shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (!target.dataset.triedFallback1) {
                  target.dataset.triedFallback1 = 'true'
                  target.src = '/logo_1.png'
                } else if (!target.dataset.triedFallback2) {
                  target.dataset.triedFallback2 = 'true'
                  target.src = '/logo.png'
                }
              }}
            />
            <h1 className="text-4xl font-black mb-3">Bienvenue sur UniFlow</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              La plateforme universitaire intelligente qui fonctionne partout, même sans Internet
            </p>
          </motion.div>

          {/* Features */}
          <motion.div variants={fadeInUp} className="space-y-4">
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={feat.title}
                  whileHover={{ x: 8, scale: 1.02 }}
                  className="flex gap-4 rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ${feat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-white text-base mb-1">{feat.title}</p>
                    <p className="text-blue-100 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-8 pt-4">
            {[
              { value: '12k+', label: 'Étudiants' },
              { value: '480+', label: 'Enseignants' },
              { value: '98%', label: 'Satisfaction' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-blue-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 lg:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] mb-4"
              >
                <Lock className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-black text-[#111827]">Connexion</h2>
              <p className="mt-2 text-sm text-[#6b7280]">Accédez à votre espace de travail UniFlow</p>
            </div>

            {/* Idle Timeout Alert Banner */}
            {isIdleTimeout && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-800 animate-slide-in-right">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold">Déconnexion pour inactivité</p>
                  <p className="text-amber-700">Vous avez été déconnecté automatiquement après 30 minutes d'inactivité pour sécuriser votre compte.</p>
                </div>
              </div>
            )}

            {/* Quick demo buttons */}
            <div className="mb-8 space-y-3">
              <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">Connexion rapide (démo)</p>
              <div className="grid grid-cols-2 gap-3">
                {demoAccounts.map(acc => {
                  const Icon = acc.icon
                  return (
                    <motion.button 
                      key={acc.role} 
                      type="button" 
                      onClick={() => handleDemo(acc.email)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group rounded-xl bg-gradient-to-br ${acc.gradient} px-4 py-3 text-white shadow-lg hover:shadow-xl transition-all`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">{acc.label}</span>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <span className="text-xs font-medium text-[#9ca3af]">ou avec email</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Sélection Type de compte */}
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-2">Type de compte</label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setDemoMode(false)
                      setAccountTypeSelection('UNIVERSITY')
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      accountType === 'UNIVERSITY'
                        ? 'bg-white text-[#1e3a8a] shadow-md border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="h-4 w-4" /> Université (BD)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDemoMode(false)
                      setAccountTypeSelection('PERSONAL')
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      accountType === 'PERSONAL'
                        ? 'bg-white text-[#1e3a8a] shadow-md border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="h-4 w-4" /> Indépendant
                  </button>
                </div>
              </div>

              {/* Sélection Université dans la BD si Université */}
              {accountType === 'UNIVERSITY' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-bold text-[#374151] mb-2">Université (Base de données)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <select
                      value={universityCode}
                      onChange={(e) => setUniversityCode(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-[#1e3a8a] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {UNIVERSITIES.map((univ) => (
                        <option key={univ.code} value={univ.code}>
                          {univ.name} ({univ.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Information Badge du Backend */}
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-[#1e3a8a] flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0 text-[#1e3a8a]" />
                <div className="leading-tight">
                  {accountType === 'UNIVERSITY' ? (
                    <span>Serveur : <strong>Backend Université ({universityCode})</strong> — <code>https://api-uniflow.kernelforge.codes/</code></span>
                  ) : (
                    <span>Serveur : <strong>Backend Indépendant (SaaS)</strong> — <code>https://api2-uniflow.kernelforge.codes/</code></span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-2">Adresse email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input 
                    type="email" 
                    value={email} 
                                        onChange={e => {
                      setDemoMode(false)
                      setEmail(e.target.value)
                    }}
                    required
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1e3a8a] focus:bg-white transition-all"
                    placeholder="votre@uniflow.edu" 
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-2">Mot de passe</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input 
                    type={showPwd ? 'text' : 'password'} 
                    value={password} 
                                        onChange={e => {
                      setDemoMode(false)
                      setPassword(e.target.value)
                    }}
                    required
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-12 py-3 text-sm font-medium outline-none focus:border-[#1e3a8a] focus:bg-white transition-all"
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
                  >
                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <button type="button" className="text-xs font-semibold text-[#1e3a8a] hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button 
                type="submit" 
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] py-3.5 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> 
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-8 space-y-3 text-center">
              <p className="text-sm text-[#6b7280]">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-bold text-[#1e3a8a] hover:underline">
                  Créer un compte
                </Link>
              </p>
              <Link to="/" className="block text-xs text-[#9ca3af] hover:text-[#1e3a8a] hover:underline transition-colors">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden mt-8 text-center">
            <img
              src="https://i.imgur.com/GAiZ7WY.png"
              alt="UniFlow"
              className="mx-auto h-12 object-contain opacity-70"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (!target.dataset.triedFallback1) {
                  target.dataset.triedFallback1 = 'true'
                  target.src = '/logo_1.png'
                } else if (!target.dataset.triedFallback2) {
                  target.dataset.triedFallback2 = 'true'
                  target.src = '/logo.png'
                }
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
