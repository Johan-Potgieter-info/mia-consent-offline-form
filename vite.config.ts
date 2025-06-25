import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const isPreview = process.env.LOVABLE_PREVIEW === 'true' || process.env.NODE_ENV === 'development';
const basePath = isPreview ? '/' : '/mia-consent-offline-form/';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['terms.html', 'favicon.ico', 'logo.png', 'manifest.json'],
      manifest: {
        name: 'Mia Healthcare',
        short_name: 'Mia',
        start_url: basePath,
        scope: basePath,
        display: 'standalone',
        icons: [
          { src: `${basePath}logo.png`, sizes: '192x192', type: 'image/png' }
        ]
      }
    }),
  ],
  base: basePath,
});
