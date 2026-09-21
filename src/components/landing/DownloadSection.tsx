import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { UniIcon, type UniIconName } from '../ui/UniIcon'
import { UniMascot } from '../mascot/UniMascot'
import { ScrollFloat } from '../ui/ScrollFloat'
import { fadeInUp, staggerContainer } from '../../utils/animations'
import { cn } from '../../utils/cn'
import {
  DESKTOP_PLATFORMS,
  RELEASE_PLATFORM_LABELS,
  findDesktopRelease,
  findRelease,
  releaseCaption,
  releaseFallbackUrl,
  useAppReleases,
  type AppRelease,
  type ReleasePlatform,
} from '../../lib/appReleases'

/**
 * Section « Télécharger l'application » de la landing.
 *
 * Les liens viennent de la collection `app_releases` (service `/app-releases`)
 * : l'APK Android est publié dans les releases GitHub de
 * `KERNEL-FORGE-G/uniflow-apps` et l'URL change à chaque version, donc rien
 * n'est codé en dur. Tant qu'aucune version n'est publiée (état initial du
 * 2026-09-21), le bouton devient « Version Android bientôt disponible » et
 * renvoie vers la page des releases GitHub.
 */

export const DOWNLOAD_SECTION_ID = 'telecharger'

const PLATFORM_ICON: Record<ReleasePlatform, UniIconName> = {
  android: 'android',
  windows: 'windows',
  linux: 'linux',
  macos: 'apple',
}

function ReleaseDetails({ release }: { release: AppRelease }) {
  if (!release.fileName && !release.sha256) return null
  return (
    <dl className="mt-3 grid gap-1 text-[11px] font-medium text-slate-500">
      {release.fileName ? (
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-slate-400">Fichier</dt>
          <dd className="break-all font-mono text-slate-600">{release.fileName}</dd>
        </div>
      ) : null}
      {release.sha256 ? (
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-slate-400">SHA-256</dt>
          <dd className="break-all font-mono text-slate-600" title={release.sha256}>{release.sha256.slice(0, 16)}…</dd>
        </div>
      ) : null}
    </dl>
  )
}

