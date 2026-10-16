import { useState } from 'react'
import {
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileText,
  Send,
  Download,
  X,
  Building2,
  Coins,
  ShieldCheck,
} from 'lucide-react'
import { useUserRole } from '../utils/userRole'

interface ScholarshipProgram {
  id: string
  title: string
  sponsor: string
  amountFcfa: number
  periodicity: string
  deadline: string
  eligibility: string[]
  status: 'ATTRIBUÉE' | 'CANDIDATURE OUVERTE' | 'DOSSIER SOUMIS'
}

interface DisbursementRecord {
  id: string
  programTitle: string
  trancheLabel: string
  amountFcfa: number
  date: string
  channel: string
  status: 'VERSÉ' | 'PROGRAMMÉ'
  reference: string
}

const INITIAL_PROGRAMS: ScholarshipProgram[] = [
  {
    id: 'sch-1',
    title: 'Prime Présidentielle d’Excellence Académique (MINESUP)',
    sponsor: 'État du Cameroun · Ministère de l’Enseignement Supérieur',
    amountFcfa: 50000,
    periodicity: 'Allocation annuelle directe',
    deadline: 'Validée automatiquement (Moyenne ≥ 14/20)',
    eligibility: [
      'Être régulièrement inscrit à l’Université de Yaoundé I (Quitus à jour)',
      'Avoir validé les 60 crédits ECTS de l’année précédente en session normale',
      'Moyenne générale pondérée supérieure ou égale à 14,00 / 20',
    ],
    status: 'ATTRIBUÉE',
  },
  {
    id: 'sch-2',
    title: 'Bourse d’Excellence Numérique KERNEL FORGE & Partenaires',
    sponsor: 'Fondation KERNEL FORGE · Programme Ingénieurs & IA',
    amountFcfa: 150000,
    periodicity: 'Par semestre (2 versements de 75 000 FCFA)',
    deadline: '30 Novembre 2026',
    eligibility: [
      'Étudiant en Informatique, Mathématiques, Physique ou Énergies Renouvelables (L2 à M2)',
      'Projet open-source ou contribution active aux clubs scientifiques UY1',
      'Taux de présence aux cours et TP supérieur à 90% sur UniFlow',
    ],
    status: 'CANDIDATURE OUVERTE',
  },
  {
    id: 'sch-3',
    title: 'Aide Sociale & Mobilité Campus (Œuvres Universitaires UY1)',
    sponsor: 'Direction du Centre des Œuvres Universitaires (DCOU - UY1)',
    amountFcfa: 75000,
    periodicity: 'Annuelle + Accès prioritaire Cité U & Restau U',
    deadline: '15 Décembre 2026',
    eligibility: [
      'Dossier social vérifié par le service d’action sociale de l’Université',
      'Certificat de scolarité 2026–2027 en cours de validité',
      'Engagement dans le programme Work-Study ou tutorat étudiant',
    ],
    status: 'CANDIDATURE OUVERTE',
  },
]

const DISBURSEMENTS: DisbursementRecord[] = [
  {
    id: 'disb-1',
    programTitle: 'Prime Présidentielle d’Excellence Académique (MINESUP)',
    trancheLabel: 'Versement Unique 2026',
    amountFcfa: 50000,
    date: '05 Octobre 2026',
    channel: 'MTN Mobile Money (+237 6 57 63 56 44)',
    status: 'VERSÉ',
    reference: 'MINESUP-EX-2026-4418',
  },
  {
    id: 'disb-2',
    programTitle: 'Prime de Tutorat & Délégué de Promotion (Faculté des Sciences)',
    trancheLabel: 'Indemnité Semestre 1',
    amountFcfa: 35000,
    date: '10 Novembre 2026',
    channel: 'Virement Mobile Money / Compte Étudiant',
    status: 'VERSÉ',
    reference: 'UY1-FS-TUT-2026-0912',
  },
  {
    id: 'disb-3',
    programTitle: 'Bourse d’Excellence Numérique KERNEL FORGE',
    trancheLabel: 'Tranche Semestre 2 (Prévisionnelle)',
    amountFcfa: 75000,
    date: '15 Février 2027',
    channel: 'Mobile Money / Carte Campus',
    status: 'PROGRAMMÉ',
    reference: 'KF-SCH-2027-0104',
  },
]

