
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";
import path from "path";

<<<<<<< HEAD
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
=======
export default defineConfig(({ mode }) => {
  const isPreview = !!process.env.LOVABLE_PREVIEW || mode === 'development';
  const basePath = isPreview ? '/' : '/mia-consent-offline-form/';

  return {
    base: basePath,
    plugins: [
      react(),
      isPreview && componentTagger(),
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
          start_url: basePath,
          scope: basePath,
          icons: [
            { 
              src: `${basePath}icon-uploads/2741077b-1d2b-4fa2-9829-1d43a1a54427.png`, 
              sizes: '192x192', 
              type: 'image/png' 
            }
          ],
          display: 'standalone'
        },
        strategies: 'generateSW',
        devOptions: {
          enabled: false
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
  };
>>>>>>> a8cb6c8a367c1e95b8f75ed354c5492789feddab
});
