import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { completePasswordRecovery } from '@/lib/appwrite'
import { ActionResult, ActionResultSlot, type ActionResultProps } from '@/components/feedback/ActionResult'
import { AuthShell, authButtonClass, authInputClass } from './AuthShell'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const userId = params.get('userId') ?? ''
  const secret = params.get('secret') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState<ActionResultProps | null>(null)

  if (!userId || !secret) {
    return (
      <AuthShell icon={ShieldCheck} title="Lien incomplet" subtitle="Ce lien de réinitialisation ne contient pas les informations attendues.">
        <ActionResult
          status="error"
          title="Lien invalide"
          description="Ouvrez le lien exactement tel qu’il figure dans l’email, ou demandez-en un nouveau."
          actions={[{ label: 'Demander un nouveau lien', to: '/mot-de-passe-oublie' }]}
        />
      </AuthShell>
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (password.length < 8) {
      setResult({ status: 'warning', title: 'Mot de passe trop court', description: 'Appwrite exige au moins 8 caractères.' })
      return
    }
    if (password !== confirm) {
      setResult({ status: 'warning', title: 'Les deux saisies diffèrent', description: 'Ressaisissez le même mot de passe dans les deux champs.' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      await completePasswordRecovery(userId, secret, password)
      setDone(true)
    } catch (error) {
      setResult({
        status: 'error',
        title: 'Réinitialisation refusée',
        description: 'Le lien a peut-être expiré (il est valable une heure) ou a déjà servi.',
        detail: error instanceof Error ? error.message : undefined,
        actions: [{ label: 'Demander un nouveau lien', to: '/mot-de-passe-oublie', variant: 'secondary' }],
      })
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthShell icon={ShieldCheck} title="Mot de passe modifié" subtitle="Vous pouvez vous connecter avec votre nouveau mot de passe.">
        <ActionResult status="success" title="C’est fait" description="Votre mot de passe a été enregistré." actions={[{ label: 'Se connecter', to: '/login' }]} />
      </AuthShell>
    )
  }

  return (
    <AuthShell icon={Lock} title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d’au moins 8 caractères." footer={<Link to="/login" className="font-bold text-[#1e3a8a] hover:underline">Annuler</Link>}>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <ActionResultSlot result={result} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[#374151]">Nouveau mot de passe</span>
          <span className="relative block">
            <input type={show ? 'text' : 'password'} autoComplete="new-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className={`${authInputClass} pr-12`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[#374151]">Confirmation</span>
          <input type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={authInputClass} />
        </label>
        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className={authButtonClass}>
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Enregistrement…</> : 'Enregistrer le mot de passe'}
        </motion.button>
      </form>
    </AuthShell>
  )
}
