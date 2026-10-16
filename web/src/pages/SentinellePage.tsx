import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Wifi,
  AlertTriangle,
  Lightbulb,
  Heart,
  HeartPulse,
  Thermometer,
  Stethoscope,
  BookOpen,
  FlaskConical,
  Home,
  ParkingSquare,
  Eye,
  Cpu,
  Play,
  RefreshCw,
  Radio,
  Server,
  Check,
  Layers,
  ShieldCheck,
  Lock,
  Bot,
  Sparkles,
  Brain,
  CalendarClock,
  MessageSquare,
  Send,
  FileText,
  Clock,
  Video,
  Activity,
  BatteryCharging,
  HardDrive,
  Scan,
  Camera,
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { askGroq } from '../lib/groqAssistantService'

const CAM_FEEDS = [
  {
    id: 'lib',
    name: 'Salle de lecture partagée',
    status: 'normal',
    icon: BookOpen,
    activity: '34 personnes • Calme',
    location: 'Bâtiment B - Étage 1',
    imageSrc: '/illustrations/sentinelle_cam_library.jpg',
    tag: 'CAM 01 - BIBLIO NORD',
    aiLabel: 'POSTURE NORMALE · 34 ÉTUDIANTS',
    fps: 30,
    bitrate: '2.4 Mb/s'
  },
  {
    id: 'lab',
    name: 'Atelier pratique C205',
    status: 'normal',
    icon: FlaskConical,
    activity: 'Température 21.4°C • Normale',
    location: 'Bâtiment Atelier Informatique',
    imageSrc: '/illustrations/sentinelle_cam_lab.jpg',
    tag: 'CAM 02 - LAB C205',
    aiLabel: 'FLUX ÉTUDIANTS ACTIF · 21.4°C',
    fps: 30,
    bitrate: '2.8 Mb/s'
  },
  {
    id: 'res',
    name: 'Résidence partenaire - Bloc A',
    status: 'warning',
    icon: Home,
    activity: 'Supervision nocturne couloir',
    location: 'Résidence Nord - RDC',
    imageSrc: '/illustrations/sentinelle_cam_residence.jpg',
    tag: 'CAM 03 - RESIDENCE BLOC A',
    aiLabel: 'VEILLE DÉTECTION DE CHUTE',
    fps: 30,
    bitrate: '2.1 Mb/s'
  },
  {
    id: 'parking',
    name: 'Parking & Accès Principal Est',
    status: 'normal',
    icon: ParkingSquare,
    iconColor: 'text-[#0d9488]',
    activity: 'Flux régulier • 12 véhicules',
    location: 'Entrée campus UY1',
    imageSrc: '/illustrations/sentinelle_cam_parking.jpg',
    tag: 'CAM 04 - PARKING & ACCÈS EST',
    aiLabel: 'CONTRÔLE D’ACCÈS FLUIDE',
    fps: 30,
    bitrate: '3.0 Mb/s'
  },
]

interface Flashcard {
  id: string
  course: string
  question: string
  answer: string
}

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    course: 'INF301 · Systèmes Distribués',
    question: 'Quelle est la condition de quorum pour élire un Leader dans l’algorithme Raft ?',
    answer: 'Un candidat doit obtenir les votes d’une majorité stricte des nœuds du cluster : ⌊N/2⌋ + 1 nœuds.',
  },
  {
    id: 'fc-2',
    course: 'INF304 · Intelligence Artificielle',
    question: 'Pourquoi utilise-t-on la quantification INT8 sur les modèles Edge AI Sentinelle ?',
    answer: 'Elle divise par 4 l’empreinte mémoire et accélère l’inférence CPU/NPU sur Raspberry Pi sans connexion Cloud.',
  },
  {
    id: 'fc-3',
    course: 'MAT205 · Analyse Numérique',
    question: 'Quelle est la vitesse de convergence de la méthode de Newton-Raphson près d’une racine simple ?',
    answer: 'Convergence quadratique : le nombre de décimales exactes double approximativement à chaque itération.',
  },
]

