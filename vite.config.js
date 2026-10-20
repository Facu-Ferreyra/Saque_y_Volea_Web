import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite: servidor de desarrollo + build de producción.
// El plugin de React agrega soporte para JSX y Fast Refresh (recarga en caliente).
export default defineConfig({
  plugins: [react()],
})
