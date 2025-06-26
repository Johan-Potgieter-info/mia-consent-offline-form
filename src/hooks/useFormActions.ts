
import { FormData } from '../types/formTypes';

interface UseFormActionsProps {
  formData: FormData;
  currentRegion: any;
  draftId?: string;
  saveForm: (data: FormData, isDraft?: boolean) => Promise<any>;
  deleteForm: (id: string | number, isDraft?: boolean) => Promise<void>;
  submitForm: (
    data: FormData,
    region: any,
    isResuming: boolean,
    startSubmission?: () => boolean,
    completeSubmission?: (status: 'submitted' | 'synced') => void,
    failSubmission?: () => void
  ) => Promise<any>;
  hasMeaningfulContent: (data: FormData) => boolean;
  updateFormDataWithRegion: (region: any) => void;
  setIsDirty: (dirty: boolean) => void;
  setJustSaved: (saved: boolean) => void;
  setRetryCount: (count: number | ((prev: number) => number)) => void;
  startSubmission: () => boolean;
  completeSubmission: (status: 'submitted' | 'synced') => void;
  failSubmission: () => void;
}

export const useFormActions = ({
  formData,
  currentRegion,
  draftId,
  saveForm,
  deleteForm,
  submitForm,
  hasMeaningfulContent,
  updateFormDataWithRegion,
  setIsDirty,
  setJustSaved,
  setRetryCount,
  startSubmission,
  completeSubmission,
  failSubmission
}: UseFormActionsProps) => {
  const handleSave = async (isDraft = true) => {
    try {
      // Only save if form has meaningful content
      if (!hasMeaningfulContent(formData)) {
        console.log('Form has no meaningful content, skipping save');
        return;
      }

      updateFormDataWithRegion(currentRegion);
      
      const dataToSave = {
        ...formData,
        regionCode: currentRegion?.code || formData.regionCode,
        region: currentRegion?.name || formData.region,
        doctor: currentRegion?.doctor || formData.doctor,
        practiceNumber: currentRegion?.practiceNumber || formData.practiceNumber,
        createdAt: formData.createdAt || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        formSchemaVersion: 1
      };

      const savedId = await saveForm(dataToSave, isDraft);
      
      setIsDirty(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
      setRetryCount((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    console.log('Submitting form...');
    updateFormDataWithRegion(currentRegion);
    
    const dataToSave = {
      ...formData,
      regionCode: currentRegion?.code || formData.regionCode,
      region: currentRegion?.name || formData.region,
      doctor: currentRegion?.doctor || formData.doctor,
      practiceNumber: currentRegion?.practiceNumber || formData.practiceNumber,
      createdAt: formData.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      formSchemaVersion: 1
    };
    
    await submitForm(
      dataToSave, 
      currentRegion, 
      !!draftId,
      startSubmission,
      completeSubmission,
      failSubmission
    );
  };

  const handleDiscard = async () => {
    if (formData.id) {
      await deleteForm(formData.id, true);
    }
  };

  return {
    handleSave,
    handleSubmit,
    handleDiscard
  };
};
