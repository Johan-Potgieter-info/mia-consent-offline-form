
import { checkSupabaseAvailability } from '@/integrations/supabase/client';

/**
 * Check if we're truly online by testing actual Supabase service availability
 * Delegates to centralized availability check in supabase client
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  return await checkSupabaseAvailability();
};

export function initConnectivityMonitoring() {
  window.addEventListener("online", () => console.log("🔌 Online"));
  window.addEventListener("offline", () => console.log("❌ Offline"));
}

