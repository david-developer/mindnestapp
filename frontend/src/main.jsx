import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './custom.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'

// capture beforeinstallprompt as early as possible
// the event fires very early in page load - before React mounts
// we store it on window so InstallPrompt can read it later
window.__deferredInstallPrompt = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__deferredInstallPrompt = e
  // notify any listeners (the InstallPrompt component) that the event arrived
  window.dispatchEvent(new CustomEvent('pwa-install-available'))
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)