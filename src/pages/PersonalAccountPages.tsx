import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BellOff, BookOpen, CheckCircle2, CircleDollarSign, FileQuestion, Globe2, KeyRound, Loader2, LogOut, MessageCircleOff, Moon, Save, Settings2, ShieldCheck, UserRound, Volume2, VolumeX, Wifi, WifiOff, X } from 'lucide-react'
import { authApi, ApiError, type BackendUser } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useUserRole } from '../utils/userRole'
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus'
import { getSoundMuted, getSoundVolume, setSoundMuted, setSoundVolume } from '../utils/sound'

type PersonalAccountPageKind = 'profile' | 'settings' | 'messages' | 'library' | 'attendance' | 'notifications' | 'video' | 'classrooms' | 'help'

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  return error instanceof Error ? error.message : 'Une erreur est survenue.'
}

export default function PersonalAccountPage({ kind }: { kind: PersonalAccountPageKind }) {
  if (kind === 'profile') return <PersonalProfilePage />
  if (kind === 'settings') return <PersonalSettingsPage />
  const unavailable: Record<Exclude<PersonalAccountPageKind, 'profile' | 'settings'>, { title: string; description: string; icon: typeof FileQuestion }> = {
    messages: { title: 'Messagerie personnelle non exposée', description: 'Le backend personnel actuel ne fournit pas encore de route de messagerie pour les comptes indépendants. Aucun contenu fictif n’est affiché ici.', icon: MessageCircleOff },
    library: { title: 'Bibliothèque personnelle non exposée', description: 'Le backend personnel actuel ne fournit pas encore de stockage documentaire ou de route de bibliothèque pour les comptes indépendants.', icon: BookOpen },
    attendance: { title: 'Présences non applicables hors affiliation', description: 'Le suivi des présences nécessite une session universitaire et une liste d’étudiants affiliés. Cette fonctionnalité reste volontairement indisponible pour un compte indépendant.', icon: ShieldCheck },
    notifications: { title: 'Notifications personnelles non exposées', description: 'Aucune route de notifications personnelles n’est disponible sur le backend actuel. L’application n’invente donc aucune notification.', icon: BellOff },
    video: { title: 'Visioconférence non exposée', description: 'La visioconférence dépend actuellement des services universitaires. Elle n’est pas activée pour les comptes indépendants.', icon: FileQuestion },
    classrooms: { title: 'Salles universitaires non accessibles', description: 'Les salles et ressources sont liées à une université. Les comptes indépendants peuvent gérer leurs propres lieux dans les créneaux de planning.', icon: FileQuestion },
    help: { title: 'Aide personnelle en cours de connexion', description: 'La FAQ et les tickets du backend universitaire ne sont pas utilisés dans un compte indépendant. Pour le moment, consultez votre profil, vos paramètres ou les offres personnelles sans données simulées.', icon: FileQuestion },
  }
  return <PersonalUnavailablePage {...unavailable[kind]} />
}

export function PersonalProfilePage() {
  const { currentUser, setAuthUser } = useUserRole()
  const [user, setUser] = useState<BackendUser | null>(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', countryCode: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    authApi.me().then(profile => {
      if (!mounted) return
      setUser(profile)
      setForm({ firstName: profile.firstName ?? profile.fullName?.split(' ')[0] ?? '', lastName: profile.lastName ?? profile.fullName?.split(' ').slice(1).join(' ') ?? '', email: profile.email, countryCode: profile.countryCode ?? 'CM' })
    }).catch(err => mounted && setError(errorMessage(err))).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Le prénom, le nom et l’email sont obligatoires.')
      return
    }
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const updated = await authApi.updateProfile({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), countryCode: form.countryCode.trim().toUpperCase() })
      setUser(updated)
      setAuthUser(updated)
      localStorage.setItem('uniflow_user', JSON.stringify(updated))
      setNotice('Profil enregistré dans votre compte personnel.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoading label="Chargement de votre profil…" />

  return <div className="mx-auto max-w-5xl space-y-6 pb-12"><PageHeader eyebrow="Compte indépendant" title="Mon profil" description="Vos informations d’identité sont chargées depuis le backend personnel et peuvent être modifiées puis persistées dans Neon." icon={<UserRound className="h-6 w-6" />} /><Alerts error={error} notice={notice} clearError={() => setError(null)} clearNotice={() => setNotice(null)} /><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-blue-700 text-xl font-black text-white">{(form.firstName[0] ?? currentUser.name[0] ?? 'U').toUpperCase()}</div><div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Identité personnelle</p><h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">{user?.fullName ?? currentUser.name}</h2><p className="mt-1 text-xs text-slate-500">{user?.role === 'TEACHER' ? 'Indépendant enseignant' : 'Étudiant indépendant'}</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><ProfileField label="Prénom" value={form.firstName} onChange={value => setForm({ ...form, firstName: value })} required /><ProfileField label="Nom" value={form.lastName} onChange={value => setForm({ ...form, lastName: value })} required /><ProfileField label="Adresse email" type="email" value={form.email} onChange={value => setForm({ ...form, email: value })} required /><ProfileField label="Code pays" value={form.countryCode} onChange={value => setForm({ ...form, countryCode: value })} placeholder="CM" /></div><button type="submit" disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black text-white transition hover:bg-teal-700 disabled:opacity-50 dark:bg-white dark:text-slate-900">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer les modifications</button></form><div className="space-y-6"><AccountFacts user={user} /><SubscriptionStatus /></div></div></div>
}

