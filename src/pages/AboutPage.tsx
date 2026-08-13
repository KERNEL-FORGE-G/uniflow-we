import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRight, Globe, Code2, Heart, Shield, Target, Zap, Users, Award, TrendingUp, Sparkles, CheckCircle
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { AnimatedSection, AnimatedItem } from '../components/ui/AnimatedSection'
import { ScrollFloat } from '../components/ui/ScrollFloat'
import { Card } from '../components/ui/Card'
import { fadeInUp, staggerContainer } from '../utils/animations'

const team = [
  { 
    name: 'NGHOMSI FEUKOUO RAVEL', 
    role: 'Fondateur & Chef de projet', 
    desc: 'GitHub: Archlord12345 · KERNEL FORGE', 
    avatar: Code2, 
    color: 'bg-[#eff3ff] text-[#1e3a8a]',
    gradient: 'from-[#1e3a8a] to-[#2d4fa8]'
  },
  { 
    name: 'KERNEL FORGE', 
    role: 'Équipe de développement', 
    desc: 'Étudiants en Informatique — Université de Yaoundé I', 
    avatar: Shield, 
    color: 'bg-[#f0fdfa] text-[#0d9488]',
    gradient: 'from-[#0d9488] to-[#14b8a8]'
  },
]

const values = [
  {
    icon: Globe,
    title: 'Accessibilité universelle',
    desc: 'Fonctionner partout, même sans Internet stable. Pour toutes les universités africaines.',
    color: 'text-[#1e3a8a] bg-[#eff3ff]'
  },
  {
    icon: Heart,
    title: 'Open Source & gratuit',
    desc: 'Code ouvert, transparent. Aucun frais d\'abonnement. L\'éducation est un droit.',
    color: 'text-rose-700 bg-rose-50'
  },
  {
    icon: Zap,
    title: 'Performance optimale',
    desc: 'Interface rapide et fluide. Optimisé pour les appareils à ressources limitées.',
    color: 'text-amber-700 bg-amber-50'
  },
  {
    icon: Users,
    title: 'Communauté active',
    desc: 'Développé par des étudiants, pour des étudiants. Feedback continu.',
    color: 'text-purple-700 bg-purple-50'
  },
]

const techStack = [
  { 
    cat: 'Frontend Web', 
    items: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Vite', 'Framer Motion'], 
    color: 'from-blue-500 to-blue-600',
    icon: Code2
  },
  { 
    cat: 'Mobile & Desktop', 
    items: ['Flutter', 'Dart', 'SQLite (offline)', 'Provider State Management'], 
    color: 'from-emerald-500 to-emerald-600',
    icon: Sparkles
  },
  { 
    cat: 'Backend', 
    items: ['Node.js / FastAPI', 'PostgreSQL', 'JWT + RBAC', 'WebSockets'], 
    color: 'from-purple-500 to-purple-600',
    icon: Shield
  },
  { 
    cat: 'DevOps & Tools', 
    items: ['Git', 'GitHub Actions', 'Vercel', 'Docker'], 
    color: 'from-amber-500 to-amber-600',
    icon: Zap
  },
]

