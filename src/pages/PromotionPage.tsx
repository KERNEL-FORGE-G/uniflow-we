import { useState, useEffect } from 'react'
import { 
  Award, ShieldCheck, CheckCircle2, Clock, AlertCircle, 
  GraduationCap, BookOpen, Send, Sparkles, FileText, 
  UserCheck, ArrowRight, ChevronRight, CheckCircle, XCircle
} from 'lucide-react'
import { useUserRole } from '../utils/userRole'

interface Candidacy {
  id: string
  type: 'global' | 'ue'
  ueCode?: string
  ueName?: string
  level: string
  motivation: string
  projects: string
  gpa: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

const DEFAULT_LEVEL_UES: Record<string, { code: string; name: string }[]> = {
  'L1': [
    { code: 'UE01', name: 'Algorithmique & Initiation à la Programmation' },
    { code: 'UE02', name: 'Architecture des Ordinateurs & Systèmes' },
    { code: 'UE03', name: 'Mathématiques & Logique Informatique' },
    { code: 'UE04', name: 'Anglais & Communication Web' },
  ],
  'L2': [
    { code: 'UE01', name: 'Structures de Données & POO (C++/Java)' },
    { code: 'UE02', name: 'Bases de Données Relationnelles & SQL' },
    { code: 'UE03', name: 'Réseaux Informatiques & Protocoles' },
    { code: 'UE04', name: 'Probabilités & Statistiques pour l\'Ingénieur' },
  ],
  'L3': [
    { code: 'UE01', name: 'Programmation Web Avancée & Frameworks' },
    { code: 'UE02', name: 'Administration Systèmes & Réseaux Linux' },
    { code: 'UE03', name: 'Intelligence Artificielle & Machine Learning' },
    { code: 'UE04', name: 'Sécurité Informatique & Cryptographie' },
  ],
  'M1': [
    { code: 'UE01', name: 'Génie Logiciel & Microservices' },
    { code: 'UE02', name: 'Data Science & Big Data Analytics' },
    { code: 'UE03', name: 'Cloud Computing & DevOps' },
  ],
  'M2': [
    { code: 'UE01', name: 'Management des Systèmes d\'Information' },
    { code: 'UE02', name: 'Cybersécurité Avancée & Audit' },
  ]
}

export default function PromotionPage() {
  const { currentUser, currentRole: role, setCurrentRole: setRole } = useUserRole()
  const userLevel = currentUser.level || 'L3'

  // Load custom student enrolled UEs from localStorage or fallback to level defaults
  const [availableUEs, setAvailableUEs] = useState<{ code: string; name: string }[]>([])
  
  const [candidacies, setCandidacies] = useState<Candidacy[]>([])
  const [formType, setFormType] = useState<'global' | 'ue'>('global')
  const [selectedUE, setSelectedUE] = useState<string>('')
  const [motivation, setMotivation] = useState('')
  const [projects, setProjects] = useState('')
  const [gpa, setGpa] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Initialize UEs and saved candidacies
  useEffect(() => {
    // Check if student selected specific UEs in Settings
    let studentUEs: any[] = []
    try {
      const saved = localStorage.getItem('uniflow_student_ues')
      if (saved) {
        studentUEs = JSON.parse(saved)
      }
    } catch {}

    if (Array.isArray(studentUEs) && studentUEs.length > 0) {
      setAvailableUEs(studentUEs)
      setSelectedUE(studentUEs[0].code)
    } else {
      const defaults = DEFAULT_LEVEL_UES[userLevel] || DEFAULT_LEVEL_UES['L3']
      setAvailableUEs(defaults)
      setSelectedUE(defaults[0].code)
    }

    // Load saved candidacies
    try {
      const savedCand = localStorage.getItem('uniflow_candidacies')
      if (savedCand) {
        setCandidacies(JSON.parse(savedCand))
      } else {
        // Initial sample candidacy
        const sample: Candidacy = {
          id: 'cand-1',
          type: 'global',
          level: userLevel,
          motivation: 'Volonté de faciliter la transmission des supports de cours et d\'harmoniser la communication entre la promo et les enseignants.',
          projects: 'Mise en place de séances de révision partagées et remontée rapide des absences.',
          gpa: '15.4/20',
          submittedAt: new Date().toLocaleDateString('fr-FR'),
          status: 'pending'
        }
        setCandidacies([sample])
        localStorage.setItem('uniflow_candidacies', JSON.stringify([sample]))
      }
    } catch {}
  }, [userLevel])

  // Save candidacies helper
  const saveCandidacies = (list: Candidacy[]) => {
    setCandidacies(list)
    try {
      localStorage.setItem('uniflow_candidacies', JSON.stringify(list))
    } catch {}
  }

  // Submit new candidacy
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!motivation.trim() || motivation.length < 15) {
      setErrorMsg('Veuillez détailler vos motivations (au moins 15 caractères).')
      return
    }

