import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Proxy API requests to the Flask backend.
      // In Docker, "backend" resolves to the backend container.
      // In production, Nginx handles this instead.
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
    },
  },
})
