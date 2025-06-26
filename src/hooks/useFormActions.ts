
import { useEffect, useRef } from 'react';
import { useFormPersistence } from './useFormPersistence';
import { useFormSubmission } from './useFormSubmission';
import { useRegionDetection } from './useRegionDetection';
import { useHybridStorage } from './useHybridStorage';
import { FormData } from '../types/formTypes';
import { AutoSaveStatus } from '../types/autoSaveTypes';

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
  autoSaveStatus: AutoSaveStatus;
  retryCount: number;
  justSaved: boolean;
  resetJustSaved: () => void;
}

// Helper function to extract only the content fields for comparison
const getContentFields = (formData: FormData) => {
  const { id, timestamp, lastModified, autoSaved, synced, submissionId, ...contentFields } = formData;
  return contentFields;
};

export const useFormActions = ({ 
  formData, 
  isDirty, 
  setIsDirty, 
  isOnline 
}: UseFormActionsProps): UseFormActionsResult => {
  const { currentRegion } = useRegionDetection();
  const { capabilities, isInitialized } = useHybridStorage();
  const { 
    lastSaved, 
    saveForm: savePersistence, 
    autoSave, 
    formatLastSaved,
    autoSaveStatus,
    retryCount,
    justSaved,
    resetJustSaved
  } = useFormPersistence({ isOnline });
  const { submitForm: submitFormSubmission } = useFormSubmission({ isOnline });

  // Refs to prevent auto-save storms
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveContentRef = useRef<string>('');
  const isAutoSaveActiveRef = useRef(false);

  // Auto-save every 30 seconds with proper content comparison
  useEffect(() => {
    if (!isInitialized || !isDirty || Object.keys(formData).length === 0) {
      return;
    }

    // Prevent auto-save if currently saving - explicitly cast to ensure type recognition
    const currentAutoSaveStatus = autoSaveStatus as AutoSaveStatus;
    if (currentAutoSaveStatus === 'saving' || isAutoSaveActiveRef.current) {
      return;
    }

    // Compare only content fields, not metadata
    const currentContentString = JSON.stringify(getContentFields(formData));
    if (currentContentString === lastAutoSaveContentRef.current) {
      return; // No content changes
    }

    // Check for minimum required data before auto-saving
    if (!formData.patientName && !formData.idNumber && !formData.cellPhone) {
      return; // Insufficient data
    }

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set up 30-second auto-save timeout
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Double-check conditions before executing - explicitly cast status
      const statusCheck = autoSaveStatus as AutoSaveStatus;
      if (isDirty && statusCheck !== 'saving' && !isAutoSaveActiveRef.current) {
        isAutoSaveActiveRef.current = true;
        lastAutoSaveContentRef.current = currentContentString;
        
        try {
          console.log('Auto-save triggered (30s timeout)');
          await autoSave(formData);
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          isAutoSaveActiveRef.current = false;
        }
      }
    }, 30000); // 30 seconds

    // Emergency save on page unload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Explicitly cast status for comparison
      const emergencyStatusCheck = autoSaveStatus as AutoSaveStatus;
      if (isDirty && emergencyStatusCheck !== 'saving') {
        try {
          if (capabilities.indexedDB || window.localStorage) {
            const emergencyData: FormData = {
              ...formData,
              timestamp: new Date().toISOString(),
              emergency: true,
              status: 'draft' as const
            };
            
            if (capabilities.indexedDB) {
              autoSave(emergencyData);
            } else {
              localStorage.setItem('emergencyFormDraft', JSON.stringify(emergencyData));
            }
          }
        } catch (error) {
          console.error('Emergency save failed:', error);
        }
        
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isDirty, formData, capabilities, autoSave, autoSaveStatus, isInitialized]);

  // Save button handler - ALWAYS saves as draft
  const handleSaveForm = async () => {
    // Explicitly cast for comparison
    const saveStatusCheck = autoSaveStatus as AutoSaveStatus;
    if (saveStatusCheck === 'saving' || isAutoSaveActiveRef.current) {
      console.log('Manual save skipped - auto-save in progress');
      return;
    }
    
    const savedId = await savePersistence(formData);
    if (savedId) {
      console.log('Form saved as draft with ID:', savedId);
      lastAutoSaveContentRef.current = JSON.stringify(getContentFields(formData));
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
    autoSaveStatus: autoSaveStatus as AutoSaveStatus,
    retryCount,
    justSaved,
    resetJustSaved
  };
};
