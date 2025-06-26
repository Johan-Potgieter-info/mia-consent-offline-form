
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import CacheRefreshButton from '../CacheRefreshButton';

interface ResumeDraftDialogHeaderProps {
  onRefresh: () => void;
}

const ResumeDraftDialogHeader = ({ onRefresh }: ResumeDraftDialogHeaderProps) => {
  return (
    <DialogHeader>
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-xl font-bold text-gray-900">Form Management Center</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Manage saved drafts, monitor submission queue, and handle pending forms
          </DialogDescription>
        </div>
        <CacheRefreshButton onRefresh={onRefresh} size="sm" />
      </div>
    </DialogHeader>
  );
};

export default ResumeDraftDialogHeader;
