import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { RotateCcw, SendHorizontal, Sparkles, Trash2, Volume2, VolumeX, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { executeAssistantAction } from '@/lib/appwrite'
import { GUEST_GREETING, GUEST_SUGGESTIONS, guestReply, type GuestLink } from '@/lib/assistantGuest'
import { UniMascot } from '@/components/mascot/UniMascot'
import {
  ASSISTANT_NAME,
  clearMessages,
  historyForServer,
  loadMessages,
  makeMessage,
  renderMarkdownLite,
  saveMessages,
  type AssistantMessage,
} from '@/lib/assistant'
import { loadVoicePreference, saveVoicePreference, speak, speechSupported, stopSpeaking } from '@/lib/speech'
import { useUserRole } from '@/utils/userRole'
import { UniAvatar, type UniMood } from './UniAvatar'

/**
 * Uni, l'assistant UniFlow — bulle flottante disponible partout : espace
 * connecté (étudiant, enseignant, administration, compte indépendant) et site
 * public. Sans compte, Uni est un guide scripté (`assistantGuest.ts`) : il
 * présente, oriente et invite à se connecter, sans consommer la clé Gemini.
 *
 * Remplace le compagnon « Nova » (scripté, scène 3D three.js de 870 Ko qui
 * ne répondait à rien). Uni parle vraiment : le service `/assistant` de la
 * Function `uniflow-api` interroge Gemini 3.1 Flash-Lite avec le profil et
 * l'emploi du temps du jour de l'utilisateur ; aucune clé ne transite ici.
 * La synthèse vocale (Web Speech API) se coupe et se rallume depuis l'en-tête.
 */

const DEFAULT_GREETING = `Bonjour ! Je suis ${ASSISTANT_NAME}, l'assistant UniFlow. Pose-moi une question sur tes cours, ton emploi du temps ou la plateforme.`
const DEFAULT_SUGGESTIONS = ["Quels cours ai-je aujourd'hui ?", 'Comment scanner ma présence ?', 'Que fait UniFlow ?']
const HELLO_KEY = 'uniflow:uni-hello'

function MessageBody({ content }: { content: string }) {
  const blocks = useMemo(() => renderMarkdownLite(content), [content])
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => block.kind === 'list' ? (
        <ul key={index} className="list-disc space-y-1 pl-4">
          {block.items.map((parts, i) => (
            <li key={i}>{parts.map((p, j) => (p.bold ? <strong key={j} className="font-semibold">{p.text}</strong> : <span key={j}>{p.text}</span>))}</li>
          ))}
        </ul>
      ) : (
        <p key={index}>{block.parts.map((p, j) => (p.bold ? <strong key={j} className="font-semibold">{p.text}</strong> : <span key={j}>{p.text}</span>))}</p>
      ))}
    </div>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1" aria-label={`${ASSISTANT_NAME} rédige une réponse`} role="status">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-[#0d9488]"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </span>
  )
}

