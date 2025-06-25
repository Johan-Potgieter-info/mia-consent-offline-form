import React from 'react';
import { Progress } from './ui/progress';

interface ConsentFormProgressProps {
  sections?: { id: string }[]; // <-- mark as optional to be safe
  currentSection: string;
}

const ConsentFormProgress: React.FC<ConsentFormProgressProps> = ({ sections = [], currentSection }) => {
  const getProgressPercentage = () => {
    if (!sections.length) return 0;
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    return ((currentIndex + 1) / sections.length) * 100;
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <Progress value={getProgressPercentage()} className="w-full" />
    </div>
  );
};

export default ConsentFormProgress;
