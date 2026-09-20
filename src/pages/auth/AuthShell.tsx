import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EASE } from '@/components/motion/PageTransition'

/**
 * Cadre commun aux écrans d'authentification secondaires (mot de passe
 * oublié, réinitialisation) : même dégradé et même carte que la connexion,
 * pour que l'utilisateur sache qu'il est toujours « chez UniFlow ».
 */
export function AuthShell({ icon: Icon, title, subtitle, children, footer }: { icon: LucideIcon; title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0, transition: { delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } }}
            className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488]"
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-black text-[#111827]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">{subtitle}</p>
        </div>
        {children}
        <div className="mt-6 text-center text-sm text-[#6b7280]">
          {footer ?? (
            <Link to="/login" className="font-bold text-[#1e3a8a] hover:underline">Retour à la connexion</Link>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export const authInputClass = 'w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#1e3a8a] focus:bg-white'
export const authButtonClass = 'flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] py-3.5 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60'
