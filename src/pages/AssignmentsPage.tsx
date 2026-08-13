import { useState } from 'react'
import { Plus, Clock, CheckCircle, AlertCircle, FileText, ChevronRight, X, Loader2, RefreshCw, Upload, Search, Download, Check, Trash2, Award } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { AnimatedList } from '../components/ui/AnimatedList'
import { useApi } from '../hooks/useApi'
import { assignmentsApi, type Assignment } from '../lib/api'
import { useUserRole } from '../utils/userRole'
import { pushNotificationService } from '../services/pushNotificationService'
import PushNotificationControl from '../components/PushNotificationControl'

type AssignmentStatus = 'À rendre' | 'En retard' | 'Soumis' | 'Noté'

interface ExtendedAssignment extends Assignment {
  instructions?: string
  submittedAt?: string
  submittedFile?: string
  submissionNote?: string
  feedback?: string
}

const DEFAULT_ASSIGNMENTS: ExtendedAssignment[] = [
  {
    id: '1',
    title: 'TP 2 — Implémentation des graphes et algorithme de Dijkstra',
    code: 'INFO101',
    due: '2026-08-15',
    progress: 40,
    status: 'À rendre',
    description: 'Concevoir et implémenter en C/C++ les structures de données pour représenter un graphe orienté pondéré et calculer les plus courts chemins.',
    instructions: 'Le livrable doit comprendre : le code source commenté, le Makefile de compilation, et un rapport au format PDF expliquant la complexité algorithmique.',
  },
  {
    id: '2',
    title: 'Projet Synthèse — Développement PWA Offline-First',
    code: 'INFO201',
    due: '2026-08-20',
    progress: 75,
    status: 'À rendre',
    description: 'Créer une application web progressive avec IndexedDB et Service Worker pour la synchronisation en tâche de fond.',
    instructions: 'Déployez l\'application sur Cloud Run ou Vercel et fournissez le lien du dépôt GitHub avec un fichier README complet.',
  },
  {
    id: '3',
    title: 'TD 4 — Exercices sur les équations différentielles non linéaires',
    code: 'MATH101',
    due: '2026-08-01',
    progress: 0,
    status: 'En retard',
    description: 'Résolution analytique et approximations numériques d\'équations différentielles d\'ordre 2.',
    instructions: 'À remettre scanné en un seul document PDF propre et lisible.',
  },
  {
    id: '4',
    title: 'Mini-Projet — Analyse microéconomique des marchés émergents',
    code: 'ECO101',
    due: '2026-08-05',
    progress: 100,
    status: 'Soumis',
    submittedAt: '2026-08-04 18:30',
    submittedFile: 'Rapport_Eco_Nghomsi_V2.pdf',
    submissionNote: 'Veuillez trouver ci-joint notre étude empirique de marché.',
    description: 'Analyse comparative des comportements de consommation et de l\'élasticité prix.',
  },
  {
    id: '5',
    title: 'Évaluation 1 — Architecture des Systèmes Répartis',
    code: 'INFO301',
    due: '2026-07-28',
    progress: 100,
    status: 'Noté',
    grade: '17.5/20',
    feedback: 'Excellent travail! L\'analyse des mécanismes de consensus Raft et Paxos est très rigoureuse.',
    submittedAt: '2026-07-27 14:12',
    submittedFile: 'Examen_Architecture_Systemes.pdf',
    description: 'Étude théorique et mise en œuvre pratique de protocoles de consensus.',
  },
]

const statusMeta: Record<AssignmentStatus, { variant: 'warning' | 'danger' | 'success' | 'info'; icon: any; label: string }> = {
  'À rendre': { variant: 'warning', icon: Clock, label: 'À rendre' },
  'En retard': { variant: 'danger', icon: AlertCircle, label: 'En retard' },
  'Soumis': { variant: 'success', icon: CheckCircle, label: 'Soumis' },
  'Noté': { variant: 'info', icon: FileText, label: 'Noté' },
}

const summary = [
  { key: 'À rendre', color: 'text-[#d97706]', bg: 'bg-[#fef3c7]' },
  { key: 'En retard', color: 'text-[#dc2626]', bg: 'bg-[#fee2e2]' },
  { key: 'Soumis', color: 'text-[#059669]', bg: 'bg-[#d1fae5]' },
  { key: 'Noté', color: 'text-[#1d4ed8]', bg: 'bg-[#dbeafe]' },
] as const

