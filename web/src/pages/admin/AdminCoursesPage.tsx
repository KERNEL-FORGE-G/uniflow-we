import { useState, useEffect } from 'react'
import { IconTile, UniIcon } from '../../components/ui/UniIcon'
import { subjectColor } from '../../lib/subjectIcon'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { coursesApi, teachersApi, classroomsApi, Course, Teacher, Classroom } from '../../lib/api'
import { APPWRITE_DATABASE_ID, appwriteDatabases } from '../../lib/appwrite'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'courses' | 'assignments'>('courses')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Modal d'attribution d'UE à un enseignant
  const [assignTeacher, setAssignTeacher] = useState<Teacher | null>(null)
  const [selectedUeId, setSelectedUeId] = useState<string>('')
  const [assigning, setAssigning] = useState(false)

  // Modal states cours
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
      teacherId: course.teacher?.id || teachers[0]?.id || '',
      classroomId: course.classroom?.id || classrooms[0]?.id || '',
      teachingUnitId: course.teachingUnit?.id || '',
    })
    setShowModal(true)
  }

  const handleAssignUe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignTeacher || !selectedUeId) return
    setAssigning(true)
    try {
      const selectedCourse = courses.find(c => c.id === selectedUeId)
      const teacherName = `${assignTeacher.firstName} ${assignTeacher.lastName}`.trim()

      // Mettre à jour dans Appwrite academic_courses
      await appwriteDatabases.updateDocument(
        APPWRITE_DATABASE_ID,
        'academic_courses',
        selectedUeId,
        {
          teacherId: assignTeacher.id,
          teacherName: teacherName
        }
      )

      setSuccessMessage(`UE ${selectedCourse?.code} attribuée avec succès à ${teacherName}`)
      setAssignTeacher(null)
      setSelectedUeId('')
      await loadData()
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      alert('Erreur lors de l’attribution de l’UE : ' + err.message)
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveUe = async (courseId: string, teacherName: string) => {
    if (!window.confirm(`Retirer l'attribution de ce cours pour ${teacherName} ?`)) return
    try {
      await appwriteDatabases.updateDocument(
        APPWRITE_DATABASE_ID,
        'academic_courses',
        courseId,
        {
          teacherId: '',
          teacherName: ''
        }
      )
      setSuccessMessage('Attribution retirée avec succès')
      await loadData()
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      alert('Erreur lors du retrait de l’attribution : ' + err.message)
    }
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
        const selectedTeacher = teachers.find(t => t.id === form.teacherId)
        const teacherName = selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`.trim() : ''

        try {
          await appwriteDatabases.updateDocument(
            APPWRITE_DATABASE_ID,
            'academic_courses',
            editingCourse.id,
            {
              name: form.name,
              code: form.code,
              type: form.type,
              credits: Number(form.credits),
              hours: Number(form.hours),
              teacherId: form.teacherId,
              teacherName: teacherName
            }
          )
        } catch (_) {
          await coursesApi.update(editingCourse.id, {
            name: form.name,
            code: form.code,
            type: form.type as any,
            credits: Number(form.credits),
            hours: Number(form.hours),
          })
        }
      } else {
        await coursesApi.create({
          name: form.name,
          code: form.code,
          type: form.type as any,
          credits: Number(form.credits),
          hours: Number(form.hours),
          teacherId: form.teacherId,
          classroomId: form.classroomId,
          teachingUnitId: form.teachingUnitId || undefined as any
        })
      }
      setShowModal(false)
      await loadData()
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
    { label: 'Total Cours & UEs', value: courses.length, color: '#1E3A8A' },
    { label: 'Enseignants Référencés', value: teachers.length, color: '#10B981' },
    { label: 'Cours Magistraux (CM)', value: courses.filter(c => c.type === 'CM').length, color: '#F59E0B' },
    { label: 'Travaux Dirigés / TP', value: courses.filter(c => c.type === 'TD' || c.type === 'TP').length, color: '#7C3AED' },
  ]

  const typeColors: Record<string, string> = {
    CM: 'bg-[#eff3ff] text-[#1e3a8a]',
    TD: 'bg-[#f0fdfa] text-[#0d9488]',
    TP: 'bg-purple-50 text-[#7c3aed]',
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <UniIcon name="spinner" weight="bold" size={32} className="animate-spin text-[#1e3a8a]" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Gestion Pédagogique & Attribution des UEs</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Université de Yaoundé I · Faculté des Sciences · Année Académique 2026-2027</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'courses' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('courses')}
            className="font-bold"
          >
            <UniIcon name="courses" size={16} className="mr-1.5" />
            Catalogue des Cours ({courses.length})
          </Button>
          <Button
            variant={activeTab === 'assignments' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('assignments')}
            className="font-bold"
          >
            <UniIcon name="teacher" size={16} className="mr-1.5" />
            Attribution Enseignants ({teachers.length})
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between shadow-xs">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          Erreur: {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, index) => (
          <div key={s.label} className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
            <div className="mb-3"><IconTile name="courses" color={s.color} variant="filled" size={44} index={index} /></div>
            <p className="text-2xl font-black text-[#111827]">{s.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* TAB 1: Catalogue des Cours */}
      {activeTab === 'courses' && (
        <>
          {/* Filters & Search */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <UniIcon name="search" weight="bold" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Rechercher par code (ex: INF 111, ICT 201), intitulé, enseignant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-[#d1d5db] bg-white py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="rounded-xl border border-[#d1d5db] px-3 py-2 text-xs font-semibold focus:border-[#1e3a8a] focus:outline-none"
                >
                  <option value="all">Tous types</option>
                  <option value="CM">Cours Magistral (CM)</option>
                  <option value="TD">Travaux Dirigés (TD)</option>
                  <option value="TP">Travaux Pratiques (TP)</option>
                </select>
                <Button size="sm" onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                  <UniIcon name="plus" size={16} className="mr-1.5" />
                  + Nouveau Cours
                </Button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(course => (
              <div key={course.id} className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconTile subject={course.name} subjectCode={course.code} color={subjectColor(course.code)} variant="filled" size={36} />
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-black ${typeColors[course.type] || 'bg-gray-100 text-gray-700'}`}>
                        {course.type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                    >
                      Modifier / Attribuer
                    </button>
                  </div>
                  
                  <h3 className="font-extrabold text-[#111827] text-base mb-1 line-clamp-1">{course.name}</h3>
                  <p className="text-xs text-blue-800 font-mono font-bold mb-3 bg-blue-50/70 inline-block px-2 py-0.5 rounded">
                    {course.code}
                  </p>
                  
                  <div className="space-y-2 mb-4 text-xs text-[#374151]">
                    <div className="flex items-center gap-2">
                      <UniIcon name="teacher" size={15} className="text-[#0d9488] shrink-0" />
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : (course as any).teacherName || 'Non attribué'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UniIcon name="room" size={15} className="text-[#7c3aed] shrink-0" />
                      <span>{course.classroom ? `${course.classroom.building} - ${course.classroom.name}` : (course as any).classroom || 'Amphithéâtre UY1'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UniIcon name="time" size={15} className="text-[#d97706] shrink-0" />
                      <span>{course.hours} heures de cours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UniIcon name="badges" size={15} className="text-[#1e3a8a] shrink-0" />
                      <span>{course.credits} crédits académiques</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#f3f4f6] pt-3 flex items-center justify-between text-[11px] text-[#6b7280]">
                  <span>Filière : {(course as any).program || 'Sciences'}</span>
                  <span>Niveau : {(course as any).level || 'L1-M2'}</span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-12 text-center shadow-xs">
              <p className="text-sm font-semibold text-[#9ca3af]">Aucun cours ne correspond à la recherche.</p>
            </div>
          )}
        </>
      )}

      {/* TAB 2: Attribution Enseignants ↔ UEs */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md">
            <h2 className="text-base font-black">Module d'Attribution Officielle des UEs</h2>
            <p className="text-xs text-blue-200 mt-1 max-w-3xl leading-relaxed">
              Consultez pour chaque enseignant de l'Université de Yaoundé I l'ensemble des Unités d'Enseignement qui lui sont confiées. Vous pouvez lui affecter instantanément une ou plusieurs UEs issues du programme officiel ou en dissocier en un clic.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {teachers.map(t => {
              const teacherFullName = `${t.firstName} ${t.lastName}`.trim()
              const assignedCourses = courses.filter(c =>
                c.teacher?.id === t.id ||
                (c as any).teacherId === t.id ||
                (c as any).teacherName?.toLowerCase().includes(t.lastName.toLowerCase())
              )

              return (
                <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                            {t.id.slice(0, 10)}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                            Enseignant UY1
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-1.5">{teacherFullName}</h3>
                        <p className="text-xs text-slate-500 font-medium">Département d'Informatique & Sciences</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setAssignTeacher(t)
                          setSelectedUeId(courses[0]?.id || '')
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        + Attribuer UE
                      </Button>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        UEs Actuellement Attribuées ({assignedCourses.length}) :
                      </p>
                      {assignedCourses.length === 0 ? (
                        <p className="text-xs italic text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                          Aucune unité d'enseignement attribuée pour le moment. Cliquez sur « + Attribuer UE » pour lui affecter un cours.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {assignedCourses.map(c => (
                            <span
                              key={c.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                            >
                              <span className="font-mono font-bold text-blue-700">{c.code}</span>
                              <span className="max-w-[140px] truncate">{c.name}</span>
                              <button
                                onClick={() => handleRemoveUe(c.id, teacherFullName)}
                                className="text-slate-400 hover:text-red-600 font-black ml-1 text-sm leading-none"
                                title="Retirer l'attribution"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Charge totale estimée : {assignedCourses.reduce((acc, c) => acc + (c.hours || 30), 0)}h</span>
                    <span>Crédits sous gestion : {assignedCourses.reduce((acc, c) => acc + (c.credits || 3), 0)} ECTS</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal d'attribution rapide d'UE */}
      {assignTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Attribuer une UE à l'enseignant</h3>
                <p className="text-xs text-blue-700 font-bold mt-0.5">
                  {assignTeacher.firstName} {assignTeacher.lastName}
                </p>
              </div>
              <button
                onClick={() => setAssignTeacher(null)}
                className="rounded-full p-1.5 hover:bg-slate-100 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignUe} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Sélectionnez l'Unité d'Enseignement (UE) à confier :
                </label>
                <select
                  value={selectedUeId}
                  onChange={e => setSelectedUeId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs font-semibold focus:border-blue-600 focus:outline-none"
                >
                  <option value="">-- Choisir une UE --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name} ({(c as any).program || 'Tronc commun'} - {(c as any).level || 'Niveau'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-900 border border-blue-200 leading-relaxed">
                ℹ️ L'enseignant sera immédiatement désigné comme titulaire dans l'annuaire académique Appwrite. L'UE apparaîtra dans son planning, sa liste d'appel numérique et son espace devoirs.
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setAssignTeacher(null)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={assigning || !selectedUeId} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  {assigning ? 'Attribution en cours...' : 'Confirmer l’attribution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Modal de cours */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-[#111827]">
                {editingCourse ? 'Modifier le cours & Enseignant' : 'Créer un nouveau cours'}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-[#f3f4f6] text-[#9ca3af]"><UniIcon name="close" weight="bold" size={20} /></button>
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
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Enseignant Titulaire</label>
                <select value={form.teacherId} onChange={e => setForm({...form, teacherId: e.target.value})}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#1e3a8a]">
                  <option value="">-- Aucun enseignant assigné --</option>
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
              <div className="flex gap-2 justify-end pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-medium hover:bg-[#f9fafb]">Annuler</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] text-white px-5 py-2 text-sm font-semibold hover:bg-[#2d4fa8] disabled:opacity-50">
                  {saving && <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" />}
                  <UniIcon name="save" weight="bold" size={16} />
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
