import React from 'react';
import { Button } from './ui/button';

interface BackToStartButtonProps {
  onBackToStart: () => void;
}

const BackToStartButton: React.FC<BackToStartButtonProps> = ({ onBackToStart }) => {
  return (
    <Button
      onClick={() => {
        onBackToStart();
        console.log('🔍 [DEBUG] Back to start clicked');
      }}
      className="mt-4"
    >
      Back to Start
    </Button>
  );
};

export default BackToStartButton;
