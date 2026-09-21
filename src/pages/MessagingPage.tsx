import { useState, useRef, useEffect } from 'react'
import { Search, Plus, Phone, Video, Paperclip, Smile, Mic, Send, MoreHorizontal, X, AlertTriangle, UserCircle, Mail, Loader2, AtSign } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { AnimatedList } from '../components/ui/AnimatedList'
import { messagingApi, type ChatConversation, type ChatContact } from '../lib/api'
import { isOnline } from '../lib/offline/networkStatus'
import { isRetryableReplayError } from '../lib/offline/offlineModel'
import { queueMessage } from '../lib/offline/replayHandlers'
import { useNavigate } from 'react-router-dom'
import { useBottomEdge } from '../components/layout/CornerStack'

interface Message {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
  file?: string
}

interface Conversation {
  id: string
  name: string
  role: string
  email: string
  username?: string
  avatarFileId?: string
  online: boolean
  time: string
  preview: string
  unread: number
  messages: Message[]
}

export default function MessagingPage() {
  const navigate = useNavigate()
  const [convos, setConvos] = useState<Conversation[]>([])
  const [active, setActive] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [suggestions, setSuggestions] = useState<ChatContact[]>([])
  const [searchingContacts, setSearchingContacts] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [queuedNotice, setQueuedNotice] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Le panneau fait toute la hauteur et son composeur est collé en bas à
  // droite : le lanceur d'Uni recouvrait le bouton « Envoyer » (et le champ
  // sur petit écran). Déclaré pour toute la page, chargement compris, pour
  // que le lanceur ne clignote pas entre le spinner et la conversation.
  useBottomEdge('composer')

  // Auto-scroll to bottom
  useEffect(() => {
    if (active) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [active?.messages, isSending])

  // Load conversations from the real backend only.
  useEffect(() => {
    async function loadConversations() {
      try {
        const list = await messagingApi.conversations()
        const conversations = (list ?? []) as ChatConversation[]
        if (conversations.length > 0) {
          const first = conversations[0]
          await messagingApi.markRead(first.id)
          const refreshed = conversations.map((conversation, index) => index === 0 ? { ...conversation, unread: 0 } : conversation)
          setConvos(refreshed)
          setActive(refreshed[0])
        } else {
          setConvos([])
        }
      } catch (err) {
        setAddError(err instanceof Error ? err.message : 'Les conversations Appwrite sont indisponibles.')
      } finally {
        setLoading(false)
      }
    }
    loadConversations()
  }, [])

  // Recherche de contacts par pseudo pendant la frappe, pour éviter d'avoir à
  // connaître l'adresse e-mail exacte. Le terme est envoyé au serveur après une
  // courte pause, afin de ne pas déclencher un appel par caractère.
  useEffect(() => {
    const term = usernameInput.trim().replace(/^@/, '')
    if (!showAddModal || term.length < 2) {
      setSuggestions([])
      setSearchingContacts(false)
      return
    }
    let cancelled = false
    setSearchingContacts(true)
    const timer = setTimeout(async () => {
      try {
        const contacts = await messagingApi.searchContacts(term)
        if (!cancelled) setSuggestions(contacts)
      } catch {
        // Une recherche indisponible ne doit pas masquer la saisie manuelle :
        // l'utilisateur peut toujours valider le pseudo tel quel.
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setSearchingContacts(false)
      }
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [usernameInput, showAddModal])

  const openConversation = (conversation: ChatConversation) => {
    // La Function renvoie le profil complet : on le conserve tel quel pour que
    // l'avatar et le pseudo restent disponibles dans le fil.
    setConvos((previous) => previous.some((entry) => entry.id === conversation.id)
      ? previous.map((entry) => entry.id === conversation.id ? conversation : entry)
      : [conversation, ...previous])
    setActive(conversation)
    setIsSending(false)
  }

  const handleAddContactByUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    const username = usernameInput.trim().replace(/^@/, '')
    if (!username) return
    setAddError(null)
    try {
      openConversation(await messagingApi.openByUsername(username))
      setUsernameInput('')
      setSuggestions([])
      setShowAddModal(false)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Le contact universitaire n’a pas pu être ajouté.')
    }
  }

  const chooseSuggestion = async (contact: ChatContact) => {
    setAddError(null)
    setUsernameInput(`@${contact.username}`)
    setSuggestions([])
    try {
      openConversation(await messagingApi.openByUsername(contact.username))
      setUsernameInput('')
      setShowAddModal(false)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Le contact universitaire n’a pas pu être ajouté.')
    }
  }

  // Clear unread on select
  const selectConvo = (c: Conversation) => {
    setConvos(prev => prev.map(cv => cv.id === c.id ? { ...cv, unread: 0 } : cv))
    setActive({ ...c, unread: 0 })
    setIsSending(false)
    void messagingApi.markRead(c.id).catch((error: unknown) => setAddError(error instanceof Error ? error.message : 'Le marquage lu Appwrite a échoué.'))
  }

  // Hors ligne (ou réseau tombé pendant l'envoi), le message est mis en file
  // d'attente et partira au retour du réseau : perdre un message tapé était
  // le reproche le plus fréquent en zone à connexion instable.
  const deferMessage = async (conversationId: string, body: string) => {
    await queueMessage({ conversationId, text: body })
    setText('')
    setQueuedNotice('Hors ligne : le message partira automatiquement au retour du réseau.')
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || !active) return
    setIsSending(true)
    setAddError(null)
    setQueuedNotice(null)
    try {
      if (!isOnline()) {
        await deferMessage(active.id, body)
        return
      }
      const updated = await messagingApi.sendMessage(active.id, body)
      const conversation = updated as ChatConversation
      setActive(conversation)
      setConvos(prev => prev.map(c => c.id === conversation.id ? conversation : c))
      setText('')
    } catch (err: any) {
      if (isRetryableReplayError({ status: typeof err?.status === 'number' ? err.status : undefined, message: err?.message }, isOnline())) {
        await deferMessage(active.id, body)
      } else {
        setAddError(err?.message || 'Le message n’a pas pu être envoyé dans Appwrite.')
      }
    } finally {
      setIsSending(false)
    }
  }

  const filteredConvos = convos.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.username || '').toLowerCase().includes(search.toLowerCase().replace(/^@/, ''))
  )
  const totalUnread = convos.reduce((s, c) => s + c.unread, 0)

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-[#e5e7eb] dark:border-slate-800 shadow-sm">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] dark:text-teal-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Chargement des contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-[calc(100vh-5rem)] rounded-xl border border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden animate-fade-in">

      {/* ── Contacts sidebar ── */}
      <div className="flex w-72 shrink-0 flex-col border-r border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-slate-800 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[#111827] dark:text-white">Messages</h2>
            {totalUnread > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1e3a8a] text-[10px] font-bold text-white">{totalUnread}</span>
            )}
          </div>
          <button 
            type="button"
            onClick={() => { setShowAddModal(true); setAddError(null); }}
            className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] dark:bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d4fa8] dark:hover:bg-teal-500 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Nouveau
          </button>
        </div>
        <div className="border-b border-[#e5e7eb] dark:border-slate-800 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par pseudo, nom ou e-mail..."
              className="w-full rounded-lg border border-[#e5e7eb] dark:border-slate-700 bg-[#f9fafb] dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-[#1e3a8a] focus:bg-white dark:focus:bg-slate-900 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConvos.length === 0 ? (
            <div className="p-6 text-center">
              <Mail className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-slate-500">Aucun contact trouvé pour cette recherche.</p>
              <button
                type="button"
                onClick={() => { setShowAddModal(true); setAddError(null); }}
                className="mt-3 text-xs text-[#1e3a8a] dark:text-teal-400 font-bold hover:underline"
              >
                + Ajouter par pseudo
              </button>
            </div>
          ) : (
            <AnimatedList
              items={filteredConvos}
              onItemSelect={(c: Conversation) => selectConvo(c)}
              showGradients
              enableArrowNavigation
              displayScrollbar={false}
              className="max-h-full"
              renderItem={(c: Conversation, _index, isSelected) => (
                <button type="button"
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f9fafb] dark:hover:bg-slate-800/60 transition-colors border-b border-[#f3f4f6] dark:border-slate-800/80 ${isSelected ? 'bg-[#f0f4ff] dark:bg-teal-950/30 border-l-2 border-[#1e3a8a] dark:border-teal-400' : ''}`}>
                  <div className="relative shrink-0">
                    <Avatar name={c.name} avatarFileId={c.avatarFileId} size="md" />
                    {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] ring-2 ring-white dark:ring-slate-900" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${c.unread > 0 ? 'font-bold text-[#111827] dark:text-white' : 'font-medium text-[#374151] dark:text-slate-200'}`}>{c.name}</p>
                      <span className="text-[10px] text-[#9ca3af] ml-1 shrink-0">{c.time}</span>
                    </div>
                    <p className="text-[10px] text-[#1e3a8a] dark:text-teal-400 font-semibold truncate">{c.username ? `@${c.username}` : c.email}</p>
                    <p className={`text-xs truncate mt-0.5 ${c.unread > 0 ? 'text-[#374151] dark:text-slate-200 font-medium' : 'text-[#9ca3af]'}`}>{c.preview}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1e3a8a] dark:bg-teal-500 px-1.5 text-[10px] font-bold text-white shrink-0">{c.unread}</span>
                  )}
                </button>
              )}
            />
          )}
        </div>
      </div>

      {/* ── Chat window ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {active ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={active.name} avatarFileId={active.avatarFileId} size="md" />
                  {active.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] ring-2 ring-white" />}
                </div>
                <div>
                  <p className="font-semibold text-[#111827]">{active.name}</p>
                  <div className="flex items-center gap-1.5">
                    {isSending ? (
                      <span className="text-xs text-[#0d9488] font-medium flex items-center gap-1">
                        <span className="flex gap-0.5">
                          <span className="h-1 w-1 rounded-full bg-[#0d9488] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1 w-1 rounded-full bg-[#0d9488] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1 w-1 rounded-full bg-[#0d9488] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        Envoi sécurisé en cours…
                      </span>
                    ) : active.online ? (
                      <span className="flex items-center gap-1 text-xs text-[#10b981]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                        En ligne
                      </span>
                    ) : (
                      <span className="text-xs text-[#9ca3af]">Hors ligne</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a href={`mailto:${active.email}`} className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors" title="Envoyer un e-mail réel">
                  <Mail className="h-5 w-5" />
                </a>
                <button type="button" className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => navigate('/app/visio')}
                  className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors">
                  <Video className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setShowInfo(v => !v)}
                  className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="relative flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {active.messages.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <img 
                    src="/logos/uniflow-emblem.svg"
                    alt=""
                    className="h-28 w-28 object-contain opacity-10 animate-pulse" 
                    onError={(e) => { e.currentTarget.src = '/logo_1.png' }}
                  />
                  <p className="text-xs text-[#9ca3af] mt-2 opacity-50">Commencez la conversation avec {active.name}…</p>
                </div>
              )}
              {/* Mascot watermark — toujours présente en fond, très discrète */}
              <div className="pointer-events-none select-none absolute bottom-4 right-4 opacity-[0.04]">
                <img 
                  src="/logos/uniflow-emblem.svg"
                  alt=""
                  className="h-40 w-40 object-contain" 
                  onError={(e) => { e.currentTarget.src = '/logo_1.png' }}
                />
              </div>
              {active.messages.map(m => (
                <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {m.from === 'them' && <Avatar name={active.name} avatarFileId={active.avatarFileId} size="sm" className="mr-2 mt-1 shrink-0" />}
                  <div className={`max-w-sm ${m.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.from === 'me'
                        ? 'bg-[#1e3a8a] text-white rounded-br-sm'
                        : 'bg-[#f3f4f6] text-[#111827] rounded-bl-sm'
                    }`}>
                      <p>{m.text}</p>
                      {m.file && (
                        <div className={`mt-2 flex items-center gap-2 rounded-lg p-2 text-xs ${m.from === 'me' ? 'bg-white/20' : 'bg-white border border-[#e5e7eb]'}`}>
                          <Paperclip className="h-3.5 w-3.5 shrink-0" /> {m.file}
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] ${m.from === 'me' ? 'text-[#9ca3af] pr-1' : 'text-[#9ca3af] pl-1'}`}>{m.time}</span>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2">
                  <Avatar name={active.name} avatarFileId={active.avatarFileId} size="sm" />
                  <div className="bg-[#f3f4f6] rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="h-2 w-2 rounded-full bg-[#9ca3af] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>  {/* end messages list */}

            {/* Input */}
            <div className="border-t border-[#e5e7eb] px-4 py-3.5">
              {queuedNotice && (
                <p role="status" className="mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {queuedNotice}
                </p>
              )}
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <button type="button" className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors">
                  <Smile className="h-5 w-5" />
                </button>
                <input value={text} onChange={e => setText(e.target.value)}
                  placeholder={`Écrire un message à ${active.name}…`}
                  className="flex-1 rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition-all" />
                <button type="button" className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors">
                  <Mic className="h-5 w-5" />
                </button>
                <button type="submit" disabled={!text.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d4fa8] disabled:opacity-40 transition-colors">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-gray-500">
            <UserCircle className="h-16 w-16 text-gray-300 mb-2" />
            <p className="text-sm">Sélectionnez un contact pour commencer à discuter</p>
          </div>
        )}
      </div>

      {/* ── Contact info panel ── */}
      {showInfo && active && (
        <div className="hidden xl:flex w-64 shrink-0 flex-col border-l border-[#e5e7eb] p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-[#111827]">Infos</h3>
            <button onClick={() => setShowInfo(false)} className="rounded p-1 hover:bg-[#f3f4f6] text-[#9ca3af]"><X className="h-4 w-4" /></button>
          </div>
          <div className="text-center bg-[#f9fafb] p-4 rounded-2xl border border-[#e5e7eb] mb-5">
            <Avatar name={active.name} avatarFileId={active.avatarFileId} size="xl" className="mx-auto" />
            <h3 className="mt-3 font-bold text-[#111827]">{active.name}</h3>
            <p className="text-xs text-[#6b7280]">{active.role}</p>
            {active.username && (
              <p className="mt-0.5 text-xs font-semibold text-[#0d9488]">@{active.username}</p>
            )}
            {active.online && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#0d9488] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0d9488]" /> En ligne
              </span>
            )}
          </div>
          <dl className="space-y-3 text-sm border-t border-[#e5e7eb] pt-4">
            <div>
              <dt className="text-xs text-[#9ca3af]">Canal principal</dt>
              <dd className="font-bold text-[#1e3a8a] text-xs mt-0.5">{active.username ? 'Pseudo UniFlow' : 'E-mail institutionnel'}</dd>
            </div>
            {active.username && (
              <div>
                <dt className="text-xs text-[#9ca3af]">Pseudo</dt>
                <dd className="font-medium text-[#374151] text-xs mt-0.5 select-all">@{active.username}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-[#9ca3af]">Email</dt>
              <dd className="font-medium text-[#374151] text-xs mt-0.5 select-all break-all">{active.email}</dd>
            </div>
          </dl>
          <div className="mt-auto space-y-2 border-t border-[#e5e7eb] pt-4">
            <a href={`mailto:${active.email}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2d4fa8] px-4 py-2.5 text-xs font-bold text-white shadow hover:shadow-lg transition-all text-center">
              <Mail className="h-4 w-4" /> Envoyer un e-mail réel
            </a>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#dc2626] hover:bg-red-50 transition-colors">
              <AlertTriangle className="h-4 w-4" /> Signaler
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Ajouter un Contact par Pseudo ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a]/10 dark:bg-teal-500/10 text-[#1e3a8a] dark:text-teal-400">
                  <AtSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Ajouter un contact</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Par pseudo UniFlow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactByUsername} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Pseudo de l'utilisateur
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    placeholder="ex: @dr.martin"
                    autoFocus
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                  {searchingContacts && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                  )}
                </div>

                {/* Suggestions issues de la recherche serveur : évite d'avoir à
                    connaître le pseudo exact, et confirme que le compte existe. */}
                {suggestions.length > 0 && (
                  <ul className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                    {suggestions.map((contact) => (
                      <li key={contact.userId}>
                        <button
                          type="button"
                          onClick={() => chooseSuggestion(contact)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Avatar name={contact.name} avatarFileId={contact.avatarFileId} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{contact.name}</span>
                            <span className="block truncate text-xs text-[#0d9488]">
                              {contact.username ? `@${contact.username}` : contact.email}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Le pseudo relie instantanément les étudiants, délégués et enseignants. Saisissez au moins deux caractères pour voir les suggestions.
                </p>
              </div>

              {addError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 p-3 text-xs text-rose-600 dark:text-rose-300">
                  {addError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2d4fa8] dark:from-teal-600 dark:to-teal-500 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
                >
                  Démarrer la discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
