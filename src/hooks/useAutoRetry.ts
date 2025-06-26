
import { useEffect, useRef } from 'react';
import { useConnectivity } from './useConnectivity';
import { getReadyForRetry } from '../utils/submissionQueue';
import { useToast } from './use-toast';

interface UseAutoRetryProps {
  onRetrySubmissions: () => Promise<void>;
  isEnabled?: boolean;
}

export const useAutoRetry = ({ onRetrySubmissions, isEnabled = true }: UseAutoRetryProps) => {
  const { isOnline } = useConnectivity();
  const { toast } = useToast();
  const retryIntervalRef = useRef<NodeJS.Timeout>();
  const wasOfflineRef = useRef(!isOnline);

  // Auto-retry when coming back online
  useEffect(() => {
    if (isOnline && wasOfflineRef.current && isEnabled) {
      console.log('Device came online, checking for pending submissions...');
      
      const retryPendingSubmissions = async () => {
        try {
          const readyForRetry = await getReadyForRetry();
          if (readyForRetry.length > 0) {
            toast({
              title: "Back Online",
              description: `Retrying ${readyForRetry.length} pending submission${readyForRetry.length > 1 ? 's' : ''}...`,
            });
            await onRetrySubmissions();
          }
        } catch (error) {
          console.error('Auto-retry failed:', error);
        }
      };

      // Debounce the retry to avoid multiple rapid calls
      setTimeout(retryPendingSubmissions, 2000);
    }
    
    wasOfflineRef.current = !isOnline;
  }, [isOnline, onRetrySubmissions, isEnabled, toast]);

  // Periodic check for ready-to-retry submissions
  useEffect(() => {
    if (!isEnabled) return;

    const checkAndRetry = async () => {
      if (!isOnline) return;
      
      try {
        const readyForRetry = await getReadyForRetry();
        if (readyForRetry.length > 0) {
          console.log(`Found ${readyForRetry.length} submissions ready for retry`);
          await onRetrySubmissions();
        }
      } catch (error) {
        console.error('Periodic retry check failed:', error);
      }
    };

    // Check every 30 seconds for submissions ready to retry
    retryIntervalRef.current = setInterval(checkAndRetry, 30000);

    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
    };
  }, [isOnline, onRetrySubmissions, isEnabled]);

  return {
    isOnline,
    wasOffline: wasOfflineRef.current
  };
};
