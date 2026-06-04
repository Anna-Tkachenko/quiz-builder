import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves the site under /quiz-builder/; dev stays at /
  base: mode === 'production' ? '/quiz-builder/' : '/',
}))
