import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  FileText,
  Download,
  Upload,
  Sparkles,
  Search,
  BarChart3,
  BookOpen,
  UserCheck,
  Award,
  Send,
  SlidersHorizontal,
} from 'lucide-react'

type AssessmentType = 'CC' | 'TP' | 'EXAMEN_NORMAL' | 'RATTRAPAGE'

interface StudentSubmission {
  id: string
  studentName: string
  matricule: string
  submittedAt: string
  fileName: string
  codeExcerpt: string
  rubricScores: {
    architecture: number // /6
    implementation: number // /8
    tests: number // /4
    documentation: number // /2
  }
  feedback: string
  status: 'CORRIGÉ' | 'À CORRIGER'
}

const UES = [
  { code: 'INF301', title: 'Systèmes Distribués & Consensus Raft (L3 Info)' },
  { code: 'INF304', title: 'Intelligence Artificielle & Apprentissage (L3 Info)' },
  { code: 'INF202', title: 'Structures de Données & Algorithmique (L2 Info)' },
]

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    studentName: 'Ravel Nghomsi',
    matricule: '22U2418',
    submittedAt: '14 Oct. 2026 · 16:40',
    fileName: 'TP2_Raft_Consensus_22U2418.pdf',
    codeExcerpt: `// Implémentation de l'élection du Leader Raft (Node UY1)
async function requestVote(term: number, candidateId: string): Promise<VoteResult> {
  if (term < currentTerm) return { term: currentTerm, voteGranted: false };
  if (votedFor === null || votedFor === candidateId) {
    votedFor = candidateId;
    resetElectionTimer();
    return { term: currentTerm, voteGranted: true };
  }
  return { term: currentTerm, voteGranted: false };
}`,
    rubricScores: { architecture: 5.5, implementation: 7.5, tests: 3.5, documentation: 2.0 },
    feedback: 'Excellente maîtrise du protocole Raft et gestion rigoureuse des délais d’élection.',
    status: 'CORRIGÉ',
  },
  {
    id: 'sub-2',
    studentName: 'Aïcha Bello',
    matricule: '22U2094',
    submittedAt: '14 Oct. 2026 · 17:12',
    fileName: 'TP2_Raft_Consensus_22U2094.pdf',
    codeExcerpt: `// Réplication du journal AppendEntries RPC
export function handleAppendEntries(entries: LogEntry[], leaderCommit: number) {
  for (const entry of entries) {
    stateMachineLog.push(entry);
  }
  commitIndex = Math.min(leaderCommit, stateMachineLog.length - 1);
  return { success: true, matchIndex: commitIndex };
}`,
    rubricScores: { architecture: 5.0, implementation: 6.5, tests: 3.0, documentation: 1.5 },
    feedback: 'Très bon travail sur la réplication de log. Pensez à vérifier prevLogIndex.',
    status: 'CORRIGÉ',
  },
  {
    id: 'sub-3',
    studentName: 'Franck Kamga',
    matricule: '22U2188',
    submittedAt: '14 Oct. 2026 · 18:05',
    fileName: 'TP2_Raft_Consensus_22U2188.pdf',
    codeExcerpt: `// Gestion de la tolérance aux pannes réseau
function checkQuorum(acks: number, clusterSize: number): boolean {
  const majority = Math.floor(clusterSize / 2) + 1;
  return acks >= majority;
}`,
    rubricScores: { architecture: 4.5, implementation: 5.5, tests: 2.5, documentation: 1.5 },
    feedback: 'Bonnes bases. Ajoutez les tests unitaires de partitionnement réseau.',
    status: 'À CORRIGER',
  },
  {
    id: 'sub-4',
    studentName: 'Clarisse Mebenga',
    matricule: '22U2310',
    submittedAt: '14 Oct. 2026 · 19:20',
    fileName: 'TP2_Raft_Consensus_22U2310.pdf',
    codeExcerpt: `// Sérialisation des états de nœuds (Follower, Candidate, Leader)
type NodeRole = 'FOLLOWER' | 'CANDIDATE' | 'LEADER';
export class ClusterNode {
  role: NodeRole = 'FOLLOWER';
  currentTerm = 1;
}`,
    rubricScores: { architecture: 5.0, implementation: 7.0, tests: 3.5, documentation: 1.5 },
    feedback: 'Architecture claire et modulaire. Documentation exemplaire.',
    status: 'CORRIGÉ',
  },
  {
    id: 'sub-5',
    studentName: 'Junior Tchoumi',
    matricule: '22U2512',
    submittedAt: '14 Oct. 2026 · 21:10',
    fileName: 'TP2_Raft_Consensus_22U2512.pdf',
    codeExcerpt: `// Simulation de latence inter-nœuds LAN
const latencyMs = Math.random() * 15 + 5;
setTimeout(() => sendHeartbeat(), latencyMs);`,
    rubricScores: { architecture: 3.5, implementation: 4.5, tests: 2.0, documentation: 1.0 },
    feedback: 'Le heartbeat fonctionne mais la persistance sur disque reste à compléter.',
    status: 'À CORRIGER',
  },
]