export default function SentinellePage() {
  const { pathname } = useLocation()
  const isInsideApp = pathname.startsWith('/app')

  // Academic Copilot State
  const [copilotTab, setCopilotTab] = useState<'flashcards' | 'summarizer' | 'schedule' | 'qa'>('flashcards')
  const [flippedCard, setFlippedCard] = useState<Record<string, boolean>>({})
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS)
  const [selectedCourseTopic, setSelectedCourseTopic] = useState('INF301 — Consensus Distribué & Tolérance aux Pannes')
  const [summaryOutput, setSummaryOutput] = useState(
    `📌 Synthèse Structurée (Générée par Sentinelle Edge AI) :
1. Théorème CAP : En présence d'un partitionnement réseau (P), un système distribué doit choisir entre la Cohérence atomique (C) et la Disponibilité immédiate (A).
2. Consensus Raft : Découpe le temps en Termes (Terms) numérotés et distingue 3 états (Leader, Follower, Candidate).
3. Point clé Examen UY1 : Toujours vérifier que LogMatching garantit la cohérence des journaux répliqués.`
  )
  const [qaMessages, setQaMessages] = useState([
    {
      sender: 'Uni & Archlord (Sentinelle IA)',
      text: 'Salut ! Nous sommes tes copilotes académiques Uni & Archlord. Pose-nous une question sur tes UEs, génère un quiz de révision ou vérifie les conflits de ton emploi du temps !',
    },
  ])
  const [qaInput, setQaInput] = useState('')

  // Interactive State for Health Kiosk Simulator
  const [healthStep, setHealthStep] = useState<'idle' | 'measuring' | 'complete'>('idle')
  const [healthProgress, setHealthProgress] = useState(0)
  const [vitalStats, setVitalStats] = useState({
    spo2: 98,
    bpm: 72,
    temp: 36.8,
    bpSys: 120,
    bpDia: 80,
    triageLevel: 'Niveau 1 — Normal',
    triageColor: 'emerald',
  })

  const [selectedProfile, setSelectedProfile] = useState<'normal' | 'fever' | 'distress'>('normal')
  const [selectedCam, setSelectedCam] = useState('lib')
  const [simulatedFall, setSimulatedFall] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString('fr-FR', { hour12: false }))
  const [logs, setLogs] = useState<Array<{ id: number; time: string; type: 'info' | 'warning' | 'alert'; msg: string }>>([
    { id: 1, time: '14:20:05', type: 'info', msg: 'Système Sentinelle Edge AI initialisé' },
    { id: 2, time: '14:21:12', type: 'info', msg: 'Vigie : Surveillance des 4 zones active en local' },
    { id: 3, time: '14:22:45', type: 'warning', msg: 'Kiosque Santé : Test de routine effectué (SpO2 98%)' },
  ])

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', { hour12: false }))
    }, 1000)
    return () => clearInterval(clockInterval)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (healthStep === 'measuring') {
      if (healthProgress < 100) {
        timer = setTimeout(() => {
          setHealthProgress((prev) => prev + 10)
        }, 200)
      } else {
        setHealthStep('complete')
        if (selectedProfile === 'normal') {
          setVitalStats({
            spo2: 98,
            bpm: 74,
            temp: 36.7,
            bpSys: 118,
            bpDia: 78,
            triageLevel: 'Niveau 1 — Parfaitement Normal',
            triageColor: 'emerald',
          })
          addLog('info', 'Kiosque Santé : Diagnostic terminé. Paramètres vitaux optimaux.')
        } else if (selectedProfile === 'fever') {
          setVitalStats({
            spo2: 96,
            bpm: 98,
            temp: 38.9,
            bpSys: 128,
            bpDia: 84,
            triageLevel: 'Niveau 2 — Fièvre modérée détectée',
            triageColor: 'amber',
          })
          addLog('warning', 'Kiosque Santé : Hyperthermie détectée (38.9°C). Triage niveau 2.')
        } else {
          setVitalStats({
            spo2: 89,
            bpm: 125,
            temp: 37.4,
            bpSys: 145,
            bpDia: 95,
            triageLevel: 'Niveau 3 — Urgence Critique (Hypoxie)',
            triageColor: 'red',
          })
          addLog('alert', '🚨 ALERTE SANTÉ CRITIQUE : SpO2 89%. Notification infirmerie envoyée!')
        }
      }
    }
    return () => clearTimeout(timer)
  }, [healthStep, healthProgress, selectedProfile])

  const addLog = (type: 'info' | 'warning' | 'alert', msg: string) => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour12: false })
    setLogs((prev) => [{ id: Date.now(), time, type, msg }, ...prev.slice(0, 9)])
  }

  const startHealthScan = () => {
    setHealthStep('measuring')
    setHealthProgress(0)
  }

  const triggerFallEvent = () => {
    setSimulatedFall(true)
    addLog('alert', '🚨 SYNERGIE DÉCLENCHÉE : Chute détectée zone Résidence Bloc A!')
    addLog('alert', '⚡ Transmission automatique de l’alerte au Kiosque Santé & Infirmerie')
    setTimeout(() => {
      setSimulatedFall(false)
    }, 8000)
  }

  const [isAskingCopilot, setIsAskingCopilot] = useState(false)

  const handleGenerateFlashcard = async () => {
    const courseCode = selectedCourseTopic.split('—')[0].trim()
    try {
      const prompt = `Génère une question et une réponse précises de flashcard pour réviser l'examen universitaire sur : ${selectedCourseTopic}. Formate ta réponse exactement comme suit :
Question: [Ta question courte et percutante]
Réponse: [Ta réponse synthétique en 1 ou 2 phrases]`
      const reply = await askGroq([
        { role: 'user', content: prompt }
      ])
      const lines = reply.split('\n').map(l => l.trim()).filter(Boolean)
      const qLine = lines.find(l => l.toLowerCase().startsWith('question:')) || lines[0] || `Question d'examen sur ${courseCode}`
      const aLine = lines.find(l => l.toLowerCase().startsWith('réponse:') || l.toLowerCase().startsWith('reponse:')) || lines[1] || reply

      const extra: Flashcard = {
        id: `fc-${Date.now()}`,
        course: courseCode,
        question: qLine.replace(/^question:\s*/i, ''),
        answer: aLine.replace(/^r[ée]ponse:\s*/i, ''),
      }
      setFlashcards((prev) => [extra, ...prev])
    } catch {
      const extra: Flashcard = {
        id: `fc-${Date.now()}`,
        course: courseCode,
        question: `Question sur ${selectedCourseTopic} : Comment garantir l'idempotence des requêtes ?`,
        answer: `En associant un identifiant de séquence unique par client et en mémorisant la dernière réponse validée dans la machine à états.`,
      }
      setFlashcards((prev) => [extra, ...prev])
    }
  }

  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qaInput.trim() || isAskingCopilot) return
    const q = qaInput.trim()
    setQaInput('')
    setQaMessages((prev) => [
      ...prev,
      { sender: 'Vous', text: q },
    ])
    setIsAskingCopilot(true)

    try {
      const history = qaMessages
        .filter(m => m.sender !== 'Uni & Archlord (Sentinelle IA)' || m.text.length > 0)
        .map(m => ({
          role: (m.sender === 'Vous' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text
        }))

      const reply = await askGroq([
        ...history,
        { role: 'user', content: q }
      ], `Tu es Uni & Archlord, le copilote académique Sentinelle Edge AI de l'Université de Yaoundé I (UY1) créé par KERNEL FORGE. Tu réponds de manière précise, pédagogique, encourageante et concise en français sur les cours universitaires, l'organisation du travail et la réussite aux examens.`)

      setQaMessages((prev) => [
        ...prev,
        {
          sender: 'Uni & Archlord (Sentinelle IA)',
          text: reply,
        },
      ])
    } catch (err) {
      console.warn('Erreur Groq Sentinelle, repli local:', err)
      setQaMessages((prev) => [
        ...prev,
        {
          sender: 'Uni & Archlord (Sentinelle IA)',
          text: `Analyse locale Sentinelle pour « ${q} » : D’après le référentiel UY1 Faculté des Sciences, privilégie les annales de session normale et vérifie les démonstrations de TD (chapitres 3 et 4).`,
        },
      ])
    } finally {
      setIsAskingCopilot(false)
    }
  }

  return (
    <div className={isInsideApp ? 'space-y-8 pb-12' : 'min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#0d9488] selection:text-white'}>
      {!isInsideApp && <LandingNavbar />}

      {/* SECTION COPILOTE ACADÉMIQUE SENTINELLE EDGE AI (UNI & ARCHLORD) */}
      <section className={isInsideApp ? 'rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#0F172A] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl' : 'pt-24 pb-16 bg-gradient-to-b from-[#0F172A] via-slate-900 to-slate-950 border-b border-slate-800 px-6'}>
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-400/30 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-teal-200">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Sentinelle Edge AI · Copilote Académique & Campus</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Assistant d’Étude Intelligent & Sécurité Campus Hors-Ligne
              </h1>
              <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                Générateur de flashcards & quiz de révision, résumeur de cours PDF, conseiller anti-conflits d’emploi du temps et supervision biométrique Sentinelle avec Uni & Archlord.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-4 bg-white/10 border border-white/15 rounded-3xl p-4">
              <img
                src="/mascot/archlord_uni_duo_solid.webp"
                alt="Uni et Archlord Copilotes"
                className="h-24 w-auto object-contain drop-shadow-lg"
              />
              <div className="text-xs space-y-1">
                <span className="inline-block rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 font-black text-[10px] uppercase">
                  Moteur Local Actif
                </span>
                <p className="font-extrabold text-white text-sm">Uni & Archlord IA</p>
                <p className="text-blue-200">Latence 0.12s · Sans frais data</p>
              </div>
            </div>
          </div>

          {/* Copilot Tabs */}
          <div className="flex flex-wrap gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-white/10">
            {[
              { id: 'flashcards', label: 'Flashcards & Quiz IA', icon: Brain },
              { id: 'summarizer', label: 'Résumeur de Cours', icon: FileText },
              { id: 'schedule', label: 'Conseiller Emploi du Temps', icon: CalendarClock },
              { id: 'qa', label: 'Questions Académiques (Uni & Archlord)', icon: MessageSquare },
            ].map((t) => {
              const Icon = t.icon
              const active = copilotTab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCopilotTab(t.id as typeof copilotTab)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                    active
                      ? 'bg-[#0D9488] text-white shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>

          {/* Copilot Tab 1: Flashcards */}
          {copilotTab === 'flashcards' && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-white">Cartes de Révision Active (Cliquez pour retourner)</h2>
                  <p className="text-xs text-slate-400">Entraînement mémoriel adapté aux examens de la Faculté des Sciences UY1</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateFlashcard}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Générer une nouvelle Flashcard</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {flashcards.map((card) => {
                  const isFlipped = Boolean(flippedCard[card.id])
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setFlippedCard((prev) => ({ ...prev, [card.id]: !prev[card.id] }))}
                      className="flex flex-col justify-between rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-400/60 p-4 text-left transition-all min-h-[160px]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="rounded-lg bg-blue-950 border border-blue-700/50 px-2.5 py-0.5 text-[10px] font-black text-blue-300">
                          {card.course}
                        </span>
                        <span className="text-[10px] font-bold text-amber-400">
                          {isFlipped ? 'Réponse' : 'Question · Cliquer'}
                        </span>
                      </div>
                      <p className="my-3 text-xs font-bold leading-relaxed text-white">
                        {isFlipped ? card.answer : card.question}
                      </p>
                      <span className="text-[10px] font-semibold text-teal-400">
                        {isFlipped ? '✓ Cliquer pour revoir la question' : '→ Révéler la correction'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Copilot Tab 2: Course Summarizer */}
          {copilotTab === 'summarizer' && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[240px]">
                  <label className="block text-xs font-bold text-teal-300 mb-1">
                    Sélectionner le support de cours à synthétiser :
                  </label>
                  <select
                    value={selectedCourseTopic}
                    onChange={(e) => {
                      setSelectedCourseTopic(e.target.value)
                      setSummaryOutput(
                        `📌 Synthèse Structurée (${e.target.value}) :\n• Définitions formelles et invariants de preuve.\n• Complexité algorithmique temporelle et spatiale.\n• Exercices types susceptibles de tomber au Contrôle Continu UY1.`
                      )
                    }}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-bold text-white"
                  >
                    <option>INF301 — Consensus Distribué & Tolérance aux Pannes</option>
                    <option>INF304 — Réseaux de Neurones & Apprentissage Profond</option>
                    <option>MAT205 — Méthodes Itératives & Algèbre Linéaire</option>
                  </select>
                </div>
              </div>
              <pre className="whitespace-pre-wrap rounded-2xl bg-slate-950 border border-slate-800 p-4 font-sans text-xs text-slate-200 leading-relaxed">
                {summaryOutput}
              </pre>
            </div>
          )}

          {/* Copilot Tab 3: Schedule Conflict Advisor */}
          {copilotTab === 'schedule' && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 space-y-3">
              <h2 className="text-base font-black text-white">Diagnostic Prédictif de votre Emploi du Temps UY1</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-emerald-950/50 border border-emerald-500/40 p-4">
                  <p className="text-xs font-black text-emerald-300">✓ Aucun chevauchement d’amphithéâtre cette semaine</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Vos séances INF301 (Amphi 500) et INF304 (Salle S008) disposent d’un battement de 30 minutes suffisant pour le déplacement sur le campus.
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-950/50 border border-amber-500/40 p-4">
                  <p className="text-xs font-black text-amber-300">⚡ Créneau de révision recommandé par Uni</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Mercredi 10h00–12h00 est libre : idéal pour préparer le TP2 de Systèmes Distribués en salle de lecture B1.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Copilot Tab 4: Academic Q&A */}
          {copilotTab === 'qa' && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 space-y-4">
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {qaMessages.map((m, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 text-xs">
                    <p className="font-black text-teal-400">{m.sender}</p>
                    <p className="mt-1 text-slate-200 leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                ))}
                {isAskingCopilot && (
                  <div className="rounded-2xl bg-slate-950 border border-teal-500/30 p-3.5 text-xs flex items-center gap-2 text-teal-300 animate-pulse">
                    <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                    <span>Uni & Archlord (Groq Llama-3.3 70B) analyse et formule la réponse…</span>
                  </div>
                )}
              </div>
              <form onSubmit={handleAskCopilot} className="flex gap-2">
                <input
                  type="text"
                  value={qaInput}
                  disabled={isAskingCopilot}
                  onChange={(e) => setQaInput(e.target.value)}
                  placeholder="Demander une explication de cours à Uni & Archlord (propulsé par Groq)…"
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white focus:border-teal-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isAskingCopilot || !qaInput.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-4 py-2.5 text-xs font-black text-white hover:bg-teal-600 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isAskingCopilot ? 'Réflexion…' : 'Envoyer'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* SECTION SIMULATEUR IOT & VIGIE EDGE AI */}
      <section
        id="demo-interactive"
        className={
          isInsideApp
            ? 'rounded-3xl bg-slate-950 text-slate-100 p-6 sm:p-8 border border-slate-800 shadow-xl'
            : 'py-20 bg-slate-900 border-b border-slate-800'
        }
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 text-xs font-bold text-cyan-400 mb-3">
              <Cpu className="h-4 w-4" /> Simulateur Matériel Temps Réel
            </span>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Kiosque Santé & Module Vigie Edge AI
            </h2>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm">
              Testez virtuellement le fonctionnement du Kiosque Santé et du Module Vigie Edge AI déployés sur le campus.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* MODULE 1: SIMULATEUR KIOSQUE SANTÉ */}
            <div className="rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">1. Kiosque Santé Automatique</h3>
                      <p className="text-xs text-slate-400">Pré-diagnostic & Triage médical autonome en amphi</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-800">
                    <Radio className="h-3 w-3 animate-pulse text-emerald-400" /> Prêt
                  </span>
                </div>

                {/* VISUEL INTERACTIF KIOSQUE SANTÉ AVEC SCANNER LASER */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 mb-5 shadow-inner group">
                  <img
                    src="/illustrations/sentinelle_health.jpg"
                    alt="Kiosque Santé Sentinelle en action"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Animation faisceau laser de scan en cours */}
                  {healthStep === 'measuring' && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-center">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-pulse" />
                      <div className="absolute inset-x-0 bottom-4 text-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950/90 border border-emerald-400 px-3.5 py-1 text-xs font-black text-emerald-300">
                          <Scan className="h-3.5 w-3.5 animate-spin" />
                          Acquisition biométrique ({healthProgress}%)…
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tracé ECG battant en direct */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-xs border border-emerald-500/30 px-3 py-1 text-[10px] font-mono text-emerald-400">
                    <Activity className={`h-3.5 w-3.5 ${healthStep === 'measuring' ? 'animate-bounce text-emerald-300' : 'text-emerald-500'}`} />
                    <span>CAPTEUR OPTIQUE I2C</span>
                  </div>

                  {/* Badges en bas de l'image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="rounded-lg bg-slate-950/80 backdrop-blur-xs border border-white/10 px-2.5 py-1 text-[11px] font-bold text-white">
                      Borne Hall Amphi 500 · UY1
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300">
                      MLX90614 + MAX30102
                    </span>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-bold text-slate-400 block mb-2">Choisir un profil d’essai :</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'normal', label: 'Étudiant Sain', icon: CheckCircle, color: 'text-emerald-400' },
                      { id: 'fever', label: 'Fièvre 38.9°C', icon: Thermometer, color: 'text-amber-400' },
                      { id: 'distress', label: 'Hypoxie SpO2 89%', icon: AlertTriangle, color: 'text-red-400' },
                    ].map((p) => {
                      const Icon = p.icon
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProfile(p.id as 'normal' | 'fever' | 'distress')
                            setHealthStep('idle')
                          }}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                            selectedProfile === p.id
                              ? 'bg-slate-800 border-emerald-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${p.color}`} />
                          <span className="truncate">{p.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <Heart className="h-4 w-4 text-red-400" /> SpO2 Oxygène
                    </div>
                    <p className="text-2xl font-black text-white">{healthStep === 'complete' ? `${vitalStats.spo2}%` : '-- %'}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <HeartPulse className="h-4 w-4 text-emerald-400" /> Fréquence cardiaque
                    </div>
                    <p className="text-2xl font-black text-white">{healthStep === 'complete' ? `${vitalStats.bpm} bpm` : '-- bpm'}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <Thermometer className="h-4 w-4 text-amber-400" /> Température
                    </div>
                    <p className="text-2xl font-black text-white">{healthStep === 'complete' ? `${vitalStats.temp}°C` : '-- °C'}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <Stethoscope className="h-4 w-4 text-cyan-400" /> Tension Artérielle
                    </div>
                    <p className="text-2xl font-black text-white">{healthStep === 'complete' ? `${vitalStats.bpSys}/${vitalStats.bpDia}` : '--/--'}</p>
                  </div>
                </div>

                {healthStep === 'complete' && (
                  <div className="rounded-2xl p-4 border mb-5 bg-emerald-950/60 border-emerald-500/40 text-emerald-200">
                    <p className="text-xs font-extrabold uppercase tracking-wide">Résultat Triage IA Sentinelle</p>
                    <p className="text-sm font-bold">{vitalStats.triageLevel}</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={startHealthScan}
                disabled={healthStep === 'measuring'}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-98"
              >
                <RefreshCw className={`h-4 w-4 ${healthStep === 'measuring' ? 'animate-spin' : ''}`} />
                {healthStep === 'measuring' ? `Analyse biométrique (${healthProgress}%)...` : 'Lancer un Scan de test'}
              </button>
            </div>

            {/* MODULE 2: SIMULATEUR VIGIE EDGE AI AVEC MONITEUR CCTV RÉEL */}
            <div className="rounded-3xl bg-slate-900 border border-purple-500/30 p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">2. Module Vigie Surveillance</h3>
                      <p className="text-xs text-slate-400">Flux vidéo direct CCTV & Analyse de posture Edge AI</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-950 px-2.5 py-1 text-[11px] font-bold text-purple-300 border border-purple-800">
                    <Wifi className="h-3 w-3 text-purple-400" /> LAN Edge 0ms
                  </span>
                </div>

                {/* SÉLECTEUR DE CAMÉRAS */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {CAM_FEEDS.map((cam) => {
                    const Icon = cam.icon
                    const isSelected = selectedCam === cam.id
                    return (
                      <button
                        key={cam.id}
                        type="button"
                        onClick={() => setSelectedCam(cam.id)}
                        className={`flex items-center gap-2 rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-950/60 border-purple-400 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-purple-400" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate">{cam.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{cam.location}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* MONITEUR CCTV VIDÉO EN TEMPS RÉEL */}
                {(() => {
                  const activeCam = CAM_FEEDS.find((c) => c.id === selectedCam) || CAM_FEEDS[0]
                  return (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-purple-500/40 shadow-inner mb-4">
                      {/* Image réelle de la caméra CCTV */}
                      <img
                        src={activeCam.imageSrc}
                        alt={activeCam.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Overlay CCTV Professionnel */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/80 pointer-events-none" />

                      {/* En-tête HUD CCTV */}
                      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-2 rounded bg-slate-950/85 px-2.5 py-1 text-emerald-400 border border-white/10">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" />
                          <span className="font-bold text-white">{activeCam.tag}</span>
                          <span className="text-slate-400">· {currentTime}</span>
                          <span className="text-red-400 font-bold ml-1">REC ●</span>
                        </div>
                        <div className="rounded bg-slate-950/85 px-2 py-1 text-slate-300 border border-white/10 text-[10px]">
                          {activeCam.fps} FPS · {activeCam.bitrate}
                        </div>
                      </div>

                      {/* Boîte d'inférence IA dynamique */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                        {simulatedFall ? (
                          <div className="w-full rounded-xl bg-red-950/90 border-2 border-red-500 p-2 text-white shadow-lg animate-pulse flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0" />
                            <div className="overflow-hidden">
                              <p className="text-[11px] font-black text-red-200 uppercase tracking-wide">
                                🚨 ANOMALIE DÉTECTÉE : CHUTE ÉTUDIANT (99.4%)
                              </p>
                              <p className="text-[10px] text-red-300 truncate">
                                Alerte prioritaire transmise au Kiosque Santé & Infirmerie UY1
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg bg-slate-950/85 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{activeCam.aiLabel} · STATUT : SÉCURISÉ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Journal d'audit temps réel */}
                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] space-y-1 max-h-[105px] overflow-y-auto mb-4">
                  {logs.map((log) => (
                    <p key={log.id} className="leading-tight">
                      <span className="text-slate-500">[{log.time}]</span>{' '}
                      <span className={log.type === 'alert' ? 'text-red-400 font-bold' : log.type === 'warning' ? 'text-amber-300' : 'text-emerald-400'}>
                        {log.msg}
                      </span>
                    </p>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={triggerFallEvent}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-purple-900/30 cursor-pointer active:scale-98"
              >
                <Zap className="h-4 w-4 text-amber-300" />
                Simuler un incident de chute (Synergie Vigie ➔ Santé)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NOUVELLE SECTION : ARCHITECTURE MATÉRIELLE & SPÉCIFICATIONS IOT */}
      <section className={isInsideApp ? 'rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl' : 'py-20 bg-slate-950 border-b border-slate-800 text-white px-6'}>
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-400 mb-3">
              <Cpu className="h-4 w-4" /> Ingénierie KERNEL FORGE
            </span>
            <h2 className="text-2xl font-black text-white sm:text-4xl">
              Architecture Matérielle de la Borne Sentinelle
            </h2>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm">
              Conçue pour résister aux coupures de courant et fonctionner à 100% en local sur les campus universitaires.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Colonne Gauche : Rendu 3D de la borne */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-slate-800 p-4 text-center relative overflow-hidden group shadow-2xl">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center relative">
                <img
                  src="/illustrations/sentinelle_hardware_schematic.png"
                  alt="Modèle 3D Borne Sentinelle IoT"
                  className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-[#1e3a8a]/80 backdrop-blur-xs border border-blue-400/30 px-3 py-1 text-[11px] font-black text-blue-200">
                  Modèle Borne Totem v2.4
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-emerald-950/80 backdrop-blur-xs border border-emerald-400/30 px-3 py-1 text-[10px] font-mono text-emerald-300">
                  Conception KERNEL FORGE
                </div>
              </div>
            </div>

            {/* Colonne Droite : 4 Piliers Matériels */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-blue-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-3">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Cœur de Calcul & NPU Edge AI</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  SoC Raspberry Pi 4 Quad-Core 1.5 GHz associé à un coprocesseur NPU Hailo-8 (26 TOPS) exécutant les modèles INT8 de posture et détection de présence sans latence cloud.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-emerald-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Capteurs Médicaux I2C</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Double module biométrique : oxymètre de pouls optique MAX30102 et thermomètre infrarouge médical sans contact MLX90614 (précision ±0.1°C) étalonnés pour le pré-diagnostic.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-amber-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-3">
                  <BatteryCharging className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Autonomie 12h & Onduleur LiFePO4</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Batterie interne lithium fer phosphate 12V 20Ah avec onduleur intégré garantissant la continuité de service complète en cas de délestage ou coupure sur le campus.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-teal-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Châssis Renforcé & Confidentialité</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Structure acier anti-vandalisme avec écran tactile IPS 15.6" Full HD traité antireflet. Zéro enregistrement vidéo externe : les calculs de posture sont jetables après inférence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOUVELLE SECTION : GALERIE & DÉPLOIEMENTS SUR LE CAMPUS UY1 */}
      <section className={isInsideApp ? 'rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl' : 'py-20 bg-slate-900 text-white px-6'}>
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-3.5 py-1 text-xs font-bold text-teal-400 mb-3">
              <Camera className="h-4 w-4" /> Terrain & Campus Connecté
            </span>
            <h2 className="text-2xl font-black text-white sm:text-4xl">
              Déploiements Réels & Cas d’Usage à Yaoundé I
            </h2>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm">
              Découvrez la flotte Sentinelle en situation dans les amphis, la bibliothèque et le centre de commandement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Borne d’Amphi & Accueil',
                location: 'Amphi 500 · Faculté des Sciences',
                image: '/illustrations/sentinelle_kiosk.jpg',
                desc: 'Orientation des étudiants, vérification d’assiduité instantanée et guidage vers les salles libres.',
                tag: 'Accueil & QR Pass',
                color: 'border-blue-500/30 text-blue-400'
              },
              {
                title: 'Kiosque Médical Étudiant',
                location: 'Hall Bibliothèque Centrale',
                image: '/illustrations/sentinelle_health.jpg',
                desc: 'Bilan de santé autonome en 15 secondes, mesure SpO2 et transmission d’alerte directe à l’infirmerie.',
                tag: 'Triage Santé',
                color: 'border-emerald-500/30 text-emerald-400'
              },
              {
                title: 'Centre de Supervision SOC',
                location: 'Décanat & Sécurité Générale',
                image: '/illustrations/sentinelle_vigie.jpg',
                desc: 'Cartographie temps réel des flux du campus, suivi de l’occupation des amphis et alertes d’urgence.',
                tag: 'Supervision Globale',
                color: 'border-purple-500/30 text-purple-400'
              },
              {
                title: 'Patrouilleur Autonome',
                location: 'Allées Principales & Résidences',
                image: '/illustrations/sentinelle_patrol.jpg',
                desc: 'Surveillance nocturne, éclairage de sécurité et borne d’appel d’urgence SOS mobile pour les étudiants.',
                tag: 'Sécurité Nocturne',
                color: 'border-amber-500/30 text-amber-400'
              },
            ].map((d) => (
              <div key={d.title} className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-slate-700 transition-all">
                <div>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={d.image}
                      alt={d.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/80 backdrop-blur-xs border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      {d.tag}
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <p className="text-[11px] font-bold text-teal-400">{d.location}</p>
                    <h3 className="text-sm font-bold text-white">{d.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{d.desc}</p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <div className="rounded-xl bg-slate-900 border border-slate-800/80 p-2 text-center text-[10px] font-bold text-slate-300">
                    Déployé & Opérationnel UY1
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!isInsideApp && <LandingFooter />}
    </div>
  )
}
