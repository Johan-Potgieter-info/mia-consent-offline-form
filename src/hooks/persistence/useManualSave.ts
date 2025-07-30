
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHybridStorage } from '../useHybridStorage';
import { useFallbackStorage } from './useFallbackStorage';
import { updateDraftById } from '../../utils/database/drafts';
import { FormData } from '../../types/formTypes';
import { 
  getStorageQuota, 
  isStorageNearCapacity, 
  cleanupOldDrafts, 
  emergencyCleanup,
  downloadEmergencyExport 
} from '../../utils/storage/quotaManager';

interface UseManualSaveProps {
  isOnline: boolean;
  setLastSaved: (date: Date) => void;
  setIsDirty: (isDirty: boolean) => void;
  setJustSaved: (justSaved: boolean) => void;
  setRetryCount: (count: number) => void;
  setShowSaveConfirmation?: (show: boolean) => void;
  setSaveMessage?: (message: string) => void;
}

// Helper function to check if form has meaningful content
const hasMeaningfulContent = (formData: FormData): boolean => {
  const meaningfulFields = [
    'patientName',
    'idNumber', 
    'cellPhone',
    'whatsappNumber',
    'email',
    'dateOfBirth',
    'birthDate',
    'address',
    'emergencyContactName',
    'emergencyContactNumber',
    'emergencyPhone'
  ];
  
  return meaningfulFields.some(field => {
    const value = formData[field as keyof FormData];
    return value && typeof value === 'string' && value.trim().length > 0;
  });
};

