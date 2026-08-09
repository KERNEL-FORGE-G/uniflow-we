import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, Zap, Sparkles, HelpCircle, 
  Building2, GraduationCap, UserCheck, ChevronDown, Check, 
  Calculator, CheckCircle2
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'

const plans = [
  {
    id: 'student',
    name: 'Étudiant',
    icon: GraduationCap,
    priceMonthly: '0 FCFA',
    priceAnnually: '0 FCFA',
    period: 'Gratuit pour toujours',
    badge: null,
    highlight: false,
    description: 'Pour les étudiants souhaitant suivre leurs cours, devoirs et emploi du temps.',
    btnText: 'Créer un compte gratuit',
    btnLink: '/register',
    btnVariant: 'outline',
    features: [
      'Accès à tous les cours & ressources',
      'Emploi du temps personnel en temps réel',
      'Consultation des devoirs & relevés de notes',
      'Messagerie de cohorte & visioconférence',
      'Mode offline 100% fonctionnel (PWA)',
      'Application mobile & notifications push',
      'Support communautaire',
    ],
  },
  {
    id: 'teacher',
    name: 'Enseignant & Délégué',
    icon: UserCheck,
    priceMonthly: '0 FCFA',
    priceAnnually: '0 FCFA',
    period: 'Gratuit pendant la démo',
    badge: 'Plus Populaire',
    highlight: true,
    description: 'Pour les enseignants et délégués de classe gérant l\'appel et la pédagogie.',
    btnText: 'Essayer gratuitement',
    btnLink: '/register',
    btnVariant: 'primary',
    features: [
      'Toutes les fonctionnalités Étudiant',
      'Espace pédagogique enseignant complet',
      'Prise de présences automatisée (QR Code & NFC)',
      'Saisie, calcul et export des notes (Excel/PDF)',
      'Planification de visioconférences LAN/Web',
      'Rapports d\'assiduité par cohorte',
      'Support prioritaire par email',
    ],
  },
  {
    id: 'campus',
    name: 'Université & Campus',
    icon: Building2,
    priceMonthly: 'Sur Devis',
    priceAnnually: 'Sur Devis',
    period: 'Tarification dégressive par étudiant',
    badge: 'Sur Mesure',
    highlight: false,
    description: 'Pour l\'administration universitaire désireuse de moderniser tout son campus.',
    btnText: 'Demander une étude',
    btnLink: '/contact',
    btnVariant: 'teal',
    features: [
      'Déploiement multi-facultés & multi-filières',
      'Panneau d\'administration centralisé',
      'Gestion dynamique des salles & emplois du temps',
      'Intégration du module Sentinelle IoT (Santé & Sécurité)',
      'Synchronisation SSO / CAS / Annuaire existant',
      'Garantie de service (SLA 99.9%)',
      'Formation sur site & accompagnement dédié 24/7',
    ],
  },
]

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
  const [billingCycle] = useState<'monthly' | 'annually'>('annually')
  const [faqCategory, setFaqCategory] = useState<string>('Tous')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  
  // Interactive Simulator State
  const [studentCount, setStudentCount] = useState<number>(5000)

  const filteredFaqs = faqCategory === 'Tous' 
    ? faqs 
    : faqs.filter(f => f.cat === faqCategory)

  // Estimated savings vs traditional paper/software overhead
  const paperSavings = Math.round(studentCount * 3500) // FCFA saved per year in paper/printing
  const timeSavingsHours = Math.round(studentCount * 1.8) // Hours saved in attendance per year

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
            Une plateforme moderne, accessible et conçue pour la sobriété numérique. Profitez de la version d'essai complète sans engagement.
          </p>

          {/* Banner notification */}
          <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-5 py-2.5 text-xs font-semibold text-[#1e3a8a] dark:text-blue-300 shadow-xs">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Phase de lancement : <strong>Accès 100% gratuit</strong> pour tous les utilisateurs durant la démo.</span>
          </div>
        </div>
      </section>

      {/* PRICING CARDS SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-7 border transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-gradient-to-b from-white to-blue-50/60 border-[#1e3a8a] shadow-xl ring-2 ring-[#1e3a8a]/20 scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        plan.highlight ? 'bg-[#1e3a8a] text-white shadow-md' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                        <p className="text-xs text-slate-500">{plan.period}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="my-5 pb-5 border-b border-slate-200">
                      <span className="text-3xl font-black text-slate-900 sm:text-4xl">
                        {billingCycle === 'annually' ? plan.priceAnnually : plan.priceMonthly}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 font-normal">{plan.description}</p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inclus dans ce forfait :</p>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={plan.btnLink}
                    className={`block w-full text-center py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-xs cursor-pointer ${
                      plan.btnVariant === 'primary'
                        ? 'bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white shadow-blue-900/20'
                        : plan.btnVariant === 'teal'
                        ? 'bg-[#0d9488] hover:bg-[#14b8a8] text-white shadow-teal-900/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {plan.btnText}
                  </Link>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* CALCULATOR SIMULATOR SECTION */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-800 mb-2">
                  <Calculator className="h-3.5 w-3.5" /> Estimateur de Gains Campus
                </span>
                <h2 className="text-2xl font-bold text-slate-900">Simulez les Économies pour Votre Établissement</h2>
                <p className="text-xs text-slate-500 mt-1">Ajustez l'effectif étudiant pour calculer les économies d'encre, papier et temps administratif.</p>
              </div>

              {/* Slider Input */}
              <div className="w-full md:w-64 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-600">Effectif Étudiants :</span>
                  <span className="text-[#0d9488] font-mono text-sm">{studentCount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={30000}
                  step={500}
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full accent-[#0d9488] cursor-pointer"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-emerald-50/60 p-5 border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 mb-1">Économie Papier & Impression / an</p>
                <p className="text-2xl font-black text-emerald-700">{paperSavings.toLocaleString()} FCFA</p>
                <p className="text-[11px] text-emerald-600 mt-1">Suppression des fiches d'appel & relevés papier</p>
              </div>

              <div className="rounded-2xl bg-cyan-50/60 p-5 border border-cyan-200">
                <p className="text-xs font-bold text-cyan-800 mb-1">Temps Enseignant Économisé / an</p>
                <p className="text-2xl font-black text-cyan-700">{timeSavingsHours.toLocaleString()} heures</p>
                <p className="text-[11px] text-cyan-600 mt-1">Prise de présence instantanée par QR / NFC</p>
              </div>

              <div className="rounded-2xl bg-blue-50/60 p-5 border border-blue-200 sm:col-span-2 lg:col-span-1">
                <p className="text-xs font-bold text-[#1e3a8a] mb-1">Incertitude & Réclamations</p>
                <p className="text-2xl font-black text-[#1e3a8a]">- 95% de litiges</p>
                <p className="text-[11px] text-blue-600 mt-1">Traçabilité numérique horodatée des notes</p>
              </div>
            </div>
          </div>
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
                  <>
                    <tr key={cat.name} className="bg-slate-100/60">
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
                  </>
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
