import { useState } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  Hand,
  CircleDot,
  ClipboardCheck,
  PhoneOff,
  Users,
  MessageSquare,
  HelpCircle,
  FolderOpen,
  Plus,
  Wifi,
  Server,
  Send,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  ShieldCheck,
  Volume2,
  Maximize2,
  X,
  Calendar,
  Copy,
  Check,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface Participant {
  id: string
  name: string
  matricule: string
  role: 'ENSEIGNANT' | 'DÉLÉGUÉ' | 'ÉTUDIANT'
  avatarBg: string
  initials: string
  micOn: boolean
  camOn: boolean
  handRaised: boolean
  speaking: boolean
  attendanceStatus: 'PRÉSENT (Auto 94%)' | 'PRÉSENT (Auto 88%)' | 'PRÉSENT (Auto 100%)' | 'EN RETARD (12 min)'
  joinedAt: string
}

interface ChatMsg {
  id: string
  sender: string
  role: string
  time: string
  text: string
}

interface PollItem {
  id: string
  question: string
  options: { label: string; votes: number }[]
  totalVotes: number
  userVoted?: number
}

interface CourseSession {
  id: string
  code: string
  title: string
  teacher: string
  room: string
  mode: 'CLOUD' | 'LAN'
  time: string
  status: 'LIVE' | 'UPCOMING'
  participantsCount: number
}

const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'p1',
    name: 'Pr. Jean-Paul Ndiaye',
    matricule: 'ENS-UY1-014',
    role: 'ENSEIGNANT',
    avatarBg: 'from-[#1E3A8A] to-blue-700',
    initials: 'JN',
    micOn: true,
    camOn: true,
    handRaised: false,
    speaking: true,
    attendanceStatus: 'PRÉSENT (Auto 100%)',
    joinedAt: '07:58',
  },
  {
    id: 'p2',
    name: 'Ravel Nghomsi',
    matricule: '22U2418',
    role: 'DÉLÉGUÉ',
    avatarBg: 'from-[#0D9488] to-teal-700',
    initials: 'RN',
    micOn: true,
    camOn: true,
    handRaised: false,
    speaking: false,
    attendanceStatus: 'PRÉSENT (Auto 100%)',
    joinedAt: '08:00',
  },
  {
    id: 'p3',
    name: 'Aïcha Bello',
    matricule: '22U2094',
    role: 'ÉTUDIANT',
    avatarBg: 'from-amber-500 to-orange-600',
    initials: 'AB',
    micOn: false,
    camOn: true,
    handRaised: true,
    speaking: false,
    attendanceStatus: 'PRÉSENT (Auto 94%)',
    joinedAt: '08:02',
  },
  {
    id: 'p4',
    name: 'Franck Kamga',
    matricule: '22U2188',
    role: 'ÉTUDIANT',
    avatarBg: 'from-purple-600 to-indigo-700',
    initials: 'FK',
    micOn: false,
    camOn: false,
    handRaised: false,
    speaking: false,
    attendanceStatus: 'PRÉSENT (Auto 88%)',
    joinedAt: '08:04',
  },
  {
    id: 'p5',
    name: 'Clarisse Mebenga',
    matricule: '22U2310',
    role: 'ÉTUDIANT',
    avatarBg: 'from-emerald-600 to-teal-700',
    initials: 'CM',
    micOn: false,
    camOn: true,
    handRaised: false,
    speaking: false,
    attendanceStatus: 'PRÉSENT (Auto 94%)',
    joinedAt: '08:01',
  },
  {
    id: 'p6',
    name: 'Junior Tchoumi',
    matricule: '22U2512',
    role: 'ÉTUDIANT',
    avatarBg: 'from-rose-600 to-pink-700',
    initials: 'JT',
    micOn: false,
    camOn: false,
    handRaised: false,
    speaking: false,
    attendanceStatus: 'EN RETARD (12 min)',
    joinedAt: '08:12',
  },
]

