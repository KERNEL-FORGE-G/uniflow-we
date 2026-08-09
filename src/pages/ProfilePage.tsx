import { useState } from 'react'
import { Edit, Users, Star, UserCheck, Camera, Microscope, Laptop, Wifi } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { useUserRole } from '../utils/userRole'
import { authApi } from '../lib/api'

const tabs = ['Informations', 'Parcours', 'Présences', 'Grades', 'Paramètres', 'Références'] as const
type Tab = typeof tabs[number]

export default function ProfilePage() {
  const { currentRole, currentUser: user } = useUserRole()
  const [activeTab, setActiveTab] = useState<Tab>('Informations')
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState(user.phone || '+237 6 99 88 77 66')
  const [address, setAddress] = useState(user.address || 'Yaoundé, Cameroun')

  const handleSaveProfile = async () => {
    try {
      await authApi.updateProfile({ phone, address })
      setEditing(false)
    } catch {
      setEditing(false)
    }
  }

  const personalFields = [
    { label: 'Nom complet',     value: user.name, editable: false },
    { label: 'Téléphone',       value: phone, key: 'phone', onChange: (v: string) => setPhone(v), editable: true },
    { label: 'Email',           value: user.email, editable: false },
    { label: 'Adresse',         value: address, key: 'address', onChange: (v: string) => setAddress(v), editable: true },
  ]
  const academicFields = [
    { label: 'Numéro étudiant', value: user.matricule ?? '—' },
    { label: 'Filière',         value: user.filiere ?? 'N/A' },
    { label: 'Niveau',          value: user.level ?? 'N/A' },
    { label: 'Langue',          value: 'Français, Anglais' },
    { label: 'Établissement',   value: 'Université de Yaoundé I' },
  ]

  const stats = [
    { label: 'Sessions totales', value: 80,   icon: Users,    bg: 'bg-[#d1fae5]', color: 'text-[#059669]' },
    { label: 'Présences',        value: 68,   icon: UserCheck, bg: 'bg-[#dbeafe]', color: 'text-[#1d4ed8]' },
    { label: 'Points',           value: 1200, icon: Star,     bg: 'bg-[#fef3c7]', color: 'text-[#d97706]' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile header card */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-5">
          <div className="relative">
            <Avatar name={user.name} size="2xl" />
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#1e3a8a] text-white shadow-md hover:bg-[#2d4fa8] transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-[#111827]">{user.name}</h1>
              <Badge variant="success">Actif</Badge>
            </div>
            <p className="text-sm text-[#6b7280] mt-0.5">{user.roleLabel} · {user.filiere ?? 'Informatique'} · {user.level ?? ''}</p>
            <p className="text-xs text-[#9ca3af] mt-1">{user.email}</p>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
            <Edit className="h-4 w-4" />
            {editing ? 'Annuler' : 'Modifier le profil'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#e5e7eb]">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-[#6b7280] hover:text-[#374151]'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Informations' && (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Personal info */}
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#111827] mb-4">Informations personnelles</h2>
              <dl className="space-y-3">
                {personalFields.map((field) => (
                  <div key={field.label} className="flex items-center justify-between py-2 border-b border-[#f3f4f6] last:border-0">
                    <dt className="text-sm text-[#6b7280]">{field.label}</dt>
                    {editing && field.editable ? (
                      <input value={field.value} onChange={e => field.onChange && field.onChange(e.target.value)}
                        className="rounded-md border border-[#e5e7eb] px-2.5 py-1 text-sm text-right outline-none focus:border-[#1e3a8a] w-48" />
                    ) : (
                      <dd className="text-sm font-medium text-[#111827]">{field.value}</dd>
                    )}
                  </div>
                ))}
              </dl>
              {editing && (
                <button onClick={handleSaveProfile}
                  className="mt-4 w-full rounded-lg bg-[#1e3a8a] py-2 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
                  Enregistrer les modifications
                </button>
              )}
            </div>

            {/* Academic info */}
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#111827] mb-4">Informations académiques</h2>
              <dl className="space-y-3">
                {academicFields.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-[#f3f4f6] last:border-0">
                    <dt className="text-sm text-[#6b7280]">{label}</dt>
                    <dd className="text-sm font-medium text-[#111827]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h2 className="text-sm font-bold text-[#111827] mb-3">Mes statistiques</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map(({ label, value, icon: Icon, bg, color }) => (
                <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                  <div className={`mb-3 inline-flex rounded-lg p-2 ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-3xl font-extrabold text-[#111827]">{value}</p>
                  <p className="text-sm text-[#6b7280] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'Parcours' && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#111827] mb-4">Parcours académique</h2>
          <div className="space-y-4">
            {[
              { year: '2023-2024', level: 'Licence 2', ue: 7, avg: '14.6/20', status: 'En cours' },
              { year: '2022-2023', level: 'Licence 1', ue: 8, avg: '13.2/20', status: 'Validé' },
            ].map(p => (
              <div key={p.year} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] p-4 hover:bg-[#f9fafb]">
                <div>
                  <p className="font-semibold text-[#111827]">{p.year} — {p.level}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">{p.ue} UE · Moyenne : {p.avg}</p>
                </div>
                <Badge variant={p.status === 'Validé' ? 'success' : 'info'}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Présences' && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#111827] mb-4">Historique des présences</h2>
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-[#0d9488]">87%</p>
              <p className="text-xs text-[#6b7280]">Taux global</p>
            </div>
            <div className="flex-1 h-3 rounded-full bg-[#f3f4f6] overflow-hidden">
              <div className="h-full rounded-full bg-[#0d9488]" style={{ width: '87%' }} />
            </div>
          </div>
          <div className="space-y-2">
            {['Algorithmique','Bases de données','Réseaux','Économie','Anglais'].map((c, i) => {
              const rates = [90, 85, 80, 95, 88]
              return (
                <div key={c} className="flex items-center gap-3 text-sm">
                  <span className="w-36 text-[#374151] font-medium truncate">{c}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                    <div className="h-full rounded-full bg-[#1e3a8a]" style={{ width: `${rates[i]}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-[#374151]">{rates[i]}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'Grades' && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#111827] mb-4">Bulletins de notes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { sem: 'Semestre 2 · 2023-2024', avg: '14.6/20', credits: '30/30', status: 'En cours' },
              { sem: 'Semestre 1 · 2023-2024', avg: '13.8/20', credits: '30/30', status: 'Validé' },
            ].map(b => (
              <div key={b.sem} className="rounded-lg border border-[#e5e7eb] p-4">
                <p className="font-semibold text-[#111827]">{b.sem}</p>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-[#6b7280]">Moy. : <strong className="text-[#1e3a8a]">{b.avg}</strong></span>
                  <span className="text-[#6b7280]">ECTS : <strong className="text-[#0d9488]">{b.credits}</strong></span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={b.status === 'Validé' ? 'success' : 'info'}>{b.status}</Badge>
                  <button className="text-xs font-medium text-[#1e3a8a] hover:underline">Télécharger PDF →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Paramètres' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#111827] mb-5">Préférences du profil</h2>
            <div className="space-y-4">
              {[
                { label: 'Notifications email', desc: 'Recevoir les alertes par email', on: true },
                { label: 'Notifications push', desc: 'Alertes dans l\'application', on: true },
                { label: 'Visibilité du profil', desc: 'Rendre mon profil visible aux autres étudiants', on: false },
                { label: 'Mode hors ligne', desc: 'Synchroniser automatiquement les données offline', on: true },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-3 border-b border-[#f3f4f6] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{s.label}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{s.desc}</p>
                  </div>
                  <button className={`relative h-6 w-11 rounded-full transition-colors ${s.on ? 'bg-[#0d9488]' : 'bg-[#e5e7eb]'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${s.on ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#111827] mb-4">Changer le mot de passe</h2>
            <div className="space-y-3 max-w-sm">
              {['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer'].map(f => (
                <div key={f}>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1">{f}</label>
                  <input type="password" placeholder="••••••••"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]" />
                </div>
              ))}
              <button className="rounded-lg bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
                Mettre à jour
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-5">
            <h3 className="text-sm font-bold text-red-700 mb-1">Zone dangereuse</h3>
            <p className="text-xs text-red-600 mb-3">La suppression de votre compte est irréversible.</p>
            <button className="rounded-lg border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
              Supprimer mon compte
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Références' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#111827] mb-4">Lettres de recommandation</h2>
            <div className="space-y-3">
              {[
                { from: 'Pr. Martin', course: 'Algorithmique', date: 'Juin 2024', status: 'Disponible' },
                { from: 'Dr. Benkacem', course: 'Bases de données', date: 'Mai 2024', status: 'En attente' },
              ].map(r => (
                <div key={r.from} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] p-4 hover:bg-[#f9fafb]">
                  <div>
                    <p className="font-semibold text-[#111827] text-sm">{r.from}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{r.course} · {r.date}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.status === 'Disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 rounded-lg bg-[#1e3a8a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
              Demander une référence
            </button>
          </div>
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#111827] mb-4">Portfolio académique</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Projet IA — Détection d\'anomalies', course: 'Intelligence Artificielle', note: '17/20', icon: Microscope },
                { title: 'Application Web — UniFlow prototype', course: 'Programmation Web', note: '18/20', icon: Laptop },
                { title: 'Rapport — Réseaux LAN', course: 'Réseaux', note: '15/20', icon: Wifi },
              ].map(p => {
                const PIcon = p.icon
                return (
                  <div key={p.title} className="rounded-lg border border-[#e5e7eb] p-4 hover:bg-[#f9fafb]">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eff3ff] text-[#1e3a8a]">
                        <PIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#111827] text-xs leading-tight">{p.title}</p>
                        <p className="text-[10px] text-[#6b7280] mt-0.5">{p.course}</p>
                      </div>
                    </div>
                    <span className="inline-block rounded-md bg-[#eff3ff] px-2 py-0.5 text-xs font-bold text-[#1e3a8a]">{p.note}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
