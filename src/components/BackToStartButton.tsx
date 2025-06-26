
import React from 'react';
import { Button } from './ui/button';
import { FormData } from '../types/formTypes';

interface BackToStartButtonProps {
  isDirty: boolean;
  justSaved: boolean;
  formData: FormData;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onResetJustSaved: () => void;
}

// Helper function to check if form has meaningful content
const hasMeaningfulContent = (formData: FormData): boolean => {
  const meaningfulFields = [
    'patientName',
    'idNumber', 
    'cellPhone',
    'email',
    'dateOfBirth',
    'birthDate',
    'address',
    'emergencyContactName',
    'emergencyContactNumber'
  ];
  
  return meaningfulFields.some(field => {
    const value = formData[field as keyof FormData];
    return value && typeof value === 'string' && value.trim().length > 0;
  });
};

const BackToStartButton: React.FC<BackToStartButtonProps> = ({ 
  isDirty, 
  justSaved, 
  formData,
  onSave, 
  onDiscard, 
  onResetJustSaved 
}) => {
  const handleBackToStart = () => {
    const hasContent = hasMeaningfulContent(formData);
    
    if (isDirty && !justSaved && hasContent) {
      // Show save dialog or auto-save only if form has meaningful content
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