    if (!agreed) {
      setErrorMsg('Veuillez accepter l\'engagement de responsabilité des délégués.')
      return
    }

    const ueObj = availableUEs.find(u => u.code === selectedUE)

    const newCand: Candidacy = {
      id: `cand-${Date.now()}`,
      type: formType,
      ueCode: formType === 'ue' ? ueObj?.code : undefined,
      ueName: formType === 'ue' ? ueObj?.name : undefined,
      level: userLevel,
      motivation: motivation.trim(),
      projects: projects.trim(),
      gpa: gpa.trim() || 'Non renseignée',
      submittedAt: new Date().toLocaleDateString('fr-FR'),
      status: 'pending'
    }

    const updated = [newCand, ...candidacies]
    saveCandidacies(updated)

    setMotivation('')
    setProjects('')
    setGpa('')
    setAgreed(false)
    setSuccessMsg('Votre candidature a été soumise avec succès ! Elle est en cours de révision par la scolarité.')

    setTimeout(() => setSuccessMsg(null), 5000)
  }

  // Fast-track demo validation
  const handleApproveCand = (id: string) => {
    const updated = candidacies.map(c => c.id === id ? { ...c, status: 'approved' as const } : c)
    saveCandidacies(updated)
    setRole('delegate')
    setSuccessMsg('Félicitations ! Votre candidature a été approuvée. Votre rôle a été promu en "Délégué de classe".')
    setTimeout(() => setSuccessMsg(null), 6000)
  }

  const handleWithdrawCand = (id: string) => {
    const updated = candidacies.filter(c => c.id !== id)
    saveCandidacies(updated)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-amber-300 border border-white/20 mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Espace Candidature & Promotion
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Postuler pour être Délégué
            </h1>
            <p className="mt-1.5 text-sm text-slate-100 font-medium leading-relaxed">
              Représentez votre niveau (<strong className="text-amber-300">{userLevel} Informatique</strong>) ou soyez délégué référent pour une Unité d'Enseignement (UE) spécifique.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-right min-w-[200px]">
            <p className="text-xs text-slate-200">Statut actuel sur UniFlow</p>
            <div className="mt-1 flex items-center justify-end gap-2 font-black text-lg text-white">
              <ShieldCheck className="h-5 w-5 text-teal-300" />
              {role === 'delegate' ? 'Délégué Officiel' : role === 'teacher' ? 'Enseignant' : 'Étudiant'}
            </div>
            <p className="text-[11px] text-teal-200 mt-0.5">
              {role === 'delegate' ? 'Accès émargement QR & rapports activés' : 'Peut soumettre une candidature'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a]/10 dark:bg-teal-500/10 text-[#1e3a8a] dark:text-teal-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg">Nouvelle Candidature</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choisissez le type de rôle que vous souhaitez exercer</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              
              {/* Type Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  Type de Délégué
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  
                  {/* Global */}
                  <button
                    type="button"
                    onClick={() => setFormType('global')}
                    className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${
                      formType === 'global'
                        ? 'border-[#1e3a8a] dark:border-teal-400 bg-blue-50/60 dark:bg-teal-950/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <GraduationCap className={`h-5 w-5 ${formType === 'global' ? 'text-[#1e3a8a] dark:text-teal-400' : 'text-slate-400'}`} />
                      {formType === 'global' && <CheckCircle className="h-4 w-4 text-[#1e3a8a] dark:text-teal-400" />}
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Délégué Global</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Représente la totalité du niveau ({userLevel}) auprès de l'administration et gère les plannings généraux.
                    </span>
                  </button>

                  {/* UE Specific */}
                  <button
                    type="button"
                    onClick={() => setFormType('ue')}
                    className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${
                      formType === 'ue'
                        ? 'border-[#1e3a8a] dark:border-teal-400 bg-blue-50/60 dark:bg-teal-950/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className={`h-5 w-5 ${formType === 'ue' ? 'text-[#1e3a8a] dark:text-teal-400' : 'text-slate-400'}`} />
                      {formType === 'ue' && <CheckCircle className="h-4 w-4 text-[#1e3a8a] dark:text-teal-400" />}
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Délégué d'UE</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Référent pédagogique pour une Unité d'Enseignement (UE) spécifique à laquelle vous participez.
                    </span>
                  </button>

                </div>
              </div>

              {/* UE Selector if UE type chosen */}
              {formType === 'ue' && (
                <div className="rounded-xl border border-blue-200 dark:border-teal-800/80 bg-blue-50/50 dark:bg-teal-950/20 p-4 space-y-2 animate-fade-in">
                  <label className="block text-xs font-bold text-[#1e3a8a] dark:text-teal-300">
                    Sélectionner l'Unité d'Enseignement (UE)
                  </label>
                  <select
                    value={selectedUE}
                    onChange={e => setSelectedUE(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400"
                  >
                    {availableUEs.map(ue => (
                      <option key={ue.code} value={ue.code}>
                        [{ue.code}] — {ue.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Vous pouvez modifier vos UEs suivies dans l'onglet <strong className="text-slate-700 dark:text-slate-300">Paramètres &gt; Inscriptions UEs</strong>.
                  </p>
                </div>
              )}

              {/* Motivations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Profession de Foi & Motivations <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  placeholder="Expliquez pourquoi vous souhaitez devenir délégué, votre sens du service et votre disponibilité..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* Projets & Actions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Projets & Actions proposées (Optionnel)
                </label>
                <input
                  type="text"
                  value={projects}
                  onChange={e => setProjects(e.target.value)}
                  placeholder="Ex: Création d'un drive de révision, groupe d'entraide, relais WhatsApp officiel..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* Note / Moyenne */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Moyenne ou Relevé Indicatif (Optionnel)
                </label>
                <input
                  type="text"
                  value={gpa}
                  onChange={e => setGpa(e.target.value)}
                  placeholder="Ex: 15.2/20 (Semestre précédent)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Je m'engage à respecter la charte des délégués UniFlow, à faire preuve d'impartialité et à transmettre fidèlement les annonces académiques.
                </span>
              </label>

              {/* Alerts */}
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-600 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2d4fa8] dark:from-teal-600 dark:to-teal-500 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
              >
                <Send className="h-4 w-4" /> Soumettre ma Candidature
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Candidacies List & Fast Track */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Fast-Track Demo Info Card */}
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-slate-900 p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Mode Démo UniFlow</h3>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1 leading-relaxed">
                  Pour vous permettre d'évaluer directement les fonctionnalités avancées de gestion de classe et d'émargement QR, vous pouvez valider instantanément votre candidature ci-dessous.
                </p>
              </div>
            </div>
          </div>

          {/* Submitted Candidacies */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Vos Candidatures ({candidacies.length})</h3>
              <span className="text-xs font-bold text-slate-400">{userLevel} Informatique</span>
            </div>

            {candidacies.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Aucune candidature enregistrée pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidacies.map(c => {
                  const isApproved = c.status === 'approved'
                  const isPending = c.status === 'pending'
                  const isRejected = c.status === 'rejected'

                  return (
                    <div 
                      key={c.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {c.type === 'global' ? `Délégué Global (${c.level})` : `Délégué ${c.ueCode || 'UE'}`}
                            </span>
                          </div>
                          {c.ueName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.ueName}</p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                              <Clock className="h-3 w-3" /> En attente
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                              <CheckCircle2 className="h-3 w-3" /> Approuvée
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 px-2.5 py-0.5 text-[11px] font-bold">
                              <XCircle className="h-3 w-3" /> Rejetée
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        "{c.motivation}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span>Soumis le : {c.submittedAt}</span>
                        <span>Moyenne : {c.gpa}</span>
                      </div>

                      {/* Fast track action buttons */}
                      {isPending && (
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => handleApproveCand(c.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white py-1.5 px-3 text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Valider (Démo)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWithdrawCand(c.id)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            Retirer
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
