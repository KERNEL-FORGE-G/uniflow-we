import { CONTACT_EMAIL_PRIMARY, CONTACT_EMAIL_SECONDARY, CONTACT_PHONE_DISPLAY, COVERAGE_LABEL } from '../lib/contactInfo'

/**
 * Textes juridiques d'UniFlow : conditions générales d'utilisation,
 * politique de confidentialité, mentions légales et droits des utilisateurs.
 *
 * Un seul module de données, rendu par `LegalDocumentPage` : les quatre pages
 * partagent la mise en page, la table des matières et le pied « nous
 * contacter ». Le mobile et le desktop reprennent les mêmes textes (fichier
 * `legal_texts.dart`) pour qu'un utilisateur lise la même chose partout.
 *
 * Les faits énoncés viennent de l'architecture réelle : Appwrite Cloud
 * (Francfort), Vercel pour le site, Gemini / Mistral pour l'assistant Flo,
 * facturation par WhatsApp, suppression de compte depuis les réglages.
 */

export const LEGAL_UPDATED_AT = '21 septembre 2026'
export const LEGAL_PUBLISHER = 'KERNEL FORGE'

export type LegalSection = { id: string; title: string; paragraphs: string[]; bullets?: string[] }

export type LegalDocument = {
  slug: 'cgu' | 'confidentialite' | 'mentions-legales' | 'droits-des-utilisateurs'
  path: string
  title: string
  shortTitle: string
  intro: string
  sections: LegalSection[]
}

export const TERMS: LegalDocument = {
  slug: 'cgu',
  path: '/cgu',
  title: "Conditions générales d'utilisation",
  shortTitle: 'CGU',
  intro: `Les présentes conditions encadrent l'utilisation de la plateforme UniFlow (site web, application mobile et application de bureau) éditée par ${LEGAL_PUBLISHER}. En créant un compte ou en utilisant UniFlow, vous les acceptez.`,
  sections: [
    {
      id: 'objet',
      title: '1. Objet du service',
      paragraphs: [
        `UniFlow est une plateforme académique qui centralise, pour ${COVERAGE_LABEL} et les établissements partenaires, l'emploi du temps par filière et niveau, les unités d'enseignement, les devoirs, les notes, les présences (émargement par QR code), la bibliothèque de documents, la messagerie, le forum et les notifications. Un espace personnel est proposé aux comptes indépendants (hors université).`,
        "L'application de bureau porte en plus une visioconférence locale, sans dépendance à un service tiers.",
      ],
    },
    {
      id: 'comptes',
      title: '2. Comptes et rôles',
      paragraphs: [
        "L'inscription libre ne crée que des comptes étudiant ou des comptes indépendants. Les comptes enseignant, délégué et administration sont créés par l'administration de l'université ; les comptes administration le sont uniquement par l'administrateur de la plateforme.",
        "Le rôle attaché à un compte est vérifié côté serveur à chaque action sensible. Toute tentative de contournement (usurpation de rôle, accès à un périmètre qui n'est pas le sien) entraîne la suspension du compte.",
        'Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité réalisée depuis votre compte.',
      ],
    },
    {
      id: 'usage',
      title: '3. Usage acceptable',
      paragraphs: ["UniFlow est un outil d'études et de gestion académique. Il est interdit :"],
      bullets: [
        "de publier dans le forum ou la messagerie des contenus illicites, injurieux, discriminatoires ou portant atteinte à la vie privée d'autrui ;",
        "de téléverser des documents dont vous ne détenez pas les droits ;",
        "de falsifier une présence (partage de QR code, usurpation de position) ;",
        "de perturber le service (surcharge volontaire, exploitation de failles, extraction massive de données).",
      ],
    },
    {
      id: 'contenus',
      title: '4. Contenus et propriété intellectuelle',
      paragraphs: [
        "Vous restez propriétaire des contenus que vous publiez (messages, documents, publications du forum) et accordez à UniFlow une licence limitée à leur affichage et leur stockage pour rendre le service.",
        `Les marques, logos, textes et interfaces d'UniFlow appartiennent à ${LEGAL_PUBLISHER}. Les emplois du temps et référentiels académiques appartiennent aux établissements qui les publient.`,
      ],
    },
    {
      id: 'assistant',
      title: '5. Assistant Flo',
      paragraphs: [
        "Flo est un assistant conversationnel fondé sur un modèle de langage (Gemini 3.1 Flash-Lite, avec Mistral en secours). Ses réponses sont produites automatiquement à partir de votre profil et de votre emploi du temps : elles sont indicatives et ne remplacent ni une décision de l'administration ni un document officiel.",
        "Ne confiez à Flo aucune donnée sensible (mot de passe, données de santé, coordonnées bancaires). Les échanges sont transmis au fournisseur du modèle pour produire la réponse (voir la politique de confidentialité).",
      ],
    },
    {
      id: 'abonnements',
      title: '6. Offres et facturation',
      paragraphs: [
        `Les fonctionnalités de base sont gratuites pendant la phase de développement. Les offres payantes, lorsqu'elles sont proposées, se règlent exclusivement par échange WhatsApp avec l'équipe (${CONTACT_PHONE_DISPLAY}) : aucune coordonnée bancaire n'est saisie dans UniFlow. Une demande de paiement reste « en attente » jusqu'à validation manuelle par l'administration.`,
      ],
    },
    {
      id: 'disponibilite',
      title: '7. Disponibilité et évolution',
      paragraphs: [
        "UniFlow est en développement actif. Le service est fourni « en l'état » ; nous faisons nos meilleurs efforts pour sa disponibilité mais ne garantissons pas une absence d'interruption. Les applications mobile et de bureau fonctionnent hors ligne à partir des données déjà synchronisées.",
        'Les présentes conditions peuvent évoluer ; la date de mise à jour figure en tête de page et toute modification substantielle est annoncée dans l\'application.',
      ],
    },
    {
      id: 'resiliation',
      title: '8. Suspension et suppression de compte',
      paragraphs: [
        "Vous pouvez supprimer votre compte à tout moment depuis les réglages (« Supprimer mon compte ») : le compte, le profil et les données personnelles associées sont effacés ; les contenus publiés dans des espaces collectifs peuvent être anonymisés plutôt que supprimés.",
        "Nous pouvons suspendre un compte en cas de manquement aux présentes conditions, après notification lorsque la situation le permet.",
      ],
    },
    {
      id: 'droit',
      title: '9. Droit applicable',
      paragraphs: [
        "Les présentes conditions sont régies par le droit camerounais, notamment la loi n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et à la cybercriminalité. Les données étant hébergées dans l'Union européenne, le Règlement général sur la protection des données (RGPD) s'applique également à leur traitement. Tout litige sera soumis, à défaut d'accord amiable, aux juridictions compétentes de Yaoundé.",
      ],
    },
  ],
}

