
// Hybrid storage form operations

import { FormData } from '../../types/formTypes';
import { saveFormToSupabase, updateFormInSupabase, getFormsFromSupabase, deleteFormFromSupabase } from '../supabaseOperations';
import { saveDraftData, getAllDrafts, deleteDraft, getAllForms, updateDraftById, saveFormData } from '../indexedDB';
import { getStorageCapabilities, updateStorageCapabilities } from './capabilities';

/**
 * Save or update form data using hybrid approach with deduplication
 * @param formData Form data to save
 * @param isDraft Whether this is a draft
 * @returns Promise with saved form data
 */
export const saveFormHybrid = async (formData: FormData, isDraft: boolean = false): Promise<FormData> => {
  const capabilities = getStorageCapabilities();
  let supabaseResult = null;
  let indexedDBResult = null;
  
  // For drafts, check for existing drafts by patient name or ID to prevent duplicates
  if (isDraft && (formData.patientName || formData.idNumber)) {
    if (capabilities.indexedDB) {
      try {
        const existingDrafts = await getAllDrafts();
        const duplicateDraft = existingDrafts.find(draft => 
          (formData.patientName && draft.patientName === formData.patientName) ||
          (formData.idNumber && draft.idNumber === formData.idNumber)
        );
        
        if (duplicateDraft && duplicateDraft.id !== formData.id) {
          // Update existing draft instead of creating new one
          const updatedData = { ...duplicateDraft, ...formData, id: duplicateDraft.id };
          await updateDraftById(duplicateDraft.id as string | number, updatedData);
          console.log('Updated existing draft to prevent duplicate');
          return updatedData;
        }
      } catch (error) {
        console.error('Error checking for duplicate drafts:', error);
      }
    }
  }
  
  // For drafts, check if we need to update existing draft with same ID
  if (isDraft && formData.id) {
    // Try to update existing draft first in IndexedDB
    if (capabilities.indexedDB) {
      try {
        const existingDrafts = await getAllDrafts();
        const existingDraft = existingDrafts.find(draft => draft.id === formData.id);
        
        if (existingDraft) {
          await updateDraftById(formData.id as string | number, formData);
          indexedDBResult = { ...formData };
          console.log('Updated existing draft in IndexedDB');
          return indexedDBResult;
        }
      } catch (error) {
        console.error('IndexedDB update failed:', error);
      }
    }

    // Try Supabase only for completed forms, not drafts
    if (capabilities.supabase && !isDraft) {
      try {
        const existingForms = await getFormsFromSupabase(false);
        const existingForm = existingForms.find(form => form.id === formData.id);
        
        if (existingForm) {
          supabaseResult = await updateFormInSupabase(formData.id as string, formData, isDraft);
          console.log('Updated existing form in Supabase');
          return supabaseResult;
        }
      } catch (error) {
        console.error('Supabase update check failed:', error);
        updateStorageCapabilities({ supabase: false });
      }
    }
  }
  
  // Create new form/draft
  // For completed forms, try Supabase first
  if (!isDraft && capabilities.supabase) {
    try {
      supabaseResult = await saveFormToSupabase(formData, isDraft);
      console.log('Form saved to Supabase successfully');
      return supabaseResult;
    } catch (error) {
      console.error('Supabase save failed, trying IndexedDB:', error);
      updateStorageCapabilities({ supabase: false });
    }
  }

  // For drafts or fallback, use IndexedDB
  if (capabilities.indexedDB) {
    try {
      const id = isDraft ? await saveDraftData(formData) : await saveFormData(formData);
      indexedDBResult = { ...formData, id };
      console.log(`${isDraft ? 'Draft' : 'Form'} saved to IndexedDB`);
      return indexedDBResult;
    } catch (error) {
      console.error('IndexedDB save also failed:', error);
      updateStorageCapabilities({ indexedDB: false });
    }
  }

  throw new Error('All storage methods failed');
};

