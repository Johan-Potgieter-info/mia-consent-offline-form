import React from 'react';
import { Progress } from './ui/progress';

interface ConsentFormProgressProps {
  sections: { id: string }[];
  currentSection: string;
}

const ConsentFormProgress: React.FC<ConsentFormProgressProps> = ({ sections, currentSection }) => {
  const getProgressPercentage = () => {
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    return sections && sections.length > 0 ? ((currentIndex + 1) / sections.length) * 100 : 0;
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <Progress value={getProgressPercentage()} className="w-full" />
    </div>
  );
};

export default ConsentFormProgress;
