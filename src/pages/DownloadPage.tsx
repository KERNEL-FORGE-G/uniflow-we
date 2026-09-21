import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { UniIcon, type UniIconName } from '../components/ui/UniIcon'
import { UniMascot } from '../components/mascot/UniMascot'
import { fadeInUp, staggerContainer } from '../utils/animations'
import { cn } from '../utils/cn'
import { useAppReleases, type AppRelease, type ReleasePlatform } from '../lib/appReleases'
import {
  ANDROID_INSTALL_STEPS,
  DOWNLOAD_FAQ,
  buildDownloadChannels,
  releaseMetaLine,
  shortSha,
  splitReleaseNotes,
  type ChannelStatus,
} from '../lib/downloadPageModel'
import heroIllustration from '../assets/illustrations/telecharger-hero.webp'
import androidIllustration from '../assets/illustrations/telecharger-android.webp'
import desktopIllustration from '../assets/illustrations/telecharger-desktop.webp'
import webIllustration from '../assets/illustrations/telecharger-web.webp'

/**
 * Page publique « Télécharger UniFlow » (`/download`).
 *
 * Les liens viennent de la collection `app_releases`, modifiable par l'admin
 * de la plateforme depuis Administration › Paramètres › Applications : l'APK
 * Android change d'URL à chaque release GitHub, et la version de bureau
 * (Windows, Linux, macOS) a déjà sa place, affichée « bientôt » tant qu'aucun
 * lien n'est publié.
 */

const PLATFORM_ICON: Record<ReleasePlatform, UniIconName> = {
  android: 'android',
  windows: 'windows',
  linux: 'linux',
  macos: 'apple',
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé) : la valeur reste sélectionnable dans l'attribut title.
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#1e3a8a]/40 hover:text-[#1e3a8a]"
    >
      <UniIcon name={copied ? 'check' : 'document'} weight={copied ? 'bold' : 'duotone'} className={cn('h-3.5 w-3.5', copied && 'text-emerald-600')} />
      {copied ? 'Copié' : 'Copier'}
    </button>
  )
}

function ReleaseFacts({ release }: { release: AppRelease }) {
  return (
    <dl className="grid gap-1.5 text-xs font-medium text-slate-500">
      <div className="flex flex-wrap items-center gap-x-2">
        <dt className="text-slate-400">Fichier</dt>
        <dd className="break-all font-mono text-slate-700">{release.fileName || '—'}</dd>
      </div>
      {release.sha256 ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <dt className="text-slate-400">SHA-256</dt>
          <dd className="font-mono text-slate-700" title={release.sha256}>{shortSha(release.sha256)}</dd>
          <CopyButton value={release.sha256} label="Copier l’empreinte SHA-256 complète" />
        </div>
      ) : null}
    </dl>
  )
}

function DownloadButton({ release, label, icon, tone = 'navy', size = 'lg' }: {
  release: AppRelease
  label: string
  icon: UniIconName
  tone?: 'navy' | 'teal' | 'white'
  size?: 'lg' | 'md'
}) {
  const meta = releaseMetaLine(release)
  return (
    <motion.a
      href={release.url}
      download={release.fileName || true}
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      data-testid={`download-${release.platform}`}
      className={cn(
        'group inline-flex w-full items-center gap-4 rounded-2xl text-left shadow-lg transition-shadow hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2',
        // Dans une carte le bouton prend la largeur ; dans le héros il se cale sur son texte.
        size === 'lg' ? 'px-5 py-4 sm:w-auto' : 'px-4 py-3',
        tone === 'navy' && 'bg-[#1e3a8a] text-white hover:bg-[#2d4fa8] focus:ring-[#1e3a8a]/40',
        tone === 'teal' && 'bg-[#0d9488] text-white hover:bg-[#14b8a8] focus:ring-[#0d9488]/40',
        tone === 'white' && 'bg-white text-[#1e3a8a] shadow-black/20 hover:bg-blue-50 focus:ring-white/60',
      )}
    >
      <span className={cn('flex shrink-0 items-center justify-center rounded-xl', size === 'lg' ? 'h-11 w-11' : 'h-9 w-9', tone === 'white' ? 'bg-[#1e3a8a]/10' : 'bg-white/15')}>
        <UniIcon name={icon} weight="fill" className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
      </span>
      <span className="min-w-0">
        <span className={cn('block font-black leading-tight', size === 'lg' ? 'text-sm sm:text-base' : 'text-sm')}>{label}</span>
        {meta ? <span className={cn('mt-0.5 block text-xs font-semibold', tone === 'white' ? 'text-[#1e3a8a]/70' : 'text-white/80')}>{meta}</span> : null}
      </span>
      <UniIcon name="download" weight="bold" className="ml-auto h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-y-0.5" />
    </motion.a>
  )
}

