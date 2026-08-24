import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import SessionExpiredModal from './components/SessionExpiredModal'
import { initGlobalSoundListeners } from './utils/sound'

const DEPLOYMENT_RECOVERY_KEY = 'uniflow:deployment-recovery-at'

function recoverFromStaleDeployment(event?: Event) {
  event?.preventDefault?.()
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
      <SessionExpiredModal />
    </HashRouter>
  </StrictMode>,
)
