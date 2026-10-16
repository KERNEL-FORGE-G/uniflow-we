/** Normalise `/Messaging/` ou `messaging` en `/messaging`. */
export function resolveServicePath(rawPath) {
  const trimmed = String(rawPath || '').trim().toLowerCase().replace(/\/+$/, '')
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/**
 * Chemins servis par `uniflow-api`, dans l'ordre de la documentation
 * (README, section Functions). À tenir aligné sur la table `services` de
 * `main.js` : la liste avait pris du retard (quatre services ajoutés le
 * 2026-09-21 sans y figurer), elle est remise au niveau avec `/app-releases`.
 */
export const SERVICE_PATHS = [
  '/academic-grades',
  '/academic-registration',
  '/account',
  '/admin-directory',
  '/app-releases',
  '/assistant',
  '/attendance-secure',
  '/contact-messages',
  '/forum-reactions',
  '/messaging',
  '/metrics',
  '/public-stats',
  '/subscription-payments',
  '/team-roster',
]
