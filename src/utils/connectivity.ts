
/**
 * Check if we're truly online by pinging Supabase
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://jofuqlexuxzamltxxzuq.supabase.co/rest/v1/', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnVxbGV4dXh6YW1sdHh4enVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDA2NjAsImV4cCI6MjA2NDY3NjY2MH0.Fq_Sx7NUeZF2k-erwrj_V-2npReXum9Cmuufsco3Cmw'
      }
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Connectivity check failed:', error);
    return false;
  }
};
export function initConnectivityMonitoring() {
  window.addEventListener("online", () => console.log("🔌 Online"));
  window.addEventListener("offline", () => console.log("❌ Offline"));
}
