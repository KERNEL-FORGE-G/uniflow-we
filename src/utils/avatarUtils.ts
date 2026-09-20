/**
 * Utility functions for user avatars and dynamic placeholder handling using ui-avatars.com
 */

// List of GitHub usernames known to not have a profile picture or return 404
const BROKEN_GITHUB_AVATARS = new Set([
  'hawadja1',
  'h-hawadja1',
  'paccotiktok37',
  'FEBNCHAK',
  'Ange55-star',
])

const AVATAR_PALETTE = [
  '1e3a8a', // Deep Blue
  '0d9488', // Teal
  '7c3aed', // Purple
  '059669', // Emerald
  'e11d48', // Rose
  '0284c7', // Sky Blue
  'd97706', // Amber
  '4f46e5', // Indigo
]

/**
 * Returns a consistent hex color for a given name string
 */
export function getAvatarBgColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

/**
 * Generates a dynamic avatar placeholder URL using ui-avatars.com
 */
export function getUiAvatarUrl(name: string, bgHex?: string): string {
  const bg = bgHex || getAvatarBgColor(name)
  const cleanName = encodeURIComponent(name.trim() || 'User')
  return `https://ui-avatars.com/api/?name=${cleanName}&background=${bg}&color=fff&size=256&bold=true`
}

/**
 * Gets the best avatar URL for a user given their name and optional GitHub handle.
 * If the GitHub profile picture is known to be missing or returns 404,
 * uses ui-avatars.com directly to avoid 404 console errors.
 */
export function getAvatarUrl(name: string, githubHandle?: string, customUrl?: string): string {
  if (customUrl) return customUrl

  if (!githubHandle || BROKEN_GITHUB_AVATARS.has(githubHandle.trim())) {
    return getUiAvatarUrl(name)
  }

  return `https://github.com/${githubHandle.trim()}.png`
}

/**
 * Priorité d'affichage d'un avatar : la photo téléversée dans Appwrite
 * `uniflow_avatars` d'abord, puis l'URL explicite, puis le repli GitHub /
 * ui-avatars. Une chaîne vide est traitée comme « pas de photo » : les
 * documents dont l'attribut n'a jamais été renseigné contiennent `''`.
 */
export function resolveAvatarUrl(options: {
  name: string
  avatarFileId?: string | null
  githubHandle?: string
  customUrl?: string
}): string {
  const uploaded = avatarFileUrl(options.avatarFileId)
  return uploaded || getAvatarUrl(options.name, options.githubHandle, options.customUrl)
}

/**
 * URL publique d'un fichier du bucket `uniflow_avatars`.
 *
 * Écrit ici plutôt qu'importé de `lib/appwrite.ts` : ce module est utilisé par
 * des composants de présentation qui ne doivent pas tirer le client Appwrite
 * entier, et l'URL est une simple convention.
 */
export function avatarFileUrl(fileId?: string | null): string {
  if (!fileId) return ''
  const endpoint = String(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1').replace(/\/+$/, '')
  const projectId = String(import.meta.env.VITE_APPWRITE_PROJECT_ID || 'uniflow')
  const bucketId = String(import.meta.env.VITE_APPWRITE_AVATAR_BUCKET_ID || 'uniflow_assets')
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`
}

/**
 * React image onError event handler to fall back to ui-avatars.com if an avatar fails to load
 */
export function handleAvatarError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  name: string
) {
  const target = e.currentTarget
  target.onerror = null // Prevent potential infinite loop
  target.src = getUiAvatarUrl(name)
}
