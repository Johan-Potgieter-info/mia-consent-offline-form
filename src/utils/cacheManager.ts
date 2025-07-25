
// Cache management utilities for offline forms

// Browser API guards
const isBrowser = typeof window !== 'undefined';
const hasLocalStorage = typeof localStorage !== 'undefined';
const hasSessionStorage = typeof sessionStorage !== 'undefined';

/**
 * Clear all application caches including service worker caches
 */
export const clearAllCaches = async (): Promise<void> => {
  if (!isBrowser) return;

  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Service worker caches cleared');
    }

    // Clear localStorage
    if (hasLocalStorage) {
      localStorage.clear();
      console.log('localStorage cleared');
    }

    // Clear sessionStorage
    if (hasSessionStorage) {
      sessionStorage.clear();
      console.log('sessionStorage cleared');
    }

    // Force reload to reinitialize everything
    window.location.reload();
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
};

/**
 * Clear only form-related caches and data
 */
export const clearFormCaches = async (): Promise<void> => {
  if (!isBrowser) return;

  try {
    // Clear form-related localStorage items
    if (hasLocalStorage) {
      const formKeys = ['emergencyFormDraft', 'formSession'];
      formKeys.forEach(key => localStorage.removeItem(key));
    }

    // Clear form-related caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const formCacheNames = cacheNames.filter(name => 
        name.includes('form') || name.includes('mia-consent')
      );
      await Promise.all(
        formCacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    console.log('Form caches cleared');
  } catch (error) {
    console.error('Error clearing form caches:', error);
  }
};

/**
 * Force refresh of IndexedDB connection
 */
export const refreshIndexedDB = async (): Promise<void> => {
  if (!isBrowser) return;

  try {
    // Close any existing database connections
    const { initDB } = await import('./database/initialization');
    
    // Force a fresh database connection
    await initDB();
    console.log('IndexedDB connection refreshed');
  } catch (error) {
    console.error('Error refreshing IndexedDB:', error);
  }
};

/**
 * Check if the application is experiencing cache issues
 */
export const detectCacheIssues = (): boolean => {
  if (!isBrowser) return false;

  try {
    // Check if IndexedDB is available
    if (!window.indexedDB) {
      return true;
    }

    // Check if localStorage is corrupted
    if (hasLocalStorage) {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
      } catch {
        return true;
      }
    }

    return false;
  } catch {
    return true;
  }
};

/**
 * Force clear old cache versions and refresh
 */
export const clearOldCacheVersions = async (): Promise<void> => {
  if (!isBrowser) return;

  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCacheNames = cacheNames.filter(name => 
        name.includes('mia-consent-cache-v') && !name.includes('v8')
      );
      
      await Promise.all(
        oldCacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('Old cache versions cleared:', oldCacheNames);
    }
  } catch (error) {
    console.error('Error clearing old cache versions:', error);
  }
};