const INITIAL_SESSIONS: CourseSession[] = [
  {
    id: 's1',
    code: 'INF301',
    title: 'Architecture Distribuée & Systèmes Tolérants aux Pannes',
    teacher: 'Pr. Jean-Paul Ndiaye',
    room: 'Amphi 500 · Réseau Local UY1',
    mode: 'LAN',
    time: 'En direct · 08:00 - 10:00',
    status: 'LIVE',
    participantsCount: 68,
  },
  {
    id: 's2',
    code: 'INF304',
    title: 'Intelligence Artificielle & Apprentissage Automatique',
    teacher: 'Dr. Thomas Ewondo',
    room: 'Cloud WebRTC · Hybride',
    mode: 'CLOUD',
    time: 'Aujourd’hui · 13:30 - 15:30',
    status: 'UPCOMING',
    participantsCount: 42,
  },
  {
    id: 's3',
    code: 'MAT205',
    title: 'Analyse Numérique & Optimisation',
    teacher: 'Pr. Hélène Ngo Mback',
    room: 'Salle S008 · LiveKit LAN',
    mode: 'LAN',
    time: 'Demain · 10:00 - 12:00',
    status: 'UPCOMING',
    participantsCount: 85,
  },
]

export default function VideoConferencePage() {
  const [networkMode, setNetworkMode] = useState<'CLOUD' | 'LAN'>('LAN')
  const [sessions, setSessions] = useState<CourseSession[]>(INITIAL_SESSIONS)
  const [activeSession, setActiveSession] = useState<CourseSession>(INITIAL_SESSIONS[0])
  const [inCall, setInCall] = useState(true)

  // Controls
  const [micEnabled, setMicEnabled] = useState(true)
  const [camEnabled, setCamEnabled] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [isRecording, setIsRecording] = useState(true)
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Side panel
  const [sideTab, setSideTab] = useState<'participants' | 'chat' | 'polls' | 'resources'>('participants')
  const [participants] = useState<Participant[]>(INITIAL_PARTICIPANTS)
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: 'm1',
      sender: 'Pr. Jean-Paul Ndiaye',
      role: 'ENSEIGNANT',
      time: '08:05',
      text: 'Bonjour à tous. Le support PDF du chapitre 4 (Consensus Raft & Paxos) est disponible dans l’onglet Ressources.',
    },
    {
      id: 'm2',
      sender: 'Ravel Nghomsi',
      role: 'DÉLÉGUÉ',
      time: '08:07',
      text: 'Merci Professeur ! Le relais LiveKit LAN de l’Amphi 500 fonctionne sans coupure à 0 ms de latence Internet.',
    },
    {
      id: 'm3',
      sender: 'Aïcha Bello',
      role: 'ÉTUDIANT',
      time: '08:14',
      text: 'Professeur, pouvez-vous revenir sur le théorème CAP dans le cas d’un partitionnement réseau ?',
    },
  ])
  const [chatInput, setChatInput] = useState('')

  const [polls, setPolls] = useState<PollItem[]>([
    {
      id: 'poll-1',
      question: 'Quel algorithme garantit la tolérance aux pannes byzantines ?',
      options: [
        { label: 'Raft Consensus', votes: 12 },
        { label: 'PBFT (Practical Byzantine Fault Tolerance)', votes: 49 },
        { label: 'Two-Phase Commit (2PC)', votes: 7 },
      ],
      totalVotes: 68,
    },
  ])

  // New session form
  const [newCode, setNewCode] = useState('INF308')
  const [newTitle, setNewTitle] = useState('Sécurité des Réseaux & Cryptographie')
  const [newRoom, setNewRoom] = useState('Amphi 250 · LiveKit LAN')
  const [newTime, setNewTime] = useState('Vendredi · 14:00 - 16:00')
  const [newMode, setNewMode] = useState<'CLOUD' | 'LAN'>('LAN')

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setChatMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: 'Vous',
        role: 'DÉLÉGUÉ',
        time: timeStr,
        text: chatInput.trim(),
      },
    ])
    setChatInput('')
  }

  const handleVote = (pollId: string, optionIdx: number) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId || p.userVoted !== undefined) return p
        const updatedOptions = p.options.map((opt, idx) =>
          idx === optionIdx ? { ...opt, votes: opt.votes + 1 } : opt
        )
        return {
          ...p,
          options: updatedOptions,
          totalVotes: p.totalVotes + 1,
          userVoted: optionIdx,
        }
      })
    )
    triggerToast('Vote enregistré en temps réel !')
  }

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault()
    const created: CourseSession = {
      id: `s-${Date.now()}`,
      code: newCode.trim() || 'INF300',
      title: newTitle.trim() || 'Nouvelle séance magistrale',
      teacher: 'Pr. Jean-Paul Ndiaye',
      room: newRoom.trim() || 'Amphi 500',
      mode: newMode,
      time: newTime.trim() || 'En direct',
      status: 'LIVE',
      participantsCount: 1,
    }
    setSessions((prev) => [created, ...prev])
    setActiveSession(created)
    setNetworkMode(created.mode)
    setInCall(true)
    setCreateModalOpen(false)
    triggerToast(`Conférence "${created.code} — ${created.title}" démarrée !`)
  }

  return (
    <div className="space-y-6 pb-10">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-bold text-white shadow-xl border border-teal-500/40">
          <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Mode Switcher */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#1d4ed8] to-[#0D9488] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-100">
              <Video className="h-3.5 w-3.5" />
              <span>UniFlow Visioconférence Hybride · Web & LAN Campus</span>
            </div>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Salles de Cours Virtuelles & Relais LiveKit UY1
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-2xl">
              Basculez entre le mode Cloud WebRTC et le serveur local LAN Campus (0 Mo de data Internet consommée dans les amphithéâtres).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Switch */}
            <div className="inline-flex rounded-2xl bg-slate-950/35 p-1.5 border border-white/15">
              <button
                type="button"
                onClick={() => {
                  setNetworkMode('CLOUD')
                  triggerToast('Basculé sur Mode En ligne (Cloud WebRTC)')
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${
                  networkMode === 'CLOUD'
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Wifi className="h-4 w-4" />
                <span>Mode En ligne (Cloud)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNetworkMode('LAN')
                  triggerToast('Basculé sur Mode LAN Campus (Hors-ligne LiveKit)')
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${
                  networkMode === 'LAN'
                    ? 'bg-[#F59E0B] text-slate-950 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Server className="h-4 w-4" />
                <span>Mode LAN Campus (LiveKit)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-[#1E3A8A] shadow-md hover:bg-blue-50 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Créer une conférence</span>
            </button>
          </div>
        </div>

        {/* Active / Upcoming Sessions Pills */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {sessions.map((sess) => {
            const isSelected = sess.id === activeSession.id
            return (
              <button
                key={sess.id}
                type="button"
                onClick={() => {
                  setActiveSession(sess)
                  setNetworkMode(sess.mode)
                  setInCall(true)
                }}
                className={`flex flex-col justify-between rounded-2xl p-3.5 text-left transition-all border ${
                  isSelected
                    ? 'bg-white text-slate-900 border-white shadow-md'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${
                      isSelected ? 'bg-[#1E3A8A] text-white' : 'bg-white/20 text-white'
                    }`}
                  >
                    {sess.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                      sess.status === 'LIVE'
                        ? 'bg-rose-500 text-white'
                        : isSelected
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-white/15 text-amber-200'
                    }`}
                  >
                    {sess.status === 'LIVE' ? '● En direct' : 'À venir'} · {sess.mode}
                  </span>
                </div>
                <p className={`mt-2 text-xs font-extrabold line-clamp-1 ${isSelected ? 'text-slate-900' : 'text-white'}`}>
                  {sess.title}
                </p>
                <div className={`mt-1.5 flex items-center justify-between text-[11px] ${isSelected ? 'text-slate-500' : 'text-blue-100'}`}>
                  <span>{sess.teacher}</span>
                  <span>{sess.participantsCount} inscrits</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Conference Stage + Right Panel */}
      {inCall ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left Column: Active Speaker + Participant Grid + Control Bar */}
          <div className="flex flex-col gap-4 rounded-3xl bg-[#0F172A] p-4 sm:p-5 text-white shadow-xl border border-slate-800">
            {/* Top Bar inside Stage */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-[#1E3A8A] px-3 py-1 text-xs font-black text-white">
                  {activeSession.code}
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-white sm:text-base">{activeSession.title}</h2>
                  <p className="text-xs text-slate-400">
                    {activeSession.teacher} · {activeSession.room}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isRecording && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300">
                    <CircleDot className="h-3.5 w-3.5 animate-pulse text-rose-400" />
                    REC 00:42:18
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    networkMode === 'LAN'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {networkMode === 'LAN' ? 'Serveur Local LiveKit · 2 ms' : 'Cloud WebRTC · HD 720p'}
                </span>
                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/30 hover:bg-blue-600 border border-blue-500/50 px-3 py-1 text-xs font-bold text-blue-200 transition"
                  title="Partager le lien d'accès invité sans application"
                >
                  <Share2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Inviter (Sans app)</span>
                </button>
              </div>
            </div>

            {/* Active Speaker / Screen Share Stage */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#1E3A8A]/40 to-slate-900 border border-slate-700/80 min-h-[290px] sm:min-h-[340px] flex flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-teal-300 border border-teal-500/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  {screenSharing
                    ? 'Partage d’écran actif — Diaporama Chapitre 4 (Consensus Raft)'
                    : 'Orateur principal · Pr. Jean-Paul Ndiaye'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-950/70 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                    Audio IA Anti-bruit actif
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerToast('Plein écran activé')}
                    className="rounded-lg bg-slate-950/70 p-1.5 text-slate-300 hover:text-white"
                    title="Plein écran"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Center Stage Visual */}
              {screenSharing ? (
                <div className="my-4 mx-auto w-full max-w-2xl rounded-2xl bg-slate-950/90 border border-teal-500/40 p-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0D9488]">
                      Slide 14 / 32 · Algorithme de Consensus Distribué Raft
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">INF301_Chap4_UY1.pdf</span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3 text-left">
                    <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <p className="text-xs font-black text-amber-400">1. Leader Election</p>
                      <p className="mt-1 text-[11px] text-slate-300">
                        Un nœud Candidat demande les votes après expiration du Heartbeat Timeout (150-300ms).
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <p className="text-xs font-black text-teal-400">2. Log Replication</p>
                      <p className="mt-1 text-[11px] text-slate-300">
                        Le Leader journalise chaque commande et réplique via RPC AppendEntries.
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <p className="text-xs font-black text-blue-400">3. Safety Quorum</p>
                      <p className="mt-1 text-[11px] text-slate-300">
                        Validation dès que N/2 + 1 nœuds de la grappe ont confirmé l’écriture.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="my-6 flex flex-col items-center justify-center text-center">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] text-2xl font-black text-white ring-4 ring-teal-400/60 shadow-xl">
                    JN
                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow">
                      <Volume2 className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-black text-white">Pr. Jean-Paul Ndiaye</h3>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-0.5 text-[11px] font-extrabold text-amber-300">
                    ENSEIGNANT · Département Informatique UY1
                  </span>
                </div>
              )}

              {/* Live Caption Bar */}
              <div className="flex items-center justify-between rounded-xl bg-slate-950/75 px-4 py-2.5 text-xs text-slate-200 border border-slate-800">
                <p className="truncate">
                  <span className="font-bold text-teal-400">Sous-titrage IA (Sentinelle) :</span> « Lorsqu’une partition survient entre deux sous-réseaux du campus, le quorum majoritaire maintient la cohérence… »
                </p>
                <span className="ml-3 shrink-0 text-[10px] font-bold uppercase text-slate-400">FR · Auto</span>
              </div>
            </div>

            {/* Participant Video Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`relative flex flex-col items-center justify-between rounded-2xl bg-slate-900/90 p-3 border transition-all ${
                    p.speaking
                      ? 'border-teal-400 ring-2 ring-teal-400/30'
                      : p.handRaised
                        ? 'border-amber-400'
                        : 'border-slate-800'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                        p.role === 'ENSEIGNANT'
                          ? 'bg-amber-500 text-slate-950'
                          : p.role === 'DÉLÉGUÉ'
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p.role}
                    </span>
                    {p.handRaised && (
                      <span className="rounded-full bg-amber-400/20 p-1 text-amber-300" title="Main levée">
                        <Hand className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <div
                    className={`my-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${p.avatarBg} text-sm font-black text-white shadow`}
                  >
                    {p.initials}
                  </div>

                  <div className=" flex w-full items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-bold text-slate-200">{p.name}</span>
                    <span className="shrink-0">
                      {p.micOn ? (
                        <Mic className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <MicOff className="h-3.5 w-3.5 text-rose-400" />
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Controls Bar */}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5 rounded-2xl bg-slate-900 p-3 border border-slate-800">
              <button
                type="button"
                onClick={() => setMicEnabled((v) => !v)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                  micEnabled
                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-rose-600 text-white hover:bg-rose-500'
                }`}
              >
                {micEnabled ? <Mic className="h-4 w-4 text-emerald-400" /> : <MicOff className="h-4 w-4" />}
                <span>{micEnabled ? 'Micro activé' : 'Micro coupé'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCamEnabled((v) => !v)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                  camEnabled
                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-rose-600 text-white hover:bg-rose-500'
                }`}
              >
                {camEnabled ? <Video className="h-4 w-4 text-emerald-400" /> : <VideoOff className="h-4 w-4" />}
                <span>{camEnabled ? 'Caméra active' : 'Caméra coupée'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreenSharing((v) => !v)
                  triggerToast(!screenSharing ? 'Partage d’écran démarré' : 'Partage d’écran arrêté')
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                  screenSharing
                    ? 'bg-[#0D9488] text-white shadow-md'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                <MonitorUp className="h-4 w-4" />
                <span>Partager l’écran</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHandRaised((v) => !v)
                  triggerToast(!handRaised ? 'Vous avez levé la main ✋' : 'Main baissée')
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                  handRaised
                    ? 'bg-[#F59E0B] text-slate-950 shadow-md'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                <Hand className="h-4 w-4" />
                <span>Lever la main</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRecording((v) => !v)
                  triggerToast(!isRecording ? 'Enregistrement démarré' : 'Enregistrement sauvegardé')
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                <CircleDot className="h-4 w-4" />
                <span>{isRecording ? 'Enregistrement actif' : 'Enregistrer'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAttendanceModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-800 transition-all"
              >
                <ClipboardCheck className="h-4 w-4 text-amber-300" />
                <span>Feuille de présence auto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInCall(false)
                  triggerToast('Vous avez quitté la salle de conférence.')
                }}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-rose-500 transition-all"
              >
                <PhoneOff className="h-4 w-4" />
                <span>Quitter</span>
              </button>
            </div>
          </div>

          {/* Right Side Panel: Participants, Chat, Polls, Resources */}
          <div className="flex flex-col rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            {/* Tabs Header */}
            <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 p-1.5 gap-1">
              {[
                { id: 'participants', label: 'Participants', icon: Users, badge: participants.length },
                { id: 'chat', label: 'Chat', icon: MessageSquare, badge: chatMessages.length },
                { id: 'polls', label: 'Sondages', icon: HelpCircle, badge: polls.length },
                { id: 'resources', label: 'Supports', icon: FolderOpen, badge: 3 },
              ].map((t) => {
                const Icon = t.icon
                const active = sideTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSideTab(t.id as typeof sideTab)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] font-extrabold transition-all ${
                      active
                        ? 'bg-[#1E3A8A] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab 1: Participants with Automatic Attendance */}
            {sideTab === 'participants' && (
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[540px]">
                <div className="flex items-center justify-between rounded-2xl bg-teal-50 border border-teal-200 px-3.5 py-2.5">
                  <div>
                    <p className="text-xs font-extrabold text-teal-900">Pointage Automatique Actif</p>
                    <p className="text-[11px] text-teal-700">Basé sur le temps de présence & matricule UY1</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttendanceModalOpen(true)}
                    className="rounded-xl bg-[#0D9488] px-2.5 py-1.5 text-[11px] font-black text-white hover:bg-teal-700"
                  >
                    Exporter
                  </button>
                </div>

                <div className="space-y-2">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${p.avatarBg} text-xs font-black text-white`}
                        >
                          {p.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-slate-900">{p.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {p.matricule} · Entrée {p.joinedAt}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          p.attendanceStatus.includes('RETARD')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.attendanceStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Live Chat */}
            {sideTab === 'chat' && (
              <div className="flex flex-1 flex-col justify-between p-4 max-h-[540px]">
                <div className="space-y-3 overflow-y-auto pr-1">
                  {chatMessages.map((m) => (
                    <div key={m.id} className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#1E3A8A]">
                          {m.sender}{' '}
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-black text-[#1E3A8A]">
                            {m.role}
                          </span>
                        </span>
                        <span className="text-slate-400">{m.time}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="mt-3 flex gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Poser une question au cours…"
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#1E3A8A] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-[#1E3A8A] px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-900"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab 3: Questions & Sondages */}
            {sideTab === 'polls' && (
              <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[540px]">
                {polls.map((poll) => (
                  <div key={poll.id} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-800">
                        Quiz en direct
                      </span>
                      <span className="text-xs font-bold text-slate-500">{poll.totalVotes} réponses</span>
                    </div>
                    <h3 className="text-xs font-extrabold text-slate-900">{poll.question}</h3>
                    <div className="space-y-2">
                      {poll.options.map((opt, idx) => {
                        const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0
                        const isChosen = poll.userVoted === idx
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleVote(poll.id, idx)}
                            className={`w-full rounded-xl border p-2.5 text-left transition-all ${
                              isChosen
                                ? 'border-[#0D9488] bg-teal-50/70'
                                : 'border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                              <span>{opt.label}</span>
                              <span className="font-black text-[#1E3A8A]">{pct}%</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#0D9488]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Ressources du cours */}
            {sideTab === 'resources' && (
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[540px]">
                {[
                  {
                    title: 'Chapitre 4 — Consensus Raft & Paxos.pdf',
                    size: '2,4 Mo · Disponible hors-ligne',
                    tag: 'Support CM',
                  },
                  {
                    title: 'TD_4_Systemes_Distribues_UY1.pdf',
                    size: '840 Ko · Série d’exercices',
                    tag: 'Fiche TD',
                  },
                  {
                    title: 'Code_Source_Lab_LiveKit_Socket.zip',
                    size: '4,1 Mo · Dépôt TP',
                    tag: 'Archive TP',
                  },
                ].map((res) => (
                  <div
                    key={res.title}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-black text-[#1E3A8A]">
                        {res.tag}
                      </span>
                      <p className="mt-1 truncate text-xs font-extrabold text-slate-900">{res.title}</p>
                      <p className="text-[11px] text-slate-500">{res.size}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerToast(`Téléchargement de "${res.title}" lancé`)}
                      className="rounded-xl bg-slate-100 p-2 text-[#1E3A8A] hover:bg-blue-100"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A]">
            <Video className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Vous avez quitté la visioconférence</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Votre feuille de présence automatique a été synchronisée avec votre dossier académique UniFlow.
          </p>
          <button
            type="button"
            onClick={() => setInCall(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E3A8A] px-6 py-3 text-xs font-black text-white shadow-md hover:bg-blue-900"
          >
            <Video className="h-4 w-4" />
            <span>Rejoindre à nouveau la séance</span>
          </button>
        </div>
      )}

      {/* Modal: Feuille de présence automatique */}
      {attendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Feuille de Présence Automatique — {activeSession.code}
                </h3>
                <p className="text-xs text-slate-500">
                  Validation biométrique & temps de connexion LiveKit ({participants.length} participants vérifiés)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttendanceModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900">{p.name}</p>
                    <p className="text-slate-500">
                      Matricule : {p.matricule} · Connecté à {p.joinedAt}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-black text-emerald-800">
                    {p.attendanceStatus}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerToast('Feuille de présence exportée en PDF officiel UY1 !')
                  setAttendanceModalOpen(false)
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2.5 text-xs font-black text-white hover:bg-teal-700"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger le PV de présence (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Créer une conférence */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={handleCreateSession}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1E3A8A]" />
                <h3 className="text-lg font-black text-slate-900">Créer / Planifier une Conférence</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Code UE</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mode de diffusion</label>
                <select
                  value={newMode}
                  onChange={(e) => setNewMode(e.target.value as 'CLOUD' | 'LAN')}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                >
                  <option value="LAN">LAN Campus (Hors-ligne LiveKit)</option>
                  <option value="CLOUD">En ligne (Cloud WebRTC)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé du cours</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amphithéâtre / Canal</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Créneau horaire</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#1E3A8A] px-5 py-2 text-xs font-black text-white hover:bg-blue-900"
              >
                Lancer la session
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Modal Partager / Inviter des participants sans application */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Inviter à la visioconférence</h3>
                  <p className="text-xs text-slate-400">Accessible dans le navigateur sans application</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* QR Code */}
            <div className="mt-5 flex flex-col items-center justify-center rounded-2xl bg-white p-4">
              <QRCodeSVG
                value={`${window.location.origin}/#/visio?room=${encodeURIComponent(activeSession.id)}`}
                size={180}
                level="M"
                includeMargin
                fgColor="#1E3A8A"
              />
              <span className="mt-2 text-xs font-bold text-slate-700">
                Scanner pour rejoindre sur smartphone ou PC
              </span>
            </div>

            {/* URL cliquable */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/#/visio?room=${encodeURIComponent(activeSession.id)}`}
                className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-300 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${window.location.origin}/#/visio?room=${encodeURIComponent(activeSession.id)}`
                  )
                  setIsCopied(true)
                  setTimeout(() => setIsCopied(false), 2000)
                }}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
              >
                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{isCopied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-800/80 p-3 text-xs text-slate-300">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                Zéro installation & Zéro compte requis
              </div>
              Toute personne ouvrant ce lien rejoint directement la séance en tant qu'invité avec sa caméra et son micro.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
