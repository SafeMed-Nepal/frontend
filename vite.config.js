import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(
    {
      registerType: 'autoUpdate',
      manifest: {
        name: 'SafeMed Nepal',
        short_name: 'SafeMed',
        description: 'Doctor-verified traditional Nepali remedies',
        theme_color: '#d97706',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/remedies'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'remedies-cache',
              expiration: {
                maxEntries: 50,
              }
            }
          }
        ]
      }
    }), tailwindcss()],
  server: {
    port: 5173,
  },
})
