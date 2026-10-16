import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenCheck, CalendarDays, Users } from 'lucide-react'
import { EASE } from '@/components/motion/PageTransition'

/**
 * Cadre commun de TOUS les écrans d'authentification (connexion, inscription,
 * mot de passe oublié, réinitialisation). Un seul gabarit : panneau illustré à
 * gauche (≥ lg) + formulaire à droite, pour que l'apprenant reconnaisse
 * immédiatement l'univers UniFlow quel que soit l'écran.
 */
export function AuthShell({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
  eyebrow,
  maxWidth = 'max-w-md',
  illustrationSrc = '/illustrations/login.jpg',
}: {
  icon?: LucideIcon
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  eyebrow?: string
  maxWidth?: string
  illustrationSrc?: string
}) {
  return (
    <div className="grid min-h-screen bg-[#F7F9FC] font-sans lg:grid-cols-2">
      {/* Panneau illustré : décoratif, masqué sur mobile pour laisser la place au formulaire */}
      <aside className="relative hidden overflow-hidden bg-[#1E3A8A] lg:block" aria-hidden="true">
        <img src={illustrationSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A] via-[#1E3A8A]/70 to-[#0D9488]/30" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="inline-block" tabIndex={-1}>
            <img src="/logos/uniflow-wordmark-white.svg" alt="UniFlow" className="h-9 object-contain" />
          </Link>
          <div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Apprenez à votre rythme, organisez-vous à votre façon.</h2>
            <ul className="mt-8 space-y-3 text-sm font-medium text-white/90">
              <li className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-[#F59E0B]" /> Un planning qui vous ressemble</li>
              <li className="flex items-center gap-3"><BookOpenCheck className="h-5 w-5 text-[#F59E0B]" /> Vos cours, devoirs et résultats au même endroit</li>
              <li className="flex items-center gap-3"><Users className="h-5 w-5 text-[#F59E0B]" /> Des groupes d'étude animés par des délégués</li>
            </ul>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center p-5 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } }}
          className={`w-full ${maxWidth}`}
        >
          <Link to="/" className="mb-6 inline-block lg:hidden">
            <img src="/logos/uniflow_logo_horizontal.png" alt="UniFlow" className="h-9 object-contain" />
          </Link>
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 sm:p-8">
            <header className="mb-6">
              {Icon && (
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
              )}
              {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">{eyebrow}</p>}
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
            </header>
            {children}
            <div className="mt-6 text-center text-sm text-slate-500">
              {footer ?? (
                <Link to="/login" className="font-bold text-[#1E3A8A] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">Retour à la connexion</Link>
              )}
            </div>
          </div>
          <p className="mt-6 text-center text-[11px] text-slate-400">© 2026 UniFlow · KERNEL FORGE</p>
        </motion.div>
      </main>
    </div>
  )
}

export const authLabelClass = 'mb-1.5 block text-xs font-bold text-slate-700'
export const authInputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#1E3A8A] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/20'
export const authButtonClass = 'flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition-all hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60'
