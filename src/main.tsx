import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import SessionExpiredModal from './components/SessionExpiredModal'
import { initGlobalSoundListeners } from './utils/sound'

initGlobalSoundListeners()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
      <SessionExpiredModal />
    </HashRouter>
  </StrictMode>,
)

