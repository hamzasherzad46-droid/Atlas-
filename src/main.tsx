import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// One typeface, Hanken Grotesk (SIL OFL 1.1), bundled so the app works offline and makes no font requests.
import '@fontsource-variable/hanken-grotesk'
import './styles/global.css'
import App from './App'
import { rememberPlace, restorePlace } from './state/navMemory'

// Reopen the screen the student was on (if recent), then keep it saved as they move around.
restorePlace()
rememberPlace()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
