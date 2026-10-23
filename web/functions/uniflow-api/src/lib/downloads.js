/**
 * Compteur de téléchargements — logique pure (testée sous `node --test`).
 *
 * Aucun chiffre de départ : un compteur neuf vaut 0 et ne grandit que lorsqu'un
 * visiteur clique réellement sur un lien de téléchargement.
 */

export const DOWNLOAD_COLLECTION = 'app_downloads'
export const DOWNLOAD_PLATFORMS = ['android', 'windows', 'linux', 'macos', 'web']

export function isDownloadPlatform(value) {
  return typeof value === 'string' && DOWNLOAD_PLATFORMS.includes(value)
}

/** Totaux à partir des documents `app_downloads` (`$id` = plateforme, `count` = clics). */
export function summarizeDownloads(documents = []) {
  const platforms = Object.fromEntries(DOWNLOAD_PLATFORMS.map((platform) => [platform, 0]))
  for (const doc of documents) {
    if (!isDownloadPlatform(doc?.$id)) continue
    const count = Number(doc.count)
    platforms[doc.$id] = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0
  }
  const total = Object.values(platforms).reduce((sum, count) => sum + count, 0)
  return { total, platforms }
}
