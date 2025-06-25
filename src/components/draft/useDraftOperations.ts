
import { useState, useEffect } from 'react';
import { useHybridStorage } from '../../hooks/useHybridStorage';
import { FormData } from '../../types/formTypes';
import { REGIONS } from '../../utils/regionDetection';

export const useDraftOperations = (isOpen: boolean) => {
  const [drafts, setDrafts] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const { getForms, deleteForm } = useHybridStorage();

  const loadDrafts = async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const draftForms = await getForms(true);
      setDrafts(draftForms || []);
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
      await deleteForm(draftId, true);
      await loadDrafts();
    } catch (err) {
      console.error('Error deleting draft:', err);
    }
  };

  const handleBulkDeleteDrafts = async (draftIds: string[]) => {
    setIsBulkDeleting(true);
    try {
      for (const id of draftIds) {
        await deleteForm(id, true);
      }
      await loadDrafts();
    } catch (err) {
      console.error('Error bulk deleting drafts:', err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDoctorChange = async (draftId: string, newRegionCode: string) => {
    // This would update the draft with new doctor info
    console.log('Doctor change not implemented yet');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
