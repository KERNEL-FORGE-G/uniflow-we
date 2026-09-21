import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, CheckCircle2, Clock3, CircleDollarSign, ExternalLink, MessageCircle, RefreshCw, XCircle } from 'lucide-react'
import { subscriptionApi, type SubscriptionPaymentRequest } from '@/lib/api'
import { CONTACT_PHONE_DISPLAY } from '@/lib/contactInfo'
import { billingCycleLabel, formatMoney, PAYMENT_STATUS_LABELS, type PaymentRequestStatus } from '@/lib/paymentsModel'
import { PageHeader } from '@/components/layout/Page'
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus'
import { ActionResultSlot, type ActionResultProps } from '@/components/feedback/ActionResult'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { UniMascot } from '@/components/mascot/UniMascot'
import { cn } from '@/utils/cn'

const STATUS_STYLE: Record<PaymentRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

const STATUS_ICON: Record<PaymentRequestStatus, typeof Clock3> = { PENDING: Clock3, CONFIRMED: CheckCircle2, REJECTED: XCircle, CANCELLED: XCircle }

const STATUS_HINT: Record<PaymentRequestStatus, string> = {
  PENDING: `En attente de votre preuve de paiement sur WhatsApp (${CONTACT_PHONE_DISPLAY}) et de la vérification par l’administration.`,
  CONFIRMED: 'Paiement vérifié : l’abonnement correspondant est actif.',
  REJECTED: 'Demande refusée. Le motif est indiqué ci-dessous ; vous pouvez refaire une demande.',
  CANCELLED: 'Demande annulée.',
}

/**
 * Espace « Abonnement » du compte connecté : l'état de la souscription et
 * l'historique des demandes de paiement WhatsApp (référence, montant, décision
 * et motif de l'administration).
 *
 * Avant cette page, une personne qui avait fermé l'onglet WhatsApp n'avait
 * aucun moyen de retrouver sa référence ni de savoir si sa demande avait été
 * validée ou refusée : le seul retour était le bandeau « en attente » du
 * tableau de bord, sans historique ni motif de rejet.
 */
export default function BillingPage() {
  const [requests, setRequests] = useState<SubscriptionPaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ActionResultProps | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setResult(null)
    try {
      setRequests(await subscriptionApi.listPaymentRequests())
    } catch (error) {
      setResult({ status: 'error', title: 'Historique indisponible', description: 'Vos demandes de paiement n’ont pas pu être lues.', detail: error instanceof Error ? error.message : undefined, actions: [{ label: 'Réessayer', onClick: () => void load() }] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const pending = useMemo(() => requests.filter((request) => request.status === 'PENDING'), [requests])
  const latestPlanCode = requests[0]?.planCode

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <PageHeader
        eyebrow="Mon compte"
        title="Abonnement et paiements"
        description={`Le règlement se fait par WhatsApp au ${CONTACT_PHONE_DISPLAY} : chaque demande reçoit une référence, puis l’administration UniFlow vérifie la preuve et active l’abonnement.`}
        actions={(
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Actualiser
            </button>
            <Link to={latestPlanCode ? `/subscribe/${latestPlanCode}` : '/pricing'} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:opacity-95">
              <CircleDollarSign className="h-4 w-4" /> {requests.some((request) => request.status === 'CONFIRMED') ? 'Renouveler' : 'Souscrire'}
            </Link>
          </div>
        )}
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <SubscriptionStatus />
      </motion.div>

      <ActionResultSlot result={result} />

      {pending.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center dark:border-amber-800 dark:bg-amber-950/30"
          aria-live="polite"
        >
          <UniMascot pose="pointing" size={96} still className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-amber-900 dark:text-amber-100">{pending.length > 1 ? `${pending.length} demandes attendent votre preuve de paiement` : 'Une demande attend votre preuve de paiement'}</h2>
            <p className="mt-1 text-xs leading-5 text-amber-900/80 dark:text-amber-100/80">Envoyez le message pré-rempli sur WhatsApp avec votre capture Orange Money, MTN MoMo ou virement, en gardant la référence dans le message. L’activation suit la vérification.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pending.map((request) => request.whatsappUrl && (
                <a key={request.id} href={request.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-emerald-700">
                  <MessageCircle className="h-4 w-4" /> Ouvrir WhatsApp · {request.reference}
                </a>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Historique des demandes</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{loading ? 'Chargement…' : `${requests.length} demande${requests.length > 1 ? 's' : ''} enregistrée${requests.length > 1 ? 's' : ''}`}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-20" />)}</div>
        ) : requests.length === 0 ? (
          <div className="px-6 pb-8">
            <EmptyState mascot="search" title="Aucune demande de paiement" description="Choisissez une formule : une référence sera créée et WhatsApp s’ouvrira avec le message à envoyer." className="pb-4" />
            <div className="text-center"><Link to="/pricing" className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#2d4fa8]">Voir les formules</Link></div>
          </div>
        ) : (
          <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="divide-y divide-slate-100 dark:divide-slate-800">
            {requests.map((request) => {
              const Icon = STATUS_ICON[request.status]
              return (
                <motion.li key={request.id} variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', STATUS_STYLE[request.status])}><Icon className="h-3 w-3" />{PAYMENT_STATUS_LABELS[request.status]}</span>
                      <span className="select-all font-mono text-xs font-bold text-slate-900 dark:text-white">{request.reference}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">{request.planName} <span className="text-xs font-normal text-slate-500">· {billingCycleLabel(request.billingCycle)}</span></p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{STATUS_HINT[request.status]}</p>
                    {request.institution && <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1e3a8a] dark:text-blue-300"><Building2 className="h-3 w-3" />{request.institution}</p>}
                    {request.status === 'REJECTED' && request.adminNote && (
                      <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100"><strong>Motif :</strong> {request.adminNote}</p>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <p className="text-base font-black text-[#0d9488]">{formatMoney(request.amount, request.currency)}</p>
                    <p className="mt-1">Demandée le {new Date(request.requestedAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    {request.processedAt && <p className="mt-0.5 text-slate-400">Traitée le {new Date(request.processedAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</p>}
                  </div>
                  <div className="flex gap-2 sm:justify-end">
                    {request.status === 'PENDING' && request.whatsappUrl && (
                      <a href={request.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                    )}
                    {request.status === 'REJECTED' && (
                      <Link to={`/subscribe/${request.planCode}`} className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#2d4fa8]"><ExternalLink className="h-4 w-4" /> Refaire la demande</Link>
                    )}
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </section>
    </div>
  )
}
