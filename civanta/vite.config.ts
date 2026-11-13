import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            // Intercept and cleanly handle ECONNREFUSED when backend is offline
            // Prevents Vite from spamming proxy error stack traces to the terminal
            if (res && 'writeHead' in res && !(res as any).headersSent) {
              (res as any).writeHead(503, { 'Content-Type': 'application/json' });
              (res as any).end(JSON.stringify({
                error: 'Backend offline',
                message: 'FastAPI backend on 127.0.0.1:8000 is not running. Operating in autonomous local simulation mode.'
              }));
            }
          });
        }
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && 'writeHead' in res && !(res as any).headersSent) {
              (res as any).writeHead(404, { 'Content-Type': 'application/json' });
              (res as any).end(JSON.stringify({ error: 'File not found / backend offline' }));
            }
          });
        }
      }
    }
  }
})
