import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, CheckCircle, User, Mail, Lock, GraduationCap, BookOpen, Award, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, Building2, UserCheck, FileText } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { fadeInUp, staggerContainer } from '../../utils/animations'
import { levelLabel, useFaculties, usePrograms, useUniversities } from '../../lib/referenceData'
import { ActionResultSlot } from '../../components/feedback/ActionResult'

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
    title: 'Accès adapté à la connexion',
    desc: 'Les données déjà consultées peuvent rester disponibles temporairement ; les créations et modifications nécessitent Appwrite.',
    color: 'text-purple-400'
  },
  {
    icon: Award,
    title: 'Multi-plateforme',
    desc: 'Mobile, Web, Desktop - vos données partout avec vous.',
    color: 'text-amber-400'
  },
]

export default function RegisterPage() {
  const { register, loading, error, setError } = useAuth()
  const [accountType, setAccountTypeSelection] = useState<'UNIVERSITY' | 'PERSONAL'>('UNIVERSITY')
  const [countryCode, setCountryCode] = useState('CM')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
    matricule: '',
  })
  // Référentiel académique lu en base : université → faculté → filière → niveau.
  const [universityCode, setUniversityCode] = useState('')
  const [facultyCode, setFacultyCode] = useState('')
  const [programCode, setProgramCode] = useState('')
  const [level, setLevel] = useState('')
  const universities = useUniversities()
  const faculties = useFaculties(universityCode)
  const programs = usePrograms(universityCode, facultyCode)
  const selectedUniversity = universities.data?.find((item) => item.code === universityCode)
  const selectedProgram = programs.data?.find((item) => item.code === programCode)
  const [showPwd, setShowPwd] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // Chaque choix amont invalide les choix aval : une filière d'une autre
  // faculté ne doit jamais rester sélectionnée en silence.
  useEffect(() => { setFacultyCode(''); setProgramCode(''); setLevel('') }, [universityCode])
  useEffect(() => { setProgramCode(''); setLevel('') }, [facultyCode])
  useEffect(() => { setLevel('') }, [programCode])
  useEffect(() => {
    // Une seule université en base : on la présélectionne, l'utilisateur n'a rien à chercher.
    if (!universityCode && universities.data?.length === 1) setUniversityCode(universities.data[0].code)
  }, [universities.data, universityCode])
  useEffect(() => {
    if (!facultyCode && faculties.data?.length === 1) setFacultyCode(faculties.data[0].code)
  }, [faculties.data, facultyCode])

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.firstName || !form.lastName || !form.email) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (accountType === 'UNIVERSITY' && (!selectedUniversity || !selectedProgram || !level)) {
      setError('Choisissez votre université, votre filière et votre niveau.')
      return
    }
    try {
      // Aucun rôle n'est transmis : un auto-inscrit universitaire est STUDENT.
      // Les comptes enseignant, délégué et administration sont créés par l'administration.
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: 'STUDENT',
        accountType,
        countryCode: accountType === 'PERSONAL' ? countryCode : undefined,
        matricule: form.matricule || undefined,
        university: accountType === 'UNIVERSITY' ? selectedUniversity?.name : undefined,
        faculty: accountType === 'UNIVERSITY' ? faculties.data?.find((item) => item.code === facultyCode)?.name : undefined,
        program: accountType === 'UNIVERSITY' ? selectedProgram?.code : undefined,
        level: accountType === 'UNIVERSITY' ? level : undefined,
      })
    } catch {
      // L’erreur est affichée par useAuth ; aucune inscription locale n’est créée.
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
            <img
              src="/logos/uniflow-wordmark.png"
              alt="UniFlow"
              className="mx-auto h-20 mb-6 object-contain drop-shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = 'true'
                  target.src = '/logo_1.png'
                }
              }}
            />
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
              <p className="mt-2 text-sm text-[#6b7280]">Étape {step} sur 2 - {step === 1 ? 'Informations personnelles' : accountType === 'PERSONAL' ? 'Sécurité du compte indépendant' : 'Informations académiques'}</p>
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
                  <ActionResultSlot result={error ? { status: 'error', title: 'Inscription impossible', description: error } : null} />

                  {/* Account Type Selector */}
                  <div>
                    <label className="block text-sm font-bold text-[#374151] mb-2">Type de compte</label>
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAccountTypeSelection('UNIVERSITY')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          accountType === 'UNIVERSITY'
                            ? 'bg-white text-[#0d9488] shadow-md border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Building2 className="h-4 w-4" /> Compte universitaire
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountTypeSelection('PERSONAL')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          accountType === 'PERSONAL'
                            ? 'bg-white text-[#0d9488] shadow-md border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <User className="h-4 w-4" /> Compte indépendant
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 text-xs text-[#0f766e] leading-relaxed">
                    {accountType === 'UNIVERSITY'
                      ? 'Un compte universitaire créé ici est un compte étudiant. Les comptes enseignant, délégué et administration sont ouverts par l’administration de votre université.'
                      : 'Un compte indépendant gère ses propres matières, horaires et devoirs, sans rattachement à une université.'}
                  </div>

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
                    <label className="block text-sm font-bold text-[#374151] mb-2">                        {accountType === 'PERSONAL' ? 'Adresse email' : 'Adresse email universitaire'}</label>
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
                  <ActionResultSlot result={error ? { status: 'error', title: 'Inscription impossible', description: error } : null} />

                  {/* Information compte personnel / indépendant vs Université */}
                  {accountType === 'PERSONAL' ? (
                    <div className="p-4 bg-[#f0fdf4] border border-emerald-200 rounded-2xl text-xs text-[#065f46] space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-sm text-[#047857]">
                        <Sparkles className="h-4 w-4" /> Compte Indépendant
                      </div>
                      <p className="leading-relaxed">
                        En tant que compte indépendant, la sélection d'une filière ou université partenaire est facultative. Vous pourrez configurer et personnaliser votre cursus, vos matières et vos horaires à tout moment dans vos <strong>Paramètres</strong>.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Matricule pour compte Université */}
                      <div>
                        <label className="block text-sm font-bold text-[#374151] mb-2">Matricule étudiant (facultatif)</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                            <FileText className="h-5 w-5" />
                          </div>
                          <input 
                            type="text" 
                            value={form.matricule} 
                            onChange={e => set('matricule', e.target.value)} 
                            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-[#0d9488] focus:bg-white transition-all"
                            placeholder="Ex : 22U1234" 
                          />
                        </div>
                      </div>

                      <ReferenceSelect
                        icon={Building2}
                        label="Université"
                        value={universityCode}
                        onChange={setUniversityCode}
                        placeholder="Choisir une université"
                        loading={universities.isLoading}
                        error={universities.error ? 'Le référentiel des universités est indisponible.' : undefined}
                        options={(universities.data ?? []).map((item) => ({ value: item.code, label: item.city ? `${item.name} (${item.city})` : item.name }))}
                      />
                      <ReferenceSelect
                        icon={BookOpen}
                        label="Faculté ou école"
                        value={facultyCode}
                        onChange={setFacultyCode}
                        placeholder={universityCode ? 'Choisir une faculté' : 'Choisissez d’abord une université'}
                        disabled={!universityCode}
                        loading={faculties.isLoading}
                        error={faculties.error ? 'Les facultés n’ont pas pu être chargées.' : undefined}
                        options={(faculties.data ?? []).map((item) => ({ value: item.code, label: item.name }))}
                      />
                      <ReferenceSelect
                        icon={GraduationCap}
                        label="Filière"
                        value={programCode}
                        onChange={setProgramCode}
                        placeholder={facultyCode ? 'Choisir une filière' : 'Choisissez d’abord une faculté'}
                        disabled={!facultyCode}
                        loading={programs.isLoading}
                        error={programs.error ? 'Les filières n’ont pas pu être chargées.' : undefined}
                        options={(programs.data ?? []).map((item) => ({ value: item.code, label: item.name === item.code ? item.name : `${item.name} (${item.code})` }))}
                      />
                      {selectedProgram && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="block text-sm font-bold text-[#374151] mb-2">Niveau</label>
                          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Niveau d’études">
                            {selectedProgram.levels.map((option) => (
                              <button
                                key={option}
                                type="button"
                                role="radio"
                                aria-checked={level === option}
                                onClick={() => setLevel(option)}
                                className={`rounded-xl border-2 px-3 py-2.5 text-center transition-all ${level === option ? 'border-[#0d9488] bg-[#0d9488]/10 text-[#0d9488]' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
                              >
                                <span className="block text-sm font-black">{option}</span>
                                <span className="block text-[10px] leading-tight text-slate-400">{levelLabel(option)}</span>
                              </button>
                            ))}
                          </div>
                          {selectedProgram.levels.length === 0 && <p className="mt-2 text-xs text-amber-700">Aucun niveau n’est ouvert pour cette filière. Contactez votre administration.</p>}
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* Password */}
                      {accountType === 'PERSONAL' && (
                        <div>
                          <label className="block text-sm font-bold text-[#374151] mb-2">Pays de facturation</label>
                          <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#0d9488] focus:bg-white transition-all">
                            <option value="CM">Cameroun (XAF)</option>
                            <option value="FR">France (EUR)</option>
                            <option value="BE">Belgique (EUR)</option>
                            <option value="CA">Canada (CAD)</option>
                            <option value="US">États-Unis (USD)</option>
                          </select>
                        </div>
                      )}

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
            <img
              src="/logos/uniflow-wordmark.png"
              alt="UniFlow"
              className="mx-auto h-12 object-contain opacity-70"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = 'true'
                  target.src = '/logo_1.png'
                }
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ReferenceSelect({ icon: Icon, label, value, onChange, options, placeholder, disabled, loading, error }: {
  icon: typeof Building2
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  disabled?: boolean
  loading?: boolean
  error?: string
}) {
  const empty = !loading && !disabled && !error && options.length === 0
  return (
    <div>
      <label className="block text-sm font-bold text-[#374151] mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading || Boolean(error)}
          aria-invalid={Boolean(error)}
          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#0d9488] focus:bg-white transition-all appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{loading ? 'Chargement…' : placeholder}</option>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-700">{error}</p>}
      {empty && <p className="mt-1.5 text-xs text-amber-700">Aucune entrée n’est encore enregistrée à ce niveau du référentiel.</p>}
    </div>
  )
}
