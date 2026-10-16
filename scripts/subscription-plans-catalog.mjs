/**
 * Catalogue des formules UniFlow — données de départ de `subscription_plans`.
 *
 * Une seule définition, lue par `seed-subscription-plans.mjs` (qui écrit tout
 * le catalogue) et par `provision-appwrite-selfhosted.mjs` (qui ne garantit que
 * la formule minimale `personal_cm`, pour que la page tarifaire ne soit jamais
 * vide après un provisionnement à blanc). Avant, la formule était décrite en
 * dur dans le script de provisionnement et les avantages dans deux pages du
 * web : trois copies, trois versions.
 *
 * Les montants sont ceux des spécifications historiques (100 F CFA/mois pour
 * l'accès personnel au Cameroun, 1 €/mois à l'international, 500 F CFA/mois
 * pour l'enseignant indépendant). `features` et `providers` sont des tableaux
 * sérialisés en JSON : l'API Databases « legacy » n'expose pas d'attribut
 * tableau de chaînes indexable et le client parse déjà `providers` ainsi.
 */

const WHATSAPP = '["WHATSAPP"]'

const personalFeatures = [
  'Gestion autonome des cours, devoirs et notes',
  'Emploi du temps interactif modifiable',
  'Calcul automatique des moyennes',
  'Mode hors ligne et synchronisation',
  'Exports PDF et Excel de vos relevés',
  'Support prioritaire WhatsApp',
]

const teacherFeatures = [
  'Plusieurs classes et listes d’étudiants',
  'Prise de présence QR code et feuilles d’appel',
  'Saisie des notes et relevés par UE',
  'Exports PDF et Excel des présences et notes',
  'Cahier de textes et ressources partagées',
  'Support prioritaire WhatsApp',
]

const academicFeatures = [
  'Emploi du temps de la filière et du niveau',
  'Cours, devoirs et bibliothèque de l’université',
  'Relevé de notes numérique',
  'Présence par QR code en amphithéâtre',
  'Messagerie et forum du campus',
]

const institutionFeatures = [
  'Tableau de bord d’administration complet',
  'Gestion des enseignants, délégués et étudiants',
  'Salles, ressources et emplois du temps centralisés',
  'Rapports d’assiduité et exports institutionnels',
  'Visioconférence locale via l’application de bureau',
  'Accompagnement au déploiement sur le campus',
]

/** @type {Array<Record<string, unknown> & { code: string }>} */
export const subscriptionPlanCatalog = [
  {
    code: 'academic_uy1_free',
    name: 'Accès académique UY1',
    category: 'ACADEMIC',
    countryCode: 'CM',
    currency: 'XAF',
    priceMonthlyAmount: 0,
    priceAnnuallyAmount: 0,
    period: 'Accès académique',
    badge: 'Université partenaire',
    highlight: false,
    description: 'Accès inclus pour les étudiants et enseignants des universités partenaires : votre administration a déjà souscrit pour vous.',
    providers: '[]',
    features: JSON.stringify(academicFeatures),
    sortOrder: 0,
    status: 'ACTIVE',
  },
  {
    code: 'personal_cm',
    name: 'UniFlow Personnel',
    category: 'PERSONAL',
    countryCode: 'CM',
    currency: 'XAF',
    priceMonthlyAmount: 100,
    priceAnnuallyAmount: 1000,
    period: 'Abonnement personnel',
    badge: 'Offre populaire',
    highlight: true,
    description: 'L’essentiel pour piloter votre réussite académique, sans rattachement à une université partenaire.',
    providers: WHATSAPP,
    features: JSON.stringify(personalFeatures),
    sortOrder: 10,
    status: 'ACTIVE',
  },
  {
    code: 'personal_eur',
    name: 'UniFlow Personnel',
    category: 'PERSONAL',
    countryCode: 'FR',
    currency: 'EUR',
    priceMonthlyAmount: 1,
    priceAnnuallyAmount: 10,
    period: 'Abonnement personnel',
    badge: 'Offre populaire',
    highlight: true,
    description: 'L’essentiel pour piloter votre réussite académique, sans rattachement à une université partenaire.',
    providers: WHATSAPP,
    features: JSON.stringify(personalFeatures),
    sortOrder: 11,
    status: 'ACTIVE',
  },
  {
    code: 'personal_usd',
    name: 'UniFlow Personnel',
    category: 'PERSONAL',
    countryCode: 'US',
    currency: 'USD',
    priceMonthlyAmount: 1,
    priceAnnuallyAmount: 10,
    period: 'Abonnement personnel',
    badge: 'Offre populaire',
    highlight: true,
    description: 'L’essentiel pour piloter votre réussite académique, sans rattachement à une université partenaire.',
    providers: WHATSAPP,
    features: JSON.stringify(personalFeatures),
    sortOrder: 12,
    status: 'ACTIVE',
  },
  {
    code: 'teacher_cm',
    name: 'Pack Enseignant Pro',
    category: 'TEACHER',
    countryCode: 'CM',
    currency: 'XAF',
    priceMonthlyAmount: 500,
    priceAnnuallyAmount: 5000,
    period: 'Enseignant indépendant',
    badge: '',
    highlight: false,
    description: 'Pour les enseignants indépendants et vacataires qui suivent plusieurs classes.',
    providers: WHATSAPP,
    features: JSON.stringify(teacherFeatures),
    sortOrder: 20,
    status: 'ACTIVE',
  },
  {
    code: 'teacher_eur',
    name: 'Pack Enseignant Pro',
    category: 'TEACHER',
    countryCode: 'FR',
    currency: 'EUR',
    priceMonthlyAmount: 3,
    priceAnnuallyAmount: 30,
    period: 'Enseignant indépendant',
    badge: '',
    highlight: false,
    description: 'Pour les enseignants indépendants et vacataires qui suivent plusieurs classes.',
    providers: WHATSAPP,
    features: JSON.stringify(teacherFeatures),
    sortOrder: 21,
    status: 'ACTIVE',
  },
  {
    code: 'campus',
    name: 'Campus Université',
    category: 'INSTITUTION',
    countryCode: 'CM',
    currency: 'XAF',
    priceMonthlyAmount: 0,
    priceAnnuallyAmount: 0,
    period: 'Sur devis',
    badge: 'Institutions',
    highlight: false,
    description: 'Déploiement pour toute une université : tarif établi selon l’effectif, après une étude sur le campus.',
    providers: WHATSAPP,
    features: JSON.stringify(institutionFeatures),
    sortOrder: 30,
    status: 'ACTIVE',
  },
]

/**
 * Crée ou met à jour une formule (idempotent), lisible sans session.
 *
 * `read("any")` sur chaque document : la page tarifaire est publique et la
 * collection est en `documentSecurity`, donc une formule créée sans cette
 * permission n'apparaît pas aux visiteurs — c'était le symptôme « la formule
 * existe dans la console mais la page dit qu'il n'y en a aucune ».
 */
export async function upsertSubscriptionPlan(request, databaseId, plan) {
  const permissions = ['read("any")']
  const created = await request('POST', `/databases/${databaseId}/collections/subscription_plans/documents`, {
    documentId: plan.code,
    data: plan,
    permissions,
  })
  if (created.status === 409) {
    await request('PATCH', `/databases/${databaseId}/collections/subscription_plans/documents/${plan.code}`, { data: plan, permissions })
    return 'updated'
  }
  return 'created'
}
