
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the correct base path for current environment
const getBasePath = () => {
  const isDev = import.meta.env.DEV;
  const isPreview = window.location.hostname.includes('lovable.app') || window.location.hostname.includes('lovableproject.com');
  
  // Only use the GitHub Pages path in actual production builds
  if (!isDev && !isPreview) {
    return '/mia-consent-offline-form/';
  }
  return '/';
};

// Only register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Unregister old service workers to prevent conflicts
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      // Unregister any old service workers
      if (registration.scope.includes('lovableproject.com') ||
          (!registration.scope.includes('mia-consent-offline-form') && !import.meta.env.DEV)) {
        console.log('Unregistering old service worker:', registration.scope);
        registration.unregister();
      }
    }
  });

  window.addEventListener('load', () => {
    const basePath = getBasePath();
    const swUrl = `${basePath}sw.js`;
    
    console.log('Attempting to register SW at:', swUrl);
    console.log('Current environment:', import.meta.env.DEV ? 'development' : 'production');
    
    navigator.serviceWorker.register(swUrl, { 
      scope: basePath
    })
      .then((registration) => {
        console.log('✅ Mia Healthcare SW registered successfully:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New SW available, will activate on next visit');
              }
            });
          }
        });

        // Force update check every 5 minutes
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
      })
      .catch((registrationError) => {
        console.error('❌ SW registration failed:', registrationError);
        console.log('Attempted SW URL:', swUrl);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
