
import React from 'react';
import { Region } from '../utils/regionSelection';
import { getIconPath } from '../utils/assetPaths';

interface ConsentFormHeaderProps {
  currentRegion: Region | null;
  regionDetected: boolean;
  isResuming: boolean;
}

const ConsentFormHeader = ({ currentRegion, regionDetected, isResuming }: ConsentFormHeaderProps) => {
  const iconPath = getIconPath();
  console.log('ConsentFormHeader - Using dynamic icon path:', iconPath);
  
  return (
    <div className="bg-[#ef4805] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-3 inline-block rounded-lg">
          <img 
            src={iconPath}
            alt="Mia Healthcare"
            className="h-16 w-auto"
            onError={(e) => {
              console.error('ConsentFormHeader - Mia logo failed to load:', e);
              console.log('ConsentFormHeader - Attempted path:', e.currentTarget.src);
            }}
            onLoad={() => {
              console.log('ConsentFormHeader - Mia logo loaded successfully');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ConsentFormHeader;
