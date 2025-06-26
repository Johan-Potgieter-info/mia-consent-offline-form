
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useHybridStorage } from './useHybridStorage';
import { useRegionDetection } from './useRegionDetection';
import { useSubmissionState } from './useSubmissionState';
import { useFormSubmission } from './useFormSubmission';
import { FormData } from '../types/formTypes';

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

export const useConsentFormContainer = () => {
  const { draftId } = useParams();
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

  // Use updated form submission hook
  const { submitForm } = useFormSubmission({
    isOnline,
    onOfflineSubmission: (formData, pendingForms) => {
      setOfflineFormData(formData);
      setPendingForms(pendingForms);
      setShowOfflineSummaryDialog(true);
    },
    onOnlineSubmission: (formData) => {
      setOnlineFormData(formData);
      setShowOnlineSuccessDialog(true);
    },
    onValidationErrors: (errors) => {
      setValidationErrors(errors);
    }
  });

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
        // Ensure form data includes new fields with defaults
        const enhancedDraft = {
          ...matchingDraft,
          createdAt: matchingDraft.createdAt || matchingDraft.timestamp || new Date().toISOString(),
          submissionStatus: matchingDraft.submissionStatus || 'draft',
          formSchemaVersion: matchingDraft.formSchemaVersion || 1
        };
        
        setFormData(enhancedDraft);
        setSubmissionStatus(enhancedDraft.submissionStatus as any);
        console.log(`Loaded draft ID ${draftId}`);
        
        // If draft has a region, set it manually to preserve it
        if (matchingDraft.regionCode) {
          const region = {
            code: matchingDraft.regionCode,
            name: matchingDraft.region || 'Unknown',
            doctor: matchingDraft.doctor || 'Unknown',
            practiceNumber: matchingDraft.practiceNumber || 'Unknown'
          };
          await detectAndSetRegion(region);
        }
      } else {
        console.warn(`Draft with ID ${draftId} not found`);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [draftId, isInitialized, getForms, detectAndSetRegion, setSubmissionStatus]);

  useEffect(() => {
    loadDraftById();
  }, [loadDraftById]);

  // Detect region for new forms (not resuming drafts)
  useEffect(() => {
    if (!draftId && isInitialized && !currentRegion) {
      detectAndSetRegion();
    }
  }, [draftId, isInitialized, currentRegion, detectAndSetRegion]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [field]: value,
      regionCode: currentRegion?.code || prev.regionCode,
      region: currentRegion?.name || prev.region,
      doctor: currentRegion?.doctor || prev.doctor,
      practiceNumber: currentRegion?.practiceNumber || prev.practiceNumber,
      lastModified: new Date().toISOString(),
      formSchemaVersion: 1 // Ensure schema version is set
    }));
    setIsDirty(true);
  };

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    setFormData((prev) => ({ 
      ...prev, 
      [field]: checked,
      regionCode: currentRegion?.code || prev.regionCode,
      region: currentRegion?.name || prev.region,
      doctor: currentRegion?.doctor || prev.doctor,
      practiceNumber: currentRegion?.practiceNumber || prev.practiceNumber,
      lastModified: new Date().toISOString(),
      formSchemaVersion: 1 // Ensure schema version is set
    }));
    setIsDirty(true);
  };

  const handleSave = async (isDraft = true) => {
    try {
      // Only save if form has meaningful content
      if (!hasMeaningfulContent(formData)) {
        console.log('Form has no meaningful content, skipping save');
        return;
      }

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
      
      // If this was a new form, update the form data with the saved ID
      if (!formData.id && savedId) {
        setFormData(prev => ({ ...prev, id: savedId }));
      }
      
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
    showManualSelector,
    setRegionManually,
    isRegionFromDraft,
    isRegionDetected,
    currentRegion,
    regionDetected,
    isResuming: !!draftId,
    resetJustSaved,
    formatLastSaved,
    // New submission state properties
    submitting,
    submissionStatus,
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
