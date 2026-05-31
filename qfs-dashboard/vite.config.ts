import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Ensure this import is here

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), // <-- MUST BE AT POSITION #1
    react(),       // <-- MUST BE AT POSITION #2
  ],
})