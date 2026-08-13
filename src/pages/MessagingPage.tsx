import { useState, useRef, useEffect } from 'react'
import { Search, Plus, Phone, Video, Paperclip, Smile, Mic, Send, MoreHorizontal, X, AlertTriangle, UserCircle, Mail, Loader2 } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { AnimatedList } from '../components/ui/AnimatedList'
import { studentsApi, teachersApi } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const TYPING_DELAY = 1200

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
  const [isTyping, setIsTyping] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEmailInput, setNewEmailInput] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (active) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [active?.messages, isTyping])

  // Load real users from the backend + custom saved contacts
  useEffect(() => {
    async function loadContacts() {
      try {
        const [students, teachers] = await Promise.all([
          studentsApi.list().catch(() => []),
          teachersApi.list().catch(() => [])
        ])

        const list: Conversation[] = []

        // Load custom contacts added by email
        try {
          const customSaved = JSON.parse(localStorage.getItem('uniflow_custom_contacts') || '[]')
          if (Array.isArray(customSaved)) {
            list.push(...customSaved)
          }
        } catch {}

        // Add teachers
        teachers.forEach((t: any) => {
          const email = t.user?.email || `${t.firstName.toLowerCase()}.${t.lastName.toLowerCase()}@uniflow.edu`
          if (!list.some(c => c.email.toLowerCase() === email.toLowerCase())) {
            list.push({
              id: `teacher-${t.id}`,
              name: `${t.firstName} ${t.lastName}`,
              role: 'Enseignant',
              email,
              online: Math.random() > 0.5,
              time: '10:00',
              preview: 'Cliquez pour ouvrir la discussion',
              unread: 0,
              messages: [
                { id: 'm1', from: 'them', text: `Bonjour ! Contactez-moi directement via cette messagerie ou à l'adresse ${email}.`, time: '10:00' }
              ]
            })
          }
        })

        // Add students
        students.forEach((s: any) => {
          const email = s.user?.email || `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@uniflow.edu`
          if (!list.some(c => c.email.toLowerCase() === email.toLowerCase())) {
            list.push({
              id: `student-${s.id}`,
              name: `${s.firstName} ${s.lastName}`,
              role: s.status === 'delegate' || s.role === 'DELEGUE' ? 'Délégué' : 'Étudiant',
              email,
              online: Math.random() > 0.5,
              time: '09:30',
              preview: 'Cliquez pour ouvrir la discussion',
              unread: 0,
              messages: []
            })
          }
        })

        setConvos(list)
        if (list.length > 0) {
          setActive(list[0])
        }
      } catch (err) {
        console.error('Failed to load contacts', err)
      } finally {
        setLoading(false)
      }
    }
    loadContacts()
  }, [])

  // Add a contact by user email
  const handleAddContactByEmail = (e: React.FormEvent) => {
    e.preventDefault()
    const emailClean = newEmailInput.trim().toLowerCase()
    if (!emailClean) return

    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setAddError('Veuillez saisir une adresse e-mail valide (ex: nom@uniflow.edu).')
      return
    }

    // Check if contact already exists
    const existing = convos.find(c => c.email.toLowerCase() === emailClean)
    if (existing) {
      setActive(existing)
      setShowAddModal(false)
      setNewEmailInput('')
      setAddError(null)
      return
    }

    // Create new contact from email reference
    const namePart = emailClean.split('@')[0]
    const formattedName = namePart
      .split('.')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')

    const newConvo: Conversation = {
      id: `custom-${Date.now()}`,
      name: formattedName || emailClean,
      role: 'Contact Réseau',
      email: emailClean,
      online: true,
      time: 'À l\'instant',
      preview: 'Nouveau contact ajouté',
      unread: 0,
      messages: [
        { id: `m-${Date.now()}`, from: 'them', text: `Conversation démarrée avec ${emailClean}. Tapez votre message ci-dessous.`, time: 'À l\'instant' }
      ]
    }

    const updated = [newConvo, ...convos]
    setConvos(updated)
    setActive(newConvo)

    try {
      const customSaved = JSON.parse(localStorage.getItem('uniflow_custom_contacts') || '[]')
      localStorage.setItem('uniflow_custom_contacts', JSON.stringify([newConvo, ...customSaved]))
    } catch {}

    setShowAddModal(false)
    setNewEmailInput('')
    setAddError(null)
  }

  // Clear unread on select
  const selectConvo = (c: Conversation) => {
    setConvos(prev => prev.map(cv => cv.id === c.id ? { ...cv, unread: 0 } : cv))
    setActive({ ...c, unread: 0 })
    setIsTyping(false)
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !active) return
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
    const newMsg: Message = { id: Date.now().toString(), from: 'me', text: text.trim(), time }

    const updated = { ...active, messages: [...active.messages, newMsg], preview: text.trim(), time }
    setActive(updated)
    setConvos(prev => prev.map(c => c.id === active.id ? updated : c))
    setText('')

    // Simulate auto-reply after delay
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const replies = [
        'Merci pour votre message ! Je vous répondrai dès que possible.',
        'Bien reçu. N\'hésitez pas à m\'envoyer un e-mail officiel si c\'est urgent.',
        'D\'accord, je vérifie cela tout de suite.',
        'Je suis actuellement en cours, je vous reviens plus tard.',
        'Parfait, merci pour l\'information !',
      ]
      const replyText = replies[Math.floor(Math.random() * replies.length)]
      const replyTime = `${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}`
      const reply: Message = { id: (Date.now() + 1).toString(), from: 'them', text: replyText, time: replyTime }
      setActive(prev => {
        if (!prev) return null
        return { ...prev, messages: [...prev.messages, reply], preview: replyText }
      })
      setConvos(prev => prev.map(c => c.id === active.id ? { ...c, messages: [...c.messages, reply], preview: replyText } : c))
    }, TYPING_DELAY)
  }

  const filteredConvos = convos.filter(c => 
    !search || 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
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
              placeholder="Rechercher par nom ou e-mail..."
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
                + Ajouter par e-mail
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
                    <Avatar name={c.name} size="md" />
                    {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] ring-2 ring-white dark:ring-slate-900" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${c.unread > 0 ? 'font-bold text-[#111827] dark:text-white' : 'font-medium text-[#374151] dark:text-slate-200'}`}>{c.name}</p>
                      <span className="text-[10px] text-[#9ca3af] ml-1 shrink-0">{c.time}</span>
                    </div>
                    <p className="text-[10px] text-[#1e3a8a] dark:text-teal-400 font-semibold truncate">{c.email}</p>
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
                  <Avatar name={active.name} size="md" />
                  {active.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] ring-2 ring-white" />}
                </div>
                <div>
                  <p className="font-semibold text-[#111827]">{active.name}</p>
                  <div className="flex items-center gap-1.5">
                    {isTyping ? (
                      <span className="text-xs text-[#0d9488] font-medium flex items-center gap-1">
                        <span className="flex gap-0.5">
                          <span className="h-1 w-1 rounded-full bg-[#0d9488] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1 w-1 rounded-full bg-[#0d9488] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1 w-1 rounded-full bg-[#0d9488] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        est en train d'écrire...
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
                    src="https://i.imgur.com/GAiZ7WY.png" 
                    alt="" 
                    className="h-28 w-28 object-contain opacity-10 animate-pulse" 
                    onError={(e) => { e.currentTarget.src = '/logo_1.png' }}
                  />
                  <p className="text-xs text-[#9ca3af] mt-2 opacity-50">Commencez la conversation locale avec {active.name}…</p>
                </div>
              )}
              {/* Mascot watermark — toujours présente en fond, très discrète */}
              <div className="pointer-events-none select-none absolute bottom-4 right-4 opacity-[0.04]">
                <img 
                  src="https://i.imgur.com/GAiZ7WY.png" 
                  alt="" 
                  className="h-40 w-40 object-contain" 
                  onError={(e) => { e.currentTarget.src = '/logo_1.png' }}
                />
              </div>
              {active.messages.map(m => (
                <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {m.from === 'them' && <Avatar name={active.name} size="sm" className="mr-2 mt-1 shrink-0" />}
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
              {isTyping && (
                <div className="flex items-center gap-2">
                  <Avatar name={active.name} size="sm" />
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
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <button type="button" className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors">
                  <Smile className="h-5 w-5" />
                </button>
                <input value={text} onChange={e => setText(e.target.value)}
                  placeholder={`Écrire un message local ou cliquer sur l'enveloppe pour un e-mail réel...`}
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
            <Avatar name={active.name} size="xl" className="mx-auto" />
            <h3 className="mt-3 font-bold text-[#111827]">{active.name}</h3>
            <p className="text-xs text-[#6b7280]">{active.role}</p>
            {active.online && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#0d9488] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0d9488]" /> En ligne
              </span>
            )}
          </div>
          <dl className="space-y-3 text-sm border-t border-[#e5e7eb] pt-4">
            <div>
              <dt className="text-xs text-[#9ca3af]">Canal principal</dt>
              <dd className="font-bold text-[#1e3a8a] text-xs mt-0.5">E-mail institutionnel</dd>
            </div>
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

      {/* ── Modal Ajouter un Contact par E-mail ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a]/10 dark:bg-teal-500/10 text-[#1e3a8a] dark:text-teal-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Ajouter un contact</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Via l'adresse e-mail de l'utilisateur</p>
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

            <form onSubmit={handleAddContactByEmail} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Adresse e-mail de l'utilisateur
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={newEmailInput}
                    onChange={e => setNewEmailInput(e.target.value)}
                    placeholder="ex: dr.martin@uniflow.edu"
                    autoFocus
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#1e3a8a] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Le référent e-mail permet de connecter instantanément les étudiants, délégués et enseignants.
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

