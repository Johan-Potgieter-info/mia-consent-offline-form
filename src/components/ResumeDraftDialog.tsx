
import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import DraftList from './draft/DraftList';
import QueueStatusDashboard from './draft/QueueStatusDashboard';
import EnhancedPendingSubmissionsList from './draft/EnhancedPendingSubmissionsList';
import CacheRefreshButton from './CacheRefreshButton';
import { useDraftOperations } from './draft/useDraftOperations';
import { useStaleDataCleanup } from '../hooks/useStaleDataCleanup';
import { useAutoRetry } from '../hooks/useAutoRetry';
import { useHybridStorage } from '../hooks/useHybridStorage';
import { getQueue, removeFromQueue, incrementRetry, updateQueuedSubmission } from '../utils/submissionQueue';
import { useToast } from '../hooks/use-toast';

interface ResumeDraftDialogProps {
  onDraftsChanged?: () => void;
}

const ResumeDraftDialog = ({ onDraftsChanged }: ResumeDraftDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
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
      // Set next retry to now and mark as retrying
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
    setIsOpen(false);
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

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadPendingSubmissions();
    }
    if (!open && onDraftsChanged) {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="inline-flex items-center px-6 py-3 bg-white text-[#ef4805] font-semibold rounded-lg border-2 border-[#ef4805] hover:bg-orange-50 transition-colors"
        >
          <Clock className="w-5 h-5 mr-2" />
          Resume Draft
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Form Management Center</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Manage saved drafts, monitor submission queue, and handle pending forms
              </DialogDescription>
            </div>
            <CacheRefreshButton onRefresh={handleCacheRefresh} size="sm" />
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="drafts" className="overflow-y-auto max-h-[70vh]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drafts">Saved Drafts</TabsTrigger>
            <TabsTrigger value="queue">Queue Dashboard</TabsTrigger>
            <TabsTrigger value="pending">Pending Submissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="drafts" className="space-y-4">
            <DraftList
              drafts={drafts}
              isLoading={isLoading}
              error={error}
              onRetry={loadDrafts}
              onDeleteDraft={handleDelete}
              onBulkDeleteDrafts={handleBulkDelete}
              onDoctorChange={handleDoctorChange}
              onEmergencyCleanup={handleEmergencyCleanupWithCallback}
              onManualCleanup={manualCleanup}
              formatDate={formatDate}
              getDoctorOptions={getDoctorOptions}
              onContinue={handleContinue}
              isBulkDeleting={isBulkDeleting}
            />
          </TabsContent>
          
          <TabsContent value="queue" className="space-y-4">
            <QueueStatusDashboard
              queuedSubmissions={pendingSubmissions}
              isLoading={loadingPending}
              onForceRetry={handleForceRetry}
              onClearFailedSubmissions={handleClearFailedSubmissions}
              onRefresh={loadPendingSubmissions}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <EnhancedPendingSubmissionsList
              pendingSubmissions={pendingSubmissions}
              onRetrySubmission={handleRetrySubmission}
              onDeleteSubmission={handleDeleteSubmission}
              onForceRetry={handleForceRetry}
              isLoading={loadingPending}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeDraftDialog;
