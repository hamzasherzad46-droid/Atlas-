import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Libre Franklin (SIL OFL 1.1), bundled so it works offline. Upright and italic, weights 100–900.
import '@fontsource-variable/libre-franklin'
import '@fontsource-variable/libre-franklin/wght-italic.css'
import './styles/global.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
