
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const basePath = isProduction ? '/mia-consent-offline-form/' : '/';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          cleanupOutdatedCaches: true
        },
        includeAssets: ["favicon.ico", "terms.html", "logo.png", "assets/*.png"],
        manifest: {
          name: "Mia Healthcare Consent Form",
          short_name: "Mia Healthcare",
          start_url: basePath,
          scope: basePath,
          display: "standalone",
          theme_color: "#ef4805",
          background_color: "#ffffff",
          icons: [
            { src: "assets/mia-logo.png", sizes: "48x48", type: "image/png" },
            { src: "assets/mia-logo.png", sizes: "72x72", type: "image/png" },
            { src: "assets/mia-logo.png", sizes: "96x96", type: "image/png" },
            { src: "assets/mia-logo.png", sizes: "144x144", type: "image/png" },
            { src: "assets/mia-logo.png", sizes: "192x192", type: "image/png" },
            { src: "assets/mia-logo.png", sizes: "384x384", type: "image/png" },
            { src: "assets/mia-logo.png", sizes: "512x512", type: "image/png" }
          ]
        }
      })
    ].filter(Boolean),
    base: './',
    server: {
      host: "::",
      port: 8080
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
         input: "index.html",
        output: {
        },
      },
    },
  };
});
