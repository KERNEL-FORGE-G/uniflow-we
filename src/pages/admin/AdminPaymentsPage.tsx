import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock3, CircleDollarSign, Loader2, MessageCircle, RefreshCw, Search, ShieldCheck, XCircle } from 'lucide-react'
import { subscriptionApi, type SubscriptionPaymentRequest } from '@/lib/api'
import { CONTACT_PHONE_DISPLAY } from '@/lib/contactInfo'
import { DEFAULT_PAYMENT_FILTERS, formatMoney, matchesPaymentFilters, PAYMENT_STATUS_LABELS, rejectionReasonProblem, type AdminPaymentFilterState, type PaymentRequestStatus } from '@/lib/paymentsModel'
import { ActionResultSlot, type ActionResultProps } from '@/components/feedback/ActionResult'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

const STATUS_STYLE: Record<PaymentRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

const STATUS_ICON: Record<PaymentRequestStatus, typeof Clock3> = { PENDING: Clock3, CONFIRMED: CheckCircle2, REJECTED: XCircle, CANCELLED: XCircle }

type Decision = { kind: 'validate' | 'reject'; request: SubscriptionPaymentRequest }

/**
 * Page « Paiements » (ADMIN / superadmin). Les demandes naissent quand un
 * client clique « Payer par WhatsApp » ; l'administration rapproche la preuve
 * reçue au numéro de facturation et valide (active l'abonnement) ou rejette
 * (motif obligatoire, transmis au client).
 */
