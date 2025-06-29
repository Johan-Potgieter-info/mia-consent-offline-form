
import React from 'react';
import { AlertCircle, Save, Database, Cloud, HardDrive } from 'lucide-react';
import { Region } from '../utils/regionDetection';
import RegionDropdown from './RegionDropdown';

interface ConsentFormStatusBarProps {
  isOnline: boolean;
  currentRegion: Region | null;
  isDirty: boolean;
  lastSaved: Date | null;
  formatLastSaved: () => string;
  onSave: () => void;
  dbInitialized?: boolean;
  retryCount?: number;
  onRegionSelect?: (region: Region) => void;
  isRegionFromDraft?: boolean;
  isRegionDetected?: boolean;
}

const ConsentFormStatusBar = ({ 
  isOnline, 
  currentRegion, 
  isDirty, 
  lastSaved, 
  formatLastSaved, 
  onSave,
  dbInitialized = true,
  retryCount = 0,
  onRegionSelect,
  isRegionFromDraft = false,
  isRegionDetected = false
}: ConsentFormStatusBarProps) => {
  const getStorageIndicator = () => {
    if (isOnline && dbInitialized) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Cloud className="w-3 h-3 mr-1" />
          Cloud Storage Active
        </span>
      );
    } else if (dbInitialized) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <HardDrive className="w-3 h-3 mr-1" />
          Local Storage Only
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Database className="w-3 h-3 mr-1" />
          Browser Storage Only
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-6 flex justify-between items-center">
      <div className="flex items-center space-x-4 flex-wrap gap-y-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
        
        {getStorageIndicator()}
        
        {currentRegion && onRegionSelect && (
          <RegionDropdown
            currentRegion={currentRegion}
            onRegionSelect={onRegionSelect}
            isFromDraft={isRegionFromDraft}
            isDetected={isRegionDetected}
          />
        )}
        
        {isDirty && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unsaved changes
          </span>
        )}
        
        {lastSaved && (
          <span className="text-xs text-gray-500">
            Last saved: {formatLastSaved()}
          </span>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={onSave}
          className="flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          <Save className="w-4 h-4 mr-1" />
          Save Progress
        </button>
      </div>
    </div>
  );
};

export default ConsentFormStatusBar;
