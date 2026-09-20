/**
 * Fermeture de session, en un seul endroit.
 *
 * Symptôme corrigé (2026-09-20) : plusieurs boutons « Se déconnecter »
 * n'avaient pas le même effet — l'un naviguait sans supprimer la session
 * Appwrite, l'autre supprimait la session mais laissait l'état React
 * « connecté » à l'écran, et le minuteur d'inactivité avait sa propre copie.
 * Chaque appelant (AppLayout, AdminLayout, menu mobile, IdleTimer, Paramètres)
 * passe désormais par `terminateSession()`.
 */

export const LOCAL_SESSION_KEYS = [
  'uniflow_account_type',
  'uniflow_user',
  'uniflow_access_token',
  'uniflow_refresh_token',
] as const

export type LogoutReason = 'user' | 'idle_timeout' | 'account_deleted' | 'expired'

export const LOGOUT_NOTICES: Record<LogoutReason, string> = {
  user: 'Vous êtes déconnecté.',
  idle_timeout: 'Vous avez été déconnecté après 30 minutes d’inactivité.',
  account_deleted: 'Votre compte a été supprimé. Merci d’avoir utilisé UniFlow.',
  expired: 'Votre session a expiré, reconnectez-vous.',
}

export interface SessionTerminator {
  /** Supprime la session Appwrite courante ; doit tolérer une session déjà expirée. */
  deleteRemoteSession: () => Promise<void>
  clearSnapshot: () => Promise<void>
  unsubscribeRealtime: () => void
  clearQueryCache: () => void
  storage?: Pick<Storage, 'removeItem'>
  /** Publie l'événement de déconnexion volontaire (distinct de « session expirée »). */
  announce?: (reason: LogoutReason) => void
}

/**
 * Ordre volontaire : on coupe d'abord le serveur (une erreur réseau ne doit
 * pas empêcher le nettoyage local), puis tout ce qui pourrait faire croire à
 * l'écran que l'utilisateur est encore connecté.
 */
export async function terminateSession(deps: SessionTerminator, reason: LogoutReason = 'user'): Promise<{ remoteDeleted: boolean }> {
  let remoteDeleted = true
  try {
    await deps.deleteRemoteSession()
  } catch {
    remoteDeleted = false
  }
  deps.unsubscribeRealtime()
  const storage = deps.storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined)
  for (const key of LOCAL_SESSION_KEYS) {
    try { storage?.removeItem(key) } catch { /* stockage indisponible */ }
  }
  try { await deps.clearSnapshot() } catch { /* IndexedDB indisponible */ }
  deps.clearQueryCache()
  deps.announce?.(reason)
  return { remoteDeleted }
}

/** État de navigation transmis à la page de connexion après une déconnexion. */
export function logoutNavigationState(reason: LogoutReason) {
  return { reason, notice: LOGOUT_NOTICES[reason] }
}
