
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHybridStorage } from '../useHybridStorage';
import { useFallbackStorage } from './useFallbackStorage';
import { updateDraftById } from '../../utils/database/drafts';
import { FormData } from '../../types/formTypes';

interface UseManualSaveProps {
  isOnline: boolean;
  setLastSaved: (date: Date) => void;
  setIsDirty: (isDirty: boolean) => void;
  setJustSaved: (justSaved: boolean) => void;
  setRetryCount: (count: number) => void;
}

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
  setRetryCount
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
    
    const draftData: FormData = {
      ...formData,
      timestamp: new Date().toISOString(),
      createdAt: formData.createdAt || new Date().toISOString(),
      status: 'draft' as const,
      submissionStatus: 'draft',
      lastModified: new Date().toISOString(),
      formSchemaVersion: 1 // Current schema version
    };
    
    // If form already has an ID, update existing draft instead of creating new one
    if (formData.id) {
      console.log('Updating existing draft with ID:', formData.id);
      
      if (!capabilities.indexedDB) {
        const fallbackSuccess = fallbackSave(draftData, saveToFallbackStorage);
        if (fallbackSuccess) {
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
    
    // Create new draft if no ID exists or update failed
    if (!formData.id) {
      draftData.id = Date.now();
    }
    
    if (!capabilities.indexedDB) {
      const fallbackSuccess = fallbackSave(draftData, saveToFallbackStorage);
      if (fallbackSuccess) {
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
      const result = await saveToHybridStorage(draftData, true);
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
