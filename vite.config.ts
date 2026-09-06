import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Repo adı GitHub Pages alt yolu için burada ve .github/workflows/deploy.yml içinde kullanılıyor.
const base = '/kitap-okuma-takibi/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      base,
      manifest: {
        id: base,
        name: 'Kitap Okuma Takip',
        short_name: 'Kitap Takip',
        description: 'Herhangi bir kitap için okuma ilerlemesini takip eden, tamamen offline çalışan uygulama.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#18181b',
        lang: 'tr',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'pwa-icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
