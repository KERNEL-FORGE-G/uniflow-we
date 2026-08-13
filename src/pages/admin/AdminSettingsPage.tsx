import { useState } from 'react'
import {
  Settings, Bell, Shield, Database, Globe, Mail, Palette,
  Save, Check, AlertTriangle, Server, RefreshCw, Trash2,
  Download, Upload, Eye, EyeOff, Lock, Unlock, ToggleLeft, ToggleRight,
  Clock, Users, BookOpen, Activity
} from 'lucide-react'

interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}

function Toggle({ value, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#111827]">{label}</p>
        {description && <p className="text-xs text-[#6b7280] mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-all duration-300 flex-shrink-0 ml-4 ${value ? 'bg-[#1e3a8a]' : 'bg-[#d1d5db]'}`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${value ? 'left-[24px]' : 'left-1'}`} />
      </button>
    </div>
  )
}

const sections = [
  { id: 'general',    label: 'Général',         icon: Settings },
  { id: 'notifs',     label: 'Notifications',   icon: Bell },
  { id: 'security',   label: 'Sécurité',        icon: Shield },
  { id: 'academic',   label: 'Académique',      icon: BookOpen },
  { id: 'email',      label: 'Email & SMTP',    icon: Mail },
  { id: 'backup',     label: 'Sauvegarde',      icon: Database },
  { id: 'appearance', label: 'Apparence',       icon: Palette },
  { id: 'system',     label: 'Système',         icon: Server },
]

export default function AdminSettingsPage() {
  const [section, setSection] = useState('general')
  const [saved, setSaved] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const [general, setGeneral] = useState({
    platformName: 'UniFlow',
    platformUrl: 'https://uniflow.kernelforge.codes',
    supportEmail: 'support@uniflow.edu',
    timezone: 'Africa/Douala',
    language: 'Français',
    maintenanceMode: false,
  })

  const [notifs, setNotifs] = useState({
    emailNotifs: true,
    smsNotifs: true,
    pushNotifs: true,
    absenceAlerts: true,
    gradeAlerts: true,
    systemAlerts: true,
    weeklyReport: true,
    monthlyReport: false,
    alertThreshold: '3',
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '60',
    maxLoginAttempts: '5',
    passwordExpiry: '90',
    ipWhitelist: false,
    auditLog: true,
    dataEncryption: true,
  })

  const [academic, setAcademic] = useState({
    currentYear: '2025-2026',
    currentSemester: 'Semestre 2',
    passGrade: '10',
    creditSystem: 'LMD',
    autoGrading: false,
    attendanceThreshold: '75',
    lateGracePeriod: '15',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const systemStats = [
    { label: 'Uptime', value: '99.9%', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Utilisateurs actifs', value: '2 847', icon: Users, color: 'text-[#1e3a8a] bg-[#eff3ff]' },
    { label: 'Cours actifs', value: '124', icon: BookOpen, color: 'text-[#0d9488] bg-[#f0fdfa]' },
    { label: 'Stockage utilisé', value: '67%', icon: Database, color: 'text-[#d97706] bg-[#fef3c7]' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-5 w-5 text-[#1e3a8a]" />
            <h1 className="text-xl font-bold text-[#111827]">Paramètres système</h1>
          </div>
          <p className="text-sm text-[#6b7280]">Configuration globale de la plateforme UniFlow</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {saved ? (
            <><Check className="h-4 w-4" /> Enregistré !</>
          ) : (
            <><Save className="h-4 w-4" /> Enregistrer</>
          )}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 animate-slide-down">
          <Check className="h-4 w-4" />
          Paramètres enregistrés avec succès.
        </div>
      )}

      {/* System stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {systemStats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm card-hover">
            <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl mb-3 ${color}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-2xl font-extrabold text-[#111827] stat-number">{value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm h-fit">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition-all mb-0.5 ${
                section === id
                  ? 'bg-[#1e3a8a] text-white shadow-md'
                  : 'text-[#374151] hover:bg-[#f9fafb]'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${section === id ? 'text-white' : 'text-[#6b7280]'}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">

          {/* ── General ── */}
          {section === 'general' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-[#1e3a8a]" /> Configuration générale
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Nom de la plateforme', key: 'platformName', type: 'text' },
                  { label: 'URL de la plateforme', key: 'platformUrl', type: 'url' },
                  { label: 'Email de support', key: 'supportEmail', type: 'email' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">{label}</label>
                    <input
                      type={type}
                      value={general[key as keyof typeof general] as string}
                      onChange={e => setGeneral(g => ({ ...g, [key]: e.target.value }))}
                      className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Fuseau horaire</label>
                    <select
                      value={general.timezone}
                      onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))}
                      className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                    >
                      <option>Africa/Douala</option>
                      <option>Africa/Lagos</option>
                      <option>Europe/Paris</option>
                      <option>UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Langue par défaut</label>
                    <select
                      value={general.language}
                      onChange={e => setGeneral(g => ({ ...g, language: e.target.value }))}
                      className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                    >
                      <option>Français</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <div>
                    <p className="text-sm font-bold text-amber-800">Mode maintenance</p>
                    <p className="text-xs text-amber-600 mt-0.5">Rend la plateforme inaccessible aux utilisateurs</p>
                  </div>
                  <button
                    onClick={() => setGeneral(g => ({ ...g, maintenanceMode: !g.maintenanceMode }))}
                    className={`relative h-6 w-11 rounded-full transition-all ${general.maintenanceMode ? 'bg-amber-500' : 'bg-[#d1d5db]'}`}
                  >
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${general.maintenanceMode ? 'left-[24px]' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {section === 'notifs' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-[#1e3a8a]" /> Paramètres de notifications
              </h2>
              <div className="divide-y divide-[#f3f4f6]">
                <Toggle value={notifs.emailNotifs}  onChange={v => setNotifs(n => ({...n, emailNotifs: v}))}  label="Notifications par email"   description="Envoyer des emails aux utilisateurs pour les événements importants" />
                <Toggle value={notifs.smsNotifs}    onChange={v => setNotifs(n => ({...n, smsNotifs: v}))}    label="Notifications par SMS"    description="Alertes SMS pour les absences et notes critiques" />
                <Toggle value={notifs.pushNotifs}   onChange={v => setNotifs(n => ({...n, pushNotifs: v}))}   label="Notifications push"       description="Notifications en temps réel dans l'application" />
                <Toggle value={notifs.absenceAlerts}onChange={v => setNotifs(n => ({...n, absenceAlerts: v}))} label="Alertes absences"         description="Notifier l'étudiant et les parents lors d'absences répétées" />
                <Toggle value={notifs.gradeAlerts}  onChange={v => setNotifs(n => ({...n, gradeAlerts: v}))}  label="Alertes notes"            description="Notifier lors de la publication de nouvelles notes" />
                <Toggle value={notifs.weeklyReport} onChange={v => setNotifs(n => ({...n, weeklyReport: v}))} label="Rapport hebdomadaire"     description="Rapport d'activité envoyé chaque vendredi" />
                <Toggle value={notifs.monthlyReport}onChange={v => setNotifs(n => ({...n, monthlyReport: v}))} label="Rapport mensuel"          description="Bilan mensuel complet pour les administrateurs" />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Seuil alerte absence (nb de jours)</label>
                <input
                  type="number" min="1" max="30"
                  value={notifs.alertThreshold}
                  onChange={e => setNotifs(n => ({...n, alertThreshold: e.target.value}))}
                  className="w-32 rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                />
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {section === 'security' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-[#1e3a8a]" /> Sécurité & Accès
              </h2>
              <div className="divide-y divide-[#f3f4f6] mb-5">
                <Toggle value={security.twoFactor}       onChange={v => setSecurity(s => ({...s, twoFactor: v}))}       label="Authentification 2 facteurs" description="Exiger 2FA pour les comptes administrateurs" />
                <Toggle value={security.ipWhitelist}     onChange={v => setSecurity(s => ({...s, ipWhitelist: v}))}     label="Liste blanche IP"            description="Restreindre l'accès admin à des IPs spécifiques" />
                <Toggle value={security.auditLog}        onChange={v => setSecurity(s => ({...s, auditLog: v}))}        label="Journal d'audit complet"     description="Enregistrer toutes les actions administrateurs" />
                <Toggle value={security.dataEncryption}  onChange={v => setSecurity(s => ({...s, dataEncryption: v}))} label="Chiffrement des données"     description="Chiffrer les données sensibles en base" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Timeout session (min)', key: 'sessionTimeout' },
                  { label: 'Tentatives connexion max', key: 'maxLoginAttempts' },
                  { label: 'Expiration mdp (jours)', key: 'passwordExpiry' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">{label}</label>
                    <input
                      type="number"
                      value={security[key as keyof typeof security] as string}
                      onChange={e => setSecurity(s => ({...s, [key]: e.target.value}))}
                      className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Clé API système</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value="sk-uniflow-prod-a8f2b9c3d4e5f6a7b8c9d0e1f2a3b4c5"
                      readOnly
                      className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 pr-10 text-sm outline-none bg-[#f9fafb] font-mono text-xs"
                    />
                    <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111827]">
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Academic ── */}
          {section === 'academic' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-[#1e3a8a]" /> Configuration académique
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Année universitaire</label>
                  <select
                    value={academic.currentYear}
                    onChange={e => setAcademic(a => ({...a, currentYear: e.target.value}))}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                  >
                    <option>2025-2026</option>
                    <option>2024-2025</option>
                    <option>2023-2024</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Semestre actif</label>
                  <select
                    value={academic.currentSemester}
                    onChange={e => setAcademic(a => ({...a, currentSemester: e.target.value}))}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                  >
                    <option>Semestre 1</option>
                    <option>Semestre 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Note de passage (/20)</label>
                  <input
                    type="number" min="5" max="15"
                    value={academic.passGrade}
                    onChange={e => setAcademic(a => ({...a, passGrade: e.target.value}))}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Seuil présence obligatoire (%)</label>
                  <input
                    type="number" min="50" max="100"
                    value={academic.attendanceThreshold}
                    onChange={e => setAcademic(a => ({...a, attendanceThreshold: e.target.value}))}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Délai de retard autorisé (min)</label>
                  <input
                    type="number" min="0" max="60"
                    value={academic.lateGracePeriod}
                    onChange={e => setAcademic(a => ({...a, lateGracePeriod: e.target.value}))}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Système de crédits</label>
                  <select
                    value={academic.creditSystem}
                    onChange={e => setAcademic(a => ({...a, creditSystem: e.target.value}))}
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                  >
                    <option>LMD</option>
                    <option>ECTS</option>
                    <option>Classique</option>
                  </select>
                </div>
              </div>
              <Toggle
                value={academic.autoGrading}
                onChange={v => setAcademic(a => ({...a, autoGrading: v}))}
                label="Calcul automatique des moyennes"
                description="Calculer automatiquement les moyennes UE lors de la saisie de notes"
              />
            </div>
          )}

          {/* ── Email ── */}
          {section === 'email' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-[#1e3a8a]" /> Configuration Email & SMTP
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Serveur SMTP', val: 'smtp.uniflow.edu', type: 'text' },
                  { label: 'Port SMTP', val: '587', type: 'number' },
                  { label: 'Nom expéditeur', val: 'UniFlow Notifications', type: 'text' },
                  { label: 'Email expéditeur', val: 'no-reply@uniflow.edu', type: 'email' },
                  { label: 'Nom utilisateur SMTP', val: 'smtp_uniflow', type: 'text' },
                  { label: 'Mot de passe SMTP', val: '••••••••••••', type: 'password' },
                ].map(({ label, val, type }) => (
                  <div key={label}>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">{label}</label>
                    <input
                      type={type}
                      defaultValue={val}
                      className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                    />
                  </div>
                ))}
                <button className="flex items-center gap-2 rounded-xl bg-[#0d9488] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a7167] transition-all">
                  <Mail className="h-4 w-4" /> Tester la connexion SMTP
                </button>
              </div>
            </div>
          )}

          {/* ── Backup ── */}
          {section === 'backup' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
                  <Database className="h-4.5 w-4.5 text-[#1e3a8a]" /> Sauvegarde & Restauration
                </h2>
                <div className="space-y-3 mb-5">
                  {[
                    { date: '06/08/2026 02:00', size: '847 MB', type: 'Automatique', status: 'success' },
                    { date: '05/08/2026 02:00', size: '831 MB', type: 'Automatique', status: 'success' },
                    { date: '04/08/2026 02:00', size: '829 MB', type: 'Automatique', status: 'success' },
                    { date: '03/08/2026 14:32', size: '825 MB', type: 'Manuelle',   status: 'success' },
                  ].map((bk, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] p-3.5 bg-[#f9fafb]">
                      <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${bk.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#111827]">{bk.date}</p>
                        <p className="text-xs text-[#6b7280]">{bk.size} · {bk.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-[#f3f4f6] transition-colors flex items-center gap-1.5">
                          <Download className="h-3.5 w-3.5" /> Télécharger
                        </button>
                        <button className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5" /> Restaurer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-md">
                    <Database className="h-4 w-4" /> Créer une sauvegarde
                  </button>
                  <button className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all">
                    <Upload className="h-4 w-4" /> Importer
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h3 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Zone de danger
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Purger les logs anciens', desc: 'Supprimer les logs de plus de 6 mois', action: 'Purger' },
                    { label: 'Réinitialiser la base de cache', desc: 'Vider le cache Redis et relancer', action: 'Réinitialiser' },
                    { label: 'Réinitialiser la plateforme', desc: 'ATTENTION : Supprime toutes les données', action: 'Réinitialiser' },
                  ].map(({ label, desc, action }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-red-800">{label}</p>
                        <p className="text-xs text-red-600">{desc}</p>
                      </div>
                      <button className="rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors flex items-center gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" /> {action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {section === 'appearance' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
                <Palette className="h-4.5 w-4.5 text-[#1e3a8a]" /> Apparence & Thème
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-3 uppercase tracking-wider">Couleur principale</label>
                  <div className="flex gap-3">
                    {['#1e3a8a', '#0d9488', '#7c3aed', '#dc2626', '#059669', '#d97706'].map(color => (
                      <button
                        key={color}
                        className="h-10 w-10 rounded-xl shadow-sm border-2 hover:scale-110 transition-transform"
                        style={{ background: color, borderColor: color === '#1e3a8a' ? '#111827' : 'transparent' }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-3 uppercase tracking-wider">Logo de la plateforme</label>
                  <div className="flex items-center gap-4">
                    <img
                      src="https://i.imgur.com/GAiZ7WY.png"
                      alt="Logo"
                      className="h-12 w-auto object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        if (!target.dataset.triedFallback) {
                          target.dataset.triedFallback = 'true'
                          target.src = '/logo_1.png'
                        }
                      }}
                    />
                    <button className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all">
                      <Upload className="h-4 w-4" /> Changer le logo
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-3 uppercase tracking-wider">Thème</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Clair', bg: 'bg-white border-[#1e3a8a]', selected: true },
                      { name: 'Sombre', bg: 'bg-slate-900', selected: false },
                      { name: 'Système', bg: 'bg-gradient-to-r from-white to-slate-900', selected: false },
                    ].map(({ name, bg, selected }) => (
                      <button key={name} className={`rounded-xl border-2 p-4 text-sm font-semibold transition-all ${selected ? 'border-[#1e3a8a]' : 'border-[#e5e7eb] hover:border-[#9ca3af]'} ${bg}`}>
                        <span className={selected ? 'text-[#1e3a8a]' : name === 'Sombre' ? 'text-white' : 'text-[#111827]'}>{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── System ── */}
          {section === 'system' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
                  <Server className="h-4.5 w-4.5 text-[#1e3a8a]" /> État du système
                </h2>
                <div className="space-y-3">
                  {[
                    { service: 'API Server',          status: 'En ligne',   uptime: '99.9%', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { service: 'Base de données',     status: 'En ligne',   uptime: '99.8%', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { service: 'Serveur email',       status: 'En ligne',   uptime: '99.5%', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { service: 'Service SMS',         status: 'En ligne',   uptime: '98.9%', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { service: 'Stockage fichiers',   status: 'En ligne',   uptime: '99.9%', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { service: 'Visioconférence',     status: 'En ligne',   uptime: '99.2%', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  ].map(({ service, status, uptime, color }) => (
                    <div key={service} className="flex items-center justify-between rounded-xl p-3 bg-[#f9fafb] border border-[#e5e7eb]">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <p className="text-sm font-semibold text-[#111827]">{service}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#6b7280]">Uptime: {uptime}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${color}`}>{status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#111827] mb-4">Actions système</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all">
                    <RefreshCw className="h-4 w-4" /> Redémarrer les services
                  </button>
                  <button className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all">
                    <Activity className="h-4 w-4 text-[#0d9488]" /> Voir les logs
                  </button>
                  <button className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all">
                    <Download className="h-4 w-4 text-[#1e3a8a]" /> Exporter la config
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all">
              Annuler
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-md">
              {saved ? <><Check className="h-4 w-4" /> Enregistré !</> : <><Save className="h-4 w-4" /> Enregistrer les modifications</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
