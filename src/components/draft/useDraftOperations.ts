
import { useState, useEffect } from 'react';
import { useHybridStorage } from '../../hooks/useHybridStorage';
import { FormData } from '../../types/formTypes';
import { REGIONS } from '../../utils/regionDetection';
import { updateDraftById } from '../../utils/indexedDB';

export const useDraftOperations = (isOpen: boolean) => {
  const [drafts, setDrafts] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const { getForms, deleteForm, saveForm } = useHybridStorage();

  const loadDrafts = async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const draftForms = await getForms(true);
      setDrafts(draftForms || []);
      console.log(`Loaded ${draftForms?.length || 0} drafts`);
    } catch (err) {
      setError('Failed to load drafts');
      console.error('Error loading drafts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
    }
  }, [isOpen]);

  const handleDeleteDraft = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      console.log('Deleting draft with ID:', draftId, typeof draftId);
      
      // Convert string ID to number for IndexedDB operations
      const numericId = parseInt(draftId, 10);
      if (isNaN(numericId)) {
        throw new Error(`Invalid draft ID: ${draftId}`);
      }
      
      await deleteForm(numericId, true);
      console.log('Draft deleted successfully');
      await loadDrafts();
    } catch (err) {
      console.error('Error deleting draft:', err);
      setError(`Failed to delete draft: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleBulkDeleteDrafts = async (draftIds: string[]) => {
    setIsBulkDeleting(true);
    setError(null);
    let successCount = 0;
    let failCount = 0;
    
    try {
      for (const id of draftIds) {
        try {
          console.log('Bulk deleting draft with ID:', id, typeof id);
          
          // Convert string ID to number for IndexedDB operations
          const numericId = parseInt(id, 10);
          if (isNaN(numericId)) {
            throw new Error(`Invalid draft ID: ${id}`);
          }
          
          await deleteForm(numericId, true);
          successCount++;
          console.log(`Successfully deleted draft ${id}`);
        } catch (err) {
          failCount++;
          console.error(`Failed to delete draft ${id}:`, err);
        }
      }
      
      if (failCount > 0) {
        setError(`Deleted ${successCount} drafts, but ${failCount} failed`);
      }
      
      await loadDrafts();
    } catch (err) {
      console.error('Error in bulk delete:', err);
      setError('Bulk delete operation failed');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDoctorChange = async (draftId: string, newRegionCode: string) => {
    try {
      console.log('Changing region for draft:', draftId, 'to:', newRegionCode);
      
      // Find the draft to update
      const draftToUpdate = drafts.find(draft => String(draft.id) === draftId);
      if (!draftToUpdate) {
        throw new Error(`Draft with ID ${draftId} not found`);
      }

      // Get the new region details
      const newRegion = REGIONS[newRegionCode as keyof typeof REGIONS];
      if (!newRegion) {
        throw new Error(`Invalid region code: ${newRegionCode}`);
      }

      // Update the draft with new region information
      const updatedDraft: FormData = {
        ...draftToUpdate,
        regionCode: newRegion.code,
        region: newRegion.name,
        doctor: newRegion.doctor,
        practiceNumber: newRegion.practiceNumber,
        lastModified: new Date().toISOString()
      };

      // Save the updated draft
      await saveForm(updatedDraft, true);
      console.log('Draft region updated successfully');
      
      // Reload drafts to show the change
      await loadDrafts();
    } catch (err) {
      console.error('Error updating draft region:', err);
      setError(`Failed to update region: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  const getDoctorOptions = () => {
    return Object.values(REGIONS);
  };

  return {
    drafts,
    isLoading,
    error,
    isBulkDeleting,
    loadDrafts,
    handleDeleteDraft,
    handleBulkDeleteDrafts,
    handleDoctorChange,
    formatDate,
    getDoctorOptions
  };
};
