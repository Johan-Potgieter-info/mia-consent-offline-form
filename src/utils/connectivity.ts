/**
 * Connectivity utility for real-time online/offline detection
 * Uses server ping to validate actual backend availability
 */

let isOnlineCache = navigator.onLine;
let lastPingTime = 0;
const PING_INTERVAL = 5000; // Reduced to 5 seconds for better responsiveness
const PING_TIMEOUT = 3000; // Reduced to 3 seconds

/**
 * Check if we're truly online by pinging Supabase
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Always do a fresh check for critical operations (form submission)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT);
    
    console.log('🌐 Checking server connectivity...');
    
    // Use Supabase health check endpoint
    const response = await fetch('https://jofuqlexuxzamltxxzuq.supabase.co/rest/v1/', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnVxbGV4dXh6YW1sdHh4enVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDA2NjAsImV4cCI6MjA2NDY3NjY2MH0.Fq_Sx7NUeZF2k-erwrj_V-2npReXum9Cmuufsco3Cmw'
      }
    });
    
    clearTimeout(timeoutId);
    isOnlineCache = response.ok;
    lastPingTime = now;
    
    console.log('🌐 Server connectivity check result:', isOnlineCache ? 'ONLINE ✅' : 'OFFLINE ❌');
    return isOnlineCache;
  } catch (error) {
    console.log('🌐 Server ping failed:', error.message || error);
    isOnlineCache = false;
    lastPingTime = now;
    return false;
  }
};

/**
 * Get current connectivity status (uses cached result if recent)
 */
export const getCurrentConnectivity = (): boolean => {
  const now = Date.now();
  
  // Use cached result if recent and successful
  if (isOnlineCache && (now - lastPingTime < PING_INTERVAL)) {
    return isOnlineCache && navigator.onLine;
  }
  
  // Otherwise return browser state only (will trigger fresh check soon)
  return navigator.onLine;
};

/**
 * Initialize connectivity monitoring
 */
export const initConnectivityMonitoring = () => {
  // Listen to browser online/offline events
  window.addEventListener('online', () => {
    console.log('🌐 Browser came online');
    checkServerConnectivity();
  });
  
  window.addEventListener('offline', () => {
    console.log('🌐 Browser went offline');
    isOnlineCache = false;
  });
  
  // Initial connectivity check
  checkServerConnectivity();
};