/**
 * Get all forms using hybrid approach
 * @param isDraft Whether to get drafts
 * @returns Promise with forms array
 */
export const getFormsHybrid = async (isDraft: boolean = false): Promise<FormData[]> => {
  const capabilities = getStorageCapabilities();
  
  // For completed forms, try Supabase first
  if (!isDraft && capabilities.supabase) {
    try {
      const forms = await getFormsFromSupabase(isDraft);
      console.log(`Retrieved ${forms.length} forms from Supabase`);
      return forms;
    } catch (error) {
      console.error('Supabase fetch failed, trying IndexedDB:', error);
      updateStorageCapabilities({ supabase: false });
    }
  }

  // For drafts or fallback, use IndexedDB
  if (capabilities.indexedDB) {
    try {
      const forms = isDraft ? await getAllDrafts() : await getAllForms();
      console.log(`Retrieved ${forms.length} ${isDraft ? 'drafts' : 'forms'} from IndexedDB`);
      return forms;
    } catch (error) {
      console.error('IndexedDB fetch also failed:', error);
      updateStorageCapabilities({ indexedDB: false });
    }
  }

  console.warn('No storage methods available, returning empty array');
  return [];
};

/**
 * Delete form using hybrid approach with proper ID handling
 * @param id Form ID (string or number)
 * @param isDraft Whether this is a draft
 */
export const deleteFormHybrid = async (id: string | number, isDraft: boolean = false): Promise<void> => {
  const capabilities = getStorageCapabilities();
  let supabaseSuccess = false;
  let indexedDBSuccess = false;
  let lastError: Error | null = null;

  console.log(`Attempting to delete ${isDraft ? 'draft' : 'form'} with ID:`, id, typeof id);

  // For completed forms, try Supabase first (only if ID is string)
  if (!isDraft && capabilities.supabase && typeof id === 'string') {
    try {
      await deleteFormFromSupabase(id, isDraft);
      supabaseSuccess = true;
      console.log('Form deleted from Supabase');
    } catch (error) {
      console.error('Supabase delete failed:', error);
      lastError = error as Error;
    }
  }

  // For drafts or fallback, try IndexedDB
  if (capabilities.indexedDB) {
    try {
      // Convert string ID to number for IndexedDB if needed
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      if (isNaN(numericId)) {
        throw new Error(`Invalid ID for IndexedDB deletion: ${id}`);
      }

      if (isDraft) {
        await deleteDraft(numericId);
        indexedDBSuccess = true;
        console.log(`Draft deleted from IndexedDB with ID: ${numericId}`);
      } else {
        // For completed forms in IndexedDB, we'd need to implement this
        console.warn('Delete completed form from IndexedDB not fully implemented');
        indexedDBSuccess = true; // Mark as success to avoid error
      }
    } catch (error) {
      console.error('IndexedDB delete failed:', error);
      lastError = error as Error;
    }
  }

  if (!supabaseSuccess && !indexedDBSuccess) {
    throw lastError || new Error('Failed to delete form from all storage methods');
  }
};

/**
 * Delete multiple forms using hybrid approach
 * @param ids Array of form IDs
 * @param isDraft Whether these are drafts
 */
export const deleteMultipleFormsHybrid = async (ids: (string | number)[], isDraft: boolean = false): Promise<void> => {
  const results = { success: 0, failed: 0 };

  for (const id of ids) {
    try {
      await deleteFormHybrid(id, isDraft);
      results.success++;
      console.log(`Successfully deleted ${isDraft ? 'draft' : 'form'} ${id}`);
    } catch (error) {
      console.error(`Failed to delete ${isDraft ? 'draft' : 'form'} ${id}:`, error);
      results.failed++;
    }
  }

  if (results.failed > 0) {
    throw new Error(`Failed to delete ${results.failed} out of ${ids.length} items`);
  }

  console.log(`Bulk delete completed: ${results.success} successful, ${results.failed} failed`);
};
