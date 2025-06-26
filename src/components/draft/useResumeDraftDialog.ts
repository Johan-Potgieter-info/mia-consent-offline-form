
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from '../../hooks/use-toast';
import { useDraftOperations } from './useDraftOperations';
import { useStaleDataCleanup } from '../../hooks/useStaleDataCleanup';
import { useAutoRetry } from '../../hooks/useAutoRetry';
import { useHybridStorage } from '../../hooks/useHybridStorage';
import { getQueue, removeFromQueue, incrementRetry, updateQueuedSubmission } from '../../utils/submissionQueue';

interface UseResumeDraftDialogProps {
  isOpen: boolean;
  onDraftsChanged?: () => void;
}

export const useResumeDraftDialog = ({ isOpen, onDraftsChanged }: UseResumeDraftDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const { getForms, deleteForm } = useHybridStorage();
  
  const {
    drafts,
    isLoading,
    error,
    isBulkDeleting,
    loadDrafts,
    handleDeleteDraft,
    handleBulkDeleteDrafts,
    handleDoctorChange,
    handleEmergencyCleanup,
    formatDate,
    getDoctorOptions
  } = useDraftOperations(isOpen);

  const { manualCleanup } = useStaleDataCleanup({
    getForms,
    deleteForm,
    onCleanupComplete: () => {
      loadDrafts();
      if (onDraftsChanged) onDraftsChanged();
    }
  });

  const loadPendingSubmissions = async () => {
    setLoadingPending(true);
    try {
      const queue = await getQueue();
      setPendingSubmissions(queue);
    } catch (error) {
      console.error('Failed to load pending submissions:', error);
    } finally {
      setLoadingPending(false);
    }
  };

  const retrySubmissions = async () => {
    await loadPendingSubmissions();
  };

  useAutoRetry({
    onRetrySubmissions: retrySubmissions,
    isEnabled: isOpen
  });

  const handleRetrySubmission = async (id: string) => {
    try {
      await incrementRetry(id);
      await loadPendingSubmissions();
      toast({
        title: "Retry Scheduled",
        description: "Submission will be retried according to schedule.",
      });
    } catch (error) {
      console.error('Failed to retry submission:', error);
      toast({
        title: "Retry Failed",
        description: "Could not schedule retry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleForceRetry = async (id: string) => {
    try {
      await updateQueuedSubmission(id, {
        nextRetry: new Date().toISOString(),
        submissionStatus: 'retrying' as const,
        lastAttempt: new Date().toISOString()
      });
      
      await loadPendingSubmissions();
      
      toast({
        title: "Force Retry Started",
        description: "Submission is being retried immediately.",
      });
    } catch (error) {
      console.error('Failed to force retry submission:', error);
      toast({
        title: "Force Retry Failed",
        description: "Could not force retry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      await removeFromQueue(id);
      await loadPendingSubmissions();
      toast({
        title: "Submission Deleted",
        description: "Failed submission has been removed from queue.",
      });
    } catch (error) {
      console.error('Failed to delete submission:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete submission. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearFailedSubmissions = async () => {
    try {
      const queue = await getQueue();
      const failedSubmissions = queue.filter(s => 
        s.submissionStatus === 'failed' || s.retryCount >= s.maxRetries
      );
      
      for (const submission of failedSubmissions) {
        await removeFromQueue(submission.id);
      }
      
      await loadPendingSubmissions();
      
      toast({
        title: "Failed Submissions Cleared",
        description: `Removed ${failedSubmissions.length} failed submission${failedSubmissions.length > 1 ? 's' : ''} from queue.`,
      });
    } catch (error) {
      console.error('Failed to clear failed submissions:', error);
      toast({
        title: "Clear Failed",
        description: "Could not clear failed submissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContinue = (draftId: string) => {
    navigate(`/consent-form/${draftId}`);
  };

  const handleDelete = async (draftId: string, e: React.MouseEvent) => {
    await handleDeleteDraft(draftId, e);
    if (onDraftsChanged) {
      onDraftsChanged();
    }
  };

  const handleBulkDelete = async (draftIds: string[]) => {
    await handleBulkDeleteDrafts(draftIds);
    if (onDraftsChanged) {
      onDraftsChanged();
    }
  };

  const handleEmergencyCleanupWithCallback = async () => {
    await handleEmergencyCleanup();
    if (onDraftsChanged) {
      onDraftsChanged();
    }
  };

  const handleCacheRefresh = async () => {
    await loadDrafts();
    await loadPendingSubmissions();
    if (onDraftsChanged) {
      onDraftsChanged();
    }
  };

  return {
    // State
    pendingSubmissions,
    loadingPending,
    
    // Draft operations
    drafts,
    isLoading,
    error,
    isBulkDeleting,
    formatDate,
    getDoctorOptions,
    
    // Handlers
    handleContinue,
    handleDelete,
    handleBulkDelete,
    handleEmergencyCleanupWithCallback,
    handleRetrySubmission,
    handleForceRetry,
    handleDeleteSubmission,
    handleClearFailedSubmissions,
    handleCacheRefresh,
    manualCleanup,
    loadDrafts,
    loadPendingSubmissions,
  };
};
