import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, CalendarDays, QrCode, MessageSquare, Video, WifiOff, ShieldCheck, Sparkles,
  Building2, GraduationCap, BookOpen, Users, Cloud, Smartphone, Monitor, Globe2, Bot, Heart,
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { AnimatedSection, AnimatedItem } from '../components/ui/AnimatedSection'
import { ScrollFloat } from '../components/ui/ScrollFloat'
import { CountUp } from '../components/ui/CountUp'
import { UniMascot } from '../components/mascot/UniMascot'
import { usePublicStats } from '../lib/publicStats'
import { fadeInUp, staggerContainer } from '../utils/animations'
import { COVERAGE_LABEL, CONTACT_WHATSAPP_URL } from '../lib/contactInfo'
import { KERNEL_FORGE_LOGO_URL, KERNEL_FORGE_LOGO_FALLBACK_URL, KERNEL_FORGE_LOGO_ALT } from '../lib/brandAssets'
import campusHero from '../assets/illustrations/about-campus-hero.webp'
import offlineFirst from '../assets/illustrations/about-offline-first.webp'
import teamLab from '../assets/illustrations/about-team-lab.webp'
import stepWelcome from '../assets/illustrations/onboarding_1_bienvenue.webp'
import stepUniverse from '../assets/illustrations/onboarding_2_univers.webp'
import stepConnected from '../assets/illustrations/onboarding_3_connecte.webp'

/**
 * Page « À propos » : ce qu'est UniFlow, pour qui, comment ça marche et qui
 * le fabrique. Les illustrations sont générées pour le projet et embarquées
 * dans le bundle (elles s'affichent hors ligne) ; les chiffres viennent de la
 * base Appwrite via `/public-stats`, jamais d'un texte figé.
 *
 * L'ancienne version promettait « open source & gratuit, aucun abonnement »
 * et « des milliers d'utilisateurs » alors que la plateforme a des offres
 * payantes (facturées via WhatsApp) et démarre sur une faculté : le texte
 * s'en tient à ce qui existe.
 */

const pillars = [
  {
    icon: CalendarDays,
    title: 'Un emploi du temps qui est vraiment le vôtre',
    desc: 'Chaque étudiant voit uniquement les séances de sa filière et de son niveau, lues depuis le référentiel de sa faculté.',
    color: 'from-[#1e3a8a] to-[#2d4fa8]',
  },
  {
    icon: QrCode,
    title: 'Présences sans feuille de papier',
    desc: 'L\'enseignant ouvre une séance, l\'étudiant scanne un code : la liste de présence se remplit et s\'archive toute seule.',
    color: 'from-[#0d9488] to-[#14b8a8]',
  },
  {
    icon: MessageSquare,
    title: 'Messages, devoirs, notes, forum',
    desc: 'Tout ce qui circule entre une promotion, ses délégués et ses enseignants, au même endroit et avec les bons droits.',
    color: 'from-[#7c3aed] to-[#a78bfa]',
  },
  {
    icon: Video,
    title: 'Visioconférence sur le poste de l\'enseignant',
    desc: 'L\'application desktop héberge la réunion en local et distribue un lien navigateur aux participants, même sans Internet.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: WifiOff,
    title: 'Conçu pour les coupures',
    desc: 'Mobile et desktop gardent vos données en local, mettent vos actions en file et synchronisent quand le réseau revient.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: ShieldCheck,
    title: 'Des rôles vérifiés côté serveur',
    desc: 'Étudiant, délégué, enseignant, administration : le rôle est un label posé par la plateforme, pas une case cochée par l\'utilisateur.',
    color: 'from-slate-600 to-slate-800',
  },
]

const steps = [
  {
    image: stepWelcome,
    title: 'L\'administration ouvre la faculté',
    desc: 'Universités, facultés, filières, niveaux, UE et salles sont enregistrés une fois ; les comptes enseignants et délégués sont créés par l\'administration.',
  },
  {
    image: stepUniverse,
    title: 'L\'étudiant s\'inscrit et choisit sa filière',
    desc: 'Depuis la liste réelle de sa faculté. Son emploi du temps, ses UE et ses enseignants apparaissent aussitôt, sur le web, le mobile et le desktop.',
  },
  {
    image: stepConnected,
    title: 'Chacun travaille, connecté ou non',
    desc: 'Présences, devoirs, messages et documents suivent. Uni, l\'assistant, répond aux questions à partir des données du compte.',
  },
]

