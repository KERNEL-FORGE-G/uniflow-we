/**
 * Logique pure de la facturation côté client (testée sous `node --test`).
 * Le paiement en ligne n'existe pas : toute demande se règle par WhatsApp au
 * numéro de facturation, avec un message pré-rempli reprenant la référence
 * créée par la Function `/subscription-payments`.
 */
import { whatsappUrlWithMessage } from './contactInfo.ts'

export type PaymentRequestStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'

export const PAYMENT_STATUS_LABELS: Record<PaymentRequestStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Validée',
  REJECTED: 'Rejetée',
  CANCELLED: 'Annulée',
}

export interface WhatsappBillingInput {
  reference: string
  planName: string
  billingCycle: 'MONTHLY' | 'ANNUALLY'
  amount: number
  currency: string
  fullName?: string
  email?: string
}

export function formatMoney(amount: number, currency: string): string {
  const code = currency === 'EUR' || currency === 'USD' ? currency : 'XAF'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(amount)
}

export function billingCycleLabel(cycle: 'MONTHLY' | 'ANNUALLY'): string {
  return cycle === 'ANNUALLY' ? 'annuel' : 'mensuel'
}

/** Message envoyé au numéro de facturation : la référence est la clé de rapprochement. */
export function whatsappBillingMessage(input: WhatsappBillingInput): string {
  const lines = [
    `Bonjour UniFlow, je souhaite régler mon abonnement ${input.planName} (${billingCycleLabel(input.billingCycle)}) de ${formatMoney(input.amount, input.currency)}.`,
    `Référence : ${input.reference}`,
  ]
  if (input.fullName) lines.push(`Nom : ${input.fullName}`)
  if (input.email) lines.push(`Email : ${input.email}`)
  lines.push('Merci de m’indiquer les modalités de paiement.')
  return lines.join('\n')
}

export function whatsappBillingUrl(input: WhatsappBillingInput): string {
  return whatsappUrlWithMessage(whatsappBillingMessage(input))
}

/** Le motif de rejet est obligatoire : il est transmis au client. */
export function rejectionReasonProblem(reason: string): string | null {
  const trimmed = reason.trim()
  if (trimmed.length < 4) return 'Indiquez un motif de rejet (au moins 4 caractères) : il sera transmis au client.'
  if (trimmed.length > 1000) return 'Le motif dépasse 1000 caractères.'
  return null
}

export interface AdminPaymentRow {
  status: PaymentRequestStatus
  planCode: string
  requestedAt: string
  fullName: string
  email: string
  reference: string
}

export interface AdminPaymentFilterState {
  status: PaymentRequestStatus | 'ALL'
  planCode: string
  from: string
  to: string
  search: string
}

export const DEFAULT_PAYMENT_FILTERS: AdminPaymentFilterState = { status: 'PENDING', planCode: '', from: '', to: '', search: '' }

/** Miroir client de `matchesAdminFilters` (Function) pour filtrer sans rappel réseau. */
export function matchesPaymentFilters(row: AdminPaymentRow, filters: AdminPaymentFilterState): boolean {
  if (filters.status !== 'ALL' && row.status !== filters.status) return false
  if (filters.planCode && row.planCode !== filters.planCode) return false
  const requestedAt = new Date(row.requestedAt).getTime()
  if (filters.from && requestedAt < new Date(filters.from).getTime()) return false
  if (filters.to) {
    // La borne « au » est inclusive : jusqu'à la fin du jour choisi.
    const end = new Date(filters.to)
    end.setHours(23, 59, 59, 999)
    if (requestedAt > end.getTime()) return false
  }
  const needle = filters.search.trim().toLowerCase()
  if (needle && !`${row.fullName} ${row.email} ${row.reference}`.toLowerCase().includes(needle)) return false
  return true
}
