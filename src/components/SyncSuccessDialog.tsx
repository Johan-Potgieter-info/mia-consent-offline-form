import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle, Cloud } from 'lucide-react';
import { FormData } from '../types/formTypes';

interface SyncSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  syncedForms: FormData[];
  syncStats: {
    success: number;
    failed: number;
  };
}

const SyncSuccessDialog = ({ 
  isOpen, 
  onClose, 
  syncedForms, 
  syncStats 
}: SyncSuccessDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <DialogTitle>Forms Synced Successfully</DialogTitle>
          </div>
          <DialogDescription>
            Your offline forms have been uploaded to the cloud.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Cloud className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                {syncStats.success} form{syncStats.success !== 1 ? 's' : ''} uploaded successfully
              </p>
              {syncStats.failed > 0 && (
                <p className="text-sm text-orange-600">
                  {syncStats.failed} form{syncStats.failed !== 1 ? 's' : ''} failed to upload
                </p>
              )}
            </div>
          </div>

          {syncedForms.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Uploaded Forms:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {syncedForms.map((form, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded border-l-2 border-green-500">
                    <p className="font-medium">
                      {form.patientFirstName} {form.patientLastName}
                    </p>
                    <p className="text-gray-600">
                      {new Date(form.submittedAt || '').toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose} className="w-full">
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncSuccessDialog;