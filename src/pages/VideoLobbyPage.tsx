import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Video, VideoOff, Mic, MicOff, Settings, Users, Calendar,
  Clock, Lock, Globe, Copy, CheckCircle, Plus, LogIn, Sparkles,
  User, Shield, Volume2, Sliders, Image, Play, Link as LinkIcon, Radio
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { useUserRole } from '../utils/userRole'
import { useMediaStream } from '../hooks/useMediaStream'

export default function VideoLobbyPage() {
  const navigate = useNavigate()
  const { currentRole } = useUserRole()
  const [tab, setTab] = useState<'create' | 'join'>('join')
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [virtualBg, setVirtualBg] = useState<'none' | 'blur' | 'campus' | 'amphi'>('none')
  const [roomCode, setRoomCode] = useState('')
  const [roomName, setRoomName] = useState('')
  const [copied, setCopied] = useState(false)
  const [testingSpeaker, setTestingSpeaker] = useState(false)
  const [showDeviceSettings, setShowDeviceSettings] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { stream, audioLevel, startStream, toggleVideo, toggleAudio } = useMediaStream()

  // Initialize media stream on mount
  useEffect(() => {
    startStream(cameraOn, micOn)
  }, [])

  // Attach webcam stream to video element if available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const handleToggleCam = () => {
    const next = !cameraOn
    setCameraOn(next)
    toggleVideo(next)
  }

  const handleToggleMic = () => {
    const next = !micOn
    setMicOn(next)
    toggleAudio(next)
  }

  const testAudioTone = () => {
    setTestingSpeaker(true)
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    } catch (e) {
      console.log('Audio test not supported', e)
    }
    setTimeout(() => setTestingSpeaker(false), 800)
  }

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(code)
    return code
  }

  const handleCopy = () => {
    const code = roomCode || generateCode()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/app/visioconference?code=${roomCode}`)
    }
  }

  const handleCreateRoom = () => {
    if (roomName.trim()) {
      const code = roomCode || generateCode()
      navigate(`/app/visioconference?title=${encodeURIComponent(roomName)}&code=${code}`)
    }
  }

  const userName = currentRole === 'teacher' ? 'Prof. Martin' : currentRole === 'delegate' ? 'Lucas (Délégué)' : 'Emma Martin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-950 py-8 px-4 text-white select-none">
      <div className="mx-auto max-w-6xl">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] shadow-xl">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                UniFlow Visioconférence
              </h1>
              <p className="text-xs text-white/60 mt-0.5">Salles virtuelles HD, tableau interactif et mode basse consommation</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all shadow-md"
          >
            ← Retour au tableau de bord
          </button>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Video Preview & Test Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="rounded-3xl bg-gradient-to-br from-[#1e3a8a]/20 via-slate-900/50 to-[#0d9488]/20 border border-[#1e3a8a]/30 backdrop-blur-sm p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <User className="h-4 w-4 text-[#0d9488]" />
                  Aperçu & Micro
                </h2>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Prêt
                </span>
              </div>

              {/* Video Preview Frame */}
              <div className={`relative aspect-video rounded-2xl bg-slate-900 border border-slate-700/50 overflow-hidden mb-4 flex items-center justify-center shadow-inner ${
                virtualBg === 'blur' ? 'backdrop-blur-md' : ''
              }`}>
                {cameraOn && stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${
                      virtualBg === 'blur' ? 'filter blur-xs' : ''
                    }`}
                  />
                ) : cameraOn ? (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/30 to-[#0d9488]/30 flex flex-col items-center justify-center">
                    <Avatar name={userName} size="2xl" className="shadow-2xl ring-4 ring-[#0d9488]/50" />
                    <p className="text-xs text-slate-300 mt-2 font-medium">Flux vidéo généré</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                      <VideoOff className="h-6 w-6 text-slate-500" />
                    </div>
                    <p className="text-xs font-medium">Caméra désactivée</p>
                  </div>
                )}

                {/* Overlaid user name & controls */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                  <span className="text-[11px] font-bold text-white bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-lg">
                    {userName}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleToggleMic}
                      className={`rounded-xl p-2 transition-all shadow-md ${
                        micOn
                          ? 'bg-gradient-to-r from-[#0d9488] to-emerald-500 text-white'
                          : 'bg-red-500/90 text-white animate-pulse'
                      }`}
                    >
                      {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={handleToggleCam}
                      className={`rounded-xl p-2 transition-all shadow-md ${
                        cameraOn
                          ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white'
                          : 'bg-red-500/90 text-white animate-pulse'
                      }`}
                    >
                      {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Audio Volume VU-Meter */}
              <div className="rounded-2xl bg-slate-950/60 border border-white/10 p-3.5 mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium text-[11px]">
                    <Mic className="h-3.5 w-3.5 text-[#0d9488]" /> Niveau Micro
                  </span>
                  <span className="font-mono text-[10px] text-teal-300 font-bold">{micOn ? `${audioLevel}%` : 'Muet'}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 flex gap-1">
                  {[...Array(20)].map((_, i) => {
                    const active = micOn && (audioLevel / 5) > i
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-full rounded-xs transition-all duration-75 ${
                          active
                            ? i > 15 ? 'bg-rose-500' : i > 11 ? 'bg-amber-400' : 'bg-teal-400'
                            : 'bg-slate-700/40'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Virtual Background Options */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Image className="h-3.5 w-3.5 text-[#0d9488]" /> Arrière-plan Virtuel
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'Aucun' },
                    { id: 'blur', label: 'Flou' },
                    { id: 'campus', label: 'Campus' },
                    { id: 'amphi', label: 'Amphi' },
                  ].map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => setVirtualBg(bg.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                        virtualBg === bg.id
                          ? 'bg-[#0d9488] border-teal-400 text-white shadow-xs'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Test Button */}
              <button
                onClick={testAudioTone}
                className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-between hover:bg-white/10 transition-all text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Volume2 className={`h-4 w-4 ${testingSpeaker ? 'text-teal-400 animate-bounce' : 'text-slate-400'}`} />
                  Tester le haut-parleur
                </span>
                <span className="text-[10px] text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-lg border border-teal-500/30 font-bold">
                  {testingSpeaker ? 'Son en cours...' : 'Tester'}
                </span>
              </button>

              {/* Security Banner */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-[#0d9488]" />
                  <span>Flux chiffré de bout en bout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-[#0d9488]" />
                  <span>Mode LAN direct disponible sans internet</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Join / Create Room Tabs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="rounded-3xl bg-slate-900/80 border border-[#1e3a8a]/30 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Tab Selector */}
              <div className="flex border-b border-[#1e3a8a]/20 bg-slate-950/40">
                <button
                  onClick={() => setTab('join')}
                  className={`flex-1 py-4 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                    tab === 'join'
                      ? 'border-[#0d9488] text-[#0d9488] bg-[#0d9488]/10'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" /> Rejoindre avec un code
                  </div>
                </button>
                <button
                  onClick={() => setTab('create')}
                  className={`flex-1 py-4 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                    tab === 'create'
                      ? 'border-[#0d9488] text-[#0d9488] bg-[#0d9488]/10'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Créer un cours instantané
                  </div>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 sm:p-8">
                {tab === 'join' ? (
                  <motion.div
                    key="join"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-extrabold text-white mb-1">Rejoindre une réunion académique</h3>
                      <p className="text-xs text-slate-400">
                        Entrez le code à 6 caractères ou cliquez sur l'un des cours programmés ci-dessous.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Code de la réunion</label>
                        <input
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          placeholder="Ex: ALG204"
                          className="w-full rounded-2xl bg-slate-800/60 border border-[#1e3a8a]/40 px-6 py-4 text-xl font-mono text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] tracking-widest shadow-inner"
                          maxLength={6}
                        />
                      </div>

                      <button
                        onClick={handleJoinRoom}
                        disabled={!roomCode.trim()}
                        className="w-full rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-6 py-4 text-sm font-bold text-white hover:from-[#2d4fa8] hover:to-[#14b8a8] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        <Play className="h-4 w-4 fill-current" /> Rejoindre la visioconférence
                      </button>
                    </div>

                    {/* Scheduled virtual classes */}
                    <div className="pt-6 border-t border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Radio className="h-3.5 w-3.5 text-[#0d9488] animate-pulse" /> Cours virtuels programmés aujourd'hui
                        </p>
                        <span className="text-[10px] text-teal-300 font-bold bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-500/30">
                          Direct L1-L3
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { title: 'Algorithmique & Structures de Données L2', code: 'ALG204', teacher: 'Pr. Dubois', time: 'En cours (10:00 - 12:00)', live: true },
                          { title: 'Architecture des Ordinateurs L1', code: 'ARC101', teacher: 'Dr. Mbarga', time: 'Aujourd\'hui à 14:00', live: false },
                          { title: 'Systèmes Répartis & Cloud M1', code: 'SYS502', teacher: 'Pr. Kamga', time: 'Aujourd\'hui à 16:00', live: false },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => { setRoomCode(item.code); navigate(`/app/visioconference?code=${item.code}`) }}
                            className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-wrap items-center justify-between gap-3 ${
                              item.live
                                ? 'bg-gradient-to-r from-[#1e3a8a]/30 to-[#0d9488]/30 border-[#0d9488]/50 shadow-md hover:border-teal-400'
                                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                                item.live ? 'bg-[#0d9488] text-white shadow-md' : 'bg-slate-700 text-slate-300'
                              }`}>
                                {item.code.substring(0,3)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {item.teacher} • <span className={item.live ? 'text-teal-300 font-bold' : ''}>{item.time}</span>
                                </p>
                              </div>
                            </div>

                            <button className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              item.live
                                ? 'bg-[#0d9488] text-white hover:bg-teal-600 shadow-xs'
                                : 'bg-white/10 text-slate-300 hover:text-white'
                            }`}>
                              {item.live ? 'Rejoindre LIVE' : 'Accéder'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-extrabold text-white mb-1">Créer une salle virtuelle</h3>
                      <p className="text-xs text-slate-400">
                        Lancez un cours en direct avec enregistrement et présence automatique des étudiants.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Sujet / Intitulé du cours</label>
                        <input
                          type="text"
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                          placeholder="Ex: Travaux Dirigés Algorithmique L2"
                          className="w-full rounded-2xl bg-slate-800/60 border border-[#1e3a8a]/40 px-5 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                              type="date"
                              defaultValue={new Date().toISOString().split('T')[0]}
                              className="w-full rounded-2xl bg-slate-800/60 border border-[#1e3a8a]/40 pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Heure de début</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                              type="time"
                              defaultValue="10:00"
                              className="w-full rounded-2xl bg-slate-800/60 border border-[#1e3a8a]/40 pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Generated Code Display */}
                      <div className="rounded-2xl bg-gradient-to-r from-[#1e3a8a]/30 to-[#0d9488]/30 border border-[#0d9488]/40 p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-[#0d9488]" /> Code d'accès unique
                          </span>
                          <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20 transition-all"
                          >
                            {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? 'Copié !' : 'Copier'}
                          </button>
                        </div>
                        <p className="text-3xl font-black font-mono tracking-widest text-center text-teal-300 py-1">
                          {roomCode || 'UNI789'}
                        </p>
                      </div>

                      <button
                        onClick={handleCreateRoom}
                        disabled={!roomName.trim()}
                        className="w-full rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-6 py-4 text-sm font-bold text-white hover:from-[#2d4fa8] hover:to-[#14b8a8] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" /> Démarrer la visioconférence
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
