import React from 'react';

interface RegionSelectorProps {
  onRegionSelect: (region: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ onRegionSelect }) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Select Region</h2>
      <select
        onChange={(e) => onRegionSelect(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select a region</option>
        <option value="us">United States</option>
        <option value="eu">Europe</option>
        <option value="za">South Africa</option>
      </select>
    </div>
  );
};

export default RegionSelector;
