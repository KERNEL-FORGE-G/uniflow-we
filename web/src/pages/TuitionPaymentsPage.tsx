import { useState } from 'react'
import {
  CreditCard,
  CheckCircle2,
  Download,
  Smartphone,
  Building2,
  ShieldCheck,
  Receipt,
  Clock,
  Plus,
  X,
  ArrowUpRight,
  Wallet,
} from 'lucide-react'
import { useUserRole } from '../utils/userRole'

interface TrancheItem {
  id: string
  label: string
  description: string
  amountFcfa: number
  dueDate: string
  status: 'PAYÉ' | 'EN ATTENTE'
  quitusCode: string
  paidAt?: string
  method?: string
}

interface PaymentRecord {
  id: string
  reference: string
  label: string
  amountFcfa: number
  method: 'MTN Mobile Money' | 'Orange Money' | 'Carte Bancaire' | 'Espèces / Quittance banque'
  phoneOrAccount: string
  date: string
  status: 'CONFIRMÉ'
}

const INITIAL_TRANCHES: TrancheItem[] = [
  {
    id: 'tr-1',
    label: 'Tranche 1 — Droits Universitaires (Inscription S1)',
    description: 'Obligatoire pour la validation de l’inscription administrative et l’accès aux salles.',
    amountFcfa: 25000,
    dueDate: '15 Octobre 2026',
    status: 'PAYÉ',
    quitusCode: 'QUITUS-T1-2026-9941',
    paidAt: '28 Sept. 2026',
    method: 'MTN Mobile Money',
  },
  {
    id: 'tr-2',
    label: 'Tranche 2 — Droits Universitaires (Scolarité S2)',
    description: 'Solde des droits universitaires requis avant les examens de fin de semestre.',
    amountFcfa: 25000,
    dueDate: '15 Janvier 2027',
    status: 'EN ATTENTE',
    quitusCode: 'QUITUS-T2-2026-9942',
  },
  {
    id: 'tr-med',
    label: 'Visite Médicale & Assurance CMS UY1',
    description: 'Bilan de santé annuel au Centre Médico-Social + couverture campus.',
    amountFcfa: 5000,
    dueDate: '30 Octobre 2026',
    status: 'PAYÉ',
    quitusCode: 'CMS-MED-2026-3109',
    paidAt: '28 Sept. 2026',
    method: 'Orange Money',
  },
  {
    id: 'tr-card',
    label: 'Carte d’Étudiant Biométrique NFC / QR',
    description: 'Production de la carte étudiante multiservices (Bibliothèque, Restau U, Présences).',
    amountFcfa: 2500,
    dueDate: '30 Octobre 2026',
    status: 'PAYÉ',
    quitusCode: 'CARD-BIO-2026-2418',
    paidAt: '01 Oct. 2026',
    method: 'MTN Mobile Money',
  },
]

const INITIAL_HISTORY: PaymentRecord[] = [
  {
    id: 'pay-1',
    reference: 'MOMO-UY1-20260928-8821',
    label: 'Tranche 1 — Droits Universitaires (25 000 FCFA)',
    amountFcfa: 25000,
    method: 'MTN Mobile Money',
    phoneOrAccount: '+237 6 77 42 19 80',
    date: '28 Sept. 2026 · 10:14',
    status: 'CONFIRMÉ',
  },
  {
    id: 'pay-2',
    reference: 'OM-UY1-20260928-4410',
    label: 'Visite Médicale & Assurance CMS UY1 (5 000 FCFA)',
    amountFcfa: 5000,
    method: 'Orange Money',
    phoneOrAccount: '+237 6 94 11 08 55',
    date: '28 Sept. 2026 · 10:19',
    status: 'CONFIRMÉ',
  },
  {
    id: 'pay-3',
    reference: 'MOMO-UY1-20261001-5190',
    label: 'Carte d’Étudiant Biométrique NFC / QR (2 500 FCFA)',
    amountFcfa: 2500,
    method: 'MTN Mobile Money',
    phoneOrAccount: '+237 6 77 42 19 80',
    date: '01 Oct. 2026 · 15:42',
    status: 'CONFIRMÉ',
  },
]