function totalScore(r: StudentSubmission['rubricScores']): number {
  return Number((r.architecture + r.implementation + r.tests + r.documentation).toFixed(2))
}

export default function TeacherGradingPage() {
  const [selectedUe, setSelectedUe] = useState(UES[0].code)
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('TP')
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS)
  const [selectedId, setSelectedId] = useState<string>(INITIAL_SUBMISSIONS[0].id)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const activeSub = useMemo(
    () => submissions.find((s) => s.id === selectedId) ?? submissions[0],
    [submissions, selectedId]
  )

  const filteredSubmissions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return submissions
    return submissions.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q)
    )
  }, [submissions, search])

  const stats = useMemo(() => {
    const scores = submissions.map((s) => totalScore(s.rubricScores))
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const max = Math.max(...scores)
    const min = Math.min(...scores)
    const gradedCount = submissions.filter((s) => s.status === 'CORRIGÉ').length
    const passCount = scores.filter((sc) => sc >= 10).length
    return {
      avg: avg.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      gradedCount,
      passRate: Math.round((passCount / scores.length) * 100),
    }
  }, [submissions])

  const updateRubric = (
    key: keyof StudentSubmission['rubricScores'],
    value: number,
    maxVal: number
  ) => {
    const clamped = Math.max(0, Math.min(maxVal, value))
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === activeSub.id
          ? {
              ...s,
              rubricScores: {
                ...s.rubricScores,
                [key]: clamped,
              },
            }
          : s
      )
    )
  }

  const updateFeedback = (text: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === activeSub.id ? { ...s, feedback: text } : s))
    )
  }

  const handleValidateGrade = () => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === activeSub.id ? { ...s, status: 'CORRIGÉ' } : s))
    )
    triggerToast(
      `Note de ${totalScore(activeSub.rubricScores)}/20 enregistrée et publiée pour ${activeSub.studentName} (${activeSub.matricule}) !`
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-bold text-white shadow-xl border border-teal-500/40">
          <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header & UE / Assessment Type Selector */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#1d4ed8] to-[#0D9488] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-100">
              <Award className="h-4 w-4" />
              <span>Espace Enseignant · Évaluations & Correction des Devoirs</span>
            </div>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Atelier de Correction & Barème Détaillé (/20)
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-2xl">
              Sélectionnez l’Unité d’Enseignement, le type d’évaluation (CC, TP, Examen Normal, Rattrapage) et notez les copies avec barème analytique.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => triggerToast('Modèle CSV/Excel des notes importé avec succès !')}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 border border-white/25 px-4 py-2.5 text-xs font-black text-white hover:bg-white/25"
            >
              <Upload className="h-4 w-4" />
              <span>Import CSV / Excel</span>
            </button>
            <button
              type="button"
              onClick={() => triggerToast(`Procès-verbal des notes ${selectedUe} (${assessmentType}) exporté en PDF !`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-[#1E3A8A] shadow-md hover:bg-blue-50"
            >
              <Download className="h-4 w-4" />
              <span>Exporter PV Officiel</span>
            </button>
          </div>
        </div>

        {/* Selector Controls + Class Distribution Stats */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-950/30 p-3.5 border border-white/15">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-teal-200 mb-1">
                Unité d’Enseignement (UE)
              </label>
              <select
                value={selectedUe}
                onChange={(e) => setSelectedUe(e.target.value)}
                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-black text-[#1E3A8A]"
              >
                {UES.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.code} — {u.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-teal-200 mb-1">
                Type d’évaluation
              </label>
              <div className="inline-flex rounded-xl bg-white/10 p-1 gap-1">
                {(
                  [
                    { id: 'CC', label: 'CC (30%)' },
                    { id: 'TP', label: 'TP (20%)' },
                    { id: 'EXAMEN_NORMAL', label: 'Examen (50%)' },
                    { id: 'RATTRAPAGE', label: 'Rattrapage' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAssessmentType(t.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-black transition-all ${
                      assessmentType === t.id
                        ? 'bg-[#F59E0B] text-slate-950 shadow'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Class Grade Distribution Stats */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center">
              <p className="text-[10px] font-bold text-blue-100">Moyenne</p>
              <p className="mt-0.5 text-lg font-black text-amber-300">{stats.avg} / 20</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center">
              <p className="text-[10px] font-bold text-blue-100">Note Max</p>
              <p className="mt-0.5 text-lg font-black text-emerald-300">{stats.max} / 20</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center">
              <p className="text-[10px] font-bold text-blue-100">Taux Réussite</p>
              <p className="mt-0.5 text-lg font-black text-white">{stats.passRate}%</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center">
              <p className="text-[10px] font-bold text-blue-100">Copies Corrigées</p>
              <p className="mt-0.5 text-lg font-black text-teal-200">
                {stats.gradedCount} / {submissions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Split View: Student Submissions List (Left) + Document Preview & Rubric (Right) */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left List */}
        <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher étudiant ou matricule…"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold focus:border-[#1E3A8A] focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredSubmissions.map((sub) => {
              const score = totalScore(sub.rubricScores)
              const active = sub.id === activeSub.id
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedId(sub.id)}
                  className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                    active
                      ? 'border-[#1E3A8A] bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-slate-900">{sub.studentName}</p>
                    <span
                      className={`rounded-lg px-2 py-0.5 text-xs font-black ${
                        score >= 14
                          ? 'bg-emerald-100 text-emerald-800'
                          : score >= 10
                            ? 'bg-blue-100 text-[#1E3A8A]'
                            : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {score.toFixed(2)} / 20
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono font-bold text-[#1E3A8A]">{sub.matricule}</span>
                    <span>{sub.submittedAt}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="truncate text-[11px] text-slate-500 max-w-[180px]">
                      {sub.fileName}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                        sub.status === 'CORRIGÉ'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Submission Preview + Rubric (/20) + Feedback */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-[#1E3A8A] px-2.5 py-0.5 font-mono text-xs font-black text-white">
                  {activeSub.matricule}
                </span>
                <h2 className="text-lg font-black text-slate-900">{activeSub.studentName}</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Fichier remis : <strong>{activeSub.fileName}</strong> · Remis le {activeSub.submittedAt}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2 text-right">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Note Finale Calculée
                </span>
                <span className="text-2xl font-black text-[#1E3A8A]">
                  {totalScore(activeSub.rubricScores).toFixed(2)} <small className="text-xs">/ 20</small>
                </span>
              </div>
            </div>
          </div>

          {/* Document & Code Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <FileText className="h-4 w-4 text-[#0D9488]" /> Aperçu du livrable étudiant ({activeSub.fileName})
              </span>
              <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-black text-[#0D9488]">
                Anti-plagiat Sentinelle : 98% Original
              </span>
            </div>
            <pre className="overflow-x-auto rounded-2xl bg-[#0F172A] p-4 font-mono text-xs text-teal-200 leading-relaxed border border-slate-800">
              <code>{activeSub.codeExcerpt}</code>
            </pre>
          </div>

          {/* Analytical Rubric Sliders (/20) */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#1E3A8A]" />
              <span>Grille d’Évaluation & Barème Analytique (/20 points)</span>
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  {
                    key: 'architecture',
                    label: '1. Modélisation & Architecture Distribuée',
                    max: 6,
                  },
                  {
                    key: 'implementation',
                    label: '2. Qualité du Code & Algorithme de Consensus',
                    max: 8,
                  },
                  {
                    key: 'tests',
                    label: '3. Jeux de Tests & Tolérance aux Pannes',
                    max: 4,
                  },
                  {
                    key: 'documentation',
                    label: '4. Rapport Technique & Clarté',
                    max: 2,
                  },
                ] as const
              ).map((crit) => {
                const val = activeSub.rubricScores[crit.key]
                return (
                  <div
                    key={crit.key}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">{crit.label}</span>
                      <span className="font-black text-[#1E3A8A]">
                        {val} / {crit.max} pts
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={crit.max}
                      step={0.5}
                      value={val}
                      onChange={(e) =>
                        updateRubric(crit.key, parseFloat(e.target.value), crit.max)
                      }
                      className="w-full accent-[#1E3A8A]"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Feedback & Save */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700">
              Appréciation pédagogique & Commentaire détaillé pour l’étudiant :
            </label>
            <textarea
              rows={3}
              value={activeSub.feedback}
              onChange={(e) => updateFeedback(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 p-3.5 text-xs font-medium text-slate-800 focus:border-[#1E3A8A] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                updateFeedback(
                  'Correction assistée Sentinelle : Implémentation conforme aux spécifications Raft. Bonne gestion du quorum.'
                )
                triggerToast('Suggestion d’appréciation générée par Sentinelle IA !')
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-extrabold text-[#0D9488] hover:bg-teal-100"
            >
              <Sparkles className="h-4 w-4" />
              <span>Suggérer une appréciation IA</span>
            </button>

            <button
              type="button"
              onClick={handleValidateGrade}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1E3A8A] px-6 py-3 text-xs font-black text-white shadow-md hover:bg-blue-900"
            >
              <Send className="h-4 w-4 text-amber-300" />
              <span>Valider & Publier la note ({totalScore(activeSub.rubricScores).toFixed(2)}/20)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
