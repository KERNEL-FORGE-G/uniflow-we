import { useState, useEffect } from 'react'
import { UserCheck, Search, Download, Plus, Eye, Edit, Trash2, Mail, Phone, Book, Loader2, X, Save } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { teachersApi, Teacher } from '../../lib/api'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })

  const loadTeachers = async () => {
    setLoading(true)
    try {
      const data = await teachersApi.list()
      setTeachers(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  const handleOpenAdd = () => {
    setEditingTeacher(null)
    setForm({
      firstName: '',
      lastName: '',
      email: '',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setForm({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.user?.email || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet enseignant ?')) return
    try {
      await teachersApi.delete(id)
      setTeachers(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      alert('Erreur lors de la suppression : ' + err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingTeacher) {
        const updated = await teachersApi.update(editingTeacher.id, {
          firstName: form.firstName,
          lastName: form.lastName,
        })
        setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? updated : t))
      } else {
        const created = await teachersApi.create({
          firstName: form.firstName,
          lastName: form.lastName,
          user: { email: form.email } as any
        })
        setTeachers(prev => [created, ...prev])
      }
      setShowModal(false)
    } catch (err: any) {
      alert('Erreur lors de l\'enregistrement : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = teachers.filter(t => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase()
    const matchSearch = fullName.includes(searchTerm.toLowerCase()) ||
                        (t.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  const stats = [
    { label: 'Total Enseignants', value: teachers.length, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
    { label: 'Actifs', value: teachers.length, color: 'text-[#059669]', bg: 'bg-emerald-50' },
    { label: 'Cours affectés', value: teachers.reduce((sum, t) => sum + (t.courses?.length || 0), 0), color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
  ]

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Gestion des Enseignants</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Administration · UniFlow 2026</p>
        </div>
        <span className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-xs font-bold text-[#1e3a8a]">Répertoire Appwrite · lecture</span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          Erreur: {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <div className={`inline-flex items-center justify-center rounded-lg p-2 ${s.bg} mb-3`}>
              <UserCheck className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#111827]">{s.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Enseignant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Cours affectés</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.map(teacher => (
                <tr key={teacher.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0d9488] to-[#059669] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {teacher.firstName[0]}{teacher.lastName[0] || ''}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{teacher.firstName} {teacher.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6b7280] select-all">
                    {teacher.user?.email || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Book className="h-4 w-4 text-[#7c3aed]" />
                      <span className="font-semibold text-[#111827]">{teacher.courses?.length || 0} cours</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-[#0d9488]">Appwrite</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-[#9ca3af]">Aucun enseignant trouvé</p>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-[#111827]">
                {editingTeacher ? 'Modifier l\'Enseignant' : 'Ajouter un Enseignant'}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-[#f3f4f6] text-[#9ca3af]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prénom</label>
                <input type="text" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom</label>
                <input type="text" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]" />
              </div>
              {!editingTeacher && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Adresse E-mail</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]" />
                </div>
              )}
              <div className="flex gap-2 justify-end pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-medium hover:bg-[#f9fafb]">Annuler</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] text-white px-5 py-2 text-sm font-semibold hover:bg-[#2d4fa8] disabled:opacity-50">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
