import { useState, useEffect } from 'react'
import { BookOpen, Search, Download, Plus, Eye, Edit, Trash2, Calendar, MapPin, Users, UserCheck, Loader2, X, Save } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { coursesApi, teachersApi, classroomsApi, Course, Teacher, Classroom } from '../../lib/api'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'CM',
    credits: 3,
    hours: 30,
    teacherId: '',
    classroomId: '',
    teachingUnitId: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [courseList, teacherList, classroomList] = await Promise.all([
        coursesApi.list(),
        teachersApi.list().catch(() => []),
        classroomsApi.list().catch(() => [])
      ])
      setCourses(courseList)
      setTeachers(teacherList)
      setClassrooms(classroomList)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenAdd = () => {
    setEditingCourse(null)
    setForm({
      name: '',
      code: '',
      type: 'CM',
      credits: 3,
      hours: 30,
      teacherId: teachers[0]?.id || '',
      classroomId: classrooms[0]?.id || '',
      teachingUnitId: '',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course)
    setForm({
      name: course.name,
      code: course.code,
      type: course.type || 'CM',
      credits: course.credits || 3,
      hours: course.hours || 30,
      teacherId: course.teacher?.id || '',
      classroomId: course.classroom?.id || '',
      teachingUnitId: course.teachingUnit?.id || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce cours ?')) return
    try {
      await coursesApi.delete(id)
      setCourses(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      alert('Erreur lors de la suppression : ' + err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingCourse) {
        const updated = await coursesApi.update(editingCourse.id, {
          name: form.name,
          code: form.code,
          type: form.type as any,
          credits: Number(form.credits),
          hours: Number(form.hours),
        })
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? updated : c))
      } else {
        const created = await coursesApi.create({
          name: form.name,
          code: form.code,
          type: form.type as any,
          credits: Number(form.credits),
          hours: Number(form.hours),
          teacherId: form.teacherId,
          classroomId: form.classroomId,
          teachingUnitId: form.teachingUnitId || undefined as any
        })
        setCourses(prev => [created, ...prev])
      }
      setShowModal(false)
    } catch (err: any) {
      alert('Erreur lors de l\'enregistrement : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = courses.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === 'all' || c.type === filterType
    return matchSearch && matchType
  })

  const stats = [
    { label: 'Total Cours', value: courses.length, color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]' },
    { label: 'Cours Magistraux (CM)', value: courses.filter(c => c.type === 'CM').length, color: 'text-[#059669]', bg: 'bg-emerald-50' },
    { label: 'Travaux Dirigés (TD)', value: courses.filter(c => c.type === 'TD').length, color: 'text-[#d97706]', bg: 'bg-amber-50' },
    { label: 'Travaux Pratiques (TP)', value: courses.filter(c => c.type === 'TP').length, color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
  ]

  const typeColors: Record<string, string> = {
    CM: 'bg-[#eff3ff] text-[#1e3a8a]',
    TD: 'bg-[#f0fdfa] text-[#0d9488]',
    TP: 'bg-purple-50 text-[#7c3aed]',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Gestion des Cours</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Administration · Séances de cours 2026</p>
        </div>
        <span className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-xs font-bold text-[#1e3a8a]">Référentiel Appwrite · lecture</span>
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
              <BookOpen className={`h-5 w-5 ${s.color}`} />
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
              placeholder="Rechercher par titre, code, enseignant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="all">Tous types</option>
              <option value="CM">Cours Magistral</option>
              <option value="TD">Travaux Dirigés</option>
              <option value="TP">Travaux Pratiques</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(course => (
          <div key={course.id} className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${typeColors[course.type] || 'bg-gray-100'}`}>
                {course.type}
              </span>
              <Badge variant="success">Actif</Badge>
            </div>
            
            <h3 className="font-bold text-[#111827] text-base mb-1">{course.name}</h3>
            <p className="text-xs text-[#6b7280] mb-3 font-mono">{course.code} {course.teachingUnit ? `· UE ${course.teachingUnit.code}` : ''}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <UserCheck className="h-4 w-4 text-[#0d9488]" />
                <span>{course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Aucun enseignant'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <MapPin className="h-4 w-4 text-[#7c3aed]" />
                <span>{course.classroom ? `${course.classroom.building} - ${course.classroom.name}` : 'Aucune salle'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <Calendar className="h-4 w-4 text-[#d97706]" />
                <span>{course.hours} heures</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <Users className="h-4 w-4 text-[#1e3a8a]" />
                <span>{course.credits} crédits</span>
              </div>
            </div>

            <p className="border-t border-[#f3f4f6] pt-3 text-xs text-[#6b7280]">Cours lu depuis Appwrite. La gestion du référentiel est réservée aux opérations administratives sécurisées.</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-[#9ca3af]">Aucun cours trouvé</p>
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-[#111827]">
                {editingCourse ? 'Modifier le cours' : 'Créer un nouveau cours'}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-[#f3f4f6] text-[#9ca3af]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom du cours</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Code du cours</label>
                <input type="text" required value={form.code} onChange={e => setForm({...form, code: e.target.value})}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#1e3a8a]">
                    <option value="CM">Magistral (CM)</option>
                    <option value="TD">Travaux Dirigés (TD)</option>
                    <option value="TP">Travaux Pratiques (TP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Crédits</label>
                  <input type="number" required value={form.credits} onChange={e => setForm({...form, credits: Number(e.target.value)})}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#1e3a8a]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Volume Horaire (h)</label>
                  <input type="number" required value={form.hours} onChange={e => setForm({...form, hours: Number(e.target.value)})}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#1e3a8a]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ID Unité d'Enseignement</label>
                  <input type="text" placeholder="Facultatif" value={form.teachingUnitId} onChange={e => setForm({...form, teachingUnitId: e.target.value})}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#1e3a8a]" />
                </div>
              </div>
              {!editingCourse && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Enseignant</label>
                    <select value={form.teacherId} onChange={e => setForm({...form, teacherId: e.target.value})}
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#1e3a8a]">
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Salle de classe</label>
                    <select value={form.classroomId} onChange={e => setForm({...form, classroomId: e.target.value})}
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#1e3a8a]">
                      {classrooms.map(c => (
                        <option key={c.id} value={c.id}>{c.building} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </>
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
