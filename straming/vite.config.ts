import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,       // Expose on 0.0.0.0 — needed for Flatpak OBS sandbox
    cors: true,
  },
})
