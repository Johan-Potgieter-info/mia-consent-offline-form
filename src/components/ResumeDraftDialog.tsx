
import React, { useState } from 'react';
import { Clock } from 'lucide-react';
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
import { useDraftOperations } from './draft/useDraftOperations';

const ResumeDraftDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    drafts,
    isLoading,
    error,
    loadDrafts,
    handleDeleteDraft,
    handleDoctorChange,
    formatDate,
    getDoctorOptions
  } = useDraftOperations(isOpen);

  const handleContinue = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Resume a Saved Form</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Select a previously saved form to continue where you left off
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          <DraftList
            drafts={drafts}
            isLoading={isLoading}
            error={error}
            onRetry={loadDrafts}
            onDeleteDraft={handleDeleteDraft}
            onDoctorChange={handleDoctorChange}
            formatDate={formatDate}
            getDoctorOptions={getDoctorOptions}
            onContinue={handleContinue}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeDraftDialog;
