import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, Users, MessageSquare,
  MoreHorizontal, PhoneOff, Radio, Hand, Download,
  Wifi, WifiOff, Shield, VolumeX, HardDrive, Send,
  Lightbulb, CheckCircle, LayoutGrid, Monitor, Pencil,
  Smile, Sparkles, BarChart2, FileText, Share2, Copy,
  Check, X, FileSpreadsheet, Layers, Volume2
} from 'lucide-react'
import { useUserRole } from '../utils/userRole'
import { Avatar } from '../components/ui/Avatar'
import { useMediaStream } from '../hooks/useMediaStream'
import InteractiveWhiteboard from '../components/video/InteractiveWhiteboard'

interface ChatMsg {
  id: string
  user: string
  role: string
  text: string
  time: string
}

interface Poll {
  id: string
  question: string
  options: { label: string; votes: number }[]
  totalVotes: number
  userVoted?: number
}

interface FloatingEmoji {
  id: string
  emoji: string
  left: number
}

const INITIAL_PARTICIPANTS = [
  { id: '1', name: 'Pr. Dubois', role: 'teacher', muted: false, video: true, hand: false, speaking: true },
  { id: '2', name: 'Lucas Dubois', role: 'delegate', muted: true, video: true, hand: true, speaking: false },
  { id: '3', name: 'Sarah Kamga', role: 'student', muted: false, video: true, hand: false, speaking: false },
  { id: '4', name: 'Yasmine Ngono', role: 'student', muted: false, video: false, hand: false, speaking: false },
  { id: '5', name: 'Thomas Mbarga', role: 'student', muted: true, video: true, hand: false, speaking: false },
]

const INITIAL_MSGS: ChatMsg[] = [
  { id: '1', user: 'Emma Martin', role: 'student', text: 'Pouvez-vous réexpliquer le cas de base du Tri Fusion ?', time: '10:15' },
  { id: '2', user: 'Pr. Dubois', role: 'teacher', text: 'Bien sûr ! Le cas de base est un tableau de taille 0 ou 1.', time: '10:16' },
  { id: '3', user: 'Lucas Dubois', role: 'delegate', text: 'J\'ai mis le support de cours PDF dans l\'onglet Fichiers.', time: '10:17' },
]

const INITIAL_POLL: Poll = {
  id: 'p1',
  question: "Avez-vous assimilé la complexité en O(N log N) ?",
  options: [
    { label: 'Oui, parfaitement clair !', votes: 24 },
    { label: 'Encore quelques doutes', votes: 12 },
    { label: 'Besoin d\'un exemple supplémentaire', votes: 5 }
  ],
  totalVotes: 41
}

const TRANSCRIPT_LINES = [
  { time: '10:14', speaker: 'Pr. Dubois', text: 'Bienvenue à tous pour ce cours sur les algorithmes de tri.' },
  { time: '10:16', speaker: 'Pr. Dubois', text: 'La complexité asymptotique reste le critère prépondérant.' },
  { time: '10:18', speaker: 'Pr. Dubois', text: 'Regardons l\'arbre de récursion du Tri Fusion sur le tableau blanc.' }
]

