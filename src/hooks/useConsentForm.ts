
import { useState } from 'react';
import { useConnectivity } from './useConnectivity';
import { useRegionDetection } from './useRegionDetection';
import { useHybridStorage } from './useHybridStorage';
import { useFormData } from './useFormData';
import { useFormInitialization } from './useFormInitialization';
import { useFormActions } from './useFormActions';
import { AutoSaveStatus } from '../types/autoSaveTypes';

export const useConsentForm = () => {
  const [activeSection, setActiveSection] = useState('patientDetails');

  // Custom hooks for different concerns
  const { isOnline } = useConnectivity();
  const { capabilities } = useHybridStorage();
  const { 
    currentRegion, 
    regionDetected, 
    showManualSelector, 
    setRegionManually,
    showRegionSelector,
    hideRegionSelector,
    isRegionFromDraft,
    isRegionDetected
  } = useRegionDetection();
  
  const {
    formData,
    setFormData,
    handleInputChange,
    handleCheckboxChange,
    isDirty,
    setIsDirty
  } = useFormData();

  const { isResuming } = useFormInitialization({ setFormData });

  const {
    saveForm,
    submitForm,
    lastSaved,
    formatLastSaved,
    autoSaveStatus,
    retryCount,
    justSaved,
    resetJustSaved
  } = useFormActions({ formData, isDirty, setIsDirty, isOnline });

  return {
    activeSection,
    setActiveSection,
    formData,
    handleInputChange,
    handleCheckboxChange,
    saveForm,
    submitForm,
    isOnline,
    currentRegion,
    regionDetected,
    showManualSelector,
    setRegionManually,
    showRegionSelector,
    hideRegionSelector,
    isResuming,
    lastSaved,
    isDirty,
    formatLastSaved,
    dbInitialized: capabilities.supabase || capabilities.indexedDB,
    autoSaveStatus,
    retryCount,
    justSaved,
    resetJustSaved,
    isRegionFromDraft,
    isRegionDetected
  };
};
