
import { useEffect, useState } from 'react';
import { useHybridStorage } from './useHybridStorage';
import { useRegionDetection } from './useRegionDetection';
import { useSubmissionState } from './useSubmissionState';
import { useFormSubmission } from './useFormSubmission';
import { useFormManagement } from './useFormManagement';
import { useDialogStates } from './useDialogStates';
import { useDraftLoader } from './useDraftLoader';
import { useFormActions } from './useFormActions';

export const useConsentFormContainer = () => {
  const [justSaved, setJustSaved] = useState(false);
  
  const {
    saveForm,
    getForms,
    deleteForm,
    isInitialized,
    isOnline
  } = useHybridStorage();

  // Restore region detection
  const {
    currentRegion,
    regionDetected,
    showManualSelector,
    isRegionFromDraft,
    isRegionDetected,
    detectAndSetRegion,
    setRegionManually
  } = useRegionDetection();

  // Use new submission state management
  const {
    submitting,
    submissionStatus,
    startSubmission,
    completeSubmission,
    failSubmission,
    setSubmissionStatus
  } = useSubmissionState();

  // Form management hook
  const {
    formData,
    setFormData,
    isDirty,
    setIsDirty,
    activeSection,
    setActiveSection,
    validationErrors,
    setValidationErrors,
    retryCount,
    setRetryCount,
    handleInputChange,
    handleCheckboxChange,
    updateFormDataWithRegion,
    hasMeaningfulContent,
    resetJustSaved,
    formatLastSaved
  } = useFormManagement();

  // Dialog states hook
  const dialogStates = useDialogStates();

  // Draft loader hook
  const { isResuming } = useDraftLoader({
    isInitialized,
    getForms,
    setFormData,
    setSubmissionStatus,
    detectAndSetRegion
  });

  // Use updated form submission hook
  const { submitForm } = useFormSubmission({
    isOnline,
    onOfflineSubmission: (formData, pendingForms) => {
      dialogStates.setOfflineFormData(formData);
      dialogStates.setPendingForms(pendingForms);
      dialogStates.setShowOfflineSummaryDialog(true);
    },
    onOnlineSubmission: (formData) => {
      dialogStates.setOnlineFormData(formData);
      dialogStates.setShowOnlineSuccessDialog(true);
    },
    onValidationErrors: (errors) => {
      setValidationErrors(errors);
    }
  });

  // Form actions hook
  const { handleSave, handleSubmit, handleDiscard } = useFormActions({
    formData,
    currentRegion,
    draftId: isResuming ? 'draft' : undefined,
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
  });

  // Detect region for new forms (not resuming drafts)
  useEffect(() => {
    if (!isResuming && isInitialized && !currentRegion) {
      detectAndSetRegion();
    }
  }, [isResuming, isInitialized, currentRegion, detectAndSetRegion]);

  return {
    formData,
    handleInputChange,
    handleCheckboxChange,
    handleSave,
    handleSubmit,
    handleDiscard,
    isDirty,
    justSaved,
    activeSection,
    setActiveSection,
    validationErrors: validationErrors || [],
    showValidationErrors: (validationErrors?.length || 0) > 0,
    isOnline,
    lastSaved: null,
    dbInitialized: isInitialized,
    retryCount,
    showManualSelector,
    setRegionManually,
    isRegionFromDraft,
    isRegionDetected,
    currentRegion,
    regionDetected,
    isResuming,
    resetJustSaved,
    formatLastSaved,
    // New submission state properties
    submitting,
    submissionStatus,
    // Dialog properties
    ...dialogStates
  };
};
