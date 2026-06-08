import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Super Productivity's Local REST API (default port 3876).
// Override with SP_API_TARGET if you changed it.
const SP_API_TARGET = process.env.VITE_SUPER_PRODUCTIVITY_API_URL || process.env.SP_API_TARGET || 'http://127.0.0.1:3876'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,       // Expose on 0.0.0.0 — needed for Flatpak OBS sandbox
    cors: true,
    proxy: {
      // Proxy the Super Productivity Local REST API through the dev server.
      //
      // SP deliberately rejects any request that carries a browser `Origin`
      // header (anti-CSRF: stops random websites reading/modifying tasks), so
      // the browser cannot call it directly. Routing through Vite makes the
      // browser request same-origin; Vite then forwards to SP with the Origin
      // header stripped, which SP accepts (intended for local tools/scripts).
      '/sp-api': {
        target: SP_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sp-api/, ''),
        ws: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Remove browser Origin/Referer so SP's web-origin guard passes.
            proxyReq.removeHeader('origin')
            proxyReq.removeHeader('referer')
          })
        },
      },
    },
  },
})