export const PRIVACY: LegalDocument = {
  slug: 'confidentialite',
  path: '/confidentialite',
  title: 'Politique de confidentialité',
  shortTitle: 'Confidentialité',
  intro: `Cette politique décrit les données que ${LEGAL_PUBLISHER} collecte à travers UniFlow, pourquoi, combien de temps elles sont conservées et comment exercer vos droits.`,
  sections: [
    {
      id: 'responsable',
      title: '1. Responsable du traitement',
      paragraphs: [`${LEGAL_PUBLISHER} — projet UniFlow, ${COVERAGE_LABEL}, Yaoundé, Cameroun. Contact : ${CONTACT_EMAIL_SECONDARY} ou ${CONTACT_EMAIL_PRIMARY}, WhatsApp ${CONTACT_PHONE_DISPLAY}.`],
    },
    {
      id: 'donnees',
      title: '2. Données collectées',
      paragraphs: ['Selon votre usage, nous traitons :'],
      bullets: [
        "Identité et compte : nom, adresse e-mail, mot de passe (haché par Appwrite, jamais lisible), pseudo, photo de profil facultative.",
        'Rattachement académique : université, faculté, filière, niveau, matricule, rôle.',
        'Vie académique : inscriptions aux UE, devoirs rendus, notes, présences (dont la position approximative au moment d\'un émargement géolocalisé, si vous l\'autorisez), documents téléversés.',
        'Échanges : messages privés, publications du forum, notifications, conversations avec l\'assistant Flo (conservées sur votre appareil uniquement).',
        'Données techniques : journaux d\'exécution des services (identifiant du compte, horodatage, code de réponse) nécessaires à la sécurité et au diagnostic.',
      ],
    },
    {
      id: 'finalites',
      title: '3. Finalités et bases légales',
      paragraphs: ['Ces données servent à :'],
      bullets: [
        "fournir le service (exécution du contrat) : afficher votre emploi du temps, vos cours, vos notes, permettre la messagerie ;",
        "sécuriser la plateforme (intérêt légitime) : vérifier les rôles, prévenir les fraudes à la présence, détecter les abus ;",
        "vous informer (intérêt légitime) : notifications de cours, de devoirs et d'alertes ;",
        "répondre à vos demandes (consentement) : formulaire de contact, assistant Flo, facturation WhatsApp.",
      ],
    },
    {
      id: 'hebergement',
      title: '4. Hébergement et sous-traitants',
      paragraphs: ['Vos données sont traitées par des prestataires soumis à des engagements contractuels de confidentialité :'],
      bullets: [
        'Appwrite Cloud (région Francfort, Allemagne) : base de données, authentification, fichiers, fonctions serveur.',
        'Vercel : hébergement du site web.',
        "Google (API Gemini) et Mistral AI : génération des réponses de l'assistant Flo. Seuls le message, l'historique de la conversation en cours et un résumé de votre profil académique (rôle, filière, niveau, séances du jour) leur sont transmis ; jamais votre mot de passe ni vos notes.",
        'Meta (WhatsApp) : lorsque vous choisissez de nous écrire par WhatsApp, la conversation est régie par les conditions de WhatsApp.',
      ],
    },
    {
      id: 'conservation',
      title: '5. Durées de conservation',
      paragraphs: [],
      bullets: [
        'Compte et profil : tant que le compte existe, puis suppression immédiate à la demande de suppression.',
        "Données académiques (présences, notes, inscriptions) : la durée de votre cursus plus une année universitaire, sauf obligation de l'établissement.",
        'Messages et publications : tant que le compte existe ; les publications collectives peuvent être anonymisées après suppression du compte.',
        'Journaux techniques : 90 jours au plus.',
        'Conversations avec Flo : sur votre appareil uniquement, effaçables à tout moment depuis la fenêtre de l\'assistant.',
      ],
    },
    {
      id: 'stockage-local',
      title: '6. Stockage local, cookies et hors ligne',
      paragraphs: [
        "Le site n'utilise aucun cookie publicitaire. Une session Appwrite (cookie ou jeton) vous maintient connecté ; le navigateur conserve dans localStorage et IndexedDB une copie de vos données pour le mode hors ligne (PWA) ; les applications mobile et de bureau gardent un cache chiffré local pour fonctionner sans réseau. Ces données sont effacées à la déconnexion (avec option de conservation du cache) et à la suppression du compte.",
      ],
    },
    {
      id: 'securite',
      title: '7. Sécurité',
      paragraphs: [
        "Chiffrement des échanges (TLS), mots de passe hachés, permissions par document dans la base, vérification des rôles côté serveur pour toute action sensible, clés d'API confinées aux fonctions serveur (jamais dans les applications). Les fichiers du bucket ne sont lisibles que par les comptes autorisés, à l'exception des photos de profil et des visuels de l'équipe qui sont publics.",
      ],
    },
    {
      id: 'droits',
      title: '8. Vos droits',
      paragraphs: [
        "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. La page « Droits des utilisateurs » détaille comment les exercer directement dans l'application ou en nous écrivant.",
      ],
    },
    {
      id: 'mineurs',
      title: '9. Mineurs',
      paragraphs: ["UniFlow s'adresse aux étudiants et personnels de l'enseignement supérieur. L'inscription est réservée aux personnes de 16 ans et plus."],
    },
  ],
}

