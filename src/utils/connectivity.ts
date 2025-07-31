
/**
 * Check if we're truly online by testing actual database operations
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Test actual database connectivity with a simple query
    const response = await fetch('https://jofuqlexuxzamltxxzuq.supabase.co/rest/v1/consent_forms?select=id&limit=1', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnVxbGV4dXh6YW1sdHh4enVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDA2NjAsImV4cCI6MjA2NDY3NjY2MH0.Fq_Sx7NUeZF2k-erwrj_V-2npReXum9Cmuufsco3Cmw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnVxbGV4dXh6YW1sdHh4enVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDA2NjAsImV4cCI6MjA2NDY3NjY2MH0.Fq_Sx7NUeZF2k-erwrj_V-2npReXum9Cmuufsco3Cmw'
      }
    });

    clearTimeout(timeoutId);
    const isConnected = response.ok;
    console.log(`Database connectivity test: ${isConnected ? 'SUCCESS' : 'FAILED'} (status: ${response.status})`);
    return isConnected;
  } catch (error) {
    console.error('Database connectivity check failed:', error);
    return false;
  }
};
export function initConnectivityMonitoring() {
  window.addEventListener("online", () => console.log("🔌 Online"));
  window.addEventListener("offline", () => console.log("❌ Offline"));
}
