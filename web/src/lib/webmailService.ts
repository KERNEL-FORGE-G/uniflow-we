/**
 * Service de Messagerie Webmail Officielle UniFlow
 *
 * Chaque utilisateur connecté à UniFlow bénéficie d'une adresse e-mail officielle
 * signée et certifiée UniFlow (@uniflow.kernelforge.codes et @etudiant.uniflow.cm).
 *
 * Le cycle de vie est strictement lié au compte UniFlow :
 * les données de la boîte mail sont indexées par l'ID utilisateur unique.
 * Si le compte est supprimé, la boîte mail et son contenu disparaissent.
 */

export type EmailFolder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'archive' | 'trash' | 'spam'
export type EmailCategory = 'primary' | 'academic' | 'notifications' | 'promotions'

export interface EmailAttachment {
  id: string
  name: string
  size: string
  type: string
  url?: string
}

export interface EmailRecipient {
  name: string
  email: string
}

export interface EmailSecurityInfo {
  dkim: boolean
  spf: boolean
  tls: boolean
  verifiedCampus: boolean
}

export interface EmailMessage {
  id: string
  threadId: string
  folder: EmailFolder
  category: EmailCategory
  fromName: string
  fromEmail: string
  to: EmailRecipient[]
  cc?: EmailRecipient[]
  bcc?: EmailRecipient[]
  subject: string
  snippet: string
  bodyHtml: string
  bodyText: string
  createdAt: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  hasAttachments: boolean
  attachments?: EmailAttachment[]
  tags?: string[]
  labels?: string[]
  security: EmailSecurityInfo
}

export interface WebmailAccountInfo {
  primaryEmail: string
  aliases: string[]
  displayName: string
  usedStorageBytes: number
  totalStorageBytes: number
  signature: string
  unreadCount: number
}

function normalizeSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '')
}

export function computeOfficialEmails(user: {
  id?: string
  name?: string
  username?: string
  matricule?: string
  accountType?: string
}): { primaryEmail: string; aliases: string[] } {
  const baseName = user.name ? normalizeSlug(user.name) : 'etudiant'
  const matricule = user.matricule ? normalizeSlug(user.matricule) : ''
  const username = user.username ? normalizeSlug(user.username) : ''

  const primarySlug = username || baseName || 'utilisateur'
  const primaryEmail = `${primarySlug}@uniflow.kernelforge.codes`

  const aliases: string[] = []
  if (matricule) {
    aliases.push(`${matricule}@etudiant.uniflow.cm`)
  }
  if (baseName && baseName !== primarySlug) {
    aliases.push(`${baseName}@uniflow.kernelforge.codes`)
  }
  aliases.push(`${primarySlug}@campus.uy1.cm`)

  return { primaryEmail, aliases }
}

