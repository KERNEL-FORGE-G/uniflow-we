import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  CheckCircle, ArrowRight, Zap, Shield, Wifi, AlertTriangle, Lightbulb, 
  Heart, HeartPulse, Thermometer, Stethoscope, BookOpen, FlaskConical, 
  Home, ParkingSquare, Eye, Activity, Cpu, Bell, Play, RefreshCw, 
  Radio, Server, Check, AlertCircle, Layers, Sliders, Smartphone,
  BarChart2, ShieldCheck, ChevronRight, Lock
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'

// Mock features
const sante_features = [
  'Oxymètre connecté haute précision (SpO2 & Fréquence cardiaque)',
  'Tensiomètre numérique brassard intelligent',
  'Thermomètre infrarouge médical sans contact',
  'Algorithme IA de triage local en 3 niveaux (Normal, Modéré, Critique)',
  'Dossier médical temporaire et anonymisé par QR Code/NFC',
  'Alerte instantanée infirmerie & SMS d\'urgence aux médecins de garde',
]

const vigie_features = [
  'Détection automatique de chute par accéléromètre & IA vision',
  'Analyse vidéo Edge AI locale sans envoi d\'images vers le Cloud (100% RGPD)',
  'Zones surveillées : Laboratoires de chimie/physique, bibliothèques, amphis, cités U',
  'Résilience 100% hors connexion avec batterie de secours LiFePO4',
  'Alertes push instantanées sur smartphones des vigies et agents de sécurité',
  'Déclenchement automatique du protocole d\'urgence santé lors d\'un incident',
]

// Sample camera feeds for Vigie Simulator
const CAM_FEEDS = [
  { id: 'lib', name: 'Bibliothèque Centrale — Salle de lecture', status: 'normal', icon: BookOpen, activity: '34 personnes • Calme', location: 'Bâtiment B - Étage 1' },
  { id: 'lab', name: 'Laboratoire de Chimie C205', status: 'normal', icon: FlaskConical, activity: 'Température 21.4°C • Normale', location: 'Bâtiment Science' },
  { id: 'res', name: 'Résidence Universitaire - Bloc A', status: 'warning', icon: Home, activity: 'Mouvement suspect • Couloir 2', location: 'Cité U Nord' },
  { id: 'parking', name: 'Parking & Accès Principal Est', status: 'normal', icon: ParkingSquare, iconColor: 'text-[#0d9488]', activity: 'Flux régulier • 12 véhicules', location: 'Entrée campus' }
]

