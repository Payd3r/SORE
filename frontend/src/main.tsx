import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import 'material-symbols/outlined.css'
import './mobile/styles/design-system-pwa.css'
import App from './App.tsx'
import 'lazysizes'
import 'lazysizes/plugins/attrchange/ls.attrchange'

// Service Worker solo in produzione (in dev non esiste, Vite restituirebbe index.html → MIME text/html)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/service-worker.js')
  })
}

const app = <App />

createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? <StrictMode>{app}</StrictMode> : app,
)