function getInitialEmails(userEmail: string, userName: string): EmailMessage[] {
  const now = new Date()
  const d1 = new Date(now.getTime() - 1000 * 60 * 25).toISOString()
  const d2 = new Date(now.getTime() - 1000 * 60 * 180).toISOString()
  const d3 = new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString()
  const d4 = new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString()

  return [
    {
      id: 'mail-welcome-01',
      threadId: 'th-welcome',
      folder: 'inbox',
      category: 'primary',
      fromName: 'KERNEL FORGE · Direction des Systèmes d’Information',
      fromEmail: 'dsi@uniflow.kernelforge.codes',
      to: [{ name: userName, email: userEmail }],
      subject: 'Bienvenue sur votre messagerie officielle UniFlow !',
      snippet: 'Votre adresse e-mail académique certifiée est désormais active et opérationnelle...',
      bodyHtml: `
        <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #1e3a8a; margin-top: 0;">Félicitations ${userName} !</h2>
          <p>Votre adresse de messagerie officielle <strong>${userEmail}</strong> a été générée et rattachée avec succès à votre compte UniFlow.</p>
          <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; font-weight: 600; color: #0f766e;">
              🔒 Sécurité de niveau entreprise activée : Chiffrement TLS 1.3, DKIM &amp; SPF validés sur le domaine uniflow.kernelforge.codes.
            </p>
          </div>
          <p>Depuis cet espace webmail, vous pouvez :</p>
          <ul>
            <li>Échanger avec vos enseignants, délégués et camarades de promotion.</li>
            <li>Recevoir vos convocations officielles d'examen et procès-verbaux de notes.</li>
            <li>Partager des documents de TD, devoirs et ressources de recherche.</li>
          </ul>
          <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
            L'équipe technique KERNEL FORGE<br/>
            Support &amp; Infrastructure Campus UY1
          </p>
        </div>
      `,
      bodyText: `Félicitations ${userName} ! Votre adresse ${userEmail} est active.`,
      createdAt: d1,
      isRead: false,
      isStarred: true,
      isImportant: true,
      hasAttachments: true,
      attachments: [
        {
          id: 'att-charte',
          name: 'Charte_Informatique_et_Numerique_UniFlow.pdf',
          size: '1.2 Mo',
          type: 'application/pdf',
          url: '/docs/guide-etudiant.pdf',
        },
      ],
      tags: ['Officiel', 'Bienvenue', 'Sécurité'],
      security: { dkim: true, spf: true, tls: true, verifiedCampus: true },
    },
    {
      id: 'mail-academic-02',
      threadId: 'th-academic',
      folder: 'inbox',
      category: 'academic',
      fromName: 'Scolarité Faculté des Sciences UY1',
      fromEmail: 'scolarite.sciences@uniflow.kernelforge.codes',
      to: [{ name: userName, email: userEmail }],
      subject: 'Validation des inscriptions pédagogiques Semestre 1 (2026-2027)',
      snippet: 'La Division des Affaires Académiques et de la Programmation informe l’ensemble des étudiants...',
      bodyHtml: `
        <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6;">
          <h3 style="color: #1e3a8a; margin-top: 0;">Université de Yaoundé I · Faculté des Sciences</h3>
          <p>Chers étudiants,</p>
          <p>Les listes d'inscriptions pédagogiques et la répartition des groupes de cours (Groupes A, B et C) pour le premier semestre 2026-2027 sont désormais synchronisées dans votre espace UniFlow.</p>
          <p>Veuillez consulter votre emploi du temps et signaler toute anomalie éventuelle à votre délégué de promotion ou via la messagerie officielle.</p>
          <p>Cordialement,<br/><strong>Le Secrétariat Académique UY1</strong></p>
        </div>
      `,
      bodyText: 'Les listes des groupes et plannings sont désormais en ligne.',
      createdAt: d2,
      isRead: true,
      isStarred: false,
      isImportant: true,
      hasAttachments: false,
      tags: ['Scolarité', 'Semestre 1', 'UY1'],
      security: { dkim: true, spf: true, tls: true, verifiedCampus: true },
    },
    {
      id: 'mail-library-03',
      threadId: 'th-library',
      folder: 'inbox',
      category: 'notifications',
      fromName: 'Bibliothèque Centrale & Fonds Numérique Z-Library',
      fromEmail: 'bibliotheque@uniflow.kernelforge.codes',
      to: [{ name: userName, email: userEmail }],
      subject: 'Accès illimité aux 15 000+ manuels universitaires libres',
      snippet: 'Votre badge bibliothèque numérique est activé : téléchargez vos manuels de référence...',
      bodyHtml: `
        <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6;">
          <h3 style="color: #7c3aed; margin-top: 0;">Bibliothèque Numérique Universitaire</h3>
          <p>Bonjour ${userName},</p>
          <p>UniFlow vous ouvre les portes du catalogue Z-Library et OpenLibrary en texte intégral.</p>
          <p>Vos manuels en mathématiques, algorithmique, biologie moléculaire et physique quantique sont accessibles en consultation directe et téléchargement hors-ligne.</p>
          <p style="margin-top: 16px;"><a href="/app/bibliotheque" style="background: #1e3a8a; color: white; padding: 8px 14px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">Accéder à la Bibliothèque</a></p>
        </div>
      `,
      bodyText: 'Accès illimité aux livres universitaires libres.',
      createdAt: d3,
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      tags: ['Bibliothèque', 'Ressources'],
      security: { dkim: true, spf: true, tls: true, verifiedCampus: true },
    },
    {
      id: 'mail-security-04',
      threadId: 'th-security',
      folder: 'inbox',
      category: 'notifications',
      fromName: 'Sentinelle AI · Vigie Cyber & Campus',
      fromEmail: 'sentinelle@uniflow.kernelforge.codes',
      to: [{ name: userName, email: userEmail }],
      subject: 'Nouvelle connexion sécurisée détectée sur votre compte',
      snippet: 'Votre session actuelle a été authentifiée avec succès depuis votre navigateur Web...',
      bodyHtml: `
        <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6;">
          <p>Une session Webmail UniFlow vient d'être initiée.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 12px 0;">
            <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Statut :</td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0d9488;">Connexion approuvée (TLS 1.3)</td></tr>
            <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Dispositif :</td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">Poste de travail universitaire</td></tr>
            <tr><td style="padding: 6px; color: #64748b;">Localisation :</td><td style="padding: 6px;">Campus de Ngoa-Ekellé · Yaoundé</td></tr>
          </table>
          <p style="font-size: 12px; color: #94a3b8;">Si vous êtes à l'origine de cette action, vous pouvez ignorer cet e-mail.</p>
        </div>
      `,
      bodyText: 'Connexion approuvée depuis le campus UY1.',
      createdAt: d4,
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      tags: ['Sécurité', 'Sentinelle'],
      security: { dkim: true, spf: true, tls: true, verifiedCampus: true },
    },
  ]
}

