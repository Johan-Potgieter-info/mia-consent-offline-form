
import React from 'react';
import { Trash2, User, Calendar, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { FormData } from '../../types/formTypes';
import BulkDraftActions from './BulkDraftActions';
import { useBulkDraftOperations } from '../../hooks/useBulkDraftOperations';

interface DraftListProps {
  drafts: FormData[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onDeleteDraft: (draftId: string, e: React.MouseEvent) => void;
  onBulkDeleteDrafts: (draftIds: string[]) => void;
  onDoctorChange: (draftId: string, regionCode: string) => void;
  formatDate: (date: string) => string;
  getDoctorOptions: () => any[];
  onContinue: (draftId: string) => void;
  isBulkDeleting: boolean;
}

const DraftList = ({
  drafts,
  isLoading,
  error,
  onRetry,
  onDeleteDraft,
  onBulkDeleteDrafts,
  onContinue,
  isBulkDeleting,
}: DraftListProps) => {
  const {
    selectedDrafts,
    isSelectAll,
    toggleDraftSelection,
    toggleSelectAll,
    clearSelection,
    getSelectedCount,
    getSelectedDrafts
  } = useBulkDraftOperations();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading drafts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">{error}</p>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No saved drafts found</p>
      </div>
    );
  }

  const allDraftIds = drafts.map(draft => String(draft.id));

  const handleBulkDelete = () => {
    const selectedIds = getSelectedDrafts();
    onBulkDeleteDrafts(selectedIds);
    clearSelection();
  };

  return (
    <div className="space-y-0">
      <BulkDraftActions
        totalDrafts={drafts.length}
        selectedCount={getSelectedCount()}
        isSelectAll={isSelectAll}
        onToggleSelectAll={() => toggleSelectAll(allDraftIds)}
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onClearSelection={clearSelection}
      />
      
      <div className="space-y-4 p-4">
        {drafts.map((draft) => (
          <div key={draft.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <Checkbox
                  checked={selectedDrafts.has(String(draft.id))}
                  onCheckedChange={() => toggleDraftSelection(String(draft.id))}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{draft.patientName || 'Unnamed Patient'}</span>
                  </div>
                  
                  {draft.cellPhone && (
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{draft.cellPhone}</span>
                    </div>
                  )}
                  
                  {draft.timestamp && (
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Saved: {new Date(draft.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => onContinue(String(draft.id))}
                  size="sm"
                  className="bg-[#ef4805] hover:bg-[#d63d04]"
                >
                  Continue
                </Button>
                <Button
                  onClick={(e) => onDeleteDraft(String(draft.id), e)}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftList;
