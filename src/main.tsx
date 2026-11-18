import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Typefaces (both SIL OFL 1.1), bundled so the app works offline.
// Source Serif 4: optical sizes for titles and structure names; the lighter standard italic for Latin.
import '@fontsource-variable/source-serif-4/opsz.css'
import '@fontsource-variable/source-serif-4/wght-italic.css'
// Source Sans 3: everything read quickly, and numbers (tabular figures).
import '@fontsource-variable/source-sans-3'
import './styles/global.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
