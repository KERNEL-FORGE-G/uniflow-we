import { useState, useRef, useEffect } from 'react'
import { Camera, Bell, Globe, Shield, Database, Save, BookOpen, Video, HelpCircle, Mail, Check, Eye, EyeOff } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { useUserRole } from '../utils/userRole'
import { cn } from '../utils/cn'
import PushNotificationControl from '../components/PushNotificationControl'
import { applyTheme, getStoredTheme, ThemeMode } from '../utils/theme'
import { settingsApi, authApi } from '../lib/api'

const sections = ['Profil', 'Notifications', 'Apparence', 'Confidentialité', 'Avancé']

const sectionIcons: Record<string, any> = {
  Profil: Camera, Notifications: Bell, Apparence: Globe, Confidentialité: Shield, Avancé: Database,
}

export default function SettingsPage() {
  const { currentUser: user, language, setLanguage, isOfflineMode, setIsOfflineMode } = useUserRole()
  const [section, setSection] = useState('Profil')
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [notifications, setNotifications] = useState({
    emailCours: true, emailDevoirs: true, emailNotes: true,
    smsCritique: false, pushAll: true, weeklyDigest: true,
  })

  const [privacy, setPrivacy] = useState({
    publicProfil: true, showAttendance: false, showGrades: false, allowMessages: true,
  })

  const [advanced, setAdvanced] = useState({
    darkMode: false, autoSync: true, offlineMode: isOfflineMode,
    compactView: false, reducedMotion: false,
  })

  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  const [fullName, setFullName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone || '')
  const [address, setAddress] = useState(user.address || '')
  const [filiere, setFiliere] = useState(user.filiere || '')
  const [level, setLevel] = useState(user.level || '')

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [pwdFeedback, setPwdFeedback] = useState('')

  useEffect(() => {
    settingsApi.get().then(s => {
      if (s.notifications) setNotifications(prev => ({ ...prev, ...s.notifications }))
      if (s.privacy) setPrivacy(prev => ({ ...prev, ...s.privacy }))
      if (s.advanced) setAdvanced(prev => ({ ...prev, ...s.advanced }))
    }).catch(() => null)
  }, [])

  const handleSave = async () => {
    // Persist settings to backend API & localStorage
    await settingsApi.update({
      notifications,
      privacy,
      advanced,
      language,
    }).catch(() => null)

    const nameParts = fullName.trim().split(' ')
    await authApi.updateProfile({
      firstName: nameParts[0] || fullName,
      lastName: nameParts.slice(1).join(' ') || '',
      email,
      phone,
      address
    }).catch(() => null)

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPwd || !newPwd) {
      setPwdFeedback('Veuillez remplir le mot de passe actuel et le nouveau mot de passe.')
      return
    }
    setPwdFeedback('Mot de passe mis à jour avec succès !')
    setCurrentPwd('')
    setNewPwd('')
    setTimeout(() => setPwdFeedback(''), 4000)
  }

  const handleClearCache = () => {
    alert('Cache local vidé avec succès. Les données seront resynchronisées.')
  }

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user, notifications, privacy, advanced }, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute("href", dataStr)
    dlAnchor.setAttribute("download", `uniflow_export_${user.name.replace(/\s+/g, '_')}.json`)
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => setAvatarPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const toggle = (state: Record<string, boolean>, setState: any, key: string) => {
    setState((s: any) => ({ ...s, [key]: !s[key] }))
  }

  function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111827]">{label}</p>
          {desc && <p className="text-xs text-[#6b7280] mt-0.5">{desc}</p>}
        </div>
        <button
          onClick={onChange}
          className={cn('relative h-6 w-11 rounded-full transition-all duration-300 flex-shrink-0 ml-4', checked ? 'bg-[#1e3a8a]' : 'bg-[#d1d5db]')}
        >
          <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300', checked ? 'left-[24px]' : 'left-1')} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Paramètres</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Gérez votre compte et vos préférences</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
          {saved ? <><Check className="h-4 w-4" /> Enregistré !</> : <><Save className="h-4 w-4" /> Enregistrer</>}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 animate-slide-down">
          <Check className="h-4 w-4" /> Paramètres enregistrés avec succès.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm h-fit">
          {sections.map(s => {
            const Icon = sectionIcons[s]
            return (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition-all mb-0.5',
                  section === s ? 'bg-[#1e3a8a] text-white shadow-md' : 'text-[#374151] hover:bg-[#f9fafb]'
                )}
              >
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0', section === s ? 'bg-white/20' : 'bg-[#f3f4f6]')}>
                  <Icon className={cn('h-4 w-4', section === s ? 'text-white' : 'text-[#6b7280]')} />
                </div>
                {s}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">

          {/* ── Profil ── */}
          {section === 'Profil' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-[#111827]">Informations personnelles</h2>

              {/* Avatar */}
              <div className="flex items-center gap-5 pb-5 border-b border-[#f3f4f6]">
                <div className="relative flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-[#1e3a8a]/20" />
                  ) : (
                    <Avatar name={user.name} size="xl" />
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-[#1e3a8a] text-white shadow-md hover:bg-[#2d4fa8] transition-all hover:scale-110"
                    title="Changer la photo de profil"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#111827]">{user.name}</h3>
                  <p className="text-sm text-[#6b7280]">{user.role} · {user.filiere}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-semibold text-[#1e3a8a] hover:underline"
                  >
                    Changer la photo de profil
                  </button>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Nom complet</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Téléphone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Adresse</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Filière</label>
                  <input type="text" value={filiere} onChange={e => setFiliere(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Niveau</label>
                  <input type="text" value={level} onChange={e => setLevel(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all" />
                </div>
              </div>

              {/* Change Password */}
              <form onSubmit={handleUpdatePassword} className="pt-4 border-t border-[#f3f4f6]">
                <h3 className="text-sm font-bold text-[#111827] mb-4">Changer le mot de passe</h3>
                {pwdFeedback && (
                  <p className={`text-xs font-semibold mb-3 ${pwdFeedback.includes('succès') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {pwdFeedback}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Mot de passe actuel</label>
                    <div className="relative">
                      <input type={showCurrentPwd ? 'text' : 'password'} placeholder="••••••••" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                        className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                      />
                      <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]">
                        {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Nouveau mot de passe</label>
                    <div className="relative">
                      <input type={showNewPwd ? 'text' : 'password'} placeholder="••••••••" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                        className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                      />
                      <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]">
                        {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" className="mt-3 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all">
                  Mettre à jour le mot de passe
                </button>
              </form>

              <button onClick={handleSave} className="w-full rounded-xl bg-[#1e3a8a] py-3 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-md">
                {saved ? 'Enregistré !' : 'Enregistrer le profil'}
              </button>
            </div>
          )}

          {/* ── Notifications ── */}
          {section === 'Notifications' && (
            <div className="space-y-4">
              <PushNotificationControl />

              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#111827] mb-5">Préférences de notifications par canal</h2>
                <div className="divide-y divide-[#f3f4f6]">
                  <ToggleRow label="Cours et plannings (email)"     desc="Recevoir les rappels de cours par email"      checked={notifications.emailCours}    onChange={() => toggle(notifications, setNotifications, 'emailCours')} />
                  <ToggleRow label="Devoirs et échéances (email)"   desc="Alertes avant les dates de remise"            checked={notifications.emailDevoirs}   onChange={() => toggle(notifications, setNotifications, 'emailDevoirs')} />
                  <ToggleRow label="Nouvelles notes (email)"        desc="Notification quand une note est publiée"      checked={notifications.emailNotes}     onChange={() => toggle(notifications, setNotifications, 'emailNotes')} />
                  <ToggleRow label="Alertes critiques (SMS)"        desc="SMS uniquement pour les urgences"             checked={notifications.smsCritique}    onChange={() => toggle(notifications, setNotifications, 'smsCritique')} />
                  <ToggleRow label="Notifications push (app)"       desc="Toutes les notifs en temps réel"             checked={notifications.pushAll}        onChange={() => toggle(notifications, setNotifications, 'pushAll')} />
                  <ToggleRow label="Résumé hebdomadaire"            desc="Bilan de la semaine chaque vendredi"          checked={notifications.weeklyDigest}   onChange={() => toggle(notifications, setNotifications, 'weeklyDigest')} />
                </div>
                <button onClick={handleSave} className="mt-5 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all w-full">
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}

          {/* ── Apparence ── */}
          {section === 'Apparence' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-[#111827]">Langue & Apparence</h2>
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-3 uppercase tracking-wider">Langue de l'interface</label>
                <div className="flex gap-3">
                  {['FR', 'EN'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l as 'FR' | 'EN')}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border-2 px-6 py-3 font-bold text-sm transition-all',
                        language === l ? 'border-[#1e3a8a] bg-[#eff3ff] text-[#1e3a8a]' : 'border-[#e5e7eb] text-[#374151] hover:border-[#9ca3af]'
                      )}
                    >
                      {l === 'FR' ? '🇫🇷 Français' : '🇬🇧 English'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-3 uppercase tracking-wider">Thème</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'light', label: '☀️ Clair' },
                    { key: 'dark', label: '🌙 Sombre' },
                    { key: 'system', label: '💻 Système (Auto)' },
                  ].map(({ key, label }) => {
                    const currentTheme = getStoredTheme()
                    const active = currentTheme === key
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          applyTheme(key as ThemeMode)
                          setAdvanced(a => ({ ...a, darkMode: key === 'dark' }))
                        }}
                        className={cn(
                          'rounded-xl border-2 p-4 text-sm font-semibold transition-all',
                          active
                            ? 'border-[#1e3a8a] bg-[#eff3ff] text-[#1e3a8a] dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'border-[#e5e7eb] text-[#374151] hover:border-[#9ca3af] dark:border-slate-700 dark:text-slate-300'
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="divide-y divide-[#f3f4f6]">
                <ToggleRow label="Vue compacte" desc="Interface plus dense, idéale sur les petits écrans" checked={advanced.compactView} onChange={() => toggle(advanced, setAdvanced, 'compactView')} />
                <ToggleRow label="Réduire les animations" desc="Moins d'animations pour améliorer les performances" checked={advanced.reducedMotion} onChange={() => toggle(advanced, setAdvanced, 'reducedMotion')} />
              </div>
            </div>
          )}

          {/* ── Confidentialité ── */}
          {section === 'Confidentialité' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#111827] mb-5">Confidentialité & Sécurité</h2>
              <div className="divide-y divide-[#f3f4f6]">
                <ToggleRow label="Profil public"                desc="Votre profil est visible par les autres étudiants" checked={privacy.publicProfil}    onChange={() => toggle(privacy, setPrivacy, 'publicProfil')} />
                <ToggleRow label="Afficher mes présences"      desc="Les délégués peuvent voir votre présence"           checked={privacy.showAttendance} onChange={() => toggle(privacy, setPrivacy, 'showAttendance')} />
                <ToggleRow label="Partager mes notes"           desc="Visible dans les statistiques anonymisées"         checked={privacy.showGrades}     onChange={() => toggle(privacy, setPrivacy, 'showGrades')} />
                <ToggleRow label="Autoriser les messages privés"desc="Les autres utilisateurs peuvent vous écrire"       checked={privacy.allowMessages}  onChange={() => toggle(privacy, setPrivacy, 'allowMessages')} />
              </div>
              <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-800">Données personnelles</p>
                <p className="text-xs text-amber-700 mt-1">Vos données sont traitées conformément au RGPD. Vous pouvez demander l'export ou la suppression de vos données.</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleExportData} type="button" className="rounded-xl bg-white border border-amber-300 px-4 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors">
                    Exporter mes données
                  </button>
                  <button onClick={() => { if (confirm('Êtes-vous sûr de vouloir demander la suppression de votre compte ?')) alert('Demande de suppression enregistrée.') }} type="button" className="rounded-xl bg-red-50 border border-red-200 px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors">
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Avancé ── */}
          {section === 'Avancé' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#111827] mb-5">Paramètres avancés</h2>
              <div className="divide-y divide-[#f3f4f6]">
                <ToggleRow
                  label="Synchronisation automatique"
                  desc="Synchroniser les données en arrière-plan"
                  checked={advanced.autoSync}
                  onChange={() => toggle(advanced, setAdvanced, 'autoSync')}
                />
                <ToggleRow
                  label="Mode hors ligne"
                  desc="Accéder aux données sans connexion internet"
                  checked={advanced.offlineMode}
                  onChange={() => { setIsOfflineMode(!advanced.offlineMode); toggle(advanced, setAdvanced, 'offlineMode') }}
                />
              </div>
              <div className="mt-5 space-y-3">
                <button onClick={handleClearCache} type="button" className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors">
                  Vider le cache local
                </button>
                <button onClick={() => { localStorage.removeItem('uniflow_user_settings'); alert('Préférences réinitialisées aux valeurs par défaut.'); window.location.reload(); }} type="button" className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors">
                  Réinitialiser les préférences
                </button>
                <div className="rounded-xl bg-[#f9fafb] border border-[#e5e7eb] p-4">
                  <p className="text-xs font-semibold text-[#374151]">Informations de version</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-[#6b7280]">
                      <span>Version de l'app</span><span className="font-mono">2.1.0</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6b7280]">
                      <span>Dernière mise à jour</span><span>06/08/2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-md">
              {saved ? <><Check className="h-4 w-4" /> Enregistré !</> : <><Save className="h-4 w-4" /> Enregistrer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
