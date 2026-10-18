import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Key,
  EnvelopeSimple,
  PaperPlaneTilt,
  CircleNotch,
  Info,
  WarningCircle,
} from '@phosphor-icons/react'
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
      setResult({
        status: 'warning',
        title: 'Adresse manquante',
        description: 'Saisissez l’adresse email de votre compte UniFlow.',
      })
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
        icon={Key}
        eyebrow="Récupération de compte"
        title="Vérifiez votre boîte mail"
        subtitle="Si un compte existe pour cette adresse, un lien de réinitialisation sécurisé vient d’être expédié."
      >
        <ActionResult
          status="success"
          title="Lien envoyé avec succès"
          description={
            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed text-left">
              <p>
                Un email de réinitialisation a été envoyé à <strong>{email.trim()}</strong>. Le lien est
                valable pendant 1 heure.
              </p>
              <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-amber-950 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm mb-1.5">
                  <WarningCircle weight="fill" className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                  <span>Vérifiez impérativement votre dossier SPAM</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  Selon les filtres de votre messagerie (Gmail, Outlook, Yahoo, messagerie UY1), nos
                  messages automatiques peuvent être classés dans le dossier{' '}
                  <strong>Spam / Courrier indésirable</strong> ou <strong>Promotions</strong>.
                </p>
                <div className="mt-3 pt-2.5 border-t border-amber-200/80 text-[11px] text-amber-800 flex flex-wrap items-center justify-between gap-1">
                  <span>
                    Expéditeur : <strong>uniflow@kernelforge.codes</strong>
                  </span>
                  <span className="italic">Marquez « Non-spam »</span>
                </div>
              </div>
            </div>
          }
          actions={[
            {
              label: 'Renvoyer un nouveau lien',
              onClick: () => setSent(false),
              variant: 'secondary',
            },
            {
              label: 'Assistance WhatsApp (+237 6 57 63 56 44)',
              to:
                'https://wa.me/237657635644?text=Bonjour%20UniFlow,%20je%20ne%20re%C3%A7ois%20pas%20mon%20email%20de%20r%C3%A9initialisation%20pour%20' +
                encodeURIComponent(email.trim()),
            },
          ]}
        />
      </AuthShell>
    )
  }

  return (
    <AuthShell
      icon={Key}
      eyebrow="Sécurité & Accès"
      title="Mot de passe oublié"
      subtitle="Indiquez l’adresse email de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <ActionResultSlot result={result} />

        <div>
          <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-bold text-slate-700 tracking-tight">
            Adresse email de votre compte
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <EnvelopeSimple weight="duotone" className="h-4.5 w-4.5" />
            </span>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${authInputClass} pl-10`}
              placeholder="votre.email@facsciences-uy1.cm ou gmail.com"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={authButtonClass}
        >
          {loading ? (
            <>
              <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
              <span>Envoi du lien en cours…</span>
            </>
          ) : (
            <>
              <span>Envoyer le lien de réinitialisation</span>
              <PaperPlaneTilt weight="bold" className="h-4 w-4" />
            </>
          )}
        </motion.button>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-left text-xs text-slate-600 shadow-xs">
          <p className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-xs">
            <Info weight="fill" className="h-4 w-4 text-[#1E3A8A]" />
            <span>Où trouver l'email de réinitialisation ?</span>
          </p>
          <p className="leading-relaxed text-[11px] text-slate-500">
            Les messages envoyés automatiquement arrivent parfois dans le dossier{' '}
            <strong>Spam / Courriers indésirables</strong> ou <strong>Promotions</strong> selon votre
            fournisseur. Pensez à vérifier ces dossiers après envoi.
          </p>
        </div>
      </form>
    </AuthShell>
  )
}
