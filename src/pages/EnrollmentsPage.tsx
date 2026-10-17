import { useState } from 'react'
import {
  GraduationCap,
  CheckCircle2,
  FileText,
  Upload,
  Download,
  Clock,
  ShieldCheck,
  Building2,
  BookOpen,
  UserCheck,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useUserRole } from '../utils/userRole'

interface DossierDocument {
  id: string
  title: string
  reference: string
  status: 'VALIDÉ' | 'EN VÉRIFICATION' | 'À TÉLÉVERSER'
  updatedAt: string
  fileSize: string
}

interface AcademicYearRecord {
  level: string
  year: string
  program: string
  credits: string
  gpa: string
  status: 'VALIDÉ' | 'EN COURS' | 'PROCHAIN'
  quitusRef: string
}

const INITIAL_DOCS: DossierDocument[] = [
  {
    id: 'doc-birth',
    title: 'Acte de naissance certifié conforme',
    reference: 'MINAT-CE-2004-8912',
    status: 'VALIDÉ',
    updatedAt: '12 Sept. 2026',
    fileSize: '1,2 Mo (PDF)',
  },
  {
    id: 'doc-bac',
    title: 'Relevé de notes du Baccalauréat / GCE A-Level',
    reference: 'OBC-C-2023-44219',
    status: 'VALIDÉ',
    updatedAt: '12 Sept. 2026',
    fileSize: '1,8 Mo (PDF)',
  },
  {
    id: 'doc-med',
    title: 'Certificat médical CMS Université de Yaoundé I',
    reference: 'CMS-UY1-2026-3109',
    status: 'VALIDÉ',
    updatedAt: '18 Sept. 2026',
    fileSize: '940 Ko (PDF)',
  },
  {
    id: 'doc-photo',
    title: 'Photos 4x4 biométriques fond blanc (x4)',
    reference: 'BIO-IMG-22U2418',
    status: 'VALIDÉ',
    updatedAt: '19 Sept. 2026',
    fileSize: '620 Ko (JPG)',
  },
  {
    id: 'doc-receipt',
    title: 'Reçu de paiement des droits universitaires (50 000 FCFA)',
    reference: 'QUITUS-UY1-2026-99412',
    status: 'VALIDÉ',
    updatedAt: '02 Oct. 2026',
    fileSize: '480 Ko (PDF)',
  },
]

const ACADEMIC_TIMELINE: AcademicYearRecord[] = [
  {
    level: 'Licence 1 (L1)',
    year: '2024 – 2025',
    program: 'Informatique Fondamentale & ICT4D — Faculté des Sciences',
    credits: '60 / 60 ECTS',
    gpa: '15,40 / 20 (Mention Bien)',
    status: 'VALIDÉ',
    quitusRef: 'CERT-UY1-L1-2024',
  },
  {
    level: 'Licence 2 (L2)',
    year: '2025 – 2026',
    program: 'Génie Logiciel & Systèmes d’Information — Faculté des Sciences',
    credits: '60 / 60 ECTS',
    gpa: '16,10 / 20 (Mention Très Bien)',
    status: 'VALIDÉ',
    quitusRef: 'CERT-UY1-L2-2025',
  },
  {
    level: 'Licence 3 (L3)',
    year: '2026 – 2027',
    program: 'Ingénierie des Systèmes Distribués & IA — Faculté des Sciences',
    credits: '30 / 60 ECTS (Semestre 5 validé)',
    gpa: '15,85 / 20 (En cours)',
    status: 'EN COURS',
    quitusRef: 'CERT-UY1-L3-2026',
  },
  {
    level: 'Master 1 (M1)',
    year: '2027 – 2028',
    program: 'Master Recherche Informatique & Intelligence Artificielle',
    credits: '0 / 60 ECTS',
    gpa: 'Pré-admission ouverte',
    status: 'PROCHAIN',
    quitusRef: 'PRE-M1-2027',
  },
  {
    level: 'Master 2 (M2)',
    year: '2028 – 2029',
    program: 'Master Spécialisé Architecture Cloud & Edge Computing',
    credits: '0 / 60 ECTS',
    gpa: 'Cursus cible',
    status: 'PROCHAIN',
    quitusRef: 'PRE-M2-2028',
  },
]

