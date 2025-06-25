
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface PendingFormsSectionProps {
  onRefresh: () => void;
}

const PendingFormsSection = ({ onRefresh }: PendingFormsSectionProps) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-blue-800">Pending Forms</h3>
          <p className="text-sm text-blue-600">Forms waiting to be synced to cloud</p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default PendingFormsSection;
