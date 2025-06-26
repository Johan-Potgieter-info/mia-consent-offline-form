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
import DraftList from './draft/DraftList';
import PendingSubmissionsList from './draft/PendingSubmissionsList';
import CacheRefreshButton from './CacheRefreshButton';
import { useDraftOperations } from './draft/useDraftOperations';
import { useStaleDataCleanup } from '../hooks/useStaleDataCleanup';
import { useAutoRetry } from '../hooks/useAutoRetry';
import { useHybridStorage } from '../hooks/useHybridStorage';
import { getQueue, removeFromQueue, incrementRetry } from '../utils/submissionQueue';

interface ResumeDraftDialogProps {
  onDraftsChanged?: () => void;
}

const ResumeDraftDialog = ({ onDraftsChanged }: ResumeDraftDialogProps) => {
  const navigate = useNavigate();
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
    } catch (error) {
      console.error('Failed to retry submission:', error);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      await removeFromQueue(id);
      await loadPendingSubmissions();
    } catch (error) {
      console.error('Failed to delete submission:', error);
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
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Resume a Saved Form</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Select a previously saved form to continue where you left off, manage pending submissions, or clean up old data
              </DialogDescription>
            </div>
            <CacheRefreshButton onRefresh={handleCacheRefresh} size="sm" />
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh]">
          <div>
            <h3 className="text-lg font-semibold mb-4">Saved Drafts</h3>
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
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Pending Submissions</h3>
            <PendingSubmissionsList
              pendingSubmissions={pendingSubmissions}
              onRetrySubmission={handleRetrySubmission}
              onDeleteSubmission={handleDeleteSubmission}
              isLoading={loadingPending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeDraftDialog;
