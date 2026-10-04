import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Bootstrap 5 instalado con npm, importado aquí para aplicarlo globalmente.
import 'bootstrap/dist/css/bootstrap.min.css'

// Estilos propios: van después de Bootstrap para poder sobrescribirlo.
import './index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
