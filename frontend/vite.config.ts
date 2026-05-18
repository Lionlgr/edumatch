import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api is proxied to the port-forwarded backends.
// Istio Gateway strips /api in prod; in dev we strip it here as well so
// the same fetch('/api/tutors') call works in both environments.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api/auth': {
        target: 'http://localhost:18080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      '/api/users': {
        target: 'http://localhost:18080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      '/api/tutors': {
        target: 'http://localhost:18081',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
