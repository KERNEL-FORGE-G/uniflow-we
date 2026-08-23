import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, X, Save, Loader2 } from 'lucide-react'
import { usersApi } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  name: string
  email: string
  role: 'Étudiant' | 'Enseignant' | 'Admin' | 'Délégué'
  status: 'Actif' | 'Inactif'
  created: string
}

const roleColors: Record<string, string> = {
  'Étudiant': 'bg-[#eff3ff] text-[#1e3a8a] border-[#1e3a8a]/20',
  'Enseignant': 'bg-[#f0fdfa] text-[#0d9488] border-[#0d9488]/20',
  'Admin': 'bg-amber-50 text-amber-700 border-amber-200',
  'Délégué': 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('Tous')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadUsers() {
      try {
        const rawUsers = await usersApi.listAll()
        const formatted: User[] = rawUsers.map((u: any) => {
          const roleMapped = u.type === 'teacher'
            ? 'Enseignant'
            : (u.status === 'delegate' ? 'Délégué' : 'Étudiant')

          return {
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.user?.email || 'N/A',
            role: roleMapped as any,
            status: u.status === 'SUSPENDED' ? 'Inactif' : 'Actif',
            created: '—',
          }
        })
        setUsers(formatted)
      } catch (err: any) {
        setError(err.message || 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'Tous' || u.role === filterRole
    return matchSearch && matchRole
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Gestion des utilisateurs</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{users.length} comptes du répertoire académique Appwrite</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/etudiants')}
            className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2d4fa8] transition-all shadow">
            <Plus className="h-4 w-4" /> Nouvel Étudiant
          </button>
          <button onClick={() => navigate('/admin/enseignants')}
            className="flex items-center gap-2 rounded-xl bg-[#0d9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a7167] transition-all shadow">
            <Plus className="h-4 w-4" /> Nouvel Enseignant
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          Erreur: {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
          />
        </div>
        <div className="flex gap-2 font-semibold">
          {['Tous', 'Étudiant', 'Enseignant', 'Délégué'].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`rounded-xl border px-4 py-2.5 text-xs transition-all ${
                filterRole === r
                  ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white'
                  : 'border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f9fafb]'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                <th className="py-3.5 px-5 text-left font-bold text-[#111827]">Utilisateur</th>
                <th className="py-3.5 px-5 text-left font-bold text-[#111827]">Email</th>
                <th className="py-3.5 px-5 text-center font-bold text-[#111827]">Rôle</th>
                <th className="py-3.5 px-5 text-center font-bold text-[#111827]">Statut</th>
                <th className="py-3.5 px-5 text-center font-bold text-[#111827]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eff3ff] text-xs font-bold text-[#1e3a8a]">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-[#111827]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-[#6b7280] select-all">{u.email}</td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${roleColors[u.role] || ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${u.status === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button onClick={() => navigate(u.role === 'Enseignant' ? '/admin/enseignants' : '/admin/etudiants')}
                      className="rounded-lg p-2 text-[#1e3a8a] hover:bg-[#eff3ff] transition-colors"
                      title="Gérer dans le module dédié">
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[#9ca3af]">
            Aucun utilisateur trouvé.
          </div>
        )}
      </div>
    </div>
  )
}
