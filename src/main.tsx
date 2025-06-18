
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Unregister old service workers to prevent conflicts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      // Unregister any old service workers
      if (registration.scope.includes('lovableproject.com') || 
          !registration.scope.includes('mia-consent-offline-form-50')) {
        console.log('Unregistering old service worker:', registration.scope);
        registration.unregister();
      }
    }
  });

  // Register the new service worker with cache busting
  window.addEventListener('load', () => {
    const swUrl = import.meta.env.PROD 
      ? '/mia-consent-offline-form-50/sw.js'
      : '/sw.js';
    
    navigator.serviceWorker.register(`${swUrl}?v=${Date.now()}`, { 
      scope: import.meta.env.PROD ? '/mia-consent-offline-form-50/' : '/' 
    })
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New SW available, will activate on next visit');
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
