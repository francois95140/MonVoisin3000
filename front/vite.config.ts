import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MonVoisin3000',
        short_name: 'MonVoisin',
        description: 'Application de voisinage et de communication locale',
        theme_color: '#6366f1',
        background_color: '#1a1a2e',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Conversations',
            short_name: 'Chat',
            description: 'Accéder directement aux conversations',
            url: '/convs',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Événements',
            short_name: 'Events',
            description: 'Voir les événements locaux',
            url: '/evenements',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      devOptions: {
        enabled: true // Enable PWA in development
      }
    })
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

