
// Draft-specific storage operations

import { DRAFTS_STORE } from './database';
import { 
  saveToStore, 
  getAllFromStore, 
  deleteFromStore, 
  decryptItems
} from './databaseOperations';
import { FormData } from '../types/formTypes';

/**
 * Save draft form data
 * @param formData Form data to save as draft
 * @returns Promise with saved draft ID
 */
export const saveDraftForm = async (formData: FormData): Promise<number> => {
  const draftMetadata = {
    status: 'draft',
    regionLabel: `${formData.regionCode || 'PTA'}-DRAFT-${formData.id || Date.now()}`
  };
  
  const savedId = await saveToStore(DRAFTS_STORE, formData, draftMetadata);
  
  console.log(`Draft saved to IndexedDB for region: ${formData.regionCode || 'PTA'}`);
  return savedId;
};

/**
 * Get all drafts
 * @returns Promise with all drafts (decrypted)
 */
export const getAllDrafts = async (): Promise<FormData[]> => {
  const drafts = await getAllFromStore(DRAFTS_STORE);
  
  // Decrypt all drafts
  const decryptedDrafts = decryptItems(drafts) as FormData[];
  
  // Sort drafts by lastModified (newest first)
  return decryptedDrafts.sort((a, b) => {
    const dateA = new Date((a as FormData).lastModified || (a as FormData).timestamp);
    const dateB = new Date((b as FormData).lastModified || (b as FormData).timestamp);
    return dateB.getTime() - dateA.getTime();
  });
};

/**
 * Delete a draft
 * @param id Draft ID to delete
 * @returns Promise that resolves when draft is deleted
 */
export const deleteDraft = async (id: number): Promise<void> => {
  return await deleteFromStore(DRAFTS_STORE, id);
};

/**
 * Get drafts by region
 * @param regionCode Region code to filter by
 * @returns Promise with region-specific drafts
 */
export const getDraftsByRegion = async (regionCode: string): Promise<FormData[]> => {
  const allDrafts = await getAllDrafts();
  
  return allDrafts.filter(draft => 
    draft.regionCode === regionCode || 
    (!draft.regionCode && regionCode === 'PTA')
  );
};
