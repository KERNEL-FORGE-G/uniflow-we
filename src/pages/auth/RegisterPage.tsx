import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, CheckCircle, User, Mail, Lock, GraduationCap, BookOpen, Award, ArrowRight, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { authApi, type AcademicLevel, type SpecialtyOption } from '../../lib/api'
import { fadeInUp, staggerContainer } from '../../utils/animations'

const benefits = [
  {
    icon: GraduationCap,
    title: 'Gestion académique complète',
    desc: 'Accès à tous vos cours, emplois du temps et ressources pédagogiques.',
    color: 'text-blue-400'
  },
  {
    icon: CheckCircle,
    title: 'Suivi en temps réel',
    desc: 'Présences, devoirs, notes et bulletins synchronisés automatiquement.',
    color: 'text-emerald-400'
  },
  {
    icon: Sparkles,
    title: 'Mode Offline puissant',
    desc: 'Fonctionne sans Internet avec synchronisation intelligente.',
    color: 'text-purple-400'
  },
  {
    icon: Award,
    title: 'Multi-plateforme',
    desc: 'Mobile, Web, Desktop - vos données partout avec vous.',
    color: 'text-amber-400'
  },
]

type BackendRole = 'ETUDIANT' | 'DELEGUE' | 'ENSEIGNANT'

const roleMap: Record<string, BackendRole> = {
  student: 'ETUDIANT',
  teacher: 'ENSEIGNANT',
}

