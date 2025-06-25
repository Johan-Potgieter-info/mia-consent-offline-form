
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isDev = mode === 'development';
  
  // Only use base path in production (GitHub Pages)
  const basePath = isProduction ? '/mia-consent-offline-form/' : '/';
  
  return {
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
        // Use generateSW strategy for better compatibility
        strategies: 'generateSW',
        devOptions: {
          enabled: false // Disable in dev to avoid conflicts
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
    base: basePath,
  };
});
