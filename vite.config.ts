
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      includeAssets: ['terms.html', 'favicon.ico', 'logo.png', 'manifest.json', '404.html'],
      manifest: {
        name: 'Mia Healthcare',
        short_name: 'Mia',
        start_url: '/mia-consent-offline-form/',
        scope: '/mia-consent-offline-form/',
        icons: [
          { src: '/mia-consent-offline-form/icon-uploads/2741077b-1d2b-4fa2-9829-1d43a1a54427.png', sizes: '192x192', type: 'image/png' }
        ],
        display: 'standalone'
      }
    }),
  ].filter(Boolean),
  server: {
    host: "::",
    port: 8080
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: mode === 'production' ? '/mia-consent-offline-form/' : '/',
}));
