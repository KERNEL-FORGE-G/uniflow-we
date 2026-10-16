import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Users, GraduationCap, Presentation, UserPlus, Building2, Globe, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ActionResultSlot } from '../../components/feedback/ActionResult'
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from './AuthShell'
import { useUniversities, useFaculties, usePrograms } from '../../lib/referenceData'

type AccountCategory = 'UNIVERSITY' | 'PERSONAL'
type IndependentRole = 'STUDENT' | 'DELEGATE' | 'TEACHER'

const INDEPENDENT_PROFILES: { value: IndependentRole; label: string; hint: string; icon: typeof GraduationCap }[] = [
  { value: 'STUDENT', label: 'Étudiant indépendant', hint: 'Je suis mes cours et progrès à mon propre rythme', icon: GraduationCap },
  { value: 'DELEGATE', label: 'Délégué indépendant', hint: 'J’anime un groupe d’étude ou une communauté', icon: Users },
  { value: 'TEACHER', label: 'Enseignant / Tuteur', hint: 'Je publie des ateliers, devoirs et ressources', icon: Presentation },
]

const DEFAULT_UNIVERSITIES = [
  { code: 'UY1', name: 'Université de Yaoundé I' },
  { code: 'UD', name: 'Université de Douala' },
  { code: 'UDS', name: 'Université de Dschang' },
  { code: 'UN', name: 'Université de Ngaoundéré' },
  { code: 'UM', name: 'Université de Maroua' },
  { code: 'UB', name: 'University of Buea' },
  { code: 'UBa', name: 'The University of Bamenda' },
  { code: 'UBert', name: 'Université de Bertoua' },
  { code: 'UEb', name: 'Université d’Ebolowa' },
]

const DEFAULT_FACULTIES: Record<string, { code: string; name: string }[]> = {
  UY1: [
    { code: 'FS', name: 'Faculté des Sciences (FS)' },
    { code: 'FALSH', name: 'Faculté des Arts, Lettres et Sciences Humaines' },
    { code: 'FMSB', name: 'Faculté de Médecine et Sciences Biomédicales' },
    { code: 'POLYTECH', name: 'École Nationale Supérieure Polytechnique' },
    { code: 'ENS', name: 'École Normale Supérieure' },
  ],
  DEFAULT: [
    { code: 'FS', name: 'Faculté des Sciences' },
    { code: 'FSJP', name: 'Faculté des Sciences Juridiques et Politiques' },
    { code: 'FSEG', name: 'Faculté des Sciences Économiques et de Gestion' },
    { code: 'TECH', name: 'Institut Universitaire de Technologie' },
  ],
}

const DEFAULT_PROGRAMS: Record<string, { code: string; name: string }[]> = {
  FS: [
    { code: 'ICT4D', name: 'ICT for Development (ICT4D)' },
    { code: 'INFO', name: 'Informatique Fondamentale' },
    { code: 'MATH', name: 'Mathématiques' },
    { code: 'PHYS', name: 'Physique' },
    { code: 'CHIM', name: 'Chimie' },
    { code: 'BIO', name: 'Biosciences' },
  ],
  DEFAULT: [
    { code: 'INFO', name: 'Informatique & Numérique' },
    { code: 'GEST', name: 'Gestion & Économie' },
    { code: 'DROIT', name: 'Droit Privé / Public' },
    { code: 'GENIE', name: 'Ingénierie & Technologie' },
  ],
}

const ACADEMIC_LEVELS = [
  { code: 'L1', label: 'Licence 1 (L1)' },
  { code: 'L2', label: 'Licence 2 (L2)' },
  { code: 'L3', label: 'Licence 3 (L3)' },
  { code: 'M1', label: 'Master 1 (M1)' },
  { code: 'M2', label: 'Master 2 (M2)' },
  { code: 'DOC', label: 'Doctorat (PhD)' },
]

const COUNTRIES = [
  { code: 'CM', label: 'Cameroun' },
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CA', label: 'Canada' },
  { code: 'SN', label: 'Sénégal' },
  { code: 'CI', label: 'Côte d’Ivoire' },
  { code: 'GA', label: 'Gabon' },
  { code: 'TD', label: 'Tchad' },
]