export function UniAssistant() {
  const { authUser, currentUser } = useUserRole()
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion() ?? false
  const userId = authUser?.id ?? ''
  const storage = typeof window !== 'undefined' ? window.localStorage : undefined

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS)
  // Identité à laquelle appartient `messages` (voir l'effet d'accueil).
  const [owner, setOwner] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unread, setUnread] = useState(false)
  const [voiceOn, setVoiceOn] = useState(() => loadVoicePreference(storage))
  const [speaking, setSpeaking] = useState(false)
  const [justGreeted, setJustGreeted] = useState(false)
  const [links, setLinks] = useState<GuestLink[]>([])
  const [hello, setHello] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const greeted = useRef(false)
  const canSpeak = speechSupported()
  const guest = !userId

  const mood: UniMood = pending ? 'thinking' : speaking ? 'speaking' : justGreeted ? 'happy' : 'idle'

  // Bulle d'accueil : une fois par session, quelques secondes, jamais si le panneau est ouvert.
  useEffect(() => {
    if (isOpen) { setHello(false); return }
    try { if (window.sessionStorage.getItem(HELLO_KEY)) return } catch { /* stockage indisponible */ }
    const show = window.setTimeout(() => {
      setHello(true)
      try { window.sessionStorage.setItem(HELLO_KEY, '1') } catch { /* ignoré */ }
    }, 5000)
    return () => window.clearTimeout(show)
  }, [isOpen])
  useEffect(() => {
    if (!hello) return
    const hide = window.setTimeout(() => setHello(false), 7000)
    return () => window.clearTimeout(hide)
  }, [hello])

  // La conversation suit le compte : changer d'utilisateur (ou se déconnecter)
  // recharge la sienne et remet les suggestions du bon profil — sinon un
  // visiteur voyait encore « Comment créer un compte enseignant ? » après la
  // déconnexion d'une administration.
  useEffect(() => {
    setMessages(loadMessages(storage, userId))
    setOwner(userId)
    setSuggestions(userId ? DEFAULT_SUGGESTIONS : GUEST_SUGGESTIONS)
    greeted.current = false
  }, [storage, userId])

  useEffect(() => {
    if (userId) saveMessages(storage, userId, messages)
  }, [messages, storage, userId])

  useEffect(() => {
    if (!isOpen) return
    const node = listRef.current
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [messages, pending, isOpen, reduceMotion])

  // Fermer la fenêtre coupe la voix : personne ne veut d'une lecture fantôme.
  useEffect(() => {
    if (!isOpen) { stopSpeaking(); setSpeaking(false) }
  }, [isOpen])
  useEffect(() => () => stopSpeaking(), [])

  const say = useCallback((text: string) => {
    if (!voiceOn || !canSpeak) return
    speak(text, setSpeaking)
  }, [canSpeak, voiceOn])

  useEffect(() => {
    // `owner !== userId` : la conversation affichée est encore celle du compte
    // précédent (même commit que le rechargement) ; on attend le rendu suivant,
    // sinon l'accueil du nouveau profil sautait après une déconnexion.
    if (!isOpen || greeted.current || owner !== userId) return
    greeted.current = true
    setUnread(false)
    setJustGreeted(true)
    const timer = window.setTimeout(() => setJustGreeted(false), 1000)
    if (messages.length > 0) return () => window.clearTimeout(timer)
    if (guest) {
      setMessages([makeMessage('assistant', GUEST_GREETING, { local: true })])
      setSuggestions(GUEST_SUGGESTIONS)
      say(GUEST_GREETING)
      return () => window.clearTimeout(timer)
    }
    let cancelled = false
    ;(async () => {
      let greeting = DEFAULT_GREETING
      try {
        const hello = await executeAssistantAction({ action: 'hello', platform: 'web' })
        if (cancelled) return
        greeting = hello.greeting || DEFAULT_GREETING
        if (hello.suggestions?.length) setSuggestions(hello.suggestions)
      } catch {
        if (cancelled) return
      }
      setMessages([makeMessage('assistant', greeting, { local: true })])
      say(greeting)
    })()
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [guest, isOpen, messages.length, owner, say, userId])

  const send = useCallback(async (text: string) => {
    const content = text.trim()
    if (!content || pending) return
    setError(null)
    setDraft('')
    stopSpeaking()
    const userTurn = makeMessage('user', content)
    const next = [...messages, userTurn]
    setMessages(next)
    if (guest) {
      // Guide local : petite pause pour que la réponse « arrive », comme une vraie.
      setPending(true)
      const reply = guestReply(content)
      window.setTimeout(() => {
        setMessages((current) => [...current, makeMessage('assistant', reply.text, { local: true })])
        setLinks(reply.links)
        setSuggestions(GUEST_SUGGESTIONS.filter((item) => item !== content))
        setPending(false)
        say(reply.text)
      }, 450)
      return
    }
    setPending(true)
    try {
      const response = await executeAssistantAction({ action: 'chat', messages: historyForServer(next), platform: 'web', voice: voiceOn && canSpeak })
      const reply = response.reply || '…'
      setMessages((current) => [...current, makeMessage('assistant', reply)])
      if (response.suggestions?.length) setSuggestions(response.suggestions)
      if (!isOpen) setUnread(true)
      say(reply)
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : `${ASSISTANT_NAME} n'a pas pu répondre.`
      setError(message)
      setMessages((current) => current.map((m) => (m.id === userTurn.id ? { ...m, failed: true } : m)))
    } finally {
      setPending(false)
      inputRef.current?.focus()
    }
  }, [canSpeak, guest, isOpen, messages, pending, say, voiceOn])

  const retryLast = useCallback(() => {
    const failed = [...messages].reverse().find((m) => m.failed && m.role === 'user')
    if (!failed) return
    setMessages((current) => current.filter((m) => m.id !== failed.id))
    void send(failed.content)
  }, [messages, send])

  const reset = useCallback(() => {
    stopSpeaking()
    clearMessages(storage, userId)
    setMessages([])
    setError(null)
    setLinks([])
    setSuggestions(guest ? GUEST_SUGGESTIONS : DEFAULT_SUGGESTIONS)
    greeted.current = false
    // Relance l'accueil (et les suggestions du rôle) sans fermer le panneau.
    setIsOpen(false)
    window.setTimeout(() => setIsOpen(true), 0)
  }, [guest, storage, userId])

  const toggleVoice = useCallback(() => {
    setVoiceOn((current) => {
      const next = !current
      saveVoicePreference(storage, next)
      if (!next) { stopSpeaking(); setSpeaking(false) }
      else {
        const last = [...messages].reverse().find((m) => m.role === 'assistant')
        if (last) speak(last.content, setSpeaking)
      }
      return next
    })
  }, [messages, storage])

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(draft)
    }
  }

  // La grille de l'emploi du temps garde tout l'écran ; Uni reste accessible partout ailleurs.
  if (pathname === '/app/emploi-du-temps' && !isOpen) return null

  const showSuggestions = !pending && (guest ? suggestions.length > 0 : messages.filter((m) => !m.local).length === 0)
  const stagePose = pending ? 'thinking' : error ? 'sorry' : guest ? 'wave' : justGreeted ? 'celebrate' : 'headset'
  const showStage = messages.filter((m) => m.role === 'user').length === 0

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Le panneau au-dessus ; en bas, la bulle d'accueil à gauche du bouton. */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="false"
            aria-label={`${ASSISTANT_NAME}, assistant UniFlow`}
            className="flex h-[min(34rem,calc(100vh-7.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-[#dce5fd] bg-white shadow-[0_24px_64px_rgba(30,58,138,0.28)]"
          >
            <header className="flex items-center gap-3 bg-gradient-to-r from-[#152a66] via-[#1e3a8a] to-[#0d9488] px-4 py-3 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25"><UniAvatar size={34} mood={mood} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold leading-tight">{ASSISTANT_NAME} · Assistant UniFlow</p>
                <p className="flex items-center gap-1 text-[11px] text-cyan-100">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${pending ? 'bg-amber-300' : speaking ? 'bg-cyan-200' : 'bg-emerald-300'}`} aria-hidden="true" />
                  {pending ? 'Réfléchit…' : speaking ? 'Parle…' : guest ? 'Guide visiteur · connectez-vous pour plus' : 'En ligne · Gemini 3.1 Flash-Lite'}
                </p>
              </div>
              {canSpeak && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-pressed={voiceOn}
                  className={`rounded-lg p-1.5 transition hover:bg-white/15 ${voiceOn ? 'text-white' : 'text-white/60'}`}
                  aria-label={voiceOn ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'}
                  title={voiceOn ? 'Voix activée' : 'Voix désactivée'}
                >
                  {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              )}
              <button type="button" onClick={reset} className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white" aria-label="Effacer la conversation" title="Effacer la conversation">
                <Trash2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white" aria-label="Fermer l’assistant">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-[#f3f4f6] px-3 py-4" aria-live="polite">
              {showStage && (
                <div className="flex justify-center pb-1 pt-2">
                  {/* Uni en pied, animé : il salue le visiteur, écoute l'utilisateur, réfléchit, s'excuse. */}
                  <UniMascot pose={stagePose} size={118} />
                </div>
              )}
              {messages.map((message) => {
                const mine = message.role === 'user'
                return (
                  <motion.div
                    key={message.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!mine && <UniAvatar size={26} className="mb-0.5" mood="idle" />}
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${mine
                        ? `rounded-br-md bg-[#1e3a8a] text-white ${message.failed ? 'opacity-60 ring-2 ring-[#ef4444]/50' : ''}`
                        : 'rounded-bl-md border border-[#e5e7eb] bg-white text-[#111827]'}`}
                    >
                      <MessageBody content={message.content} />
                    </div>
                  </motion.div>
                )
              })}
              {pending && (
                <div className="flex items-end gap-2">
                  <UniAvatar size={26} className="mb-0.5" mood="thinking" />
                  <div className="rounded-2xl rounded-bl-md border border-[#e5e7eb] bg-white px-3 py-2.5 shadow-sm"><TypingDots /></div>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#991b1b]" role="alert">
                  {!showStage && <UniMascot pose="sorry" size={44} safe effects={false} />}
                  <span className="min-w-0 flex-1">{error}</span>
                  <button type="button" onClick={retryLast} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-2 py-1 font-semibold text-[#991b1b] ring-1 ring-[#fecaca] transition hover:bg-[#fee2e2]">
                    <RotateCcw className="h-3 w-3" />Réessayer
                  </button>
                </div>
              )}
              {guest && links.length > 0 && !pending && (
                <div className="flex flex-wrap gap-2" aria-label="Liens proposés par Uni">
                  {links.map((link) => link.to.startsWith('http') ? (
                    <a key={link.to} href={link.to} target="_blank" rel="noreferrer" className="rounded-full bg-[#1e3a8a] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d9488]">{link.label}</a>
                  ) : (
                    <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)} className="rounded-full bg-[#1e3a8a] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d9488]">{link.label}</Link>
                  ))}
                </div>
              )}
              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1" aria-label="Suggestions">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void send(suggestion)}
                      className="rounded-full border border-[#c7d2fe] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e3a8a] transition hover:border-[#1e3a8a] hover:bg-[#eff3ff]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              className="flex items-end gap-2 border-t border-[#e5e7eb] bg-white px-3 py-2.5"
              onSubmit={(event) => { event.preventDefault(); void send(draft) }}
            >
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={4000}
                placeholder={`Écrire à ${ASSISTANT_NAME}…`}
                aria-label={`Message pour ${ASSISTANT_NAME}`}
                className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/10"
              />
              <button
                type="submit"
                disabled={pending || !draft.trim()}
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#1e3a8a] text-white shadow-md transition hover:bg-[#2d4fa8] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Envoyer"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hello && !isOpen && (
          <motion.button
            type="button"
            onClick={() => { setHello(false); setIsOpen(true) }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
            exit={{ opacity: 0, x: 16, transition: { duration: 0.2 } }}
            className="relative mr-1 max-w-[230px] rounded-2xl border border-[#dce5fd] bg-white px-4 py-2.5 text-left text-[13px] font-semibold leading-5 text-[#111827] shadow-[0_14px_30px_rgba(30,58,138,0.18)]"
          >
            {guest ? `Salut ! Je suis ${ASSISTANT_NAME}. Une question sur UniFlow ?` : `Salut ${currentUser.name.split(' ')[0]} ! Besoin d’un coup de main ?`}
            <span aria-hidden className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-[#dce5fd] bg-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => { setHello(false); setIsOpen((value) => !value) }}
        whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        // Toutes les ~18 s, un petit sursaut : la mascotte vit, elle n'est pas un bouton de plus.
        animate={isOpen || reduceMotion ? undefined : { rotate: [0, 0, -8, 8, -5, 5, 0, 0], y: [0, 0, -4, 0, -2, 0, 0, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 18, ease: 'easeInOut' }}
        aria-label={isOpen ? `Fermer ${ASSISTANT_NAME}` : `Ouvrir ${ASSISTANT_NAME}, l’assistant UniFlow`}
        aria-expanded={isOpen}
        className="group relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/60 bg-gradient-to-br from-[#eff3ff] via-white to-[#ccfbf1] shadow-[0_12px_30px_rgba(30,58,138,0.28)] ring-1 ring-[#c7d2fe] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#93c5fd]"
      >
        <UniAvatar size={46} mood={isOpen ? mood : 'idle'} />
        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] text-white shadow ring-2 ring-white">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
        {unread && !isOpen && <span className="absolute -left-1 top-1 h-3 w-3 rounded-full bg-[#f59e0b] ring-2 ring-white" aria-hidden="true" />}
        <span className="pointer-events-none absolute -bottom-1.5 rounded-md bg-[#1e3a8a] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">{ASSISTANT_NAME.toUpperCase()}</span>
      </motion.button>
    </div>
  )
}

export default UniAssistant
