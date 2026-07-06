import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // относительные пути — для GitHub Pages
  server: { port: 5173 },
})
