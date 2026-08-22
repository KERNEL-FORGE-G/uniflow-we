import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Download, UploadCloud, Trash2, Save, Video, Check, Code2, Database, Network, Brain, GraduationCap, UserCheck, Calendar, Upload, CheckCircle, AlertTriangle, BookOpen, Loader2 } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { useUserRole } from '../utils/userRole'
import { coursesApi, studentsApi, Course } from '../lib/api'
import type { LucideIcon } from 'lucide-react'

const CC_W = 0.3, EXAM_W = 0.7

// Map course codes to icons (same as CoursesPage)
const courseIconMap: Record<string, LucideIcon> = {
  'INFO101': Code2,       // Algorithmique
  'INFO201': Database,    // Bases de données
  'INFO301': Network,     // Réseaux
  'INFO401': Brain,       // IA
}

const getCourseIcon = (code: string): LucideIcon => {
  return courseIconMap[code] || GraduationCap // Default icon
}

export default function TeacherCoursesPage() {
  const {} = useUserRole()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [selCode, setSelCode] = useState<string | null>(null)
  const [students, setStudents] = useState<any[]>([]) 
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('Cours')
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'contenu'|'participants'|'devoirs'|'notes'>('contenu')

  useEffect(() => {
    coursesApi.mine().then(data => {
      setCourses(data)
      if (data.length > 0) setSelCode(data[0].id)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selCode) return
    // As mentioned, studentsApi.list() is used as fallback for students
    studentsApi.list().then(setStudents)
    // Resources remain local
  }, [selCode])

  const course = courses.find(c => c.id === selCode)

  const avg = students.length > 0 ? parseFloat((students.reduce((s: number, st: any) => s + (st.cc * CC_W + st.exam * EXAM_W), 0) / students.length).toFixed(2)) : 0
  const passRate = students.length > 0 ? Math.round(students.filter(st => (st.cc * CC_W + st.exam * EXAM_W) >= 10).length / students.length * 100) : 0

  const updateGrade = (id: string, field: 'cc'|'exam', val: number) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: Math.min(20, Math.max(0, val)) } : s))
  }

  const toggleLock = (id: string) => setStudents(prev => prev.map(s => s.id === id ? { ...s, locked: !s.locked } : s))


  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setUploading(true); setUploadPct(10)
    const iv = setInterval(() => setUploadPct(p => {
      if (p >= 100) {
        clearInterval(iv)
        setTimeout(() => {
          setResources(r => [{ id: Date.now(), name: newName.endsWith('.pdf') ? newName : `${newName}.pdf`, type: newType, size: '1.8 Mo', date: "Aujourd'hui", courseId: selCode }, ...r])
          setNewName(''); setUploading(false); setUploadPct(0)
        }, 400)
        return 100
      }
      return p + 25
    }), 220)
  }

  const handleSaveGrades = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'contenu',      label: 'Contenu' },
    { id: 'participants', label: 'Participants' },
    { id: 'devoirs',      label: 'Devoirs' },
    { id: 'notes',        label: 'Notes' },
  ] as const

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" /></div>

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 mb-2">
            <UserCheck className="h-3.5 w-3.5" /> ESPACE ENSEIGNANT
          </span>
          <h1 className="text-xl font-bold text-[#111827]">Espace Pédagogique & Évaluations</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Gérez vos syllabus, ressources et notes · CC 30% + Examen 70%</p>
        </div>
        <div className="flex gap-2">
          {courses.map(c => {
            const Icon = getCourseIcon(c.code)
            return (
              <button key={c.id} onClick={() => setSelCode(c.id)}
                className={`rounded-lg px-3 py-2 text-xs font-bold border transition-all flex items-center gap-2 ${selCode === c.id ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f9fafb]'}`}>
                <Icon className="h-4 w-4" strokeWidth={2} />
                {c.code}
              </button>
            )
          })}
        </div>
      </div>

      {saved && (
        <div className="rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in">
          <Check className="h-4 w-4 text-[#0d9488]" /> Grille sauvegardée — {students.filter(s => s.locked).length} notes figées publiées.
        </div>
      )}

      {course && (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Course card + visio */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden shadow-sm">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex flex-col justify-between">
                <Badge className="self-start bg-white/20 text-white border-0 text-[10px]">{course.code}</Badge>
                <div>
                  <h3 className="font-bold text-white text-base">{course.name}</h3>
                  <p className="text-xs text-white/80">{course.hours}h</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#6b7280]">Progression</span>
                    <span className="font-semibold">0%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#f3f4f6] overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `0%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-[#6b7280]">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 0 étudiants</span>
                  <span className="font-semibold text-indigo-600">ICT4D · L1</span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm space-y-2">
              <h2 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">Stats notes</h2>
              <div className="flex justify-between text-sm"><span className="text-[#6b7280]">Moyenne générale</span><span className="font-bold text-indigo-600">{avg}/20</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6b7280]">Taux de réussite</span><span className="font-bold text-[#059669]">{passRate}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6b7280]">Notes figées</span><span className="font-bold text-[#374151]">{students.filter(s => s.locked).length}/{students.length}</span></div>
            </div>

            {/* Visio launcher */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-[#0d9488]" />
                <h3 className="text-sm font-bold">Planifier / Démarrer Visioconf</h3>
              </div>
              <p className="text-xs text-indigo-200 mb-3">Hébergez un cours virtuel en LAN ou Internet. Mode bas-débit disponible.</p>
              <button onClick={() => navigate('/app/visioconference')}
                className="w-full rounded-lg bg-[#0d9488] py-2 text-sm font-bold text-white hover:bg-[#0a7167] transition-colors flex items-center justify-center gap-2">
                <Video className="h-4 w-4" /> Lancer la visioconférence
              </button>
            </div>
          </div>

        {/* Main tabs panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 border-b border-[#e5e7eb]">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t.id ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-[#6b7280] hover:text-[#374151]'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'contenu' && (
            <div className="space-y-4">
              {/* Upload form */}
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2"><UploadCloud className="h-4 w-4 text-indigo-600" /> Ajouter une ressource</h2>
                <form onSubmit={handleUpload} className="space-y-3">
                  <input value={newName} onChange={e => setNewName(e.target.value)} required
                    placeholder="Nom du document (ex: TD2_Arbres)"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                  <div className="flex gap-2">
                    <select value={newType} onChange={e => setNewType(e.target.value)}
                      className="flex-1 rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm outline-none focus:border-indigo-600">
                      {['Cours','TP','TD','Syllabus'].map(t => <option key={t}>{t}</option>)}
                    </select>
                    <button type="submit" disabled={uploading}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                      <Plus className="h-4 w-4" /> Publier
                    </button>
                  </div>
                  {uploading && (
                    <div className="rounded-lg bg-[#f9fafb] border border-[#e5e7eb] p-2.5 text-xs space-y-1 animate-pulse">
                      <div className="flex justify-between font-medium text-[#374151]"><span>Téléversement...</span><span>{uploadPct}%</span></div>
                      <div className="h-1.5 w-full bg-[#e5e7eb] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0d9488] transition-all" style={{ width: `${uploadPct}%` }} />
                      </div>
                    </div>
                  )}
                </form>
              </div>
              {/* Resources list */}
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-[#111827] flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-indigo-600" /> Supports & Ressources</h2>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{resources.length} fichiers</span>
                </div>
                <div className="divide-y divide-[#f9fafb]">
                  {resources.length === 0 && <p className="text-sm text-[#9ca3af] py-4 text-center">Aucune ressource. Ajoutez votre premier fichier.</p>}
                  {resources.map(f => (
                    <div key={f.id} className="flex items-center justify-between py-3">
                      <div className="flex items-start gap-2.5">
                        <div className="h-8 w-8 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold shrink-0">PDF</div>
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">{f.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="primary" className="text-[9px] py-0">{f.type}</Badge>
                            <span className="text-[10px] text-[#9ca3af]">{f.size} · {f.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="rounded p-1 hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#374151]"><Download className="h-4 w-4" /></button>
                        <button onClick={() => setResources(r => r.filter(x => x.id !== f.id))} className="rounded p-1 hover:bg-red-50 text-[#9ca3af] hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#f3f4f6] bg-[#f9fafb] flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#111827]">Étudiants inscrits — {course.code}</h3>
                <span className="text-xs text-[#9ca3af]">{students.length} étudiants</span>
              </div>
              <div className="divide-y divide-[#f9fafb]">
                {students.map(s => {
                  const final = parseFloat((s.cc * CC_W + s.exam * EXAM_W).toFixed(2))
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f9fafb]">
                      <Avatar name={s.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#111827] text-sm">{s.name}</p>
                        <p className="text-xs text-[#9ca3af] font-mono">{s.id}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${final >= 10 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>{final}/20</p>
                        <Badge variant={final >= 10 ? 'success' : 'danger'} className="text-[9px]">{final >= 10 ? 'Validé' : 'Échoué'}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'devoirs' && (
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#111827]">Devoirs publiés — {course.code}</h3>
                <button className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d4fa8]">
                  <Plus className="h-3.5 w-3.5" /> Nouveau devoir
                </button>
              </div>
              {[
                { title: 'TP Bases de données — Requêtes SQL complexes', due: '18 sept.', submitted: 45, corrected: 23, status: 'En cours' },
                { title: 'Quiz Algorithmique', due: '20 sept.', submitted: 52, corrected: 52, status: 'Terminé' },
              ].map(d => (
                <div key={d.title} className="rounded-lg border border-[#e5e7eb] p-4 hover:bg-[#f9fafb]">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[#111827] text-sm">{d.title}</p>
                    <Badge variant={d.status === 'Terminé' ? 'success' : 'warning'}>{d.status}</Badge>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-[#6b7280]">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#9ca3af]" /> {d.due}</span>
                    <span className="flex items-center gap-1"><Upload className="h-3.5 w-3.5 text-[#9ca3af]" /> {d.submitted} soumissions</span>
                    <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> {d.corrected} corrigés</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f3f4f6] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Saisie des notes — {course.code}</h3>
                  <p className="text-xs text-[#9ca3af]">Coefficient : CC 30% / Examen 70% · Note /20</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">Pondération 30/70</Badge>
                  <button onClick={handleSaveGrades}
                    className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
                    <Save className="h-3.5 w-3.5" /> Enregistrer les notes
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f9fafb] text-[#6b7280] uppercase tracking-wider font-semibold border-b border-[#e5e7eb]">
                    <tr>
                      <th className="px-5 py-3">Matricule</th>
                      <th className="px-5 py-3">Étudiant</th>
                      <th className="px-5 py-3 text-center">CC (30%)</th>
                      <th className="px-5 py-3 text-center">Examen (70%)</th>
                      <th className="px-5 py-3 text-center">Note finale</th>
                      <th className="px-5 py-3 text-center">Statut</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3f4f6]">
                    {students.map(s => {
                      const final = parseFloat((s.cc * CC_W + s.exam * EXAM_W).toFixed(2))
                      const isValidated = final >= 10
                      return (
                        <tr key={s.id} className="hover:bg-[#f9fafb]">
                          <td className="px-5 py-3 font-mono font-medium text-[#374151]">{s.id}</td>
                          <td className="px-5 py-3 font-semibold text-[#111827]">{s.name}</td>
                          <td className="px-5 py-3 text-center">
                            <input type="number" min="0" max="20" step="0.5" value={s.cc}
                              onChange={e => updateGrade(s.id, 'cc', parseFloat(e.target.value) || 0)}
                              className="w-16 rounded border border-[#e5e7eb] px-2 py-1 text-center font-semibold text-[#111827] outline-none focus:border-[#1e3a8a]" />
                          </td>
                          <td className="px-5 py-3 text-center">
                            <input type="number" min="0" max="20" step="0.5" value={s.exam}
                              onChange={e => updateGrade(s.id, 'exam', parseFloat(e.target.value) || 0)}
                              className="w-16 rounded border border-[#e5e7eb] px-2 py-1 text-center font-semibold text-[#111827] outline-none focus:border-[#1e3a8a]" />
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-sm text-[#111827]">{final} / 20</td>
                          <td className="px-5 py-3 text-center">
                            <Badge variant={isValidated ? 'success' : 'danger'}>{isValidated ? 'Validé' : 'Échoué'}</Badge>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => toggleLock(s.id)} className="rounded p-1 hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#1e3a8a]" title="Mettre à jour">
                              <Save className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-[#f3f4f6] bg-[#f9fafb] flex items-center justify-between gap-4">
                <p className="text-xs text-[#9ca3af] flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" /> Les notes figées sont immédiatement visibles par les étudiants.</p>
                <button onClick={handleSaveGrades}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                  <Save className="h-4 w-4" /> Enregistrer la grille
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)
}
