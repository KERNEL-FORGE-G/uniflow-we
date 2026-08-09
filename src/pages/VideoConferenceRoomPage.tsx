import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, Users, MessageSquare, 
  Share2, Settings, GraduationCap, Megaphone, Send, MoreHorizontal,
  Monitor, Hand, Sparkles, X
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'

interface Participant {
  name: string
  role: 'Étudiant' | 'Enseignant' | 'Délégué'
  audio: boolean
  video: boolean
}

interface ChatMessage {
  id: string
  name: string
  text: string
  time: string
  role: 'Étudiant' | 'Enseignant' | 'Délégué'
}

const PARTICIPANTS: Participant[] = [
  { name: 'Emma Martin', role: 'Étudiant', audio: true, video: true },
  { name: 'Lucas Dubois', role: 'Délégué', audio: true, video: true },
  { name: 'Sophie Bernard', role: 'Étudiant', audio: false, video: true },
  { name: 'Thomas Mbarga', role: 'Étudiant', audio: true, video: false },
  { name: 'Yasmine Ngono', role: 'Étudiant', audio: true, video: true },
]

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', name: 'Emma Martin', text: 'Bonjour tout le monde !', time: '10:32', role: 'Étudiant' },
  { id: '2', name: 'Pr. Martin', text: 'Bonjour Emma, prêt pour le cours ?', time: '10:33', role: 'Enseignant' },
  { id: '3', name: 'Lucas Dubois', text: 'Présent professeur !', time: '10:33', role: 'Délégué' },
]

