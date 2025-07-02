
import { useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FormData } from '../types/formTypes';

interface UseDraftLoaderProps {
  isInitialized: boolean;
  getForms: (isDraft?: boolean) => Promise<any[]>;
  setFormData: (data: FormData) => void;
  setSubmissionStatus: (status: 'draft' | 'pending' | 'submitted' | 'synced') => void;
  detectAndSetRegion: (region?: any) => Promise<any>;
}

export const useDraftLoader = ({
  isInitialized,
  getForms,
  setFormData,
  setSubmissionStatus,
  detectAndSetRegion
}: UseDraftLoaderProps) => {
  const { draftId } = useParams();
  const hasLoadedDraftRef = useRef(false);
  const loadedDraftIdRef = useRef<string | null>(null);

  const loadDraftById = useCallback(async () => {
    if (!draftId || !isInitialized) return;
    
    // Prevent infinite loop - don't reload the same draft
    if (hasLoadedDraftRef.current && loadedDraftIdRef.current === draftId) {
      console.log(`Draft ${draftId} already loaded, skipping reload`);
      return;
    }

    try {
      console.log(`Loading draft ID: ${draftId}`);
      const drafts = await getForms(true);
      const matchingDraft = (drafts || []).find((draft) => String(draft.id) === draftId);
      
      if (matchingDraft) {
        // Ensure form data includes new fields with defaults
        const enhancedDraft = {
          ...matchingDraft,
          createdAt: matchingDraft.createdAt || matchingDraft.timestamp || new Date().toISOString(),
          submissionStatus: matchingDraft.submissionStatus || 'draft',
          formSchemaVersion: matchingDraft.formSchemaVersion || 1
        };
        
        setFormData(enhancedDraft);
        setSubmissionStatus(enhancedDraft.submissionStatus as any);
        
        // Mark as loaded to prevent reload
        hasLoadedDraftRef.current = true;
        loadedDraftIdRef.current = draftId;
        
        console.log(`Successfully loaded draft ID ${draftId}`);
        
        // If draft has a region, set it manually to preserve it
        if (matchingDraft.regionCode) {
          const region = {
            code: matchingDraft.regionCode,
            name: matchingDraft.region || 'Unknown',
            doctor: matchingDraft.doctor || 'Unknown',
            practiceNumber: matchingDraft.practiceNumber || 'Unknown'
          };
          await detectAndSetRegion(region);
        }
      } else {
        console.warn(`Draft with ID ${draftId} not found`);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [draftId, isInitialized, getForms, detectAndSetRegion, setFormData, setSubmissionStatus]);

  useEffect(() => {
    loadDraftById();
  }, [loadDraftById]);

  return {
    isResuming: !!draftId,
    loadDraftById
  };
};
console.log('📌 useDraftLoader executing');
