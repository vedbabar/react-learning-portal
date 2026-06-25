import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tailwind v4 ships a first-class Vite plugin — no postcss.config or tailwind.config
// file needed. Tailwind scans your source automatically for class names.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true, // pop the browser when you run `npm run dev`
  },
})
