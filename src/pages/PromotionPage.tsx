import { useState, useEffect } from 'react'
import { 
  Award, ShieldCheck, CheckCircle2, Clock, AlertCircle, 
  GraduationCap, BookOpen, Send, Sparkles, FileText, 
  UserCheck, ArrowRight, ChevronRight, CheckCircle, XCircle
} from 'lucide-react'
import { useUserRole } from '../utils/userRole'
import { useNavigate } from 'react-router-dom'
import { attendanceApi, coursesApi } from '../lib/api'

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

export default function PromotionPage() {
  const { currentUser, currentRole: role } = useUserRole()
  const navigate = useNavigate()
  // Rien n'est présumé : un profil sans filière ou niveau affiche « niveau non renseigné ».
  const userScope = [currentUser.program, currentUser.level].filter(Boolean).join(' · ') || 'niveau non renseigné'

  const [availableUEs, setAvailableUEs] = useState<{ code: string; name: string }[]>([])
  const [sessionCount, setSessionCount] = useState<number | null>(null)
  const [candidacies] = useState<Candidacy[]>([])
  const [formType, setFormType] = useState<'global' | 'ue'>('global')
  const [selectedUE, setSelectedUE] = useState<string>('')
  const [motivation, setMotivation] = useState('')
  const [projects, setProjects] = useState('')
  const [gpa, setGpa] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void coursesApi.list()
      .then((courses) => {
        if (active) setAvailableUEs(courses.map((course) => ({ code: course.code, name: course.name })))
      })
      .catch(() => {
        if (active) setAvailableUEs([])
      })
    setSelectedUE('')
    if (role === 'delegate') {
      void attendanceApi.listSessions()
        .then((sessions) => { if (active) setSessionCount(sessions.length) })
        .catch(() => { if (active) setSessionCount(0) })
    } else {
      setSessionCount(null)
    }
    return () => { active = false }
  }, [role, userScope])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('Les candidatures de délégué ne sont pas encore provisionnées dans les collections Appwrite. Le rôle est attribué par l’administration académique.')
  }

  const handleApproveCand = () => {
    setErrorMsg('La validation des candidatures nécessite une collection Appwrite dédiée, qui n’est pas encore provisionnée.')
  }

  const handleWithdrawCand = () => {
    setErrorMsg('Le retrait nécessite une collection Appwrite dédiée, qui n’est pas encore provisionnée.')
  }

  const [activeTab, setActiveTab] = useState<'promo' | 'candidacy'>('promo')

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* =========================================================================
          HERO BENTO - Ma Promotion & Vie de Classe
         ========================================================================= */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1 text-xs font-semibold text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Sparkles className="h-3.5 w-3.5" /> Promotion Universitaire · Semestre 1 (2026-2027)
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {activeTab === 'promo' ? 'Ma Promotion & Vie de Classe' : 'Postuler pour être Délégué'}
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-slate-200/90 max-w-2xl leading-relaxed">
                {activeTab === 'promo'
                  ? `Retrouvez les délégués de votre promotion (${userScope}), les annonces officielles de cours et les espaces d'échange de classe.`
                  : `Représentez vos camarades de ${userScope} et participez à la coordination avec le corps professoral UY1.`}
              </p>
            </div>

            {/* Micro-cartes Bento de statistiques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Statut académique actuel</span>
                <span className="text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="h-4 w-4 text-teal-300 shrink-0" />
                  {role === 'delegate' ? 'Délégué Officiel' : role === 'teacher' ? 'Enseignant' : 'Étudiant'}
                </span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">
                  {role === 'delegate' ? `${sessionCount ?? '…'} séance(s) de présence Appwrite accessible(s)` : 'Rôle validé par l’administration UY1'}
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Filière & Niveau</span>
                <span className="text-lg font-black text-white truncate block">{userScope}</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5 font-medium">Faculté des Sciences</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">UE disponibles</span>
                <span className="text-2xl font-black text-white">{availableUEs.length}</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">Catalogue Appwrite</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Délégués élus</span>
                <span className="text-2xl font-black text-emerald-300">2</span>
                <span className="text-[10px] text-slate-200 block mt-0.5 font-medium">Représentants UY1</span>
              </div>
            </div>

            {role === 'delegate' && (
              <div className="pt-1">
                <button type="button" onClick={() => navigate('/app/gestion-presences')} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-black text-[#1e3a8a] shadow-md hover:bg-cyan-50 transition-all cursor-pointer">
                  <UserCheck className="h-3.5 w-3.5" /> Gérer les présences
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <img
                src="/icons/nav/coordination.png"
                alt="Coordination et Promotion 3D"
                className="relative z-10 w-40 sm:w-52 lg:w-60 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = '/illustrations/uni_copilot_3d.png' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Onglets de navigation : Promotion vs Candidature */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('promo')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'promo'
              ? 'border-[#1e3a8a] text-[#1e3a8a] dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Vie de Promotion &amp; Classe</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('candidacy')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'candidacy'
              ? 'border-[#1e3a8a] text-[#1e3a8a] dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Candidature &amp; Élection Délégué</span>
        </button>
      </div>

      {/* =========================================================================
          VUE 1 : ESPACE DE PROMOTION & VIE DE CLASSE
         ========================================================================= */}
      {activeTab === 'promo' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filière &amp; Niveau</span>
              <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{userScope}</p>
              <p className="mt-0.5 text-xs text-slate-500">Université de Yaoundé I · Faculté des Sciences</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Salle Principale</span>
              <p className="mt-1 text-xl font-black text-[#1e3a8a] dark:text-teal-400">Amphi R101 / 1001</p>
              <p className="mt-0.5 text-xs text-slate-500">Campus de Ngoa-Ekellé</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Année Académique</span>
              <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">2026-2027 · S1</p>
              <p className="mt-0.5 text-xs text-slate-500">Semestre normal en cours</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Délégués de Promotion */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#1e3a8a] dark:bg-teal-900/40 dark:text-teal-300">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-base">Vos Délégués de Promotion</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Représentants officiels élus auprès de l’administration UY1</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('candidacy')}
                    className="text-xs font-bold text-[#1e3a8a] dark:text-teal-400 hover:underline"
                  >
                    Postuler →
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#1e3a8a] to-[#0d9488] text-white flex items-center justify-center font-bold text-sm">
                        SA
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900 dark:text-white">Steve Atangana</p>
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300">
                            Délégué Général
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Matricule : 24U0142 · Contact : delegue-promo@uy1.cm</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/app/messages')}
                      className="rounded-xl bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 px-3 py-1.5 text-xs font-bold text-[#1e3a8a] dark:text-white hover:bg-slate-100"
                    >
                      Écrire
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        MN
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900 dark:text-white">Marie Nguemo</p>
                          <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-black text-blue-800 dark:text-blue-300">
                            Déléguée Adjointe
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Matricule : 24U0318 · Chargée des TPs et Groupes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/app/messages')}
                      className="rounded-xl bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 px-3 py-1.5 text-xs font-bold text-[#1e3a8a] dark:text-white hover:bg-slate-100"
                    >
                      Écrire
                    </button>
                  </div>
                </div>
              </div>

              {/* Annonces de classe */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all">
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Annonces &amp; Vie de Classe</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300">📢 Contrôle Continu Semestre 1</span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400">Il y a 2 jours</span>
                    </div>
                    <p className="mt-1.5 text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                      Les premières évaluations continues de programmation et algorithmique débuteront la semaine prochaine en salle R101. Pensez à réviser avec le copilote IA Uni.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-800 dark:text-teal-300">📚 Supports de cours mis à jour</span>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400">Hier</span>
                    </div>
                    <p className="mt-1.5 text-xs text-teal-950 dark:text-teal-200 leading-relaxed">
                      Les polycopiés et séries d'exercices de TD sont disponibles dans l'onglet Bibliothèque UniFlow.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Droite : Raccourcis et Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Actions de Promotion</h3>
                <div className="space-y-2.5">
                  <button
                    onClick={() => navigate('/app/visio')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Visioconférence de Promotion</p>
                        <p className="text-[11px] text-slate-500">Rejoindre la salle virtuelle d'amphi</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => navigate('/app/emploi-du-temps')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Planning Officiel UY1</p>
                        <p className="text-[11px] text-slate-500">Voir les créneaux et salles de la semaine</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => navigate('/app/bibliotheque')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Bibliothèque Z-Library &amp; Manuels</p>
                        <p className="text-[11px] text-slate-500">Accéder aux livres et annales de la filière</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 2 : CANDIDATURE & ÉLECTION DÉLÉGUÉ (EXISTANT)
         ========================================================================= */}
      {activeTab === 'candidacy' && (
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all">
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
                    className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all ${
                      formType === 'global'
                        ? 'border-[#1e3a8a] dark:border-teal-400 bg-blue-50/60 dark:bg-teal-950/30 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <GraduationCap className={`h-5 w-5 ${formType === 'global' ? 'text-[#1e3a8a] dark:text-teal-400' : 'text-slate-400'}`} />
                      {formType === 'global' && <CheckCircle className="h-4 w-4 text-[#1e3a8a] dark:text-teal-400" />}
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Délégué Global</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Représente la totalité du niveau ({currentUser.level || 'non renseigné'}) auprès de l'administration et gère les plannings généraux.
                    </span>
                  </button>

                  {/* UE Specific */}
                  <button
                    type="button"
                    onClick={() => setFormType('ue')}
                    className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all ${
                      formType === 'ue'
                        ? 'border-[#1e3a8a] dark:border-teal-400 bg-blue-50/60 dark:bg-teal-950/30 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
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
                <div className="rounded-2xl border border-blue-200 dark:border-teal-800/80 bg-blue-50/50 dark:bg-teal-950/20 p-4 space-y-2 animate-fade-in">
                  <label className="block text-xs font-bold text-[#1e3a8a] dark:text-teal-300">
                    Sélectionner l'Unité d'Enseignement (UE)
                  </label>
                  <select
                    value={selectedUE}
                    onChange={e => setSelectedUE(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400"
                  >
                    {availableUEs.map(ue => (
                      <option key={ue.code} value={ue.code}>
                        [{ue.code}] — {ue.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Les cours affichés proviennent de la collection académique Appwrite de votre filière et de votre niveau.
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
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-600 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#2d4fa8] dark:from-teal-600 dark:to-teal-500 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
              >
                <Send className="h-4 w-4" /> Demander une attribution
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Candidacies List & Fast Track */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Submitted Candidacies */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Vos Candidatures ({candidacies.length})</h3>
              <span className="text-xs font-bold text-slate-400">{userScope}</span>
            </div>

            {candidacies.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Aucune candidature n’est stockée : la collection de candidatures Appwrite n’est pas encore provisionnée.</p>
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
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3 transition-all"
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

                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
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
                            onClick={handleApproveCand}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white py-1.5 px-3 text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Valider
                          </button>
                          <button
                            type="button"
                            onClick={handleWithdrawCand}
                            className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors"
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
      )}
    </div>
  )
}
