
import { useState } from 'react';
import { useHybridStorage } from './useHybridStorage';
import { useToast } from '@/hooks/use-toast';
import { FormData } from '../types/formTypes';

interface UseFormPersistenceProps {
  isOnline: boolean;
}

interface UseFormPersistenceResult {
  lastSaved: Date | null;
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
  saveForm: (formData: FormData) => Promise<string | number | undefined>;
  autoSave: (formData: FormData) => Promise<void>;
  formatLastSaved: () => string;
  autoSaveStatus: 'idle' | 'saving' | 'success' | 'error';
  retryCount: number;
  justSaved: boolean;
  resetJustSaved: () => void;
}

export const useFormPersistence = ({ 
  isOnline 
}: UseFormPersistenceProps): UseFormPersistenceResult => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [justSaved, setJustSaved] = useState(false);
  const { toast } = useToast();
  const { saveForm: saveToHybridStorage, capabilities } = useHybridStorage();

  const resetJustSaved = () => {
    setJustSaved(false);
  };

  const saveToFallbackStorage = (formData: FormData) => {
    try {
      const dataToStore = {
        ...formData,
        timestamp: new Date().toISOString(),
        fallbackStorage: true,
        status: 'draft'
      };
      localStorage.setItem('formDraftFallback', JSON.stringify(dataToStore));
      console.log('Saved to localStorage fallback as draft');
      return true;
    } catch (error) {
      console.error('Fallback storage failed:', error);
      try {
        sessionStorage.setItem('formDraftSession', JSON.stringify({
          ...formData,
          status: 'draft'
        }));
        console.log('Saved to sessionStorage as draft');
        return true;
      } catch (sessionError) {
        console.error('Session storage also failed:', sessionError);
        return false;
      }
    }
  };

  // Save button - ALWAYS saves as draft (local only, never to cloud)
  const saveForm = async (formData: FormData): Promise<string | number | undefined> => {
    console.log('Manual save triggered - saving as DRAFT only', { id: formData.id });
    
    const draftData = {
      ...formData,
      timestamp: new Date().toISOString(),
      status: 'draft',
      // Ensure consistent ID for updates
      id: formData.id || Date.now()
    };
    
    if (!capabilities.indexedDB) {
      const fallbackSuccess = saveToFallbackStorage(draftData);
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
      // Force save as draft to IndexedDB only (isDraft = true)
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
      
      // Try fallback storage on manual save failure
      const fallbackSuccess = saveToFallbackStorage(draftData);
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

  // Auto-save - also saves as draft only, updates existing record
  const autoSave = async (formData: FormData): Promise<void> => {
    // Don't auto-save if we don't have essential data
    if (!formData.patientName && !formData.idNumber && !formData.cellPhone) {
      console.log('Auto-save skipped: insufficient data to save');
      return;
    }

    console.log('Auto-save triggered for form ID:', formData.id);
    
    if (!capabilities.indexedDB) {
      console.log('Auto-save skipped: No IndexedDB available, trying fallback');
      const fallbackSuccess = saveToFallbackStorage({
        ...formData,
        status: 'draft'
      });
      if (fallbackSuccess) {
        setLastSaved(new Date());
        setIsDirty(false);
        setAutoSaveStatus('success');
      } else {
        setAutoSaveStatus('error');
      }
      return;
    }
    
    setAutoSaveStatus('saving');
    
    try {
      // Force save as draft to IndexedDB only (isDraft = true)
      // Use existing ID to update the same record
      const autoSaveData = { 
        ...formData, 
        timestamp: new Date().toISOString(),
        autoSaved: true,
        status: 'draft',
        id: formData.id || Date.now() // Ensure we have an ID
      };
      
      await saveToHybridStorage(autoSaveData, true);
      
      setLastSaved(new Date());
      setIsDirty(false);
      setAutoSaveStatus('success');
      setRetryCount(0);
      console.log('Auto-saved as draft successfully with ID:', autoSaveData.id);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
      setRetryCount(prev => prev + 1);
      
      // Try fallback on auto-save failure
      const fallbackSuccess = saveToFallbackStorage({
        ...formData,
        status: 'draft'
      });
      if (fallbackSuccess) {
        setLastSaved(new Date());
        setIsDirty(false);
        setAutoSaveStatus('success');
        console.log('Auto-save failed but fallback succeeded');
      } else {
        console.error('Both auto-save and fallback failed');
        
        // Show error toast only after multiple failures
        if (retryCount >= 2) {
          toast({
            title: "Auto-save Issues",
            description: "Having trouble saving automatically. Please save manually.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    }
  };

  const formatLastSaved = (): string => {
    if (!lastSaved) return '';
    return lastSaved.toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return {
    lastSaved,
    isDirty,
    setIsDirty,
    saveForm,
    autoSave,
    formatLastSaved,
    autoSaveStatus,
    retryCount,
    justSaved,
    resetJustSaved,
  };
};
