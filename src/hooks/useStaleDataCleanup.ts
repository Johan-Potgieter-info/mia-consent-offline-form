
import { useEffect } from 'react';
import { useToast } from './use-toast';

interface UseStaleDataCleanupProps {
  getForms: (isDraft?: boolean) => Promise<any[]>;
  deleteForm: (id: string | number, isDraft?: boolean) => Promise<void>;
  maxAgeDays?: number;
  onCleanupComplete?: (deletedCount: number) => void;
}

export const useStaleDataCleanup = ({
  getForms,
  deleteForm,
  maxAgeDays = 30,
  onCleanupComplete
}: UseStaleDataCleanupProps) => {
  const { toast } = useToast();

  const isStale = (dateString: string): boolean => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > maxAgeDays;
    } catch (error) {
      console.error('Error checking stale date:', error);
      return false;
    }
  };

  const cleanupStaleDrafts = async (): Promise<number> => {
    try {
      const drafts = await getForms(true);
      let deletedCount = 0;

      for (const draft of drafts) {
        const createdAt = draft.createdAt || draft.timestamp;
        const lastModified = draft.lastModified;
        
        const staleByCreation = createdAt && isStale(createdAt);
        const staleByModified = lastModified && isStale(lastModified);
        
        if (staleByCreation || staleByModified) {
          try {
            await deleteForm(draft.id, true);
            deletedCount++;
            console.log(`Deleted stale draft: ${draft.patientName || 'Unknown'} (${draft.id})`);
          } catch (error) {
            console.error(`Failed to delete stale draft ${draft.id}:`, error);
          }
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup stale drafts:', error);
      return 0;
    }
  };

  const manualCleanup = async (): Promise<void> => {
    try {
      const deletedCount = await cleanupStaleDrafts();
      
      if (deletedCount > 0) {
        toast({
          title: "Cleanup Complete",
          description: `Deleted ${deletedCount} draft${deletedCount > 1 ? 's' : ''} older than ${maxAgeDays} days.`,
        });
      } else {
        toast({
          title: "No Cleanup Needed",
          description: "No stale drafts found.",
        });
      }

      if (onCleanupComplete) {
        onCleanupComplete(deletedCount);
      }
    } catch (error) {
      console.error('Manual cleanup failed:', error);
      toast({
        title: "Cleanup Failed",
        description: "Unable to clean up old drafts.",
        variant: "destructive",
      });
    }
  };

  // Auto cleanup on mount (app start)
  useEffect(() => {
    const runAutoCleanup = async () => {
      try {
        const deletedCount = await cleanupStaleDrafts();
        
        if (deletedCount > 0) {
          console.log(`Auto-cleanup: Deleted ${deletedCount} stale drafts`);
          toast({
            title: "Auto Cleanup",
            description: `Cleaned up ${deletedCount} old draft${deletedCount > 1 ? 's' : ''}.`,
            variant: "default",
          });
        }

        if (onCleanupComplete) {
          onCleanupComplete(deletedCount);
        }
      } catch (error) {
        console.error('Auto cleanup failed:', error);
      }
    };

    // Run auto cleanup after a short delay to avoid blocking app startup
    const timeoutId = setTimeout(runAutoCleanup, 3000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return {
    manualCleanup,
    cleanupStaleDrafts
  };
};