export default function ScholarshipsPage() {
  const { currentUser } = useUserRole()
  const [programs, setPrograms] = useState<ScholarshipProgram[]>(INITIAL_PROGRAMS)
  const [applyingFor, setApplyingFor] = useState<ScholarshipProgram | null>(null)
  const [motivation, setMotivation] = useState(
    'Étudiant assidu en Licence 3 Informatique (moyenne 16,10/20), je développe des outils open-source pour la communauté universitaire de Yaoundé I.'
  )
  const [phonePayout, setPhonePayout] = useState('+237 6 57 63 56 44')
  const [toast, setToast] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()
    if (!applyingFor) return
    setPrograms((prev) =>
      prev.map((p) => (p.id === applyingFor.id ? { ...p, status: 'DOSSIER SOUMIS' } : p))
    )
    const title = applyingFor.title
    setApplyingFor(null)
    triggerToast(`Votre candidature à "${title}" a été transmise avec votre relevé de notes certifié !`)
  }

  return (
    <div className="space-y-6 pb-12">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-bold text-white shadow-xl border border-teal-500/40">
          <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Active Scholarship Hero Status Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#1d4ed8] to-[#0D9488] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-200">
              <Award className="h-4 w-4 text-amber-300" />
              <span>Bourses d’Études, Allocations & Aides Financières</span>
            </div>
            <h1 className="text-2xl font-black sm:text-3xl">
              Portail des Bourses & Primes d’Excellence UY1
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl">
              Bénéficiaire : <strong>{currentUser.name || 'Ravel Nghomsi'}</strong> · Matricule{' '}
              <span className="font-mono font-bold text-amber-300">{currentUser.matricule || '22U2418'}</span> · Dossier académique éligible au barème d’excellence.
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerToast('Attestation de boursier 2026-2027 téléchargée en PDF !')}
            className="inline-flex items-center gap-2 self-start lg:self-center rounded-2xl bg-white px-5 py-3 text-xs font-black text-[#1E3A8A] shadow-md hover:bg-blue-50 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Attestation de Bourse (PDF)</span>
          </button>
        </div>

        {/* Active Scholarship Summary Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs font-bold text-blue-100">Statut Bourse Active</p>
            <p className="mt-1 text-lg font-black text-amber-300 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5" /> Lauréat Prime d’Excellence
            </p>
            <p className="mt-0.5 text-[11px] text-blue-100">MINESUP · Session 2026–2027</p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs font-bold text-blue-100">Cumul Versé cette Année</p>
            <p className="mt-1 text-2xl font-black text-emerald-300">85 000 FCFA</p>
            <p className="mt-0.5 text-[11px] text-blue-100">2 allocations débloquées</p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs font-bold text-blue-100">Prochain Versement Programmé</p>
            <p className="mt-1 text-2xl font-black text-white">75 000 FCFA</p>
            <p className="mt-0.5 text-[11px] text-teal-200">15 Février 2027 · Bourse KERNEL FORGE</p>
          </div>
        </div>
      </div>

      {/* Catalog of Available Scholarships */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900">Catalogue des Programmes de Bourses & Aides</h2>
            <p className="text-xs text-slate-500">
              Postulez en 1 clic : votre relevé de notes et votre taux d’assiduité UniFlow sont joints automatiquement
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {programs.map((prog) => {
            const isAwarded = prog.status === 'ATTRIBUÉE'
            const isSubmitted = prog.status === 'DOSSIER SOUMIS'
            return (
              <div
                key={prog.id}
                className="flex flex-col justify-between rounded-3xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1 text-[11px] font-black text-[#1E3A8A]">
                      <Building2 className="h-3.5 w-3.5" /> Bourse Officielle
                    </span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase ${
                        isAwarded
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSubmitted
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {prog.status}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">{prog.title}</h3>
                  <p className="text-xs font-semibold text-slate-500">{prog.sponsor}</p>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5">
                    <p className="text-xl font-black text-[#1E3A8A]">
                      {prog.amountFcfa.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-[11px] font-bold text-[#0D9488]">{prog.periodicity}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="h-3.5 w-3.5" /> Date limite : {prog.deadline}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Critères d’éligibilité :
                    </p>
                    <ul className="space-y-1.5">
                      {prog.eligibility.map((crit) => (
                        <li key={crit} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0D9488] mt-0.5" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  {isAwarded ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 py-2.5 text-xs font-black text-emerald-800">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Allocation déjà attribuée & versée</span>
                    </div>
                  ) : isSubmitted ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl bg-teal-50 border border-teal-200 py-2.5 text-xs font-black text-teal-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Dossier transmis à la commission</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setApplyingFor(prog)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] py-3 text-xs font-black text-white shadow-sm hover:bg-blue-900 transition-all"
                    >
                      <Send className="h-4 w-4 text-amber-300" />
                      <span>Postuler à cette bourse</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Disbursement Schedule & History */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Calendrier & Historique des Versements (FCFA)</h2>
            <p className="text-xs text-slate-500">Suivi transparent des virements de bourses et primes</p>
          </div>
          <Coins className="h-5 w-5 text-[#F59E0B]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Référence</th>
                <th className="py-3 px-3">Programme de Bourse</th>
                <th className="py-3 px-3">Tranche</th>
                <th className="py-3 px-3">Canal de réception</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Montant</th>
                <th className="py-3 px-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {DISBURSEMENTS.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-3 font-mono font-bold text-[#1E3A8A]">{d.reference}</td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900">{d.programTitle}</td>
                  <td className="py-3.5 px-3 text-slate-600 font-semibold">{d.trancheLabel}</td>
                  <td className="py-3.5 px-3 text-slate-500">{d.channel}</td>
                  <td className="py-3.5 px-3 text-slate-500">{d.date}</td>
                  <td className="py-3.5 px-3 font-black text-slate-900">
                    {d.amountFcfa.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black ${
                        d.status === 'VERSÉ'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {d.status === 'VERSÉ' ? '✓ VERSÉ' : '⏳ PROGRAMMÉ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Postuler à une bourse */}
      {applyingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={handleSubmitApplication}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D9488]">
                  Candidature Numérique Certifiée
                </span>
                <h3 className="text-base font-black text-slate-900">{applyingFor.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setApplyingFor(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-1">
              <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#1E3A8A]" /> Pièces jointes automatiquement depuis votre profil :
              </p>
              <p className="text-slate-600">• Relevé de notes certifié L2/L3 (Moyenne : 16,10 / 20)</p>
              <p className="text-slate-600">• Quitus des droits universitaires 2026–2027</p>
              <p className="text-slate-600">• Attestation d’assiduité UniFlow (96% de présence)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Numéro Mobile Money de versement (+237)
              </label>
              <input
                type="tel"
                value={phonePayout}
                onChange={(e) => setPhonePayout(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lettre de motivation / Projet d’études
              </label>
              <textarea
                rows={4}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApplyingFor(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#1E3A8A] px-5 py-2 text-xs font-black text-white hover:bg-blue-900"
              >
                Transmettre le dossier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
