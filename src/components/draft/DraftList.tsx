
import React from 'react';
import { User, Calendar, Phone, MapPin, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { FormData } from '../../types/formTypes';
import BulkDraftActions from './BulkDraftActions';
import RegionDropdown from '../RegionDropdown';
import DraftDeleteButton from './DraftDeleteButton';
import { useBulkDraftOperations } from '../../hooks/useBulkDraftOperations';
import { Alert, AlertDescription } from '../ui/alert';

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
  onEmergencyCleanup?: () => void;
  onManualCleanup?: () => void;
}

const DraftList = ({
  drafts,
  isLoading,
  error,
  onRetry,
  onDeleteDraft,
  onBulkDeleteDrafts,
  onDoctorChange,
  formatDate,
  getDoctorOptions,
  onContinue,
  isBulkDeleting,
  onEmergencyCleanup,
  onManualCleanup,
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
      <div className="space-y-4 p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center space-x-2">
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
          {onEmergencyCleanup && (
            <Button onClick={onEmergencyCleanup} variant="outline" className="text-red-600 border-red-300">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Cleanup
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No saved drafts found</p>
        <div className="mt-4 space-x-2">
          {onManualCleanup && (
            <Button onClick={onManualCleanup} variant="outline" size="sm">
              Clean Up Old Drafts
            </Button>
          )}
          {onEmergencyCleanup && (
            <Button onClick={onEmergencyCleanup} variant="outline" size="sm" className="text-red-600 border-red-300">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Cleanup
            </Button>
          )}
        </div>
      </div>
    );
  }

  const allDraftIds = drafts.map(draft => String(draft.id));

  const handleBulkDelete = () => {
    const selectedIds = getSelectedDrafts();
    onBulkDeleteDrafts(selectedIds);
    clearSelection();
  };

  const handleRegionChange = (draft: FormData, newRegion: any) => {
    onDoctorChange(String(draft.id), newRegion.code);
  };

  const getCurrentRegion = (draft: FormData) => {
    const doctorOptions = getDoctorOptions();
    const currentOption = doctorOptions.find(option => option.code === draft.regionCode) || doctorOptions[0];
    
    return {
      code: draft.regionCode || currentOption?.code || 'PTA',
      name: draft.region || currentOption?.name || 'Pretoria',
      doctor: draft.doctor || currentOption?.doctor || 'Dr. Unknown',
      practiceNumber: draft.practiceNumber || currentOption?.practiceNumber || '0123456'
    };
  };

  const handleDeleteDraft = (draftId: string) => {
    const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent;
    onDeleteDraft(draftId, fakeEvent);
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
      
      {/* Cleanup options */}
      {drafts.length > 5 && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Manage your drafts with cleanup options
              </p>
            </div>
            <div className="space-x-2">
              {onManualCleanup && (
                <Button 
                  onClick={onManualCleanup} 
                  variant="outline" 
                  size="sm"
                >
                  Clean Old Drafts
                </Button>
              )}
              {onEmergencyCleanup && (
                <Button 
                  onClick={onEmergencyCleanup} 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-300"
                >
                  Emergency Cleanup
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4 p-4">
        {drafts.map((draft) => {
          const isCurrentlySaving = draft.autoSaved === true;
          
          return (
            <div 
              key={draft.id} 
              className={`border border-gray-200 rounded-lg p-4 transition-colors ${
                isCurrentlySaving ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedDrafts.has(String(draft.id))}
                    onCheckedChange={() => toggleDraftSelection(String(draft.id))}
                    className="mt-1"
                    disabled={isCurrentlySaving}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900 truncate">
                        {draft.patientName || 'Unnamed Patient'}
                      </span>
                      {isCurrentlySaving && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Auto-saving...
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                      {draft.cellPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{draft.cellPhone}</span>
                        </div>
                      )}
                      
                      {draft.timestamp && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>Saved: {formatDate(draft.timestamp)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      <div>Draft ID: {String(draft.id).substring(0, 20)}...</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                    </div>

                    {(draft.idNumber || draft.email) && (
                      <div className="text-xs text-gray-500 space-y-1">
                        {draft.idNumber && <div>ID: {draft.idNumber}</div>}
                        {draft.email && <div>Email: {draft.email}</div>}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Region:</span>
                      <RegionDropdown
                        currentRegion={getCurrentRegion(draft)}
                        onRegionSelect={(region) => handleRegionChange(draft, region)}
                        isFromDraft={true}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => onContinue(String(draft.id))}
                    size="sm"
                    className="bg-[#ef4805] hover:bg-[#d63d04] text-white"
                    disabled={isCurrentlySaving}
                  >
                    Continue
                  </Button>
                  <DraftDeleteButton
                    onDelete={() => handleDeleteDraft(String(draft.id))}
                    disabled={isCurrentlySaving}
                    patientName={draft.patientName || 'this draft'}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DraftList;