const stack = [
  {
    icon: Globe2,
    title: 'Web',
    items: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS 4', 'Framer Motion', 'TanStack Query'],
    color: 'bg-[#eff3ff] text-[#1e3a8a]',
  },
  {
    icon: Smartphone,
    title: 'Mobile & desktop',
    items: ['Flutter', 'Riverpod', 'Drift (SQLite)', 'Synchronisation en arrière-plan', 'LiveKit (desktop)'],
    color: 'bg-[#f0fdfa] text-[#0d9488]',
  },
  {
    icon: Cloud,
    title: 'Backend',
    items: ['Appwrite Cloud (Francfort)', 'Auth & labels de rôle', 'Bases & Storage', 'Functions Node 22', 'Realtime'],
    color: 'bg-purple-50 text-purple-700',
  },
  {
    icon: Bot,
    title: 'Assistant Uni',
    items: ['Gemini 3.1 Flash-Lite', 'Repli Mistral', 'Clés côté serveur uniquement', 'Contexte : profil, UE, emploi du temps'],
    color: 'bg-amber-50 text-amber-700',
  },
]

const timeline = [
  { when: '2024', title: 'KERNEL FORGE se lance', desc: 'Une startup fondée par des étudiants en informatique de l\'Université de Yaoundé I : fabriquer des logiciels utiles à leur propre campus, puis en faire un métier.' },
  { when: 'Été 2026', title: 'UniFlow prend forme', desc: 'Trois clients — web, mobile, desktop — pensés dès le départ pour fonctionner avec un réseau intermittent.' },
  { when: 'Septembre 2026', title: 'Un seul backend : Appwrite Cloud', desc: 'Migration complète, référentiel académique réel de la Faculté des Sciences, emplois du temps filtrés par filière et niveau, assistant Uni.' },
  { when: 'Ensuite', title: 'Devenir l\'entreprise des universités', desc: 'Ouvrir UniFlow à d\'autres facultés puis d\'autres universités, avec des offres d\'intégration et un accompagnement : chaque administration enregistre sa structure, la plateforme reste la même.' },
]

const platforms = [
  { icon: Globe2, label: 'Web', detail: 'uniflow.kernelforge.codes' },
  { icon: Smartphone, label: 'Android', detail: 'hors ligne, synchro en arrière-plan' },
  { icon: Monitor, label: 'Desktop', detail: 'Linux · Windows · visioconférence locale' },
]

