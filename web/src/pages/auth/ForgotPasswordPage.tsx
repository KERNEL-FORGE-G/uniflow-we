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
      <AuthShell
        icon={KeyRound}
        title="Vérifiez votre boîte mail"
        subtitle="Si un compte existe pour cette adresse, un lien de réinitialisation sécurisé vient d’être expédié."
      >
        <ActionResult
          status="success"
          title="Lien envoyé avec succès"
          description={
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p>
                Un email de réinitialisation a été envoyé à <strong>{email.trim()}</strong>. Le lien est valable pendant 1 heure.
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <strong>Attention boîte de réception :</strong> Pensez à vérifier votre dossier <strong>Spam / Courrier indésirable</strong> ainsi que l'onglet <strong>Promotions</strong>. L'expéditeur est <strong>uniflow@kernelforge.codes</strong>.
              </div>
            </div>
          }
          actions={[
            { label: 'Renvoyer un lien', onClick: () => setSent(false), variant: 'secondary' },
            {
              label: 'Assistance WhatsApp (+237 6 57 63 56 44)',
              to: 'https://wa.me/237657635644?text=Bonjour%20UniFlow,%20je%20ne%20re%C3%A7ois%20pas%20mon%20email%20de%20r%C3%A9initialisation%20pour%20' + encodeURIComponent(email.trim()),
            },
          ]}
        />
      </AuthShell>
    )
  }

  return (
    <AuthShell
      icon={KeyRound}
      title="Mot de passe oublié"
      subtitle="Indiquez l’adresse email de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe."
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <ActionResultSlot result={result} />
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-slate-700">Adresse email de votre compte</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${authInputClass} pl-10`}
              placeholder="votre.email@facsciences-uy1.cm ou gmail.com"
            />
          </span>
        </label>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={authButtonClass}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Envoi du lien en cours…</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Envoyer le lien de réinitialisation</span>
            </>
          )}
        </motion.button>
      </form>
    </AuthShell>
  )
}