export default function VideoConfPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentRole, isOfflineMode } = useUserRole()

  // Query params
  const roomTitle = searchParams.get('title') || 'Algorithmique & Structures de Données L2'
  const roomCode = searchParams.get('code') || 'ALG204'

  // State
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [dataSaver, setDataSaver] = useState(false)
  const [isRec, setIsRec] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [muteAll, setMuteAll] = useState(false)
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [currentSubtitle, setCurrentSubtitle] = useState('Pr. Dubois: "L\'algorithme de Tri Fusion divise le problème en deux sous-problèmes identiques."')
  
  // Layout views
  const [layoutView, setLayoutView] = useState<'grid' | 'presentation' | 'whiteboard'>('grid')
  const [sideTab, setSideTab] = useState<'chat' | 'participants' | 'transcript' | 'polls' | 'files'>('chat')
  const [isSideOpen, setIsSideOpen] = useState(true)

  // Floating reactions
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])

  // Chat & Poll
  const [msgs, setMsgs] = useState<ChatMsg[]>(INITIAL_MSGS)
  const [input, setInput] = useState('')
  const [poll, setPoll] = useState<Poll>(INITIAL_POLL)
  const [elapsed, setElapsed] = useState(5075) // seconds
  const [showShareModal, setShowShareModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Media Stream
  const myVideoRef = useRef<HTMLVideoElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const { stream, screenStream, startStream, toggleVideo, toggleAudio, startScreenShare, stopScreenShare } = useMediaStream()

  // Init webcam stream
  useEffect(() => {
    startStream(!isVideoOff, !isMuted)
  }, [])

  useEffect(() => {
    if (myVideoRef.current && stream) {
      myVideoRef.current.srcObject = stream
    }
  }, [stream])

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  // Rotating subtitle simulation
  useEffect(() => {
    const subtitles = [
      'Pr. Dubois: "L\'algorithme de Tri Fusion divise le problème en deux sous-problèmes identiques."',
      'Pr. Dubois: "Dans le pire des cas, nous obtenons exactement N log(N) comparaisons."',
      'Lucas Dubois: "Le support de TD est disponible en téléchargement."',
      'Pr. Dubois: "Passons au tableau blanc pour schématiser la pile d\'appels récursifs."'
    ]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % subtitles.length
      setCurrentSubtitle(subtitles[idx])
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const handleToggleMic = () => {
    const next = !isMuted
    setIsMuted(next)
    toggleAudio(!next)
  }

  const handleToggleCam = () => {
    const next = !isVideoOff
    setIsVideoOff(next)
    toggleVideo(!next)
  }

  const handleToggleScreenShare = async () => {
    if (screenStream) {
      stopScreenShare()
      setLayoutView('grid')
    } else {
      const scr = await startScreenShare()
      if (scr) {
        setLayoutView('presentation')
      }
    }
  }

  const triggerReaction = (emoji: string) => {
    const newEmoji: FloatingEmoji = {
      id: Math.random().toString(),
      emoji,
      left: Math.random() * 80 + 10 // 10% to 90%
    }
    setFloatingEmojis(prev => [...prev, newEmoji])
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id))
    }, 3000)
  }

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const me = currentRole === 'teacher' ? 'Pr. Martin' : currentRole === 'delegate' ? 'Lucas (Délégué)' : 'Emma Martin'
    setMsgs(prev => [...prev, { id: Date.now().toString(), user: me, role: currentRole, text: input.trim(), time }])
    setInput('')
  }

  const handleVote = (optionIdx: number) => {
    if (poll.userVoted !== undefined) return
    setPoll(prev => {
      const newOptions = [...prev.options]
      newOptions[optionIdx].votes += 1
      return {
        ...prev,
        options: newOptions,
        totalVotes: prev.totalVotes + 1,
        userVoted: optionIdx
      }
    })
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const userName = currentRole === 'teacher' ? 'Pr. Martin' : currentRole === 'delegate' ? 'Lucas (Délégué)' : 'Emma Martin'
  const roleColor = (r: string) => r === 'teacher' ? 'text-[#0d9488]' : r === 'delegate' ? 'text-indigo-400' : 'text-slate-300'
  const roleBadge = (r: string) => r === 'teacher' ? 'bg-[#0d9488]/20 text-[#0d9488]' : r === 'delegate' ? 'bg-indigo-500/20 text-indigo-300' : ''

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950 text-white select-none overflow-hidden">
      
      {/* ── Top Header Bar ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e3a8a]/30 bg-slate-950/80 backdrop-blur-xl px-5 py-3 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-white">{roomTitle}</h1>
              <span className="rounded-md bg-[#0d9488]/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                {roomCode}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-mono text-emerald-400">
                <Wifi className="h-3 w-3" /> 28ms • HD 1080p
              </span>
              <span>•</span>
              <span>Pr. Dubois</span>
            </div>
          </div>
        </div>

        {/* View mode toggle & Info badges */}
        <div className="flex items-center gap-3">
          {isRec && (
            <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/50 px-3 py-1 text-xs font-bold text-rose-400 animate-pulse shadow-lg">
              <Radio className="h-3.5 w-3.5" /> REC
            </span>
          )}

          {/* View switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setLayoutView('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                layoutView === 'grid' ? 'bg-[#0d9488] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Grille
            </button>
            <button
              onClick={() => setLayoutView('presentation')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                layoutView === 'presentation' ? 'bg-[#0d9488] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" /> Présentation
            </button>
            <button
              onClick={() => setLayoutView('whiteboard')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                layoutView === 'whiteboard' ? 'bg-[#0d9488] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pencil className="h-3.5 w-3.5" /> Tableau
            </button>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition-all shadow-md"
          >
            <Share2 className="h-3.5 w-3.5 text-[#0d9488]" /> Partager
          </button>

          <span className="font-mono text-xs text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 font-bold shadow-inner">
            {fmtTime(elapsed)}
          </span>
        </div>
      </header>

      {/* ── Main Viewport ── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Floating Animated Emojis Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          <AnimatePresence>
            {floatingEmojis.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, y: 300, scale: 0.5 }}
                animate={{ opacity: 0, y: -200, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
                style={{ left: `${item.left}%` }}
                className="absolute text-4xl drop-shadow-2xl"
              >
                {item.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Center Canvas / Video Grid */}
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto relative">
          
          {/* Data Saver Notification */}
          {dataSaver && (
            <div className="rounded-2xl bg-teal-950/60 border border-teal-500/40 p-3 flex items-center justify-between text-xs backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2 text-teal-200">
                <CheckCircle className="h-4 w-4 text-teal-400" />
                <span>Mode Éco actif (Flux compressé 8 Ko/s — Économie de 92% données)</span>
              </div>
              <button
                onClick={() => setDataSaver(false)}
                className="text-[10px] bg-teal-500/20 px-2.5 py-1 rounded-lg font-bold text-teal-300 border border-teal-500/30"
              >
                Désactiver
              </button>
            </div>
          )}

          {/* ── Main Layout Views ── */}
          {layoutView === 'whiteboard' ? (
            <div className="flex-1 min-h-[380px]">
              <InteractiveWhiteboard />
            </div>
          ) : layoutView === 'presentation' ? (
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-[380px]">
              {/* Large Screen Presentation */}
              <div className="flex-1 rounded-3xl bg-slate-900 border border-[#1e3a8a]/40 overflow-hidden flex flex-col relative shadow-2xl">
                <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-2 font-bold text-teal-300">
                    <MonitorUp className="h-4 w-4" /> Partage d'écran — Pr. Dubois (Slide 14/28)
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded">
                    Algorithmique_L2_Ch3.pdf
                  </span>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-900/90 text-center">
                  <div className="max-w-xl space-y-4 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl">
                    <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest">
                      [Exemple d'exécution récursive]
                    </span>
                    <h2 className="text-xl font-bold text-white">Tri Fusion (MergeSort) — Étape 3</h2>
                    <div className="font-mono text-xs bg-slate-900 p-4 rounded-xl text-emerald-400 text-left border border-slate-800">
                      <code>
                        function merge(left, right) &#123;<br />
                        &nbsp;&nbsp;let result = [], i = 0, j = 0;<br />
                        &nbsp;&nbsp;while(i &lt; left.length && j &lt; right.length) &#123;<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;if (left[i] &lt; right[j]) result.push(left[i++]);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;else result.push(right[j++]);<br />
                        &nbsp;&nbsp;&#125;<br />
                        &nbsp;&nbsp;return result.concat(left.slice(i)).concat(right.slice(j));<br />
                        &#125;
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Participant Strip */}
              <div className="w-full lg:w-48 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto">
                <div className="relative shrink-0 w-36 lg:w-full h-24 rounded-2xl bg-slate-900 border-2 border-teal-500 overflow-hidden flex items-center justify-center shadow-lg">
                  <Avatar name="Pr. Dubois" size="md" />
                  <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                    Pr. Dubois
                  </span>
                </div>
                <div className="relative shrink-0 w-36 lg:w-full h-24 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg">
                  {!isVideoOff && stream ? (
                    <video
                      ref={(node) => {
                        myVideoRef.current = node
                        if (node && stream && node.srcObject !== stream) {
                          node.srcObject = stream
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <Avatar name={userName} size="md" />
                  )}
                  <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                    Vous
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Grid Gallery View */
            <div className="flex-1 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-[380px]">
              {/* Speaker Card (Teacher) */}
              <div className="sm:col-span-2 lg:col-span-2 rounded-3xl bg-slate-900/90 border-2 border-[#0d9488] shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 group">
                <div className="flex items-center justify-between z-10">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Pr. Dubois (Enseignant)
                  </span>
                  <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 px-2.5 py-1 rounded-xl border border-teal-500/30">
                    Présentateur Principal
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="relative">
                    <Avatar name="Pr. Dubois" size="2xl" className="shadow-2xl ring-4 ring-teal-500/50" />
                    <span className="absolute -bottom-2 -right-2 bg-teal-500 p-2 rounded-full shadow-lg ring-4 ring-slate-950">
                      <Mic className="h-4 w-4 text-white" />
                    </span>
                  </div>
                </div>

                {/* Subtitles Overlay */}
                {showSubtitles && (
                  <div className="z-10 bg-slate-950/90 border border-slate-800 rounded-2xl p-3 backdrop-blur-md text-xs text-center text-teal-200 animate-fade-in shadow-xl">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mr-2">[Sous-titres IA]</span>
                    {currentSubtitle}
                  </div>
                )}
              </div>

              {/* Self Video Card */}
              <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden flex items-center justify-center">
                {!isVideoOff && stream ? (
                  <video
                    ref={(node) => {
                      myVideoRef.current = node
                      if (node && stream && node.srcObject !== stream) {
                        node.srcObject = stream
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Avatar name={userName} size="xl" className="shadow-lg" />
                    <span className="text-xs text-slate-300 font-semibold">{userName}</span>
                  </div>
                )}
                <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-slate-950/80 px-3 py-1 rounded-xl border border-white/10">
                  Vous ({currentRole === 'teacher' ? 'Enseignant' : currentRole === 'delegate' ? 'Délégué' : 'Étudiant'})
                </span>
                <span className="absolute top-3 right-3">
                  {isMuted ? (
                    <span className="bg-rose-500/90 p-1.5 rounded-xl text-white shadow-md"><MicOff className="h-3.5 w-3.5" /></span>
                  ) : (
                    <span className="bg-teal-500 p-1.5 rounded-xl text-white shadow-md"><Mic className="h-3.5 w-3.5" /></span>
                  )}
                </span>
              </div>

              {/* Other Peer Cards */}
              {INITIAL_PARTICIPANTS.slice(1).map(p => (
                <div key={p.id} className="rounded-3xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col items-center justify-center relative shadow-lg group hover:border-slate-700 transition-all">
                  <Avatar name={p.name} size="lg" className="shadow-md mb-2" />
                  <p className="text-xs font-bold text-slate-200">{p.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{p.role === 'delegate' ? 'Délégué' : 'Étudiant'}</p>
                  <span className="absolute top-3 right-3">
                    {p.muted ? (
                      <span className="bg-rose-500/80 p-1.5 rounded-xl text-white shadow-xs"><MicOff className="h-3.5 w-3.5" /></span>
                    ) : (
                      <span className="bg-teal-500/80 p-1.5 rounded-xl text-white shadow-xs"><Mic className="h-3.5 w-3.5" /></span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Reaction Emojis Bar */}
          <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl backdrop-blur-md">
            <span className="text-xs font-bold text-slate-400 pl-2">Réactions rapides :</span>
            <div className="flex items-center gap-2">
              {['👍', '👏', '❤️', '🙋', '🔥', '💡'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:scale-125 transition-all text-base shadow-xs"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                showSubtitles ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              Sous-titres IA {showSubtitles ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* ── Side Panel Drawer (Chat, Participants, Polls, Files) ── */}
        <AnimatePresence>
          {isSideOpen && (
            <motion.aside
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-full lg:w-80 border-l border-slate-800 bg-slate-950/95 flex flex-col shadow-2xl z-10"
            >
              {/* Drawer Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-900/50">
                <button
                  onClick={() => setSideTab('chat')}
                  className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                    sideTab === 'chat' ? 'border-[#0d9488] text-[#0d9488] bg-[#0d9488]/10' : 'border-transparent text-slate-400'
                  }`}
                >
                  Chat ({msgs.length})
                </button>
                <button
                  onClick={() => setSideTab('participants')}
                  className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                    sideTab === 'participants' ? 'border-[#0d9488] text-[#0d9488] bg-[#0d9488]/10' : 'border-transparent text-slate-400'
                  }`}
                >
                  Membres ({INITIAL_PARTICIPANTS.length})
                </button>
                <button
                  onClick={() => setSideTab('polls')}
                  className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                    sideTab === 'polls' ? 'border-[#0d9488] text-[#0d9488] bg-[#0d9488]/10' : 'border-transparent text-slate-400'
                  }`}
                >
                  Sondages
                </button>
              </div>

              {/* Drawer Content */}
              {sideTab === 'chat' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                    {msgs.map(m => (
                      <div key={m.id}>
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar name={m.user} size="xs" />
                          <span className={`text-xs font-bold ${roleColor(m.role)}`}>{m.user}</span>
                          {roleBadge(m.role) && (
                            <span className={`text-[8px] px-1 rounded uppercase font-semibold ${roleBadge(m.role)}`}>
                              {m.role === 'teacher' ? 'Prof' : 'Délégué'}
                            </span>
                          )}
                          <span className="ml-auto text-[10px] text-slate-500 font-mono">{m.time}</span>
                        </div>
                        <p className="ml-7 text-xs text-slate-200 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                          {m.text}
                        </p>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  <form onSubmit={sendMsg} className="p-3 border-t border-slate-800 bg-slate-900/60">
                    <div className="flex gap-2">
                      <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Poser une question au cours..."
                        className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className="rounded-xl bg-[#0d9488] hover:bg-teal-600 disabled:opacity-40 px-3.5 text-white transition-all shadow-xs"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : sideTab === 'participants' ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Attendance Log button for teachers/delegates */}
                  {(currentRole === 'teacher' || currentRole === 'delegate') && (
                    <button
                      onClick={() => alert(`Rapport d'émargement généré pour ${roomTitle} (${INITIAL_PARTICIPANTS.length} présents).`)}
                      className="w-full mb-2 rounded-xl bg-[#1e3a8a] hover:bg-blue-900 px-3 py-2 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-teal-300" /> Générer Émargement (.CSV)
                    </button>
                  )}

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Participants Connectés ({INITIAL_PARTICIPANTS.length})
                  </p>

                  {INITIAL_PARTICIPANTS.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.name} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{p.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {p.hand && <Hand className="h-3.5 w-3.5 text-amber-400 animate-bounce" />}
                        {p.muted ? <MicOff className="h-3.5 w-3.5 text-rose-400" /> : <Mic className="h-3.5 w-3.5 text-teal-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Polls Tab */
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                      <BarChart2 className="h-4 w-4" /> Sondage en Direct
                    </div>
                    <p className="text-xs font-bold text-white">{poll.question}</p>

                    <div className="space-y-2 pt-1">
                      {poll.options.map((opt, idx) => {
                        const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0
                        const isVoted = poll.userVoted === idx

                        return (
                          <div
                            key={idx}
                            onClick={() => handleVote(idx)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all relative overflow-hidden ${
                              isVoted
                                ? 'border-teal-400 bg-teal-950/40 text-white'
                                : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-200'
                            }`}
                          >
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-teal-500/20 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex items-center justify-between">
                              <span className="font-medium">{opt.label}</span>
                              <span className="font-mono text-[11px] font-bold text-teal-300">{pct}% ({opt.votes})</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <p className="text-[10px] text-slate-500 text-right font-mono">Total votes : {poll.totalVotes}</p>
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Controls Footer ── */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl px-5 py-3.5 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDataSaver(!dataSaver)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold border transition-all ${
              dataSaver ? 'bg-teal-500 text-white border-teal-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Download className="h-4 w-4" /> Mode Éco
          </button>
        </div>

        {/* Core Media Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMic}
            className={`rounded-2xl p-3.5 border transition-all shadow-lg hover:scale-110 ${
              isMuted
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-white hover:border-teal-400'
            }`}
            title={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-teal-400" />}
          </button>

          <button
            onClick={handleToggleCam}
            className={`rounded-2xl p-3.5 border transition-all shadow-lg hover:scale-110 ${
              isVideoOff
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-white hover:border-teal-400'
            }`}
            title={isVideoOff ? 'Activer la caméra' : 'Désactiver la caméra'}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5 text-teal-400" />}
          </button>

          <button
            onClick={handleToggleScreenShare}
            className={`rounded-2xl p-3.5 border transition-all shadow-lg hover:scale-110 ${
              screenStream ? 'bg-teal-500 border-teal-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Partager l'écran"
          >
            <MonitorUp className="h-5 w-5" />
          </button>

          <button
            onClick={() => setHandRaised(!handRaised)}
            className={`rounded-2xl p-3.5 border transition-all shadow-lg hover:scale-110 ${
              handRaised ? 'bg-amber-500 border-amber-400 text-white shadow-amber-500/50' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
            title="Lever la main"
          >
            <Hand className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsSideOpen(!isSideOpen)}
            className={`rounded-2xl p-3.5 border transition-all shadow-lg hover:scale-110 ${
              isSideOpen ? 'bg-[#0d9488] text-white border-teal-400' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
            title="Panneau latéral"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>

        {/* Leave button */}
        <button
          onClick={() => navigate('/app/visio')}
          className="flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-xl hover:scale-105"
        >
          <PhoneOff className="h-4 w-4" /> Quitter la séance
        </button>
      </footer>

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 text-teal-400" /> Partager cette visioconférence
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Code de réunion</label>
                <div className="font-mono text-xl font-bold text-teal-300 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center tracking-widest">
                  {roomCode}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Lien direct</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={window.location.href}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-300 font-mono truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-[#0d9488] hover:bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
