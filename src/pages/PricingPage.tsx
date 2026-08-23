import { useState, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Zap, Sparkles, HelpCircle,
  Building2, GraduationCap, UserCheck, ChevronDown, Check,
  CheckCircle2, User, RefreshCw, Globe2
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { personalSubscriptionApi, type PricingInfo, type SubscriptionPlan } from '../lib/api'

const comparisonCategories = [
  {
    name: 'Gestion Académique',
    features: [
      { name: 'Emploi du temps interactif', student: true, teacher: true, campus: true },
      { name: 'Espace de cours & devoirs', student: true, teacher: true, campus: true },
      { name: 'Relevés de notes numériques', student: true, teacher: true, campus: true },
      { name: 'Mode Offline-First (PWA)', student: true, teacher: true, campus: true },
    ]
  },
  {
    name: 'Gestion de Classe & Présences',
    features: [
      { name: 'Prise de présence QR Code / NFC', student: false, teacher: true, campus: true },
      { name: 'Saisie & validation des notes', student: false, teacher: true, campus: true },
      { name: 'Rapports d\'assiduité automatisés', student: false, teacher: true, campus: true },
      { name: 'Visioconférence LAN dédiée', student: true, teacher: true, campus: true },
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
    a: 'Oui ! Pendant la phase actuelle de démonstration et de déploiement pilote, l\'ensemble de la plateforme UniFlow est totalement gratuit pour tous les utilisateurs. Un modèle d\'abonnement campus très accessible sera introduit pour les institutions, mais l\'accès de base restera toujours gratuit pour les étudiants.',
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
    a: 'Il vous suffit de nous contacter via la page Contact ou de cliquer sur "Demander une étude". Notre équipe technique organisera une démonstration sur votre campus et préparera une proposition adaptée à votre effectif étudiant.',
    cat: 'Déploiement'
  },
  {
    q: 'Quels sont les prérequis matériels pour utiliser UniFlow ?',
    a: 'Aucun serveur coûteux n\'est requis pour commencer ! UniFlow fonctionne sur n\'importe quel navigateur web moderne (Android, iOS, Windows, Mac, Linux). Pour le déploiement local hors-ligne en amphi, un simple ordinateur portable ou Raspberry Pi peut servir de mini-serveur de classe.',
    cat: 'Technologie'
  }
]

export default function PricingPage() {
  const [dbPlans, setDbPlans] = useState<SubscriptionPlan[]>([])
  const [pricingInfo, setPricingInfo] = useState<PricingInfo | null>(null)
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true)
  const [plansError, setPlansError] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly')
  const [countryCode, setCountryCode] = useState('CM')
  const [faqCategory, setFaqCategory] = useState<string>('Tous')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    let mounted = true
    const fetchPricing = async () => {
      setLoadingPlans(true)
      setPlansError(null)
      const [plansResult, pricingResult] = await Promise.allSettled([
        personalSubscriptionApi.getPlans(),
        personalSubscriptionApi.getPricing(countryCode),
      ])
      if (!mounted) return
      if (plansResult.status === 'fulfilled') {
        setDbPlans(plansResult.value ?? [])
      } else {
        setDbPlans([])
        setPlansError(plansResult.reason instanceof Error ? plansResult.reason.message : 'Les offres ne sont pas disponibles.')
      }
      if (pricingResult.status === 'fulfilled') setPricingInfo(pricingResult.value)
      else setPricingInfo(null)
      setLoadingPlans(false)
    }
    fetchPricing()
    return () => { mounted = false }
  }, [countryCode])

  const filteredFaqs = faqCategory === 'Tous' 
    ? faqs 
    : faqs.filter(f => f.cat === faqCategory)


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-[#1e3a8a] selection:text-white">
      <LandingNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-16 pb-14 border-b border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 px-4 py-1.5 text-xs font-bold text-[#1e3a8a] dark:text-blue-300 mb-6 shadow-2xs">
            <Zap className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-blue-300" />
            Tarification Souple & Équitable
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight mb-4 leading-tight">
            Offres Adaptées à <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] dark:from-blue-400 dark:via-indigo-300 dark:to-teal-300">Chaque Usage</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Une plateforme moderne, accessible et conçue pour la sobriété numérique. Choisissez votre formule et accédez à votre espace dédié.
          </p>

          {/* Banner notification */}
          <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-5 py-2.5 text-xs font-semibold text-[#1e3a8a] dark:text-blue-300 shadow-xs">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Offres gérées en <strong>Base de Données</strong> avec page et étape de souscription dédiée pour chaque formule.</span>
          </div>
        </div>
      </section>

      {/* PRICING CARDS SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          
          {/* Billing Cycle Toggle Switch */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-[#1e3a8a] dark:text-blue-400 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annually')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'annually'
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Annuel
              </button>
            </div>
          </div>

          <div className="mx-auto mb-10 grid max-w-4xl gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center dark:border-slate-700 dark:bg-slate-800/50">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200"><Globe2 className="h-4 w-4 text-[#0d9488]" /> Pays de facturation<select value={countryCode} onChange={event => setCountryCode(event.target.value)} className="ml-auto rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs dark:border-slate-600 dark:bg-slate-900"><option value="CM">Cameroun</option><option value="FR">France</option><option value="BE">Belgique</option><option value="CA">Canada</option><option value="US">États-Unis</option></select></label>
            {pricingInfo ? <div className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-900 dark:text-white">Tarif Appwrite : {pricingInfo.formattedPrice}</span><span className="ml-2">Canal de règlement : WhatsApp avec validation manuelle</span></div> : <div className="text-xs text-slate-500">Le tarif sera affiché dès qu’une formule Appwrite active correspondra au pays sélectionné.</div>}
          </div>

          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm font-semibold text-slate-500"><RefreshCw className="h-6 w-6 animate-spin text-[#0d9488]" />Chargement des offres depuis Appwrite...</div>
          ) : dbPlans.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"><p className="font-bold">Aucune formule Appwrite disponible pour ce pays</p><p className="mt-2">{plansError || 'Aucune formule active n’est enregistrée dans Appwrite.'}</p><Link to="/contact" className="mt-4 inline-flex rounded-xl bg-[#1e3a8a] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Contacter UniFlow</Link></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {dbPlans.map((plan) => {
                const isInstitution = plan.category === 'INSTITUTION' || plan.code === 'campus'
                const targetPath = isInstitution ? '/contact' : `/subscribe/${plan.code || plan.id}`

                const getIcon = () => {
                  if (plan.category === 'PERSONAL') return User
                  if (plan.category === 'TEACHER') return GraduationCap
                  if (plan.category === 'INSTITUTION') return Building2
                  return Sparkles
                }
                const Icon = getIcon()

                return (
                  <div 
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-3xl p-7 border transition-all duration-300 ${
                      plan.highlight
                        ? 'bg-gradient-to-b from-white to-blue-50/60 dark:from-slate-900 dark:to-blue-950/40 border-[#1e3a8a] shadow-xl ring-2 ring-[#1e3a8a]/20 scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md whitespace-nowrap">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${
                          plan.highlight ? 'bg-[#1e3a8a] text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{plan.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{plan.period}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="my-5 pb-5 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                          {billingCycle === 'annually' ? plan.priceAnnually : plan.priceMonthly}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">{plan.description}</p>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3 mb-8">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inclus dans cette offre :</p>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dedicated Page Link Button */}
                    <Link
                      to={targetPath}
                      className={`block w-full text-center py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-xs cursor-pointer ${
                        plan.btnVariant === 'primary' || plan.highlight
                          ? 'bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white shadow-blue-900/20'
                          : plan.btnVariant === 'teal'
                          ? 'bg-[#0d9488] hover:bg-[#14b8a8] text-white shadow-teal-900/20'
                          : plan.btnVariant === 'indigo'
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {plan.btnText || 'Souscrire à cette offre'}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </section>

      {/* DETAILED COMPARISON TABLE */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Tableau Comparatif Détaillé</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">Découvrez les fonctionnalités attribuées à chaque rôle et forfait.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-4 px-6 font-bold">Fonctionnalités</th>
                  <th className="py-4 px-4 font-bold text-center w-28">Étudiant</th>
                  <th className="py-4 px-4 font-bold text-center w-36 text-[#1e3a8a]">Enseignant</th>
                  <th className="py-4 px-4 font-bold text-center w-36 text-[#0d9488]">Campus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparisonCategories.map((cat) => (
                  <Fragment key={cat.name}>
                    <tr className="bg-slate-100/60">
                      <td colSpan={4} className="py-3 px-6 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        {cat.name}
                      </td>
                    </tr>
                    {cat.features.map((f) => (
                      <tr key={f.name} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-6 font-medium text-slate-800">{f.name}</td>
                        <td className="py-3.5 px-4 text-center">
                          {f.student ? <Check className="h-4 w-4 text-teal-600 mx-auto" /> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {f.teacher ? <Check className="h-4 w-4 text-[#1e3a8a] mx-auto" /> : <span className="text-slate-300">—</span>}
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
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-bold text-[#1e3a8a] mb-3">
              <HelpCircle className="h-3.5 w-3.5 text-[#1e3a8a]" /> Réponses à vos Questions
            </span>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Foire Aux Questions</h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['Tous', 'Général', 'Technologie', 'Sentinelle IoT', 'Déploiement'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  faqCategory === cat
                    ? 'bg-[#1e3a8a] text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 text-sm sm:text-base cursor-pointer hover:bg-slate-50/50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1e3a8a] via-[#2546a3] to-[#0d9488] text-center text-white">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-black text-white sm:text-3xl mb-3">Prêt à Transformez Votre Campus ?</h2>
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