export default function RegisterPage() {
  const { register, loading, error, setError } = useAuth()
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirm: '', 
    role: 'student', 
    levelId: '', 
    specialtyId: '',
  })
  const [levels, setLevels] = useState<AcademicLevel[]>([])
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([])
  const [academicLoading, setAcademicLoading] = useState(true)
  const [academicError, setAcademicError] = useState<string | null>(null)
  const [showPwd, setShowPwd] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    let mounted = true

    const loadAcademicOptions = async () => {
      setAcademicLoading(true)
      setAcademicError(null)
      try {
        const data = await authApi.academicOptions()
        if (!mounted) return
        setLevels(data.levels)
        setSpecialties(data.specialties)
        if (data.levels.length > 0) {
          const firstLevelId = data.levels[0].id
          const firstSpecialty = data.specialties.find(s => s.levelId === firstLevelId)
          setForm(f => ({
            ...f,
            levelId: firstLevelId,
            specialtyId: firstSpecialty?.id ?? data.specialties[0]?.id ?? '',
          }))
        }
      } catch (err) {
        if (!mounted) return
        setAcademicError('Impossible de charger les filières et niveaux. Réessayez plus tard.')
      } finally {
        if (!mounted) return
        setAcademicLoading(false)
      }
    }

    loadAcademicOptions()
    return () => { mounted = false }
  }, [])

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: roleMap[form.role],
        levelId: form.levelId || undefined,
        specialtyId: form.specialtyId || undefined,
      })
    } catch {
      // error handled by useAuth
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-[#0d9488] via-[#14b8a8] to-[#0a7167] p-12 relative overflow-hidden">
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
            <img src="/logos/logo-principal.png" alt="UniFlow" className="mx-auto h-20 mb-6 object-contain brightness-0 invert drop-shadow-2xl" />
            <h1 className="text-4xl font-black mb-3">Rejoignez UniFlow</h1>
            <p className="text-teal-100 text-lg leading-relaxed">
              Créez votre compte et profitez d'une expérience universitaire moderne et connectée
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div variants={fadeInUp} className="space-y-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  whileHover={{ x: 8, scale: 1.02 }}
                  className="flex gap-4 rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ${benefit.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-white text-base mb-1">{benefit.title}</p>
                    <p className="text-teal-100 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Trust indicators */}
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-8 pt-4">
            {[
              { icon: CheckCircle, label: '100% Gratuit' },
              { icon: Lock, label: 'Sécurisé' },
              { icon: Sparkles, label: 'Open Source' },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-emerald-300" />
                  <span className="text-sm font-medium text-teal-100">{item.label}</span>
                </div>
              )
            })}
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
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#14b8a8] mb-4"
              >
                <User className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-black text-[#111827]">Créer un compte</h2>
              <p className="mt-2 text-sm text-[#6b7280]">Étape {step} sur 2 - {step === 1 ? 'Informations personnelles' : 'Informations académiques'}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8 flex gap-2">
              {[1, 2].map(s => (
                <motion.div 
                  key={s} 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: s <= step ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-2 flex-1 rounded-full bg-gradient-to-r from-[#0d9488] to-[#14b8a8] origin-left"
                  style={{ backgroundColor: s > step ? '#e5e7eb' : undefined }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleNext} 
                  className="space-y-5"
                >
                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#374151] mb-2">Prénom</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                          <User className="h-5 w-5" />
                        </div>
                        <input 
                          type="text" 
                          value={form.firstName} 
                          onChange={e => set('firstName', e.target.value)} 
                          required
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-[#0d9488] focus:bg-white transition-all"
                          placeholder="Emma" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#374151] mb-2">Nom</label>
                      <input 
                        type="text" 
                        value={form.lastName} 
                        onChange={e => set('lastName', e.target.value)} 
                        required
                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#0d9488] focus:bg-white transition-all"
                        placeholder="Martin" 
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-[#374151] mb-2">Adresse email universitaire</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input 
                        type="email" 
                        value={form.email} 
                        onChange={e => set('email', e.target.value)} 
                        required
                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-[#0d9488] focus:bg-white transition-all"
                        placeholder="votre@uniflow.edu" 
                      />
                    </div>
                  </div>

                  {/* Role selection cards */}
                  <div>
                    <label className="block text-sm font-bold text-[#374151] dark:text-slate-200 mb-2">Votre rôle sur la plateforme</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'student', label: 'Étudiant', icon: GraduationCap, desc: 'Cours, Devoirs & Notes' },
                        { id: 'teacher', label: 'Enseignant', icon: BookOpen, desc: 'Espace Cours & Évaluations' },
                      ].map(r => {
                        const Icon = r.icon
                        const isSelected = form.role === r.id
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => set('role', r.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-center ${
                              isSelected
                                ? 'border-[#0d9488] bg-[#0d9488]/10 text-[#0d9488] font-bold shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <Icon className={`h-5 w-5 mb-1 ${isSelected ? 'text-[#0d9488]' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold leading-tight">{r.label}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{r.desc}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Submit */}
                  <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a8] py-3.5 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    Continuer
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                >
                  {/* Academic info */}
                  <div>
                    <label className="block text-sm font-bold text-[#374151] mb-2">Filière d'études</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      {academicLoading ? (
                        <div className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium text-slate-500">
                          Chargement...
                        </div>
                      ) : academicError ? (
                        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                          {academicError}
                        </div>
                      ) : (
                        <select
                          value={form.levelId}
                          onChange={e => {
                            const selectedLevelId = e.target.value
                            const firstSpecialty = specialties.find(s => s.levelId === selectedLevelId)
                            set('levelId', selectedLevelId)
                            set('specialtyId', firstSpecialty?.id ?? '')
                          }}
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-[#0d9488] focus:bg-white transition-all"
                        >
                          {levels.map(level => (
                            <option key={level.id} value={level.id}>
                              {level.programName} - {level.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#374151] mb-2">Spécialité</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      {academicLoading ? (
                        <div className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium text-slate-500">
                          Chargement...
                        </div>
                      ) : academicError ? (
                        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                          {academicError}
                        </div>
                      ) : (
                        <select
                          value={form.specialtyId}
                          onChange={e => set('specialtyId', e.target.value)}
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-[#0d9488] focus:bg-white transition-all"
                        >
                          {specialties
                            .filter(s => s.levelId === form.levelId)
                            .map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                        </select>
                      )}
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
                        value={form.password} 
                        onChange={e => set('password', e.target.value)} 
                        required
                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-12 py-3 text-sm font-medium outline-none focus:border-[#0d9488] focus:bg-white transition-all"
                        placeholder="Min. 8 caractères" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPwd(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
                      >
                        {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#374151] mb-2">Confirmer le mot de passe</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input 
                        type="password" 
                        value={form.confirm} 
                        onChange={e => set('confirm', e.target.value)} 
                        required
                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-[#0d9488] focus:bg-white transition-all"
                        placeholder="Répétez le mot de passe"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <motion.button 
                      type="button" 
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-base font-bold text-[#374151] hover:bg-slate-50 transition-all"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Retour
                    </motion.button>
                    <motion.button 
                      type="submit" 
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a8] py-3.5 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> 
                          Création en cours...
                        </>
                      ) : (
                        <>
                          Créer mon compte
                          <CheckCircle className="h-5 w-5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-8 space-y-3 text-center">
              <p className="text-sm text-[#6b7280]">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="font-bold text-[#0d9488] hover:underline">
                  Se connecter
                </Link>
              </p>
              <Link to="/" className="block text-xs text-[#9ca3af] hover:text-[#0d9488] hover:underline transition-colors">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden mt-8 text-center">
            <img src="/logos/logo-principal.png" alt="UniFlow" className="mx-auto h-12 object-contain opacity-50" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
