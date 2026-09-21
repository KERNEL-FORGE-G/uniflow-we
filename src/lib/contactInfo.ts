/**
 * Coordonnées publiques d'UniFlow / KERNEL FORGE, en un seul endroit.
 *
 * Le numéro de téléphone est aussi celui de la facturation : toute demande
 * d'abonnement se règle par WhatsApp à ce numéro (consigne du propriétaire,
 * 2026-09-20). La page Contact affichait « Coordonnée en attente de
 * confirmation » alors que le numéro existe : on le publie ici.
 *
 * Le périmètre couvert n'est plus « UY1 / ICT4D / L1 » : les emplois du temps
 * 2026-2027 de toute la Faculté des Sciences (Maths, Physique, Chimie, Info,
 * Géosciences, Énergies renouvelables… L1 à M1) alimentent le référentiel.
 */
export const CONTACT_WHATSAPP_E164 = '237657635644'
export const CONTACT_PHONE_DISPLAY = '+237 6 57 63 56 44'
export const CONTACT_WHATSAPP_URL = `https://wa.me/${CONTACT_WHATSAPP_E164}`
export const CONTACT_PHONE_URL = `tel:+${CONTACT_WHATSAPP_E164}`

export const CONTACT_EMAIL_PRIMARY = 'ravelnghomsi@gmail.com'
export const CONTACT_EMAIL_SECONDARY = 'uniflow@kernelforge.codes'

/** Groupe WhatsApp public de KERNEL FORGE (lien fourni par le propriétaire le 2026-09-21). */
export const KERNEL_FORGE_WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/IFkGMr4Ev2KCFAKw9EmEde'
export const KERNEL_FORGE_GITHUB_URL = 'https://github.com/KERNEL-FORGE-G'

export const COVERAGE_UNIVERSITY = 'Université de Yaoundé I'
export const COVERAGE_FACULTY = 'Faculté des Sciences'
export const COVERAGE_LABEL = `${COVERAGE_UNIVERSITY} — ${COVERAGE_FACULTY}`
export const COVERAGE_SHORT = 'UY1 · Faculté des Sciences'

/** Lien WhatsApp avec un message pré-rempli (encodé pour l'URL). */
export function whatsappUrlWithMessage(message: string): string {
  return `${CONTACT_WHATSAPP_URL}?text=${encodeURIComponent(message)}`
}
