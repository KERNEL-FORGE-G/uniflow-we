import { useState } from 'react'
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Users, Key, Globe, RefreshCw, Save, Check, Trash2 } from 'lucide-react'

interface Session {
  id: string
  user: string
  role: string
  ip: string
  device: string
  location: string
  lastActive: string
  active: boolean
}

const activeSessions: Session[] = []

const securityAlerts: Array<{ id: string; type: 'warning' | 'info' | 'success'; message: string; time: string; resolved: boolean }> = []

export default function AdminSecurityPage() {
  const [sessions, setSessions] = useState<Session[]>(activeSessions)
  const [alerts, setAlerts] = useState(securityAlerts)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const [rules, setRules] = useState({
    maxFailedLogins: '5',
    lockoutDuration: '30',
    sessionTimeout: '60',
    requireStrongPassword: true,
    twoFactorAdmin: true,
    twoFactorAll: false,
    logAllActions: true,
    alertOnNewDevice: true,
    blockSuspiciousIPs: true,
  })

  const toggle = (k: keyof typeof rules) => {
    if (typeof rules[k] === 'boolean') {
      setRules(r => ({ ...r, [k]: !r[k] }))
    }
  }

  const revokeSession = (id: string) => setSessions(s => s.filter(s => s.id !== id))
  const resolveAlert = (id: string) => setAlerts(a => a.map(al => al.id === id ? { ...al, resolved: true } : al))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const roleColor: Record<string, string> = {
    Admin:      'bg-amber-50 text-amber-700',
    Enseignant: 'bg-[#f0fdfa] text-[#0d9488]',
    Délégué:    'bg-purple-50 text-purple-700',
    Étudiant:   'bg-[#eff3ff] text-[#1e3a8a]',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-[#1e3a8a]" />
            <h1 className="text-xl font-bold text-[#111827]">Sécurité & Accès</h1>
          </div>
          <p className="text-sm text-[#6b7280]">Gestion de la sécurité, sessions actives et accès</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-md">
          {saved ? <><Check className="h-4 w-4" /> Enregistré !</> : <><Save className="h-4 w-4" /> Enregistrer</>}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Security score */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-emerald-800">Score de sécurité</h2>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-slate-400 stat-number">—</div>
            <p className="text-sm text-slate-500 font-semibold mt-1">Score disponible après connexion au journal de sécurité</p>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: '2FA admin actif', ok: true },
              { label: 'HTTPS activé', ok: true },
              { label: 'Journalisation', ok: true },
              { label: '2FA tous utilisateurs', ok: false },
              { label: 'Whitelist IP', ok: false },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                {ok ? <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                <span className={ok ? 'text-emerald-700' : 'text-amber-700'}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick rules */}
        <div className="lg:col-span-2 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#111827] mb-4">Règles de sécurité</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Tentatives max', key: 'maxFailedLogins' },
              { label: 'Blocage (minutes)', key: 'lockoutDuration' },
              { label: 'Session timeout (min)', key: 'sessionTimeout' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">{label}</label>
                <input
                  type="number"
                  value={rules[key as keyof typeof rules] as string}
                  onChange={e => setRules(r => ({ ...r, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                />
              </div>
            ))}
          </div>
          <div className="space-y-3 divide-y divide-[#f3f4f6]">
            {[
              { key: 'requireStrongPassword', label: 'Mot de passe fort obligatoire', desc: 'Min. 8 car., majuscule, chiffre, symbole' },
              { key: 'twoFactorAdmin',        label: '2FA pour les administrateurs',   desc: 'TOTP ou SMS requis pour tous les admins' },
              { key: 'twoFactorAll',          label: '2FA pour tous les utilisateurs', desc: 'Étudiants et enseignants inclus' },
              { key: 'logAllActions',         label: 'Journaliser toutes les actions', desc: 'Audit complet de la plateforme' },
              { key: 'alertOnNewDevice',      label: 'Alerte nouvel appareil',         desc: 'Notification email lors d\'une nouvelle connexion' },
              { key: 'blockSuspiciousIPs',    label: 'Bloquer IPs suspectes',          desc: 'Blocage automatique des IPs malveillantes' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{label}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => toggle(key as keyof typeof rules)}
                  className={`relative h-6 w-11 rounded-full transition-all duration-300 flex-shrink-0 ml-4 ${rules[key as keyof typeof rules] ? 'bg-[#1e3a8a]' : 'bg-[#d1d5db]'}`}
                >
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${rules[key as keyof typeof rules] ? 'left-[24px]' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#111827]">Alertes de sécurité</h2>
          <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-bold text-red-700">
            {alerts.filter(a => !a.resolved).length} active{alerts.filter(a => !a.resolved).length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`flex items-center gap-4 rounded-xl p-4 border ${
              alert.resolved ? 'bg-[#f9fafb] border-[#e5e7eb] opacity-60' :
              alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
              'bg-emerald-50 border-emerald-200'
            }`}>
              {alert.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" /> :
               alert.type === 'info' ? <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" /> :
               <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${alert.resolved ? 'text-[#6b7280]' : 'text-[#111827]'}`}>{alert.message}</p>
                <p className="text-xs text-[#6b7280]">{alert.time} {alert.resolved ? '· Résolu' : ''}</p>
              </div>
              {!alert.resolved && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors flex-shrink-0"
                >
                  Résoudre
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#111827]">Sessions actives</h2>
          <span className="text-xs text-[#6b7280]">{sessions.length} session{sessions.length > 1 ? 's' : ''} en cours</span>
        </div>
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] p-4 bg-[#f9fafb] hover:bg-white transition-colors group">
              <div className={`flex items-center justify-center h-10 w-10 rounded-xl text-xs font-bold flex-shrink-0 ${roleColor[s.role] || 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                {s.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#111827]">{s.user}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColor[s.role]}`}>{s.role}</span>
                </div>
                <p className="text-xs text-[#6b7280]">{s.device} · {s.location} · {s.ip}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-600 font-semibold">Actif</span>
                </div>
                <p className="text-[11px] text-[#9ca3af]">{s.lastActive}</p>
              </div>
              {s.id !== '1' && (
                <button
                  onClick={() => revokeSession(s.id)}
                  className="opacity-0 group-hover:opacity-100 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-all ml-2 flex-shrink-0"
                >
                  Révoquer
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
          <Trash2 className="h-4 w-4" /> Terminer toutes les autres sessions
        </button>
      </div>

      {/* API Keys */}
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#111827]">Clés API</h2>
          <button className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all">
            <Key className="h-4 w-4" /> Générer une clé
          </button>
        </div>
        <div className="space-y-3">
          {([] as Array<{ name: string; key: string; created: string; last: string; active: boolean }>).map(k => (
            <div key={k.name} className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] p-4 bg-[#f9fafb]">
              <Key className="h-5 w-5 text-[#6b7280] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#111827]">{k.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.active ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                    {k.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-[#6b7280] font-mono">{k.key} · Créée {k.created} · Dernière utilisation {k.last}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors">
                  Copier
                </button>
                <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                  Révoquer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