export const LEGAL_NOTICE: LegalDocument = {
  slug: 'mentions-legales',
  path: '/mentions-legales',
  title: 'Mentions légales',
  shortTitle: 'Mentions légales',
  intro: 'Informations sur l\'éditeur et l\'hébergement de la plateforme UniFlow.',
  sections: [
    {
      id: 'editeur',
      title: 'Éditeur',
      paragraphs: [
        `${LEGAL_PUBLISHER} — équipe étudiante de la ${COVERAGE_LABEL}, Ngoa-Ekellé, Yaoundé, Cameroun.`,
        `Contact : ${CONTACT_EMAIL_SECONDARY} · ${CONTACT_EMAIL_PRIMARY} · WhatsApp ${CONTACT_PHONE_DISPLAY}.`,
        'Direction de la publication : NGHOMSI FEUKOUO Ravel, responsable du projet UniFlow.',
      ],
    },
    {
      id: 'hebergeur',
      title: 'Hébergement',
      paragraphs: [
        'Site web : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.',
        'Données, authentification et services : Appwrite Cloud (Appwrite Inc.), région Francfort, Allemagne.',
        'Applications mobile et de bureau : distribuées depuis les dépôts GitHub de KERNEL FORGE (releases signées).',
      ],
    },
    {
      id: 'propriete',
      title: 'Propriété intellectuelle',
      paragraphs: [
        `Le nom UniFlow, le logo et l'ensemble des interfaces sont la propriété de ${LEGAL_PUBLISHER}. Le code source est publié sous licence indiquée dans chaque dépôt. Les illustrations et l'avatar de l'assistant Flo ont été générés pour le projet et lui sont réservés.`,
        'Les polices Inter sont utilisées sous licence SIL Open Font License 1.1.',
      ],
    },
    {
      id: 'signalement',
      title: 'Signaler un contenu',
      paragraphs: [
        `Pour signaler un contenu illicite publié sur le forum ou dans une bibliothèque, écrivez à ${CONTACT_EMAIL_SECONDARY} en précisant l'adresse de la page et le motif. Nous traitons les signalements sous 72 heures ouvrées.`,
      ],
    },
  ],
}

