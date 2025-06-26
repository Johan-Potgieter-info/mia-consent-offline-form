
import { FormData } from '../types/formTypes';
import { checkServerConnectivity } from '../utils/connectivity';
import { addToQueue } from '../utils/submissionQueue';

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
    let submissionStarted = false;
    
    try {
      console.log('Starting form submission process...');
      
      // CRITICAL FIX: Start submission state BEFORE any validation or processing
      submissionStarted = startSubmission();
      if (!submissionStarted) {
        console.log('Submission already in progress, aborting');
        return;
      }
      
      // Check connectivity before proceeding
      const isOnline = await checkServerConnectivity();
      console.log('Connectivity check result:', isOnline);
      
      updateFormDataWithRegion(currentRegion);
      
      const dataToSubmit = {
        ...formData,
        regionCode: currentRegion?.code || formData.regionCode,
        region: currentRegion?.name || formData.region,
        doctor: currentRegion?.doctor || formData.doctor,
        practiceNumber: currentRegion?.practiceNumber || formData.practiceNumber,
        createdAt: formData.createdAt || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        formSchemaVersion: 1
      };
      
      if (isOnline) {
        console.log('Online submission attempt');
        await submitForm(
          dataToSubmit, 
          currentRegion, 
          !!draftId,
          () => true, // Submission already started
          completeSubmission,
          failSubmission
        );
      } else {
        console.log('Offline - adding to submission queue');
        // Add to queue for later processing
        const queueId = await addToQueue(dataToSubmit);
        console.log('Added to queue with ID:', queueId);
        completeSubmission('submitted'); // Mark as submitted (queued)
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      if (submissionStarted) {
        failSubmission();
      }
    }
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
