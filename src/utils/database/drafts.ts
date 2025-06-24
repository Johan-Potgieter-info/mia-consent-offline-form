
// Draft-specific database operations

import { saveToIndexedDB, getAllFromIndexedDB, deleteFromIndexedDB, updateInIndexedDB } from './operations';
import { DRAFTS_STORE } from './config';
import { FormData } from '../../types/formTypes';

/**
 * Save draft form data to IndexedDB
 * @param formData Form data to save as draft
 * @returns Promise with the saved object ID
 */
export const saveDraftData = async (formData: FormData): Promise<number> => {
  console.log('Saving draft to IndexedDB:', formData);
  try {
    const result = await saveToIndexedDB(formData, DRAFTS_STORE);
    console.log('Draft saved successfully with ID:', result);
    return result;
  } catch (error) {
    console.error('Failed to save draft:', error);
    throw error;
  }
};

/**
 * Get all drafts from IndexedDB
 * @returns Promise with all drafts (decrypted and sorted)
 */
export const getAllDrafts = async (): Promise<FormData[]> => {
  console.log('Getting all drafts from IndexedDB');
  try {
    const drafts = await getAllFromIndexedDB(DRAFTS_STORE);
    console.log('Retrieved drafts:', drafts.length);
    
    // Sort drafts by lastModified (newest first)
    return drafts.sort((a, b) => {
      const dateA = new Date(a.lastModified || a.timestamp);
      const dateB = new Date(b.lastModified || b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Failed to get drafts:', error);
    return [];
  }
};

/**
 * Delete a draft from IndexedDB
 * @param id Draft ID to delete
 * @returns Promise that resolves when draft is deleted
 */
export const deleteDraft = async (id: number): Promise<void> => {
  console.log('Deleting draft with ID:', id);
  try {
    await deleteFromIndexedDB(id, DRAFTS_STORE);
    console.log('Draft deleted successfully');
  } catch (error) {
    console.error('Failed to delete draft:', error);
    throw error;
  }
};

/**
 * Update an existing draft by ID
 * @param id Draft ID to update
 * @param formData Updated form data
 * @returns Promise that resolves when draft is updated
 */
export const updateDraftById = async (id: number | string, formData: FormData): Promise<void> => {
  console.log('Updating draft with ID:', id);
  try {
    await updateInIndexedDB(id, formData, DRAFTS_STORE);
    console.log('Draft updated successfully');
  } catch (error) {
    console.error('Failed to update draft:', error);
    throw error;
  }
};
