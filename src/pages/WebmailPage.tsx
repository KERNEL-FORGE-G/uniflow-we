import { useState, useEffect, useMemo } from 'react'
import {
  Inbox,
  Star,
  Send,
  FileText,
  Trash2,
  Archive,
  AlertOctagon,
  Search,
  RefreshCw,
  Plus,
  Paperclip,
  CheckCircle2,
  ShieldCheck,
  CornerUpLeft,
  Share2,
  Printer,
  Copy,
  Tag,
  Clock,
  HardDrive,
  X,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Mail,
  GraduationCap,
  Sparkles,
  Info,
} from 'lucide-react'
import { useUserRole } from '../utils/userRole'
import {
  webmailService,
  type EmailFolder,
  type EmailCategory,
  type EmailMessage,
  type WebmailAccountInfo,
  type EmailRecipient,
} from '../lib/webmailService'

const FOLDERS: Array<{ id: EmailFolder; label: string; icon: typeof Inbox }> = [
  { id: 'inbox', label: 'Boîte de réception', icon: Inbox },
  { id: 'starred', label: 'Favoris & Suivis', icon: Star },
  { id: 'sent', label: 'Messages envoyés', icon: Send },
  { id: 'drafts', label: 'Brouillons', icon: FileText },
  { id: 'archive', label: 'Archives', icon: Archive },
  { id: 'spam', label: 'Spam & Indésirables', icon: AlertOctagon },
  { id: 'trash', label: 'Corbeille', icon: Trash2 },
]

const CATEGORIES: Array<{ id: EmailCategory; label: string; icon: typeof Inbox; countKey?: string }> = [
  { id: 'primary', label: 'Principal', icon: Inbox },
  { id: 'academic', label: 'Universitaire & UY1', icon: GraduationCap },
  { id: 'notifications', label: 'Plateforme & Sécurité', icon: Sparkles },
  { id: 'promotions', label: 'Promotions & Campus', icon: Tag },
]