export default function RegisterPage() {
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

  // Données hiérarchiques académiques
  const [selectedUniv, setSelectedUniv] = useState('Université de Yaoundé I')
  const [selectedUnivCode, setSelectedUnivCode] = useState('UY1')
  const [selectedFaculty, setSelectedFaculty] = useState('Faculté des Sciences (FS)')
  const [selectedFacultyCode, setSelectedFacultyCode] = useState('FS')
  const [selectedProgram, setSelectedProgram] = useState('ICT for Development (ICT4D)')
  const [selectedLevel, setSelectedLevel] = useState('L1')

  const [step, setStep] = useState<1 | 2>(1)

  // Référentiel en ligne Appwrite avec repli local
  const { data: dbUniversities } = useUniversities()
  const { data: dbFaculties } = useFaculties(selectedUnivCode)
  const { data: dbPrograms } = usePrograms(selectedUnivCode, selectedFacultyCode)

  const universitiesList = dbUniversities?.length ? dbUniversities : DEFAULT_UNIVERSITIES
  const facultiesList = dbFaculties?.length
    ? dbFaculties
    : (DEFAULT_FACULTIES[selectedUnivCode] || DEFAULT_FACULTIES.DEFAULT)
  const programsList = dbPrograms?.length
    ? dbPrograms
    : (DEFAULT_PROGRAMS[selectedFacultyCode] || DEFAULT_PROGRAMS.DEFAULT)

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
      if (category === 'UNIVERSITY') {
        // Compte académique : seul STUDENT peut s'auto-inscrire
        await register({
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
        await register({
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
          ? 'Choisissez votre type de compte et renseignez vos informations d’identité.'
          : category === 'UNIVERSITY'
          ? 'Précisez votre cursus académique (université, filière, niveau) et choisissez votre mot de passe.'
          : 'Finalisez votre profil d’apprentissage indépendant avec un mot de passe sécurisé.'
      }
      maxWidth="max-w-xl"
      illustrationSrc="/illustrations/hero.jpg"
      footer={
        <>
          Vous avez déjà un compte ?{' '}
          <Link
            to="/login"
            className="font-bold text-[#1E3A8A] hover:text-[#0D9488] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            Se connecter
          </Link>
        </>
      }
    >
      {/* Barre de progression des étapes */}
      <div className="mb-6 flex gap-2" aria-hidden="true">
        <span className="h-1.5 flex-1 rounded-full bg-[#1E3A8A]" />
        <span className={`h-1.5 flex-1 rounded-full transition-colors ${step === 2 ? 'bg-[#0D9488]' : 'bg-slate-200'}`} />
      </div>

      <ActionResultSlot result={error ? { status: 'error', title: 'Inscription impossible', description: error } : null} />

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-5">
          {/* ── Sélecteur de type de compte : Académique vs Indépendant ── */}
          <fieldset>
            <legend className={authLabelClass}>Type d’espace souhaité</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCategory('UNIVERSITY')}
                className={`relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
                  category === 'UNIVERSITY'
                    ? 'border-[#1E3A8A] bg-blue-50/70 shadow-sm ring-1 ring-[#1E3A8A]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A8A] text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900">Compte Académique</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Université</span>
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-snug">
                  Rattaché à une université (UY1, Douala, Dschang...). Inscription réservée aux <strong>Étudiants</strong>.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCategory('PERSONAL')}
                className={`relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
                  category === 'PERSONAL'
                    ? 'border-[#0D9488] bg-teal-50/70 shadow-sm ring-1 ring-[#0D9488]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D9488] text-white">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900">Compte Indépendant</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">Autonome</span>
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-snug">
                  Non relié à une université. Ouvert aux <strong>Étudiants</strong>, <strong>Délégués</strong> et <strong>Enseignants</strong>.
                </p>
              </button>
            </div>
          </fieldset>

          {/* Note explicative pour le compte académique */}
          {category === 'UNIVERSITY' ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-[#1E3A8A] mt-0.5" />
              <div>
                <strong>Information enseignants & administration :</strong> Les comptes pour enseignants et administration universitaire sont créés directement depuis le <strong>panel d'administration</strong> de votre faculté.
              </div>
            </div>
          ) : (
            /* Choix du profil pour les comptes indépendants */
            <fieldset>
              <legend className={authLabelClass}>Votre profil indépendant</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {INDEPENDENT_PROFILES.map(({ value, label, hint, icon: Icon }) => {
                  const active = indepRole === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setIndepRole(value)}
                      className={`rounded-2xl border-2 p-3 text-left transition-all ${
                        active ? 'border-[#0D9488] bg-teal-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`mb-1.5 h-5 w-5 ${active ? 'text-[#0D9488]' : 'text-slate-400'}`} />
                      <span className="block text-xs font-bold text-slate-900">{label}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-500 leading-tight">{hint}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          {/* Informations personnelles */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-first" className={authLabelClass}>Prénom</label>
              <input
                id="reg-first"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Ravel"
                className={authInputClass}
              />
            </div>
            <div>
              <label htmlFor="reg-last" className={authLabelClass}>Nom</label>
              <input
                id="reg-last"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Nghomsi"
                className={authInputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className={authLabelClass}>
              Adresse email {category === 'UNIVERSITY' ? '(universitaire ou personnelle)' : ''}
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre.nom@facsciences-uy1.cm ou gmail.com"
              className={authInputClass}
            />
          </div>

          {category === 'UNIVERSITY' && (
            <div>
              <label htmlFor="reg-matricule" className={authLabelClass}>
                Matricule étudiant officiel
              </label>
              <input
                id="reg-matricule"
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                required
                placeholder="Ex : 22U1234 ou 21S4567"
                className={authInputClass}
              />
            </div>
          )}

          <button type="submit" className={authButtonClass}>
            <span>Continuer vers l’étape 2</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        /* Étape 2 : Choix académique détaillé ou configuration libre + mot de passe */
        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Modifier le type ou l’identité</span>
          </button>

          {category === 'UNIVERSITY' ? (
            <div className="space-y-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#1E3A8A]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Affiliation Académique
                </h3>
              </div>

              {/* 1. Choix de l'Université */}
              <div>
                <label htmlFor="reg-univ" className={authLabelClass}>1. Université</label>
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
                    <option key={u.code || u.name} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Choix de la Faculté */}
              <div>
                <label htmlFor="reg-fac" className={authLabelClass}>2. Faculté ou Établissement</label>
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
                    <option key={f.code || f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Choix de la Filière */}
              <div>
                <label htmlFor="reg-prog" className={authLabelClass}>3. Filière / Programme d’études</label>
                <select
                  id="reg-prog"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className={authInputClass}
                >
                  {programsList.map((p) => (
                    <option key={p.code || p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* 4. Choix du Niveau */}
              <div>
                <label htmlFor="reg-level" className={authLabelClass}>4. Niveau actuel</label>
                <select
                  id="reg-level"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className={authInputClass}
                >
                  {ACADEMIC_LEVELS.map((lvl) => (
                    <option key={lvl.code} value={lvl.code}>{lvl.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Informations complémentaires pour compte indépendant */
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-country" className={authLabelClass}>Pays de résidence</label>
                <select
                  id="reg-country"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className={authInputClass}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="reg-free-level" className={authLabelClass}>
                  Niveau d’études ou domaine <span className="font-medium text-slate-400">(facultatif)</span>
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

          {/* Mot de passe et confirmation */}
          <div>
            <label htmlFor="reg-pwd" className={authLabelClass}>Mot de passe (8 caractères minimum)</label>
            <div className="relative">
              <input
                id="reg-pwd"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className={`${authInputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md text-slate-400 hover:text-slate-600"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="reg-confirm" className={authLabelClass}>Confirmez le mot de passe</label>
            <input
              id="reg-confirm"
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className={authInputClass}
            />
          </div>

          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Création de votre espace en cours…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Créer mon compte UniFlow</span>
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
