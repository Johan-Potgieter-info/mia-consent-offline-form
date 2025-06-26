
import { useFormPersistence } from './useFormPersistence';
import { useFormSubmission } from './useFormSubmission';
import { useRegionDetection } from './useRegionDetection';
import { FormData } from '../types/formTypes';

interface UseFormActionsProps {
  formData: FormData;
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
  isOnline: boolean;
}

interface UseFormActionsResult {
  saveForm: () => Promise<void>;
  submitForm: () => Promise<void>;
  lastSaved: Date | null;
  formatLastSaved: () => string;
  retryCount: number;
  justSaved: boolean;
  resetJustSaved: () => void;
}

export const useFormActions = ({ 
  formData, 
  isDirty, 
  setIsDirty, 
  isOnline 
}: UseFormActionsProps): UseFormActionsResult => {
  const { currentRegion } = useRegionDetection();
  const { 
    lastSaved, 
    saveForm: savePersistence, 
    formatLastSaved,
    retryCount,
    justSaved,
    resetJustSaved
  } = useFormPersistence({ isOnline });
  const { submitForm: submitFormSubmission } = useFormSubmission({ isOnline });

  // Save button handler - ALWAYS saves as draft
  const handleSaveForm = async () => {
    const savedId = await savePersistence(formData);
    if (savedId) {
      console.log('Form saved as draft with ID:', savedId);
    }
  };

  // Submit button handler - saves as completed form to cloud
  const handleSubmitForm = async () => {
    await submitFormSubmission(formData, currentRegion, false);
  };

  return {
    saveForm: handleSaveForm,
    submitForm: handleSubmitForm,
    lastSaved,
    formatLastSaved,
    retryCount,
    justSaved,
    resetJustSaved
  };
};
