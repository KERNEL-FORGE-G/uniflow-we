import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'mail.kernelforge.codes'
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER || 'uniflow@kernelforge.codes'
const SMTP_PASS = process.env.SMTP_PASS || 'UniFlowMail2026!Secure'

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // STARTTLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // En-têtes CORS universels
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée. Utilisez POST.' })
  }

  try {
    const { fromName, fromEmail, to, cc, bcc, subject, bodyHtml, bodyText } = req.body || {}

    if (!to || (Array.isArray(to) && to.length === 0)) {
      return res.status(400).json({ success: false, error: 'Au moins un destinataire (to) est obligatoire.' })
    }

    // Formatage des destinataires
    const formatRecipients = (input: unknown): string[] => {
      if (!input) return []
      if (Array.isArray(input)) {
        return input.map((item) => (typeof item === 'string' ? item : item.email)).filter(Boolean)
      }
      if (typeof input === 'string') {
        return input.split(',').map((s) => s.trim()).filter(Boolean)
      }
      return []
    }

    const toList = formatRecipients(to)
    const ccList = formatRecipients(cc)
    const bccList = formatRecipients(bcc)

    if (toList.length === 0) {
      return res.status(400).json({ success: false, error: 'Destinataire invalide.' })
    }

    const senderDisplay = fromName ? `${fromName} · UniFlow` : 'UniFlow Messagerie'
    const cleanSubject = subject?.trim() || '(Sans objet)'

    const mailOptions = {
      from: `"${senderDisplay}" <${SMTP_USER}>`,
      replyTo: fromEmail || SMTP_USER,
      to: toList.join(', '),
      cc: ccList.length > 0 ? ccList.join(', ') : undefined,
      bcc: bccList.length > 0 ? bccList.join(', ') : undefined,
      subject: cleanSubject,
      text: bodyText || '',
      html: bodyHtml || `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">${(bodyText || '').replace(/\n/g, '<br/>')}</div>`,
    }

    const info = await transporter.sendMail(mailOptions)

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    })
  } catch (error: any) {
    console.error('Erreur SMTP Webmail:', error)
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erreur interne lors de l’acheminement du courriel.',
    })
  }
}
