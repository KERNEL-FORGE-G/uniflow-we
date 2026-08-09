import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, Users, MessageSquare,
  MoreHorizontal, PhoneOff, Radio, Hand, Download,
  Wifi, WifiOff, Shield, VolumeX, HardDrive, Send,
  Lightbulb, CheckCircle
} from 'lucide-react'
import { useUserRole } from '../utils/userRole'
import { Avatar } from '../components/ui/Avatar'

interface ChatMsg { id: string; user: string; role: string; text: string; time: string }

const PARTICIPANTS = [
  { name: 'Sarah Kamga',     role: 'student',   muted: false },
  { name: 'Lino Ndongo',     role: 'delegate',  muted: true  },
  { name: 'Yasmine Ngono',   role: 'student',   muted: false },
  { name: 'Thomas Mbarga',   role: 'student',   muted: true  },
  { name: 'Hugo Leroy',      role: 'student',   muted: false },
]

const INITIAL_MSGS: ChatMsg[] = [
  { id: '1', user: 'Emma Martin',   role: 'student',  text: 'Pouvez-vous répéter la partie sur les graphes ?',       time: '10:15' },
  { id: '2', user: 'Prof. Dubois',  role: 'teacher',  text: 'Bien sûr, je reviens dessus.',                          time: '10:16' },
  { id: '3', user: 'Lucas Bernard', role: 'delegate', text: 'J\'ai la même question que Emma.',                      time: '10:16' },
]

