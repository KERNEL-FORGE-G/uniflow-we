/** Normalise `/Messaging/` ou `messaging` en `/messaging`. */
export function resolveServicePath(rawPath) {
  const trimmed = String(rawPath || '').trim().toLowerCase().replace(/\/+$/, '')
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/** Chemins servis par `uniflow-api`, dans l'ordre de la documentation. */
export const SERVICE_PATHS = [
  '/academic-grades',
  '/academic-registration',
  '/admin-directory',
  '/attendance-secure',
  '/contact-messages',
  '/forum-reactions',
  '/messaging',
  '/subscription-payments',
  '/team-roster',
]
