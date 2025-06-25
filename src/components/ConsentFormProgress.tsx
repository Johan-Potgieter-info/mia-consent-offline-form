import React from 'react';
import { Progress } from './ui/progress';

interface ConsentFormProgressProps {
  sections: { id: string }[];
  currentSection: string;
}

const ConsentFormProgress: React.FC<ConsentFormProgressProps> = ({ sections, currentSection }) => {
  const getProgressPercentage = () => {
    const currentIndex = sections.findIndex(s => s.id === currentSection);
<<<<<<< HEAD
    return sections && sections.length > 0 ? ((currentIndex + 1) / sections.length) * 100 : 0;
=======
    return sections.length > 0 ? ((currentIndex + 1) / sections.length) * 100 : 0;
>>>>>>> a8cb6c8a367c1e95b8f75ed354c5492789feddab
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <Progress value={getProgressPercentage()} className="w-full" />
    </div>
  );
};

export default ConsentFormProgress;
