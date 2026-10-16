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
  const { data: dbUniversities, isLoading: loadingUnivs } = useUniversities()
  const { data: dbFaculties, isLoading: loadingFacs } = useFaculties(selectedUnivCode)
  const { data: dbPrograms, isLoading: loadingProgs } = usePrograms(selectedUnivCode, selectedFacultyCode)

  const universitiesList = dbUniversities || []
  const facultiesList = dbFaculties || []
  const programsList = dbPrograms || []

  // Synchronisation dynamique dès que la BD répond
  if (universitiesList.length > 0 && !selectedUnivCode) {
    const firstU = universitiesList[0]
    setSelectedUniv(firstU.name)
    setSelectedUnivCode(firstU.code)
  }

  if (facultiesList.length > 0 && (!selectedFacultyCode || !facultiesList.some(f => f.code === selectedFacultyCode))) {
    const firstF = facultiesList[0]
    setSelectedFaculty(firstF.name)
    setSelectedFacultyCode(firstF.code)
  }

  if (programsList.length > 0 && (!selectedProgramCode || !programsList.some(p => p.code === selectedProgramCode))) {
    const firstP = programsList[0]
    setSelectedProgram(firstP.name)
    setSelectedProgramCode(firstP.code)
    if (firstP.levels?.length) {
      setSelectedLevel(firstP.levels[0])
    }
  }

  const currentProgramObj = programsList.find(p => p.code === selectedProgramCode || p.name === selectedProgram)
  const availableLevels = currentProgramObj?.levels?.length ? currentProgramObj.levels : ['L1', 'L2', 'L3']

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
          ? 'Choisissez votre espace et renseignez vos informations d’identité.'
          : category === 'UNIVERSITY'
          ? 'Précisez votre cursus académique et sécurisez votre accès.'
          : 'Finalisez votre profil d’apprentissage avec un mot de passe sécurisé.'
      }
      maxWidth="max-w-2xl"
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
      {/* Barre de progression des étapes avec libellés */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="inline-flex items-center gap-1.5 text-[#1E3A8A]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E3A8A] text-[10px] text-white">1</span>
            <span>Identité & Espace</span>
          </span>
          <span className={`inline-flex items-center gap-1.5 ${step === 2 ? 'text-[#0D9488]' : 'text-slate-400'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 2 ? 'bg-[#0D9488] text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            <span>Cursus & Sécurité</span>
          </span>
        </div>
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-1.5 flex-1 rounded-full bg-[#1E3A8A]" />
          <span className={`h-1.5 flex-1 rounded-full transition-colors ${step === 2 ? 'bg-[#0D9488]' : 'bg-slate-200'}`} />
        </div>
      </div>

      <ActionResultSlot result={error ? { status: 'error', title: 'Inscription impossible', description: error } : null} />

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-4">
          {/* ── Sélecteur de type de compte : Académique vs Indépendant ── */}
          <fieldset>
            <legend className={authLabelClass}>Type d’espace souhaité</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCategory('UNIVERSITY')}
                className={`group relative flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
                  category === 'UNIVERSITY'
                    ? 'border-[#1E3A8A] bg-blue-50/70 shadow-sm ring-1 ring-[#1E3A8A]/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  category === 'UNIVERSITY' ? 'bg-[#1E3A8A] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900">Espace Académique</span>
                    {category === 'UNIVERSITY' && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1E3A8A] text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
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
                className={`group relative flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
                  category === 'PERSONAL'
                    ? 'border-[#0D9488] bg-teal-50/70 shadow-sm ring-1 ring-[#0D9488]/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  category === 'PERSONAL' ? 'bg-[#0D9488] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  <Globe className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900">Espace Indépendant</span>
                    {category === 'PERSONAL' && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0D9488] text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
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
            <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-3 text-xs text-blue-900 leading-relaxed flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-[#1E3A8A]" />
              <span>
                <strong>Information enseignants & administration :</strong> Les accès enseignants et administration universitaire sont créés directement depuis le panel de gestion de votre faculté.
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
                      className={`flex flex-col items-center justify-center rounded-xl border-2 p-2.5 text-center transition-all ${
                        active
                          ? 'border-[#0D9488] bg-teal-50/70 text-slate-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-[#0D9488]' : 'text-slate-400'}`} />
                      <span className="mt-1 text-xs font-bold">{label.replace(' indépendant', '')}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          {/* Informations personnelles */}
          <div className="grid gap-3.5 sm:grid-cols-2">
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

          <div className={category === 'UNIVERSITY' ? 'grid gap-3.5 sm:grid-cols-2' : ''}>
            <div>
              <label htmlFor="reg-email" className={authLabelClass}>
                Adresse email {category === 'UNIVERSITY' ? '(universitaire ou perso)' : ''}
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nom@exemple.cm"
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
                  placeholder="Ex : 22U1234"
                  className={authInputClass}
                />
              </div>
            )}
          </div>

          <button type="submit" className={authButtonClass}>
            <span>Continuer vers le cursus & mot de passe</span>
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
            <span>Modifier l’identité ou le type d’espace</span>
          </button>

          {category === 'UNIVERSITY' ? (
            <div className="space-y-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#1E3A8A]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Affiliation Académique (Données Officielles UY1)
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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
                  <label htmlFor="reg-fac" className={authLabelClass}>2. Faculté / Établissement</label>
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
                  <label htmlFor="reg-prog" className={authLabelClass}>3. Filière / Programme</label>
                  <select
                    id="reg-prog"
                    value={selectedProgram}
                    onChange={(e) => {
                      const p = programsList.find((x) => x.name === e.target.value || x.code === e.target.value)
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
                      <option key={p.code || p.name} value={p.name}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>

                {/* 4. Choix du Niveau */}
                <div>
                  <label htmlFor="reg-level" className={authLabelClass}>4. Niveau d’études (ouvert)</label>
                  <select
                    id="reg-level"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className={authInputClass}
                  >
                    {availableLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Informations complémentaires pour compte indépendant */
            <div className="grid gap-3.5 sm:grid-cols-2">
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
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-pwd" className={authLabelClass}>Mot de passe (≥ 8 caractères)</label>
              <div className="relative">
                <input
                  id="reg-pwd"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className={`${authInputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
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

          <p className="text-center text-[11px] text-slate-500 leading-normal">
            ℹ️ Si un e-mail de confirmation vous est envoyé, pensez à vérifier votre dossier <strong>Spam / Courriers indésirables</strong> s'il n'apparaît pas immédiatement dans votre boîte principale.
          </p>
        </form>
      )}
    </AuthShell>
  )
}
