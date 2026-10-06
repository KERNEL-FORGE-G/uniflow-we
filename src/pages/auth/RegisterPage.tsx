import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, CheckCircle, ArrowRight, ArrowLeft, Building2, BookOpen, GraduationCap, Globe } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useFaculties, usePrograms, useUniversities } from '../../lib/referenceData'
import { ActionResultSlot } from '../../components/feedback/ActionResult'

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

  useEffect(() => { setFacultyCode(''); setProgramCode(''); setLevel('') }, [universityCode])
  useEffect(() => { setProgramCode(''); setLevel('') }, [facultyCode])
  useEffect(() => { setLevel('') }, [programCode])
  useEffect(() => {
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
      // L’erreur est affichée par useAuth
    }
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-white font-sans overflow-hidden">
      {/* ── Gauche pleine page (50vw) avec mascotte officielle Archlord & Uni ── */}
      <div className="w-full lg:w-1/2 h-full bg-[#F8FAFC] border-b lg:border-b-0 lg:border-r border-slate-200/70 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Cercles décoratifs pastel */}
        <div className="absolute w-96 h-96 rounded-full bg-blue-100/40 blur-3xl -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-80 h-80 rounded-full bg-sky-100/50 blur-3xl -bottom-20 -right-20 pointer-events-none" />

        {/* Logo UniFlow en haut à gauche */}
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

        {/* Mascotte Fistbump officielle pleine hauteur */}
        <div className="my-auto py-4 flex flex-col items-center justify-center relative z-10">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <img
              src="/mascot/archlord_uni_fistbump.webp"
              alt="Archlord & Uni"
              className="h-56 sm:h-72 lg:h-[48vh] max-h-[460px] object-contain drop-shadow-md select-none"
            />
          </motion.div>

          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
              Inscription universitaire simplifiée
            </span>
          </div>
        </div>

        {/* Bas de page gauche */}
        <div className="z-10 text-center lg:text-left">
          <p className="text-xs text-slate-500">
            Archlord et Uni vous accompagnent dès le premier jour sur votre campus.
          </p>
        </div>
      </div>

      {/* ── Droite pleine page (50vw) adaptée à la hauteur sans scroll ── */}
      <div className="w-full lg:w-1/2 h-full bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
        {/* Top bar */}
        <div className="flex justify-between items-center shrink-0 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Étape {step}/2</span>
            <div className="flex gap-1.5 ml-1">
              <span className={`h-1.5 w-7 rounded-full transition-all ${step >= 1 ? 'bg-[#1E3A8A]' : 'bg-slate-200'}`} />
              <span className={`h-1.5 w-7 rounded-full transition-all ${step >= 2 ? 'bg-[#0D9488]' : 'bg-slate-200'}`} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <span>FR 🇫🇷</span>
          </div>
        </div>

        {/* Contenu principal sans scroll */}
        <div className="my-auto max-w-md w-full mx-auto flex flex-col justify-center">
          {/* Header compact */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Créer un compte</h1>
            <p className="text-slate-400 text-xs mt-1">
              {step === 1 ? 'Vos informations personnelles' : accountType === 'PERSONAL' ? 'Sécurité du compte indépendant' : 'Votre cursus universitaire'}
            </p>
          </div>

          {/* Type de compte Toggle compact */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAccountTypeSelection('UNIVERSITY')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                  accountType === 'UNIVERSITY'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-[#1E3A8A]" /> Universitaire
              </button>
              <button
                type="button"
                onClick={() => setAccountTypeSelection('PERSONAL')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                  accountType === 'PERSONAL'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5 text-[#0D9488]" /> Indépendant
              </button>
            </div>
          </div>

          <ActionResultSlot result={error ? { status: 'error', title: 'Inscription impossible', description: error } : null} />

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleNext}
                className="space-y-3.5"
              >
                {/* Nom & Prénom en grille */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => set('firstName', e.target.value)}
                      required
                      placeholder="Emma"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#1E3A8A] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => set('lastName', e.target.value)}
                      required
                      placeholder="Martin"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#1E3A8A] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {accountType === 'PERSONAL' ? 'Adresse email' : 'Adresse email universitaire'}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    required
                    placeholder="exemple@campus.edu"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#1E3A8A] transition-all"
                  />
                </div>

                {/* Bouton Continuer */}
                <button
                  type="submit"
                  className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] hover:from-[#172554] hover:to-[#0F766E] py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-blue-900/20 active:scale-[0.99] transition-all"
                >
                  <span>Continuer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSubmit}
                className="space-y-2.5"
              >
                {accountType === 'PERSONAL' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Pays</label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1E3A8A] transition-all"
                    >
                      <option value="CM">Cameroun (XAF)</option>
                      <option value="FR">France (EUR)</option>
                      <option value="BE">Belgique (EUR)</option>
                      <option value="CA">Canada (CAD)</option>
                      <option value="US">États-Unis (USD)</option>
                    </select>
                  </div>
                ) : (
                  <>
                    {/* Grille 2 colonnes : Matricule + Université */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Matricule (facultatif)</label>
                        <input
                          type="text"
                          value={form.matricule}
                          onChange={(e) => set('matricule', e.target.value)}
                          placeholder="Ex : 22U1234"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#1E3A8A] transition-all"
                        />
                      </div>
                      <div>
                        <ReferenceSelect
                          label="Université"
                          value={universityCode}
                          onChange={setUniversityCode}
                          placeholder="Université"
                          loading={universities.isLoading}
                          options={(universities.data ?? []).map((item) => ({ value: item.code, label: item.city ? `${item.name} (${item.city})` : item.name }))}
                        />
                      </div>
                    </div>

                    {/* Grille 2 colonnes : Faculté + Filière */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <ReferenceSelect
                          label="Faculté"
                          value={facultyCode}
                          onChange={setFacultyCode}
                          placeholder="Faculté"
                          disabled={!universityCode}
                          loading={faculties.isLoading}
                          options={(faculties.data ?? []).map((item) => ({ value: item.code, label: item.name }))}
                        />
                      </div>
                      <div>
                        <ReferenceSelect
                          label="Filière"
                          value={programCode}
                          onChange={setProgramCode}
                          placeholder="Filière"
                          disabled={!facultyCode}
                          loading={programs.isLoading}
                          options={(programs.data ?? []).map((item) => ({ value: item.code, label: item.name === item.code ? item.name : `${item.name} (${item.code})` }))}
                        />
                      </div>
                    </div>

                    {/* Niveau Pills */}
                    {selectedProgram && selectedProgram.levels.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Niveau d'études</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {selectedProgram.levels.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setLevel(opt)}
                              className={`rounded-md border px-2.5 py-1 text-center text-xs font-semibold transition-all ${
                                level === opt ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] font-bold' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Mot de passe & Confirmation en 2 colonnes */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => set('password', e.target.value)}
                        required
                        placeholder="Min. 8 car."
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#1E3A8A] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Confirmation</label>
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={(e) => set('confirm', e.target.value)}
                      required
                      placeholder="Répétez"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#1E3A8A] transition-all"
                    />
                  </div>
                </div>

                {/* Ligne Retour / Créer */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Retour</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] hover:from-[#172554] hover:to-[#0F766E] py-2 px-3 text-xs font-bold text-white shadow-md shadow-blue-900/20 active:scale-[0.99] transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Création...</span>
                      </>
                    ) : (
                      <>
                        <span>Créer mon compte</span>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Lien vers connexion */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-[#1E3A8A] hover:text-[#0D9488] hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer compact */}
        <div className="pt-3 border-t border-slate-100 text-center lg:text-right shrink-0">
          <p className="text-[10px] text-slate-400">
            © 2026 Tous droits réservés · UniFlow KERNEL FORGE
          </p>
        </div>
      </div>
    </div>
  )
}

function ReferenceSelect({ label, value, onChange, options, placeholder, disabled, loading }: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 truncate"
      >
        <option value="">{loading ? 'Chargement…' : placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