export default function AdminPaymentsPage() {
  const [requests, setRequests] = useState<SubscriptionPaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ActionResultProps | null>(null)
  const [filters, setFilters] = useState<AdminPaymentFilterState>(DEFAULT_PAYMENT_FILTERS)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [note, setNote] = useState('')
  const [working, setWorking] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // On charge tout et on filtre localement : les filtres réagissent sans aller-retour réseau.
      setRequests(await subscriptionApi.listPaymentRequestsForAdmin({}))
    } catch (error) {
      setResult({ status: 'error', title: 'Demandes indisponibles', description: 'La liste des demandes de paiement n’a pas pu être lue.', detail: error instanceof Error ? error.message : undefined, actions: [{ label: 'Réessayer', onClick: () => void load() }] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const visible = useMemo(() => requests.filter((request) => matchesPaymentFilters(request, filters)), [requests, filters])
  const plans = useMemo(() => Array.from(new Map(requests.map((request) => [request.planCode, request.planName])).entries()), [requests])
  const totals = useMemo(() => ({
    pending: requests.filter((request) => request.status === 'PENDING').length,
    confirmedAmount: requests.filter((request) => request.status === 'CONFIRMED').reduce((sum, request) => sum + request.amount, 0),
    currency: requests[0]?.currency ?? 'XAF',
  }), [requests])

  const openDecision = (kind: Decision['kind'], request: SubscriptionPaymentRequest) => { setNote(''); setDecision({ kind, request }) }

  const confirmDecision = async () => {
    if (!decision) return
    if (decision.kind === 'reject') {
      const problem = rejectionReasonProblem(note)
      if (problem) return setResult({ status: 'warning', title: 'Motif requis', description: problem })
    }
    setWorking(true)
    setResult(null)
    try {
      if (decision.kind === 'validate') {
        await subscriptionApi.validatePaymentRequest(decision.request.id, note.trim())
        setResult({ status: 'success', title: 'Paiement validé', description: `La demande ${decision.request.reference} est confirmée : l’abonnement ${decision.request.planName} de ${decision.request.fullName} est actif.` })
      } else {
        await subscriptionApi.rejectPaymentRequest(decision.request.id, note.trim())
        setResult({ status: 'success', title: 'Demande rejetée', description: `${decision.request.fullName} verra le motif : « ${note.trim()} ».` })
      }
      setDecision(null)
      await load()
    } catch (error) {
      setResult({ status: 'error', title: 'Décision refusée', description: 'Le serveur n’a pas enregistré la décision.', detail: error instanceof Error ? error.message : undefined })
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172554] to-[#1e3a8a] p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Facturation</p>
            <h1 className="mt-1 text-2xl font-black">Paiements WhatsApp</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Chaque demande porte une référence unique. Validez seulement après avoir reçu la preuve de paiement au <strong className="text-white">{CONTACT_PHONE_DISPLAY}</strong> : la validation active l’abonnement dans Appwrite.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="en attente" value={loading ? '…' : String(totals.pending)} />
            <Stat label="encaissé (validé)" value={loading ? '…' : formatMoney(totals.confirmedAmount, totals.currency)} />
          </div>
        </div>
      </section>

      <ActionResultSlot result={result} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]">
          <label className="relative block">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Nom, email, référence…" className={cn(fieldClass, 'pl-9')} />
          </label>
          <select value={filters.planCode} onChange={(event) => setFilters({ ...filters, planCode: event.target.value })} className={fieldClass} aria-label="Formule">
            <option value="">Toutes les formules</option>
            {plans.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
          <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className={fieldClass} aria-label="Du" />
          <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className={fieldClass} aria-label="Au" />
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"><RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Actualiser</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Statut">
          {(['PENDING', 'CONFIRMED', 'REJECTED', 'ALL'] as const).map((status) => (
            <button key={status} role="tab" aria-selected={filters.status === status} onClick={() => setFilters({ ...filters, status })} className={cn('rounded-xl px-3 py-2 text-xs font-bold transition', filters.status === status ? 'bg-[#1e3a8a] text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
              {status === 'ALL' ? 'Toutes' : PAYMENT_STATUS_LABELS[status]}
              {status === 'PENDING' && totals.pending > 0 && <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px]">{totals.pending}</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14" />)}</div>
        ) : visible.length === 0 ? (
          <EmptyState icon={CircleDollarSign} title={requests.length === 0 ? 'Aucune demande de paiement' : 'Aucune demande ne correspond aux filtres'} description={requests.length === 0 ? 'Les demandes apparaissent ici dès qu’un client clique « Payer par WhatsApp ».' : 'Élargissez la période ou changez de statut.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Référence</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Formule</th><th className="px-4 py-3">Demandée le</th><th className="px-4 py-3">État</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <motion.tbody initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.03 } } }}>
                {visible.map((request) => {
                  const Icon = STATUS_ICON[request.status]
                  return (
                    <motion.tr key={request.id} variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }} className="border-b border-slate-100 align-top transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-4"><p className="font-mono text-xs font-bold text-slate-900">{request.reference}</p><p className="mt-1 text-[11px] text-slate-500">{request.billingCycle === 'ANNUALLY' ? 'Annuel' : 'Mensuel'} · WhatsApp</p></td>
                      <td className="px-4 py-4"><p className="font-semibold text-slate-900">{request.fullName}</p><p className="text-xs text-slate-500">{request.email}</p>{request.phoneNumber && <p className="text-xs text-slate-500">{request.phoneNumber}</p>}</td>
                      <td className="px-4 py-4"><p className="font-semibold text-slate-900">{request.planName}</p><p className="text-xs font-bold text-teal-700">{formatMoney(request.amount, request.currency)}</p></td>
                      <td className="px-4 py-4 text-xs text-slate-600">{new Date(request.requestedAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}{request.processedAt && <p className="mt-1 text-[11px] text-slate-400">Traitée le {new Date(request.processedAt).toLocaleDateString('fr-FR')}</p>}</td>
                      <td className="px-4 py-4">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', STATUS_STYLE[request.status])}><Icon className="h-3 w-3" />{PAYMENT_STATUS_LABELS[request.status]}</span>
                        {request.adminNote && <p className="mt-1.5 max-w-[220px] text-[11px] leading-4 text-slate-500">{request.adminNote}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {request.customerWhatsappUrl && <a href={request.customerWhatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100" title="Ouvrir la conversation WhatsApp avec le client"><MessageCircle className="h-4 w-4" /><span className="hidden xl:inline">WhatsApp</span></a>}
                          {request.status === 'PENDING' && (
                            <>
                              <button type="button" onClick={() => openDecision('reject', request)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50">Rejeter</button>
                              <button type="button" onClick={() => openDecision('validate', request)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Valider</button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          </div>
        )}
      </section>

      <AnimatePresence>
        {decision && (
          <Modal onClose={() => !working && setDecision(null)} title={decision.kind === 'validate' ? 'Valider le paiement' : 'Rejeter la demande'} icon={decision.kind === 'validate' ? ShieldCheck : XCircle} tone={decision.kind === 'validate' ? 'default' : 'danger'}>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <p className="font-mono text-xs font-bold text-slate-900">{decision.request.reference}</p>
              <p className="mt-1 font-semibold text-slate-900">{decision.request.fullName} · {decision.request.planName}</p>
              <p className="text-xs text-slate-500">{formatMoney(decision.request.amount, decision.request.currency)} · {decision.request.billingCycle === 'ANNUALLY' ? 'annuel' : 'mensuel'}</p>
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">{decision.kind === 'validate' ? 'Note interne (facultative)' : 'Motif du rejet (transmis au client)'}{decision.kind === 'reject' && <span className="text-rose-500"> *</span>}</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} autoFocus placeholder={decision.kind === 'validate' ? 'Ex : preuve Orange Money reçue le 20/09.' : 'Ex : montant reçu inférieur au tarif, ou preuve illisible.'} className={cn(fieldClass, 'resize-none')} />
            </label>
            {decision.kind === 'validate' && <p className="mt-2 text-xs text-slate-500">Vérifiez la preuve reçue sur WhatsApp avant de valider : l’abonnement s’active immédiatement.</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDecision(null)} disabled={working} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Annuler</button>
              <button type="button" onClick={() => void confirmDecision()} disabled={working} className={cn('inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow transition disabled:opacity-60', decision.kind === 'validate' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700')}>
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : decision.kind === 'validate' ? <ShieldCheck className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {decision.kind === 'validate' ? 'Valider et activer' : 'Rejeter'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center">
      <p className="text-xl font-black leading-tight">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-blue-100">{label}</p>
    </div>
  )
}