function StatusPill({ status, soonLabel, icon, dark = false }: { status: ChannelStatus; soonLabel: string; icon: UniIconName; dark?: boolean }) {
  const checking = status === 'checking'
  return (
    <span
      aria-live="polite"
      className={cn(
        'inline-flex w-full items-center gap-4 rounded-2xl border-2 border-dashed px-5 py-4 text-left sm:w-auto',
        dark ? 'border-white/25 text-blue-100' : 'border-slate-300 bg-white text-slate-500',
      )}
    >
      <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', dark ? 'bg-white/10 text-teal-200' : 'bg-slate-100 text-slate-400')}>
        <UniIcon name={checking ? 'spinner' : icon} weight="duotone" className={cn('h-6 w-6', checking && 'animate-spin')} />
      </span>
      <span className="text-sm font-bold sm:text-base">{checking ? 'Recherche de la dernière version…' : soonLabel}</span>
    </span>
  )
}

function ChannelCard({ image, alt, eyebrow, title, description, accent, children }: {
  image: string
  alt: string
  eyebrow: string
  title: string
  description: string
  accent: 'teal' | 'navy' | 'sky'
  children: ReactNode
}) {
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      <div
        className={cn(
          'relative aspect-[4/3] overflow-hidden',
          accent === 'teal' && 'bg-gradient-to-br from-[#f0fdfa] to-[#e0f2fe]',
          accent === 'navy' && 'bg-gradient-to-br from-[#eff3ff] to-[#e0e7ff]',
          accent === 'sky' && 'bg-gradient-to-br from-[#f0f9ff] to-[#f0fdfa]',
        )}
      >
        <img src={image} alt={alt} loading="lazy" decoding="async" width={960} height={720} className="h-full w-full object-cover mix-blend-multiply" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className={cn('text-xs font-extrabold uppercase tracking-widest', accent === 'teal' ? 'text-[#0d9488]' : 'text-[#1e3a8a]')}>{eyebrow}</p>
          <h2 className="mt-1 text-xl font-black text-[#0f172a]">{title}</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{description}</p>
        </div>
        <div className="mt-auto space-y-3">{children}</div>
      </div>
    </motion.article>
  )
}

