import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Zap, Sparkles } from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { ScrollFloat } from '../components/ui/ScrollFloat'

const plans = [
  {
    name: 'Étudiant',
    price: 'Gratuit',
    sub: 'Pour toujours',
    badge: null,
    color: 'border-[#e5e7eb]',
    btnClass: 'border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#eff3ff]',
    features: [
      'Accès à tous vos cours',
      'Emploi du temps personnel',
      'Devoirs & notes',
      'Messagerie & visioconférence',
      'Mode offline complet',
      'Application mobile',
    ],
    note: null,
  },
  {
    name: 'Enseignant',
    price: 'Gratuit',
    sub: 'Pendant la démo',
    badge: 'Populaire',
    color: 'border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20',
    btnClass: 'bg-[#1e3a8a] text-white hover:bg-[#2d4fa8]',
    features: [
      'Espace pédagogique complet',
      'Gestion des présences',
      'Saisie & export des notes',
      'Création de cours & ressources',
      'Visioconférence LAN',
      'Rapports de cohorte',
      'API partenaires',
    ],
    note: null,
  },
  {
    name: 'Université',
    price: 'Sur devis',
    sub: 'Déploiement campus',
    badge: null,
    color: 'border-[#e5e7eb]',
    btnClass: 'border border-[#0d9488] text-[#0d9488] hover:bg-[#f0fdfa]',
    features: [
      'Tout ce qui est inclus',
      'Infrastructure dédiée',
      'Panneau admin complet',
      'Gestion des salles',
      'Intégration Sentinelle IoT',
      'SLA garanti 99.9%',
      'Formation & onboarding',
      'Support prioritaire 24/7',
    ],
    note: 'Tarification basée sur le nombre d\'étudiants',
  },
]

const faq = [
  { q: 'UniFlow est-il vraiment gratuit ?', a: 'Oui, UniFlow est en phase de démonstration et entièrement gratuit. Un modèle d\'abonnement sera proposé à partir de la version 1.2, mais l\'accès de base restera toujours gratuit.' },
  { q: 'Fonctionne-t-il sans connexion ?', a: 'Absolument. UniFlow est conçu Offline First. Toutes les données sont stockées localement et synchronisées dès que la connexion est rétablie.' },
  { q: 'Qu\'est-ce que Sentinelle IoT ?', a: 'C\'est l\'extension physique du campus — des capteurs Raspberry Pi pour la santé et la surveillance des espaces. Disponible dans le plan Université.' },
  { q: 'Comment déployer sur mon campus ?', a: 'Contactez notre équipe via le formulaire. Nous proposons un accompagnement complet pour le déploiement et la formation.' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white mb-5">
            <Zap className="h-3 w-3" /> Tarification simple et transparente
          </span>
          <ScrollFloat 
            containerClassName="text-4xl font-extrabold text-white mb-4"
            textClassName="text-white"
            animationDuration={0.8}
            stagger={0.02}
          >
            Simple, transparent, accessible
          </ScrollFloat>
          <p className="text-lg text-blue-100">
            Commencez gratuitement. Évoluez quand vous êtes prêt. Aucune carte de crédit requise.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-[#f3f4f6] py-16">
        <div className="mx-auto max-w-[1920px] px-6">
          {/* Demo banner */}
          <div className="mb-8 rounded-2xl bg-[#eff3ff] border border-[#1e3a8a]/20 p-5 text-center">
            <p className="text-sm font-semibold text-[#1e3a8a] flex items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#1e3a8a]" /> Phase de démonstration — Tous les plans sont <strong>entièrement gratuits</strong> jusqu'à la version 1.2
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map(plan => (
              <div key={plan.name} className={`relative rounded-2xl border-2 bg-white p-7 shadow-sm ${plan.color}`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#1e3a8a] px-4 py-1 text-xs font-bold text-white">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-lg font-bold text-[#111827]">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-4xl font-extrabold text-[#111827]">{plan.price}</span>
                </div>
                <p className="text-sm text-[#9ca3af] mb-6">{plan.sub}</p>
                <Link to={plan.name === 'Université' ? '/contact' : '/register'}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors mb-6 ${plan.btnClass}`}>
                  {plan.name === 'Université' ? 'Demander un devis' : 'Commencer gratuitement'}
                </Link>
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                      <CheckCircle className="h-4 w-4 text-[#0d9488] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.note && (
                  <p className="mt-4 text-xs text-[#9ca3af] border-t border-[#f3f4f6] pt-3">{plan.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollFloat 
            containerClassName="text-2xl font-extrabold text-[#111827] text-center mb-8"
            animationDuration={0.8}
            stagger={0.02}
          >
            Comparaison détaillée
          </ScrollFloat>
          <div className="overflow-x-auto rounded-2xl border border-[#e5e7eb] shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <th className="py-4 px-5 text-left font-bold text-[#111827]">Fonctionnalité</th>
                  <th className="py-4 px-5 text-center font-bold text-[#374151]">Étudiant</th>
                  <th className="py-4 px-5 text-center font-bold text-[#1e3a8a]">Enseignant</th>
                  <th className="py-4 px-5 text-center font-bold text-[#0d9488]">Université</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {[
                  ['Cours & emploi du temps', true, true, true],
                  ['Devoirs & notes', true, true, true],
                  ['Messagerie & visioconférence', true, true, true],
                  ['Mode offline complet', true, true, true],
                  ['Application mobile', true, true, true],
                  ['Gestion des présences', false, true, true],
                  ['Espace pédagogique enseignant', false, true, true],
                  ['Panel administrateur', false, false, true],
                  ['Gestion des salles', false, false, true],
                  ['Sentinelle IoT', false, false, true],
                  ['Support dédié', false, false, true],
                ].map(([feature, s, t, u]) => (
                  <tr key={String(feature)} className="hover:bg-[#f9fafb]">
                    <td className="py-3 px-5 text-[#374151]">{feature}</td>
                    <td className="py-3 px-5 text-center">{s ? <CheckCircle className="h-4 w-4 text-[#0d9488] mx-auto" /> : <span className="text-[#d1d5db]">—</span>}</td>
                    <td className="py-3 px-5 text-center">{t ? <CheckCircle className="h-4 w-4 text-[#0d9488] mx-auto" /> : <span className="text-[#d1d5db]">—</span>}</td>
                    <td className="py-3 px-5 text-center">{u ? <CheckCircle className="h-4 w-4 text-[#0d9488] mx-auto" /> : <span className="text-[#d1d5db]">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#f3f4f6] py-16">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollFloat 
            containerClassName="text-2xl font-extrabold text-[#111827] text-center mb-8"
            animationDuration={0.8}
            stagger={0.02}
          >
            Questions fréquentes
          </ScrollFloat>
          <div className="space-y-3">
            {faq.map(f => (
              <details key={f.q} className="group rounded-xl border border-[#e5e7eb] bg-white">
                <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-semibold text-[#111827]">
                  {f.q}
                  <ArrowRight className="h-4 w-4 text-[#9ca3af] transition-transform group-open:rotate-90 shrink-0 ml-3" />
                </summary>
                <div className="border-t border-[#f3f4f6] px-5 py-4 text-sm text-[#6b7280] leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1e3a8a] py-14 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-2xl font-extrabold text-white mb-3">Commencez dès aujourd'hui</h2>
          <p className="text-blue-200 mb-6">Gratuit, sans carte de crédit, sans engagement.</p>
          <Link to="/app" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-[#1e3a8a] hover:bg-blue-50 transition-all shadow-xl">
            Essayer UniFlow gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
