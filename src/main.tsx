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

// Wait briefly for the typeface (Latin set) so the first frame doesn't reflow when it swaps in;
// after FONT_WAIT_MS the app starts anyway with the fallback, and the swap happens later.
const FONT_WAIT_MS = 400
const fontReady = document.fonts?.load("400 1rem 'Hanken Grotesk Variable'", 'Atlas') ?? Promise.resolve()
void Promise.race([fontReady, new Promise((r) => setTimeout(r, FONT_WAIT_MS))])
  .catch(() => undefined)
  .then(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
