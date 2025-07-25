
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
      mode === "development" && componentTagger(),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          cleanupOutdatedCaches: true
        },
        includeAssets: ["favicon.ico", "terms.html", "logo.png", "lovable-uploads/*.png"],
        manifest: {
          name: "Mia Healthcare",
          short_name: "Mia",
          start_url: basePath,
          scope: basePath,
          display: "standalone",
          theme_color: "#ef4805",
          background_color: "#ffffff",
          icons: [
            { src: "lovable-uploads/9a0a9907-375b-48ce-a1bc-8009bc27059c.png", sizes: "48x48", type: "image/png" },
            { src: "lovable-uploads/9a0a9907-375b-48ce-a1bc-8009bc27059c.png", sizes: "72x72", type: "image/png" },
            { src: "lovable-uploads/9a0a9907-375b-48ce-a1bc-8009bc27059c.png", sizes: "96x96", type: "image/png" },
            { src: "lovable-uploads/9a0a9907-375b-48ce-a1bc-8009bc27059c.png", sizes: "144x144", type: "image/png" },
            { src: "lovable-uploads/9a0a9907-375b-48ce-a1bc-8009bc27059c.png", sizes: "192x192", type: "image/png" },
            { src: "lovable-uploads/9a0a9907-375b-48ce-a1bc-8009bc27059c.png", sizes: "384x384", type: "image/png" },
            { src: "lovable-uploads/9a0a9907-375b-48ce-a1bc-8009bc27059c.png", sizes: "512x512", type: "image/png" }
          ]
        }
      })
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
    build: {
      sourcemap: true,
      rollupOptions: {
         input: "index.html",
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
            database: ['idb'],
            forms: ['react-hook-form']
          },
        },
      },
    },
  };
});
