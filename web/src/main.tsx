import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import SessionExpiredModal from './components/SessionExpiredModal'
import { initGlobalSoundListeners } from './utils/sound'
import { createOfflineQueryClient, restorePersistedQueries, subscribePersistedQueries } from './lib/offline/queryPersistence'
import { startOfflineWriteQueue } from './lib/offline/writeQueue'
import { registerOfflineReplayHandlers } from './lib/offline/replayHandlers'

const DEPLOYMENT_RECOVERY_KEY = 'uniflow:deployment-recovery-at'

function recoverFromStaleDeployment(event?: Event) {
  event?.preventDefault?.()
  // Hors ligne, un chunk introuvable n'est pas un déploiement obsolète mais
  // l'absence de réseau : recharger relançait la page en boucle sur l'écran blanc.
  if (typeof navigator !== 'undefined' && !navigator.onLine) return
  try {
    const previousAttempt = Number(sessionStorage.getItem(DEPLOYMENT_RECOVERY_KEY) || '0')
    const now = Date.now()
    if (previousAttempt && now - previousAttempt < 30_000) return
    sessionStorage.setItem(DEPLOYMENT_RECOVERY_KEY, String(now))
  } catch {
    // Le rechargement reste utile si sessionStorage est indisponible.
  }
  window.location.reload()
}

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', recoverFromStaleDeployment)
  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event.reason?.message || event.reason || '')
    if (/Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk/i.test(message)) {
      recoverFromStaleDeployment(event)
    }
  })
}

initGlobalSoundListeners()

// Le réseau vers Appwrite Cloud est lent : on garde les lectures en cache, on
// ne retente qu'une fois, et le cache est persisté dans IndexedDB pour servir
// les pages hors ligne (voir `lib/offline/queryPersistence.ts`).
const queryClient = createOfflineQueryClient()

async function bootstrap() {
  // La restauration précède le premier rendu : sinon les requêtes partaient
  // avant que le cache soit relu et écrasaient les données hors ligne.
  await restorePersistedQueries(queryClient)
  subscribePersistedQueries(queryClient)
  registerOfflineReplayHandlers()
  startOfflineWriteQueue()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <App />
          <SessionExpiredModal />
        </HashRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
