
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Unregister old service workers to prevent conflicts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      // Unregister any old service workers
      if (registration.scope.includes('lovableproject.com') ||
          !registration.scope.includes('mia-consent-offline-form')) {
        console.log('Unregistering old service worker:', registration.scope);
        registration.unregister();
      }
    }
  });

  // Register the new service worker with cache busting and proper error handling
  window.addEventListener('load', () => {
    const swUrl = import.meta.env.PROD
      ? '/mia-consent-offline-form/sw.js'
      : '/sw.js';
    
    // Add timestamp for cache busting and better error handling
    navigator.serviceWorker.register(`${swUrl}?v=${Date.now()}`, { 
      scope: import.meta.env.PROD ? '/mia-consent-offline-form/' : '/'
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

// Register background and periodic sync events if supported
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((reg) => {
    if ('sync' in reg) {
    }

        minInterval: 24 * 60 * 60 * 1000
      }).then(() => {
        console.log("[SW] Periodic sync registered");
    }
    }
    }
        console.log('[SW] Periodic sync registered');
    }
  });
}

// Register background and periodic sync events if supported
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((reg) => {
    if ('sync' in reg) {
    }

        minInterval: 24 * 60 * 60 * 1000
      }).then(() => {
        console.log("[SW] Periodic sync registered");
    }
  });
}

// Register background and periodic sync events if supported
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((reg) => {
    // BACKGROUND SYNC
    if ('sync' in reg) {
        .then(() => {
        })
    }

    // PERIODIC SYNC
    if ('periodicSync' in reg) {
      (reg as any).periodicSync.register('update-consent-data', {
        minInterval: 24 * 60 * 60 * 1000 // 1 day
      }).then(() => {
        console.log('[SW] Periodic sync registered');
    }
  });
}