export default function VideoConferenceRoomPage() {
  const navigate = useNavigate()
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      name: 'Vous',
      text: input.trim(),
      time,
      role: 'Étudiant'
    }])
    setInput('')
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[#1e3a8a]/20 bg-gradient-to-r from-[#1e3a8a]/10 via-slate-900/50 to-[#0d9488]/10 backdrop-blur-xl px-6 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Algorithmique L2 — Cours du 13 mai 2026
            </h1>
            <p className="text-xs text-white/60 mt-0.5">Pr. Martin • Salle virtuelle A204</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all shadow-lg">
            <Users className="h-4 w-4 text-[#0d9488]" />
            {PARTICIPANTS.length + 1}
          </button>
          <button onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all shadow-lg ${
              showChat
                ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] border-[#0d9488]/50 text-white'
                : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            }`}>
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-6">
          <div className="grid h-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Main speaker (teacher) - 2 columns */}
            <div className="sm:col-span-2 lg:col-span-2 rounded-3xl bg-gradient-to-br from-[#1e3a8a]/30 via-slate-900/50 to-[#0d9488]/30 border border-[#1e3a8a]/50 backdrop-blur-sm flex items-center justify-center relative overflow-hidden shadow-2xl group hover:shadow-[#0d9488]/20 transition-all">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/10 via-transparent to-[#0d9488]/10 group-hover:from-[#1e3a8a]/20 group-hover:to-[#0d9488]/20 transition-all" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar name="Pr. Martin" size="2xl" className="shadow-2xl" />
              </div>
              
              {/* Bottom info bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2.5 shadow-xl">
                  <span className="h-3 w-3 rounded-full bg-gradient-to-r from-[#0d9488] to-emerald-400 animate-pulse shadow-lg shadow-[#0d9488]/50" />
                  <div>
                    <p className="text-sm font-bold text-white">Pr. Martin</p>
                    <p className="text-xs text-[#0d9488]">Enseignant • Présentateur</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-xl bg-gradient-to-r from-[#0d9488] to-emerald-500 p-2 shadow-lg">
                    <Mic className="h-4 w-4 text-white" />
                  </span>
                  <span className="rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] p-2 shadow-lg">
                    <Video className="h-4 w-4 text-white" />
                  </span>
                </div>
              </div>

              {/* Top quality badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-[#1e3a8a]/80 to-[#0d9488]/80 backdrop-blur-md rounded-xl px-3 py-1.5 text-[10px] font-bold text-white shadow-lg border border-white/10">
                HD • 1080p
              </div>
            </div>

            {/* Participants */}
            {PARTICIPANTS.map((p, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm flex items-center justify-center relative overflow-hidden min-h-[200px] shadow-xl hover:shadow-2xl hover:scale-105 transition-all group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                  {p.role === 'Étudiant' ? (
                    <GraduationCap className="h-20 w-20 text-[#1e3a8a]" />
                  ) : p.role === 'Délégué' ? (
                    <Megaphone className="h-20 w-20 text-[#0d9488]" />
                  ) : (
                    <Monitor className="h-20 w-20 text-white" />
                  )}
                </div>
                
                <Avatar name={p.name} size="lg" className="shadow-2xl" />

                {/* Bottom info */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-2 shadow-lg">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.role}</p>
                  </div>
                </div>

                {/* Audio status */}
                <div className="absolute top-3 right-3">
                  {p.audio ? (
                    <span className="rounded-lg bg-gradient-to-r from-[#0d9488] to-emerald-500 p-1.5 shadow-lg">
                      <Mic className="h-3.5 w-3.5 text-white" />
                    </span>
                  ) : (
                    <span className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 p-1.5 shadow-lg animate-pulse">
                      <MicOff className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-96 border-l border-[#1e3a8a]/20 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm flex flex-col animate-fade-in shadow-2xl">
            <div className="border-b border-[#1e3a8a]/20 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] shadow-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Chat en direct</h2>
                  <p className="text-xs text-white/60">{messages.length} messages</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg) => (
                <div key={msg.id} className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Avatar name={msg.name} size="xs" />
                    <span className={`text-xs font-bold ${msg.role === 'Enseignant' ? 'text-[#0d9488]' : msg.role === 'Délégué' ? 'text-purple-400' : 'text-slate-300'}`}>
                      {msg.name}
                    </span>
                    {msg.role === 'Enseignant' && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#0d9488]/20 text-[#0d9488] border border-[#0d9488]/30 font-bold">
                        PROF
                      </span>
                    )}
                    <span className="ml-auto text-[10px] text-slate-500 font-mono">{msg.time}</span>
                  </div>
                  <p className="ml-7 text-sm text-slate-200 bg-slate-800/40 rounded-2xl p-3 border border-slate-700/30 backdrop-blur-sm leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
            
            <form onSubmit={sendMessage} className="border-t border-[#1e3a8a]/20 p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 rounded-xl border border-[#1e3a8a]/20 bg-slate-800/50 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488]"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#2d4fa8] hover:to-[#14b8a8] disabled:opacity-40 px-4 py-3 text-white transition-all shadow-lg disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-center gap-4 border-t border-[#1e3a8a]/20 bg-gradient-to-r from-[#1e3a8a]/10 via-slate-900/50 to-[#0d9488]/10 backdrop-blur-xl px-6 py-5 shadow-2xl">
        <button onClick={() => setMicOn(!micOn)}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all shadow-lg hover:scale-110 ${
            micOn 
              ? 'bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] border border-[#0d9488]/50 text-white hover:shadow-xl' 
              : 'bg-gradient-to-br from-red-500 to-red-600 border border-red-400 text-white animate-pulse shadow-red-500/30'
          }`}>
          {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>
        
        <button onClick={() => setCameraOn(!cameraOn)}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all shadow-lg hover:scale-110 ${
            cameraOn 
              ? 'bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] border border-[#0d9488]/50 text-white hover:shadow-xl' 
              : 'bg-gradient-to-br from-red-500 to-red-600 border border-red-400 text-white animate-pulse shadow-red-500/30'
          }`}>
          {cameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </button>
        
        <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-lg hover:scale-110">
          <Hand className="h-6 w-6" />
        </button>
        
        <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-lg hover:scale-110">
          <Share2 className="h-6 w-6" />
        </button>
        
        <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-lg hover:scale-110">
          <Settings className="h-6 w-6" />
        </button>
        
        <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-lg hover:scale-110">
          <MoreHorizontal className="h-6 w-6" />
        </button>
        
        <div className="w-px h-10 bg-white/10 mx-2" />
        
        <button onClick={() => navigate('/app')} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-600 border border-red-400 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-xl shadow-red-500/30 hover:scale-110">
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
