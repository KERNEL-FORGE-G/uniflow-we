import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserPlus,
  Buildings,
  Globe,
  Sparkle,
  Student,
  UsersThree,
  ChalkboardTeacher,
  User,
  EnvelopeSimple,
  IdentificationCard,
  GraduationCap,
  LockKey,
  Eye,
  EyeSlash,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  CircleNotch,
} from '@phosphor-icons/react'
import { useAuth } from '../../hooks/useAuth'
import { ActionResultSlot } from '../../components/feedback/ActionResult'
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from './AuthShell'
import { useUniversities, useFaculties, usePrograms } from '../../lib/referenceData'

type AccountCategory = 'UNIVERSITY' | 'PERSONAL'
type IndependentRole = 'STUDENT' | 'DELEGATE' | 'TEACHER'

const INDEPENDENT_PROFILES: {
  value: IndependentRole
  label: string
  hint: string
  icon: typeof Student
}[] = [
  {
    value: 'STUDENT',
    label: 'Étudiant indépendant',
    hint: 'Je suis mes cours et progrès à mon rythme',
    icon: Student,
  },
  {
    value: 'DELEGATE',
    label: 'Délégué indépendant',
    hint: "J'anime un groupe d'étude ou une promo",
    icon: UsersThree,
  },
  {
    value: 'TEACHER',
    label: 'Enseignant / Tuteur',
    hint: 'Je publie des ateliers, devoirs et ressources',
    icon: ChalkboardTeacher,
  },
]

