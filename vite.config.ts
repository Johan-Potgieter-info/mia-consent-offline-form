import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['terms.html', 'favicon.ico', 'logo.png', 'manifest.json'],
      manifest: {
        name: 'Mia Healthcare',
        short_name: 'Mia',
        start_url: '/mia-consent-offline-form/',
        scope: '/mia-consent-offline-form/',
        icons: [
          { src: '/mia-consent-offline-form/logo.png', sizes: '192x192', type: 'image/png' }
        ],
        display: 'standalone'
      }
    }),
  ],
  base: mode === 'production' ? '/mia-consent-offline-form/' : '/',
}));