export default function SentinellePage() {
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
    triageColor: 'emerald'
  })

  // Customizer state for Health Simulator
  const [selectedProfile, setSelectedProfile] = useState<'normal' | 'fever' | 'distress'>('normal')

  // Interactive State for Vigie Simulator
  const [selectedCam, setSelectedCam] = useState('lib')
  const [simulatedFall, setSimulatedFall] = useState(false)
  const [logs, setLogs] = useState<Array<{ id: number; time: string; type: 'info' | 'warning' | 'alert'; msg: string }>>([
    { id: 1, time: '14:20:05', type: 'info', msg: 'Système Sentinelle Edge AI initialisé' },
    { id: 2, time: '14:21:12', type: 'info', msg: 'Vigie : Surveillance des 4 zones active en local' },
    { id: 3, time: '14:22:45', type: 'warning', msg: 'Kiosque Santé : Test de routine effectué (SpO2 98%)' }
  ])

  // Health Scan Simulation Effect
  useEffect(() => {
    let timer: NodeJS.Timeout
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
            triageColor: 'emerald'
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
            triageColor: 'amber'
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
            triageColor: 'red'
          })
          addLog('alert', '🚨 ALERTE SANTE CRITIQUE : SpO2 89%. Notification infirmerie envoyée!')
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
    addLog('alert', '⚡ Transmission automatique de l\'alerte au Kiosque Santé & Infirmerie')
    setTimeout(() => {
      setSimulatedFall(false)
    }, 8000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#0d9488] selection:text-white">
      <LandingNavbar />

      {/* Modern High-Impact Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-24 pb-20 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(30,58,138,0.2),transparent_50%)] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/20 mb-6 shadow-xs">
              <Shield className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Système IoT & IA Embarquée Offline-First</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6 leading-tight">
              UniFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Sentinelle</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-medium mb-10">
              Le gardien autonome et intelligent des campus universitaires. PRÉ-DIAGNOSTIC SANTÉ et SURVEILLANCE VIGIE EDGE AI, 100% fonctionnels hors connexion.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#demo-interactive"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
              >
                <Play className="h-4 w-4 fill-white" /> Testeur Interactif Live
              </a>
              <a
                href="#synergie"
                className="flex items-center gap-2 rounded-xl bg-slate-800/90 border border-slate-700 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
              >
                <Zap className="h-4 w-4 text-amber-400" /> Comprendre la Synergie
              </a>
            </div>
          </div>

          {/* Key Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { label: 'Indépendance Cloud', value: '100%', sub: 'Traitements Edge AI locaux', color: 'text-emerald-400' },
              { label: 'Temps de détection', value: '< 0.4s', sub: 'Calcul instantané local', color: 'text-cyan-400' },
              { label: 'Matériel requis', value: 'Low Cost', sub: 'Raspberry Pi & capteurs', color: 'text-amber-400' },
              { label: 'Confidentialité', value: 'RGPD OK', sub: 'Aucune donnée image au cloud', color: 'text-purple-400' },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 text-center backdrop-blur-xs">
                <p className={`text-2xl sm:text-3xl font-extrabold ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-xs font-bold text-slate-200">{stat.label}</p>
                <p className="text-[11px] text-slate-400 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION INTERACTIVE SIMULATOR DEMO */}
      <section id="demo-interactive" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 text-xs font-bold text-cyan-400 mb-3">
              <Cpu className="h-4 w-4" /> Simulateur Temps Réel
            </span>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Démonstration du Double Module</h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Testez virtuellement le fonctionnement du Kiosque Santé et du Module Vigie Edge AI en temps réel.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* MODULE 1: SIMULATEUR KIOSQUE SANTE */}
            <div className="rounded-3xl bg-slate-950 border border-emerald-500/30 p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">1. Kiosque Santé Automatique</h3>
                      <p className="text-xs text-slate-400">Pré-diagnostic & Tri médical autonome</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-800">
                    <Radio className="h-3 w-3 animate-pulse text-emerald-400" /> Prêt
                  </span>
                </div>

                {/* Profile selector for test */}
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-400 block mb-2">Choisir un profil d'essai :</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'normal', label: 'Étudiant Sani', icon: CheckCircle, color: 'hover:border-emerald-500 text-emerald-400' },
                      { id: 'fever', label: 'Fièvre 38.9°C', icon: Thermometer, color: 'hover:border-amber-500 text-amber-400' },
                      { id: 'distress', label: 'Hypoxie SpO2 89%', icon: AlertTriangle, color: 'hover:border-red-500 text-red-400' },
                    ].map((p) => {
                      const Icon = p.icon
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedProfile(p.id as any)
                            setHealthStep('idle')
                          }}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                            selectedProfile === p.id
                              ? 'bg-slate-800 border-emerald-400 text-white shadow-xs'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${p.color}`} />
                          <span className="truncate">{p.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Vitals Display Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="rounded-2xl bg-slate-900 p-3.5 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <Heart className="h-4 w-4 text-red-400" /> SpO2 Oxygène
                    </div>
                    <p className="text-2xl font-black text-white">{healthStep === 'complete' ? `${vitalStats.spo2}%` : '-- %'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Normale : 95% - 100%</p>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-3.5 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <HeartPulse className="h-4 w-4 text-emerald-400" /> Fréquence cardiaque
                    </div>
                    <p className="text-2xl font-black text-white">{healthStep === 'complete' ? `${vitalStats.bpm} bpm` : '-- bpm'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Capteur MAX30102</p>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-3.5 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <Thermometer className="h-4 w-4 text-amber-400" /> Température
                    </div>
                    <p className="text-2xl font-black text-white">{healthStep === 'complete' ? `${vitalStats.temp}°C` : '-- °C'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">IR MLX90614 sans contact</p>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-3.5 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <Stethoscope className="h-4 w-4 text-cyan-400" /> Tension Artérielle
                    </div>
                    <p className="text-2xl font-black text-white">{healthStep === 'complete' ? `${vitalStats.bpSys}/${vitalStats.bpDia}` : '--/--'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">mmHg (Sys/Dia)</p>
                  </div>
                </div>

                {/* Progress bar or result */}
                {healthStep === 'measuring' && (
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold text-emerald-400">
                      <span>Analyse des capteurs en cours...</span>
                      <span>{healthProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${healthProgress}%` }} />
                    </div>
                  </div>
                )}

                {healthStep === 'complete' && (
                  <div className={`rounded-2xl p-4 border mb-6 ${
                    vitalStats.triageColor === 'emerald' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' :
                    vitalStats.triageColor === 'amber' ? 'bg-amber-950/60 border-amber-500/40 text-amber-200' :
                    'bg-red-950/60 border-red-500/40 text-red-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wide">Résultat Triage IA</p>
                        <p className="text-sm font-bold">{vitalStats.triageLevel}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={startHealthScan}
                disabled={healthStep === 'measuring'}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${healthStep === 'measuring' ? 'animate-spin' : ''}`} />
                {healthStep === 'measuring' ? 'Lecture des constantes...' : 'Lancer un Scan de test'}
              </button>
            </div>

            {/* MODULE 2: SIMULATEUR VIGIE EDGE AI */}
            <div className="rounded-3xl bg-slate-950 border border-purple-500/30 p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">2. Module Vigie Surveillance</h3>
                      <p className="text-xs text-slate-400">Analyse de posture & Chutes Edge AI</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-950 px-2.5 py-1 text-[11px] font-bold text-purple-300 border border-purple-800">
                    <Wifi className="h-3 w-3 text-purple-400" /> LAN Edge
                  </span>
                </div>

                {/* Camera selector tabs */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {CAM_FEEDS.map((cam) => {
                    const Icon = cam.icon
                    const isSelected = selectedCam === cam.id
                    return (
                      <button
                        key={cam.id}
                        onClick={() => setSelectedCam(cam.id)}
                        className={`flex items-center gap-2 rounded-xl p-2.5 text-left border transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-purple-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
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

                {/* Simulated Feed Monitor */}
                <div className={`relative rounded-2xl bg-slate-900 border p-4 mb-4 overflow-hidden min-h-[160px] flex flex-col justify-between transition-colors ${
                  simulatedFall ? 'border-red-500 bg-red-950/20' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${simulatedFall ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                      {CAM_FEEDS.find(c => c.id === selectedCam)?.name}
                    </span>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                      30 FPS • Edge Pose ML
                    </span>
                  </div>

                  <div className="my-4 text-center">
                    {simulatedFall ? (
                      <div className="space-y-2 animate-bounce">
                        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
                        <p className="text-sm font-black text-red-400">CHUTE DÉTECTÉE — ALERTE DÉCLENCHÉE</p>
                        <p className="text-xs text-red-300">Coordonnées : Résidence Bloc A - Couloir N2</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto opacity-80" />
                        <p className="text-xs font-bold text-slate-300">Aucune anomalie détectée</p>
                        <p className="text-[11px] text-slate-500">{CAM_FEEDS.find(c => c.id === selectedCam)?.activity}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-2">
                    <span>Traitement : MediaPipe Pose (Pi 4)</span>
                    <span>Transmis en LAN UDP</span>
                  </div>
                </div>

                {/* Real-time System Event Console Log */}
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 font-mono text-[11px] space-y-1.5 max-h-[110px] overflow-y-auto mb-6">
                  <p className="text-slate-500 text-[10px] font-sans font-bold uppercase tracking-wider mb-1">Journal d'événements en direct (Edge Log) :</p>
                  {logs.map((log) => (
                    <p key={log.id} className="leading-tight">
                      <span className="text-slate-500">[{log.time}]</span>{' '}
                      <span className={
                        log.type === 'alert' ? 'text-red-400 font-bold' :
                        log.type === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                      }>{log.msg}</span>
                    </p>
                  ))}
                </div>
              </div>

              <button
                onClick={triggerFallEvent}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 text-sm transition-all shadow-md active:scale-95"
              >
                <Zap className="h-4 w-4 text-amber-300" />
                Simuler un incident de chute (Synergie)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SYNERGIE EXPLANATION SECTION */}
      <section id="synergie" className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-400 mb-4">
            <Zap className="h-4 w-4" /> La Véritable Innovation
          </span>
          <h2 className="text-3xl font-black text-white sm:text-4xl mb-4">La Synergie Inter-Modules</h2>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed mb-12 text-sm sm:text-base">
            Contrairement aux gadgets isolés, Sentinelle connecte le Module Vigie au Kiosque Santé de manière totalement autonome en réseau local.
          </p>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="rounded-2xl bg-slate-900 border border-purple-500/30 p-6 text-center relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                <Eye className="h-6 w-6" />
              </div>
              <p className="font-extrabold text-white text-base mb-1">1. Vigie Détecte</p>
              <p className="text-xs text-slate-400 leading-relaxed">L'IA vision locale identifie une perte d'équilibre ou une chute critique sans aucune latence.</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-amber-500/30 p-6 text-center relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Zap className="h-6 w-6" />
              </div>
              <p className="font-extrabold text-white text-base mb-1">2. Signal Croisé Offline</p>
              <p className="text-xs text-slate-400 leading-relaxed">Alerte transmise en broadcast UDP/MQTT sur le réseau local, totalement indépendante d'Internet.</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-emerald-500/30 p-6 text-center relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <HeartPulse className="h-6 w-6" />
              </div>
              <p className="font-extrabold text-white text-base mb-1">3. Intervention Médicale</p>
              <p className="text-xs text-slate-400 leading-relaxed">Le Kiosque Santé et les téléphones des secouristes déclenchent immédiatement le protocole d'urgence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SENTINELLE - KEY ADVANTAGES GRID */}
      <section className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Pourquoi Choisir Sentinelle ?</h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Conçu sur mesure pour pallier les défis énergétiques et réseaux des universités d'Afrique subsaharienne.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lightbulb, title: 'Bas Coût', desc: 'Conçu sur carte Raspberry Pi et capteurs industriels standards à très faible coût.', color: 'border-amber-500/30 bg-amber-950/20 text-amber-400' },
              { icon: Wifi, title: 'Offline First', desc: 'Fonctionne sans connexion Internet grâce aux modèles IA embarqués localement.', color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400' },
              { icon: Lock, title: 'Confidentialité Total', desc: 'Pas de traitement externe. Les flux vidéo restent cantonnés aux puces du campus.', color: 'border-purple-500/30 bg-purple-950/20 text-purple-400' },
              { icon: Server, title: 'Intégration UniFlow', desc: 'Synchro automatique avec le dashboard administrateur dès qu\'un réseau est disponible.', color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className={`rounded-2xl border p-6 backdrop-blur-xs ${item.color}`}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TECH STACK ARCHITECTURE SECTION */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3.5 py-1 text-xs font-bold text-slate-300 mb-3 border border-slate-700">
              <Layers className="h-4 w-4 text-emerald-400" /> Architecture Technique
            </span>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Composants & Puces Requis</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { cat: 'Matériel & Capteurs', items: ['Raspberry Pi 4B (4 Go)', 'Capteur MAX30102 SpO2', 'Thermomètre MLX90614', 'Caméra HQ Pi 12MP'], color: 'border-blue-500/30 bg-blue-950/20' },
              { cat: 'IA & Vision', items: ['TensorFlow Lite Edge', 'MediaPipe Pose Estimation', 'OpenCV Python', 'Edge Impulse Micro-models'], color: 'border-purple-500/30 bg-purple-950/20' },
              { cat: 'Serveur Local', items: ['FastAPI Backend (Python)', 'Base SQLite Locale', 'Protocole MQTT / WebSockets', 'Batterie LiFePO4 de secours'], color: 'border-emerald-500/30 bg-emerald-950/20' },
              { cat: 'Interfaçage UniFlow', items: ['REST Sync avec UniFlow Cloud', 'Alertes Push PWA', 'Dashboard Infirmerie', 'Logs audit anonymes'], color: 'border-amber-500/30 bg-amber-950/20' },
            ].map((s) => (
              <div key={s.cat} className={`rounded-2xl border p-6 bg-slate-900 ${s.color}`}>
                <h3 className="font-bold text-white text-base mb-4 border-b border-slate-800 pb-2">{s.cat}</h3>
                <ul className="space-y-2.5">
                  {s.items.map((i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 mb-6 shadow-xl">
            <Shield className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white sm:text-4xl mb-4">
            Prêt à Déployer Sentinelle sur Votre Campus ?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Profitez d'un accompagnement sur-mesure pour l'installation physique des kiosques et la configuration du réseau local.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-sm font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition-all shadow-xl shadow-emerald-900/30 active:scale-95"
            >
              Demander une étude de campus <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/presentation"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-8 py-4 text-sm font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              Voir la Présentation Globale
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
