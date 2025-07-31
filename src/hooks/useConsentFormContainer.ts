
import { useEffect, useState, useCallback } from 'react';
import { useHybridStorage } from './useHybridStorage';
import { useRegionDetection } from './useRegionDetection';
import { useSubmissionState } from './useSubmissionState';
import { useFormSubmission } from './useFormSubmission';
import { useFormManagement } from './useFormManagement';
import { useDialogStates } from './useDialogStates';
import { useDraftLoader } from './useDraftLoader';
import { useFormActions } from './useFormActions';
import { useSyncSuccessHandler } from './useSyncSuccessHandler';
import { initConnectivityMonitoring } from '../utils/connectivity';
import { cleanupOldSubmissions } from '../utils/submissionQueue';

export const useConsentFormContainer = () => {
  const [justSaved, setJustSaved] = useState(false);
  
  const {
    saveForm,
    getForms,
    deleteForm,
    syncData,
    isInitialized,
    isOnline
  } = useHybridStorage();

  // Initialize connectivity monitoring on app start
  useEffect(() => {
    initConnectivityMonitoring();
    cleanupOldSubmissions(); // Clean up old failed submissions
  }, []);

  // Handle sync success dialog when coming back online
  useSyncSuccessHandler({ isOnline, syncData });

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

  // Form management hook with enhanced validation
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
    formatLastSaved,
    validateForm
  } = useFormManagement();

  // Dialog states hook
  const dialogStates = useDialogStates();

  // Draft loader hook with fixed loop prevention
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

  // Form actions hook with enhanced validation
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
    failSubmission,
    validateForm,
    setValidationErrors
  });

  // Check if form is complete (for submit button availability)
  const isFormComplete = useCallback(() => {
    const validation = validateForm(formData);
    return validation.isValid;
  }, [formData, validateForm]);

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
    // Form completion status
    isFormComplete: isFormComplete(),
    // Dialog properties
    ...dialogStates
  };
};
