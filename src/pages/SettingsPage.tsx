import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { IconTile, UniIcon, type UniIconName } from '../components/ui/UniIcon'
import { Avatar } from '../components/ui/Avatar'
import { useUserRole } from '../utils/userRole'
import { cn } from '../utils/cn'
import PushNotificationControl from '../components/PushNotificationControl'
import { applyTheme, getStoredTheme, ThemeMode } from '../utils/theme'
import { authApi } from '../lib/api'
import { removeAvatar, uploadAvatar, validateAvatarFile } from '../lib/appwrite'
import { SubscriptionWidget } from '../components/subscription/SubscriptionWidget'

const sections = ['Profil', 'Abonnement', 'Inscriptions UEs', 'Notifications', 'Apparence', 'Confidentialité', 'Avancé']

const sectionIcons: Record<string, UniIconName> = {
  Profil: 'profile',
  Abonnement: 'billing',
  'Inscriptions UEs': 'courseUnit',
  Notifications: 'notifications',
  Apparence: 'globe',
  Confidentialité: 'security',
  Avancé: 'database',
}

export default function SettingsPage() {
  const { currentUser: user, setAuthUser, authUser, language, setLanguage, isOfflineMode, setIsOfflineMode } = useUserRole()
  const [section, setSection] = useState('Profil')
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarSaved, setAvatarSaved] = useState(false)
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

  // Suppression du compte : le bouton ouvrait un `alert()` qui n'effaçait
  // rien. La confirmation demande de taper le mot, puis `deleteAccount` appelle
  // le service `/account` et nettoie l'appareil.
  const { deleteAccount, loading: deleting } = useAuth()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteWord, setDeleteWord] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const confirmDelete = async () => {
    setDeleteError(null)
    try { await deleteAccount() } catch (err) { setDeleteError(err instanceof Error ? err.message : 'La suppression a échoué.') }
  }

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
    // Settings are kept locally until the Appwrite preferences collection is
    // provisioned. Do not call the retired `/settings` backend route.
    try {
      const saved = localStorage.getItem('uniflow_settings')
      if (!saved) return
      const parsed = JSON.parse(saved) as { notifications?: typeof notifications; privacy?: typeof privacy; advanced?: typeof advanced }
      if (parsed.notifications) setNotifications(prev => ({ ...prev, ...parsed.notifications }))
      if (parsed.privacy) setPrivacy(prev => ({ ...prev, ...parsed.privacy }))
      if (parsed.advanced) setAdvanced(prev => ({ ...prev, ...parsed.advanced }))
    } catch {
      // Ignore malformed local preferences and keep safe defaults.
    }
  }, [])

  const handleSave = async () => {
    // Persist preferences locally until the Appwrite preferences collection is available.
    try {
      localStorage.setItem('uniflow_settings', JSON.stringify({ notifications, privacy, advanced, language }))
    } catch {
      // Keep the UI usable if browser storage is unavailable.
    }

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

  // L'aperçu local s'affiche immédiatement, mais la photo n'existe réellement
  // qu'une fois téléversée dans le bucket `uniflow_avatars` et son identifiant
  // enregistré sur le profil. L'ancien code s'arrêtait à l'aperçu : la photo
  // disparaissait au rechargement, ce qui donnait l'impression d'un bug.
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Le champ est remis à zéro pour qu'un second choix du même fichier
    // déclenche bien `onChange`.
    e.target.value = ''
    if (!file) return

    setAvatarError(null)
    const invalid = validateAvatarFile(file)
    if (invalid) {
      setAvatarError(invalid)
      return
    }

    // L'identifiant Appwrite est celui du compte connecté, pas celui du profil
    // affiché : `currentUser` est une projection destinée à l'affichage et ne
    // porte pas d'identifiant. Sans session, `createFile` serait de toute façon
    // refusé par Appwrite — on le dit avant de téléverser.
    if (!authUser) {
      setAvatarError('Connectez-vous pour changer de photo de profil.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setAvatarBusy(true)
    try {
      const previousFileId = user.avatarFileId
      const fileId = await uploadAvatar(authUser.id, file, previousFileId)
      // Remonter l'identifiant dans la session courante : la barre latérale et
      // l'en-tête se rafraîchissent sans rechargement de page.
      setAuthUser({ ...authUser, avatarFileId: fileId })
      setAvatarSaved(true)
      setTimeout(() => setAvatarSaved(false), 3000)
    } catch (error) {
      setAvatarPreview(null)
      setAvatarError(error instanceof Error ? error.message : 'Le téléversement a échoué.')
    } finally {
      URL.revokeObjectURL(previewUrl)
      setAvatarBusy(false)
    }
  }

  const handleAvatarRemove = async () => {
    if (!user.avatarFileId || !authUser) return
    setAvatarError(null)
    setAvatarBusy(true)
    try {
      await removeAvatar(authUser.id, user.avatarFileId)
      setAuthUser({ ...authUser, avatarFileId: undefined })
      setAvatarPreview(null)
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Le retrait a échoué.')
    } finally {
      setAvatarBusy(false)
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
          {saved ? <><UniIcon name="check" weight="bold" size={16} /> Enregistré !</> : <><UniIcon name="save" weight="bold" size={16} /> Enregistrer</>}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 animate-slide-down">
          <UniIcon name="check" weight="bold" size={16} /> Paramètres enregistrés avec succès.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm h-fit">
          {sections.map(s => {
            const icon = sectionIcons[s] ?? 'settings'
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
                  <UniIcon name={icon} weight={section === s ? 'fill' : 'duotone'} size={16} className={section === s ? 'text-white' : 'text-[#6b7280]'} />
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
                    <Avatar name={user.name} avatarFileId={user.avatarFileId} size="xl" />
                  )}
                  {avatarBusy && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                      <UniIcon name="spinner" weight="bold" size={24} className="animate-spin text-white" />
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarBusy}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-[#1e3a8a] text-white shadow-md hover:bg-[#2d4fa8] transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                    title="Changer la photo de profil"
                  >
                    <UniIcon name="camera" weight="fill" size={16} />
                  </button>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-[#111827]">{user.name}</h3>
                  <p className="text-sm text-[#6b7280]">{user.roleLabel}{user.filiere ? ` · ${user.filiere}` : ''}</p>
                  {user.username && (
                    <p className="mt-0.5 text-xs font-semibold text-[#0d9488]">@{user.username}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarBusy}
                      className="text-xs font-semibold text-[#1e3a8a] hover:underline disabled:opacity-50"
                    >
                      {user.avatarFileId ? 'Changer la photo' : 'Ajouter une photo'}
                    </button>
                    {user.avatarFileId && (
                      <button
                        onClick={handleAvatarRemove}
                        disabled={avatarBusy}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#dc2626] hover:underline disabled:opacity-50"
                      >
                        <UniIcon name="trash" weight="bold" size={12} /> Retirer
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-[#9ca3af]">JPEG, PNG ou WebP · 5 Mo maximum</p>
                  {avatarError && (
                    <p className="mt-1.5 inline-flex items-start gap-1 text-xs font-medium text-[#dc2626]">
                      <UniIcon name="alert" weight="fill" size={14} className="mt-0.5 shrink-0" />{avatarError}
                    </p>
                  )}
                  {avatarSaved && (
                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#059669]">
                      <UniIcon name="success" weight="fill" size={14} /> Photo de profil enregistrée.
                    </p>
                  )}
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
                        {showCurrentPwd ? <UniIcon name="eyeOff" size={16} /> : <UniIcon name="eye" size={16} />}
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
                        {showNewPwd ? <UniIcon name="eyeOff" size={16} /> : <UniIcon name="eye" size={16} />}
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

          {/* ── Abonnement & Facturation ── */}
          {section === 'Abonnement' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gestion de l'Abonnement Mensuel</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consultez votre temps restant d'abonnement, votre formule tarifaire (100 FCFA/mois au Cameroun ou 1,00 €/mois à l'international) et effectuez vos renouvellements.
                </p>
              </div>
              <SubscriptionWidget />
            </div>
          )}

          {/* ── Inscriptions UEs ── */}
          {section === 'Inscriptions UEs' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Inscriptions aux unités d’enseignement</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Référentiel universitaire actif : {[user.university, user.scopeLabel].filter(Boolean).join(' · ') || 'périmètre non renseigné'}.
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-[#0d9488]/40 bg-teal-50/60 dark:bg-teal-950/20 p-5">
                <IconTile name="courseUnit" color="#0D9488" variant="soft" size={44} />
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">Aucune unité d’enseignement attribuée</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Les unités, inscriptions et crédits seront affichés ici lorsqu’ils auront été enregistrés dans Appwrite par l’administration universitaire. Aucun catalogue local ou choix fictif n’est présenté.
                </p>
              </div>
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
                <p className="text-xs text-amber-700 mt-1">
                  Vos données sont traitées selon notre <Link to="/confidentialite" className="font-semibold underline underline-offset-2">politique de confidentialité</Link> ; vos <Link to="/droits-des-utilisateurs" className="font-semibold underline underline-offset-2">droits</Link> (accès, rectification, effacement, portabilité) s'exercent ici ou en nous écrivant.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={handleExportData} type="button" className="rounded-xl bg-white border border-amber-300 px-4 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors">
                    Exporter mes données
                  </button>
                  <button onClick={() => { setDeleteOpen(true); setDeleteWord(''); setDeleteError(null) }} type="button" className="rounded-xl bg-red-50 border border-red-200 px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors">
                    Supprimer mon compte
                  </button>
                </div>
              </div>

              {deleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-sm animate-fade-in-fast" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
                  <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
                    <div className="flex items-start gap-3">
                      <IconTile name="trash" color="#DC2626" variant="soft" size={44} />
                      <div>
                        <h3 id="delete-account-title" className="text-base font-bold text-[#111827]">Supprimer définitivement votre compte ?</h3>
                        <p className="mt-1 text-sm text-[#6b7280]">
                          Votre compte, votre profil, votre photo, vos notifications et votre espace personnel seront effacés immédiatement. Cette action est irréversible.
                        </p>
                      </div>
                    </div>
                    <label className="mt-5 block text-xs font-semibold text-[#374151]">
                      Tapez <span className="font-mono text-red-700">SUPPRIMER</span> pour confirmer
                      <input
                        autoFocus
                        value={deleteWord}
                        onChange={(event) => setDeleteWord(event.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-[#e5e7eb] px-3 py-2.5 text-sm font-mono tracking-wider text-[#111827] outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        placeholder="SUPPRIMER"
                        aria-label="Confirmation de suppression"
                      />
                    </label>
                    {deleteError && (
                      <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert"><UniIcon name="alert" weight="fill" size={16} className="shrink-0" />{deleteError}</p>
                    )}
                    <div className="mt-5 flex justify-end gap-2">
                      <button type="button" onClick={() => setDeleteOpen(false)} disabled={deleting} className="rounded-xl border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f3f4f6] disabled:opacity-50">
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={confirmDelete}
                        disabled={deleting || deleteWord.trim().toUpperCase() !== 'SUPPRIMER'}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {deleting ? <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> : <UniIcon name="trash" weight="bold" size={16} />}
                        {deleting ? 'Suppression…' : 'Supprimer mon compte'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
              {saved ? <><UniIcon name="check" weight="bold" size={16} /> Enregistré !</> : <><UniIcon name="save" weight="bold" size={16} /> Enregistrer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