export default function VideoConfPage() {
  const navigate = useNavigate()
  const { currentRole, isOfflineMode } = useUserRole()

  const [isMuted,    setIsMuted]    = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [dataSaver,  setDataSaver]  = useState(false)
  const [isRec,      setIsRec]      = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [muteAll,    setMuteAll]    = useState(false)
  const [forceAudio, setForceAudio] = useState(false)
  const [tab,        setTab]        = useState<'chat'|'participants'>('chat')
  const [msgs,       setMsgs]       = useState<ChatMsg[]>(INITIAL_MSGS)
  const [input,      setInput]      = useState('')
  const [elapsed,    setElapsed]    = useState(5075) // seconds
  const bottomRef = useRef<HTMLDivElement>(null)

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const me = currentRole === 'teacher' ? 'Prof. Martin' : currentRole === 'delegate' ? 'Lucas (Délégué)' : 'Emma Martin'
    setMsgs(prev => [...prev, { id: Date.now().toString(), user: me, role: currentRole, text: input.trim(), time }])
    setInput('')
  }

  const roleColor = (r: string) => r === 'teacher' ? 'text-[#0d9488]' : r === 'delegate' ? 'text-indigo-400' : 'text-slate-300'
  const roleBadge = (r: string) => r === 'teacher' ? 'bg-[#0d9488]/20 text-[#0d9488]' : r === 'delegate' ? 'bg-indigo-500/20 text-indigo-300' : ''

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-950 text-white select-none">

      {/* ── Header ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e3a8a]/20 bg-gradient-to-r from-[#1e3a8a]/10 via-slate-900/50 to-[#0d9488]/10 backdrop-blur-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Algorithmique & Structures de Données L2</h1>
              <span className="rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-3 py-0.5 text-[10px] font-bold text-white shadow-lg">LIVE</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs">
              {isOfflineMode
                ? <><Wifi className="h-3 w-3 text-[#0d9488] animate-pulse" /><span className="text-[#0d9488] font-medium">Réseau Local (LAN) — 0 Mo</span></>
                : <><WifiOff className="h-3 w-3 text-amber-400" /><span className="text-amber-400 font-medium">Internet — Mobile data</span></>
              }
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isRec && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/50 px-3 py-1 text-xs font-bold text-red-400 animate-pulse shadow-lg">
              <Radio className="h-3.5 w-3.5" /> REC
            </span>
          )}
          <span className="font-mono text-sm text-white bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-4 py-1.5 rounded-xl border border-[#0d9488]/50 font-bold shadow-lg">
            {fmtTime(elapsed)}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5 text-white shadow-lg">
            <Users className="h-4 w-4 text-[#0d9488]" /> {PARTICIPANTS.length + 1 + 37}
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: video + tiles */}
        <div className="flex flex-1 flex-col p-4 gap-3 overflow-y-auto">

          {/* Data warnings */}
          {!dataSaver && !isOfflineMode && (
            <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 p-4 flex gap-3 text-xs backdrop-blur-sm shadow-lg">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-400/30">
                <Lightbulb className="h-5 w-5 text-amber-300" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-100 mb-1">Économisez vos données mobiles</p>
                <p className="text-amber-200/80 leading-relaxed">Connectez-vous au Wi-Fi local du campus pour un flux vidéo gratuit. En 3G/4G, activez le Mode Éco ci-dessous.</p>
              </div>
            </div>
          )}
          {dataSaver && (
            <div className="rounded-2xl bg-gradient-to-r from-[#0d9488]/10 to-emerald-500/10 border border-[#0d9488]/30 p-4 flex gap-3 text-xs backdrop-blur-sm shadow-lg">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0d9488]/20 border border-[#0d9488]/30">
                <CheckCircle className="h-5 w-5 text-[#0d9488]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-emerald-100 mb-1">Mode Éco actif</p>
                <p className="text-emerald-200/80 leading-relaxed">Consommation réduite à 8 Ko/s — économie de ~92% par rapport au flux HD classique.</p>
              </div>
            </div>
          )}

          {/* Main presenter window */}
          <div className="relative flex-1 min-h-[260px] rounded-3xl bg-gradient-to-br from-[#1e3a8a]/20 via-slate-900/50 to-[#0d9488]/20 border border-[#1e3a8a]/30 overflow-hidden flex items-center justify-center shadow-2xl backdrop-blur-sm">
            {dataSaver || forceAudio ? (
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar name="Prof. Dubois" size="2xl" className="ring-4 ring-gradient-to-r from-[#1e3a8a] to-[#0d9488] shadow-2xl" />
                  <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#0d9488] to-emerald-500 p-2 rounded-full ring-4 ring-slate-900/50 shadow-lg">
                    <Mic className="h-4 w-4 text-white" />
                  </span>
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Prof. Dubois</p>
                  <p className="text-sm text-[#0d9488] mt-1 font-medium">Présentateur • Mode Éco</p>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/20 via-slate-900/30 to-slate-950/50 flex items-center justify-center backdrop-blur-sm">
                  <Avatar name="Prof. Dubois" size="2xl" className="shadow-2xl" />
                </div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#1e3a8a]/80 to-[#0d9488]/80 backdrop-blur-md rounded-xl px-3 py-1.5 text-[10px] font-bold text-white shadow-lg border border-white/10">
                  1080p • 30fps
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl px-4 py-2 text-sm font-semibold shadow-xl border border-white/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#0d9488] to-emerald-400 animate-pulse shadow-lg" />
                  <span className="text-white">Prof. Dubois</span>
                  <span className="text-[#0d9488]">•</span>
                  <span className="text-[#0d9488]">Présentateur</span>
                </div>
              </>
            )}
          </div>

          {/* Participant tiles */}
          <div>
            <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-3 px-1 flex items-center gap-2">
              <Users className="h-3 w-3" />
              Participants ({PARTICIPANTS.length + 1})
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {/* Self tile */}
              <div className="relative shrink-0 w-36 h-24 rounded-2xl bg-gradient-to-br from-[#1e3a8a]/30 to-[#0d9488]/30 border border-[#1e3a8a]/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
                <Avatar name={currentRole === 'teacher' ? 'Prof. Martin' : 'Emma Martin'} size="sm" className="shadow-lg" />
                <span className="text-[11px] font-semibold mt-1.5 text-white truncate w-full text-center">Vous</span>
                {handRaised && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 p-1.5 rounded-full shadow-lg animate-bounce">
                    <Hand className="h-3.5 w-3.5 text-white" />
                  </span>
                )}
                <span className="absolute bottom-2 right-2">
                  {isMuted ? (
                    <span className="bg-red-500/90 p-1 rounded-lg shadow-lg"><MicOff className="h-3 w-3 text-white" /></span>
                  ) : (
                    <span className="bg-gradient-to-r from-[#0d9488] to-emerald-500 p-1 rounded-lg shadow-lg"><Mic className="h-3 w-3 text-white" /></span>
                  )}
                </span>
              </div>
              {PARTICIPANTS.map(p => (
                <div key={p.name} className="relative shrink-0 w-36 h-24 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm flex flex-col items-center justify-center p-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
                  <Avatar name={p.name} size="sm" className="shadow-lg" />
                  <span className="text-[11px] font-medium mt-1.5 text-slate-200 truncate w-full text-center">{p.name.split(' ')[0]}</span>
                  <span className="absolute bottom-2 right-2">
                    {(p.muted || muteAll) ? (
                      <span className="bg-red-500/90 p-1 rounded-lg shadow-lg"><MicOff className="h-3 w-3 text-white" /></span>
                    ) : (
                      <span className="bg-gradient-to-r from-[#0d9488] to-emerald-500 p-1 rounded-lg shadow-lg"><Mic className="h-3 w-3 text-white" /></span>
                    )}
                  </span>
                </div>
              ))}
              <div className="shrink-0 w-36 h-24 rounded-2xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm flex flex-col items-center justify-center text-slate-300 hover:bg-slate-800/50 transition-all cursor-pointer">
                <span className="text-2xl font-black bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] bg-clip-text text-transparent">+37</span>
                <span className="text-[10px] mt-1 text-slate-400 font-medium">autres</span>
              </div>
            </div>
          </div>

          {/* Teacher host panel */}
          {currentRole === 'teacher' && (
            <div className="rounded-3xl bg-gradient-to-br from-[#1e3a8a]/20 to-[#0d9488]/20 border border-[#1e3a8a]/30 backdrop-blur-sm p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-white block">Console Modération</span>
                  <span className="text-xs text-white/60">Contrôles enseignant</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setMuteAll(v => !v)}
                  className={`flex flex-col items-center gap-2 justify-center rounded-2xl px-4 py-4 text-xs font-bold border transition-all shadow-lg hover:scale-105 ${muteAll ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                  <VolumeX className="h-5 w-5" />
                  <span className="text-[10px]">{muteAll ? 'Rétablir' : 'Couper tous'}</span>
                </button>
                <button onClick={() => { setForceAudio(v => !v); if (!forceAudio) setDataSaver(true) }}
                  className={`flex flex-col items-center gap-2 justify-center rounded-2xl px-4 py-4 text-xs font-bold border transition-all shadow-lg hover:scale-105 ${forceAudio ? 'bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] border-[#0d9488] text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                  <VideoOff className="h-5 w-5" />
                  <span className="text-[10px]">{forceAudio ? 'Activer vidéo' : 'Audio seul'}</span>
                </button>
                <button onClick={() => setIsRec(v => !v)}
                  className={`flex flex-col items-center gap-2 justify-center rounded-2xl px-4 py-4 text-xs font-bold border transition-all shadow-lg hover:scale-105 ${isRec ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white animate-pulse' : 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white'}`}>
                  <HardDrive className="h-5 w-5" />
                  <span className="text-[10px]">{isRec ? 'Arrêter' : 'Enregistrer'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: chat / participants */}
        <aside className="hidden lg:flex w-80 flex-col border-l border-[#1e3a8a]/20 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm">
          <div className="flex border-b border-[#1e3a8a]/20">
            {(['chat','participants'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${tab === t ? 'border-[#0d9488] text-[#0d9488] bg-[#0d9488]/10' : 'border-transparent text-slate-400 hover:text-slate-300'}`}>
                {t === 'chat' ? `Chat (${msgs.length})` : `Participants (${PARTICIPANTS.length + 1})`}
              </button>
            ))}
          </div>

          {tab === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {msgs.map(m => (
                  <div key={m.id}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Avatar name={m.user} size="xs" />
                      <span className={`text-xs font-bold ${roleColor(m.role)}`}>{m.user}</span>
                      {roleBadge(m.role) && (
                        <span className={`text-[8px] px-1 rounded uppercase font-semibold ${roleBadge(m.role)}`}>
                          {m.role === 'teacher' ? 'Prof' : 'Délég'}
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-slate-500 font-mono">{m.time}</span>
                    </div>
                    <p className="ml-7 text-xs text-slate-200 bg-slate-800/40 rounded-2xl p-3 border border-slate-700/30 backdrop-blur-sm">{m.text}</p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMsg} className="border-t border-[#1e3a8a]/20 p-4 bg-slate-950/60">
                <div className="flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    placeholder="Écrire un message..."
                    className="flex-1 rounded-xl bg-slate-800/50 border border-[#1e3a8a]/20 px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] backdrop-blur-sm" />
                  <button type="submit" disabled={!input.trim()}
                    className="rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#2d4fa8] hover:to-[#14b8a8] disabled:opacity-40 px-4 py-3 text-white transition-all shadow-lg disabled:cursor-not-allowed">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">En ligne ({PARTICIPANTS.length + 1})</p>
              {[{ name: 'Prof. Dubois', role: 'teacher' }, ...PARTICIPANTS].map(p => (
                <div key={p.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.name} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{p.name}</p>
                      <p className={`text-[10px] ${roleColor(p.role)}`}>{p.role === 'teacher' ? 'Présentateur' : p.role === 'delegate' ? 'Délégué' : 'Étudiant'}</p>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* ── Controls footer ── */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e3a8a]/20 bg-gradient-to-r from-[#1e3a8a]/10 via-slate-900/50 to-[#0d9488]/10 backdrop-blur-xl px-5 py-4">
        <button onClick={() => setDataSaver(v => !v)}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold border transition-all shadow-lg hover:scale-105 ${dataSaver ? 'bg-gradient-to-r from-[#0d9488] to-emerald-500 border-[#0d9488] text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'}`}>
          <Download className="h-4 w-4" /> Mode Éco
        </button>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsMuted(v => !v)}
            className={`rounded-2xl p-4 border transition-all shadow-lg hover:scale-110 ${isMuted ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white animate-pulse' : 'bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] border-[#0d9488]/50 text-white hover:shadow-xl'}`}>
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button onClick={() => setIsVideoOff(v => !v)}
            className={`rounded-2xl p-4 border transition-all shadow-lg hover:scale-110 ${isVideoOff ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white animate-pulse' : 'bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] border-[#0d9488]/50 text-white hover:shadow-xl'}`}>
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>
          {currentRole !== 'teacher' && (
            <button onClick={() => setHandRaised(v => !v)}
              className={`rounded-2xl p-4 border transition-all shadow-lg hover:scale-110 ${handRaised ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300 text-white shadow-amber-400/50 shadow-xl' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'}`}>
              <Hand className="h-5 w-5" />
            </button>
          )}
          <button className="rounded-2xl bg-white/5 border border-white/10 p-4 text-slate-300 hover:text-white hover:bg-white/10 hidden sm:block transition-all shadow-lg hover:scale-110">
            <MonitorUp className="h-5 w-5" />
          </button>
          <button onClick={() => setTab(t => t === 'chat' ? 'participants' : 'chat')}
            className="rounded-2xl bg-white/5 border border-white/10 p-4 text-slate-300 hover:text-white hover:bg-white/10 lg:hidden transition-all shadow-lg hover:scale-110">
            <MessageSquare className="h-5 w-5" />
          </button>
          <button className="rounded-2xl bg-white/5 border border-white/10 p-4 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-lg hover:scale-110">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <button onClick={() => navigate('/app')}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 border border-red-400 px-6 py-3 text-sm font-bold text-white hover:from-red-600 hover:to-red-700 transition-all shadow-xl shadow-red-500/30 hover:scale-105">
          <PhoneOff className="h-5 w-5" /> Quitter
        </button>
      </footer>
    </div>
  )
}
