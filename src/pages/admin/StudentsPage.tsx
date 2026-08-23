import { useState, useEffect } from 'react'
import { GraduationCap, Search, Download, Plus, Eye, Edit, Trash2, Mail, Phone, Loader2, X, Save } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Student } from '../../lib/api'
import { studentService } from '../../services/studentService'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Edit / Add Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    matricule: '',
    status: 'ACTIVE',
    email: '',
    password: '',
  })

  const loadStudents = async () => {
    setLoading(true)
    try {
      const data = await studentService.getAllForAdmin()
      setStudents(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleOpenAdd = () => {
    setEditingStudent(null)
    setForm({
      firstName: '',
      lastName: '',
      matricule: '',
      status: 'ACTIVE',
      email: '',
      password: '',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student)
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      matricule: student.matricule,
      status: student.status || 'ACTIVE',
      email: student.user?.email || '',
      password: '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet étudiant ?')) return
    try {
      await studentService.delete(id)
      setStudents(prev => prev.filter(s => s.id !== id))
    } catch (err: any) {
      alert('Erreur lors de la suppression : ' + err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingStudent) {
        // Edit student
        const updated = await studentService.update(editingStudent.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          matricule: form.matricule,
          status: form.status,
          email: form.email,
        })
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? updated : s))
      } else {
        // Add new student
        const created = await studentService.create({
          firstName: form.firstName,
          lastName: form.lastName,
          matricule: form.matricule,
          status: form.status,
          email: form.email,
          password: form.password,
        })
        setStudents(prev => [created, ...prev])
      }
      setShowModal(false)
    } catch (err: any) {
      alert('Erreur de sauvegarde : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = students.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
    const matchSearch = fullName.includes(searchTerm.toLowerCase()) ||
                        s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (s.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = [
    { label: 'Total Étudiants', value: students.length, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
    { label: 'Actifs', value: students.filter(s => s.status === 'ACTIVE' || s.status === 'active').length, color: 'text-[#059669]', bg: 'bg-emerald-50' },
    { label: 'Suspendus', value: students.filter(s => s.status === 'SUSPENDED').length, color: 'text-[#d97706]', bg: 'bg-amber-50' },
    { label: 'Diplômés', value: students.filter(s => s.status === 'GRADUATED').length, color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
  ]

  const statusConfig: Record<string, { label: string; variant: 'success'|'warning'|'danger'|'neutral' }> = {
    ACTIVE: { label: 'Actif', variant: 'success' },
    active: { label: 'Actif', variant: 'success' },
    SUSPENDED: { label: 'Suspendu', variant: 'warning' },
    suspended: { label: 'Suspendu', variant: 'warning' },
    GRADUATED: { label: 'Diplômé', variant: 'neutral' },
    graduated: { label: 'Diplômé', variant: 'neutral' },
  }

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Gestion des Étudiants</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Administration · UniFlow 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-xs font-bold text-[#1e3a8a]">Appwrite · CRUD sécurisé</span>
          <Button onClick={handleOpenAdd} className="bg-[#1e3a8a] text-white hover:bg-[#2d4fa8]">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un étudiant
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          Erreur: {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <div className={`inline-flex items-center justify-center rounded-lg p-2 ${s.bg} mb-3`}>
              <GraduationCap className={`h-5 w-5 ${s.color}`} />
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
              placeholder="Rechercher par nom, matricule, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="all">Tous statuts</option>
              <option value="ACTIVE">Actif</option>
              <option value="SUSPENDED">Suspendu</option>
              <option value="GRADUATED">Diplômé</option>
            </select>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Matricule</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Étudiant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Niveau / Filière</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-[#1e3a8a]">{student.matricule}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {student.firstName[0]}{student.lastName[0] || ''}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{student.firstName} {student.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6b7280] select-all">
                    {student.user?.email || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">
                    {student.level?.name || 'N/A'} {student.specialty?.name ? `· ${student.specialty.name}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig[student.status]?.variant || 'neutral'}>
                      {statusConfig[student.status]?.label || student.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-[#0d9488]">Appwrite</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" title="Modifier l’étudiant" aria-label="Modifier l’étudiant" onClick={() => handleOpenEdit(student)} className="rounded-lg p-2 text-[#1e3a8a] hover:bg-[#eff6ff]"><Edit className="h-4 w-4" /></button>
                      <button type="button" title="Supprimer l’étudiant" aria-label="Supprimer l’étudiant" onClick={() => handleDelete(student.id)} className="rounded-lg p-2 text-[#dc2626] hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-[#9ca3af]">Aucun étudiant trouvé</p>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-[#111827]">
                {editingStudent ? 'Modifier l\'Étudiant' : 'Ajouter un Étudiant'}
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
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Matricule</label>
                <input type="text" required value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]" />
              </div>
              {!editingStudent && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Adresse E-mail</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mot de passe initial</label>
                    <input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]" />
                    <p className="mt-1 text-[11px] text-gray-500">Transmettez-le au titulaire puis demandez son changement.</p>
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Statut</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]">
                  <option value="ACTIVE">Actif</option>
                  <option value="SUSPENDED">Suspendu</option>
                  <option value="GRADUATED">Diplômé</option>
                </select>
              </div>
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
