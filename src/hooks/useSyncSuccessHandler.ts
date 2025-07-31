import { useEffect, useRef } from 'react';
import { useDialogStates } from './useDialogStates';

interface UseSyncSuccessHandlerProps {
  isOnline: boolean;
  syncData: () => Promise<{ success: number; failed: number; syncedForms: any[] }>;
}

export const useSyncSuccessHandler = ({ isOnline, syncData }: UseSyncSuccessHandlerProps) => {
  const wasOffline = useRef(!isOnline);
  const { 
    setShowSyncSuccessDialog, 
    setSyncedForms, 
    setSyncStats 
  } = useDialogStates();

  useEffect(() => {
    const handleSyncSuccess = async () => {
      // Only trigger sync success dialog when coming back online
      if (wasOffline.current && isOnline) {
        try {
          const results = await syncData();
          
          if (results.success > 0) {
            setSyncedForms(results.syncedForms);
            setSyncStats({ success: results.success, failed: results.failed });
            setShowSyncSuccessDialog(true);
          }
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }
      
      wasOffline.current = !isOnline;
    };

    handleSyncSuccess();
  }, [isOnline, syncData, setSyncedForms, setSyncStats, setShowSyncSuccessDialog]);

  return null; // This hook only handles side effects
};