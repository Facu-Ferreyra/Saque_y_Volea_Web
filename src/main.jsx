import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// Tipografías servidas desde el propio sitio (sin pedirle nada a Google: más rápido y más privado)
import '@fontsource-variable/archivo/wdth.css' // incluye el eje de ancho (font-stretch)
import '@fontsource-variable/inter'
import './styles.css'

// Punto de entrada: monta <App /> dentro del <div id="root"> de index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
