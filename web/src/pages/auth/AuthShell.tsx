import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  QrCode,
  VideoCamera,
  Books,
  Sparkle,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react'
import { EASE } from '@/components/motion/PageTransition'

/**
 * Cadre unifié et ultra-moderne de TOUS les écrans d'authentification UniFlow.
 * Style : Glassmorphic Bento Grid inspiré de Linear / Vercel.
 * Panneau gauche (≥ lg) : Carte Bento immersive présentant les 4 piliers d'UniFlow
 * connectés avec résilience hors-ligne, badges lumineux et Uni Copilot 3D.
 * Panneau droit : Formulaire d'authentification ergonomique et épuré.
 */
export function AuthShell({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
  eyebrow,
  maxWidth = 'max-w-lg',
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  eyebrow?: string
  maxWidth?: string
  illustrationSrc?: string
}) {
  return (
    <div className="min-h-screen bg-[#0B132B] font-sans text-slate-100 antialiased selection:bg-[#0D9488]/30 selection:text-teal-200 lg:grid lg:grid-cols-12">
      {/* ── PANNEAU GAUCHE IMMERSIF (≥ lg : 5 colonnes sur 12) ── */}
      <aside
        className="relative hidden overflow-hidden border-r border-white/10 bg-gradient-to-br from-[#0B132B] via-[#0E1A3D] to-[#162F65] p-8 xl:p-10 text-white lg:col-span-5 lg:flex lg:flex-col lg:justify-between"
        aria-hidden="true"
      >
        {/* Halos lumineux d'ambiance en arrière-plan */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#1E3A8A]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[#0D9488]/25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/4 h-60 w-60 -translate-y-1/2 rounded-full bg-[#F59E0B]/10 blur-3xl" />

        {/* Trame subtile en grille */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />

        {/* 1. Header Desktop : Logo officiel final + Badge de synchronisation */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="group inline-flex items-center gap-3.5 focus:outline-none" tabIndex={-1}>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 p-2 shadow-inner ring-1 ring-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
              <img
                src="/brand/uniflow_logo_final.png"
                alt="Logo UniFlow"
                className="h-full w-full object-contain drop-shadow-[0_4px_10px_rgba(13,148,136,0.35)]"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                Uni<span className="bg-gradient-to-r from-[#14B8A6] to-[#38BDF8] bg-clip-text text-transparent">Flow</span>
              </span>
              <span className="mt-1 text-[10px] font-bold tracking-widest text-blue-200/80 uppercase">
                Plateforme Universitaire
              </span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold text-teal-300 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
            </span>
            <span>Édition UY1 · Sync Active</span>
          </div>
        </div>

        {/* 2. Centre : Titre fort + Bento Grid des 4 piliers + Mascotte Uni */}
        <div className="relative z-10 my-auto py-6">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-md mb-3">
            <Sparkle weight="fill" className="h-3.5 w-3.5 text-[#F59E0B]" />
            <span>Plateforme Connectée · Résilience & Synchro Hors-Ligne</span>
          </div>

          <h2 className="text-2xl xl:text-3xl font-extrabold leading-tight tracking-tight text-white">
            L'excellence académique, <br />
            <span className="bg-gradient-to-r from-white via-blue-100 to-[#14B8A6] bg-clip-text text-transparent">
              connectée et ininterrompue.
            </span>
          </h2>
          <p className="mt-2 text-xs xl:text-sm text-blue-100/80 leading-relaxed max-w-md">
            Centralisez vos cours officiels UY1, émargements cryptographiques et salons d'étude avec synchronisation dynamique.
          </p>

          {/* Grille Bento des 4 piliers */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {/* Pilier 1 : Planning LMD */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-teal-400/40 hover:bg-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <CalendarCheck weight="duotone" className="h-4.5 w-4.5" />
                </div>
                <span className="rounded-md bg-teal-400/10 px-1.5 py-0.5 text-[9px] font-bold text-teal-300 uppercase tracking-wider">
                  Live
                </span>
              </div>
              <h3 className="mt-2 text-xs font-bold text-white">Planning LMD</h3>
              <p className="mt-1 text-[11px] text-blue-200/70 leading-snug">
                Emplois du temps officiels et rattrapages en direct.
              </p>
            </div>

            {/* Pilier 2 : Présence QR */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-blue-400/40 hover:bg-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <QrCode weight="duotone" className="h-4.5 w-4.5" />
                </div>
                <span className="rounded-md bg-sky-400/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 uppercase tracking-wider">
                  SHA-256
                </span>
              </div>
              <h3 className="mt-2 text-xs font-bold text-white">Présence QR</h3>
              <p className="mt-1 text-[11px] text-blue-200/70 leading-snug">
                Émargement certifié cryptographiquement en amphi.
              </p>
            </div>

            {/* Pilier 3 : Visioconférence */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <VideoCamera weight="duotone" className="h-4.5 w-4.5" />
                </div>
                <span className="rounded-md bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                  HD Campus
                </span>
              </div>
              <h3 className="mt-2 text-xs font-bold text-white">Visioconférence</h3>
              <p className="mt-1 text-[11px] text-blue-200/70 leading-snug">
                Classes virtuelles et tutorat interactif par UE.
              </p>
            </div>

            {/* Pilier 4 : Bibliothèque Numérique */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-emerald-400/40 hover:bg-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Books weight="duotone" className="h-4.5 w-4.5" />
                </div>
                <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 uppercase tracking-wider">
                  Hors-Ligne
                </span>
              </div>
              <h3 className="mt-2 text-xs font-bold text-white">Bibliothèque</h3>
              <p className="mt-1 text-[11px] text-blue-200/70 leading-snug">
                Polycopiés et annales avec résilience locale.
              </p>
            </div>
          </div>

          {/* Carte Bento Mascotte Uni Copilot 3D */}
          <div className="mt-4 flex items-center gap-3.5 rounded-2xl border border-white/15 bg-gradient-to-r from-white/[0.08] to-white/[0.03] p-3.5 backdrop-blur-xl shadow-lg">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-teal-400/30 bg-teal-500/10 shadow-md">
              <img
                src="/illustrations/uni_copilot_3d.png"
                alt="Uni Copilot"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Uni Copilot IA</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-400/20 px-2 py-0.5 text-[9px] font-semibold text-teal-300">
                  <CheckCircle weight="fill" className="h-2.5 w-2.5" />
                  Moteur Zéro Perte
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-blue-100/75 leading-relaxed">
                Vos cours, notes et présences restent protégés et répliqués en continu.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Footer Desktop : Statut sécurité & copyright */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-blue-200/70">
          <div className="flex items-center gap-2">
            <ShieldCheck weight="fill" className="h-4 w-4 text-teal-400" />
            <span className="text-[11px]">Chiffrement AES-256 · Appwrite Cloud</span>
          </div>
          <span className="text-[11px] font-medium">© 2026 UniFlow</span>
        </div>
      </aside>

      {/* ── PANNEAU DROIT (Formulaire : 7 colonnes sur 12) ── */}
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-[#F8FAFC] p-4 sm:p-8 lg:col-span-7 lg:p-12">
        {/* Cercles discrets de couleur en arrière-plan */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1E3A8A]/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#0D9488]/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } }}
          className={`relative z-10 w-full ${maxWidth}`}
        >
          {/* Header Mobile avec logo officiel */}
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none mb-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-2 shadow-md ring-1 ring-slate-200">
                <img
                  src="/brand/uniflow_logo_final.png"
                  alt="UniFlow"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black tracking-tight text-[#0B132B] leading-none">
                  Uni<span className="text-[#0D9488]">Flow</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                  Plateforme Universitaire
                </span>
              </div>
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold text-teal-800">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
              <span>Campus UY1 · Synchronisation Connectée</span>
            </div>
          </div>

          {/* Carte Principale du Formulaire */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
            <header className="mb-6">
              {Icon && (
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] text-white shadow-md shadow-blue-950/20">
                  <Icon className="h-6 w-6" />
                </div>
              )}
              {eyebrow && (
                <p className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-1">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-500">
                {subtitle}
              </p>
            </header>

            {children}

            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs sm:text-sm text-slate-500">
              {footer ?? (
                <Link
                  to="/login"
                  className="font-bold text-[#1E3A8A] hover:text-[#0D9488] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
                >
                  Retour à la connexion
                </Link>
              )}
            </div>
          </div>

          {/* Bas de page légal & technique */}
          <div className="mt-5 flex flex-col items-center justify-center gap-1 text-center text-[11px] text-slate-400">
            <span>© 2026 UniFlow · KERNEL FORGE · Conforme LMD</span>
            <span className="text-[10px] text-slate-400/80">
              Plateforme Universitaire Connectée · Résilience & Synchronisation Hors-Ligne
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export const authLabelClass = 'mb-1.5 block text-xs font-bold text-slate-700 tracking-tight'
export const authInputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-[#1E3A8A] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#1E3A8A]/15'
export const authButtonClass =
  'group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#0B132B] via-[#1E3A8A] to-[#0D9488] px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-950/20 transition-all duration-200 hover:shadow-lg hover:shadow-[#1E3A8A]/25 hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]'
