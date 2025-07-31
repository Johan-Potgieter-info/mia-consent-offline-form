
import React from 'react';
import { REGIONS, Region } from '../utils/regionSelection';

interface RegionSelectorProps {
  onRegionSelect: (region: Region) => void;
  currentRegion: Region | null;
  isVisible: boolean;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  onRegionSelect,
  currentRegion,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-2">Select Your Region</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {Object.values(REGIONS).map((region) => (
          <button
            key={region.code}
            onClick={() => onRegionSelect(region)}
            className={`p-3 rounded border text-left ${
              currentRegion?.code === region.code
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{region.name}</div>
            <div className="text-sm text-gray-600">{region.doctor}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RegionSelector;
