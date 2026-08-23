import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, ExternalLink, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'
import { subscriptionApi, type SubscriptionPaymentRequest } from '../../lib/api'

const money = (amount: number, currency: string) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

export default function AdminPaymentsPage() {
  const [requests, setRequests] = useState<SubscriptionPaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<SubscriptionPaymentRequest['status'] | 'ALL'>('PENDING')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setRequests(await subscriptionApi.listPaymentRequestsForAdmin(filter === 'ALL' ? undefined : filter))
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de charger les demandes Appwrite.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [filter])

  const pendingCount = useMemo(() => requests.filter((request) => request.status === 'PENDING').length, [requests])

  const review = async (request: SubscriptionPaymentRequest, decision: 'CONFIRMED' | 'REJECTED') => {
    const note = window.prompt(decision === 'CONFIRMED' ? 'Note de validation (facultative). Vérifiez la preuve reçue hors UniFlow avant de confirmer.' : 'Motif du rejet (facultatif).') ?? ''
    setWorkingId(request.id)
    setError(null)
    try {
      await subscriptionApi.reviewPaymentRequest(request.id, decision, note)
      await load()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Le traitement de la demande a échoué.')
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-[#172554] to-[#1e3a8a] p-6 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Contrôle manuel requis</p>
            <h1 className="mt-1 text-2xl font-black">Demandes de paiement WhatsApp</h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100">Chaque demande est créée dans Appwrite avec une référence unique. Confirmez seulement après vérification de la preuve reçue au +237 657 635 644 ; la confirmation active alors le statut d’abonnement Appwrite.</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center"><p className="text-2xl font-black">{pendingCount}</p><p className="text-[11px] font-semibold text-blue-100">en attente dans la vue</p></div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {(['PENDING', 'CONFIRMED', 'REJECTED', 'ALL'] as const).map((status) => <button key={status} onClick={() => setFilter(status)} className={`rounded-xl px-3 py-2 text-xs font-bold ${filter === status ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{status === 'ALL' ? 'Toutes' : status === 'PENDING' ? 'En attente' : status === 'CONFIRMED' ? 'Confirmées' : 'Rejetées'}</button>)}
          </div>
          <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualiser</button>
        </div>
        {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {loading ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"><RefreshCw className="h-5 w-5 animate-spin" />Chargement depuis Appwrite…</div> : requests.length === 0 ? <div className="py-16 text-center text-sm text-slate-500">Aucune demande ne correspond au filtre sélectionné.</div> : <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Référence</th><th className="px-3 py-3">Demandeur</th><th className="px-3 py-3">Formule</th><th className="px-3 py-3">Demande</th><th className="px-3 py-3">État</th><th className="px-3 py-3 text-right">Contrôle</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-b border-slate-100 align-top"><td className="px-3 py-4"><p className="font-mono text-xs font-bold text-slate-900">{request.reference}</p><p className="mt-1 text-[11px] text-slate-500">{request.billingCycle === 'ANNUALLY' ? 'Annuel' : 'Mensuel'}</p></td><td className="px-3 py-4"><p className="font-semibold text-slate-900">{request.fullName}</p><p className="text-xs text-slate-500">{request.email}</p></td><td className="px-3 py-4"><p className="font-semibold text-slate-900">{request.planName}</p><p className="text-xs text-teal-700">{money(request.amount, request.currency)}</p></td><td className="px-3 py-4 text-xs text-slate-600">{new Date(request.requestedAt).toLocaleString('fr-FR')}</td><td className="px-3 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${request.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : request.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{request.status === 'PENDING' ? <Clock3 className="h-3 w-3" /> : request.status === 'CONFIRMED' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{request.status}</span>{request.adminNote && <p className="mt-1 max-w-[180px] text-[11px] text-slate-500">{request.adminNote}</p>}</td><td className="px-3 py-4"><div className="flex justify-end gap-2">{request.whatsappUrl && <a href={request.whatsappUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Ouvrir la référence WhatsApp"><ExternalLink className="h-4 w-4" /></a>}{request.status === 'PENDING' && <><button disabled={workingId === request.id} onClick={() => void review(request, 'REJECTED')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Rejeter</button><button disabled={workingId === request.id} onClick={() => void review(request, 'CONFIRMED')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"><ShieldCheck className="h-3.5 w-3.5" />Confirmer</button></>}</div></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  )
}