// Enhanced save with retry logic and exponential backoff
const saveWithRetry = async (
  saveFunction: () => Promise<any>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<any> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await saveFunction();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Save attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

// Fallback save function - consolidated logic
const fallbackSave = (formData: FormData, saveToFallbackStorage: (data: FormData) => boolean): boolean => {
  console.log('Using fallback storage for save...');
  
  // Add deduplication check for fallback storage
  const existingFallbackData = localStorage.getItem('fallback_drafts');
  let existingDrafts: FormData[] = [];
  
  try {
    existingDrafts = existingFallbackData ? JSON.parse(existingFallbackData) : [];
  } catch (error) {
    console.error('Error parsing existing fallback drafts:', error);
    existingDrafts = [];
  }
  
  // Check for existing draft with same patient info to prevent duplicates
  const existingDraftIndex = existingDrafts.findIndex(draft => 
    (formData.patientName && draft.patientName === formData.patientName) ||
    (formData.idNumber && draft.idNumber === formData.idNumber) ||
    (formData.id && draft.id === formData.id)
  );
  
  if (existingDraftIndex >= 0) {
    // Update existing draft instead of creating new one
    existingDrafts[existingDraftIndex] = {
      ...existingDrafts[existingDraftIndex],
      ...formData,
      lastModified: new Date().toISOString(),
      formSchemaVersion: 1
    };
    
    try {
      localStorage.setItem('fallback_drafts', JSON.stringify(existingDrafts));
      console.log('Updated existing fallback draft to prevent duplicate');
      return true;
    } catch (error) {
      console.error('Failed to update fallback draft:', error);
      return false;
    }
  }
  
  // Use original fallback save for new drafts
  return saveToFallbackStorage(formData);
};

export const useManualSave = ({
  isOnline,
  setLastSaved,
  setIsDirty,
  setJustSaved,
  setRetryCount,
  setShowSaveConfirmation,
  setSaveMessage
}: UseManualSaveProps) => {
  const { toast } = useToast();
  const { saveForm: saveToHybridStorage, capabilities, getForms } = useHybridStorage();
  const { saveToFallbackStorage } = useFallbackStorage();

  const saveForm = async (formData: FormData): Promise<string | number | undefined> => {
    console.log('Manual save triggered - saving as DRAFT only', { id: formData.id });
    
    // Check for meaningful content first
    if (!hasMeaningfulContent(formData)) {
      console.log('Form has no meaningful content, skipping save');
      return;
    }

    // Check storage quota and cleanup if necessary
    try {
      const storageNearCapacity = await isStorageNearCapacity();
      if (storageNearCapacity) {
        console.log('Storage near capacity, attempting cleanup...');
        
        const cleanupResult = await cleanupOldDrafts(
          () => getForms(true),
          (id) => capabilities.indexedDB ? updateDraftById(id, null) : Promise.resolve()
        );
        
        if (cleanupResult.deletedCount > 0) {
          toast({
            title: "Storage Cleanup",
            description: `Cleaned up ${cleanupResult.deletedCount} old drafts to free space`,
            variant: "default",
          });
        }
        
        // If still near capacity after cleanup, try emergency cleanup
        const stillNearCapacity = await isStorageNearCapacity();
        if (stillNearCapacity) {
          console.log('Still near capacity, attempting emergency cleanup...');
          
          const emergencyResult = await emergencyCleanup(
            () => getForms(true),
            (id) => capabilities.indexedDB ? updateDraftById(id, null) : Promise.resolve()
          );
          
          if (emergencyResult.deletedCount > 0) {
            toast({
              title: "Emergency Storage Cleanup",
              description: `Removed ${emergencyResult.deletedCount} drafts to prevent storage overflow`,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error('Error during storage quota check:', error);
    }
    
    const draftData: FormData = {
      ...formData,
      timestamp: new Date().toISOString(),
      createdAt: formData.createdAt || new Date().toISOString(),
      status: 'draft' as const,
      submissionStatus: 'draft',
      lastModified: new Date().toISOString(),
      formSchemaVersion: 1 // Current schema version
    };
    
    // For manual saves, always create new drafts to avoid overwriting
    // Only update existing drafts for auto-saves or explicit updates
    const isManualSave = true; // This hook is specifically for manual saves
    
    if (formData.id && !isManualSave) {
      console.log('Updating existing draft with ID:', formData.id);
      
      if (!capabilities.indexedDB) {
        const fallbackSuccess = fallbackSave(draftData, saveToFallbackStorage);
        if (fallbackSuccess) {
          // Trigger visual feedback
          const message = isOnline ? "Draft saved to cloud" : "Draft saved locally";
          if (setSaveMessage) setSaveMessage(message);
          if (setShowSaveConfirmation) setShowSaveConfirmation(true);
          
          toast({
            title: "Draft Updated",
            description: isOnline ? "Form saved as draft to browser storage" : "Form saved as draft locally (offline)",
            variant: "default",
          });
          setLastSaved(new Date());
          setIsDirty(false);
          setJustSaved(true);
          return formData.id;
        }
      } else {
        try {
          // Check for existing drafts to prevent duplicates
          const existingDrafts = await getForms(true);
          const existingDraft = existingDrafts.find(draft => 
            draft.id === formData.id ||
            (formData.patientName && draft.patientName === formData.patientName) ||
            (formData.idNumber && draft.idNumber === formData.idNumber)
          );
          
          if (existingDraft && existingDraft.id !== formData.id) {
            // Update the existing draft instead of creating a new one
            console.log('Found duplicate draft, updating existing:', existingDraft.id);
            await updateDraftById(existingDraft.id, { ...existingDraft, ...draftData, id: existingDraft.id });
            
            // Trigger visual feedback
            const message = isOnline ? "Draft saved to cloud" : "Draft saved locally";
            if (setSaveMessage) setSaveMessage(message);
            if (setShowSaveConfirmation) setShowSaveConfirmation(true);
            
            setLastSaved(new Date());
            setIsDirty(false);
            setJustSaved(true);
            setRetryCount(0);
            
            toast({
              title: "Draft Updated",
              description: "Existing draft updated to prevent duplicates",
            });
            
            return existingDraft.id;
          } else {
            // Update the current draft
            await updateDraftById(formData.id, draftData);
            
            // Trigger visual feedback
            const message = isOnline ? "Draft saved to cloud" : "Draft saved locally";
            if (setSaveMessage) setSaveMessage(message);
            if (setShowSaveConfirmation) setShowSaveConfirmation(true);
            
            setLastSaved(new Date());
            setIsDirty(false);
            setJustSaved(true);
            setRetryCount(0);
            
            toast({
              title: "Draft Updated",
              description: isOnline ? "Form updated as draft locally - not submitted to cloud" : "Form updated as draft locally (offline)",
            });
            
            console.log('Draft updated successfully with ID:', formData.id);
            return formData.id;
          }
        } catch (error) {
          console.error('Draft update error:', error);
          // Fall back to creating new draft if update fails
        }
      }
    }
    
    // Always create new draft with unique ID for manual saves
    draftData.id = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!capabilities.indexedDB) {
      const fallbackSuccess = fallbackSave(draftData, saveToFallbackStorage);
      if (fallbackSuccess) {
        // Trigger visual feedback
        const message = isOnline ? "Draft saved to cloud" : "Draft saved locally";
        if (setSaveMessage) setSaveMessage(message);
        if (setShowSaveConfirmation) setShowSaveConfirmation(true);
        
        toast({
          title: "Draft Saved",
          description: isOnline ? "Form saved as draft to browser storage" : "Form saved as draft locally (offline)",
          variant: "default",
        });
        setLastSaved(new Date());
        setIsDirty(false);
        setJustSaved(true);
        return draftData.id;
      } else {
        toast({
          title: "Save Failed",
          description: "Unable to save form data - please copy important information",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      // Enhanced save with retry logic
      const result = await saveWithRetry(
        () => saveToHybridStorage(draftData, true),
        3,
        1000
      );
      
      // Trigger visual feedback
      const message = isOnline ? "Draft saved to cloud" : "Draft saved locally";
      if (setSaveMessage) setSaveMessage(message);
      if (setShowSaveConfirmation) setShowSaveConfirmation(true);
      
      setLastSaved(new Date());
      setIsDirty(false);
      setJustSaved(true);
      setRetryCount(0);
      
      toast({
        title: "Draft Saved",
        description: isOnline ? "Form saved as draft locally - not submitted to cloud" : "Form saved as draft locally (offline)",
      });
      
      console.log('Manual save completed with ID:', result?.id || result);
      return result?.id || result;
    } catch (error) {
      console.error('Manual save error:', error);
      
      const fallbackSuccess = fallbackSave(draftData, saveToFallbackStorage);
      if (fallbackSuccess) {
        // Trigger visual feedback
        const message = isOnline ? "Draft saved to cloud" : "Draft saved locally";
        if (setSaveMessage) setSaveMessage(message);
        if (setShowSaveConfirmation) setShowSaveConfirmation(true);
        
        toast({
          title: "Draft Saved",
          description: "Saved as draft to browser backup",
          variant: "default",
        });
        setLastSaved(new Date());
        setIsDirty(false);
        setJustSaved(true);
        return draftData.id;
      }
      
      toast({
        title: "Save Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { saveForm };
};
