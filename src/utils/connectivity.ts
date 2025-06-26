
/**
 * Connectivity utility for real-time online/offline detection
 * Uses server ping to validate actual backend availability
 */

let isOnlineCache = navigator.onLine;
let lastPingTime = 0;
const PING_INTERVAL = 10000; // 10 seconds
const PING_TIMEOUT = 5000; // 5 seconds

/**
 * Check if we're truly online by pinging the server
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Use cached result if recent ping was successful
  if (isOnlineCache && (now - lastPingTime < PING_INTERVAL)) {
    return isOnlineCache;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT);
    
    const response = await fetch('/api/ping', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    isOnlineCache = response.ok;
    lastPingTime = now;
    
    return isOnlineCache;
  } catch (error) {
    console.log('Server ping failed:', error);
    isOnlineCache = false;
    lastPingTime = now;
    return false;
  }
};

/**
 * Get current connectivity status (uses cached result)
 */
export const getCurrentConnectivity = (): boolean => {
  return isOnlineCache && navigator.onLine;
};

/**
 * Initialize connectivity monitoring
 */
export const initConnectivityMonitoring = () => {
  // Listen to browser online/offline events
  window.addEventListener('online', () => {
    console.log('Browser came online');
    checkServerConnectivity();
  });
  
  window.addEventListener('offline', () => {
    console.log('Browser went offline');
    isOnlineCache = false;
  });
  
  // Initial connectivity check
  checkServerConnectivity();
};
