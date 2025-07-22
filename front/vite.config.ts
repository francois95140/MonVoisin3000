import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [
    react(), 
    tailwindcss(),
  ],
  server: {
    // Option 1: Autoriser spécifiquement hainu.fr
    allowedHosts: [
      'hainu.fr',
      'localhost',
      '127.0.0.1',
      '192.168.1.91'
    ],    
    host: '0.0.0.0',
    port: 5173
  }
})