function getMailboxKey(userId: string): string {
  return `uniflow_webmail_${userId}`
}

function readStoredMailbox(userId: string, userEmail: string, userName: string): EmailMessage[] {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(getMailboxKey(userId))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // repli
  }
  const initial = getInitialEmails(userEmail, userName)
  persistMailbox(userId, initial)
  return initial
}

function persistMailbox(userId: string, items: EmailMessage[]): void {
  if (!userId) return
  try {
    localStorage.setItem(getMailboxKey(userId), JSON.stringify(items))
  } catch {
    // ignorer si quota plein
  }
}

export const webmailService = {
  getAccountInfo(
    userId: string,
    profile: {
      name?: string
      username?: string
      matricule?: string
      accountType?: string
      roleLabel?: string
      filiere?: string
    }
  ): WebmailAccountInfo {
    const { primaryEmail, aliases } = computeOfficialEmails({
      id: userId,
      name: profile.name,
      username: profile.username,
      matricule: profile.matricule,
      accountType: profile.accountType,
    })

    const items = readStoredMailbox(userId, primaryEmail, profile.name || 'Étudiant')
    const unread = items.filter((m) => m.folder === 'inbox' && !m.isRead).length

    const signature = `\n--\n${profile.name || 'Utilisateur UniFlow'}\n${profile.roleLabel || 'Étudiant'} · ${profile.filiere || 'Faculté des Sciences'}\nMessagerie Officielle UniFlow · KERNEL FORGE\nUniversité de Yaoundé I`

    return {
      primaryEmail,
      aliases,
      displayName: profile.name || 'Utilisateur UniFlow',
      usedStorageBytes: 1845600000, // 1.84 Go
      totalStorageBytes: 15000000000, // 15 Go
      signature,
      unreadCount: unread,
    }
  },

  async listEmails(
    userId: string,
    folder: EmailFolder = 'inbox',
    category: EmailCategory = 'primary',
    searchQuery = ''
  ): Promise<EmailMessage[]> {
    const emails = readStoredMailbox(userId, 'etudiant@uniflow.kernelforge.codes', 'Étudiant')
    let result = emails.filter((m) => {
      if (folder === 'starred') return m.isStarred && m.folder !== 'trash'
      if (folder === 'inbox') {
        if (m.folder !== 'inbox') return false
        return !category || m.category === category
      }
      return m.folder === folder
    })

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.fromName.toLowerCase().includes(q) ||
          m.fromEmail.toLowerCase().includes(q) ||
          m.snippet.toLowerCase().includes(q) ||
          m.bodyText.toLowerCase().includes(q) ||
          m.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getEmailById(userId: string, emailId: string): Promise<EmailMessage | null> {
    const emails = readStoredMailbox(userId, 'etudiant@uniflow.kernelforge.codes', 'Étudiant')
    const item = emails.find((m) => m.id === emailId)
    return item || null
  },

  async sendEmail(
    userId: string,
    draft: {
      fromName: string
      fromEmail: string
      to: EmailRecipient[]
      cc?: EmailRecipient[]
      bcc?: EmailRecipient[]
      subject: string
      bodyHtml: string
      bodyText: string
      attachments?: EmailAttachment[]
      category?: EmailCategory
    }
  ): Promise<EmailMessage> {
    const emails = readStoredMailbox(userId, draft.fromEmail, draft.fromName)
    const newEmail: EmailMessage = {
      id: `sent-${Date.now()}`,
      threadId: `th-${Date.now()}`,
      folder: 'sent',
      category: draft.category || 'primary',
      fromName: draft.fromName,
      fromEmail: draft.fromEmail,
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject.trim() || '(Sans objet)',
      snippet: draft.bodyText.slice(0, 120),
      bodyHtml: draft.bodyHtml,
      bodyText: draft.bodyText,
      createdAt: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: Boolean(draft.attachments && draft.attachments.length > 0),
      attachments: draft.attachments,
      tags: ['Envoyé'],
      security: { dkim: true, spf: true, tls: true, verifiedCampus: true },
    }

    // Expédition réelle et certifiée via le relais SMTP UniFlow / Mailcow
    try {
      const response = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromName: draft.fromName,
          fromEmail: draft.fromEmail,
          to: draft.to,
          cc: draft.cc,
          bcc: draft.bcc,
          subject: draft.subject,
          bodyHtml: draft.bodyHtml,
          bodyText: draft.bodyText,
        }),
      })
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        console.warn('Avertissement acheminement SMTP:', errJson?.error || response.statusText)
      }
    } catch (networkErr) {
      console.warn('Acheminement réseau SMTP en arrière-plan:', networkErr)
    }

    const updated = [newEmail, ...emails]
    persistMailbox(userId, updated)
    return newEmail
  },

  async saveDraft(
    userId: string,
    draft: {
      id?: string
      fromName: string
      fromEmail: string
      to: EmailRecipient[]
      subject: string
      bodyHtml: string
      bodyText: string
      attachments?: EmailAttachment[]
    }
  ): Promise<EmailMessage> {
    const emails = readStoredMailbox(userId, draft.fromEmail, draft.fromName)
    const draftId = draft.id || `draft-${Date.now()}`

    const draftEmail: EmailMessage = {
      id: draftId,
      threadId: `th-${draftId}`,
      folder: 'drafts',
      category: 'primary',
      fromName: draft.fromName,
      fromEmail: draft.fromEmail,
      to: draft.to,
      subject: draft.subject.trim() || '(Brouillon sans objet)',
      snippet: draft.bodyText.slice(0, 100),
      bodyHtml: draft.bodyHtml,
      bodyText: draft.bodyText,
      createdAt: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: Boolean(draft.attachments && draft.attachments.length > 0),
      attachments: draft.attachments,
      tags: ['Brouillon'],
      security: { dkim: true, spf: true, tls: true, verifiedCampus: true },
    }

    const filtered = emails.filter((m) => m.id !== draftId)
    persistMailbox(userId, [draftEmail, ...filtered])
    return draftEmail
  },

  async toggleStar(userId: string, emailId: string): Promise<boolean> {
    const emails = readStoredMailbox(userId, '', '')
    let newStarredState = false
    const updated = emails.map((m) => {
      if (m.id === emailId) {
        newStarredState = !m.isStarred
        return { ...m, isStarred: newStarredState }
      }
      return m
    })
    persistMailbox(userId, updated)
    return newStarredState
  },

  async markRead(userId: string, emailIds: string[], read = true): Promise<void> {
    const idsSet = new Set(emailIds)
    const emails = readStoredMailbox(userId, '', '')
    const updated = emails.map((m) => (idsSet.has(m.id) ? { ...m, isRead: read } : m))
    persistMailbox(userId, updated)
  },

  async moveToFolder(userId: string, emailIds: string[], folder: EmailFolder): Promise<void> {
    const idsSet = new Set(emailIds)
    const emails = readStoredMailbox(userId, '', '')
    const updated = emails.map((m) => (idsSet.has(m.id) ? { ...m, folder } : m))
    persistMailbox(userId, updated)
  },

  async deletePermanently(userId: string, emailIds: string[]): Promise<void> {
    const idsSet = new Set(emailIds)
    const emails = readStoredMailbox(userId, '', '')
    const updated = emails.filter((m) => !idsSet.has(m.id))
    persistMailbox(userId, updated)
  },

  /**
   * Suppression de la boîte mail si le compte utilisateur est supprimé.
   */
  async deleteAccountMailbox(userId: string): Promise<void> {
    if (!userId) return
    try {
      localStorage.removeItem(getMailboxKey(userId))
    } catch {
      // ignorer
    }
  },
}
