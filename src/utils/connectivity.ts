
/**
 * Check if we're truly online by testing actual Supabase service availability
 * without relying on database SELECT permissions (which are blocked by RLS).
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // 1) Primary: Check Supabase Auth health endpoint (does not require auth)
    const healthResp = await fetch('https://jofuqlexuxzamltxxzuq.supabase.co/auth/v1/health', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache',
    });

    if (healthResp.ok) {
      clearTimeout(timeoutId);
      console.log('Supabase Auth health check: SUCCESS');
      return true;
    }

    // 2) Fallback: Use a REST endpoint preflight (OPTIONS) that shouldn't require SELECT permissions
    const restController = new AbortController();
    const restTimeoutId = setTimeout(() => restController.abort(), 5000);

    const restResp = await fetch('https://jofuqlexuxzamltxxzuq.supabase.co/rest/v1/', {
      method: 'OPTIONS',
      signal: restController.signal,
      cache: 'no-cache',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnVxbGV4dXh6YW1sdHh4enVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDA2NjAsImV4cCI6MjA2NDY3NjY2MH0.Fq_Sx7NUeZF2k-erwrj_V-2npReXum9Cmuufsco3Cmw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnVxbGV4dXh6YW1sdHh4enVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDA2NjAsImV4cCI6MjA2NDY3NjY2MH0.Fq_Sx7NUeZF2k-erwrj_V-2npReXum9Cmuufsco3Cmw'
      }
    });

    clearTimeout(restTimeoutId);
    const isConnected = restResp.ok;
    console.log(`Supabase REST preflight connectivity: ${isConnected ? 'SUCCESS' : 'FAILED'} (status: ${restResp.status})`);
    return isConnected;
  } catch (error) {
    console.error('Connectivity check failed:', error);
    return false;
  }
};

export function initConnectivityMonitoring() {
  window.addEventListener("online", () => console.log("🔌 Online"));
  window.addEventListener("offline", () => console.log("❌ Offline"));
}

