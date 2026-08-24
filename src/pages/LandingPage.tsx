import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Play, CheckCircle, GraduationCap, Users, Wifi, Shield,
  MessageSquare, BarChart3, Zap, ChevronRight,
  Smartphone, Globe, Monitor, TrendingUp, Clock, Award,
  QrCode, BookOpen, Calendar, Calculator, HelpCircle, ChevronDown,
  Sparkles, Check, Laptop, ShieldCheck, FileText, CheckCircle2
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { OptimizedImage } from '../components/ui/OptimizedImage'
import { AnimatedSection, AnimatedItem } from '../components/ui/AnimatedSection'
import { ScrollFloat } from '../components/ui/ScrollFloat'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { fadeInUp, staggerContainer, float } from '../utils/animations'
import { cn } from '../utils/cn'
import { useUserRole } from '../utils/userRole'

const landingImg = 'https://i.imgur.com/35YpEbS.png'

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
  { icon: Smartphone, label: 'Mobile', sub: 'iOS & Android (PWA)', color: 'text-[#1e3a8a]' },
  { icon: Globe, label: 'Web', sub: 'PWA Navigabilité', color: 'text-[#0d9488]' },
  { icon: Monitor, label: 'Desktop', sub: 'Windows, Mac, Linux', color: 'text-purple-700' },
]

const faqs = [
  {
    q: "UniFlow fonctionne-t-il réellement sans connexion Internet ?",
    a: "Oui ! UniFlow utilise une architecture Offline-First avec stockage local haute performance. Vous pouvez consulter vos cours, émarger par QR code ou enregistrer vos notes sans réseau. Dès que la connexion revient, les données sont synchronisées automatiquement."
  },
  {
    q: "Comment s'effectue le passage de présence par QR Code ?",
    a: "Le délégué ou l'enseignant génère un QR code dynamique sur son écran. Chaque étudiant scanne le code depuis l'application mobile ou web UniFlow pour valider sa présence instantanément en local."
  },
  {
    q: "Quels sont les rôles pris en charge par l'application ?",
    a: "UniFlow prend en charge 4 rôles distincts : Étudiant (consultation des cours, devoirs, notes), Délégué (gestion de classe, présences), Enseignant (dépôt de cours, saisie des notes) et Administrateur (gestion du campus, des salles et des utilisateurs)."
  },
  {
    q: "Puis-je installer UniFlow comme une application mobile ?",
    a: "Absolument. UniFlow est une PWA (Progressive Web App). Vous pouvez l'installer en un clic depuis votre navigateur Safari ou Chrome pour l'utiliser comme une application native iOS/Android sans repasser par le Store."
  },
  {
    q: "Comment sont sécurisées nos données académiques ?",
    a: "Toutes les données sensibles (notes, identifiants, bulletins) sont chiffrées localement et lors de la transmission. Nous appliquons des politiques de confidentialité strictes et des sauvegardes redondantes."
  }
]

type RoleTab = 'etudiant' | 'delegue' | 'enseignant' | 'admin'

