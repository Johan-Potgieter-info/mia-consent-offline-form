
import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import ResumeDraftDialogHeader from './draft/ResumeDraftDialogHeader';
import DraftManagementTabs from './draft/DraftManagementTabs';
import { useResumeDraftDialog } from './draft/useResumeDraftDialog';

interface ResumeDraftDialogProps {
  onDraftsChanged?: () => void;
}

const ResumeDraftDialog = ({ onDraftsChanged }: ResumeDraftDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    pendingSubmissions,
    loadingPending,
    drafts,
    isLoading,
    error,
    isBulkDeleting,
    formatDate,
    getDoctorOptions,
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
  } = useResumeDraftDialog({ isOpen, onDraftsChanged });

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadPendingSubmissions();
    }
    if (!open && onDraftsChanged) {
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
        <ResumeDraftDialogHeader onRefresh={handleCacheRefresh} />
        
        <DraftManagementTabs
          drafts={drafts}
          isLoading={isLoading}
          error={error}
          isBulkDeleting={isBulkDeleting}
          onRetryDrafts={loadDrafts}
          onDeleteDraft={handleDelete}
          onBulkDeleteDrafts={handleBulkDelete}
          onDoctorChange={() => {}} // Not implemented in original
          onEmergencyCleanup={handleEmergencyCleanupWithCallback}
          onManualCleanup={manualCleanup}
          onContinue={handleContinue}
          formatDate={formatDate}
          getDoctorOptions={getDoctorOptions}
          pendingSubmissions={pendingSubmissions}
          loadingPending={loadingPending}
          onRetrySubmission={handleRetrySubmission}
          onDeleteSubmission={handleDeleteSubmission}
          onForceRetry={handleForceRetry}
          onClearFailedSubmissions={handleClearFailedSubmissions}
          onRefreshPending={loadPendingSubmissions}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ResumeDraftDialog;
