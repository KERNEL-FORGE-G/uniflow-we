import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Video, VideoOff, Mic, MicOff, Settings, Users, Calendar,
  Clock, Lock, Globe, Copy, CheckCircle, Plus, LogIn, Sparkles,
  User, Shield
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { useUserRole } from '../utils/userRole'

export default function VideoLobbyPage() {
  const navigate = useNavigate()
  const { currentRole } = useUserRole()
  const [tab, setTab] = useState<'create' | 'join'>('join')
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [roomCode, setRoomCode] = useState('')
  const [roomName, setRoomName] = useState('')
  const [copied, setCopied] = useState(false)

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
      navigate('/app/visioconference')
    }
  }

  const handleCreateRoom = () => {
    if (roomName.trim()) {
      navigate('/app/visioconference')
    }
  }

  const userName = currentRole === 'teacher' ? 'Prof. Martin' : currentRole === 'delegate' ? 'Lucas (Délégué)' : 'Emma Martin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-950 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] shadow-xl">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                UniFlow Visioconférence
              </h1>
              <p className="text-sm text-white/60 mt-0.5">Créez ou rejoignez une réunion en ligne</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
          >
            Retour au tableau de bord
          </button>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="rounded-3xl bg-gradient-to-br from-[#1e3a8a]/20 via-slate-900/50 to-[#0d9488]/20 border border-[#1e3a8a]/30 backdrop-blur-sm p-6 shadow-2xl">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-[#0d9488]" />
                Aperçu vidéo
              </h2>

              {/* Video preview */}
              <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 overflow-hidden mb-4 flex items-center justify-center">
                {cameraOn ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/10 to-[#0d9488]/10" />
                    <Avatar name={userName} size="2xl" className="shadow-2xl" />
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50">
                      <VideoOff className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400">Caméra désactivée</p>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    {userName}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMicOn(!micOn)}
                      className={`rounded-xl p-2 transition-all ${
                        micOn
                          ? 'bg-gradient-to-r from-[#0d9488] to-emerald-500 text-white'
                          : 'bg-red-500 text-white animate-pulse'
                      }`}
                    >
                      {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setCameraOn(!cameraOn)}
                      className={`rounded-xl p-2 transition-all ${
                        cameraOn
                          ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white'
                          : 'bg-red-500 text-white animate-pulse'
                      }`}
                    >
                      {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Settings quick access */}
              <button className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-left hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] group-hover:scale-110 transition-transform">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Paramètres audio/vidéo</p>
                    <p className="text-xs text-white/60 mt-0.5">Micro, caméra, haut-parleurs</p>
                  </div>
                </div>
              </button>

              {/* Info cards */}
              <div className="mt-4 space-y-2">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center gap-3">
                  <Shield className="h-4 w-4 text-[#0d9488]" />
                  <p className="text-xs text-white/80">Connexion sécurisée end-to-end</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center gap-3">
                  <Globe className="h-4 w-4 text-[#0d9488]" />
                  <p className="text-xs text-white/80">Fonctionne en mode offline (LAN)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Create/Join */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-900/50 border border-[#1e3a8a]/30 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-[#1e3a8a]/20">
                <button
                  onClick={() => setTab('join')}
                  className={`flex-1 py-4 px-6 text-sm font-bold transition-all border-b-2 ${
                    tab === 'join'
                      ? 'border-[#0d9488] text-[#0d9488] bg-[#0d9488]/10'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Rejoindre une réunion
                  </div>
                </button>
                <button
                  onClick={() => setTab('create')}
                  className={`flex-1 py-4 px-6 text-sm font-bold transition-all border-b-2 ${
                    tab === 'create'
                      ? 'border-[#0d9488] text-[#0d9488] bg-[#0d9488]/10'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" />
                    Créer une réunion
                  </div>
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                {tab === 'join' ? (
                  <motion.div
                    key="join"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">Rejoindre une réunion</h3>
                      <p className="text-sm text-white/60">
                        Entrez le code de la réunion fourni par l'organisateur
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">Code de la réunion</label>
                        <input
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          placeholder="Ex: ABC123"
                          className="w-full rounded-2xl bg-slate-800/50 border border-[#1e3a8a]/30 px-6 py-4 text-lg font-mono text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] backdrop-blur-sm tracking-widest"
                          maxLength={6}
                        />
                      </div>

                      <button
                        onClick={handleJoinRoom}
                        disabled={!roomCode.trim()}
                        className="w-full rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-6 py-4 text-base font-bold text-white hover:from-[#2d4fa8] hover:to-[#14b8a8] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Rejoindre maintenant
                      </button>
                    </div>

                    {/* Recent meetings */}
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Réunions récentes</p>
                      <div className="space-y-2">
                        {[
                          { name: 'Cours Algorithmique L2', code: 'ALG204', time: 'Il y a 2 heures' },
                          { name: 'Réunion Projet Kernel Forge', code: 'KRN001', time: 'Hier à 15h30' },
                        ].map((meeting, i) => (
                          <button
                            key={i}
                            onClick={() => setRoomCode(meeting.code)}
                            className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-left hover:bg-white/10 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] group-hover:scale-110 transition-transform">
                                <Video className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{meeting.name}</p>
                                <p className="text-xs text-white/60 mt-0.5">Code: {meeting.code} • {meeting.time}</p>
                              </div>
                            </div>
                          </button>
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
                      <h3 className="text-xl font-black text-white mb-2">Créer une nouvelle réunion</h3>
                      <p className="text-sm text-white/60">
                        Configurez votre réunion et partagez le code avec les participants
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">Nom de la réunion</label>
                        <input
                          type="text"
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                          placeholder="Ex: Cours Algorithmique L2"
                          className="w-full rounded-2xl bg-slate-800/50 border border-[#1e3a8a]/30 px-6 py-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] backdrop-blur-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-white mb-2">Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                            <input
                              type="date"
                              className="w-full rounded-2xl bg-slate-800/50 border border-[#1e3a8a]/30 pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] backdrop-blur-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-white mb-2">Heure</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                            <input
                              type="time"
                              className="w-full rounded-2xl bg-slate-800/50 border border-[#1e3a8a]/30 pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] backdrop-blur-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Generated code */}
                      <div className="rounded-2xl bg-gradient-to-r from-[#1e3a8a]/20 to-[#0d9488]/20 border border-[#0d9488]/30 p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-[#0d9488]" />
                            <span className="text-xs font-bold text-white/80">Code de la réunion</span>
                          </div>
                          <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all"
                          >
                            {copied ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                Copié !
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                Copier
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-3xl font-black font-mono tracking-widest text-white text-center py-3">
                          {roomCode || '------'}
                        </p>
                        {!roomCode && (
                          <p className="text-xs text-center text-white/60 mt-2">
                            Un code sera généré automatiquement
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleCreateRoom}
                        disabled={!roomName.trim()}
                        className="w-full rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-6 py-4 text-base font-bold text-white hover:from-[#2d4fa8] hover:to-[#14b8a8] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-5 w-5" />
                        Créer et démarrer la réunion
                      </button>
                    </div>

                    {/* Info */}
                    <div className="pt-6 border-t border-white/10">
                      <div className="rounded-xl bg-blue-500/10 border border-blue-400/30 p-4">
                        <div className="flex gap-3">
                          <Users className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-blue-100 mb-1">Partage du code</p>
                            <p className="text-xs text-blue-200/80 leading-relaxed">
                              Partagez le code généré avec vos étudiants par email, SMS ou messagerie pour qu'ils rejoignent la réunion.
                            </p>
                          </div>
                        </div>
                      </div>
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
