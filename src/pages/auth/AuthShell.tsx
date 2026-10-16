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
  maxWidth = 'max-w-lg',
  illustrationSrc = '/illustrations/about_campus_hero.png',
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
    <div className="grid min-h-screen bg-[#F8FAFC] font-sans lg:grid-cols-12">
      {/* Panneau illustré gauche (5 colonnes sur 12) : campus + arguments + statut live */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#162B68] to-[#0A1838] lg:col-span-5 lg:flex lg:flex-col lg:justify-between p-10 xl:p-12 text-white border-r border-blue-900/40" aria-hidden="true">
        {/* Image de fond campus avec overlay assombrissant pour un contraste irréprochable */}
        <img
          src={illustrationSrc}
          alt="Campus UniFlow"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1838] via-[#1E3A8A]/85 to-[#1E3A8A]/60" />

        {/* Haut : Logo officiel + badge de plateforme */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3.5 group" tabIndex={-1}>
            <img
              src="/brand/uniflow_logo_final.png"
              alt="UniFlow"
              className="h-11 w-11 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                Uni<span className="text-[#14B8A6]">Flow</span>
              </span>
              <span className="text-[10px] font-bold text-blue-200/90 tracking-widest uppercase mt-0.5">
                Plateforme Universitaire
              </span>
            </div>
          </Link>
          <span className="rounded-full border border-teal-400/30 bg-teal-500/15 px-3 py-1 text-[11px] font-semibold text-teal-200">
            Édition Officielle UY1
          </span>
        </div>

        {/* Milieu : Titre d'impact et 3 piliers avec puces de contrôle */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-md mb-4 border border-white/15">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Environnement Académique & Autonome
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Votre espace, votre potentiel.
          </h2>
          <p className="mt-3 text-sm text-blue-100/90 leading-relaxed max-w-md">
            Centralisez vos cours, vos emplois du temps officiels et votre progression universitaire sur une interface unifiée.
          </p>

          <ul className="mt-8 space-y-4 text-xs xl:text-sm font-medium text-white/95">
            <li className="flex items-start gap-3.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/40">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-white font-bold">Emploi du temps & Présences 24/7</strong>
                <span className="text-blue-100/80 text-xs">Accès en ligne et hors-ligne, signatures QR cryptées SHA-256.</span>
              </div>
            </li>
            <li className="flex items-start gap-3.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                <BookOpenCheck className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-white font-bold">Filières & UEs Réelles UY1</strong>
                <span className="text-blue-100/80 text-xs">Données officielles Faculté des Sciences (ICT4D, SIGL, Info, Bio...).</span>
              </div>
            </li>
            <li className="flex items-start gap-3.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-white font-bold">Coordination & Espaces d'Étude</strong>
                <span className="text-blue-100/80 text-xs">Interactions directes délégués, tuteurs et groupes de révision.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Bas : Badge de connectivité campus et copyright */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/70">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Connecté • Campus UY1 & Appwrite Cloud</span>
          </div>
          <span>© 2026 UniFlow</span>
        </div>
      </aside>

      {/* Panneau droit : Formulaire (7 colonnes sur 12) */}
      <main className="flex items-center justify-center p-6 sm:p-10 lg:col-span-7 bg-[#F8FAFC]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } }}
          className={`w-full ${maxWidth}`}
        >
          {/* Header mobile avec logo */}
          <Link to="/" className="mb-6 inline-flex items-center gap-2.5 lg:hidden">
            <img src="/brand/uniflow_logo_final.png" alt="UniFlow" className="h-10 w-10 object-contain drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#1E3A8A] leading-none">
                Uni<span className="text-[#0D9488]">Flow</span>
              </span>
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">
                Plateforme Universitaire
              </span>
            </div>
          </Link>

          <div className="rounded-3xl bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
            <header className="mb-6">
              {Icon && (
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white shadow-md shadow-blue-900/20">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
              )}
              {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-1">{eyebrow}</p>}
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
            </header>

            {children}

            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
              {footer ?? (
                <Link
                  to="/login"
                  className="font-bold text-[#1E3A8A] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
                >
                  Retour à la connexion
                </Link>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © 2026 UniFlow · KERNEL FORGE · Conforme LMD & Architecture Zéro Perte
          </p>
        </motion.div>
      </main>
    </div>
  )
}

export const authLabelClass = 'mb-1.5 block text-xs font-bold text-slate-700'
export const authInputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#1E3A8A] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/20'
export const authButtonClass = 'flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition-all hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60'