export default function TuitionPaymentsPage() {
  const { currentUser } = useUserRole()
  const [tranches, setTranches] = useState<TrancheItem[]>(INITIAL_TRANCHES)
  const [history, setHistory] = useState<PaymentRecord[]>(INITIAL_HISTORY)
  const [selectedTranche, setSelectedTranche] = useState<TrancheItem | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<
    'MTN Mobile Money' | 'Orange Money' | 'Carte Bancaire' | 'Espèces / Quittance banque'
  >('MTN Mobile Money')
  const [phoneInput, setPhoneInput] = useState('+237 6 57 63 56 44')
  const [bankRefInput, setBankRefInput] = useState('BICEC-UY1-2026-00948')
  const [processing, setProcessing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3800)
  }

  // Droits universitaires = 50 000 FCFA (Tranche 1 + Tranche 2)
  const totalTuition = 50000
  const tuitionPaid = tranches
    .filter((t) => (t.id === 'tr-1' || t.id === 'tr-2') && t.status === 'PAYÉ')
    .reduce((sum, t) => sum + t.amountFcfa, 0)
  const tuitionRemaining = Math.max(0, totalTuition - tuitionPaid)
  const allPaid = tuitionRemaining === 0

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTranche) return
    setProcessing(true)
    setTimeout(() => {
      const nowStr = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      const refPrefix =
        paymentMethod === 'MTN Mobile Money'
          ? 'MOMO'
          : paymentMethod === 'Orange Money'
            ? 'OM'
            : paymentMethod === 'Carte Bancaire'
              ? 'VISA'
              : 'BANK'
      const newRef = `${refPrefix}-UY1-${Date.now().toString().slice(-6)}`

      setTranches((prev) =>
        prev.map((t) =>
          t.id === selectedTranche.id
            ? {
                ...t,
                status: 'PAYÉ',
                paidAt: nowStr,
                method: paymentMethod,
              }
            : t
        )
      )

      setHistory((prev) => [
        {
          id: `pay-${Date.now()}`,
          reference: newRef,
          label: `${selectedTranche.label} (${selectedTranche.amountFcfa.toLocaleString('fr-FR')} FCFA)`,
          amountFcfa: selectedTranche.amountFcfa,
          method: paymentMethod,
          phoneOrAccount:
            paymentMethod === 'Espèces / Quittance banque' ? bankRefInput : phoneInput,
          date: `${nowStr} · Instantané`,
          status: 'CONFIRMÉ',
        },
        ...prev,
      ])

      setProcessing(false)
      setSelectedTranche(null)
      triggerToast(`Paiement de ${selectedTranche.amountFcfa.toLocaleString('fr-FR')} FCFA validé ! Quitus ${newRef} généré.`)
    }, 600)
  }

  return (
    <div className="space-y-6 pb-12">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-bold text-white shadow-xl border border-teal-500/40">
          <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#1d4ed8] to-[#0D9488] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-100">
              <Wallet className="h-4 w-4" />
              <span>Paiements & Droits Universitaires · UY1</span>
            </div>
            <h1 className="text-2xl font-black sm:text-3xl">
              Frais de Scolarité, Quitus & Reçus Officiels
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl">
              Réglez vos droits universitaires par Mobile Money (MTN MoMo, Orange Money), Carte ou Quittance bancaire et téléchargez vos reçus signés par QR code.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!allPaid && (
              <button
                type="button"
                onClick={() => {
                  const pending = tranches.find((t) => t.status === 'EN ATTENTE')
                  if (pending) setSelectedTranche(pending)
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#F59E0B] px-5 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Régler la Tranche 2 (25 000 FCFA)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                triggerToast(`Quitus financier récapitulatif de ${currentUser.name || 'l’étudiant'} téléchargé en PDF !`)
              }
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-[#1E3A8A] shadow-md hover:bg-blue-50 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Télécharger l’État Financier (PDF)</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs font-bold text-blue-100">Total Droits Universitaires</p>
            <p className="mt-1 text-2xl font-black text-white">50 000 FCFA</p>
            <p className="mt-0.5 text-[11px] text-teal-200">Tarif officiel État · UY1</p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs font-bold text-blue-100">Montant Payé (Droits)</p>
            <p className="mt-1 text-2xl font-black text-emerald-300">
              {tuitionPaid.toLocaleString('fr-FR')} FCFA
            </p>
            <p className="mt-0.5 text-[11px] text-blue-100">+ 7 500 FCFA (Frais annexes réglés)</p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs font-bold text-blue-100">Solde Restant</p>
            <p className="mt-1 text-2xl font-black text-amber-300">
              {tuitionRemaining.toLocaleString('fr-FR')} FCFA
            </p>
            <p className="mt-0.5 text-[11px] text-blue-100">
              {allPaid ? 'Aucun solde restant' : 'Échéance : 15 Janvier 2027'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs font-bold text-blue-100">Statut Quitus Scolarité</p>
            <p className="mt-1 text-xl font-black text-white flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              {allPaid ? 'Quitus Total 100%' : 'Quitus S1 Actif'}
            </p>
            <p className="mt-0.5 text-[11px] text-teal-200">Autorisé aux examens CC & TP</p>
          </div>
        </div>
      </div>

      {/* Breakdown by Tranche */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900">Ventilation des Frais par Tranche (Année 2026–2027)</h2>
            <p className="text-xs text-slate-500">
              Détail réglementaire des droits universitaires et frais médicaux/carte d’étudiant
            </p>
          </div>
          <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-extrabold text-[#1E3A8A]">
            Matricule : {currentUser.matricule || '22U2418'}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tranches.map((tr) => {
            const isPaid = tr.status === 'PAYÉ'
            return (
              <div
                key={tr.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                  isPaid
                    ? 'border-slate-200 bg-slate-50/60'
                    : 'border-amber-300 bg-amber-50/40 shadow-sm'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{tr.quitusCode}</span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {isPaid ? '✓ PAYÉ' : '⏳ EN ATTENTE'}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{tr.label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{tr.description}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                  <div>
                    <p className="text-lg font-black text-[#1E3A8A]">
                      {tr.amountFcfa.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {isPaid ? `Réglé le ${tr.paidAt} (${tr.method})` : `Date limite : ${tr.dueDate}`}
                    </p>
                  </div>

                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() =>
                        triggerToast(`Reçu PDF officiel "${tr.quitusCode}" téléchargé avec succès !`)
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-[#1E3A8A] hover:bg-blue-50"
                    >
                      <Receipt className="h-4 w-4 text-[#0D9488]" />
                      <span>Télécharger Quitus</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedTranche(tr)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-blue-900"
                    >
                      <CreditCard className="h-4 w-4 text-amber-300" />
                      <span>Payer maintenant</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment History Table */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Historique des Transactions & Reçus PDF</h2>
            <p className="text-xs text-slate-500">Journal certifié des règlements Mobile Money & Banque</p>
          </div>
          <Clock className="h-5 w-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Référence Quitus</th>
                <th className="py-3 px-3">Libellé</th>
                <th className="py-3 px-3">Canal de paiement</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Montant</th>
                <th className="py-3 px-3 text-right">Reçu PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-3 font-mono font-bold text-[#1E3A8A]">{item.reference}</td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900">{item.label}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-700">{item.method}</span>
                    <span className="block text-[11px] text-slate-400">{item.phoneOrAccount}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{item.date}</td>
                  <td className="py-3.5 px-3 font-black text-emerald-700">
                    {item.amountFcfa.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => triggerToast(`Reçu PDF "${item.reference}.pdf" téléchargé !`)}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-extrabold text-[#1E3A8A] hover:bg-blue-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Reçu PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Payment Modal */}
      {selectedTranche && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={handleConfirmPayment}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D9488]">
                  Guichet Numérique Sécurisé UY1
                </span>
                <h3 className="text-lg font-black text-slate-900">{selectedTranche.label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTranche(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Montant à régler</span>
              <span className="text-xl font-black text-[#1E3A8A]">
                {selectedTranche.amountFcfa.toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700">
                Choisir le mode de paiement :
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    {
                      id: 'MTN Mobile Money',
                      badge: 'MTN MoMo',
                      sub: 'USSD *126# instantané',
                      icon: Smartphone,
                    },
                    {
                      id: 'Orange Money',
                      badge: 'Orange Money',
                      sub: 'USSD #150# instantané',
                      icon: Smartphone,
                    },
                    {
                      id: 'Carte Bancaire',
                      badge: 'Carte Visa / GIMAC',
                      sub: '3D Secure CEMAC',
                      icon: CreditCard,
                    },
                    {
                      id: 'Espèces / Quittance banque',
                      badge: 'Quittance Banque',
                      sub: 'BICEC / Afriland UY1',
                      icon: Building2,
                    },
                  ] as const
                ).map((m) => {
                  const Icon = m.icon
                  const active = paymentMethod === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex items-start gap-2.5 rounded-2xl border p-3 text-left transition-all ${
                        active
                          ? 'border-[#1E3A8A] bg-blue-50/70 ring-2 ring-[#1E3A8A]/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[#1E3A8A] mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-slate-900">{m.badge}</p>
                        <p className="text-[10px] text-slate-500">{m.sub}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {paymentMethod === 'Espèces / Quittance banque' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Numéro de bordereau / Quittance bancaire
                </label>
                <input
                  type="text"
                  value={bankRefInput}
                  onChange={(e) => setBankRefInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono font-bold"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {paymentMethod === 'Carte Bancaire'
                    ? 'Numéro de téléphone pour reçu SMS (+237)'
                    : `Numéro ${paymentMethod} (+237 6...)`}
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+237 6 77 00 00 00"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono font-bold"
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTranche(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={processing}
                className="rounded-xl bg-[#0D9488] px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-teal-700 disabled:opacity-50"
              >
                {processing
                  ? 'Validation du quitus…'
                  : `Confirmer ${selectedTranche.amountFcfa.toLocaleString('fr-FR')} FCFA`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
