import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Play, CheckCircle, GraduationCap, Users, Wifi, Shield,
  MessageSquare, BarChart3, Zap, ChevronRight,
  Smartphone, Globe, Monitor, Star, TrendingUp, Clock, Award
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { OptimizedImage } from '../components/ui/OptimizedImage'
import { AnimatedSection, AnimatedItem } from '../components/ui/AnimatedSection'
import { ScrollFloat } from '../components/ui/ScrollFloat'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { fadeInUp, staggerContainer, float } from '../utils/animations'
import { useApi } from '../hooks/useApi'
import { statsApi } from '../lib/api'
const landingImg = '/logos/mascotte.png'

const defaultStats = [
  { icon: Users, value: '12 000+', label: 'Étudiants actifs', color: 'text-[#1e3a8a] bg-[#eff3ff]' },
  { icon: Award, value: '480+', label: 'Enseignants', color: 'text-[#0d9488] bg-[#f0fdfa]' },
  { icon: TrendingUp, value: '98%', label: 'Satisfaction', color: 'text-purple-700 bg-purple-50' },
  { icon: Clock, value: '24/7', label: 'Disponibilité', color: 'text-amber-700 bg-amber-50' },
]

const features = [
  {
    icon: GraduationCap,
    title: 'Gestion académique complète',
    desc: 'Cours, emplois du temps, devoirs, notes et bulletins centralisés dans une interface intuitive et moderne.',
    color: 'bg-[#eff3ff] text-[#1e3a8a]',
    gradient: 'from-[#eff3ff] to-[#dce5fd]'
  },
  {
    icon: Users,
    title: 'Multi-rôles intelligent',
    desc: 'Étudiant, Délégué, Enseignant, Admin — chaque acteur dispose de son espace dédié et personnalisé.',
    color: 'bg-purple-50 text-purple-700',
    gradient: 'from-purple-50 to-purple-100'
  },
  {
    icon: Wifi,
    title: 'Offline First puissant',
    desc: 'Fonctionne sans Internet. Base de données locale avec synchronisation automatique au retour du réseau.',
    color: 'bg-[#f0fdfa] text-[#0d9488]',
    gradient: 'from-[#f0fdfa] to-[#ccfbf1]'
  },
  {
    icon: Shield,
    title: 'Sécurité & Confidentialité',
    desc: 'Données chiffrées et protégées. Authentification sécurisée avec gestion des rôles et permissions.',
    color: 'bg-amber-50 text-amber-700',
    gradient: 'from-amber-50 to-amber-100'
  },
  {
    icon: MessageSquare,
    title: 'Communication intégrée',
    desc: 'Forums par cours, messagerie instantanée et visioconférence sur réseau local pour cours magistraux.',
    color: 'bg-indigo-50 text-indigo-700',
    gradient: 'from-indigo-50 to-indigo-100'
  },
  {
    icon: BarChart3,
    title: 'Statistiques avancées',
    desc: 'Taux de présence, moyennes, analyses détaillées et génération automatique de bulletins PDF.',
    color: 'bg-rose-50 text-rose-700',
    gradient: 'from-rose-50 to-rose-100'
  },
]

const platforms = [
  { icon: Smartphone, label: 'Mobile', sub: 'iOS & Android', color: 'text-[#1e3a8a]' },
  { icon: Globe, label: 'Web', sub: 'PWA Progressive', color: 'text-[#0d9488]' },
  { icon: Monitor, label: 'Desktop', sub: 'Win, Mac, Linux', color: 'text-purple-700' },
]

const testimonials = [
  {
    name: 'Dr. Kamga',
    role: 'Enseignant — Informatique',
    text: 'UniFlow a transformé ma gestion de cours. La synchronisation offline est parfaite pour nos campus avec une connexion instable.',
    avatar: 'K',
    rating: 5
  },
  {
    name: 'Emma Martin',
    role: 'Étudiante L2 — Informatique',
    text: 'Je suis mes cours, devoirs et présences depuis mon téléphone, même sans connexion. Interface intuitive et rapide.',
    avatar: 'E',
    rating: 5
  },
  {
    name: 'Lucas Dubois',
    role: 'Délégué — L2 Info',
    text: 'La gestion des présences par QR code en mode local, avec statistiques en temps réel. Exactement ce dont on avait besoin.',
    avatar: 'L',
    rating: 5
  },
]

