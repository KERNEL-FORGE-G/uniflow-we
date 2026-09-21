import { useState, Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Zap, HelpCircle,
  Building2, GraduationCap, ChevronDown, Check,
  CheckCircle2, User, RefreshCw, Globe2, MessageCircle, ShieldCheck, ClipboardList, Sparkles,
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { personalSubscriptionApi, type SubscriptionPlan } from '../lib/api'
import { useApi } from '../hooks/useApi'
import { COUNTRY_OPTIONS, featuredPlanCode, plansForCountry } from '../lib/pricingModel'
import { annualSavingsPercent } from '../lib/paymentsModel'
import { CONTACT_PHONE_DISPLAY } from '../lib/contactInfo'

const comparisonCategories = [
  {
    name: 'Gestion Académique',
    features: [
      { name: 'Emploi du temps interactif', student: true, teacher: true, campus: true },
      { name: 'Espace de cours & devoirs', student: true, teacher: true, campus: true },
      { name: 'Relevés de notes numériques', student: true, teacher: true, campus: true },
      { name: 'Exports PDF et Excel', student: true, teacher: true, campus: true },
      { name: 'Mode Offline-First (PWA)', student: true, teacher: true, campus: true },
    ]
  },
  {
    name: 'Gestion de Classe & Présences',
    features: [
      { name: 'Prise de présence QR Code / NFC', student: false, teacher: true, campus: true },
      { name: 'Saisie & validation des notes', student: false, teacher: true, campus: true },
      { name: 'Rapports d\'assiduité automatisés', student: false, teacher: true, campus: true },
      { name: 'Visioconférence locale via l’application de bureau', student: true, teacher: true, campus: true },
    ]
  },
  {
    name: 'Infrastructure & Sécurité',
    features: [
      { name: 'Panneau d\'administration global', student: false, teacher: false, campus: true },
      { name: 'Gestion des salles & ressources', student: false, teacher: false, campus: true },
      { name: 'Module Sentinelle IoT (Santé / Edge AI)', student: false, teacher: false, campus: true },
      { name: 'Authentification SSO / LDAP', student: false, teacher: false, campus: true },
      { name: 'Support technique dédié 24/7', student: false, teacher: false, campus: true },
    ]
  }
]

const faqs = [
  {
    q: 'UniFlow est-il vraiment gratuit ?',
    a: 'Oui pour les étudiants et enseignants des universités partenaires : leur administration a souscrit pour eux et l’accès académique est inclus. Les comptes indépendants (non rattachés à une université partenaire) disposent d’une formule personnelle à prix symbolique, et les institutions d’un déploiement sur devis.',
    cat: 'Général'
  },
  {
    q: 'Comment régler un abonnement ?',
    a: `Aucun paiement en ligne : en choisissant une formule, UniFlow enregistre votre demande avec une référence et ouvre WhatsApp vers notre numéro de facturation (${CONTACT_PHONE_DISPLAY}) avec un message pré-rempli. Envoyez-le avec votre preuve de paiement (Orange Money, MTN MoMo, virement) ; l’administration valide ensuite votre abonnement et votre espace « Abonnement » passe à l’état actif.`,
    cat: 'Général'
  },
  {
    q: 'Comment fonctionne le mode Offline-First ?',
    a: 'UniFlow utilise une technologie PWA (Progressive Web App) et IndexedDB. Vos données de cours, devoirs et emplois du temps sont sauvegardées localement sur votre téléphone ou ordinateur. Vous pouvez consulter et travailler sans aucune connexion Internet, et la synchronisation s\'effectue automatiquement dès que vous retrouvez un réseau.',
    cat: 'Technologie'
  },
  {
    q: 'Qu\'est-ce que le module Sentinelle IoT ?',
    a: 'Sentinelle est notre extension matérielle optionnelle basée sur Raspberry Pi. Elle combine un Kiosque Santé autonome (mesure de la tension, oxygène SpO2, température) et un module Vigie Edge AI de surveillance vidéo locale. Ce module s\'intègre au plan Université.',
    cat: 'Sentinelle IoT'
  },
  {
    q: 'Comment faire une demande de déploiement pour notre université ?',
    a: 'Il vous suffit de nous contacter via la page Contact ou de cliquer sur « Demander une étude ». Notre équipe technique organisera une démonstration sur votre campus et préparera une proposition adaptée à votre effectif étudiant.',
    cat: 'Déploiement'
  },
  {
    q: 'Quels sont les prérequis matériels pour utiliser UniFlow ?',
    a: 'Aucun serveur coûteux n\'est requis pour commencer ! UniFlow fonctionne sur n\'importe quel navigateur web moderne (Android, iOS, Windows, Mac, Linux). Pour le déploiement local hors-ligne en amphi, un simple ordinateur portable ou Raspberry Pi peut servir de mini-serveur de classe.',
    cat: 'Technologie'
  }
]

const howItWorks = [
  { icon: ClipboardList, title: '1. Choisissez votre formule', text: 'Le cycle mensuel ou annuel, puis vos coordonnées : une référence unique est créée pour votre demande.' },
  { icon: MessageCircle, title: '2. Envoyez la preuve sur WhatsApp', text: `WhatsApp s’ouvre vers le ${CONTACT_PHONE_DISPLAY} avec un message pré-rempli. Joignez votre preuve de paiement (Orange Money, MTN MoMo, virement).` },
  { icon: ShieldCheck, title: '3. Validation par UniFlow', text: 'L’administration vérifie la preuve et active votre abonnement. Vous suivez l’état de la demande depuis votre espace « Abonnement ».' },
]

function planIcon(plan: SubscriptionPlan) {
  if (plan.category === 'PERSONAL') return User
  if (plan.category === 'TEACHER') return GraduationCap
  if (plan.category === 'INSTITUTION') return Building2
  return Sparkles
}

function priceLabel(plan: SubscriptionPlan, cycle: 'monthly' | 'annually') {
  if (plan.category === 'INSTITUTION') return 'Sur devis'
  if (plan.priceMonthlyAmount === 0) return 'Inclus'
  return cycle === 'annually' ? plan.priceAnnually : plan.priceMonthly
}

export default function PricingPage() {
  // Lecture mise en cache et persistée : la grille tarifaire reste consultable
  // hors ligne, alors qu'un rechargement sans réseau affichait « Aucune formule ».
  const { data: plansData, loading: loadingPlans, error: plansError } = useApi(() => personalSubscriptionApi.getPlans(), [], { key: 'subscriptions.plans' })
  const dbPlans: SubscriptionPlan[] = plansData ?? []
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly')
  const [countryCode, setCountryCode] = useState('CM')
  const [faqCategory, setFaqCategory] = useState<string>('Tous')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const visiblePlans = useMemo(() => plansForCountry(dbPlans, countryCode), [dbPlans, countryCode])
  const featuredCode = useMemo(() => featuredPlanCode(visiblePlans), [visiblePlans])
  const featured = visiblePlans.find((plan) => plan.code === featuredCode)
  const savings = featured ? annualSavingsPercent(featured.priceMonthlyAmount, featured.priceAnnuallyAmount) : 0

  const filteredFaqs = faqCategory === 'Tous'
    ? faqs
    : faqs.filter(f => f.cat === faqCategory)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-[#1e3a8a] selection:text-white">
      <LandingNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-16 pb-14 border-b border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 px-4 py-1.5 text-xs font-bold text-[#1e3a8a] dark:text-blue-300 mb-6 shadow-2xs">
            <Zap className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-blue-300" />
            Tarification souple et équitable
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="text-3xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight mb-4 leading-tight">
            Des offres adaptées à <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] dark:from-blue-400 dark:via-indigo-300 dark:to-teal-300">chaque usage</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Une plateforme moderne, accessible et conçue pour la sobriété numérique. Choisissez votre formule et accédez à votre espace dédié.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 px-5 py-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200 shadow-xs">
            <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Règlement par <strong>WhatsApp</strong> avec validation par l’administration UniFlow — aucun paiement en ligne, aucune carte à saisir.</span>
          </motion.div>
        </div>
      </section>

      {/* PRICING CARDS SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto mb-10 flex max-w-4xl flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row dark:border-slate-700 dark:bg-slate-800/50">
            <div className="inline-flex items-center rounded-2xl bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-700 shadow-inner" role="group" aria-label="Cycle de facturation">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                aria-pressed={billingCycle === 'monthly'}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${billingCycle === 'monthly' ? 'bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annually')}
                aria-pressed={billingCycle === 'annually'}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${billingCycle === 'annually' ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Annuel
                {savings > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${billingCycle === 'annually' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>-{savings} %</span>}
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Globe2 className="h-4 w-4 text-[#0d9488]" /> Pays de facturation
              <select value={countryCode} onChange={event => setCountryCode(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs dark:border-slate-600 dark:bg-slate-900">
                {COUNTRY_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.label} ({option.currency})</option>)}
              </select>
            </label>
          </div>

          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm font-semibold text-slate-500" role="status"><RefreshCw className="h-6 w-6 animate-spin text-[#0d9488]" />Chargement des offres…</div>
          ) : visiblePlans.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200" role="alert"><p className="font-bold">Aucune formule disponible pour ce pays</p><p className="mt-2">{plansError || 'Aucune formule active n’est enregistrée pour le moment.'}</p><Link to="/contact" className="mt-4 inline-flex rounded-xl bg-[#1e3a8a] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Contacter UniFlow</Link></div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={countryCode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className={`grid gap-6 items-stretch md:grid-cols-2 ${visiblePlans.length >= 4 ? 'lg:grid-cols-4' : visiblePlans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2 lg:max-w-4xl lg:mx-auto'}`}
              >
                {visiblePlans.map((plan, index) => {
                  const isInstitution = plan.category === 'INSTITUTION'
                  const isFeatured = plan.code === featuredCode
                  const targetPath = isInstitution ? '/contact' : `/subscribe/${plan.code || plan.id}`
                  const Icon = planIcon(plan)
                  const planSavings = annualSavingsPercent(plan.priceMonthlyAmount, plan.priceAnnuallyAmount)

                  return (
                    <motion.article
                      key={plan.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.06 }}
                      whileHover={{ y: -4 }}
                      className={`relative flex flex-col justify-between rounded-3xl p-7 border transition-shadow duration-300 ${isFeatured
                        ? 'bg-gradient-to-b from-white to-blue-50/60 dark:from-slate-900 dark:to-blue-950/40 border-[#1e3a8a] shadow-xl ring-2 ring-[#1e3a8a]/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-sm hover:shadow-md'}`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md whitespace-nowrap">
                          {plan.badge}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${isFeatured ? 'bg-[#1e3a8a] text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{plan.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{plan.period}</p>
                          </div>
                        </div>

                        <div className="my-5 pb-5 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                              {priceLabel(plan, billingCycle)}
                            </span>
                            {plan.priceMonthlyAmount > 0 && <span className="text-xs font-semibold text-slate-500">/ {billingCycle === 'annually' ? 'an' : 'mois'}</span>}
                          </div>
                          {billingCycle === 'annually' && planSavings > 0 && <p className="mt-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Soit {planSavings} % de moins que douze mensualités</p>}
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-normal">{plan.description}</p>
                        </div>

                        <div className="space-y-3 mb-8">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inclus dans cette offre</p>
                          {plan.features.length === 0 && <p className="text-xs text-slate-400">Détail des avantages sur demande.</p>}
                          {plan.features.map((feature) => (
                            <div key={feature} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link
                        to={targetPath}
                        className={`block w-full text-center py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-xs cursor-pointer ${isFeatured
                          ? 'bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white shadow-blue-900/20'
                          : isInstitution
                            ? 'bg-[#0d9488] hover:bg-[#14b8a8] text-white shadow-teal-900/20'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}
                      >
                        {plan.btnText || 'Souscrire à cette offre'}
                      </Link>
                    </motion.article>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </section>

      {/* HOW PAYMENT WORKS */}
      <section className="py-14 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Comment se passe le règlement ?</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">Trois étapes, sans formulaire bancaire.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1e3a8a] dark:bg-blue-950/50 dark:text-blue-300"><step.icon className="h-5 w-5" /></div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DETAILED COMPARISON TABLE */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Tableau comparatif détaillé</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">Les fonctionnalités attribuées à chaque rôle et forfait.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                  <th className="py-4 px-6 font-bold">Fonctionnalités</th>
                  <th className="py-4 px-4 font-bold text-center w-28">Étudiant</th>
                  <th className="py-4 px-4 font-bold text-center w-36 text-[#1e3a8a] dark:text-blue-300">Enseignant</th>
                  <th className="py-4 px-4 font-bold text-center w-36 text-[#0d9488]">Campus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {comparisonCategories.map((cat) => (
                  <Fragment key={cat.name}>
                    <tr className="bg-slate-100/60 dark:bg-slate-800/40">
                      <td colSpan={4} className="py-3 px-6 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {cat.name}
                      </td>
                    </tr>
                    {cat.features.map((f) => (
                      <tr key={f.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-6 font-medium text-slate-800 dark:text-slate-200">{f.name}</td>
                        <td className="py-3.5 px-4 text-center">
                          {f.student ? <Check className="h-4 w-4 text-teal-600 mx-auto" /> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {f.teacher ? <Check className="h-4 w-4 text-[#1e3a8a] dark:text-blue-300 mx-auto" /> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {f.campus ? <Check className="h-4 w-4 text-[#0d9488] mx-auto" /> : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-bold text-[#1e3a8a] mb-3 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-300">
              <HelpCircle className="h-3.5 w-3.5" /> Réponses à vos questions
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Foire aux questions</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['Tous', 'Général', 'Technologie', 'Sentinelle IoT', 'Déploiement'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { setFaqCategory(cat); setOpenFaq(0) }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${faqCategory === cat
                  ? 'bg-[#1e3a8a] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-white text-sm sm:text-base cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1e3a8a] via-[#2546a3] to-[#0d9488] text-center text-white">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-black text-white sm:text-3xl mb-3">Prêt à transformer votre campus ?</h2>
          <p className="text-xs sm:text-sm text-blue-100 mb-8 max-w-lg mx-auto leading-relaxed">
            Rejoignez les universités qui font le choix de la simplicité, de la sobriété et de l'efficacité numérique.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:bg-slate-100 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Demander un devis sur mesure <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
            >
              Tester l'application démo
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
