import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import net from 'net'

let isBackendAlive = false;
let lastProbeTime = 0;

function checkBackendStatus(callback: (alive: boolean) => void) {
  const now = Date.now();
  // Cache status for 3 seconds to avoid probing on every sub-request
  if (now - lastProbeTime < 3000) {
    return callback(isBackendAlive);
  }

  const socket = new net.Socket();
  socket.setTimeout(250);

  socket.once('connect', () => {
    isBackendAlive = true;
    lastProbeTime = Date.now();
    socket.destroy();
    callback(true);
  });

  socket.once('error', () => {
    isBackendAlive = false;
    lastProbeTime = Date.now();
    socket.destroy();
    callback(false);
  });

  socket.once('timeout', () => {
    isBackendAlive = false;
    lastProbeTime = Date.now();
    socket.destroy();
    callback(false);
  });

  socket.connect(8000, '127.0.0.1');
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'smart-backend-guard',
      configureServer(server) {
        // Intercept /api and /uploads BEFORE Vite's http-proxy ever sees them
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          if (url.startsWith('/api') || url.startsWith('/uploads')) {
            checkBackendStatus((alive) => {
              if (alive) {
                // Backend is alive on 127.0.0.1:8000 -> forward to proxy
                next();
              } else {
                // Backend is offline -> respond immediately with 503
                // Do NOT call next(), completely preventing Vite http-proxy ECONNREFUSED terminal errors
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'Backend offline',
                  message: 'FastAPI backend on 127.0.0.1:8000 is offline. Running in autonomous client mode.'
                }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
