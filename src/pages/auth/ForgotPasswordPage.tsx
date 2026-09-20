import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Loader2, Mail, Send } from 'lucide-react'
import { requestPasswordRecovery } from '@/lib/appwrite'
import { ActionResult, ActionResultSlot, type ActionResultProps } from '@/components/feedback/ActionResult'
import { AuthShell, authButtonClass, authInputClass } from './AuthShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ActionResultProps | null>(null)
  const [sent, setSent] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim()) {
      setResult({ status: 'warning', title: 'Adresse manquante', description: 'Saisissez l’adresse email de votre compte UniFlow.' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      await requestPasswordRecovery(email)
      setSent(true)
    } catch (error) {
      setResult({
        status: 'error',
        title: 'Envoi impossible',
        description: 'Le lien n’a pas pu être envoyé. Vérifiez l’adresse, puis réessayez.',
        detail: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthShell icon={KeyRound} title="Vérifiez votre boîte mail" subtitle="Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.">
        <ActionResult
          status="success"
          title="Lien envoyé"
          description={<>Ouvrez le message reçu à <strong>{email.trim()}</strong> et suivez le lien. Il expire au bout d’une heure.</>}
          actions={[{ label: 'Renvoyer', onClick: () => setSent(false), variant: 'secondary' }]}
        />
      </AuthShell>
    )
  }

  return (
    <AuthShell icon={KeyRound} title="Mot de passe oublié" subtitle="Indiquez l’adresse de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <ActionResultSlot result={result} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[#374151]">Adresse email</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
            <input type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className={`${authInputClass} pl-12`} placeholder="prenom.nom@universite.cm" />
          </span>
        </label>
        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className={authButtonClass}>
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Envoi en cours…</> : <><Send className="h-5 w-5" /> Envoyer le lien</>}
        </motion.button>
      </form>
    </AuthShell>
  )
}