export default function EnrollmentsPage() {
  const { currentUser } = useUserRole()
  const [activeStep, setActiveStep] = useState<number>(4)
  const [docs, setDocs] = useState<DossierDocument[]>(INITIAL_DOCS)
  const [selectedSpec, setSelectedSpec] = useState('Génie Logiciel & Systèmes Distribués (GL-SD)')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleSimulateUpload = (docId: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: 'VALIDÉ',
              updatedAt: 'Aujourd’hui · Vérifié par IA',
            }
          : d
      )
    )
    showToast('Pièce justificative mise à jour et certifiée dans votre dossier numérique !')
  }

  const steps = [
    {
      num: 1,
      title: '1. Informations personnelles',
      subtitle: 'État civil & Matricule UY1',
      icon: UserCheck,
    },
    {
      num: 2,
      title: '2. Choix de filière & UEs',
      subtitle: '60 crédits ECTS inscrits',
      icon: BookOpen,
    },
    {
      num: 3,
      title: '3. Pièces justificatives',
      subtitle: '5 / 5 documents validés',
      icon: FileText,
    },
    {
      num: 4,
      title: '4. Validation & Quitus',
      subtitle: 'Dossier 2026-2027 Homologué',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="space-y-6 pb-12">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-bold text-white shadow-xl border border-teal-500/40">
          <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#1e40af] to-[#0D9488] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-100">
              <GraduationCap className="h-4 w-4" />
              <span>Inscriptions Académiques & Admissions · UY1</span>
            </div>
            <h1 className="text-2xl font-black sm:text-3xl">
              Dossier d’Inscription Administrative & Pédagogique 2026–2027
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl">
              Étudiant : <strong>{currentUser.name}</strong> · Matricule :{' '}
              <span className="font-mono font-bold text-amber-300">{currentUser.matricule || '22U2418'}</span> · Faculté des Sciences
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <img
              src="/icons/nav/inscriptions.png"
              alt="Inscriptions 3D"
              className="hidden sm:block h-20 w-20 object-contain drop-shadow-xl"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => showToast('Certificat de scolarité officiel 2026-2027 téléchargé (PDF signé QR) !')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-[#1E3A8A] shadow-md hover:bg-blue-50 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Certificat de Scolarité (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Fiche d’inscription pédagogique S5/S6 téléchargée !')}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#F59E0B] px-4 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 transition-all"
              >
                <Award className="h-4 w-4" />
                <span>Télécharger le Quitus d’Inscription</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Step Progress Stepper */}
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = activeStep === step.num
            const isCompleted = step.num <= 4
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(step.num)}
                className={`flex items-start gap-3.5 rounded-2xl p-4 text-left transition-all border ${
                  isActive
                    ? 'bg-white text-slate-900 border-white shadow-lg'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white'
                      : isCompleted
                        ? 'bg-[#0D9488] text-white'
                        : 'bg-white/20 text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-black ${isActive ? 'text-[#1E3A8A]' : 'text-white'}`}>
                      {step.title}
                    </p>
                    <CheckCircle2
                      className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#0D9488]' : 'text-teal-300'}`}
                    />
                  </div>
                  <p className={`mt-0.5 text-[11px] font-medium ${isActive ? 'text-slate-500' : 'text-blue-100'}`}>
                    {step.subtitle}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Interactive Step Detail Panel */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Étape 1 — Informations Personnelles & État Civil</h2>
                <p className="text-xs text-slate-500">Données synchronisées avec la Scolarité Centrale UY1</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                Vérifié & Certifié
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Nom complet', value: currentUser.name || 'Ravel Nghomsi' },
                { label: 'Matricule UY1', value: currentUser.matricule || '22U2418' },
                { label: 'Faculté', value: 'Faculté des Sciences (UY1)' },
                { label: 'Département', value: 'Informatique & Technologies (ICT4D)' },
                { label: 'Niveau actuel', value: 'Licence 3 (Semestres 5 & 6)' },
                { label: 'Statut boursier / Quitus', value: 'En règle · Quitus Actif' },
              ].map((field) => (
                <div key={field.label} className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/70">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{field.label}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Étape 2 — Choix de Filière & Inscription aux UEs</h2>
                <p className="text-xs text-slate-500">Sélection des Unités d’Enseignement Fondamentales et Optionnelles (60 Crédits)</p>
              </div>
              <select
                value={selectedSpec}
                onChange={(e) => {
                  setSelectedSpec(e.target.value)
                  showToast(`Spécialité mise à jour : ${e.target.value}`)
                }}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-extrabold text-[#1E3A8A]"
              >
                <option>Génie Logiciel & Systèmes Distribués (GL-SD)</option>
                <option>Intelligence Artificielle & Data Science (IA-DS)</option>
                <option>Sécurité Réseaux & Cloud Computing (SR-CC)</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { code: 'INF301', name: 'Systèmes Distribués & Cloud', credits: 6, type: 'Fondamentale' },
                { code: 'INF302', name: 'Génie Logiciel Avancé & UML', credits: 6, type: 'Fondamentale' },
                { code: 'INF303', name: 'Sécurité Informatique & Cryptographie', credits: 6, type: 'Fondamentale' },
                { code: 'INF304', name: 'Intelligence Artificielle & Machine Learning', credits: 6, type: 'Fondamentale' },
                { code: 'INF305', name: 'Compilation & Langages Formels', credits: 3, type: 'Complémentaire' },
                { code: 'INF306', name: 'Projet Tutore & Entrepreneuriat Numérique', credits: 3, type: 'Transversale' },
              ].map((ue) => (
                <div key={ue.code} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#1E3A8A] px-2 py-0.5 text-[11px] font-black text-white">
                        {ue.code}
                      </span>
                      <span className="text-[11px] font-bold text-[#0D9488]">{ue.type}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-extrabold text-slate-900">{ue.name}</p>
                  </div>
                  <span className="rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-black text-amber-800">
                    {ue.credits} ECTS
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeStep === 3 || activeStep === 4) && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {activeStep === 3
                    ? 'Étape 3 — Pièces Justificatives Numérisées'
                    : 'Étape 4 — Synthèse du Dossier & Quitus d’Inscription Validé'}
                </h2>
                <p className="text-xs text-slate-500">
                  Toutes vos pièces sont horodatées et signées par le serveur d’admission UniFlow UY1.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3.5 py-1 text-xs font-black text-[#0D9488]">
                <Sparkles className="h-3.5 w-3.5" /> Quitus #UY1-2026-88412 Homologué
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Layout: Document Upload List + Academic History Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Pièces justificatives */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Pièces Justificatives du Dossier</h2>
              <p className="text-xs text-slate-500">5 pièces obligatoires contrôlées par la scolarité</p>
            </div>
            <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              100% Complet
            </span>
          </div>

          <div className="space-y-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">{doc.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Réf: <span className="font-mono">{doc.reference}</span> · {doc.fileSize} · {doc.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800">
                    ✓ {doc.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSimulateUpload(doc.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                    title="Mettre à jour le fichier"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Remplacer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Academic History Timeline (L1 -> M2) */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Parcours & Historique Académique (L1 – M2)</h2>
              <p className="text-xs text-slate-500">Progression LMD et certificats de scolarité annuels</p>
            </div>
            <Building2 className="h-5 w-5 text-[#1E3A8A]" />
          </div>

          <div className="relative space-y-4 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {ACADEMIC_TIMELINE.map((item) => (
              <div key={item.level} className="relative pl-10">
                <span
                  className={`absolute left-2 top-3 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                    item.status === 'VALIDÉ'
                      ? 'bg-[#0D9488]'
                      : item.status === 'EN COURS'
                        ? 'bg-[#F59E0B]'
                        : 'bg-slate-300'
                  }`}
                />
                <div className="rounded-2xl border border-slate-200 p-4 hover:border-blue-200 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#1E3A8A]">{item.level}</span>
                      <span className="text-xs font-bold text-slate-400">({item.year})</span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                        item.status === 'VALIDÉ'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'EN COURS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-bold text-slate-700">{item.program}</p>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="font-bold text-slate-500">
                      {item.credits} · <strong className="text-slate-800">{item.gpa}</strong>
                    </span>
                    {item.status !== 'PROCHAIN' ? (
                      <button
                        type="button"
                        onClick={() =>
                          showToast(`Attestation officielle ${item.level} (${item.quitusRef}) téléchargée !`)
                        }
                        className="inline-flex items-center gap-1 font-extrabold text-[#1E3A8A] hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Attestation ({item.quitusRef})</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
                        <Clock className="h-3 w-3" /> Cycle futur
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
