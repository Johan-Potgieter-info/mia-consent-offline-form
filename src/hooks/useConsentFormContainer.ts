
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useHybridStorage } from './useHybridStorage';
import { FormData } from '../types/formTypes';

export const useConsentFormContainer = () => {
  const { draftId } = useParams();
  const {
    saveForm,
    getForms,
    deleteForm,
    isInitialized,
    isOnline
  } = useHybridStorage();

  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [isDirty, setIsDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("patient");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  // Dialog states
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);
  const [showOnlineSuccessDialog, setShowOnlineSuccessDialog] = useState(false);
  const [showOfflineSummaryDialog, setShowOfflineSummaryDialog] = useState(false);
  const [offlineFormData, setOfflineFormData] = useState<FormData | undefined>(undefined);
  const [onlineFormData, setOnlineFormData] = useState<FormData | undefined>(undefined);
  const [pendingForms, setPendingForms] = useState<FormData[]>([]);

  const loadDraftById = useCallback(async () => {
    if (!draftId || !isInitialized) return;

    try {
      const drafts = await getForms(true);
      const matchingDraft = (drafts || []).find((draft) => String(draft.id) === draftId);
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
    // Check consent state and set it in form data
    const consentAccepted = localStorage.getItem("consentAccepted") === "true";
    if (consentAccepted) {
      handleCheckboxChange("consentAgreement", "", true);
    }
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
      await saveForm(formData, isDraft);
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
    await saveForm(formData, false);
  };

  const handleDiscard = async () => {
    if (formData.id) {
      await deleteForm(formData.id, true);
      setFormData({} as FormData);
    }
  };

  const resetJustSaved = useCallback(() => {
    setJustSaved(false);
  }, []);

  const formatLastSaved = useCallback(() => {
    return 'Just now'; // Simplified for now
  }, []);

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
    showManualSelector: false,
    setRegionManually: () => {},
    isRegionFromDraft: false,
    isRegionDetected: false,
    currentRegion: null,
    regionDetected: false,
    isResuming: !!draftId,
    resetJustSaved,
    formatLastSaved,
    // Dialog properties
    showSaveConfirmation,
    saveMessage,
    showOfflineDialog,
    setShowOfflineDialog,
    showOnlineSuccessDialog,
    setShowOnlineSuccessDialog,
    showOfflineSummaryDialog,
    setShowOfflineSummaryDialog,
    offlineFormData,
    onlineFormData,
    pendingForms
  };
};
