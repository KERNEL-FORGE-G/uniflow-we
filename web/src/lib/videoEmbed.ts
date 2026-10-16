/**
 * Construction des URL YouTube (logique pure, testée sous `node --test`).
 *
 * Le lecteur de la page Présentation chargeait l'iframe d'emblée et comptait
 * sur `onError` pour afficher un repli : cet événement ne se déclenche jamais
 * sur une iframe inter-origine, donc un blocage (réseau, extension, CSP)
 * laissait un rectangle noir. On affiche d'abord la vignette `i.ytimg.com`
 * (autorisée par la CSP) et on ne monte l'iframe qu'au clic.
 */

export const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export function isYouTubeId(value: string): boolean {
  return YOUTUBE_ID_PATTERN.test(value)
}

/** Extrait l'identifiant d'une URL youtu.be / youtube.com / embed, ou renvoie l'identifiant tel quel. */
export function youtubeIdFrom(input: string): string | null {
  const trimmed = input.trim()
  if (isYouTubeId(trimmed)) return trimmed
  try {
    const url = new URL(trimmed)
    if (url.hostname === 'youtu.be') return isYouTubeId(url.pathname.slice(1)) ? url.pathname.slice(1) : null
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname)) {
      const fromQuery = url.searchParams.get('v')
      if (fromQuery && isYouTubeId(fromQuery)) return fromQuery
      const match = /\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})/.exec(url.pathname)
      return match ? match[1] : null
    }
  } catch {
    // Pas une URL : traité plus haut comme identifiant brut.
  }
  return null
}

export type YouTubeThumbnailQuality = 'hqdefault' | 'mqdefault' | 'sddefault' | 'maxresdefault'

export function youtubeThumbnailUrl(id: string, quality: YouTubeThumbnailQuality = 'hqdefault'): string {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`
}

/** Iframe sans cookies ; `autoplay` sert au chargement différé (le clic sur la vignette vaut lecture). */
export function youtubeEmbedUrl(id: string, options: { autoplay?: boolean; start?: number } = {}): string {
  const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' })
  if (options.autoplay) params.set('autoplay', '1')
  if (options.start && options.start > 0) params.set('start', String(Math.floor(options.start)))
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}
