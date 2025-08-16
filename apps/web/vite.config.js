import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All requests starting with /_api go to FastAPI on 8000
      '/_api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/_api/, ''),
      },
    },
  },
})
