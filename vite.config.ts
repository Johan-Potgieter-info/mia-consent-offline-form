
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const basePath = isProduction ? '/mia-consent-offline-form/' : '/';

  return {
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'terms.html', 'logo.png', 'manifest.json'],
        manifest: {
          name: 'Mia Healthcare',
          short_name: 'Mia',
          start_url: basePath,
          scope: basePath,
          display: 'standalone',
          icons: [
            {
              src: `${basePath}logo.png`,
              sizes: '192x192',
              type: 'image/png'
            }
          ]
        }
      }),
    ].filter(Boolean),
    base: basePath,
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
});