export default function AssignmentsPage() {
  const { currentRole } = useUserRole()
  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin'

  const [filter, setFilter] = useState<AssignmentStatus | 'Tous'>('Tous')
  const [filterUE, setFilterUE] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modals state
  const [showNew, setShowNew] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<ExtendedAssignment | null>(null)
  const [localAssignments, setLocalAssignments] = useState<ExtendedAssignment[]>(() => {
    try {
      const saved = localStorage.getItem('uniflow_assignments')
      return saved ? JSON.parse(saved) : DEFAULT_ASSIGNMENTS
    } catch {
      return DEFAULT_ASSIGNMENTS
    }
  })

  const updateLocalAssignments = (newVal: ExtendedAssignment[] | ((prev: ExtendedAssignment[]) => ExtendedAssignment[])) => {
    setLocalAssignments(prev => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal
      try {
        localStorage.setItem('uniflow_assignments', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  // New Assignment form
  const [newTitle, setNewTitle] = useState('')
  const [newCode, setNewCode] = useState('INFO101')
  const [newDue, setNewDue] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Student submission modal form
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissionNote, setSubmissionNote] = useState('')
  const [submittingDevoir, setSubmittingDevoir] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Teacher grading form
  const [gradingScore, setGradingScore] = useState('16/20')
  const [gradingFeedback, setGradingFeedback] = useState('')

  const { data: apiData, loading, refetch } = useApi(() => assignmentsApi.mine())

  // Merge API data with default or local fallback
  const assignments: ExtendedAssignment[] = (apiData && apiData.length > 0)
    ? apiData.map(a => {
        const foundLocal = localAssignments.find(l => l.id === a.id)
        return foundLocal ? { ...a, ...foundLocal } : a
      })
    : localAssignments

  const filtered = assignments
    .filter(a => filter === 'Tous' || a.status === filter)
    .filter(a => !filterUE || a.code === filterUE)
    .filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.code.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const da = new Date(a.due).getTime(), db = new Date(b.due).getTime()
      return sortOrder === 'asc' ? da - db : db - da
    })

  const counts = {
    'À rendre': assignments.filter(a => a.status === 'À rendre').length,
    'En retard': assignments.filter(a => a.status === 'En retard').length,
    'Soumis': assignments.filter(a => a.status === 'Soumis').length,
    'Noté': assignments.filter(a => a.status === 'Noté').length,
  }

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newDue) return
    setSubmitting(true)
    try {
      await assignmentsApi.create({
        title: newTitle,
        code: newCode,
        due: newDue,
        progress: 0,
        status: 'À rendre',
        description: newDesc,
      })
    } catch {
      // Fallback local creation
    }

    const newItem: ExtendedAssignment = {
      id: String(Date.now()),
      title: newTitle,
      code: newCode,
      due: newDue,
      progress: 0,
      status: 'À rendre',
      description: newDesc || 'Aucune description fournie.',
      instructions: 'Respectez la date limite de rendu.',
    }

    // Trigger PWA Push Notification to students
    pushNotificationService.notifyNewAssignment({
      title: newTitle,
      courseName: newCode,
      dueDate: newDue
    }).catch(err => console.warn('Push notification error:', err))

    setLocalAssignments(prev => [newItem, ...prev])
    setNewTitle('')
    setNewDue('')
    setNewDesc('')
    setShowNew(false)
    setSubmitting(false)
    refetch()
  }

  const handleSubmitDevoir = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return
    setSubmittingDevoir(true)

    const fileName = submissionFile ? submissionFile.name : (selectedAssignment.submittedFile || 'Devoir_Rendu.pdf')
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)

    try {
      await assignmentsApi.submit(selectedAssignment.id, fileName)
    } catch {
      // Local fallback
    }

    setLocalAssignments(prev =>
      prev.map(a =>
        a.id === selectedAssignment.id
          ? {
              ...a,
              status: 'Soumis',
              progress: 100,
              submittedAt: nowStr,
              submittedFile: fileName,
              submissionNote: submissionNote || a.submissionNote || 'Travail remis dans les temps.',
            }
          : a
      )
    )

    setSelectedAssignment(prev =>
      prev
        ? {
            ...prev,
            status: 'Soumis',
            progress: 100,
            submittedAt: nowStr,
            submittedFile: fileName,
            submissionNote: submissionNote || prev.submissionNote || 'Travail remis dans les temps.',
          }
        : null
    )

    setSubmittingDevoir(false)
    setSubmitSuccess(true)
    setTimeout(() => setSubmitSuccess(false), 3000)
    refetch()
  }

  const handleGradeAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return

    setLocalAssignments(prev =>
      prev.map(a =>
        a.id === selectedAssignment.id
          ? {
              ...a,
              status: 'Noté',
              grade: gradingScore,
              feedback: gradingFeedback || 'Très bonne rédaction.',
            }
          : a
      )
    )

    setSelectedAssignment(prev =>
      prev
        ? {
            ...prev,
            status: 'Noté',
            grade: gradingScore,
            feedback: gradingFeedback || 'Très bonne rédaction.',
          }
        : null
    )
    alert('Note et remarques enregistrées avec succès !')
  }

  const handleDeleteAssignment = (id: string) => {
    if (!confirm('Voulez-vous supprimer ce devoir ?')) return
    setLocalAssignments(prev => prev.filter(a => a.id !== id))
    if (selectedAssignment?.id === id) setSelectedAssignment(null)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Mes devoirs & TPs</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Suivi des rendus et évaluations académiques</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PushNotificationControl compact />
          <button onClick={() => refetch()} className="rounded-lg border border-[#e5e7eb] p-2 text-[#6b7280] hover:bg-[#f9fafb]">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nouveau devoir
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou code d'UE..."
            className="w-full rounded-xl border border-[#e5e7eb] bg-white pl-9 pr-4 py-2 text-sm text-[#374151] outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#1e3a8a]"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="À rendre">À rendre</option>
            <option value="En retard">En retard</option>
            <option value="Soumis">Soumis</option>
            <option value="Noté">Noté</option>
          </select>
          <select
            value={filterUE}
            onChange={e => setFilterUE(e.target.value)}
            className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#1e3a8a]"
          >
            <option value="">Toutes les UE</option>
            {Array.from(new Set(assignments.map(a => a.code))).map(code => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#1e3a8a]"
          >
            <option value="asc">Date ↑ (Proches)</option>
            <option value="desc">Date ↓ (Éloignées)</option>
          </select>
          {(filter !== 'Tous' || filterUE || searchQuery) && (
            <button
              onClick={() => {
                setFilter('Tous')
                setFilterUE('')
                setSearchQuery('')
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold text-[#374151] hover:bg-red-50 hover:text-red-600 transition-all"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {summary.map(({ key, color, bg }) => (
          <button
            key={key}
            onClick={() => setFilter(prev => (prev === key ? 'Tous' : (key as AssignmentStatus)))}
            className={`rounded-xl border p-4 text-left transition-all shadow-sm hover:shadow-md ${
              filter === key ? 'border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20 ' + bg : 'border-[#e5e7eb] bg-white'
            }`}
          >
            <p className={`text-3xl font-extrabold ${color}`}>{counts[key as AssignmentStatus]}</p>
            <p className="text-xs font-semibold text-[#6b7280] mt-0.5">{key}</p>
          </button>
        ))}
      </div>

      {/* Assignment List */}
      <div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d1d5db] bg-white py-16 text-[#9ca3af]">
            <FileText className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-semibold text-[#374151]">Aucun devoir ne correspond à vos critères.</p>
            <p className="text-xs text-[#9ca3af] mt-1">Essayez de modifier vos filtres ou d'ajouter un nouveau devoir.</p>
          </div>
        ) : (
          <AnimatedList
            items={filtered}
            showGradients
            enableArrowNavigation
            displayScrollbar={false}
            className="max-h-[calc(100vh-420px)] space-y-3"
            renderItem={(a: ExtendedAssignment) => {
              const meta = statusMeta[a.status] || statusMeta['À rendre']
              const StatusIcon = meta.icon
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAssignment(a)}
                  className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm hover:shadow-md hover:border-[#1e3a8a]/40 transition-all cursor-pointer"
                >
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge variant="primary">{a.code}</Badge>
                      <Badge variant={meta.variant}>
                        <StatusIcon className="h-3 w-3 mr-1 inline" />
                        {meta.label}
                      </Badge>
                      {a.grade && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1e3a8a] bg-[#eff3ff] rounded-md px-2.5 py-0.5 border border-[#1e3a8a]/20">
                          <Award className="h-3 w-3 text-[#1e3a8a]" /> Note : {a.grade}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#111827] text-sm group-hover:text-[#1e3a8a] transition-colors">{a.title}</h3>
                    <p className="text-xs text-[#6b7280] mt-1 line-clamp-1">{a.description || 'Devoir pratique'}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-[#9ca3af]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#1e3a8a]" /> Échéance : {a.due}
                      </span>
                      {a.submittedAt && (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <Check className="h-3.5 w-3.5" /> Rendu le {a.submittedAt}
                        </span>
                      )}
                    </div>
                    {a.progress > 0 && a.status !== 'Noté' && a.status !== 'Soumis' && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-1.5 flex-1 max-w-xs rounded-full bg-[#f3f4f6] overflow-hidden">
                          <div className="h-full rounded-full bg-[#0d9488] transition-all" style={{ width: `${a.progress}%` }} />
                        </div>
                        <span className="text-xs font-medium text-[#6b7280]">{a.progress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedAssignment(a)
                      }}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        a.status === 'À rendre' || a.status === 'En retard'
                          ? 'bg-[#1e3a8a] text-white hover:bg-[#2d4fa8] shadow-sm'
                          : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]'
                      }`}
                    >
                      {a.status === 'À rendre' || a.status === 'En retard' ? 'Rendre le devoir' : 'Voir le détail'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    {isTeacherOrAdmin && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteAssignment(a.id)
                        }}
                        className="rounded-xl p-2 text-[#9ca3af] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            }}
          />
        )}
      </div>

      {/* Assignment Detail & Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-[#f3f4f6] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{selectedAssignment.code}</Badge>
                  <Badge variant={statusMeta[selectedAssignment.status]?.variant || 'warning'}>
                    {selectedAssignment.status}
                  </Badge>
                </div>
                <h2 className="text-lg font-extrabold text-[#111827]">{selectedAssignment.title}</h2>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="rounded-lg p-1.5 hover:bg-[#f3f4f6] text-[#9ca3af]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4 text-sm text-[#374151]">
              <div className="rounded-xl bg-[#f9fafb] border border-[#e5e7eb] p-4 space-y-2">
                <p className="font-bold text-xs uppercase text-[#6b7280] tracking-wider">Description & Instructions</p>
                <p>{selectedAssignment.description || 'Aucune description détaillée.'}</p>
                {selectedAssignment.instructions && (
                  <p className="text-xs text-[#1e3a8a] font-medium bg-[#eff3ff] p-2.5 rounded-lg border border-[#1e3a8a]/10">
                    💡 <strong>Consignes :</strong> {selectedAssignment.instructions}
                  </p>
                )}
                <p className="text-xs text-[#9ca3af] pt-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#1e3a8a]" /> Date limite de remise : <strong>{selectedAssignment.due}</strong>
                </p>
              </div>

              {/* Status or Grade info */}
              {selectedAssignment.grade && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <Award className="h-4 w-4" /> Note attribuée :
                    </span>
                    <span className="text-base font-extrabold text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-300">
                      {selectedAssignment.grade}
                    </span>
                  </div>
                  {selectedAssignment.feedback && (
                    <p className="text-xs text-emerald-900 mt-2">
                      <strong>Remarque de l'enseignant :</strong> {selectedAssignment.feedback}
                    </p>
                  )}
                </div>
              )}

              {/* Submitted File View */}
              {selectedAssignment.submittedFile && (
                <div className="rounded-xl border border-[#e5e7eb] p-4 bg-white space-y-2">
                  <p className="font-bold text-xs uppercase text-[#6b7280]">Fichier soumis</p>
                  <div className="flex items-center justify-between bg-[#f9fafb] p-3 rounded-lg border border-[#e5e7eb]">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-5 w-5 text-[#1e3a8a]" />
                      <div>
                        <p className="font-semibold text-xs text-[#111827]">{selectedAssignment.submittedFile}</p>
                        <p className="text-[11px] text-[#9ca3af]">Soumis le {selectedAssignment.submittedAt || 'récemment'}</p>
                      </div>
                    </div>
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault()
                        alert(`Téléchargement de ${selectedAssignment.submittedFile}...`)
                      }}
                      className="flex items-center gap-1 rounded-lg bg-[#1e3a8a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d4fa8]"
                    >
                      <Download className="h-3.5 w-3.5" /> Télécharger
                    </a>
                  </div>
                  {selectedAssignment.submissionNote && (
                    <p className="text-xs text-[#6b7280] italic">« {selectedAssignment.submissionNote} »</p>
                  )}
                </div>
              )}

              {/* Submission Form (Student Mode) */}
              {(selectedAssignment.status === 'À rendre' || selectedAssignment.status === 'En retard' || selectedAssignment.status === 'Soumis') && (
                <form onSubmit={handleSubmitDevoir} className="rounded-xl border border-[#e5e7eb] p-4 bg-[#fcfdfe] space-y-3">
                  <p className="font-bold text-xs uppercase text-[#1e3a8a] tracking-wider">
                    {selectedAssignment.status === 'Soumis' ? 'Remplacer ou mettre à jour la soumission' : 'Déposer votre travail'}
                  </p>

                  {submitSuccess && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-100 p-3 text-xs font-bold text-emerald-800">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      Devoir soumis avec succès !
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">Fichier (PDF, ZIP, DOCX)</label>
                    <input
                      type="file"
                      onChange={e => setSubmissionFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-[#e5e7eb] bg-white p-2 text-xs text-[#374151] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eff3ff] file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#1e3a8a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">Notes ou commentaires (optionnel)</label>
                    <textarea
                      rows={2}
                      value={submissionNote}
                      onChange={e => setSubmissionNote(e.target.value)}
                      placeholder="Ajoutez une remarque pour l'enseignant..."
                      className="w-full rounded-xl border border-[#e5e7eb] p-2.5 text-xs outline-none focus:border-[#1e3a8a]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingDevoir}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#1e3a8a] py-2.5 text-xs font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-sm"
                  >
                    {submittingDevoir ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {selectedAssignment.status === 'Soumis' ? 'Mettre à jour le fichier' : 'Soumettre le devoir'}
                  </button>
                </form>
              )}

              {/* Teacher Grading Panel */}
              {isTeacherOrAdmin && (
                <form onSubmit={handleGradeAssignment} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                  <p className="font-bold text-xs uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                    <Award className="h-4 w-4" /> Espace Enseignant — Évaluation
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">Note (ex: 18/20)</label>
                      <input
                        type="text"
                        value={gradingScore}
                        onChange={e => setGradingScore(e.target.value)}
                        className="w-full rounded-xl border border-[#e5e7eb] bg-white p-2 text-xs font-bold outline-none focus:border-[#1e3a8a]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#374151] mb-1">Commentaires de correction</label>
                      <input
                        type="text"
                        value={gradingFeedback}
                        onChange={e => setGradingFeedback(e.target.value)}
                        placeholder="Ex: Excellent travail, code très bien structuré."
                        className="w-full rounded-xl border border-[#e5e7eb] bg-white p-2 text-xs outline-none focus:border-[#1e3a8a]"
                      />
                    </div>
                  </div>
                  <button type="submit" className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800">
                    Enregistrer la note
                  </button>
                </form>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#f3f4f6]">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="rounded-xl border border-[#e5e7eb] px-5 py-2 text-xs font-bold text-[#374151] hover:bg-[#f9fafb]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Assignment Creation Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3">
              <h2 className="text-base font-bold text-[#111827]">Nouveau devoir / TP</h2>
              <button onClick={() => setShowNew(false)} className="rounded-lg p-1.5 hover:bg-[#f3f4f6] text-[#9ca3af]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1 uppercase tracking-wider">Titre du devoir</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  placeholder="Ex: TP Algo — Algorithme de Dijkstra"
                  className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1 uppercase tracking-wider">UE</label>
                  <select
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#1e3a8a]"
                  >
                    {['INFO101', 'INFO201', 'INFO301', 'ECO101', 'MATH101'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1 uppercase tracking-wider">Date limite</label>
                  <input
                    type="date"
                    value={newDue}
                    onChange={e => setNewDue(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#1e3a8a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1 uppercase tracking-wider">Description & Consignes</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Précisez les objectifs et consignes de rendu..."
                  className="w-full rounded-xl border border-[#e5e7eb] p-3 text-xs outline-none focus:border-[#1e3a8a]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="flex-1 rounded-xl border border-[#e5e7eb] py-2.5 text-xs font-bold text-[#374151] hover:bg-[#f9fafb]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#1e3a8a] py-2.5 text-xs font-bold text-white hover:bg-[#2d4fa8] shadow-sm flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Créer le devoir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
