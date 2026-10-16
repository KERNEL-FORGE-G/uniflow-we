import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, CheckCircle, ArrowRight, ArrowLeft, Users, GraduationCap, Presentation, UserPlus, type LucideIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ActionResultSlot } from '../../components/feedback/ActionResult'
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from './AuthShell'

type SignupRole = 'STUDENT' | 'DELEGATE' | 'TEACHER'

// Trois profils seulement : le choix détermine l'expérience dans l'app.
const PROFILES: { value: SignupRole; label: string; hint: string; icon: LucideIcon }[] = [
  { value: 'STUDENT', label: 'Étudiant', hint: 'Je suis mes cours et mes progrès', icon: GraduationCap },
  { value: 'DELEGATE', label: 'Délégué', hint: 'J’anime un groupe d’étude', icon: Users },
  { value: 'TEACHER', label: 'Enseignant', hint: 'Je donne cours à mes élèves', icon: Presentation },
]

const COUNTRIES = [
  { code: 'CM', label: 'Cameroun' },
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CA', label: 'Canada' },
  { code: 'US', label: 'États-Unis' },
]

export default function RegisterPage() {
  const { register, loading, error, setError } = useAuth()
  const [role, setRole] = useState<SignupRole>('STUDENT')
  const [countryCode, setCountryCode] = useState('CM')
  // Niveau d'études libre : un apprenant indépendant n'a pas de cursus imposé.
  const [level, setLevel] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Veuillez remplir votre prénom, votre nom et votre adresse email.')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
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
        role,
        accountType: 'PERSONAL',
        countryCode,
        level: level.trim() || undefined,
      })
    } catch {
      // L’erreur est affichée par useAuth
    }
  }

  return (
    <AuthShell
      icon={UserPlus}
      eyebrow={`Étape ${step} sur 2`}
      title="Créer mon espace UniFlow"
      subtitle={step === 1 ? 'Dites-nous qui vous êtes et comment vous comptez utiliser UniFlow.' : 'Dernière étape : votre pays, votre niveau et un mot de passe sécurisé.'}
      maxWidth="max-w-lg"
      illustrationSrc="/illustrations/hero.jpg"
      footer={
        <>Vous avez déjà un compte ?{' '}
          <Link to="/login" className="font-bold text-[#1E3A8A] hover:text-[#0D9488] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">Se connecter</Link>
        </>
      }
    >
      <div className="mb-5 flex gap-1.5" aria-hidden="true">
        <span className="h-1.5 flex-1 rounded-full bg-[#1E3A8A]" />
        <span className={`h-1.5 flex-1 rounded-full transition-colors ${step === 2 ? 'bg-[#0D9488]' : 'bg-slate-200'}`} />
      </div>

      <ActionResultSlot result={error ? { status: 'error', title: 'Inscription impossible', description: error } : null} />

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-4">
          <fieldset>
            <legend className={authLabelClass}>Votre profil</legend>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
              {PROFILES.map(({ value, label, hint, icon: Icon }) => {
                const active = role === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setRole(value)}
                    className={`rounded-2xl border-2 p-3 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] ${active ? 'border-[#1E3A8A] bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <Icon className={`mb-2 h-5 w-5 ${active ? 'text-[#1E3A8A]' : 'text-slate-400'}`} aria-hidden="true" />
                    <span className="block text-sm font-bold text-slate-900">{label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{hint}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-first" className={authLabelClass}>Prénom</label>
              <input id="reg-first" type="text" autoComplete="given-name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required placeholder="Emma" className={authInputClass} />
            </div>
            <div>
              <label htmlFor="reg-last" className={authLabelClass}>Nom</label>
              <input id="reg-last" type="text" autoComplete="family-name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required placeholder="Martin" className={authInputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="reg-email" className={authLabelClass}>Adresse email</label>
            <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="vous@exemple.com" className={authInputClass} />
          </div>

          <button type="submit" className={authButtonClass}>
            <span>Continuer</span><ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-country" className={authLabelClass}>Pays</label>
              <select id="reg-country" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={authInputClass}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="reg-level" className={authLabelClass}>Niveau d’études <span className="font-medium text-slate-400">(facultatif)</span></label>
              <input id="reg-level" type="text" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Ex : Terminale, Licence 2, autodidacte" className={authInputClass} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-pwd" className={authLabelClass}>Mot de passe</label>
              <div className="relative">
                <input id="reg-pwd" type={showPwd ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} placeholder="8 caractères min." className={`${authInputClass} pr-11`} />
                <button type="button" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md text-slate-400 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E3A8A]">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-confirm" className={authLabelClass}>Confirmation</label>
              <input id="reg-confirm" type={showPwd ? 'text' : 'password'} autoComplete="new-password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} required placeholder="Répétez" className={authInputClass} />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E3A8A]">
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <button type="submit" disabled={loading} className={authButtonClass}>
              {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>Création…</span></>) : (<><span>Créer mon compte</span><CheckCircle className="h-4 w-4" /></>)}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
