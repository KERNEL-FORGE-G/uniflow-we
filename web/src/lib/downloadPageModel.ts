import {
  DESKTOP_PLATFORMS,
  RELEASE_PLATFORM_LABELS,
  findRelease,
  formatSize,
  releaseFallbackUrl,
  type AppRelease,
  type ReleasePlatform,
} from './appReleasesModel.ts'

/**
 * Logique pure de la page `/download` (« Télécharger UniFlow »).
 *
 * La page présente trois canaux — Android, bureau (Windows, Linux, macOS) et
 * navigateur — à partir de la collection `app_releases`. Rien n'est codé en
 * dur : un canal dont aucune version n'est publiée s'affiche « bientôt » avec
 * la page des releases GitHub en repli, et bascule tout seul dès que l'admin
 * de la plateforme publie le lien depuis Paramètres › Applications.
 */

export const DOWNLOAD_PAGE_PATH = '/download'

export type ChannelStatus = 'checking' | 'available' | 'soon'

export type PlatformEntry = {
  platform: ReleasePlatform
  label: string
  release: AppRelease | null
}

export type DesktopChannel = {
  status: ChannelStatus
  /** Une ligne par système, dans l'ordre Windows, Linux, macOS. */
  entries: PlatformEntry[]
  /** Nombre de systèmes dont une version est publiée. */
  publishedCount: number
}

export type AndroidChannel = {
  status: ChannelStatus
  release: AppRelease | null
}

export type DownloadChannels = {
  android: AndroidChannel
  desktop: DesktopChannel
  /** Page des releases GitHub, proposée tant qu'un canal est « bientôt ». */
  fallbackUrl: string
}

/**
 * `releases` vaut `undefined` tant que ni le miroir local ni la Function n'ont
 * répondu : on affiche alors « recherche… » plutôt qu'un « bientôt » à tort
 * (démarrage à froid de la Function : quelques secondes à la première visite).
 */
export function buildDownloadChannels(releases: AppRelease[] | undefined, pending: boolean): DownloadChannels {
  const checking = pending && !releases
  const android = findRelease(releases, 'android')
  const entries = DESKTOP_PLATFORMS.map((platform) => ({
    platform,
    label: RELEASE_PLATFORM_LABELS[platform],
    release: findRelease(releases, platform),
  }))
  const publishedCount = entries.filter((entry) => entry.release).length
  return {
    android: { status: checking ? 'checking' : android ? 'available' : 'soon', release: android },
    desktop: { status: checking ? 'checking' : publishedCount > 0 ? 'available' : 'soon', entries, publishedCount },
    fallbackUrl: releaseFallbackUrl,
  }
}

/** « 21 septembre 2026 », ou vide si la date est absente ou illisible. */
export function formatPublishedDate(iso: string | null | undefined, locale = 'fr-FR'): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

/** Métadonnées affichées sous un bouton : version, taille, date — sans les vides. */
export function releaseMetaLine(release: AppRelease): string {
  return [
    release.version ? `Version ${release.version}` : '',
    formatSize(release.sizeBytes),
    formatPublishedDate(release.publishedAt) ? `publiée le ${formatPublishedDate(release.publishedAt)}` : '',
  ].filter(Boolean).join(' · ')
}

/**
 * Empreinte abrégée pour l'affichage (« 2804af7c…e11773 ») ; l'empreinte
 * complète reste accessible par le bouton « Copier » et l'attribut `title`.
 */
export function shortSha(sha256: string | null | undefined): string {
  const value = typeof sha256 === 'string' ? sha256.trim() : ''
  if (!value) return ''
  if (value.length <= 20) return value
  return `${value.slice(0, 8)}…${value.slice(-6)}`
}

/**
 * Les notes de version viennent d'un champ texte libre : on découpe sur les
 * retours à la ligne et les puces pour les afficher en liste, ou en un
 * paragraphe si l'auteur a écrit d'un seul trait.
 */
export function splitReleaseNotes(notes: string | null | undefined): string[] {
  if (!notes) return []
  return notes
    .split(/\r?\n|^\s*[-•*]\s+/m)
    .map((line) => line.replace(/^\s*[-•*]\s+/, '').trim())
    .filter(Boolean)
}

/** Étapes d'installation de l'APK, dans l'ordre — texte partagé avec la FAQ. */
export const ANDROID_INSTALL_STEPS: Array<{ title: string; detail: string }> = [
  {
    title: 'Téléchargez le fichier APK',
    detail: 'Depuis Chrome ou le navigateur de votre téléphone ; le fichier arrive dans « Téléchargements ».',
  },
  {
    title: 'Autorisez l’installation',
    detail: 'Android demande d’autoriser cette source une seule fois : acceptez, puis touchez « Installer ».',
  },
  {
    title: 'Connectez-vous',
    detail: 'Même compte que sur le web ; vos cours, votre emploi du temps et vos notes se synchronisent.',
  },
]

export const DOWNLOAD_FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Pourquoi Android affiche-t-il un avertissement à l’installation ?',
    answer:
      'L’application est distribuée hors Play Store, depuis les releases GitHub de KERNEL FORGE. Android signale toute installation venant d’une autre source : c’est attendu. Vérifiez l’empreinte SHA-256 affichée sur cette page si vous voulez vous assurer que le fichier est bien celui publié.',
  },
  {
    question: 'Quelle version d’Android faut-il ?',
    answer: 'Android 7.0 ou plus récent. L’application vise Android 16 et fonctionne aussi hors ligne : les données déjà chargées restent consultables sans réseau.',
  },
  {
    question: 'Comment serai-je informé des mises à jour ?',
    answer:
      'Cette page affiche toujours la dernière version publiée. Téléchargez le nouvel APK et installez-le par-dessus l’ancien : vos données locales sont conservées.',
  },
  {
    question: 'Et sur iPhone ou sur ordinateur ?',
    answer:
      'Sur iPhone, ouvrez UniFlow dans Safari et ajoutez-le à l’écran d’accueil : le site s’installe comme une application. La version de bureau (Windows, Linux, macOS), qui porte la visioconférence et la feuille de présence, apparaîtra ici dès sa publication.',
  },
]