export default function DownloadPage() {
  const reduced = useReducedMotion()
  const { data: releases, isPending } = useAppReleases()
  const channels = buildDownloadChannels(releases, isPending)
  const android = channels.android.release
  const notes = splitReleaseNotes(android?.notes)
  const anySoon = channels.android.status === 'soon' || channels.desktop.status === 'soon'

  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNavbar />

      <main id="contenu">
        {/* Héros */}
        <section className="relative overflow-hidden bg-[#0f1f4d]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(30,58,138,0.55),transparent_60%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:py-24">
            <div className="space-y-7">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-100 backdrop-blur"
              >
                <UniIcon name="download" weight="bold" className="h-3.5 w-3.5" /> Téléchargements
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl"
              >
                UniFlow sur tous
                <span className="block bg-gradient-to-r from-teal-300 via-cyan-200 to-sky-300 bg-clip-text text-transparent">vos écrans.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-xl text-lg leading-relaxed text-blue-100/90"
              >
                L’application Android pour les étudiants, la version de bureau pour les enseignants et
                l’administration, le site pour tout le monde. Un seul compte, les mêmes données, avec ou
                sans réseau.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              >
                {android ? (
                  <DownloadButton release={android} label="Télécharger pour Android" icon="android" tone="white" />
                ) : (
                  <StatusPill status={channels.android.status} soonLabel="Version Android bientôt disponible" icon="android" dark />
                )}
                <a
                  href="#bureau"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <UniIcon name="desktop" weight="duotone" className="h-5 w-5 text-teal-200" />
                  {channels.desktop.status === 'available' ? 'Version de bureau' : 'Bureau : bientôt'}
                </a>
              </motion.div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm text-blue-100/80">
                {[
                  { icon: 'coins' as UniIconName, text: 'Gratuit pour les étudiants' },
                  { icon: 'wifiOff' as UniIconName, text: 'Fonctionne hors ligne' },
                  { icon: 'security' as UniIconName, text: 'Empreinte SHA-256 publiée' },
                ].map((item) => (
                  <span key={item.text} className="inline-flex items-center gap-2">
                    <UniIcon name={item.icon} weight="duotone" className="h-4 w-4 text-teal-200" />
                    {item.text}
                  </span>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <motion.div
                animate={reduced ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-black/30 ring-1 ring-white/20"
              >
                <img
                  src={heroIllustration}
                  alt="Un téléphone Android et un ordinateur portable affichant l’emploi du temps et les cours UniFlow"
                  width={1280}
                  height={720}
                  decoding="async"
                  className="aspect-video h-auto w-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: reduced ? 0 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -left-4 hidden sm:block"
              >
                <UniMascot
                  pose={android ? 'celebrate' : 'pointing'}
                  size={140}
                  bubble={android
                    ? <span>La version <strong>{android.version}</strong> est prête. On l’installe ?</span>
                    : <span>L’application arrive. En attendant, tout marche dans le <strong>navigateur</strong>.</span>}
                  bubbleSide="right"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trois canaux */}
        <section className="bg-[#f9fafb] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="mb-12 max-w-2xl"
            >
              <motion.p variants={fadeInUp} className="text-xs font-extrabold uppercase tracking-widest text-[#0d9488]">Choisissez votre appareil</motion.p>
              <motion.h2 variants={fadeInUp} className="mt-2 text-3xl font-black text-[#0f172a] sm:text-4xl">Une application par usage, les mêmes données partout</motion.h2>
              <motion.p variants={fadeInUp} className="mt-3 text-base font-medium text-slate-500">
                Les liens ci-dessous sont mis à jour par KERNEL FORGE à chaque publication : vous téléchargez
                toujours la dernière version.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid gap-8 lg:grid-cols-3"
            >
              <ChannelCard
                image={androidIllustration}
                alt="Téléphone Android scannant un QR code de présence dans UniFlow"
                eyebrow="Android"
                title="L’application mobile"
                description="Emploi du temps, cours, devoirs, notes, présence par QR code, forum et messagerie — dans la poche, même sans réseau."
                accent="teal"
              >
                {android ? (
                  <>
                    <DownloadButton release={android} label="Télécharger l’APK" icon="android" tone="teal" size="md" />
                    <ReleaseFacts release={android} />
                  </>
                ) : (
                  <StatusPill status={channels.android.status} soonLabel="Bientôt disponible" icon="android" />
                )}
                <p className="flex items-start gap-2 text-xs font-medium text-slate-500">
                  <UniIcon name="about" weight="duotone" className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9488]" />
                  Android 7.0 ou plus récent. Autorisez l’installation depuis cette source quand Android le demande.
                </p>
              </ChannelCard>

              <div id="bureau" className="scroll-mt-24">
                <ChannelCard
                  image={desktopIllustration}
                  alt="Ordinateur portable affichant une visioconférence et une feuille de présence UniFlow"
                  eyebrow="Windows · Linux · macOS"
                  title="La version de bureau"
                  description="Pour les enseignants et l’administration : visioconférence embarquée, feuille de présence automatique, exports PDF et Excel."
                  accent="navy"
                >
                  {channels.desktop.status === 'checking' ? (
                    <StatusPill status="checking" soonLabel="" icon="desktop" />
                  ) : (
                    <ul className="grid gap-2">
                      {channels.desktop.entries.map((entry) => (
                        <li key={entry.platform}>
                          {entry.release ? (
                            <DownloadButton release={entry.release} label={`Pour ${entry.label}`} icon={PLATFORM_ICON[entry.platform]} tone="navy" size="md" />
                          ) : (
                            <span className="inline-flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-500">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <UniIcon name={PLATFORM_ICON[entry.platform]} weight="duotone" className="h-5 w-5" />
                              </span>
                              {entry.label}
                              <span className="ml-auto rounded-full bg-[#eff3ff] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#1e3a8a]">Bientôt</span>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="flex items-start gap-2 text-xs font-medium text-slate-500">
                    <UniIcon name="video" weight="duotone" className="mt-0.5 h-4 w-4 shrink-0 text-[#1e3a8a]" />
                    La visioconférence hors ligne est réservée au bureau ; les participants sans application rejoignent depuis un lien local.
                  </p>
                </ChannelCard>
              </div>

              <ChannelCard
                image={webIllustration}
                alt="Fenêtre de navigateur affichant le tableau de bord UniFlow avec un badge d’installation"
                eyebrow="Navigateur"
                title="Le site, installable"
                description="Rien à télécharger : ouvrez UniFlow dans Chrome, Safari ou Firefox. Ajoutez-le à l’écran d’accueil pour l’utiliser comme une application."
                accent="sky"
              >
                <Link
                  to="/login"
                  className="inline-flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200/80 bg-white px-4 py-3 text-left text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1e3a8a]/30 hover:shadow-md"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0fdfa] text-[#0d9488]">
                    <UniIcon name="globe" weight="duotone" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-black leading-tight">Ouvrir UniFlow</span>
                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">Web, installable en PWA</span>
                  </span>
                  <UniIcon name="forward" weight="bold" className="ml-auto h-5 w-5 shrink-0 text-slate-400" />
                </Link>
                <p className="flex items-start gap-2 text-xs font-medium text-slate-500">
                  <UniIcon name="mobile" weight="duotone" className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9488]" />
                  Sur iPhone : Safari › Partager › « Sur l’écran d’accueil ».
                </p>
              </ChannelCard>
            </motion.div>

            {anySoon ? (
              <p className="mt-8 text-center text-sm font-medium text-slate-500">
                Les versions à venir sont publiées sur GitHub :{' '}
                <a href={channels.fallbackUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[#1e3a8a] hover:underline">
                  releases KERNEL-FORGE-G/uniflow-apps
                  <UniIcon name="externalLink" weight="bold" className="h-3.5 w-3.5" />
                </a>
              </p>
            ) : null}
          </div>
        </section>

        {/* Installation Android + notes de version */}
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_0.9fr]">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-8"
            >
              <div>
                <motion.p variants={fadeInUp} className="text-xs font-extrabold uppercase tracking-widest text-[#0d9488]">Installation Android</motion.p>
                <motion.h2 variants={fadeInUp} className="mt-2 text-3xl font-black text-[#0f172a]">Trois étapes, deux minutes</motion.h2>
              </div>
              <ol className="space-y-4">
                {ANDROID_INSTALL_STEPS.map((step, index) => (
                  <motion.li key={step.title} variants={fadeInUp} className="flex gap-4 rounded-2xl border border-slate-200/80 bg-[#f9fafb] p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e3a8a] text-base font-black text-white">{index + 1}</span>
                    <div>
                      <h3 className="text-base font-black text-[#0f172a]">{step.title}</h3>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">{step.detail}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
              {android?.sha256 ? (
                <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 rounded-2xl border border-teal-100 bg-[#f0fdfa] p-5 text-sm text-slate-600">
                  <UniIcon name="security" weight="duotone" className="h-6 w-6 shrink-0 text-[#0d9488]" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-black text-[#0f172a]">Vérifier le fichier</span>
                    <span className="block text-xs font-medium">
                      Empreinte SHA-256 de <span className="font-mono">{android.fileName || 'l’APK'}</span> : <span className="font-mono" title={android.sha256}>{shortSha(android.sha256)}</span>
                    </span>
                  </span>
                  <CopyButton value={android.sha256} label="Copier l’empreinte SHA-256 complète" />
                </motion.div>
              ) : null}
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-[#eff3ff] via-white to-[#f0fdfa] p-8"
            >
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#1e3a8a]">Notes de version</p>
              {android ? (
                <>
                  <h2 className="mt-2 text-2xl font-black text-[#0f172a]">UniFlow Mobile {android.version}</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{releaseMetaLine(android)}</p>
                  {notes.length ? (
                    <ul className="mt-5 space-y-2.5">
                      {notes.map((line) => (
                        <li key={line} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                          <UniIcon name="check" weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9488]" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-5 text-sm font-medium text-slate-500">Les nouveautés de cette version seront détaillées ici.</p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm font-medium text-slate-500">Les nouveautés apparaîtront ici à la première publication.</p>
              )}
              <div className="mt-8 flex justify-center">
                <UniMascot pose="headset" size={120} still safe bubble={<span>Une question sur l’installation ? Le <strong>forum</strong> et le groupe WhatsApp sont là.</span>} bubbleSide="left" />
              </div>
            </motion.aside>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-200 bg-[#f9fafb] py-20">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-center text-xs font-extrabold uppercase tracking-widest text-[#0d9488]">Questions fréquentes</p>
            <h2 className="mt-2 text-center text-3xl font-black text-[#0f172a]">Avant d’installer</h2>
            <div className="mt-10 space-y-3">
              {DOWNLOAD_FAQ.map((item) => (
                <details key={item.question} className="group rounded-2xl border border-slate-200/80 bg-white p-5 open:shadow-md">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-[#0f172a]">
                    {item.question}
                    <UniIcon name="chevronDown" weight="bold" className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Bandeau final */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Pas encore de compte ?</h2>
            <p className="max-w-xl text-base text-blue-100/90">
              Créez votre compte étudiant en une minute sur le web ou dans l’application : votre filière et votre
              niveau suffisent pour retrouver vos cours.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#1e3a8a] shadow-lg shadow-black/20 transition hover:-translate-y-0.5">
                Créer un compte
                <UniIcon name="forward" weight="bold" className="h-4 w-4" />
              </Link>
              <Link to="/presentation" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15">
                Voir la présentation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
