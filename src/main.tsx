import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Typefaces (all SIL OFL 1.1), bundled so the app works offline:
// Libre Caslon Display for titles, Libre Caslon Text (italic) for Latin names and margin notes,
// Libre Franklin for reading, DM Mono for references, counts and clocks.
import '@fontsource/libre-caslon-display/400.css'
import '@fontsource/libre-caslon-text/400.css'
import '@fontsource/libre-caslon-text/400-italic.css'
import '@fontsource-variable/libre-franklin'
import '@fontsource/dm-mono/400.css'
import './styles/global.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