const COUNTRIES = [
  { code: 'CM', label: 'Cameroun' },
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CA', label: 'Canada' },
  { code: 'SN', label: 'Sénégal' },
  { code: 'CI', label: "Côte d'Ivoire" },
  { code: 'GA', label: 'Gabon' },
  { code: 'TD', label: 'Tchad' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error, setError } = useAuth()

  // Type de compte : Indépendant (Hors université) ou Académique (Université)
  const [category, setCategory] = useState<AccountCategory>('UNIVERSITY')

  // Rôle indépendant (seuls Étudiant, Délégué, Enseignant sont autorisés)
  const [indepRole, setIndepRole] = useState<IndependentRole>('STUDENT')

  // Champs de base
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [matricule, setMatricule] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [countryCode, setCountryCode] = useState('CM')
  const [freeLevel, setFreeLevel] = useState('')

  // Données hiérarchiques académiques chargées 100% depuis la BD Appwrite
  const [selectedUniv, setSelectedUniv] = useState('')
  const [selectedUnivCode, setSelectedUnivCode] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedFacultyCode, setSelectedFacultyCode] = useState('')
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedProgramCode, setSelectedProgramCode] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')

  const [step, setStep] = useState<1 | 2>(1)

  // Référentiel en ligne Appwrite lu directement depuis la base
  const { data: dbUniversities } = useUniversities()
  const { data: dbFaculties } = useFaculties(selectedUnivCode)
  const { data: dbPrograms } = usePrograms(selectedUnivCode, selectedFacultyCode)

  const universitiesList = dbUniversities || []
  const facultiesList = dbFaculties || []
  const programsList = dbPrograms || []

  // Synchronisation dynamique dès que la BD répond
  if (universitiesList.length > 0 && !selectedUnivCode) {
    const firstU = universitiesList[0]
    setSelectedUniv(firstU.name)
    setSelectedUnivCode(firstU.code)
  }

  if (
    facultiesList.length > 0 &&
    (!selectedFacultyCode || !facultiesList.some((f) => f.code === selectedFacultyCode))
  ) {
    const firstF = facultiesList[0]
    setSelectedFaculty(firstF.name)
    setSelectedFacultyCode(firstF.code)
  }

  if (
    programsList.length > 0 &&
    (!selectedProgramCode || !programsList.some((p) => p.code === selectedProgramCode))
  ) {
    const firstP = programsList[0]
    setSelectedProgram(firstP.name)
    setSelectedProgramCode(firstP.code)
    if (firstP.levels?.length) {
      setSelectedLevel(firstP.levels[0])
    }
  }

  const currentProgramObj = programsList.find(
    (p) => p.code === selectedProgramCode || p.name === selectedProgram,
  )
  const availableLevels = currentProgramObj?.levels?.length
    ? currentProgramObj.levels
    : ['L1', 'L2', 'L3']

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Veuillez renseigner votre prénom, votre nom et votre adresse email.')
      return
    }
    if (category === 'UNIVERSITY' && !matricule.trim()) {
      setError('Le matricule étudiant est obligatoire pour un compte académique.')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    try {
      let res: { user: any } | undefined
      if (category === 'UNIVERSITY') {
        // Compte académique : seul STUDENT peut s'auto-inscrire
        res = await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: 'STUDENT',
          accountType: 'UNIVERSITY',
          countryCode,
          matricule: matricule.trim(),
          university: selectedUniv,
          faculty: selectedFaculty,
          program: selectedProgram,
          level: selectedLevel,
        })
      } else {
        // Compte indépendant : STUDENT, DELEGATE ou TEACHER
        res = await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: indepRole,
          accountType: 'PERSONAL',
          countryCode,
          level: freeLevel.trim() || undefined,
        })
      }
      const dest = res?.user?.role === 'ADMIN' || res?.user?.isSuperAdmin ? '/admin' : '/app'
      navigate(dest, { replace: true })
      setTimeout(() => {
        if (window.location.pathname === '/register') {
          window.location.href = dest
        }
      }, 100)
    } catch {
      // Erreur affichée par useAuth
    }
  }

  return (
    <AuthShell
      icon={UserPlus}
      eyebrow={`Étape ${step} sur 2`}
      title="Créer un compte UniFlow"
      subtitle={
        step === 1
          ? 'Choisissez votre univers de travail et renseignez votre identité.'
          : category === 'UNIVERSITY'
          ? 'Précisez votre affiliation académique UY1 et sécurisez votre accès.'
          : 'Finalisez votre profil d’apprentissage avec un mot de passe sécurisé.'
      }
      maxWidth="max-w-xl"
      illustrationSrc="/illustrations/hero.jpg"
      footer={
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-500">Vous avez déjà un compte ?</span>
          <Link
            to="/login"
            className="font-bold text-[#1E3A8A] transition-colors hover:text-[#0D9488] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            Se connecter
          </Link>
        </div>
      }
    >
      {/* ── Stepper visuel moderne ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2.5">
          <span
            className={`inline-flex items-center gap-1.5 transition-colors ${
              step === 1 ? 'text-[#1E3A8A]' : 'text-slate-500'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                step === 1
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {step === 2 ? '✓' : '1'}
            </span>
            <span>Identité & Espace</span>
          </span>

          <span
            className={`inline-flex items-center gap-1.5 transition-colors ${
              step === 2 ? 'text-[#0D9488]' : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                step === 2 ? 'bg-[#0D9488] text-white shadow-xs' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </span>
            <span>Cursus & Sécurité</span>
          </span>
        </div>

        <div className="flex gap-2" aria-hidden="true">
          <div className="h-1.5 flex-1 rounded-full bg-[#1E3A8A] transition-all" />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              step === 2 ? 'bg-[#0D9488]' : 'bg-slate-200'
            }`}
          />
        </div>
      </div>

      <ActionResultSlot
        result={error ? { status: 'error', title: 'Inscription impossible', description: error } : null}
      />

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-4">
          {/* ── Choix du mode d'espace ── */}
          <fieldset>
            <legend className={authLabelClass}>Type d’espace souhaité</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCategory('UNIVERSITY')}
                className={`group relative flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all duration-200 ${
                  category === 'UNIVERSITY'
                    ? 'border-[#1E3A8A] bg-blue-50/70 shadow-sm ring-1 ring-[#1E3A8A]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    category === 'UNIVERSITY'
                      ? 'bg-[#1E3A8A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  <Buildings
                    weight={category === 'UNIVERSITY' ? 'fill' : 'regular'}
                    className="h-5 w-5"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900">Espace Académique</span>
                    {category === 'UNIVERSITY' && (
                      <CheckCircle weight="fill" className="h-4 w-4 text-[#1E3A8A]" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 leading-snug">
                    UY1 & Facultés · Inscription Étudiant
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('PERSONAL')}
                className={`group relative flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all duration-200 ${
                  category === 'PERSONAL'
                    ? 'border-[#0D9488] bg-teal-50/70 shadow-sm ring-1 ring-[#0D9488]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    category === 'PERSONAL'
                      ? 'bg-[#0D9488] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  <Globe weight={category === 'PERSONAL' ? 'fill' : 'regular'} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900">Espace Indépendant</span>
                    {category === 'PERSONAL' && (
                      <CheckCircle weight="fill" className="h-4 w-4 text-[#0D9488]" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 leading-snug">
                    Autonome · Tout cursus & auditeur libre
                  </p>
                </div>
              </button>
            </div>
          </fieldset>

          {/* Note explicative pour le compte académique */}
          {category === 'UNIVERSITY' ? (
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/70 p-3.5 text-xs text-blue-900 leading-relaxed flex items-center gap-2.5 shadow-xs">
              <Sparkle weight="fill" className="h-4 w-4 shrink-0 text-[#1E3A8A]" />
              <span>
                <strong>Information enseignants & administration :</strong> Les accès enseignants et
                administration universitaire sont déployés directement depuis le panel de gestion de
                votre faculté.
              </span>
            </div>
          ) : (
            /* Choix du profil pour les comptes indépendants */
            <fieldset>
              <legend className={authLabelClass}>Votre profil indépendant</legend>
              <div className="grid grid-cols-3 gap-2.5">
                {INDEPENDENT_PROFILES.map(({ value, label, icon: Icon }) => {
                  const active = indepRole === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setIndepRole(value)}
                      className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3 text-center transition-all duration-200 ${
                        active
                          ? 'border-[#0D9488] bg-teal-50/80 text-slate-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon
                        weight={active ? 'fill' : 'regular'}
                        className={`h-5 w-5 ${active ? 'text-[#0D9488]' : 'text-slate-400'}`}
                      />
                      <span className="mt-1 text-xs font-bold leading-tight">
                        {label.replace(' indépendant', '')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-first" className={authLabelClass}>
                Prénom
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User weight="duotone" className="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-first"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Ravel"
                  className={`${authInputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-last" className={authLabelClass}>
                Nom
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User weight="duotone" className="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-last"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Nghomsi"
                  className={`${authInputClass} pl-10`}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className={authLabelClass}>
              Adresse email {category === 'UNIVERSITY' ? '(institutionnelle ou personnelle)' : ''}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <EnvelopeSimple weight="duotone" className="h-4.5 w-4.5" />
              </span>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre.email@exemple.cm"
                className={`${authInputClass} pl-10`}
              />
            </div>
          </div>

          {category === 'UNIVERSITY' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reg-matricule" className={authLabelClass.replace('mb-1.5', '')}>
                  Matricule étudiant officiel
                </label>
                <span className="text-[11px] font-semibold text-[#1E3A8A]">
                  Requis pour les présences
                </span>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <IdentificationCard weight="duotone" className="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-matricule"
                  type="text"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                  required
                  placeholder="Ex : 22U1234"
                  className={`${authInputClass} pl-10 font-mono uppercase tracking-wider`}
                />
              </div>
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`${authButtonClass} mt-2`}
          >
            <span>Continuer vers le cursus & mot de passe</span>
            <ArrowRight weight="bold" className="h-4 w-4" />
          </motion.button>
        </form>
      ) : (
        /* Étape 2 : Choix académique détaillé ou configuration libre + mot de passe */
        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] transition-colors hover:text-[#0D9488] hover:underline mb-1"
          >
            <ArrowLeft weight="bold" className="h-3.5 w-3.5" />
            <span>Modifier l’identité ou le type d’espace</span>
          </button>

          {category === 'UNIVERSITY' ? (
            <div className="space-y-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap weight="fill" className="h-4 w-4 text-[#1E3A8A]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Affiliation Académique (Données Officielles UY1)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 border border-teal-300/60 px-2 py-0.5 rounded-md">
                  Vérifié UY1
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* 1. Choix de l'Université */}
                <div>
                  <label htmlFor="reg-univ" className={authLabelClass}>
                    1. Université
                  </label>
                  <select
                    id="reg-univ"
                    value={selectedUniv}
                    onChange={(e) => {
                      const u = universitiesList.find((x) => x.name === e.target.value)
                      setSelectedUniv(e.target.value)
                      if (u?.code) setSelectedUnivCode(u.code)
                    }}
                    className={authInputClass}
                  >
                    {universitiesList.map((u) => (
                      <option key={u.code || u.name} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Choix de la Faculté */}
                <div>
                  <label htmlFor="reg-fac" className={authLabelClass}>
                    2. Faculté / Établissement
                  </label>
                  <select
                    id="reg-fac"
                    value={selectedFaculty}
                    onChange={(e) => {
                      const f = facultiesList.find((x) => x.name === e.target.value)
                      setSelectedFaculty(e.target.value)
                      if (f?.code) setSelectedFacultyCode(f.code)
                    }}
                    className={authInputClass}
                  >
                    {facultiesList.map((f) => (
                      <option key={f.code || f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Choix de la Filière */}
              <div>
                <label htmlFor="reg-prog" className={authLabelClass}>
                  3. Filière / Programme académique
                </label>
                <select
                  id="reg-prog"
                  value={selectedProgram}
                  onChange={(e) => {
                    const p = programsList.find(
                      (x) => x.name === e.target.value || x.code === e.target.value,
                    )
                    setSelectedProgram(e.target.value)
                    if (p?.code) {
                      setSelectedProgramCode(p.code)
                      if (p.levels?.length) {
                        setSelectedLevel(p.levels[0])
                      }
                    }
                  }}
                  className={authInputClass}
                >
                  {programsList.map((p) => (
                    <option key={p.code || p.name} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Choix du Niveau avec pilules interactives */}
              <div>
                <label className={authLabelClass}>4. Niveau d’études</label>
                <div className="flex flex-wrap gap-2">
                  {availableLevels.map((lvl) => {
                    const isSelected = selectedLevel === lvl
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedLevel(lvl)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                          isSelected
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Informations complémentaires pour compte indépendant */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-country" className={authLabelClass}>
                  Pays de résidence
                </label>
                <select
                  id="reg-country"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className={authInputClass}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="reg-free-level" className={authLabelClass}>
                  Niveau / Domaine <span className="font-normal text-slate-400">(facultatif)</span>
                </label>
                <input
                  id="reg-free-level"
                  type="text"
                  value={freeLevel}
                  onChange={(e) => setFreeLevel(e.target.value)}
                  placeholder="Ex : Autodidacte, Licence, Pro"
                  className={authInputClass}
                />
              </div>
            </div>
          )}

          {/* Mot de passe et confirmation côte à côte */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-pwd" className={authLabelClass}>
                Mot de passe (≥ 8 caractères)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <LockKey weight="duotone" className="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-pwd"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className={`${authInputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwd ? (
                    <EyeSlash weight="bold" className="h-4 w-4" />
                  ) : (
                    <Eye weight="bold" className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className={authLabelClass}>
                Confirmez le mot de passe
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <LockKey weight="duotone" className="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-confirm"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className={`${authInputClass} pl-10`}
                />
              </div>
            </div>
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
                <span>Création de votre espace en cours…</span>
              </>
            ) : (
              <>
                <span>Créer mon compte UniFlow</span>
                <CheckCircle weight="bold" className="h-4 w-4" />
              </>
            )}
          </motion.button>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-center text-[11px] text-slate-500 leading-normal">
            ℹ️ Si un e-mail de confirmation vous est envoyé, pensez à vérifier votre dossier{' '}
            <strong>Spam / Courriers indésirables</strong> s'il n'apparaît pas immédiatement dans
            votre boîte principale.
          </div>
        </form>
      )}
    </AuthShell>
  )
}