function Illustration({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.figure
      initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-[2rem] border border-[#e5e7eb] bg-white shadow-[0_30px_80px_-30px_rgba(30,58,138,0.35)] ${className}`}
    >
      <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </motion.figure>
  )
}

export default function AboutPage() {
  const { data: stats } = usePublicStats()
  const reduced = useReducedMotion()

  const figures = [
    { icon: Building2, label: 'Universités', value: stats?.universities ?? 0 },
    { icon: GraduationCap, label: 'Filières', value: stats?.programs ?? 0 },
    { icon: BookOpen, label: 'Unités d\'enseignement', value: stats?.courses ?? 0 },
    { icon: Users, label: 'Comptes', value: stats?.users ?? 0 },
  ]

  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNavbar />

      {/* Héros : titre + illustration campus */}
      <section className="relative overflow-hidden bg-[#0f1f4d]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(124,58,237,0.35),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div className="space-y-7">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-100 backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5" /> Projet KERNEL FORGE · {COVERAGE_LABEL}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl"
            >
              La vie de la faculté,
              <span className="block bg-gradient-to-r from-teal-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                dans la poche de chacun.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl text-lg leading-relaxed text-blue-100/90"
            >
              UniFlow relie l'administration, les enseignants, les délégués et les étudiants d'une
              université autour des mêmes données : emplois du temps, présences, devoirs, messages,
              documents. Sur le web, sur Android et sur le poste de l'enseignant — avec ou sans réseau.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#1e3a8a] shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              >
                Créer un compte étudiant
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/presentation"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                Voir la présentation
              </Link>
            </motion.div>
            <div className="flex flex-wrap gap-5 pt-2">
              {platforms.map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.label} className="flex items-center gap-2.5 text-sm text-blue-100/80">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-teal-200">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span>
                      <span className="block font-bold text-white">{p.label}</span>
                      <span className="block text-xs">{p.detail}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative">
            <Illustration src={campusHero} alt="Étudiants sur un campus universitaire, consultant UniFlow sur ordinateur, téléphone et tablette" className="aspect-[16/10]" />
            <motion.div
              initial={{ opacity: 0, x: reduced ? 0 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-4 hidden sm:block"
            >
              <UniMascot
                pose="graduate"
                size={150}
                bubble={<span>Bienvenue ! Ici je vous raconte ce qu'on fabrique — et pourquoi.</span>}
                bubbleSide="right"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chiffres réels */}
      <section className="border-b border-[#e5e7eb] bg-[#f9fafb]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {figures.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.label} className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#1e3a8a] shadow-sm ring-1 ring-[#e5e7eb]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-2xl font-black text-[#111827]">
                    <CountUp value={f.value} />
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">{f.label}</div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="pb-6 text-center text-xs text-[#9ca3af]">Chiffres lus en direct dans la base Appwrite du projet.</p>
      </section>

      {/* Mission + hors ligne */}
      <AnimatedSection className="bg-white py-20 lg:py-28" stagger>
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          <Illustration src={offlineFirst} alt="Un étudiant travaille sur UniFlow la nuit, sans connexion ; les données attendent la synchronisation" className="aspect-square lg:order-2" />
          <div className="space-y-6 lg:order-1">
            <ScrollFloat containerClassName="text-3xl font-black text-[#111827] lg:text-5xl" animationDuration={0.8} stagger={0.02}>
              Pourquoi UniFlow existe
            </ScrollFloat>
            <motion.p variants={fadeInUp} className="text-lg leading-relaxed text-[#4b5563]">
              Sur nos campus, l'information circule encore par affichage, par bouche-à-oreille et par groupes
              WhatsApp qui débordent. Un changement de salle se perd, une feuille de présence disparaît, un
              délégué passe ses soirées à recopier des notes. Et la connexion n'est jamais garantie.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-lg leading-relaxed text-[#4b5563]">
              UniFlow part de là : <strong className="text-[#111827]">une seule source de vérité</strong> par
              université, des rôles vérifiés par le serveur, et des applications qui continuent de fonctionner
              quand le réseau tombe — les données consultées restent lisibles, les actions attendent leur tour
              et partent dès que possible.
            </motion.p>
            <motion.ul variants={fadeInUp} className="grid gap-3 sm:grid-cols-2">
              {[
                'Session conservée jusqu\'à la déconnexion',
                'Emplois du temps, UE et documents en cache local',
                'Présences et messages mis en file hors ligne',
                'Synchronisation en arrière-plan au retour du réseau',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#374151]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#f0fdfa] text-[#0d9488]">
                    <WifiOff className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </AnimatedSection>

      {/* Ce que la plateforme fait */}
      <AnimatedSection className="bg-[#f9fafb] py-20 lg:py-28" stagger>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
            <ScrollFloat containerClassName="text-3xl font-black text-[#111827] lg:text-5xl" animationDuration={0.8} stagger={0.02}>
              Ce qu'UniFlow fait, concrètement
            </ScrollFloat>
            <motion.p variants={fadeInUp} className="text-lg text-[#6b7280]">
              Six piliers, présents sur les trois applications avec les mêmes données.
            </motion.p>
          </div>
          <motion.div variants={staggerContainer} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon
              return (
                <AnimatedItem key={p.title}>
                  <motion.article
                    whileHover={reduced ? undefined : { y: -6 }}
                    className="group h-full rounded-3xl border border-[#e5e7eb] bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-[#1e3a8a]/10"
                  >
                    <span className={`inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold leading-snug text-[#111827]">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">{p.desc}</p>
                  </motion.article>
                </AnimatedItem>
              )
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Comment ça marche */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <ScrollFloat containerClassName="text-3xl font-black text-[#111827] lg:text-5xl" animationDuration={0.8} stagger={0.02}>
              Comment ça marche
            </ScrollFloat>
          </div>
          <motion.ol
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-10 lg:grid-cols-3"
          >
            {steps.map((s, i) => (
              <AnimatedItem key={s.title}>
                <li className="relative flex h-full flex-col">
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eff3ff] to-[#f0fdfa] p-4">
                    <img src={s.image} alt="" loading="lazy" decoding="async" className="mx-auto aspect-square w-full max-w-[320px] object-contain drop-shadow-xl" />
                    <span className="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-[#1e3a8a] text-sm font-black text-white shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-[#111827]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">{s.desc}</p>
                </li>
              </AnimatedItem>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* Équipe + histoire */}
      <AnimatedSection className="bg-[#0f1f4d] py-20 text-white lg:py-28" stagger>
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          <div className="space-y-7">
            <div className="flex items-center gap-4">
              <img
                src={KERNEL_FORGE_LOGO_URL}
                alt={KERNEL_FORGE_LOGO_ALT}
                className="h-14 w-14 rounded-2xl bg-white/95 object-contain p-1.5"
                onError={(e) => {
                  const t = e.currentTarget
                  if (!t.dataset.fallback) { t.dataset.fallback = '1'; t.src = KERNEL_FORGE_LOGO_FALLBACK_URL }
                }}
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-200">La startup qui le fabrique</p>
                <h2 className="text-3xl font-black lg:text-4xl">KERNEL FORGE</h2>
              </div>
            </div>
            <motion.p variants={fadeInUp} className="text-lg leading-relaxed text-blue-100/90">
              KERNEL FORGE est une jeune startup technologique fondée par des étudiants en informatique de la
              Faculté des Sciences de l'Université de Yaoundé I. UniFlow est son premier produit : construit pour
              sa propre faculté d'abord — avec les vrais emplois du temps, les vraies UE et les vraies contraintes
              de réseau — avec l'ambition de devenir demain l'entreprise qui équipe les universités de la région.
            </motion.p>
            <motion.ol variants={fadeInUp} className="relative space-y-6 border-l border-white/15 pl-6">
              {timeline.map((t) => (
                <li key={t.title} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-teal-300 ring-4 ring-[#0f1f4d]" />
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-200">{t.when}</p>
                  <h3 className="mt-1 font-bold text-white">{t.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-blue-100/80">{t.desc}</p>
                </li>
              ))}
            </motion.ol>
            <motion.div variants={fadeInUp}>
              <Link
                to="/teams"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1e3a8a] transition hover:-translate-y-0.5"
              >
                <Heart className="h-4 w-4 text-rose-500" /> Rencontrer l'équipe
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
          <Illustration src={teamLab} alt="L'équipe KERNEL FORGE travaille en laboratoire devant un tableau de bord UniFlow" className="aspect-square" />
        </div>
      </AnimatedSection>

      {/* Technologies */}
      <AnimatedSection className="bg-white py-20 lg:py-28" stagger>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
            <ScrollFloat containerClassName="text-3xl font-black text-[#111827] lg:text-5xl" animationDuration={0.8} stagger={0.02}>
              Sous le capot
            </ScrollFloat>
            <motion.p variants={fadeInUp} className="text-lg text-[#6b7280]">
              Un seul backend pour trois applications, et aucune clé sensible dans les clients.
            </motion.p>
          </div>
          <motion.div variants={staggerContainer} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stack.map((s) => {
              const Icon = s.icon
              return (
                <AnimatedItem key={s.title}>
                  <div className="h-full rounded-3xl border border-[#e5e7eb] bg-[#f9fafb] p-6">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-11 w-11 place-items-center rounded-xl ${s.color}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-lg font-bold text-[#111827]">{s.title}</h3>
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {s.items.map((item) => (
                        <li key={item} className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-xs font-semibold text-[#374151]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedItem>
              )
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Appel : honnête sur l'état du projet */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] py-24">
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 lg:flex-row lg:items-end">
          <div className="hidden lg:block">
            <UniMascot pose="pointing" size={210} />
          </div>
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
              En développement actif · version 2026
            </span>
            <h2 className="text-4xl font-black leading-tight text-white lg:text-5xl">
              Votre faculté aussi peut y passer.
            </h2>
            <p className="text-lg leading-relaxed text-white/90">
              Les étudiants créent leur compte librement. Les administrations d'université obtiennent leur
              accès auprès de l'équipe, qui enregistre la structure académique avec elles. Écrivez-nous sur
              WhatsApp : c'est aussi par là que passe la facturation.
            </p>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <a
                href={CONTACT_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-[#1e3a8a] shadow-2xl transition hover:-translate-y-0.5"
              >
                Parler à l'équipe sur WhatsApp
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Voir les offres
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
