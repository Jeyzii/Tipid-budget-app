import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.VITE_DEV_API_PROXY ?? 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Production: built into backend/public/app and served at https://your-domain.com/app/
  // Development: '/' so Vite stays at http://localhost:5173/ with the dev proxy.
  base: mode === 'production' ? '/app/' : '/',
  build: {
    outDir: '../backend/public/app',
    emptyOutDir: true,
  },
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin requests in dev → no browser CORS / cookie issues with Sanctum
      '/api': { target: apiTarget, changeOrigin: true },
      '/sanctum': { target: apiTarget, changeOrigin: true },
    },
  },
}))
