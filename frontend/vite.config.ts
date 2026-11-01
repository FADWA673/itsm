import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Échoue si le port est occupé au lieu de changer
    host: true,
    cors: true,
    // Proxy pour rediriger les appels API vers le backend
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
