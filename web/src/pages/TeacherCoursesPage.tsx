import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SubjectIcon, UniIcon } from '../components/ui/UniIcon'
import { darkenHex, subjectColor } from '../lib/subjectIcon'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { useUserRole } from '../utils/userRole'
import { coursesApi, gradesApi, libraryApi, teacherStatementsApi, type Course, type LibraryResource, type PublishedStatement } from '../lib/api'
import { ExportButtons } from '../components/exports/ExportButtons'
import { courseGradesDocument } from '../lib/exports'
import { evaluationProgress, humanFileSize, localInputToIso, summarizeStatement } from '../lib/teacherCourseModel'

const RESOURCE_CATEGORIES = ['Support de cours', 'TD', 'TP', 'Syllabus', 'Correction']
const STATEMENT_TYPES: Array<{ value: string; label: string }> = [
  { value: 'DEVOIR', label: 'Devoir maison' },
  { value: 'TP', label: 'Travaux pratiques' },
  { value: 'EXPOSE', label: 'Exposé' },
  { value: 'QUIZ', label: 'Quiz' },
]
const MAX_RESOURCE_BYTES = 50 * 1024 * 1024

const formatDue = (iso: string) => {
  const date = new Date(iso)
  return Number.isFinite(date.getTime()) ? date.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : iso
}
const formatDate = (iso: string) => {
  const date = new Date(iso)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

const CC_COEFFICIENT = 3
const EXAM_COEFFICIENT = 7

type CourseLearner = {
  id: string
  name: string
  matricule: string
  cc?: number
  exam?: number
}

function currentAverage(student: CourseLearner): number | null {
  const entries = [
    typeof student.cc === 'number' ? { score: student.cc, coefficient: CC_COEFFICIENT } : null,
    typeof student.exam === 'number' ? { score: student.exam, coefficient: EXAM_COEFFICIENT } : null,
  ].filter((entry): entry is { score: number; coefficient: number } => Boolean(entry))
  if (!entries.length) return null
  const totalCoefficient = entries.reduce((sum, entry) => sum + entry.coefficient, 0)
  return Number((entries.reduce((sum, entry) => sum + entry.score * entry.coefficient, 0) / totalCoefficient).toFixed(2))
}

// L'icône du cours vient de `subjectIcon` (nom + code), comme sur la page
// « Mes cours » : la table par code ne couvrait que quatre cours de démonstration.

export default function TeacherCoursesPage() {
  const { currentUser } = useUserRole()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [selCode, setSelCode] = useState<string | null>(null)
  const [students, setStudents] = useState<CourseLearner[]>([])
  const [resources, setResources] = useState<LibraryResource[]>([])
  const [resourcesError, setResourcesError] = useState<string | null>(null)
  const [statements, setStatements] = useState<PublishedStatement[]>([])
  const [statementsError, setStatementsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState(RESOURCE_CATEGORIES[0])
  const [newFile, setNewFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [gradeError, setGradeError] = useState<string | null>(null)
  const [savingGrades, setSavingGrades] = useState(false)
  const [activeTab, setActiveTab] = useState<'contenu'|'participants'|'devoirs'|'notes'>('contenu')
  const [statementForm, setStatementForm] = useState<{ open: boolean; title: string; description: string; due: string; type: string; maxScore: string; allowLate: boolean }>({ open: false, title: '', description: '', due: '', type: 'DEVOIR', maxScore: '20', allowLate: false })
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())

  const flashSaved = (message: string) => {
    setSaved(message)
    setTimeout(() => setSaved(null), 3500)
  }

  useEffect(() => {
    coursesApi.mine().then(data => {
      setCourses(data)
      if (data.length > 0) setSelCode(data[0].id)
    }).finally(() => setLoading(false))
  }, [])

  const reloadResources = useCallback(async (courseId: string) => {
    setResourcesError(null)
    try {
      setResources(await libraryApi.forCourse(courseId))
    } catch (error) {
      setResources([])
      setResourcesError(error instanceof Error ? error.message : 'Impossible de charger les ressources du cours.')
    }
  }, [])

  const reloadStatements = useCallback(async (courseId: string) => {
    setStatementsError(null)
    try {
      setStatements(await teacherStatementsApi.forCourse(courseId))
      setNow(new Date())
    } catch (error) {
      setStatements([])
      setStatementsError(error instanceof Error ? error.message : 'Impossible de charger les devoirs du cours.')
    }
  }, [])

  useEffect(() => {
    if (!selCode) return
    setStatementForm((form) => ({ ...form, open: false }))
    void reloadResources(selCode)
    void reloadStatements(selCode)
  }, [selCode, reloadResources, reloadStatements])

  useEffect(() => {
    if (!selCode) return
    let active = true
    setGradeError(null)
    gradesApi.roster(selCode)
      .then(({ students: roster, grades }) => {
        if (!active) return
        const scoreOnTwenty = (grade: typeof grades[number]) => Number(((grade.grade / Math.max(grade.maxScore, 1)) * 20).toFixed(2))
        setStudents(roster.map((student) => {
          const studentGrades = grades.filter((grade) => grade.studentId === student.id)
          const cc = studentGrades.find((grade) => grade.type === 'CC')
          const exam = studentGrades.find((grade) => grade.type === 'EXAM')
          return { ...student, cc: cc ? scoreOnTwenty(cc) : undefined, exam: exam ? scoreOnTwenty(exam) : undefined }
        }))
      })
      .catch((error) => { if (active) { setStudents([]); setGradeError(error instanceof Error ? error.message : 'Impossible de charger les apprenants inscrits.') } })
    return () => { active = false }
  }, [selCode])

  const course = courses.find(c => c.id === selCode)

  const availableAverages = students.map(currentAverage).filter((value): value is number => value !== null)
  const avg = availableAverages.length ? Number((availableAverages.reduce((sum, value) => sum + value, 0) / availableAverages.length).toFixed(2)) : null
  const passRate = availableAverages.length ? Math.round((availableAverages.filter((value) => value >= 10).length / availableAverages.length) * 100) : null

  // Le PV exporte la grille telle qu'affichée (y compris les notes saisies mais
  // pas encore enregistrées) : c'est ce que l'enseignant a sous les yeux.
  const gradesExport = () => (course && students.length
    ? courseGradesDocument(students.map((student) => ({ studentId: student.id, name: student.name, matricule: student.matricule, cc: student.cc, exam: student.exam })), {
      courseCode: course.code,
      courseName: course.name,
      ccWeight: CC_COEFFICIENT / (CC_COEFFICIENT + EXAM_COEFFICIENT),
      examWeight: EXAM_COEFFICIENT / (CC_COEFFICIENT + EXAM_COEFFICIENT),
      teacherName: currentUser.name,
      program: course.program,
      level: course.level,
      institution: currentUser.university,
    })
    : null)

  const updateGrade = (id: string, field: 'cc'|'exam', val: string) => {
    const value = val === '' ? undefined : Math.min(20, Math.max(0, Number(val)))
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: Number.isFinite(value) ? value : undefined } : s))
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course || !newFile) { setUploadError('Choisissez un fichier à publier.'); return }
    if (newFile.size > MAX_RESOURCE_BYTES) { setUploadError(`Fichier trop lourd (${humanFileSize(newFile.size)}) : 50 Mo maximum.`); return }
    setUploading(true)
    setUploadError(null)
    try {
      const created = await libraryApi.upload(newFile, course, { title: newName, category: newType })
      setResources((current) => [created, ...current])
      setNewName(''); setNewFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      flashSaved(`« ${created.title} » est publié : vos étudiants le voient dans la bibliothèque.`)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Téléversement refusé.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveResource = async (resource: LibraryResource) => {
    if (!window.confirm(`Retirer « ${resource.title} » de la bibliothèque ? Le fichier sera supprimé pour tous les étudiants.`)) return
    try {
      await libraryApi.remove(resource)
      setResources((current) => current.filter((item) => item.id !== resource.id))
    } catch (error) {
      setResourcesError(error instanceof Error ? error.message : 'Suppression impossible.')
    }
  }

  const handlePublishStatement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return
    const dueDate = localInputToIso(statementForm.due)
    if (!statementForm.title.trim()) { setPublishError('Donnez un titre au devoir.'); return }
    if (!dueDate) { setPublishError('Indiquez une date et une heure limite de remise.'); return }
    const maxScore = Number(statementForm.maxScore)
    if (!Number.isFinite(maxScore) || maxScore <= 0) { setPublishError('Le barème doit être un nombre positif.'); return }
    setPublishing(true)
    setPublishError(null)
    try {
      const created = await teacherStatementsApi.publish({ courseId: course.id, courseCode: course.code, title: statementForm.title, description: statementForm.description, dueDate, type: statementForm.type, maxScore, allowLate: statementForm.allowLate })
      setStatements((current) => [created, ...current])
      setStatementForm({ open: false, title: '', description: '', due: '', type: 'DEVOIR', maxScore: '20', allowLate: false })
      flashSaved(`« ${created.title} » est publié : les étudiants du cours le voient dans leurs devoirs.`)
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Publication impossible.')
    } finally {
      setPublishing(false)
    }
  }

  const handleRemoveStatement = async (statement: PublishedStatement) => {
    const warning = statement.submissions.length ? ` ${statement.submissions.length} rendu${statement.submissions.length > 1 ? 's' : ''} resteront orphelins.` : ''
    if (!window.confirm(`Supprimer le devoir « ${statement.title} » ?${warning}`)) return
    try {
      await teacherStatementsApi.remove(statement.id)
      setStatements((current) => current.filter((item) => item.id !== statement.id))
    } catch (error) {
      setStatementsError(error instanceof Error ? error.message : 'Suppression impossible.')
    }
  }

  const handleSaveGrades = async (studentIds = students.map((student) => student.id)) => {
    if (!course) return
    setSavingGrades(true)
    setSaved(null)
    setGradeError(null)
    try {
      const targetStudents = students.filter((student) => studentIds.includes(student.id))
      await Promise.all(targetStudents.flatMap((student) => {
        const writes: Promise<unknown>[] = []
        if (typeof student.cc === 'number') writes.push(gradesApi.upsertUniversity({ courseId: course.id, studentId: student.id, evaluationTitle: 'Contrôle continu', type: 'CC', score: Math.round(student.cc), maxScore: 20, coefficient: CC_COEFFICIENT }))
        if (typeof student.exam === 'number') writes.push(gradesApi.upsertUniversity({ courseId: course.id, studentId: student.id, evaluationTitle: 'Examen final', type: 'EXAM', score: Math.round(student.exam), maxScore: 20, coefficient: EXAM_COEFFICIENT }))
        return writes
      }))
      flashSaved('Évaluations enregistrées dans Appwrite et visibles dans le relevé des apprenants.')
    } catch (error) {
      setGradeError(error instanceof Error ? error.message : 'Enregistrement des notes impossible.')
    } finally {
      setSavingGrades(false)
    }
  }

  const tabs = [
    { id: 'contenu',      label: 'Contenu' },
    { id: 'participants', label: 'Participants' },
    { id: 'devoirs',      label: 'Devoirs' },
    { id: 'notes',        label: 'Notes' },
  ] as const

  if (loading) return <div className="flex h-screen items-center justify-center"><UniIcon name="spinner" weight="bold" size={32} className="animate-spin text-[#1e3a8a]" /></div>

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 mb-2">
            <UniIcon name="teacher" weight="fill" size={14} /> ESPACE ENSEIGNANT
          </span>
          <h1 className="text-xl font-bold text-[#111827]">Espace Pédagogique & Évaluations</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Gérez vos syllabus, ressources et notes · CC 30% + Examen 70%</p>
        </div>
        <div className="flex gap-2">
          {courses.map(c => {
            return (
              <button key={c.id} onClick={() => setSelCode(c.id)}
                className={`rounded-lg px-3 py-2 text-xs font-bold border transition-all flex items-center gap-2 ${selCode === c.id ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f9fafb]'}`}>
                <SubjectIcon subject={c.name} code={c.code} weight={selCode === c.id ? 'fill' : 'duotone'} size={16} />
                {c.code}
              </button>
            )
          })}
        </div>
      </div>

      {saved && (
        <div role="status" className="rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in">
          <UniIcon name="check" weight="bold" size={16} className="text-[#0d9488]" /> {saved}
        </div>
      )}
      {gradeError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{gradeError}</div>}

      {course && (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Course card + visio */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden shadow-sm">
              <div className="h-24 p-4 flex flex-col justify-between" style={{ backgroundImage: `linear-gradient(135deg, ${subjectColor(course.code)} 0%, ${darkenHex(subjectColor(course.code), 0.3)} 100%)` }}>
                <div className="flex items-start justify-between">
                  <Badge className="self-start bg-white/20 text-white border-0 text-[10px]">{course.code}</Badge>
                  <span className="rounded-lg bg-white/20 p-1.5 text-white"><SubjectIcon subject={course.name} code={course.code} size={20} /></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{course.name}</h3>
                  <p className="text-xs text-white/80">{course.hours}h</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#6b7280]">Apprenants évalués</span>
                    <span className="font-semibold">{evaluationProgress(students.length, availableAverages.length)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#f3f4f6] overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${evaluationProgress(students.length, availableAverages.length)}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-[#6b7280]">
                  <span className="flex items-center gap-1"><UniIcon name="students" size={14} /> {students.length} inscrits</span>
                  <span className="font-semibold text-indigo-600">{[course.program, course.level].filter(Boolean).join(' · ') || 'Cours universitaire'}</span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm space-y-2">
              <h2 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">Stats notes</h2>
              <div className="flex justify-between text-sm"><span className="text-[#6b7280]">Moyenne générale</span><span className="font-bold text-indigo-600">{avg === null ? '—' : `${avg}/20`}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6b7280]">Taux de réussite</span><span className="font-bold text-[#059669]">{passRate === null ? '—' : `${passRate}%`}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6b7280]">Apprenants évalués</span><span className="font-bold text-[#374151]">{availableAverages.length}/{students.length}</span></div>
            </div>

            {/* Visio launcher */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <UniIcon name="video" weight="fill" size={16} className="text-[#0d9488]" />
                <h3 className="text-sm font-bold">Planifier / Démarrer Visioconf</h3>
              </div>
              <p className="text-xs text-indigo-200 mb-3">Hébergez un cours virtuel en LAN ou Internet. Mode bas-débit disponible.</p>
              <button onClick={() => navigate('/app/visioconference')}
                className="w-full rounded-lg bg-[#0d9488] py-2 text-sm font-bold text-white hover:bg-[#0a7167] transition-colors flex items-center justify-center gap-2">
                <UniIcon name="video" weight="fill" size={16} /> Lancer la visioconférence
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
                <h2 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2"><UniIcon name="cloud" size={16} className="text-indigo-600" /> Ajouter une ressource</h2>
                <form onSubmit={(e) => void handleUpload(e)} className="space-y-3">
                  <input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="Titre affiché (ex : TD2 — Arbres binaires) · par défaut le nom du fichier"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-colors ${newFile ? 'border-indigo-300 bg-indigo-50/60' : 'border-[#e5e7eb] hover:border-indigo-300 hover:bg-[#f9fafb]'}`}>
                    <UniIcon name="paperclip" weight="bold" size={16} className="shrink-0 text-indigo-600" />
                    <span className="min-w-0 flex-1 truncate">
                      {newFile ? <><span className="font-semibold text-[#111827]">{newFile.name}</span> <span className="text-[#6b7280]">· {humanFileSize(newFile.size)}</span></> : <span className="text-[#6b7280]">Choisir un fichier (PDF, diaporama, archive…) · 50 Mo max.</span>}
                    </span>
                    {newFile && (
                      <button type="button" onClick={(e) => { e.preventDefault(); setNewFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} aria-label="Retirer le fichier" className="rounded p-1 text-[#9ca3af] hover:bg-white hover:text-[#374151]">
                        <UniIcon name="close" weight="bold" size={16} />
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" className="sr-only" onChange={(e) => { setNewFile(e.target.files?.[0] ?? null); setUploadError(null) }} />
                  </label>
                  <div className="flex gap-2">
                    <select value={newType} onChange={e => setNewType(e.target.value)} aria-label="Catégorie de la ressource"
                      className="flex-1 rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm outline-none focus:border-indigo-600">
                      {RESOURCE_CATEGORIES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <button type="submit" disabled={uploading || !newFile}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {uploading ? <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> : <UniIcon name="plus" weight="bold" size={16} />} {uploading ? 'Publication…' : 'Publier'}
                    </button>
                  </div>
                  {uploadError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{uploadError}</p>}
                </form>
              </div>
              {/* Resources list */}
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-[#111827] flex items-center gap-1.5"><UniIcon name="library" size={16} className="text-indigo-600" /> Supports & Ressources</h2>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{resources.length} fichier{resources.length > 1 ? 's' : ''}</span>
                </div>
                {resourcesError && <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{resourcesError}</p>}
                <div className="divide-y divide-[#f9fafb]">
                  {resources.length === 0 && !resourcesError && <p className="text-sm text-[#9ca3af] py-4 text-center">Aucune ressource pour {course.code}. Publiez votre premier support ci-dessus.</p>}
                  {resources.map(f => {
                    const downloadUrl = libraryApi.downloadUrl(f)
                    return (
                      <div key={f.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <div className="h-8 w-8 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold shrink-0">{f.type || 'DOC'}</div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#111827]">{f.title}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <Badge variant="primary" className="text-[9px] py-0">{f.category || 'Support'}</Badge>
                              <span className="text-[10px] text-[#9ca3af]">{[f.size, formatDate(f.date)].filter(Boolean).join(' · ')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          {downloadUrl
                            ? <a href={downloadUrl} target="_blank" rel="noreferrer" title="Télécharger" className="rounded p-1 hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#374151]"><UniIcon name="download" weight="bold" size={16} /></a>
                            : <span title="Fiche sans fichier" className="rounded p-1 text-[#d1d5db]"><UniIcon name="download" weight="bold" size={16} /></span>}
                          <button onClick={() => void handleRemoveResource(f)} title="Retirer de la bibliothèque" className="rounded p-1 hover:bg-red-50 text-[#9ca3af] hover:text-red-500"><UniIcon name="trash" size={16} /></button>
                        </div>
                      </div>
                    )
                  })}
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
                  const final = currentAverage(s)
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f9fafb]">
                      <Avatar name={s.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#111827] text-sm">{s.name}</p>
                        <p className="text-xs text-[#9ca3af] font-mono">{s.matricule || 'Matricule non renseigné'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${final === null ? 'text-slate-400' : final >= 10 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>{final === null ? '—' : `${final}/20`}</p>
                        <Badge variant={final === null ? 'warning' : final >= 10 ? 'success' : 'danger'} className="text-[9px]">{final === null ? 'En attente' : final >= 10 ? 'Validé' : 'À renforcer'}</Badge>
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
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Devoirs publiés — {course.code}</h3>
                  <p className="text-xs text-[#9ca3af]">{statements.length ? `${statements.length} énoncé${statements.length > 1 ? 's' : ''} · ${students.length} inscrit${students.length > 1 ? 's' : ''}` : 'Les énoncés publiés ici apparaissent chez vos étudiants (web, mobile, desktop).'}</p>
                </div>
                <button onClick={() => { setPublishError(null); setStatementForm((form) => ({ ...form, open: !form.open })) }} aria-expanded={statementForm.open}
                  className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d4fa8]">
                  {statementForm.open ? <UniIcon name="close" weight="bold" size={14} /> : <UniIcon name="plus" weight="bold" size={14} />} {statementForm.open ? 'Annuler' : 'Nouveau devoir'}
                </button>
              </div>

              {statementForm.open && (
                <form onSubmit={(e) => void handlePublishStatement(e)} className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 animate-fade-in">
                  <input value={statementForm.title} onChange={(e) => setStatementForm((form) => ({ ...form, title: e.target.value }))} required maxLength={255}
                    placeholder="Titre du devoir (ex : TP2 — Requêtes SQL complexes)"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                  <textarea value={statementForm.description} onChange={(e) => setStatementForm((form) => ({ ...form, description: e.target.value }))} rows={3} maxLength={3000}
                    placeholder="Consignes, format attendu, critères de notation…"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-xs font-semibold text-[#374151]">Date limite
                      <input type="datetime-local" value={statementForm.due} onChange={(e) => setStatementForm((form) => ({ ...form, due: e.target.value }))} required
                        className="mt-1 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-normal outline-none focus:border-indigo-600" />
                    </label>
                    <label className="text-xs font-semibold text-[#374151]">Type
                      <select value={statementForm.type} onChange={(e) => setStatementForm((form) => ({ ...form, type: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-normal outline-none focus:border-indigo-600">
                        {STATEMENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-[#374151]">Barème (/…)
                      <input type="number" min="1" max="100" step="1" value={statementForm.maxScore} onChange={(e) => setStatementForm((form) => ({ ...form, maxScore: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-normal outline-none focus:border-indigo-600" />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-[#374151]">
                    <input type="checkbox" checked={statementForm.allowLate} onChange={(e) => setStatementForm((form) => ({ ...form, allowLate: e.target.checked }))} className="h-4 w-4 rounded border-[#d1d5db] text-indigo-600" />
                    Accepter les rendus en retard (signalés comme tels)
                  </label>
                  {publishError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{publishError}</p>}
                  <div className="flex justify-end">
                    <button type="submit" disabled={publishing}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                      {publishing ? <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> : <UniIcon name="upload" weight="bold" size={16} />} {publishing ? 'Publication…' : 'Publier le devoir'}
                    </button>
                  </div>
                </form>
              )}

              {statementsError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{statementsError}</p>}
              {statements.length === 0 && !statementsError && !statementForm.open && (
                <p className="rounded-lg border border-dashed border-[#e5e7eb] px-4 py-6 text-center text-sm text-[#9ca3af]">Aucun devoir publié pour {course.code}. Cliquez sur « Nouveau devoir » pour en créer un.</p>
              )}
              {statements.map((statement) => {
                const summary = summarizeStatement(statement, statement.submissions, students.length, now)
                const typeLabel = STATEMENT_TYPES.find((type) => type.value === statement.type)?.label ?? statement.type
                return (
                  <div key={statement.id} className="rounded-lg border border-[#e5e7eb] p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#111827] text-sm">{statement.title}</p>
                        <p className="text-[11px] text-[#9ca3af]">{typeLabel} · barème /{statement.maxScore}{statement.allowLate ? ' · retards acceptés' : ''}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={summary.phase === 'Corrigé' ? 'success' : summary.phase === 'Échéance passée' ? 'danger' : 'warning'}>{summary.phase}</Badge>
                        <button onClick={() => void handleRemoveStatement(statement)} title="Supprimer le devoir" className="rounded p-1 text-[#9ca3af] hover:bg-red-50 hover:text-red-500"><UniIcon name="trash" size={16} /></button>
                      </div>
                    </div>
                    {statement.description && <p className="mt-1.5 line-clamp-2 text-xs text-[#6b7280]">{statement.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#6b7280]">
                      <span className="flex items-center gap-1"><UniIcon name="agenda" size={14} className="text-[#9ca3af]" /> {formatDue(statement.dueDate)}</span>
                      <span className="flex items-center gap-1"><UniIcon name="upload" size={14} className="text-[#9ca3af]" /> {summary.submitted} rendu{summary.submitted > 1 ? 's' : ''}{students.length ? ` / ${students.length}` : ''}</span>
                      <span className="flex items-center gap-1"><UniIcon name="success" weight="fill" size={14} className="text-emerald-600" /> {summary.corrected} corrigé{summary.corrected > 1 ? 's' : ''}</span>
                      {summary.missing > 0 && summary.phase !== 'En cours' && <span className="flex items-center gap-1 text-amber-700"><UniIcon name="warning" weight="fill" size={14} /> {summary.missing} sans rendu</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f3f4f6] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Saisie des notes — {course.code}</h3>
                  <p className="text-xs text-[#9ca3af]">Coefficient : CC 30% / Examen 70% · Note /20</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary">Pondération 30/70</Badge>
                  <ExportButtons getDocument={gradesExport} disabled={students.length === 0} disabledReason="Aucun étudiant inscrit à exporter." />
                  <button onClick={() => void handleSaveGrades()} disabled={savingGrades || students.length === 0}
                    className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2d4fa8] transition-colors disabled:cursor-not-allowed disabled:opacity-60">
                    <UniIcon name="save" weight="bold" size={14} /> {savingGrades ? 'Enregistrement…' : 'Enregistrer les notes'}
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
                      const final = currentAverage(s)
                      const isValidated = final !== null && final >= 10
                      return (
                        <tr key={s.id} className="hover:bg-[#f9fafb]">
                          <td className="px-5 py-3 font-mono font-medium text-[#374151]">{s.matricule || '—'}</td>
                          <td className="px-5 py-3 font-semibold text-[#111827]">{s.name}</td>
                          <td className="px-5 py-3 text-center">
                            <input type="number" min="0" max="20" step="1" value={s.cc ?? ''}
                              onChange={e => updateGrade(s.id, 'cc', e.target.value)}
                              className="w-16 rounded border border-[#e5e7eb] px-2 py-1 text-center font-semibold text-[#111827] outline-none focus:border-[#1e3a8a]" />
                          </td>
                          <td className="px-5 py-3 text-center">
                            <input type="number" min="0" max="20" step="1" value={s.exam ?? ''}
                              onChange={e => updateGrade(s.id, 'exam', e.target.value)}
                              className="w-16 rounded border border-[#e5e7eb] px-2 py-1 text-center font-semibold text-[#111827] outline-none focus:border-[#1e3a8a]" />
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-sm text-[#111827]">{final === null ? '—' : `${final} / 20`}</td>
                          <td className="px-5 py-3 text-center">
                            <Badge variant={final === null ? 'warning' : isValidated ? 'success' : 'danger'}>{final === null ? 'En attente' : isValidated ? 'Validé' : 'À renforcer'}</Badge>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => void handleSaveGrades([s.id])} disabled={savingGrades} className="rounded p-1 hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#1e3a8a] disabled:opacity-50" title="Enregistrer cet apprenant">
                              <UniIcon name="save" weight="bold" size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-[#f3f4f6] bg-[#f9fafb] flex items-center justify-between gap-4">
                <p className="text-xs text-[#9ca3af] flex items-center gap-1.5"><UniIcon name="warning" weight="fill" size={14} className="text-amber-500 shrink-0" /> Les évaluations enregistrées sont immédiatement visibles dans le relevé Appwrite des apprenants.</p>
                <button onClick={() => void handleSaveGrades()} disabled={savingGrades || students.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60">
                  <UniIcon name="save" weight="bold" size={16} /> {savingGrades ? 'Enregistrement…' : 'Enregistrer la grille'}
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