const milestones = [
  { 
    year: '2024', 
    title: 'Naissance KERNEL FORGE', 
    desc: 'Création du groupe KERNEL FORGE par des étudiants passionnés de l\'Université de Yaoundé I.',
    icon: Target,
    color: 'bg-[#eff3ff] text-[#1e3a8a]'
  },
  { 
    year: 'Juillet 2026', 
    title: 'Idée UniFlow', 
    desc: 'Première conception du projet UniFlow lors d\'un hackathon universitaire. Vision d\'une plateforme offline-first.',
    icon: Code2,
    color: 'bg-purple-50 text-purple-700'
  },
  { 
    year: 'Août 2026', 
    title: 'Développement multiplateforme', 
    desc: 'Développement simultané du Web (React + Vite) et Mobile/Desktop (Flutter) avec 4 rôles fonctionnels.',
    icon: Sparkles,
    color: 'bg-[#f0fdfa] text-[#0d9488]'
  },
  { 
    year: 'Aujourd\'hui', 
    title: 'Phase active', 
    desc: 'Amélioration continue de toutes les plateformes, optimisation des performances et ajout de nouvelles fonctionnalités.',
    icon: TrendingUp,
    color: 'bg-rose-50 text-rose-700'
  },
  { 
    year: 'À venir', 
    title: 'API Publique & Extensions', 
    desc: 'Ouverture de l\'API REST pour intégrations tierces et développement d\'extensions communautaires.',
    icon: Award,
    color: 'bg-amber-50 text-amber-700'
  },
  { 
    year: 'À venir', 
    title: 'Sentinelle IoT', 
    desc: 'Modules IoT pour le suivi santé et vigie campus avec Raspberry Pi et IA embarquée sans cloud.',
    icon: Shield,
    color: 'bg-emerald-50 text-emerald-700'
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] py-24 lg:py-32">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-white blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white blur-3xl"
        />
        
        <div className="relative mx-auto max-w-[1920px] px-6 text-center space-y-8">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center"
          >
            <img 
              src="https://i.imgur.com/GAiZ7WY.png" 
              alt="UniFlow" 
              className="h-24 w-24 object-contain drop-shadow-2xl" 
              onError={(e) => {
                const target = e.currentTarget
                if (!target.dataset.triedFallback1) {
                  target.dataset.triedFallback1 = 'true'
                  target.src = '/logo_1.png'
                }
              }}
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black text-white lg:text-6xl"
          >
            À propos d'UniFlow
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed"
          >
            Un projet universitaire né en Afrique, pour l'Afrique. Une vision claire :
            rendre l'éducation numérique accessible, même sans connexion permanente.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <AnimatedSection className="bg-white py-20" stagger>
        <div className="mx-auto max-w-[1920px] px-6">
          <div className="text-center mb-16 space-y-4">
            <ScrollFloat 
              containerClassName="text-4xl font-black text-[#111827] lg:text-5xl"
              animationDuration={0.8}
              stagger={0.02}
            >
              Notre mission
            </ScrollFloat>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-[#6b7280] max-w-3xl mx-auto leading-relaxed"
            >
              UniFlow est une plateforme de gestion académique conçue pour fonctionner
              dans des environnements à connectivité limitée, tout en offrant une expérience
              utilisateur moderne et intuitive.
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((val) => {
              const Icon = val.icon
              return (
                <AnimatedItem key={val.title}>
                  <Card hover className="h-full space-y-4 text-center">
                    <div className={`mx-auto w-fit rounded-2xl p-4 ${val.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-[#111827]">{val.title}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{val.desc}</p>
                  </Card>
                </AnimatedItem>
              )
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Team */}
      <section className="bg-gradient-to-br from-[#f9fafb] to-white py-20">
        <div className="mx-auto max-w-[1920px] px-6">
          <div className="text-center mb-16 space-y-4">
            <ScrollFloat 
              containerClassName="text-4xl font-black text-[#111827] lg:text-5xl"
              animationDuration={0.8}
              stagger={0.02}
            >
              L'équipe KERNEL FORGE
            </ScrollFloat>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
          >
            {team.map((member) => {
              const Icon = member.avatar
              return (
                <AnimatedItem key={member.name}>
                  <Card hover className="space-y-6 text-center">
                    <div className={`mx-auto w-fit rounded-3xl p-8 bg-gradient-to-br ${member.gradient}`}>
                      <Icon className="h-16 w-16 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#111827] mb-2">{member.name}</h3>
                      <p className="text-sm font-semibold text-[#1e3a8a] mb-3">{member.role}</p>
                      <p className="text-sm text-[#6b7280]">{member.desc}</p>
                    </div>
                  </Card>
                </AnimatedItem>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <AnimatedSection className="bg-white py-20" stagger>
        <div className="mx-auto max-w-[1920px] px-6">
          <div className="text-center mb-16 space-y-4">
            <ScrollFloat 
              containerClassName="text-4xl font-black text-[#111827] lg:text-5xl"
              animationDuration={0.8}
              stagger={0.02}
            >
              Stack technique
            </ScrollFloat>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-[#6b7280] max-w-2xl mx-auto"
            >
              Technologies modernes et éprouvées pour une performance optimale
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {techStack.map((tech) => {
              const Icon = tech.icon
              return (
                <AnimatedItem key={tech.cat}>
                  <Card hover className="h-full space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-3 bg-gradient-to-br ${tech.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-[#111827]">{tech.cat}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tech.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-[#374151]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </Card>
                </AnimatedItem>
              )
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Timeline */}
      <section className="bg-gradient-to-br from-[#f9fafb] to-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16 space-y-4">
            <ScrollFloat 
              containerClassName="text-4xl font-black text-[#111827] lg:text-5xl"
              animationDuration={0.8}
              stagger={0.02}
            >
              Notre parcours
            </ScrollFloat>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {milestones.map((milestone, idx) => {
              const Icon = milestone.icon
              return (
                <AnimatedItem key={idx}>
                  <motion.div
                    whileHover={{ x: 8 }}
                    className="flex gap-6 items-start"
                  >
                    <div className="flex-shrink-0">
                      <div className={`rounded-2xl p-4 ${milestone.color}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-2xl font-black text-[#1e3a8a]">{milestone.year}</span>
                        <h3 className="text-xl font-bold text-[#111827]">{milestone.title}</h3>
                      </div>
                      <p className="text-[#6b7280] leading-relaxed">{milestone.desc}</p>
                    </div>
                  </motion.div>
                </AnimatedItem>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-br from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] py-32 overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div 
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"
        />
        
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-5 py-2 text-sm font-semibold text-white border border-white/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Rejoignez des milliers d'utilisateurs
            </motion.div>

            {/* Title */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black text-white lg:text-6xl leading-tight"
            >
              Rejoignez l'aventure
              <br />
              <span className="bg-gradient-to-r from-white via-blue-100 to-teal-100 bg-clip-text text-transparent">
                UniFlow
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
            >
              Découvrez comment UniFlow peut transformer votre expérience universitaire
              et simplifier votre quotidien académique
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/app">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button className="inline-flex items-center gap-3 rounded-xl bg-white text-[#1e3a8a] px-10 py-5 text-lg font-bold shadow-2xl hover:shadow-white/20 transition-all group">
                    Essayer maintenant
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </Link>
              
              <Link to="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button className="inline-flex items-center gap-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-10 py-5 text-lg font-bold hover:bg-white/20 hover:border-white/50 transition-all">
                    Nous contacter
                  </button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats mini */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-8 pt-8 text-white/80"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-medium">100% gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-medium">Open source</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-medium">Mode offline</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
