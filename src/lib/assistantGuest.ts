import { ASSISTANT_NAME } from './assistant.ts'
import { CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP_URL } from './contactInfo.ts'

/**
 * Réponses locales d'Uni pour les visiteurs non connectés. Le service
 * `/assistant` (Gemini) est réservé aux comptes UniFlow — un visiteur anonyme
 * ne doit pas pouvoir consommer la clé — mais Uni reste présent sur le site
 * public pour orienter : c'est un petit guide scripté, testé, sans réseau.
 */

export type GuestLink = { label: string; to: string }

export type GuestReply = { text: string; links: GuestLink[] }

export const GUEST_GREETING = `Salut ! Je suis ${ASSISTANT_NAME}, la mascotte d'UniFlow. Je peux te présenter la plateforme, les tarifs ou l'inscription. Connecte-toi pour que je t'aide avec ton emploi du temps et tes cours.`

export const GUEST_SUGGESTIONS = ["C'est quoi UniFlow ?", 'Comment créer un compte ?', 'Quels sont les tarifs ?', 'Sur quelles plateformes ?']

const LOGIN: GuestLink = { label: 'Se connecter', to: '/login' }
const REGISTER: GuestLink = { label: 'Créer un compte étudiant', to: '/register' }
const PRICING: GuestLink = { label: 'Voir les tarifs', to: '/pricing' }
const CONTACT: GuestLink = { label: 'Nous écrire', to: '/contact' }
const ABOUT: GuestLink = { label: 'À propos', to: '/about' }
const FORUM: GuestLink = { label: 'Ouvrir le forum', to: '/forum' }

function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function guestReply(question: string): GuestReply {
  const q = normalize(question)
  if (/(tarif|prix|abonnement|payer|paiement|gratuit|combien|whatsapp|facture)/.test(q)) {
    return {
      text: `Les comptes universitaires (étudiants, enseignants, administration) sont gratuits pour les universités partenaires. Les offres payantes (compte indépendant, options) se règlent uniquement par WhatsApp au ${CONTACT_PHONE_DISPLAY} — jamais par carte dans l'application.`,
      links: [PRICING, { label: 'WhatsApp facturation', to: CONTACT_WHATSAPP_URL }],
    }
  }
  if (/(inscri|creer un compte|compte|enregistr|admin|enseignant|delegue|professeur)/.test(q)) {
    return {
      text: "Seuls les étudiants s'inscrivent librement, avec leur université, faculté, filière et niveau. Les comptes enseignant, délégué et administration sont créés par l'administration de l'université ; les comptes administration, uniquement par l'administrateur de la plateforme.",
      links: [REGISTER, LOGIN],
    }
  }
  if (/(mot de passe|connexion|connecter|login|oublie)/.test(q)) {
    return {
      text: "Connecte-toi avec l'adresse e-mail de ton compte. Mot de passe oublié ? Le lien « Mot de passe oublié » de la page de connexion t'envoie un e-mail de réinitialisation.",
      links: [LOGIN, { label: 'Mot de passe oublié', to: '/mot-de-passe-oublie' }],
    }
  }
  if (/(mobile|android|ios|telephone|desktop|ordinateur|bureau|application|appli|hors ligne|offline|visio)/.test(q)) {
    return {
      text: "UniFlow existe sur le web, sur mobile (Android) et sur ordinateur. Les applications mobile et desktop fonctionnent hors ligne à partir des données déjà synchronisées ; l'application de bureau porte en plus la visioconférence locale avec feuille de présence.",
      links: [{ label: 'Présentation', to: '/presentation' }, ABOUT],
    }
  }
  if (/(emploi du temps|cours|note|presence|devoir|bibliotheque|message|forum)/.test(q)) {
    return {
      text: "Emploi du temps par filière et niveau, unités d'enseignement, devoirs, notes, présences par QR code, bibliothèque, messagerie et forum : tout est là une fois connecté. Le forum, lui, est ouvert à tous.",
      links: [LOGIN, FORUM],
    }
  }
  if (/(uniflow|c'est quoi|quoi|kernel|equipe|qui)/.test(q)) {
    return {
      text: "UniFlow est la plateforme académique de KERNEL FORGE, née à la Faculté des Sciences de l'Université de Yaoundé I : elle réunit l'emploi du temps, les cours, les présences, les notes et la communication d'une université, sur le web, le mobile et le bureau.",
      links: [ABOUT, { label: "L'équipe", to: '/teams' }],
    }
  }
  return {
    text: `Je réponds en détail (emploi du temps, cours, notes…) une fois que tu es connecté. En attendant, l'équipe te répond sur le forum ou par message.`,
    links: [LOGIN, FORUM, CONTACT],
  }
}
