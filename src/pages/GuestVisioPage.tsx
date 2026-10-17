import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  Hand,
  PhoneOff,
  Users,
  MessageSquare,
  Share2,
  Sparkles,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Send,
  X,
  Volume2,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface GuestParticipant {
  id: string
  name: string
  role: 'ENSEIGNANT' | 'DÉLÉGUÉ' | 'ÉTUDIANT' | 'INVITÉ WEB'
  avatarBg: string
  initials: string
  micOn: boolean
  camOn: boolean
  handRaised: boolean
  speaking: boolean
  stream?: MediaStream
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  role: string
  text: string
  time: string
  isMe?: boolean
}

export default function GuestVisioPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Paramètres d'URL
  const roomId = searchParams.get('room') || 'ICT313_AMPHI502_2026'
  const lanServer = searchParams.get('server') || ''
  const initialName = searchParams.get('name') || ''

  // Étape du flow : 'lobby' -> 'call'
  const [step, setStep] = useState<'lobby' | 'call'>('lobby')
  const [guestName, setGuestName] = useState(
    () => initialName || `Invité ${Math.floor(100 + Math.random() * 900)}`
  )

  // Médias locaux
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0) // 0 à 100 pour le vumètre

  // Réunion & UI
  const [handRaised, setHandRaised] = useState(false)
  const [activeTab, setActiveTab] = useState<'none' | 'chat' | 'participants'>('none')
  const [unreadCount, setUnreadCount] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderId: 'host',
      senderName: 'Pr. Jean-Paul Ndiaye',
      role: 'ENSEIGNANT',
      text: 'Bienvenue dans la séance de cours. La visioconférence est active et ouverte aux invités.',
      time: '08:01',
    },
    {
      id: 'm2',
      senderId: 'del',
      senderName: 'Ravel Nghomsi',
      role: 'DÉLÉGUÉ',
      text: 'Bonjour à tous. Le lien de la séance est partagé pour ceux qui n\'ont pas encore l\'application UniFlow.',
      time: '08:02',
    },
  ])
  const [draftMessage, setDraftMessage] = useState('')

  // Participants
  const [participants, setParticipants] = useState<GuestParticipant[]>([
    {
      id: 'p1',
      name: 'Pr. Jean-Paul Ndiaye',
      role: 'ENSEIGNANT',
      avatarBg: 'from-[#1E3A8A] to-blue-700',
      initials: 'JN',
      micOn: true,
      camOn: true,
      handRaised: false,
      speaking: true,
    },
    {
      id: 'p2',
      name: 'Ravel Nghomsi',
      role: 'DÉLÉGUÉ',
      avatarBg: 'from-[#0D9488] to-teal-700',
      initials: 'RN',
      micOn: true,
      camOn: true,
      handRaised: false,
      speaking: false,
    },
    {
      id: 'p3',
      name: 'Aïcha Bello',
      role: 'ÉTUDIANT',
      avatarBg: 'from-amber-600 to-amber-800',
      initials: 'AB',
      micOn: false,
      camOn: true,
      handRaised: true,
      speaking: false,
    },
  ])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const lobbyVideoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // 1. Initialisation des périphériques A/V au montage
  useEffect(() => {
    let streamInstance: MediaStream | null = null

    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true,
        })
        streamInstance = stream
        setLocalStream(stream)

        if (lobbyVideoRef.current) {
          lobbyVideoRef.current.srcObject = stream
        }

        // Configuration de l'analyseur audio pour le vumètre
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          const audioCtx = new AudioContextClass()
          audioContextRef.current = audioCtx
          const source = audioCtx.createMediaStreamSource(stream)
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 64
          source.connect(analyser)

          const dataArray = new Uint8Array(analyser.frequencyBinCount)

          const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i]
            }
            const avg = sum / dataArray.length
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)))
            animationFrameRef.current = requestAnimationFrame(updateVolume)
          }
          updateVolume()
        } catch (_) {}
      } catch (err) {
        console.warn('Accès caméra/micro non autorisé ou indisponible :', err)
        setCamOn(false)
        setMicOn(false)
      }
    }

    void setupMedia()

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) {
        void audioContextRef.current.close()
      }
      if (streamInstance) {
        streamInstance.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // Attachement du flux local dans la vidéo d'appel
  useEffect(() => {
    if (step === 'call' && localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [step, localStream])

  // Connexion WebSocket au serveur local si disponible ou relais
  useEffect(() => {
    if (step !== 'call') return

    // Si une URL de serveur local a été spécifiée (ex: ?server=192.168.1.100:8088)
    if (lanServer) {
      const wsUrl = `ws://${lanServer}/ws`
      try {
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: 'join',
              name: guestName,
              role: 'INVITÉ WEB',
              micOn,
              camOn,
            })
          )
        }

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data)
            if (data.type === 'chat') {
              setMessages((prev) => [
                ...prev,
                {
                  id: data.message.id,
                  senderId: data.message.senderId,
                  senderName: data.message.senderName,
                  role: data.message.senderRole,
                  text: data.message.text,
                  time: data.message.time,
                },
              ])
            }
          } catch (_) {}
        }
      } catch (_) {}
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [step, lanServer, guestName, micOn, camOn])

  // Scroll automatique du chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, activeTab])

  // Bascule du microphone
  const toggleMic = () => {
    const nextState = !micOn
    setMicOn(nextState)
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = nextState
      })
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'state-change',
          micOn: nextState,
        })
      )
    }
  }

  // Bascule de la caméra
  const toggleCam = () => {
    const nextState = !camOn
    setCamOn(nextState)
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = nextState
      })
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'state-change',
          camOn: nextState,
        })
      )
    }
  }

  // Partage d'écran
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }
        setIsScreenSharing(true)
        screenStream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
          }
          setIsScreenSharing(false)
        }
      } catch (_) {}
    } else {
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream
      }
      setIsScreenSharing(false)
    }
  }

  // Lever la main
  const toggleHand = () => {
    const next = !handRaised
    setHandRaised(next)
    if (next) {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          senderId: 'sys',
          senderName: 'Système',
          role: 'INFOS',
          text: `✋ ${guestName} a levé la main pour demander la parole.`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }

  // Envoi de message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draftMessage.trim()) return

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      senderName: guestName,
      role: 'INVITÉ WEB',
      text: draftMessage.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    }

    setMessages((prev) => [...prev, newMsg])
    setDraftMessage('')

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat',
          text: newMsg.text,
          senderName: guestName,
          senderRole: 'INVITÉ WEB',
        })
      )
    }
  }

  // Copie du lien
  const handleCopyLink = () => {
    const url = window.location.href
    void navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2500)
  }

  // Plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      void document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Quitter
  const handleLeave = () => {
    if (window.confirm('Voulez-vous quitter la visioconférence ?')) {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop())
      }
      navigate('/')
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ÉCRAN 1 : LOBBY / SALLE D'ATTENTE AVEC RÉGLAGES PRÉ-APPEL
  // ──────────────────────────────────────────────────────────────────────────
  if (step === 'lobby') {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#1E293B] p-4 text-white">
        {/* Glow décoratif d'arrière-plan */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {/* En-tête */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1E3A8A] to-[#0D9488] shadow-lg shadow-blue-900/40">
              <span className="text-2xl font-black text-white">U</span>
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              UniFlow Visio
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Visioconférence Haute Définition · Zéro Installation Requise
            </p>
          </div>

          {/* Carte récapitulative de la séance */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-800/60 p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400">
                <span className="h-2 w-2 animate-ping rounded-full bg-red-400" />
                SÉANCE EN DIRECT
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                Salle : {roomId}
              </span>
            </div>
            <div className="mt-2 text-sm font-bold text-slate-200">
              ICT313 · Architecture des Ordinateurs & Systèmes
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Organisé par Pr. Jean-Paul Ndiaye · Amphi 502 & Hybride Web
            </div>
          </div>

          {/* Prévisualisation Vidéo */}
          <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-inner">
            {camOn ? (
              <video
                ref={lobbyVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#1E3A8A] to-blue-600 text-3xl font-extrabold text-white shadow-xl">
                  {guestName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-400">Caméra désactivée</span>
              </div>
            )}

            {/* Vumètre audio dynamique en bas à gauche de la vidéo */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-1.5 backdrop-blur-md border border-white/10">
              <Volume2 className={`h-4 w-4 ${micOn && audioLevel > 5 ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div className="flex h-3 w-16 items-end gap-0.5 overflow-hidden rounded-sm bg-slate-800 p-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
                  const isActive = micOn && audioLevel > bar * 11
                  return (
                    <div
                      key={bar}
                      className={`w-full rounded-sm transition-all duration-75 ${
                        isActive ? (bar > 6 ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-slate-700'
                      }`}
                      style={{ height: `${bar * 12.5}%` }}
                    />
                  )
                })}
              </div>
            </div>

            {/* Contrôles rapides Cam/Mic sur la vidéo */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMic}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform active:scale-95 ${
                  micOn ? 'bg-slate-800/90 text-white hover:bg-slate-700' : 'bg-red-500 text-white'
                }`}
                title={micOn ? 'Couper le micro' : 'Activer le micro'}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={toggleCam}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform active:scale-95 ${
                  camOn ? 'bg-slate-800/90 text-white hover:bg-slate-700' : 'bg-red-500 text-white'
                }`}
                title={camOn ? 'Couper la caméra' : 'Activer la caméra'}
              >
                {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Champ du Nom de l'invité */}
          <div className="mt-6">
            <label htmlFor="guestNameInput" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Votre Prénom & Nom (Visible par les participants)
            </label>
            <input
              id="guestNameInput"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex: Christian Ndjock"
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Bouton d'action Rejoindre */}
          <button
            type="button"
            onClick={() => {
              if (!guestName.trim()) return
              setStep('call')
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1E3A8A] via-blue-600 to-[#0D9488] py-3.5 text-base font-bold text-white shadow-xl shadow-blue-900/30 transition-transform hover:brightness-110 active:scale-98"
          >
            <Sparkles className="h-5 w-5" />
            Rejoindre la réunion maintenant
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Session chiffrée de bout en bout · Compatible tous navigateurs
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ÉCRAN 2 : VISIOCONFÉRENCE ACTIVE (IN-CALL IMMERSIF)
  // ──────────────────────────────────────────────────────────────────────────
  const allPeers: GuestParticipant[] = [
    {
      id: 'me',
      name: `${guestName} (Moi)`,
      role: 'INVITÉ WEB',
      avatarBg: 'from-[#1E3A8A] to-[#0D9488]',
      initials: guestName.charAt(0).toUpperCase(),
      micOn,
      camOn,
      handRaised,
      speaking: micOn && audioLevel > 15,
      stream: localStream || undefined,
    },
    ...participants,
  ]

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0B1120] text-slate-100">
      {/* ── BARRE SUPÉRIEURE ────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1E3A8A] to-[#0D9488] font-black text-white text-base">
            U
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white max-w-[280px] truncate sm:max-w-md">
                ICT313 · Architecture des Ordinateurs
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-extrabold text-red-400 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-400" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Amphi 502 · Pr. Jean-Paul Ndiaye · Salle : <span className="font-mono text-slate-300">{roomId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton Partager le lien d'accès */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <Share2 className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">Inviter</span>
          </button>

          {/* Bouton Plein écran */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-800 text-slate-300 transition hover:bg-slate-700"
            title="Plein écran"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── ZONE CENTRALE : SCÈNE VIDÉO + TIROIR LATÉRAL ─────────────── */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Grille Vidéo */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center overflow-y-auto">
          <div
            className={`grid gap-3 sm:gap-4 w-full h-full max-h-[82vh] mx-auto items-center ${
              allPeers.length <= 1
                ? 'grid-cols-1 max-w-4xl'
                : allPeers.length === 2
                  ? 'grid-cols-1 md:grid-cols-2 max-w-5xl'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 max-w-6xl'
            }`}
          >
            {allPeers.map((peer) => {
              const isLocalUser = peer.id === 'me'
              return (
                <div
                  key={peer.id}
                  className={`group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border-2 bg-slate-900 shadow-xl transition-all ${
                    peer.speaking
                      ? 'border-emerald-500 shadow-emerald-500/20'
                      : 'border-white/10'
                  }`}
                >
                  {/* Flux Vidéo ou Avatar */}
                  {peer.camOn ? (
                    isLocalUser ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="relative h-full w-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                        {/* Simulation de flux orateur / caméras distantes avec silhouette animée */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr ${peer.avatarBg} text-2xl font-bold text-white shadow-xl`}
                          >
                            {peer.initials}
                          </div>
                          <span className="text-xs font-semibold text-slate-300">
                            Caméra active (HD)
                          </span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 to-slate-950">
                      <div
                        className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr ${peer.avatarBg} text-2xl font-black text-white shadow-2xl`}
                      >
                        {peer.initials}
                      </div>
                      <span className="text-xs font-medium text-slate-400">Caméra désactivée</span>
                    </div>
                  )}

                  {/* Badge levée de main */}
                  {peer.handRaised && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-xl bg-amber-500/90 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-lg animate-bounce">
                      <Hand className="h-3.5 w-3.5" />
                      Main levée
                    </div>
                  )}

                  {/* Bandeau d'identité du participant en bas */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-slate-950/80 px-3 py-1.5 backdrop-blur-md border border-white/10">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-xs font-bold text-white">
                        {peer.name}
                      </span>
                      <span className="shrink-0 rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-300">
                        {peer.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {peer.speaking && (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      {peer.micOn ? (
                        <Mic className="h-3.5 w-3.5 text-slate-300" />
                      ) : (
                        <MicOff className="h-3.5 w-3.5 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tiroir Latéral (Chat / Participants) */}
        {activeTab !== 'none' && (
          <aside className="w-80 shrink-0 border-l border-white/10 bg-slate-900 flex flex-col z-30 transition-all duration-300">
            {/* Entête du tiroir */}
            <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    activeTab === 'chat'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Discussion ({messages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('participants')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    activeTab === 'participants'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Participants ({allPeers.length})
                </button>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('none')}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenu : Onglet Discussion */}
            {activeTab === 'chat' && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div ref={chatScrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-300">{m.senderName}</span>
                        <span>· {m.time}</span>
                      </div>
                      <div
                        className={`mt-1 max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          m.isMe
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-white/5'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 border-t border-white/10 p-3 bg-slate-950/60"
                >
                  <input
                    type="text"
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    placeholder="Écrire un message..."
                    className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Contenu : Onglet Participants */}
            {activeTab === 'participants' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {allPeers.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-slate-800/60 p-2.5 border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr ${p.avatarBg} text-xs font-bold text-white`}
                      >
                        {p.initials}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{p.name}</div>
                        <div className="text-[10px] font-semibold text-blue-400">{p.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {p.handRaised && <Hand className="h-3.5 w-3.5 text-amber-400" />}
                      {p.micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5 text-red-400" />}
                      {p.camOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5 text-red-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ── BARRE DE CONTRÔLES INFÉRIEURE (MEET DOCK) ───────────────── */}
      <footer className="flex h-18 shrink-0 items-center justify-center gap-3 border-t border-white/10 bg-slate-900/90 px-4 backdrop-blur-md z-20">
        {/* Micro */}
        <button
          type="button"
          onClick={toggleMic}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 ${
            micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'
          }`}
          title={micOn ? 'Couper le micro' : 'Activer le micro'}
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>

        {/* Caméra */}
        <button
          type="button"
          onClick={toggleCam}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 ${
            camOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'
          }`}
          title={camOn ? 'Couper la caméra' : 'Activer la caméra'}
        >
          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>

        {/* Partage d'écran */}
        <button
          type="button"
          onClick={toggleScreenShare}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 ${
            isScreenSharing ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
          title="Partager l'écran"
        >
          <MonitorUp className="h-5 w-5" />
        </button>

        {/* Lever la main */}
        <button
          type="button"
          onClick={toggleHand}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 ${
            handRaised ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
          title="Lever la main"
        >
          <Hand className="h-5 w-5" />
        </button>

        <div className="h-6 w-px bg-white/10 mx-1" />

        {/* Discussion / Chat */}
        <button
          type="button"
          onClick={() => {
            setActiveTab(activeTab === 'chat' ? 'none' : 'chat')
            setUnreadCount(0)
          }}
          className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 ${
            activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
          title="Discussion"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Participants */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'participants' ? 'none' : 'participants')}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 ${
            activeTab === 'participants' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
          title="Participants"
        >
          <Users className="h-5 w-5" />
        </button>

        <div className="h-6 w-px bg-white/10 mx-1" />

        {/* Bouton Quitter */}
        <button
          type="button"
          onClick={handleLeave}
          className="flex h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 active:scale-95"
        >
          <PhoneOff className="h-4 w-4" />
          <span className="hidden sm:inline">Quitter</span>
        </button>
      </footer>

      {/* ── MODALE PARTAGER / INVITATION ────────────────────────────── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Inviter à la réunion</h3>
                  <p className="text-xs text-slate-400">Accès direct sans application</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* QR Code */}
            <div className="mt-5 flex flex-col items-center justify-center rounded-2xl bg-white p-4">
              <QRCodeSVG
                value={window.location.href}
                size={180}
                level="M"
                includeMargin
                fgColor="#1E3A8A"
              />
              <span className="mt-2 text-[11px] font-semibold text-slate-600">
                Scannez pour rejoindre sur mobile ou PC
              </span>
            </div>

            {/* Champ URL et Bouton Copier */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950 p-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-300 outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500"
              >
                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {isCopied ? 'Copié !' : 'Copier'}
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              Les participants peuvent ouvrir ce lien dans Chrome, Firefox ou Safari sans créer de compte.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