export default function WebmailPage() {
  const { currentUser, authUser, isSessionReady } = useUserRole()
  const userId = authUser?.id || (currentUser.email !== '—' ? currentUser.email : 'guest')

  // État de la boîte
  const [currentFolder, setCurrentFolder] = useState<EmailFolder>('inbox')
  const [currentCategory, setCurrentCategory] = useState<EmailCategory>('primary')
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Modale de composition
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isComposerMaximized, setIsComposerMaximized] = useState(false)
  const [composerTo, setComposerTo] = useState('')
  const [composerSubject, setComposerSubject] = useState('')
  const [composerBody, setComposerBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [composerFeedback, setComposerFeedback] = useState<string | null>(null)

  // Informations de compte
  const accountInfo: WebmailAccountInfo = useMemo(() => {
    return webmailService.getAccountInfo(userId, currentUser)
  }, [userId, currentUser])

  // Chargement des e-mails
  const loadEmails = async () => {
    if (!userId || userId === 'guest') return
    setIsLoading(true)
    try {
      const data = await webmailService.listEmails(userId, currentFolder, currentCategory, searchQuery)
      setEmails(data)
      if (selectedEmail) {
        const refreshed = data.find((m) => m.id === selectedEmail.id)
        if (refreshed) setSelectedEmail(refreshed)
      }
    } catch (err) {
      console.warn('Erreur de chargement des e-mails:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEmails()
  }, [userId, currentFolder, currentCategory])

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmails()
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Sélection d'un email
  const handleSelectEmail = async (email: EmailMessage) => {
    setSelectedEmail(email)
    if (!email.isRead) {
      await webmailService.markRead(userId, [email.id], true)
      setEmails((prev) => prev.map((m) => (m.id === email.id ? { ...m, isRead: true } : m)))
    }
  }

  // Étoile / Favori
  const handleToggleStar = async (e: React.MouseEvent, email: EmailMessage) => {
    e.stopPropagation()
    const nextState = await webmailService.toggleStar(userId, email.id)
    setEmails((prev) => prev.map((m) => (m.id === email.id ? { ...m, isStarred: nextState } : m)))
    if (selectedEmail && selectedEmail.id === email.id) {
      setSelectedEmail((prev) => (prev ? { ...prev, isStarred: nextState } : null))
    }
  }

  // Copier l'adresse email officielle
  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(accountInfo.primaryEmail)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2500)
    }
  }

  // Actions groupées
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(emails.map((e) => e.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleToggleSelectOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBatchArchive = async () => {
    if (selectedIds.size === 0) return
    await webmailService.moveToFolder(userId, Array.from(selectedIds), 'archive')
    setSelectedIds(new Set())
    loadEmails()
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    if (currentFolder === 'trash') {
      await webmailService.deletePermanently(userId, Array.from(selectedIds))
    } else {
      await webmailService.moveToFolder(userId, Array.from(selectedIds), 'trash')
    }
    setSelectedIds(new Set())
    if (selectedEmail && selectedIds.has(selectedEmail.id)) setSelectedEmail(null)
    loadEmails()
  }

  // Envoi d'un message
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composerTo.trim()) {
      setComposerFeedback('Veuillez indiquer au moins un destinataire.')
      return
    }

    setIsSending(true)
    try {
      const recipients: EmailRecipient[] = composerTo
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((email) => ({ name: email.split('@')[0], email }))

      await webmailService.sendEmail(userId, {
        fromName: accountInfo.displayName,
        fromEmail: accountInfo.primaryEmail,
        to: recipients,
        subject: composerSubject,
        bodyHtml: `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">${composerBody.replace(
          /\n/g,
          '<br/>'
        )}<br/><br/><div style="color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 8px;">${accountInfo.signature.replace(
          /\n/g,
          '<br/>'
        )}</div></div>`,
        bodyText: `${composerBody}\n\n${accountInfo.signature}`,
      })

      setComposerFeedback('E-mail envoyé avec succès !')
      setTimeout(() => {
        setIsComposerOpen(false)
        setComposerTo('')
        setComposerSubject('')
        setComposerBody('')
        setComposerFeedback(null)
        loadEmails()
      }, 1000)
    } catch {
      setComposerFeedback('Erreur lors de l’envoi.')
    } finally {
      setIsSending(false)
    }
  }

  const formatEmailDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      const now = new Date()
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    } catch {
      return ''
    }
  }

  // Si non connecté
  if (isSessionReady && currentUser.email === '—') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center mx-auto">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Messagerie Webmail Officielle</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pour accéder à votre adresse e-mail signée UniFlow, vous devez être connecté à votre compte étudiant ou enseignant.
          </p>
          <a
            href="#/login"
            className="inline-block w-full py-3 rounded-xl bg-[#1E3A8A] text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800"
          >
            Se connecter à UniFlow
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col font-sans bg-[#F8FAFC] text-slate-800 overflow-hidden">
      {/* =========================================================================
          TOP BANNER DU WEBMAIL — Identité Officielle UniFlow
         ========================================================================= */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] text-white flex items-center justify-center shadow-sm">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">UniFlow Mail</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                <ShieldCheck className="h-3 w-3" /> Certifié TLS 1.3
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Votre adresse officielle :</span>
              <strong className="text-slate-800 font-mono text-[11px]">{accountInfo.primaryEmail}</strong>
              <button
                onClick={handleCopyEmail}
                className="p-1 rounded-md text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50 transition-colors"
                title="Copier mon adresse e-mail"
              >
                {copiedEmail ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche d'e-mails */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans la messagerie (expéditeur, objet, mots-clés)..."
              className="w-full rounded-2xl bg-slate-100/80 border border-slate-200/70 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
            />
          </div>
        </div>

        {/* Actions utilisateur & stockage */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-[11px] font-bold text-slate-700">Stockage Campus</span>
            <span className="text-[10px] text-slate-400">1.84 Go sur 15 Go (12%)</span>
          </div>
          <button
            onClick={() => setIsComposerOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#1E3A8A] hover:to-[#1D4ED8] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Rédiger</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          CORPS PRINCIPAL DU CLIENT MAIL (3 COLONNES)
         ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLONNE 1 : DOSSIERS & STOCKAGE (Barre latérale gauche) */}
        <aside className="w-60 border-r border-slate-200/80 bg-white p-4 flex flex-col justify-between shrink-0 hidden sm:flex">
          <div className="space-y-1">
            <div className="pb-3 mb-2 border-b border-slate-100">
              <button
                onClick={() => setIsComposerOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-50 text-[#1E3A8A] font-black text-xs hover:bg-blue-100 transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Nouveau Message</span>
              </button>
            </div>

            {FOLDERS.map((folder) => {
              const active = currentFolder === folder.id
              const IconComp = folder.icon
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setCurrentFolder(folder.id)
                    setSelectedEmail(null)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                    <span>{folder.label}</span>
                  </div>
                  {folder.id === 'inbox' && accountInfo.unreadCount > 0 && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        active ? 'bg-white text-[#1E3A8A]' : 'bg-blue-100 text-[#1E3A8A]'
                      }`}
                    >
                      {accountInfo.unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Jauge de stockage */}
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                <span>Espace boîte mail</span>
              </span>
              <span>12%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0D9488] h-full rounded-full" style={{ width: '12%' }} />
            </div>
            <p className="text-[10px] text-slate-400">1.84 Go de 15 Go utilisés</p>
          </div>
        </aside>

        {/* COLONNE 2 & 3 : LISTE DES E-MAILS & PANNEAU DE LECTURE */}
        <div className="flex-1 flex overflow-hidden">
          {/* LISTE DES MESSAGES */}
          <section
            className={`${
              selectedEmail ? 'hidden lg:flex' : 'flex'
            } w-full lg:w-96 xl:w-[420px] border-r border-slate-200/80 bg-white flex-col shrink-0 overflow-hidden`}
          >
            {/* Onglets de catégories (uniquement dans l'inbox) */}
            {currentFolder === 'inbox' && (
              <div className="flex items-center border-b border-slate-200/80 bg-slate-50/70 overflow-x-auto no-scrollbar">
                {CATEGORIES.map((cat) => {
                  const active = currentCategory === cat.id
                  const IconC = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat.id)}
                      className={`flex-1 min-w-[90px] py-3 px-2 flex flex-col items-center justify-center gap-1 text-[11px] font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        active
                          ? 'border-[#1E3A8A] text-[#1E3A8A] bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <IconC className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Barre de contrôles rapides (sélectionner tout, rafraîchir, supprimer) */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/40 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && selectedIds.size === emails.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded text-[#1E3A8A] focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold">
                  {selectedIds.size > 0 ? `${selectedIds.size} sélectionné(s)` : `${emails.length} message(s)`}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {selectedIds.size > 0 && (
                  <>
                    <button
                      onClick={handleBatchArchive}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                      title="Archiver"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleBatchDelete}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={loadEmails}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                  title="Actualiser la boîte"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Liste déroulante des e-mails */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : emails.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Inbox className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">Aucun e-mail dans ce dossier</p>
                  <p className="text-[11px] text-slate-400">Votre boîte de réception est à jour.</p>
                </div>
              ) : (
                emails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id
                  const isChecked = selectedIds.has(email.id)
                  return (
                    <div
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`p-4 flex items-start gap-3 transition-colors cursor-pointer relative ${
                        isSelected
                          ? 'bg-blue-50/80 border-l-4 border-[#1E3A8A]'
                          : !email.isRead
                          ? 'bg-white font-bold'
                          : 'bg-slate-50/40 hover:bg-slate-100/70 text-slate-600'
                      }`}
                    >
                      {/* Checkbox et Étoile */}
                      <div className="flex items-center gap-1.5 pt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onClick={(e) => handleToggleSelectOne(e, email.id)}
                          onChange={() => {}}
                          className="h-3.5 w-3.5 rounded text-[#1E3A8A] focus:ring-0 cursor-pointer"
                        />
                        <button
                          onClick={(e) => handleToggleStar(e, email)}
                          className="text-slate-300 hover:text-amber-400 transition-colors p-0.5"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              email.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Contenu résumé */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-xs ${
                              !email.isRead ? 'font-black text-slate-900' : 'font-medium text-slate-700'
                            }`}
                          >
                            {email.fromName}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {formatEmailDate(email.createdAt)}
                          </span>
                        </div>

                        <p
                          className={`truncate text-xs ${
                            !email.isRead ? 'font-bold text-slate-900' : 'text-slate-800'
                          }`}
                        >
                          {email.subject}
                        </p>

                        <p className="truncate text-[11px] text-slate-500 font-normal">{email.snippet}</p>

                        {/* Badges pièces jointes & tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {email.hasAttachments && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              <Paperclip className="h-3 w-3" /> Pièce jointe
                            </span>
                          )}
                          {email.tags?.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-semibold text-[#1E3A8A] bg-blue-50 px-1.5 py-0.5 rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* PANNEAU DE LECTURE D'UN E-MAIL */}
          <main className="flex-1 flex flex-col bg-white overflow-hidden">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* En-tête des actions du message */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200/80 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-200"
                      title="Retour à la liste"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        webmailService.moveToFolder(userId, [selectedEmail.id], 'archive')
                        setSelectedEmail(null)
                        loadEmails()
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-[#1E3A8A] hover:bg-slate-200 transition-colors"
                      title="Archiver"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        webmailService.moveToFolder(userId, [selectedEmail.id], 'trash')
                        setSelectedEmail(null)
                        loadEmails()
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Mettre à la corbeille"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        webmailService.markRead(userId, [selectedEmail.id], false)
                        setSelectedEmail(null)
                        loadEmails()
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-200"
                      title="Marquer comme non lu"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                      title="Imprimer cet e-mail"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setComposerTo(selectedEmail.fromEmail)
                        setComposerSubject(`Re: ${selectedEmail.subject}`)
                        setComposerBody(`\n\n--- En réponse à ${selectedEmail.fromName} ---\n${selectedEmail.bodyText}`)
                        setIsComposerOpen(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
                    >
                      <CornerUpLeft className="h-3.5 w-3.5" />
                      <span>Répondre</span>
                    </button>
                  </div>
                </div>

                {/* Corps de l'e-mail */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                  {/* Titre / Objet */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                        {selectedEmail.subject}
                      </h2>
                      <button
                        onClick={(e) => handleToggleStar(e, selectedEmail)}
                        className="text-slate-300 hover:text-amber-400 p-1"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            selectedEmail.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Étiquettes de sécurité */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> SPF &amp; DKIM Valides
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] text-[10px] font-bold border border-blue-200/60">
                        <GraduationCap className="h-3.5 w-3.5" /> Domaine Universitaire UY1
                      </span>
                    </div>
                  </div>

                  {/* Profil de l'expéditeur */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {selectedEmail.fromName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{selectedEmail.fromName}</span>
                          <span className="text-xs text-slate-400 font-mono">&lt;{selectedEmail.fromEmail}&gt;</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          À : {selectedEmail.to.map((r) => `${r.name} (${r.email})`).join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-400 shrink-0">
                      {new Date(selectedEmail.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Pièces jointes (si présentes) */}
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Paperclip className="h-4 w-4 text-[#1E3A8A]" />
                        <span>Pièces Jointes ({selectedEmail.attachments.length})</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {selectedEmail.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold text-slate-900 truncate">{att.name}</p>
                              <p className="text-[10px] text-slate-400">{att.size}</p>
                            </div>
                            <a
                              href={att.url || '#'}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1E3A8A] hover:text-white text-xs font-bold text-slate-700 transition-colors"
                            >
                              Télécharger
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contenu du message */}
                  <div
                    className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-800"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Sélectionnez un e-mail à lire</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Choisissez un message dans la liste à gauche ou cliquez sur « Rédiger » pour envoyer un nouvel e-mail avec votre adresse officielle UniFlow.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE COMPOSITION D'E-MAIL (Style Gmail / Superhuman)
         ========================================================================= */}
      {isComposerOpen && (
        <div
          className={`fixed z-50 transition-all ${
            isComposerMaximized
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 right-4 sm:right-8 w-[95vw] sm:w-[580px] max-h-[85vh]'
          } bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-fade-in`}
        >
          {/* Header du Composeur */}
          <div className="bg-[#1E3A8A] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Nouveau Message UniFlow</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsComposerMaximized(!isComposerMaximized)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                {isComposerMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSendEmail} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 space-y-3 border-b border-slate-100 text-xs">
              {/* De */}
              <div className="flex items-center gap-3">
                <span className="w-16 font-bold text-slate-500">De :</span>
                <span className="font-mono text-slate-800 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                  {accountInfo.primaryEmail}
                </span>
              </div>

              {/* À */}
              <div className="flex items-center gap-3">
                <label className="w-16 font-bold text-slate-500">À :</label>
                <input
                  type="text"
                  required
                  value={composerTo}
                  onChange={(e) => setComposerTo(e.target.value)}
                  placeholder="destinataire@uniflow.kernelforge.codes, scolarite@uy1.cm..."
                  className="flex-1 bg-transparent border-b border-slate-200 pb-1 outline-none text-slate-800 font-medium focus:border-[#1E3A8A]"
                />
              </div>

              {/* Objet */}
              <div className="flex items-center gap-3">
                <label className="w-16 font-bold text-slate-500">Objet :</label>
                <input
                  type="text"
                  required
                  value={composerSubject}
                  onChange={(e) => setComposerSubject(e.target.value)}
                  placeholder="Objet officiel du message..."
                  className="flex-1 bg-transparent border-b border-slate-200 pb-1 outline-none text-slate-800 font-bold focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            {/* Corps du message */}
            <div className="flex-1 p-4 flex flex-col">
              <textarea
                required
                value={composerBody}
                onChange={(e) => setComposerBody(e.target.value)}
                placeholder="Rédigez votre message ici..."
                className="w-full flex-1 resize-none bg-transparent outline-none text-xs sm:text-sm text-slate-800 leading-relaxed font-sans"
              />

              {/* Aperçu de la signature */}
              <div className="pt-3 border-t border-dashed border-slate-200 text-[11px] text-slate-400 whitespace-pre-line select-none">
                {accountInfo.signature}
              </div>
            </div>

            {/* Barre de retour et actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                {composerFeedback && (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    {composerFeedback}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSending ? 'Envoi...' : 'Envoyer'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