export default function LandingPage() {
  const { data: overview, loading: overviewLoading, error: overviewError } = useApi(() => statsApi.overview())

  const stats = overview
    ? [
        { icon: Users, value: `${overview.studentCount}`, label: 'Étudiants actifs', color: 'text-[#1e3a8a] bg-[#eff3ff]' },
        { icon: Award, value: `${overview.teacherCount}`, label: 'Enseignants', color: 'text-[#0d9488] bg-[#f0fdfa]' },
        { icon: TrendingUp, value: `${overview.satisfactionRate}%`, label: 'Satisfaction', color: 'text-purple-700 bg-purple-50' },
        { icon: Clock, value: overview.supportAvailability, label: 'Disponibilité', color: 'text-amber-700 bg-amber-50' },
      ]
    : defaultStats

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <LandingNavbar />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#f9fafb] to-[#eff3ff] min-h-screen flex items-center">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#1e3a8a] blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#0d9488] blur-3xl"
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1920px] px-6 py-20 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.span 
                variants={fadeInUp}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#eff3ff] to-[#dce5fd] px-4 py-2 text-sm font-semibold text-[#1e3a8a] border border-[#1e3a8a]/10 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0d9488] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0d9488]" />
                </span>
                Plateforme universitaire intelligente
              </motion.span>

              <motion.h1 
                variants={fadeInUp}
                className="text-5xl font-black leading-tight text-[#111827] lg:text-6xl xl:text-7xl"
              >
                Simplifiez l'éducation,<br />
                <span className="bg-gradient-to-r from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] bg-clip-text text-transparent">
                  libérez le potentiel
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-xl text-[#6b7280] leading-relaxed max-w-xl"
              >
                UniFlow centralise cours, emplois du temps, présences, devoirs et communications
                dans une plateforme moderne, pensée pour les universités africaines.
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-4"
              >
                <Link to="/app">
                  <Button size="lg" className="gap-2 text-base px-8 py-4 shadow-lg shadow-[#1e3a8a]/20">
                    Essayer gratuitement <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/presentation">
                  <Button variant="outline" size="lg" className="gap-3 text-base px-8 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eff3ff]">
                      <Play className="h-4 w-4 ml-0.5 text-[#1e3a8a]" />
                    </div>
                    Voir la démo vidéo
                  </Button>
                </Link>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                {[
                  { icon: CheckCircle, text: 'Gratuit & Open Source' },
                  { icon: Wifi, text: 'Offline First' },
                  { icon: Zap, text: 'Multi-plateforme' },
                ].map(({ icon: Icon, text }) => (
                  <motion.span 
                    key={text}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 text-sm font-medium text-[#374151]"
                  >
                    <Icon className="h-5 w-5 text-[#0d9488]" />
                    {text}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — dashboard image */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Floating badge */}
              <motion.div 
                variants={float}
                initial="initial"
                animate="animate"
                className="absolute -top-8 -left-8 z-10 rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#0a7167] px-6 py-4 text-white shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-2">
                    <Wifi className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium opacity-90">Mode</p>
                    <p className="text-sm font-bold">Offline actif</p>
                  </div>
                </div>
              </motion.div>

              {/* Hero image */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative mx-auto w-full max-w-[520px] rounded-3xl border-2 border-[#e5e7eb] bg-white shadow-2xl overflow-hidden"
              >
                <OptimizedImage
                  src={landingImg}
                  alt="UniFlow Dashboard"
                  className="w-full h-auto object-contain"
                  loading="eager"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <AnimatedSection className="border-y border-[#e5e7eb] bg-white py-16">
        {overviewError && (
          <div className="mx-auto max-w-[1920px] px-6 pb-6 text-center text-sm text-red-600">
            Impossible de charger les statistiques en temps réel. Les valeurs affichées sont approximatives.
          </div>
        )}
        <div className="mx-auto max-w-[1920px] px-6">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 lg:grid-cols-4"
          >
            {stats.map(({ icon: Icon, value, label, color }) => (
              <AnimatedItem key={label}>
                <Card hover className="text-center space-y-4">
                  <div className={`mx-auto w-fit rounded-2xl p-4 ${color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <motion.p 
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl font-black text-[#111827]"
                    >
                      {value}
                    </motion.p>
                    <p className="text-sm text-[#6b7280] mt-2 font-medium">{label}</p>
                  </div>
                </Card>
              </AnimatedItem>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── Platforms Section ── */}
      <section className="bg-gradient-to-br from-[#f9fafb] to-white py-12">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-8">
            Disponible sur toutes les plateformes
          </p>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {platforms.map(({ icon: Icon, label, sub, color }) => (
              <AnimatedItem key={label}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="flex items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white px-6 py-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#f9fafb] to-[#eff3ff] ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{label}</p>
                    <p className="text-xs text-[#6b7280]">{sub}</p>
                  </div>
                </motion.div>
              </AnimatedItem>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <AnimatedSection className="bg-white py-24" stagger>
        <div className="mx-auto max-w-[1920px] px-6">
          <div className="text-center mb-16 space-y-4">
            <ScrollFloat 
              containerClassName="text-4xl font-black text-[#111827] lg:text-5xl"
              animationDuration={0.8}
              stagger={0.02}
            >
              Fonctionnalités avancées
            </ScrollFloat>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-[#6b7280] max-w-2xl mx-auto"
            >
              Tout ce dont vous avez besoin pour gérer votre établissement universitaire efficacement
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <AnimatedItem key={feat.title}>
                  <Card hover className="h-full space-y-4 group">
                    <div className={`w-fit rounded-2xl p-4 bg-gradient-to-br ${feat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-7 w-7 ${feat.color.split(' ')[1]}`} />
                    </div>
                    <h3 className="text-lg font-bold text-[#111827]">{feat.title}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{feat.desc}</p>
                  </Card>
                </AnimatedItem>
              )
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── Testimonials Section ── */}
      <section className="bg-gradient-to-br from-[#f9fafb] to-white py-24">
        <div className="mx-auto max-w-[1920px] px-6">
          <div className="text-center mb-16 space-y-4">
            <ScrollFloat 
              containerClassName="text-4xl font-black text-[#111827] lg:text-5xl"
              animationDuration={0.8}
              stagger={0.02}
            >
              Ce qu'ils en disent
            </ScrollFloat>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {testimonials.map((test, idx) => (
              <AnimatedItem key={idx}>
                <Card hover className="h-full space-y-6">
                  <div className="flex gap-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[#374151] leading-relaxed italic">"{test.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#e5e7eb]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] text-white font-bold text-lg">
                      {test.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{test.name}</p>
                      <p className="text-xs text-[#6b7280]">{test.role}</p>
                    </div>
                  </div>
                </Card>
              </AnimatedItem>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-gradient-to-br from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] py-24 relative overflow-hidden">
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        
        <div className="relative mx-auto max-w-4xl px-6 text-center space-y-8">
          <ScrollFloat 
            containerClassName="text-4xl font-black text-white lg:text-5xl"
            textClassName="text-white"
            animationDuration={0.8}
            stagger={0.02}
          >
            Prêt à transformer votre université ?
          </ScrollFloat>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            Rejoignez les milliers d'étudiants et enseignants qui utilisent déjà UniFlow
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/app">
              <Button 
                size="lg" 
                className="bg-white text-[#1e3a8a] hover:bg-gray-50 text-lg px-10 py-5 shadow-2xl gap-3"
              >
                Commencer gratuitement <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