export default function LandingPage() {
  const { currentUser, authUser, isSessionReady } = useUserRole()
  const isConnected = isSessionReady && currentUser.email !== '—'
  const workspacePath = authUser?.role === 'ADMIN' ? '/admin' : '/app'
  // Les statistiques de campus nécessitent une session universitaire. La page publique
  // n’appelle donc aucun endpoint protégé et n’invente aucune métrique.
  const stats: Array<{ icon: typeof Users; value: string; label: string; color: string }> = []

  // Interactive Demo State
  const [activeRoleTab, setActiveRoleTab] = useState<RoleTab>('etudiant')

  // Calculator State
  const [studentCount, setStudentCount] = useState<number | null>(null)

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Calculated ROI values
  const paperSavedSheets = studentCount === null ? null : Math.round(studentCount * 140)
  const hoursSavedPerSemester = studentCount === null ? null : Math.round((studentCount / 100) * 18)
  const treesSaved = paperSavedSheets === null ? null : (paperSavedSheets / 8000).toFixed(1)

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#f8fafc] to-[#eff3ff] min-h-screen flex items-center pt-24 pb-16">
        {/* Background glow graphics */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-teal-500/15 blur-3xl"
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1920px] px-6 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8 text-left"
            >
              <motion.span
                variants={fadeInUp}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#eff3ff] to-[#dce5fd] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#1e3a8a] border border-[#1e3a8a]/20 shadow-xs"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600" />
                </span>
                <span>Plateforme Universitaire Intelligente Offline-First</span>
              </motion.span>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.08] text-[#0f172a] tracking-tight"
              >
                Simplifiez l'éducation,<br />
                <span className="bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#0d9488] bg-clip-text text-transparent">
                  libérez le potentiel académique
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl font-medium"
              >
                UniFlow centralise cours, emplois du temps, présences QR code, devoirs, notes et bulletins
                dans une plateforme moderne conçue sur mesure pour les universités.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <Link to={workspacePath}>
                  <Button size="lg" className="gap-2.5 text-base px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold border-b-4 border-blue-950 shadow-xl shadow-blue-600/25 active:translate-y-0.5 transition-all rounded-2xl">
                    {isConnected ? 'Reprendre mon espace' : "Accéder à l'application"} <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/presentation">
                  <Button variant="outline" size="lg" className="gap-3 text-base px-8 py-4 border-2 border-slate-200 hover:border-blue-600 font-extrabold text-slate-800 rounded-2xl shadow-xs">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <Play className="h-4 w-4 ml-0.5 fill-current" />
                    </div>
                    Voir la démonstration
                  </Button>
                </Link>
              </motion.div>

              {/* Key Highlights */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/80"
              >
                {[
                  { icon: CheckCircle2, text: '100% Gratuit & PWA' },
                  { icon: Wifi, text: 'Fonctionne sans réseau' },
                  { icon: Zap, text: 'Multi-rôles sécurisé' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Icon className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Interactive Mascotte & Badges Hero Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              {/* Floating Badge 1: Offline status */}
              <motion.div
                variants={float}
                initial="initial"
                animate="animate"
                className="absolute -top-6 left-2 sm:-left-6 z-20 rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] px-5 py-3.5 text-white shadow-2xl border-2 border-teal-300/30"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/20 p-2.5">
                    <Wifi className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-teal-100">Technologie</p>
                    <p className="text-xs font-black text-white">Offline-First Actif ⚡</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge 2: QR Scanner */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 right-2 sm:-right-6 z-20 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 px-5 py-3.5 text-white shadow-2xl border-2 border-blue-400/30"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/20 p-2.5">
                    <QrCode className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-blue-200">Présence Instantanée</p>
                    <p className="text-xs font-black text-white">Émargement par QR Code</p>
                  </div>
                </div>
              </motion.div>

              {/* Central Hero Landing Image Container */}
              <div className="relative mx-auto w-full max-w-[540px] rounded-3xl border-4 border-slate-200/90 bg-white shadow-2xl overflow-hidden p-4 sm:p-5 text-center transform hover:scale-[1.01] transition-transform">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-teal-50/50 pointer-events-none" />
                <img
                  src={landingImg}
                  alt="Aperçu UniFlow"
                  className="w-full h-auto object-cover max-h-[440px] rounded-2xl relative z-10 mx-auto shadow-sm"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (!target.dataset.triedFallback1) {
                      target.dataset.triedFallback1 = 'true'
                      target.src = '/landing.png'
                    } else if (!target.dataset.triedFallback2) {
                      target.dataset.triedFallback2 = 'true'
                      target.src = '/Image 1.png'
                    }
                  }}
                />
                <div className="mt-4 pt-3 border-t border-slate-100 relative z-10 flex items-center justify-between text-xs font-extrabold text-slate-600 px-2">
                  <span className="flex items-center gap-1 text-blue-700">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Campus Numérique
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                    Système Synchro v2.4
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Realtime Stats Bar ── */}
      <AnimatedSection className="border-y-2 border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-[1920px] px-6 pb-4 text-center text-xs font-semibold text-slate-500">
          Les métriques de campus apparaissent après connexion à un compte universitaire autorisé.
        </div>
        <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6 lg:grid-cols-4"
          >
            {stats.map(({ icon: Icon, value, label, color }) => (
              <AnimatedItem key={label}>
                <Card hover className="text-center space-y-3 p-6 rounded-3xl border-2 border-slate-200/80 shadow-md">
                  <div className={`mx-auto w-fit rounded-2xl p-3.5 ${color} shadow-xs`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
                      {value}
                    </p>
                    <p className="text-xs font-extrabold text-[#64748b] uppercase tracking-wider mt-1">{label}</p>
                  </div>
                </Card>
              </AnimatedItem>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── Interactive Role Previewer (Demo Sandbox) ── */}
      <section className="bg-gradient-to-b from-[#f8fafc] via-white to-[#f8fafc] py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider px-3.5 py-1 mb-3">
              Aperçu Interactif
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
              Une expérience sur mesure pour chaque acteur du campus
            </h2>
            <p className="text-sm sm:text-base text-[#64748b] font-medium mt-2">
              Cliquez ci-dessous pour découvrir comment UniFlow s'adapte précisément aux besoins de chaque rôle.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {[
              { id: 'etudiant', label: 'Espace Étudiant', icon: GraduationCap, color: 'bg-blue-600 text-white shadow-blue-600/20' },
              { id: 'delegue', label: 'Espace Délégué', icon: QrCode, color: 'bg-amber-600 text-white shadow-amber-600/20' },
              { id: 'enseignant', label: 'Espace Enseignant', icon: BookOpen, color: 'bg-teal-600 text-white shadow-teal-600/20' },
              { id: 'admin', label: 'Espace Administrateur', icon: ShieldCheck, color: 'bg-purple-600 text-white shadow-purple-600/20' },
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeRoleTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRoleTab(tab.id as RoleTab)}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-extrabold transition-all select-none border-2',
                    isActive
                      ? `${tab.color} border-black/20 shadow-lg -translate-y-0.5`
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Interactive Screen Display */}
          <div className="relative rounded-3xl border-4 border-slate-800 bg-slate-900 text-white p-6 sm:p-8 shadow-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {activeRoleTab === 'etudiant' && (
                <motion.div
                  key="etudiant"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  <div className="md:col-span-6 space-y-4">
                    <span className="inline-block rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 px-3 py-1 text-xs font-bold uppercase">
                      🎓 Pour les Étudiants
                    </span>
                    <h3 className="text-2xl font-black text-white">Suivi des cours & Notes en temps réel</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Accédez à votre emploi du temps interactif, vos devoirs à rendre, vos bulletins semestriels et téléchargez vos supports de cours pour une révision hors-ligne.
                    </p>
                    <ul className="space-y-2 text-xs font-semibold text-slate-300">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Notifications instantanées des devoirs</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Calcul automatique de la moyenne générale</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Téléchargement direct des cours (PDF, Audios)</li>
                    </ul>
                  </div>

                  <div className="md:col-span-6 bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 font-sans">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                      <span>Emploi du temps · Aujourd'hui</span>
                      <span className="text-emerald-400 flex items-center gap-1"><Wifi className="h-3 w-3" /> Hors-ligne actif</span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-900/40 border border-blue-600/40 space-y-1">
                      <div className="flex justify-between text-xs font-black text-blue-200">
                        <span>Aucune séance chargée</span>
                        <span>—</span>
                      </div>
                      <p className="text-[11px] text-blue-200 font-medium">Aucune session active — connectez-vous pour afficher vos données réelles.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-black text-slate-200">
                        <span>Aucun cours chargé</span>
                        <span>—</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Connectez-vous pour charger votre emploi du temps réel.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeRoleTab === 'delegue' && (
                <motion.div
                  key="delegue"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  <div className="md:col-span-6 space-y-4">
                    <span className="inline-block rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3 py-1 text-xs font-bold uppercase">
                      📱 Pour les Délégués
                    </span>
                    <h3 className="text-2xl font-black text-white">Génération de QR Code & Gestion de Classe</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Scannez ou affichez le QR code dynamique pour la prise de présence en amphi, soumettez des comptes-rendus et communiquez directement avec les professeurs.
                    </p>
                    <ul className="space-y-2 text-xs font-semibold text-slate-300">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Émargement haute vitesse par QR Code</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Liste des absents et retards en direct</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Réservation de salles pour travaux de groupe</li>
                    </ul>
                  </div>

                  <div className="md:col-span-6 bg-slate-950 rounded-2xl p-5 border border-slate-800 text-center space-y-3">
                    <div className="inline-block p-4 rounded-2xl bg-white text-slate-900 shadow-xl border-4 border-amber-400">
                      <QrCode className="h-24 w-24 mx-auto" />
                    </div>
                    <p className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      QR Code de présence — aucune session active
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Les présences réelles apparaîtront après connexion à un compte délégué.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeRoleTab === 'enseignant' && (
                <motion.div
                  key="enseignant"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  <div className="md:col-span-6 space-y-4">
                    <span className="inline-block rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-300 px-3 py-1 text-xs font-bold uppercase">
                      👨‍🏫 Pour les Enseignants
                    </span>
                    <h3 className="text-2xl font-black text-white">Cahier de Texte & Dépôt des Notes</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Publiez vos fichiers de cours, évaluez les devoirs en ligne, gérez vos cahiers de texte et générez les PV de notes sans erreur de calcul.
                    </p>
                    <ul className="space-y-2 text-xs font-semibold text-slate-300">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Saisie sécurisée des notes de CC et d'examen</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Partage de cours PDF, vidéos et exercices</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Validation électronique des présences</li>
                    </ul>
                  </div>

                  <div className="md:col-span-6 bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-teal-300 font-bold border-b border-slate-800 pb-2">
                      <span>Saisie des notes — aucune évaluation chargée</span>
                      <span className="text-xs bg-teal-900/60 text-teal-200 px-2 py-0.5 rounded">Moyenne : —</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                      <span className="text-slate-400">Aucune note chargée</span>
                      <span className="text-slate-500 font-bold">—</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                      <span className="text-slate-400">Aucune note chargée</span>
                      <span className="text-slate-500 font-bold">—</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeRoleTab === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  <div className="md:col-span-6 space-y-4">
                    <span className="inline-block rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 px-3 py-1 text-xs font-bold uppercase">
                      🏛️ Pour l'Administration
                    </span>
                    <h3 className="text-2xl font-black text-white">Supervision Globale & Gestion des Salles</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Pilotez les emplois du temps de toute la faculté, attribuez les amphis, gérez les comptes utilisateurs et éditez les bulletins officiels.
                    </p>
                    <ul className="space-y-2 text-xs font-semibold text-slate-300">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Taux d'occupation des salles en temps réel</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Génération automatique de bulletins PDF</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Gestion fine des permissions et des comptes</li>
                    </ul>
                  </div>

                  <div className="md:col-span-6 bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-purple-300 border-b border-slate-800 pb-2 flex justify-between">
                      <span>Tableau de Bord Campus</span>
                      <span className="text-emerald-400 font-mono">Données campus disponibles après connexion</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-lg font-extrabold text-white">—</div>
                        <div className="text-[10px] text-slate-400">Présence Globale</div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-lg font-extrabold text-teal-400">—</div>
                        <div className="text-[10px] text-slate-400">Occupation des amphis</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── Dynamic ROI / Impact Calculator ── */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#0d9488] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/30">
                  <Calculator className="h-4 w-4 text-amber-300" /> Calculateur d'Impact Campus
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Calculez l'économie de temps & de papier pour votre établissement
                </h3>
              </div>

              {/* Slider Input */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-xl mx-auto space-y-3">
                <div className="flex justify-between items-center text-sm font-extrabold text-white">
                  <span>Nombre d'étudiants inscrits :</span>
                  <span className="text-xl font-black text-amber-300 bg-black/20 px-3 py-1 rounded-xl border border-amber-300/30 font-mono">
                    {studentCount === null ? 'Saisissez un effectif' : `${studentCount.toLocaleString()} étudiants`}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="25000"
                  step="100"
                  value={studentCount ?? 200}
                  onChange={e => setStudentCount(Number(e.target.value))}
                  className="w-full h-3 bg-white/30 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[11px] text-blue-100 font-bold">
                  <span>200 (Institut)</span>
                  <span>10,000</span>
                  <span>25,000 (Grande Faculté)</span>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl bg-white/15 p-5 backdrop-blur-md border border-white/25 shadow-md">
                  <div className="text-3xl font-black text-amber-300 font-mono">{paperSavedSheets === null ? '—' : paperSavedSheets.toLocaleString()}</div>
                  <div className="text-xs font-extrabold text-blue-100 uppercase tracking-wider mt-1">Feuilles de papier / an économisées</div>
                  <div className="text-[10px] text-emerald-200 mt-1 font-bold">{treesSaved === null ? 'Résultat après saisie' : `Soit env. ${treesSaved} arbres préservés`}</div>
                </div>

                <div className="rounded-2xl bg-white/15 p-5 backdrop-blur-md border border-white/25 shadow-md">
                  <div className="text-3xl font-black text-teal-300 font-mono">{hoursSavedPerSemester === null ? '—' : `${hoursSavedPerSemester.toLocaleString()} h`}</div>
                  <div className="text-xs font-extrabold text-blue-100 uppercase tracking-wider mt-1">Heures de cours gagnées / sem</div>
                  <div className="text-[10px] text-teal-200 mt-1 font-bold">⚡ Prise d'appel QR code instantanée</div>
                </div>

                <div className="rounded-2xl bg-white/15 p-5 backdrop-blur-md border border-white/25 shadow-md">
                  <div className="text-3xl font-black text-white font-mono">—</div>
                  <div className="text-xs font-extrabold text-blue-100 uppercase tracking-wider mt-1">Numérisation des bulletins & PV</div>
                  <div className="text-[10px] text-blue-200 mt-1 font-bold">Disponible après connexion à un campus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platforms Section ── */}
      <section className="bg-gradient-to-br from-[#f8fafc] to-white py-16 border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-8">
            Accessible sans installation lourde sur tous vos appareils
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
                  className="flex items-center gap-4 rounded-2xl border-2 border-slate-200/80 bg-white px-6 py-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{label}</p>
                    <p className="text-xs font-semibold text-slate-500">{sub}</p>
                  </div>
                </motion.div>
              </AnimatedItem>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <AnimatedSection className="bg-white py-24 border-b border-slate-200" stagger>
        <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
          <div className="text-center mb-16 space-y-3">
            <ScrollFloat
              containerClassName="text-3xl sm:text-5xl font-black text-[#0f172a]"
              animationDuration={0.8}
              stagger={0.02}
            >
              Fonctionnalités Clés & Modules Académiques
            </ScrollFloat>
            <motion.p
              variants={fadeInUp}
              className="text-base text-slate-500 max-w-2xl mx-auto font-medium"
            >
              Une suite complète d'outils interconnectés pour moderniser votre gestion universitaire.
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
                  <Card hover className="h-full space-y-4 group p-7 rounded-3xl border-2 border-slate-200/80 shadow-md">
                    <div className={`w-fit rounded-2xl p-4 bg-gradient-to-br ${feat.gradient} group-hover:scale-110 transition-transform duration-300 shadow-xs`}>
                      <Icon className={`h-7 w-7 ${feat.color.split(' ')[1]}`} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{feat.desc}</p>
                  </Card>
                </AnimatedItem>
              )
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── Verified feedback Section ── */}
      <section className="bg-[#f8fafc] py-20 border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 shadow-sm">
            <Award className="mx-auto h-10 w-10 text-[#0d9488]" />
            <h2 className="mt-4 text-2xl font-black text-slate-900">Retours utilisateurs vérifiés</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Cette section sera alimentée uniquement par des retours consentis et vérifiables depuis des comptes UniFlow réels.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="inline-block rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider px-3.5 py-1">
              Foire Aux Questions
            </span>
            <h2 className="text-3xl font-black text-slate-900">Questions Fréquentes</h2>
            <p className="text-sm font-medium text-slate-500">
              Tout ce que vous devez savoir sur le fonctionnement d'UniFlow.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="rounded-2xl border-2 border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-extrabold text-slate-900 text-sm sm:text-base hover:text-blue-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div className={cn('rounded-xl p-1.5 transition-transform bg-slate-100', isOpen && 'rotate-180 bg-blue-100 text-blue-700')}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#0d9488] py-24 relative overflow-hidden text-white">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none"
        />

        <div className="relative mx-auto max-w-4xl px-6 text-center space-y-8 z-10">
          <ScrollFloat
            containerClassName="text-4xl font-black text-white lg:text-5xl"
            textClassName="text-white"
            animationDuration={0.8}
            stagger={0.02}
          >
            Prêt à transformer votre campus ?
          </ScrollFloat>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto font-medium"
          >
            Rejoignez les milliers d'étudiants, enseignants et administrateurs qui utilisent déjà UniFlow au quotidien.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to={workspacePath}
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-[#1e3a8a] hover:bg-slate-100 text-base font-black px-8 py-4 shadow-2xl border-b-4 border-slate-200 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Accéder à l'application gratuitement <ChevronRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