function DownloadButton({ release, label, icon, tone = 'primary', download = false }: {
  release: AppRelease
  label: string
  icon: UniIconName
  tone?: 'primary' | 'secondary'
  download?: boolean
}) {
  const caption = releaseCaption(release)
  return (
    <motion.a
      href={release.url}
      // Un binaire GitHub se télécharge dans l'onglet courant sans le quitter ;
      // `download` n'est qu'une indication (ignorée hors origine), le nom réel
      // vient du serveur.
      download={download ? release.fileName || true : undefined}
      rel="noopener noreferrer"
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group inline-flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-white shadow-lg transition-shadow hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto',
        tone === 'primary' ? 'bg-[#1e3a8a] hover:bg-[#2d4fa8] focus:ring-[#1e3a8a]/40' : 'bg-[#0d9488] hover:bg-[#14b8a8] focus:ring-[#0d9488]/40',
      )}
      data-testid={`download-${release.platform}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
        <UniIcon name={icon} weight="fill" className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black leading-tight sm:text-base">{label}</span>
        {caption ? <span className="mt-0.5 block text-xs font-semibold text-white/80">{caption}</span> : null}
      </span>
      <UniIcon name="download" weight="bold" className="ml-auto h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-y-0.5" />
    </motion.a>
  )
}

function SoonPill({ label, icon }: { label: string; icon: UniIconName }) {
  return (
    <span
      aria-disabled="true"
      className="inline-flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-4 text-left text-slate-500 sm:w-auto"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <UniIcon name={icon} weight="duotone" className="h-6 w-6" />
      </span>
      <span className="text-sm font-bold sm:text-base">{label}</span>
    </span>
  )
}

export function DownloadSection() {
  const { data: releases, isPending } = useAppReleases()
  const android = findRelease(releases, 'android')
  const desktop = findDesktopRelease(releases)
  const otherDesktop = DESKTOP_PLATFORMS
    .filter((platform) => platform !== desktop?.platform)
    .map((platform) => findRelease(releases, platform))
    .filter((release): release is AppRelease => Boolean(release))
  // Première visite sans miroir local : la Function répond en quelques
  // secondes (démarrage à froid). Le dire évite d'afficher « bientôt » à tort.
  const checking = isPending && !releases

  return (
    <section id={DOWNLOAD_SECTION_ID} className="scroll-mt-24 border-b border-slate-200 bg-white py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-8"
        >
          <div className="space-y-3">
            <motion.p variants={fadeInUp} className="text-xs font-extrabold uppercase tracking-widest text-[#0d9488]">
              Télécharger l’application
            </motion.p>
            <ScrollFloat containerClassName="text-3xl font-black text-[#0f172a] sm:text-4xl" animationDuration={0.8} stagger={0.02}>
              UniFlow dans votre poche, même sans réseau
            </ScrollFloat>
            <motion.p variants={fadeInUp} className="max-w-xl text-base font-medium text-slate-500">
              L’application Android native est distribuée dans les releases GitHub de KERNEL FORGE.
              Le site reste utilisable dans le navigateur et installable comme PWA.
            </motion.p>
          </div>

          <motion.div variants={fadeInUp} className="space-y-3">
            {checking ? (
              <span className="inline-flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-500 sm:w-auto" aria-live="polite">
                <UniIcon name="spinner" weight="bold" className="h-5 w-5 animate-spin text-[#1e3a8a]" />
                <span className="text-sm font-bold">Recherche de la dernière version Android…</span>
              </span>
            ) : android ? (
              <div>
                <DownloadButton release={android} label="Télécharger pour Android (APK)" icon="android" download />
                <ReleaseDetails release={android} />
              </div>
            ) : (
              <div className="space-y-2">
                <SoonPill label="Version Android bientôt disponible" icon="android" />
                <a
                  href={releaseFallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1e3a8a] hover:underline"
                >
                  Suivre les publications sur GitHub
                  <UniIcon name="externalLink" weight="bold" className="h-4 w-4" />
                </a>
              </div>
            )}
            <p className="flex items-start gap-2 text-xs font-medium text-slate-500">
              <UniIcon name="security" weight="duotone" className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9488]" />
              Fichier APK : autorisez l’installation depuis cette source quand Android le demande.
            </p>
            <Link to="/download" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1e3a8a] hover:underline">
              Toutes les versions, l’installation pas à pas et l’empreinte du fichier
              <UniIcon name="forward" weight="bold" className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:flex-wrap sm:items-start">
            {desktop ? (
              <div>
                <DownloadButton
                  release={desktop}
                  label={`Télécharger pour ${RELEASE_PLATFORM_LABELS[desktop.platform]}`}
                  icon={PLATFORM_ICON[desktop.platform]}
                  tone="secondary"
                  download
                />
                {otherDesktop.length ? (
                  <p className="mt-2 flex flex-wrap gap-x-3 text-xs font-semibold text-slate-500">
                    <span>Aussi pour</span>
                    {otherDesktop.map((release) => (
                      <a key={release.platform} href={release.url} rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#1e3a8a] hover:underline">
                        <UniIcon name={PLATFORM_ICON[release.platform]} weight="fill" className="h-3.5 w-3.5" />
                        {RELEASE_PLATFORM_LABELS[release.platform]}
                      </a>
                    ))}
                  </p>
                ) : null}
              </div>
            ) : (
              <SoonPill label="Desktop : bientôt" icon="desktop" />
            )}
            <Link
              to="/login"
              className="inline-flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200/80 bg-white px-5 py-4 text-left text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1e3a8a]/30 hover:shadow-md sm:w-auto"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0fdfa] text-[#0d9488]">
                <UniIcon name="globe" weight="duotone" className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-sm font-black leading-tight sm:text-base">Utiliser dans le navigateur</span>
                <span className="mt-0.5 block text-xs font-semibold text-slate-500">Web, installable en PWA</span>
              </span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto flex w-full max-w-md items-center justify-center"
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#eff3ff] via-white to-[#f0fdfa]" aria-hidden />
          <div className="relative flex flex-col items-center gap-6 px-8 py-10">
            <UniMascot
              pose={android ? 'celebrate' : 'pointing'}
              size={170}
              bubble={android
                ? <span>La version <strong>{android.version}</strong> est là. Installe-la, on continue hors ligne !</span>
                : <span>L’application Android arrive. En attendant, tout marche déjà dans le <strong>navigateur</strong>.</span>}
              bubbleSide="top"
            />
            <ul className="grid w-full gap-2 text-xs font-semibold text-slate-600">
              {[
                { icon: 'wifiOff' as UniIconName, text: 'Cours, emploi du temps et notes consultables hors ligne' },
                { icon: 'attendance' as UniIconName, text: 'Présence par QR code depuis le téléphone' },
                { icon: 'notifications' as UniIconName, text: 'Alertes de séance et de messagerie' },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 shadow-xs">
                  <UniIcon name={item.icon} weight="duotone" className="h-4 w-4 shrink-0 text-[#1e3a8a]" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
