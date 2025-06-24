import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useHybridStorage } from '../hooks/useHybridStorage';
import { FormData } from '../types/formTypes';

export const useConsentFormContainer = () => {
  const { draftId } = useParams();
  const {
    saveForm,
    getForms,
    deleteForm,
    isInitialized,
    capabilities,
    isOnline
  } = useHybridStorage();

  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [isDirty, setIsDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('patient');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('idle');
  const [retryCount, setRetryCount] = useState(0);

  const loadDraftById = useCallback(async () => {
    if (!draftId || !isInitialized) return;

    try {
      const drafts = await getForms(true);
      const matchingDraft = drafts.find((draft) => String(draft.id) === draftId);
      if (matchingDraft) {
        setFormData(matchingDraft);
        console.log(`Loaded draft ID ${draftId}`);
      } else {
        console.warn(`Draft with ID ${draftId} not found`);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [draftId, isInitialized, getForms]);

  useEffect(() => {
    loadDraftById();
  }, [loadDraftById]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
    setIsDirty(true);
  };

  const handleSave = async (isDraft = true) => {
    try {
      setAutoSaveStatus('saving');
      await saveForm(formData, isDraft);
      setIsDirty(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      setAutoSaveStatus('idle');
    } catch (error) {
      console.error('Save failed:', error);
      setAutoSaveStatus('failed');
      setRetryCount((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    // Add form validation logic if needed
    console.log('Submitting form...');
    await saveForm(formData, false);
  };

  const handleDiscard = async () => {
    if (formData.id) {
      await deleteForm(formData.id, true);
      setFormData({} as FormData);
    }
  };

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
    validationErrors,
    showValidationErrors: (validationErrors?.length || 0) > 0,
    isOnline,
    dbInitialized: isInitialized,
    autoSaveStatus,
    retryCount,
    showManualSelector: false,
    setRegionManually: () => {},
    isRegionFromDraft: false,
    isRegionDetected: false,
    currentRegion: null,
    regionDetected: false
  };
};
