/**
 * Logique pure du service `/subscription-payments`, isolée pour `node --test`.
 *
 * Le seul canal de facturation est le WhatsApp de facturation UniFlow : le
 * client est renvoyé vers `wa.me` avec un message pré-rempli, et
 * l'administration valide ou rejette la demande depuis sa page « Paiements ».
 */

export const WHATSAPP_NUMBER = '237657635644'
export const REQUEST_STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED']

/**
 * Décision d'administration à partir de l'action et du corps.
 *
 * `validate` / `reject` sont les actions nommées par le propriétaire ;
 * `review` + `decision` est la forme historique, conservée pour les clients
 * déjà déployés. « VALIDATED » demandé par le propriétaire n'existe pas dans
 * l'énumération `status` du schéma (PENDING, CONFIRMED, REJECTED, CANCELLED) :
 * il est traduit en CONFIRMED, que l'interface affiche « Validé ».
 */
export function decisionOf(action, body = {}) {
  if (action === 'validate') return 'CONFIRMED'
  if (action === 'reject') return 'REJECTED'
  if (action === 'review') {
    const raw = String(body.decision || '').toUpperCase()
    if (raw === 'CONFIRMED' || raw === 'VALIDATED') return 'CONFIRMED'
    if (raw === 'REJECTED') return 'REJECTED'
  }
  return ''
}

/** Le rejet exige un motif : l'administration doit dire pourquoi au client. */
export function rejectionReasonError(decision, adminNote) {
  return decision === 'REJECTED' && !(typeof adminNote === 'string' && adminNote.trim()) ? 'INVALID_ADMIN_NOTE' : ''
}

export function whatsappUrl(request, number = WHATSAPP_NUMBER) {
  const text = [
    'Bonjour UniFlow,',
    'je souhaite régler mon abonnement.',
    `Référence : ${request.reference}`,
    `Formule : ${request.planName} (${request.billingCycle === 'ANNUALLY' ? 'annuel' : 'mensuel'})`,
    `Montant : ${request.amount} ${request.currency}`,
    `Nom : ${request.fullName}`,
    `Compte : ${request.email}`,
    'Je joins ma preuve de paiement à ce message.',
  ].join('\n')
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

/** Lien vers la conversation WhatsApp du client, si un numéro est connu. */
export function customerWhatsappUrl(phoneNumber) {
  const digits = String(phoneNumber || '').replace(/[^\d]/g, '')
  if (digits.length < 8) return ''
  return `https://wa.me/${digits}`
}

/** Filtres de la liste d'administration : statut, formule, période, texte. */
export function matchesAdminFilters(request, filters = {}) {
  if (filters.status && REQUEST_STATUSES.includes(filters.status) && request.status !== filters.status) return false
  if (filters.planCode && request.planCode !== filters.planCode) return false
  const requestedAt = new Date(request.requestedAt || 0).getTime()
  if (filters.from && requestedAt < new Date(filters.from).getTime()) return false
  if (filters.to && requestedAt > new Date(filters.to).getTime()) return false
  if (filters.search) {
    const needle = String(filters.search).trim().toLowerCase()
    const haystack = `${request.fullName || ''} ${request.email || ''} ${request.reference || ''}`.toLowerCase()
    if (needle && !haystack.includes(needle)) return false
  }
  return true
}
