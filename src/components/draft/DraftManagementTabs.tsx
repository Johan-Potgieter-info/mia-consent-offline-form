
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import DraftList from './DraftList';
import QueueStatusDashboard from './QueueStatusDashboard';
import EnhancedPendingSubmissionsList from './EnhancedPendingSubmissionsList';

interface DraftManagementTabsProps {
  // Draft management props
  drafts: any[];
  isLoading: boolean;
  error: string | null;
  isBulkDeleting: boolean;
  onRetryDrafts: () => void;
  onDeleteDraft: (draftId: string, e: React.MouseEvent) => void;
  onBulkDeleteDrafts: (draftIds: string[]) => void;
  onDoctorChange: (draftId: string, newDoctor: string) => void;
  onEmergencyCleanup: () => void;
  onManualCleanup: () => void;
  onContinue: (draftId: string) => void;
  formatDate: (date: string) => string;
  getDoctorOptions: () => string[];
  
  // Queue management props
  pendingSubmissions: any[];
  loadingPending: boolean;
  onRetrySubmission: (id: string) => void;
  onDeleteSubmission: (id: string) => void;
  onForceRetry: (id: string) => void;
  onClearFailedSubmissions: () => void;
  onRefreshPending: () => void;
}

const DraftManagementTabs = ({
  drafts,
  isLoading,
  error,
  isBulkDeleting,
  onRetryDrafts,
  onDeleteDraft,
  onBulkDeleteDrafts,
  onDoctorChange,
  onEmergencyCleanup,
  onManualCleanup,
  onContinue,
  formatDate,
  getDoctorOptions,
  pendingSubmissions,
  loadingPending,
  onRetrySubmission,
  onDeleteSubmission,
  onForceRetry,
  onClearFailedSubmissions,
  onRefreshPending,
}: DraftManagementTabsProps) => {
  return (
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
          onRetry={onRetryDrafts}
          onDeleteDraft={onDeleteDraft}
          onBulkDeleteDrafts={onBulkDeleteDrafts}
          onDoctorChange={onDoctorChange}
          onEmergencyCleanup={onEmergencyCleanup}
          onManualCleanup={onManualCleanup}
          formatDate={formatDate}
          getDoctorOptions={getDoctorOptions}
          onContinue={onContinue}
          isBulkDeleting={isBulkDeleting}
        />
      </TabsContent>
      
      <TabsContent value="queue" className="space-y-4">
        <QueueStatusDashboard
          queuedSubmissions={pendingSubmissions}
          isLoading={loadingPending}
          onForceRetry={onForceRetry}
          onClearFailedSubmissions={onClearFailedSubmissions}
          onRefresh={onRefreshPending}
        />
      </TabsContent>
      
      <TabsContent value="pending" className="space-y-4">
        <EnhancedPendingSubmissionsList
          pendingSubmissions={pendingSubmissions}
          onRetrySubmission={onRetrySubmission}
          onDeleteSubmission={onDeleteSubmission}
          onForceRetry={onForceRetry}
          isLoading={loadingPending}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DraftManagementTabs;
