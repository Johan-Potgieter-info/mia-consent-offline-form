
import React from 'react';
import { Button } from './ui/button';

interface BackToStartButtonProps {
  isDirty: boolean;
  justSaved: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onResetJustSaved: () => void;
}

const BackToStartButton: React.FC<BackToStartButtonProps> = ({ 
  isDirty, 
  justSaved, 
  onSave, 
  onDiscard, 
  onResetJustSaved 
}) => {
  const handleBackToStart = () => {
    if (isDirty && !justSaved) {
      // Show save dialog or auto-save
      onSave().then(() => {
        window.location.href = '/';
      });
    } else {
      window.location.href = '/';
    }
    onResetJustSaved();
  };

  return (
    <Button
      onClick={handleBackToStart}
      variant="outline"
      className="mb-4"
    >
      ← Back to Start
    </Button>
  );
};

export default BackToStartButton;