export function PersonalSettingsPage() {
  const { currentUser, language, setLanguage, isOfflineMode, setIsOfflineMode } = useUserRole()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('uniflow_personal_reduced_motion') === 'true')
  const [soundMuted, setSoundMutedState] = useState(getSoundMuted)
  const [soundVolume, setSoundVolumeState] = useState(getSoundVolume)
  const [notice, setNotice] = useState<string | null>(null)

  const saveInterface = (value: boolean) => {
    setReducedMotion(value)
    localStorage.setItem('uniflow_personal_reduced_motion', String(value))
    setNotice('Préférences d’interface enregistrées sur cet appareil.')
  }

  const saveSound = (muted: boolean, nextVolume = soundVolume) => {
    setSoundMuted(muted)
    setSoundVolume(nextVolume)
    setSoundMutedState(muted)
    setSoundVolumeState(nextVolume)
    setNotice(muted ? 'Les sons de confirmation sont désactivés sur cet appareil.' : 'Sound design activé sur cet appareil.')
  }

  return <div className="mx-auto max-w-5xl space-y-6 pb-12"><PageHeader eyebrow="Espace indépendant" title="Paramètres" description="Des réglages adaptés à votre compte personnel. Les préférences d’affichage sont locales à cet appareil ; vos données académiques restent gérées par le backend personnel." icon={<Settings2 className="h-6 w-6" />} />{notice && <Alerts notice={notice} clearNotice={() => setNotice(null)} />}<div className="grid gap-6 lg:grid-cols-2"><SettingsCard title="Compte" icon={<UserRound className="h-5 w-5" />}><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p><p className="text-xs text-slate-500">{currentUser.email}</p></div><button type="button" onClick={() => navigate('/app/profil')} className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-100">Modifier le profil</button></div><div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Session protégée par JWT.</div></SettingsCard><SettingsCard title="Connexion et synchronisation" icon={isOfflineMode ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}><SettingRow label="Mode hors ligne" description="Suspendre les appels réseau jusqu’à votre reconnexion." control={<button type="button" onClick={() => setIsOfflineMode(!isOfflineMode)} className={`relative h-6 w-11 rounded-full transition ${isOfflineMode ? 'bg-rose-500' : 'bg-emerald-500'}`} aria-pressed={isOfflineMode}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${isOfflineMode ? 'left-6' : 'left-1'}`} /></button>} /><div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Le mode hors ligne empêche les nouvelles lectures et écritures jusqu’à sa désactivation. Aucune donnée fictive n’est injectée.</div></SettingsCard><SettingsCard title="Apparence et sound design" icon={soundMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}><SettingRow label="Sons de feedback" description="Sons courts pour les actions réussies ou les erreurs. Aucun son n’est joué automatiquement." control={<button type="button" data-sound-ignore="true" onClick={() => saveSound(!soundMuted)} className={`relative h-6 w-11 rounded-full transition ${soundMuted ? 'bg-slate-300' : 'bg-teal-600'}`} aria-label={soundMuted ? 'Activer les sons' : 'Désactiver les sons'} aria-pressed={!soundMuted}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${soundMuted ? 'left-1' : 'left-6'}`} /></button>} /><div className="mt-3"><label className="flex items-center justify-between gap-4 text-xs font-bold text-slate-600 dark:text-slate-300"><span>Volume des feedbacks</span><span>{Math.round(soundVolume * 500)}%</span></label><input data-sound-ignore="true" type="range" min="0" max="0.2" step="0.01" value={soundVolume} onChange={event => saveSound(soundMuted, Number(event.target.value))} className="mt-2 w-full accent-teal-600" aria-label="Volume des sons de feedback" /></div><SettingRow label="Langue" description="Langue de l’interface UniFlow." control={<select value={language} onChange={event => { setLanguage(event.target.value as 'FR' | 'EN'); setNotice('Langue mise à jour.') }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"><option value="FR">Français</option><option value="EN">English</option></select>} /><SettingRow label="Réduire les animations" description="Préférence d’accessibilité enregistrée sur cet appareil." control={<button type="button" onClick={() => saveInterface(!reducedMotion)} className={`relative h-6 w-11 rounded-full transition ${reducedMotion ? 'bg-teal-600' : 'bg-slate-300'}`} aria-pressed={reducedMotion}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${reducedMotion ? 'left-6' : 'left-1'}`} /></button>} /></SettingsCard><SettingsCard title="Abonnement et sécurité" icon={<CircleDollarSign className="h-5 w-5" />}><Link to="/pricing" className="flex items-center justify-between rounded-xl bg-teal-50 p-3 text-xs font-bold text-teal-800 hover:bg-teal-100"><span className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4" /> Voir les offres personnelles</span><ArrowRightIcon /></Link><div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-xs text-slate-500 dark:border-slate-800"><KeyRound className="h-4 w-4 text-slate-400" /> La gestion du mot de passe est disponible via le flux d’authentification sécurisé.</div></SettingsCard></div><div className="flex flex-wrap justify-between gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-5"><div><p className="text-sm font-black text-rose-900">Quitter la session</p><p className="mt-1 text-xs text-rose-700">Les données enregistrées dans Neon ne sont pas supprimées.</p></div><button type="button" onClick={() => { logout(); navigate('/login') }} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-700"><LogOut className="h-4 w-4" /> Se déconnecter</button></div></div>
}

export function PersonalUnavailablePage({ title, description, icon: Icon = FileQuestion }: { title: string; description: string; icon?: typeof FileQuestion }) { return <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center py-10"><div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800"><Icon className="h-7 w-7" /></div><p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-teal-700">État réel du service</p><h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{title}</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/app" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-black text-white hover:bg-teal-700 dark:bg-white dark:text-slate-900"><ArrowLeft className="h-4 w-4" /> Retour à mon espace</Link><Link to="/app/profil" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><UserRound className="h-4 w-4" /> Mon profil</Link></div></div></div> }

function PageHeader({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: React.ReactNode }) { return <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-6 text-white shadow-xl sm:p-8"><div className="relative flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">{icon}</div><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">{eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p></div></div></section> }
function ProfileField({ label, value, onChange, type = 'text', required = false, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) { return <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">{label}<input type={type} value={value} required={required} placeholder={placeholder} onChange={event => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900" /></label> }
function AccountFacts({ user }: { user: BackendUser | null }) { return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Informations du compte</p><div className="mt-4 space-y-3 text-xs"><Fact label="Type" value="PERSONAL" /><Fact label="Pays" value={user?.countryCode ?? 'Non renseigné'} /><Fact label="Identifiant" value={user?.id ?? 'Non renseigné'} /></div></section> }
function Fact({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800"><span className="text-slate-500">{label}</span><strong className="max-w-[190px] truncate text-right text-slate-800 dark:text-slate-200">{value}</strong></div> }
function Alerts({ error, notice, clearError, clearNotice }: { error?: string | null; notice?: string | null; clearError?: () => void; clearNotice?: () => void }) { return <div className="space-y-3">{error && <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><p className="flex-1">{error}</p>{clearError && <button type="button" onClick={clearError}><X className="h-4 w-4" /></button>}</div>}{notice && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><p className="flex-1">{notice}</p>{clearNotice && <button type="button" onClick={clearNotice}><X className="h-4 w-4" /></button>}</div>}</div> }
function SettingsCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800"><span className="text-teal-700">{icon}</span><h2 className="font-black text-slate-900 dark:text-white">{title}</h2></div><div className="pt-4">{children}</div></section> }
function SettingRow({ label, description, control }: { label: string; description: string; control: React.ReactNode }) { return <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p></div>{control}</div> }
function ArrowRightIcon() { return <span aria-hidden="true">→</span> }
function PageLoading({ label }: { label: string }) { return <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="h-7 w-7 animate-spin text-teal-600" />{label}</div> }