export const USER_RIGHTS: LegalDocument = {
  slug: 'droits-des-utilisateurs',
  path: '/droits-des-utilisateurs',
  title: 'Droits des utilisateurs',
  shortTitle: 'Vos droits',
  intro: 'Ce que vous pouvez faire de vos données dans UniFlow, et comment le faire — depuis l\'application quand c\'est possible, sinon en nous écrivant.',
  sections: [
    {
      id: 'acces',
      title: "Droit d'accès",
      paragraphs: [
        "Votre profil (Réglages → Profil) affiche l'ensemble des informations de votre compte : identité, rattachement académique, pseudo, photo. Vos notes, devoirs, présences et documents sont consultables dans les écrans correspondants. Pour un export complet, écrivez-nous : il vous est remis sous 30 jours au format JSON.",
      ],
    },
    {
      id: 'rectification',
      title: 'Droit de rectification',
      paragraphs: [
        "Nom, pseudo, photo et mot de passe se modifient depuis les réglages. Université, faculté, filière, niveau et matricule sont des données de rattachement validées par l'établissement : demandez leur correction à l'administration de votre université, qui la réalise depuis son annuaire.",
      ],
    },
    {
      id: 'effacement',
      title: "Droit à l'effacement",
      paragraphs: [
        "Réglages → « Supprimer mon compte » efface immédiatement votre compte Appwrite, votre profil, votre entrée d'annuaire, vos préférences et votre photo. Les données académiques que l'établissement doit conserver (présences, notes) sont dissociées de votre identité. Les conversations avec Flo, stockées sur votre appareil, sont supprimées en même temps que la session.",
      ],
    },
    {
      id: 'portabilite',
      title: 'Droit à la portabilité',
      paragraphs: ["Sur demande, nous fournissons vos données dans un format structuré et lisible par machine (JSON), incluant profil, inscriptions, notes, devoirs et messages envoyés."],
    },
    {
      id: 'opposition',
      title: "Droit d'opposition et de limitation",
      paragraphs: [
        "Vous pouvez refuser la géolocalisation lors d'un émargement (le délégué ou l'enseignant peut alors valider votre présence manuellement), désactiver les notifications, ne pas utiliser l'assistant Flo, et demander la limitation d'un traitement en nous écrivant.",
      ],
    },
    {
      id: 'reclamation',
      title: 'Réclamation',
      paragraphs: [
        `Écrivez d'abord à ${CONTACT_EMAIL_SECONDARY} (réponse sous 30 jours). Vous pouvez également saisir l'autorité compétente : au Cameroun, l'Agence Nationale des Technologies de l'Information et de la Communication (ANTIC) ; pour un traitement relevant du RGPD, l'autorité de protection des données de votre pays de résidence.`,
      ],
    },
    {
      id: 'contact',
      title: 'Nous contacter',
      paragraphs: [
        `Par e-mail : ${CONTACT_EMAIL_SECONDARY} · ${CONTACT_EMAIL_PRIMARY}. Par WhatsApp : ${CONTACT_PHONE_DISPLAY}. Ou via le formulaire de la page Contact.`,
      ],
    },
  ],
}

export const LEGAL_DOCUMENTS: LegalDocument[] = [TERMS, PRIVACY, LEGAL_NOTICE, USER_RIGHTS]

export function legalDocumentBySlug(slug: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((doc) => doc.slug === slug)
}
