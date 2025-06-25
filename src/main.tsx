
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the correct base path for current environment
const getBasePath = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? '/' : '/mia-consent-offline-form/';
};

// Unregister old service workers to prevent conflicts
if ('serviceWorker' in navigator) {
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

  // Register the new service worker with correct path for both environments
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

// Register background and periodic sync events if supported
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((reg) => {
    // BACKGROUND SYNC
    if ('sync' in reg) {
      // Type assertion for sync functionality
      const syncReg = reg as any;
      if (syncReg.sync && typeof syncReg.sync.register === 'function') {
        syncReg.sync.register('sync-consent')
          .then(() => {
            console.log('[SW] Background sync registered');
          })
          .catch(console.error);
      }
    }

    // PERIODIC SYNC
    if ('periodicSync' in reg) {
      const periodicSyncReg = reg as any;
      if (periodicSyncReg.periodicSync && typeof periodicSyncReg.periodicSync.register === 'function') {
        periodicSyncReg.periodicSync.register('update-consent-data', {
          minInterval: 24 * 60 * 60 * 1000
        }).then(() => {
          console.log('[SW] Periodic sync registered');
        }).catch(console.error);
      }
    }
  });
}
