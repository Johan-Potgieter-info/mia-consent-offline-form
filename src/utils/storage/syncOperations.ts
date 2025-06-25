
// Sync operations for hybrid storage

import { saveFormToSupabase } from '../supabaseOperations';
import { getAllDrafts, getAllForms, deleteDraft } from '../indexedDB';
import { getStorageCapabilities } from './capabilities';

/**
 * Sync IndexedDB data to Supabase when connection is restored
 * Only syncs completed forms, not drafts
 */
export const syncToSupabase = async (): Promise<{ success: number; failed: number }> => {
  const capabilities = getStorageCapabilities();
  
  if (!capabilities.indexedDB || !capabilities.supabase) {
    console.log('Sync skipped: required storage not available');
    return { success: 0, failed: 0 };
  }

  const results = { success: 0, failed: 0 };

  try {
    // Only sync completed forms, NOT drafts
    // Drafts should remain local until they are completed
    console.log('Starting sync of completed forms only (drafts will remain local)');

    const forms = await getAllForms();
    const unsynced = forms.filter(form => !form.synced && form.status !== 'draft');
    
    console.log(`Found ${unsynced.length} unsynced completed forms to sync`);

    for (const form of unsynced) {
      try {
        await saveFormToSupabase(form, false); // false = not a draft
        results.success++;
        console.log(`Successfully synced completed form: ${form.id}`);
        
        // Mark as synced in IndexedDB (we'd need to implement this)
        // For now, we'll leave it as is since the form is completed
      } catch (error) {
        console.error('Failed to sync completed form:', form.id, error);
        results.failed++;
      }
    }

    console.log(`Sync completed: ${results.success} success, ${results.failed} failed`);
    console.log('Note: Draft forms were not synced and remain local-only');
  } catch (error) {
    console.error('Sync process error:', error);
  }

  return results;
};

/**
 * Check if a form should be synced to cloud storage
 * @param form Form data to check
 * @returns boolean indicating if form should be synced
 */
export const shouldSyncForm = (form: any): boolean => {
  // Only sync completed forms
  if (form.status === 'draft') {
    return false;
  }

  // Only sync forms that have required fields
  if (!form.patientName || !form.idNumber || !form.consentAgreement) {
    return false;
  }

  // Don't sync if already synced
  if (form.synced) {
    return false;
  }

  return true;
};
