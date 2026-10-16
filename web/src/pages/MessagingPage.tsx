import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Plus,
  Phone,
  Video,
  Paperclip,
  Smile,
  Mic,
  Send,
  MoreHorizontal,
  X,
  AlertTriangle,
  UserCircle,
  Mail,
  Loader2,
  AtSign,
  Users,
  UserPlus,
  LogOut,
  Shield,
  Check,
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { AnimatedList } from '../components/ui/AnimatedList'
import {
  messagingApi,
  type ChatConversation,
  type ChatContact,
  type ChatGroupMember,
} from '../lib/api'
import { isOnline } from '../lib/offline/networkStatus'
import { isRetryableReplayError } from '../lib/offline/offlineModel'
import { queueMessage } from '../lib/offline/replayHandlers'
import { useNavigate } from 'react-router-dom'
import { useBottomEdge } from '../components/layout/CornerStack'

export default function MessagingPage() {
  const navigate = useNavigate()
  const [convos, setConvos] = useState<ChatConversation[]>([])
  const [active, setActive] = useState<ChatConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showInfo, setShowInfo] = useState(true)

  // Modale Nouveau Contact (par pseudo)
  const [showAddModal, setShowAddModal] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [suggestions, setSuggestions] = useState<ChatContact[]>([])
  const [searchingContacts, setSearchingContacts] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Modale Nouveau Groupe (façon WhatsApp)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [groupNameInput, setGroupNameInput] = useState('')
  const [groupDescInput, setGroupDescInput] = useState('')
  const [groupMemberQuery, setGroupMemberQuery] = useState('')
  const [groupSelectedMembers, setGroupSelectedMembers] = useState<ChatContact[]>([])
  const [groupSuggestions, setGroupSuggestions] = useState<ChatContact[]>([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [groupCreateError, setGroupCreateError] = useState<string | null>(null)

  // Modale Ajouter Membres au Groupe Existant
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [addMemberQuery, setAddMemberQuery] = useState('')
  const [addMemberSuggestions, setAddMemberSuggestions] = useState<ChatContact[]>([])
  const [isAddingMembers, setIsAddingMembers] = useState(false)

  // Membres détaillés du groupe actif
  const [activeGroupMembers, setActiveGroupMembers] = useState<ChatGroupMember[]>([])
  const [loadingGroupMembers, setLoadingGroupMembers] = useState(false)

  const [queuedNotice, setQueuedNotice] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useBottomEdge('composer')

  // Auto-scroll to bottom
  useEffect(() => {
    if (active) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [active?.messages, isSending])

  // Charger les conversations initiales
  const loadConversations = async () => {
    try {
      const list = await messagingApi.conversations()
      const conversations = (list ?? []) as ChatConversation[]
      setConvos(conversations)
      if (conversations.length > 0) {
        if (!active) {
          const first = conversations[0]
          await messagingApi.markRead(first.id)
          const refreshed = conversations.map((conversation, index) =>
            index === 0 ? { ...conversation, unread: 0 } : conversation
          )
          setConvos(refreshed)
          setActive(refreshed[0])
        }
      } else {
        setConvos([])
      }
    } catch (err) {
      setAddError(
        err instanceof Error
          ? err.message
          : 'Les conversations Appwrite sont indisponibles.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  // Charger les membres du groupe actif si c'est un groupe
  useEffect(() => {
    if (active?.isGroup && active.groupId) {
      setLoadingGroupMembers(true)
      messagingApi
        .groupInfo(active.groupId)
        .then((res) => {
          setActiveGroupMembers(res.members)
        })
        .catch(() => {
          setActiveGroupMembers([])
        })
        .finally(() => {
          setLoadingGroupMembers(false)
        })
    } else {
      setActiveGroupMembers([])
    }
  }, [active?.id, active?.isGroup, active?.groupId])

  // Recherche de contacts pour l'ajout individuel
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
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setSearchingContacts(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [usernameInput, showAddModal])

  // Recherche de contacts pour la création de groupe
  useEffect(() => {
    const term = groupMemberQuery.trim().replace(/^@/, '')
    if (!showCreateGroupModal || term.length < 2) {
      setGroupSuggestions([])
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const contacts = await messagingApi.searchContacts(term)
        if (!cancelled) {
          const selectedIds = new Set(groupSelectedMembers.map((m) => m.userId))
          setGroupSuggestions(contacts.filter((c) => !selectedIds.has(c.userId)))
        }
      } catch {
        if (!cancelled) setGroupSuggestions([])
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [groupMemberQuery, showCreateGroupModal, groupSelectedMembers])

  // Recherche pour inviter un membre dans un groupe existant
  useEffect(() => {
    const term = addMemberQuery.trim().replace(/^@/, '')
    if (!showAddMemberModal || term.length < 2) {
      setAddMemberSuggestions([])
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const contacts = await messagingApi.searchContacts(term)
        if (!cancelled) {
          const currentIds = new Set(activeGroupMembers.map((m) => m.userId))
          setAddMemberSuggestions(contacts.filter((c) => !currentIds.has(c.userId)))
        }
      } catch {
        if (!cancelled) setAddMemberSuggestions([])
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [addMemberQuery, showAddMemberModal, activeGroupMembers])

  const openConversation = (conversation: ChatConversation) => {
    setConvos((previous) =>
      previous.some((entry) => entry.id === conversation.id)
        ? previous.map((entry) => (entry.id === conversation.id ? conversation : entry))
        : [conversation, ...previous]
    )
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
      setAddError(err instanceof Error ? err.message : 'Le contact n’a pas pu être ajouté.')
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
      setAddError(err instanceof Error ? err.message : 'Le contact n’a pas pu être ajouté.')
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = groupNameInput.trim()
    if (!name) return
    setIsCreatingGroup(true)
    setGroupCreateError(null)
    try {
      const memberIdentifiers = groupSelectedMembers.map((m) =>
        m.username ? `@${m.username}` : m.userId
      )
      const groupConv = await messagingApi.createGroup(
        name,
        groupDescInput.trim(),
        memberIdentifiers
      )
      openConversation(groupConv)
      setGroupNameInput('')
      setGroupDescInput('')
      setGroupSelectedMembers([])
      setGroupMemberQuery('')
      setShowCreateGroupModal(false)
    } catch (err) {
      setGroupCreateError(
        err instanceof Error ? err.message : 'Impossible de créer le groupe.'
      )
    } finally {
      setIsCreatingGroup(false)
    }
  }

  const handleAddMemberToActiveGroup = async (contact: ChatContact) => {
    if (!active?.isGroup || !active.groupId) return
    setIsAddingMembers(true)
    try {
      const identifier = contact.username ? `@${contact.username}` : contact.userId
      const updated = await messagingApi.addGroupMembers(active.groupId, [identifier])
      openConversation(updated)
      // Recharger la liste des membres
      const info = await messagingApi.groupInfo(active.groupId)
      setActiveGroupMembers(info.members)
      setShowAddMemberModal(false)
      setAddMemberQuery('')
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'ajout du membre.")
    } finally {
      setIsAddingMembers(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!active?.isGroup || !active.groupId) return
    if (!confirm(`Voulez-vous vraiment quitter le groupe « ${active.name} » ?`)) return
    try {
      await messagingApi.leaveGroup(active.groupId)
      setConvos((prev) => prev.filter((c) => c.id !== active.id))
      setActive(null)
      await loadConversations()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Impossible de quitter le groupe.')
    }
  }

  const selectConvo = (c: ChatConversation) => {
    setConvos((prev) => prev.map((cv) => (cv.id === c.id ? { ...cv, unread: 0 } : cv)))
    setActive({ ...c, unread: 0 })
    setIsSending(false)
    void messagingApi.markRead(c.id).catch((error: unknown) =>
      setAddError(
        error instanceof Error ? error.message : 'Le marquage lu Appwrite a échoué.'
      )
    )
  }

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
      setConvos((prev) => prev.map((c) => (c.id === conversation.id ? conversation : c)))
      setText('')
    } catch (err: any) {
      if (
        isRetryableReplayError(
          {
            status: typeof err?.status === 'number' ? err.status : undefined,
            message: err?.message,
          },
          isOnline()
        )
      ) {
        await deferMessage(active.id, body)
      } else {
        setAddError(err?.message || 'Le message n’a pas pu être envoyé dans Appwrite.')
      }
    } finally {
      setIsSending(false)
    }
  }

  const filteredConvos = convos.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.username || '').toLowerCase().includes(search.toLowerCase().replace(/^@/, '')) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalUnread = convos.reduce((s, c) => s + c.unread, 0)

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-[#e5e7eb] dark:border-slate-800 shadow-sm">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] dark:text-teal-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Chargement des messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-[calc(100vh-5rem)] rounded-xl border border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden animate-fade-in">
      {/* ── Barre latérale ── */}
      <div className="flex w-80 shrink-0 flex-col border-r border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-slate-800 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[#111827] dark:text-white">Messages</h2>
            {totalUnread > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1e3a8a] text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(true)
                setAddError(null)
              }}
              title="Nouvelle discussion directe par @pseudo"
              className="flex items-center gap-1 rounded-lg bg-[#1e3a8a] dark:bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2d4fa8] dark:hover:bg-teal-500 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Direct
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateGroupModal(true)
                setGroupCreateError(null)
              }}
              title="Créer un groupe style WhatsApp (sans limite de membres)"
              className="flex items-center gap-1 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-xs"
            >
              <Users className="h-3.5 w-3.5" /> Groupe
            </button>
          </div>
        </div>

        <div className="border-b border-[#e5e7eb] dark:border-slate-800 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher contact, @pseudo ou groupe..."
              className="w-full rounded-lg border border-[#e5e7eb] dark:border-slate-700 bg-[#f9fafb] dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-[#1e3a8a] focus:bg-white dark:focus:bg-slate-900 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvos.length === 0 ? (
            <div className="p-6 text-center">
              <Mail className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Aucune conversation trouvée.
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="text-xs text-[#1e3a8a] dark:text-teal-400 font-bold hover:underline"
                >
                  + Par pseudo
                </button>
                <span className="text-xs text-slate-400">·</span>
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(true)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  + Créer un groupe
                </button>
              </div>
            </div>
          ) : (
            <AnimatedList
              items={filteredConvos}
              onItemSelect={(c: ChatConversation) => selectConvo(c)}
              showGradients
              enableArrowNavigation
              displayScrollbar={false}
              className="max-h-full"
              renderItem={(c: ChatConversation, _index, isSelected) => (
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f9fafb] dark:hover:bg-slate-800/60 transition-colors border-b border-[#f3f4f6] dark:border-slate-800/80 ${
                    isSelected
                      ? 'bg-[#f0f4ff] dark:bg-teal-950/30 border-l-2 border-[#1e3a8a] dark:border-teal-400'
                      : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    {c.isGroup ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                        <Users className="h-5 w-5" />
                      </div>
                    ) : (
                      <>
                        <Avatar name={c.name} avatarFileId={c.avatarFileId} size="md" />
                        {c.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          c.unread > 0
                            ? 'font-bold text-[#111827] dark:text-white'
                            : 'font-medium text-[#374151] dark:text-slate-200'
                        }`}
                      >
                        {c.name}
                      </p>
                      <span className="text-[10px] text-[#9ca3af] ml-1 shrink-0">{c.time}</span>
                    </div>
                    {c.isGroup ? (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate flex items-center gap-1">
                        <Users className="h-2.5 w-2.5" />
                        Groupe · {c.memberCount ?? 1} membre{c.memberCount && c.memberCount > 1 ? 's' : ''}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#1e3a8a] dark:text-teal-400 font-semibold truncate">
                        {c.username ? `@${c.username}` : c.email}
                      </p>
                    )}
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        c.unread > 0
                          ? 'text-[#374151] dark:text-slate-200 font-medium'
                          : 'text-[#9ca3af]'
                      }`}
                    >
                      {c.preview}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1e3a8a] dark:bg-teal-500 px-1.5 text-[10px] font-bold text-white shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              )}
            />
          )}
        </div>
      </div>

      {/* ── Fenêtre de discussion ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {active ? (
          <>
            {/* Header de discussion */}
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {active.isGroup ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                      <Users className="h-5 w-5" />
                    </div>
                  ) : (
                    <>
                      <Avatar name={active.name} avatarFileId={active.avatarFileId} size="md" />
                      {active.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] ring-2 ring-white" />
                      )}
                    </>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#111827] dark:text-white">{active.name}</p>
                    {active.isGroup && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        Groupe
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isSending ? (
                      <span className="text-xs text-[#0d9488] font-medium flex items-center gap-1">
                        <span className="flex gap-0.5">
                          <span
                            className="h-1 w-1 rounded-full bg-[#0d9488] animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="h-1 w-1 rounded-full bg-[#0d9488] animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="h-1 w-1 rounded-full bg-[#0d9488] animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </span>
                        Envoi en cours…
                      </span>
                    ) : active.isGroup ? (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {active.memberCount ?? activeGroupMembers.length} membres
                        {active.description ? ` · ${active.description}` : ''}
                      </span>
                    ) : active.online ? (
                      <span className="flex items-center gap-1 text-xs text-[#10b981]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                        En ligne
                      </span>
                    ) : (
                      <span className="text-xs text-[#9ca3af]">
                        {active.username ? `@${active.username}` : 'Hors ligne'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {active.isGroup ? (
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" /> Inviter
                  </button>
                ) : (
                  <>
                    <a
                      href={`mailto:${active.email}`}
                      className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors"
                      title="Envoyer un e-mail réel"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/app/visio')}
                      className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowInfo((v) => !v)}
                  className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors"
                  title="Détails"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Liste des messages */}
            <div className="relative flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {active.messages.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <img
                    src="/logos/uniflow-emblem.svg"
                    alt=""
                    className="h-28 w-28 object-contain opacity-10 animate-pulse"
                    onError={(e) => {
                      e.currentTarget.src = '/logo_1.png'
                    }}
                  />
                  <p className="text-xs text-[#9ca3af] mt-2 opacity-50">
                    {active.isGroup
                      ? `Bienvenue dans le groupe « ${active.name} ». Envoyez le premier message !`
                      : `Commencez la conversation avec ${active.name}…`}
                  </p>
                </div>
              )}

              {active.messages.map((m) => {
                const isMe = m.from === 'me'
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="mr-2 mt-1 shrink-0">
                        <Avatar
                          name={m.senderName || active.name}
                          avatarFileId={m.senderAvatar || active.avatarFileId}
                          size="sm"
                        />
                      </div>
                    )}
                    <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {/* Affichage du nom de l'expéditeur dans un groupe style WhatsApp */}
                      {active.isGroup && !isMe && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pl-1">
                          {m.senderName || 'Membre'}
                          {m.senderUsername ? ` (@${m.senderUsername})` : ''}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? 'bg-[#1e3a8a] text-white rounded-br-sm'
                            : 'bg-[#f3f4f6] dark:bg-slate-800 text-[#111827] dark:text-slate-100 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        {m.file && (
                          <div
                            className={`mt-2 flex items-center gap-2 rounded-lg p-2 text-xs ${
                              isMe
                                ? 'bg-white/20'
                                : 'bg-white dark:bg-slate-700 border border-[#e5e7eb] dark:border-slate-600'
                            }`}
                          >
                            <Paperclip className="h-3.5 w-3.5 shrink-0" /> {m.file}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-[#9ca3af] px-1">{m.time}</span>
                    </div>
                  </div>
                )
              })}

              {isSending && (
                <div className="flex items-center gap-2">
                  <div className="bg-[#f3f4f6] dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-[#9ca3af] animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Champ d'envoi */}
            <div className="border-t border-[#e5e7eb] dark:border-slate-800 px-4 py-3.5">
              {queuedNotice && (
                <p
                  role="status"
                  className="mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"
                >
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {queuedNotice}
                </p>
              )}
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-slate-800 hover:text-[#374151] transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-slate-800 hover:text-[#374151] transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </button>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    active.isGroup
                      ? `Écrire dans le groupe ${active.name}…`
                      : `Écrire un message à ${active.name}…`
                  }
                  className="flex-1 rounded-lg border border-[#e5e7eb] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-slate-800 dark:text-slate-100 transition-all"
                />
                <button
                  type="button"
                  className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-slate-800 hover:text-[#374151] transition-colors"
                >
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] dark:hover:bg-teal-500 disabled:opacity-40 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-gray-500">
            <UserCircle className="h-16 w-16 text-gray-300 dark:text-slate-700 mb-2" />
            <p className="text-sm">Sélectionnez une conversation ou un groupe pour discuter</p>
          </div>
        )}
      </div>

      {/* ── Panneau latéral d'informations ── */}
      {showInfo && active && (
        <div className="hidden xl:flex w-72 shrink-0 flex-col border-l border-[#e5e7eb] dark:border-slate-800 p-5 overflow-y-auto bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#111827] dark:text-white">
              {active.isGroup ? 'Infos du groupe' : 'Infos du contact'}
            </h3>
            <button
              onClick={() => setShowInfo(false)}
              className="rounded p-1 hover:bg-[#f3f4f6] dark:hover:bg-slate-800 text-[#9ca3af]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {active.isGroup ? (
            <>
              <div className="text-center bg-[#f9fafb] dark:bg-slate-800/60 p-4 rounded-2xl border border-[#e5e7eb] dark:border-slate-800 mb-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mt-3 font-bold text-[#111827] dark:text-white">{active.name}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Groupe WhatsApp UniFlow
                </p>
                {active.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
                    {active.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Membres ({activeGroupMembers.length || active.memberCount || 1})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  <Plus className="h-3 w-3" /> Inviter
                </button>
              </div>

              <div className="space-y-2 mb-6">
                {loadingGroupMembers ? (
                  <p className="text-xs text-slate-400 py-2">Chargement des membres...</p>
                ) : (
                  activeGroupMembers.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60"
                    >
                      <Avatar name={member.name} avatarFileId={member.avatarFileId} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                          {member.username ? `@${member.username}` : member.role}
                        </p>
                      </div>
                      {member.role === 'admin' && (
                        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          <Shield className="h-2.5 w-2.5" /> Admin
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLeaveGroup}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 px-3 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Quitter le groupe
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center bg-[#f9fafb] dark:bg-slate-800/60 p-4 rounded-2xl border border-[#e5e7eb] dark:border-slate-800 mb-5">
                <Avatar
                  name={active.name}
                  avatarFileId={active.avatarFileId}
                  size="xl"
                  className="mx-auto"
                />
                <h3 className="mt-3 font-bold text-[#111827] dark:text-white">{active.name}</h3>
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
              <dl className="space-y-3 text-sm border-t border-[#e5e7eb] dark:border-slate-800 pt-4">
                <div>
                  <dt className="text-xs text-[#9ca3af]">Canal principal</dt>
                  <dd className="font-bold text-[#1e3a8a] dark:text-teal-400 text-xs mt-0.5">
                    {active.username ? 'Pseudo UniFlow' : 'E-mail'}
                  </dd>
                </div>
                {active.username && (
                  <div>
                    <dt className="text-xs text-[#9ca3af]">Pseudo</dt>
                    <dd className="font-medium text-[#374151] dark:text-slate-300 text-xs mt-0.5 select-all">
                      @{active.username}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-[#9ca3af]">Email</dt>
                  <dd className="font-medium text-[#374151] dark:text-slate-300 text-xs mt-0.5 select-all break-all">
                    {active.email}
                  </dd>
                </div>
              </dl>
              <div className="mt-auto space-y-2 border-t border-[#e5e7eb] dark:border-slate-800 pt-4">
                <a
                  href={`mailto:${active.email}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2d4fa8] px-4 py-2.5 text-xs font-bold text-white shadow hover:shadow-lg transition-all text-center"
                >
                  <Mail className="h-4 w-4" /> Envoyer un e-mail réel
                </a>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Modale Ajouter un Contact par Pseudo ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a]/10 dark:bg-teal-500/10 text-[#1e3a8a] dark:text-teal-400">
                  <AtSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    Ajouter un contact
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Discussion directe par @pseudo
                  </p>
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
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="ex: @tchinda.legrand"
                    autoFocus
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                  {searchingContacts && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                  )}
                </div>

                {suggestions.length > 0 && (
                  <ul className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                    {suggestions.map((contact) => (
                      <li key={contact.userId}>
                        <button
                          type="button"
                          onClick={() => chooseSuggestion(contact)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Avatar
                            name={contact.name}
                            avatarFileId={contact.avatarFileId}
                            size="sm"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                              {contact.name}
                            </span>
                            <span className="block truncate text-xs text-[#0d9488]">
                              {contact.username ? `@${contact.username}` : contact.email}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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

      {/* ── Modale Créer un Groupe (WhatsApp) ── */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    Créer un groupe de discussion
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Style WhatsApp · Aucune limite de membres
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nom du groupe *
                </label>
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  placeholder="ex: Promotion ICT4D - Yaoundé I"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description du groupe
                </label>
                <textarea
                  value={groupDescInput}
                  onChange={(e) => setGroupDescInput(e.target.value)}
                  placeholder="Objectif du groupe, règles ou informations clés..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Inviter des membres par @pseudo
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={groupMemberQuery}
                    onChange={(e) => setGroupMemberQuery(e.target.value)}
                    placeholder="Tapez un pseudo pour ajouter un membre..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:bg-white transition-all"
                  />
                </div>

                {groupSuggestions.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                    {groupSuggestions.map((contact) => (
                      <li key={contact.userId}>
                        <button
                          type="button"
                          onClick={() => {
                            setGroupSelectedMembers((prev) => [...prev, contact])
                            setGroupMemberQuery('')
                            setGroupSuggestions([])
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={contact.name}
                              avatarFileId={contact.avatarFileId}
                              size="sm"
                            />
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                {contact.name}
                              </p>
                              <p className="text-[10px] text-emerald-600">
                                {contact.username ? `@${contact.username}` : contact.email}
                              </p>
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-emerald-600" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Membres sélectionnés sous forme de chips */}
                {groupSelectedMembers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {groupSelectedMembers.map((member) => (
                      <span
                        key={member.userId}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 pl-2.5 pr-1.5 py-1 text-xs text-emerald-800 dark:text-emerald-300"
                      >
                        <span className="font-medium">
                          {member.username ? `@${member.username}` : member.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setGroupSelectedMembers((prev) =>
                              prev.filter((m) => m.userId !== member.userId)
                            )
                          }
                          className="rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {groupCreateError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-600">
                  {groupCreateError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup || !groupNameInput.trim()}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  {isCreatingGroup ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Création...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Créer le groupe
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modale Inviter un Membre au Groupe Actif ── */}
      {showAddMemberModal && active?.isGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    Inviter dans « {active.name} »
                  </h3>
                  <p className="text-xs text-slate-500">Par @pseudo ou par nom</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={addMemberQuery}
                  onChange={(e) => setAddMemberQuery(e.target.value)}
                  placeholder="Tapez au moins 2 caractères..."
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 transition-all"
                />
              </div>

              {addMemberSuggestions.length > 0 && (
                <ul className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {addMemberSuggestions.map((contact) => (
                    <li key={contact.userId}>
                      <button
                        type="button"
                        disabled={isAddingMembers}
                        onClick={() => handleAddMemberToActiveGroup(contact)}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={contact.name}
                            avatarFileId={contact.avatarFileId}
                            size="sm"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {contact.name}
                            </p>
                            <p className="text-[10px] text-emerald-600">
                              {contact.username ? `@${contact.username}` : contact.email}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700">
                          <Plus className="h-3 w-3" /> Ajouter
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
