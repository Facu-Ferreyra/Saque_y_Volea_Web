import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En Vercel, la dirección pública del sitio sale sola: Vercel define VERCEL_PROJECT_PRODUCTION_URL
// (ej. "saque-y-volea.vercel.app", o el dominio propio cuando se agregue). Con eso se arman las
// URLs absolutas de la vista previa al compartir (og:image en index.html).
// Fuera de Vercel se usa el valor de VITE_SITE_URL del archivo .env.
if (!process.env.VITE_SITE_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  process.env.VITE_SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
}

// Vite: servidor de desarrollo + build de producción.
// El plugin de React agrega soporte para JSX y Fast Refresh (recarga en caliente).
export default defineConfig({
  plugins: [react()],
})
