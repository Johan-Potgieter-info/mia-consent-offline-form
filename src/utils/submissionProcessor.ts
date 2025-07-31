
import { FormData, FormSubmissionResult } from '../types/formTypes';
import { PreparedFormData } from './formDataPreparation';
import { Region } from './regionSelection';
import { submissionLogger } from './submissionEventLogger';
import { StorageCapabilities } from './storage/capabilities';

interface SubmissionCallbacks {
  startSubmission?: () => boolean;
  completeSubmission?: (status: 'submitted' | 'synced') => void;
  failSubmission?: () => void;
  onOfflineSubmission?: (formData: FormData, pendingForms: FormData[]) => void;
  onOnlineSubmission?: (formData: FormData) => void;
}

interface SubmissionDependencies {
  saveForm: (formData: any, isDraft?: boolean) => Promise<any>;
  deleteForm: (id: string | number, isDraft?: boolean) => Promise<void>;
  syncData: () => Promise<{ success: number; failed: number }>;
  getForms: (isDraft?: boolean) => Promise<any[]>;
  clearSession: () => void;
  capabilities: StorageCapabilities;
  toast: (options: any) => void;
}

export const processSubmission = async (
  preparedData: PreparedFormData,
  originalFormData: FormData,
  currentRegion: Region | null,
  isResuming: boolean,
  actuallyOnline: boolean,
  callbacks: SubmissionCallbacks,
  dependencies: SubmissionDependencies
): Promise<FormSubmissionResult> => {
  const formId = String(originalFormData.id || 'new');
  const { saveForm, deleteForm, syncData, getForms, clearSession, capabilities, toast } = dependencies;
  const { completeSubmission, failSubmission, onOfflineSubmission, onOnlineSubmission } = callbacks;

  try {
    console.log('Saving completed form...', { 
      id: preparedData.id, 
      status: preparedData.status, 
      submissionStatus: preparedData.submissionStatus,
      actuallyOnline,
      supabaseCapability: capabilities.supabase
    });
    
    // Save COMPLETED form (isDraft = false)
    const savedForm = await saveForm(preparedData, false);
    console.log('Form saved successfully:', savedForm);
    
    // Log successful save
    await submissionLogger.logSaveSuccess(formId, false, {
      formVersion: preparedData.formSchemaVersion,
      encrypted: true
    });
    
    // Delete the draft IMMEDIATELY after successful completion
    if (originalFormData.id && isResuming) {
      try {
        console.log('Deleting draft form after successful submission...', originalFormData.id);
        await deleteForm(originalFormData.id, true);
        console.log('Draft deleted successfully after submission');
      } catch (error) {
        console.error('Draft deletion failed after submission (may not exist):', error);
      }
    }
    
    // Clear the form session since we successfully submitted
    clearSession();
    console.log('Form session cleared after successful submission');
    
    // FIXED: Use actual connectivity instead of capabilities check
    // If we can reach the server, treat it as online regardless of capabilities
    // Re-verify connectivity before deciding submission path
    const { checkServerConnectivity } = await import('./connectivity');
    const stillOnline = await checkServerConnectivity();
    
    if (stillOnline && capabilities.supabase) {
      return await handleOnlineSubmission(
        preparedData, 
        formId, 
        currentRegion, 
        completeSubmission, 
        capabilities, 
        syncData, 
        toast, 
        onOnlineSubmission
      );
    } else {
      return await handleOfflineSubmission(
        preparedData, 
        formId, 
        currentRegion, 
        completeSubmission, 
        getForms, 
        toast, 
        onOfflineSubmission
      );
    }
    
  } catch (error) {
    console.error('Form submission error:', error);
    
    // Log submission failure
    await submissionLogger.logSubmissionFailed(formId, String(error), {
      formVersion: originalFormData.formSchemaVersion || 1,
      region: currentRegion?.code
    });
    
    if (failSubmission) failSubmission();
    
    toast({
      title: "Submission Error",
      description: "Failed to submit form. Please try again.",
      variant: "destructive",
    });
    return { 
      success: false,
      message: "Form submission failed" 
    };
  }
};

const handleOnlineSubmission = async (
  finalData: PreparedFormData,
  formId: string,
  currentRegion: Region | null,
  completeSubmission: ((status: 'submitted' | 'synced') => void) | undefined,
  capabilities: StorageCapabilities,
  syncData: () => Promise<{ success: number; failed: number }>,
  toast: (options: any) => void,
  onOnlineSubmission: ((formData: FormData) => void) | undefined
): Promise<FormSubmissionResult> => {
  console.log('Processing ONLINE submission...', { 
    supabaseCapability: capabilities.supabase 
  });
  
  if (completeSubmission) completeSubmission('submitted');
  
  // Online submission - attempt sync if we have Supabase capabilities
  if (capabilities.supabase) {
    try {
      await syncData();
      console.log('Post-submission sync completed');
      
      // Log successful submission
      await submissionLogger.logSubmissionSuccess(formId, {
        formVersion: finalData.formSchemaVersion,
        region: currentRegion?.code,
        synced: true
      });
      
      if (completeSubmission) completeSubmission('synced');
    } catch (error) {
      console.error('Post-submission sync failed:', error);
      
      // Log sync failure but submission was still successful
      await submissionLogger.logSubmissionFailed(formId, `Sync failed: ${error}`, {
        formVersion: finalData.formSchemaVersion,
        submitted: true,
        syncFailed: true
      });
    }
  } else {
    // Log successful submission without sync
    await submissionLogger.logSubmissionSuccess(formId, {
      formVersion: finalData.formSchemaVersion,
      region: currentRegion?.code,
      synced: false
    });
  }
  
  console.log('Triggering ONLINE success dialog...');
  
  toast({
    title: "Form Submitted",
    description: "Form submitted successfully to cloud database.",
    variant: "default",
  });
  
  if (onOnlineSubmission) {
    setTimeout(() => {
      onOnlineSubmission(finalData);
    }, 100);
  }
  
  return { 
    success: true,
    message: "Form submitted successfully"
  };
};

const handleOfflineSubmission = async (
  finalData: PreparedFormData,
  formId: string,
  currentRegion: Region | null,
  completeSubmission: ((status: 'submitted' | 'synced') => void) | undefined,
  getForms: (isDraft?: boolean) => Promise<any[]>,
  toast: (options: any) => void,
  onOfflineSubmission: ((formData: FormData, pendingForms: FormData[]) => void) | undefined
): Promise<FormSubmissionResult> => {
  console.log('Processing OFFLINE submission...');
  
  // Log queued submission
  await submissionLogger.logSubmissionQueued(formId, {
    formVersion: finalData.formSchemaVersion,
    region: currentRegion?.code
  });
  
  if (completeSubmission) completeSubmission('submitted');
  
  // Get all pending forms for the summary
  const pendingForms = await getForms(false);
  const allPending = pendingForms.filter(form => 
    form.submissionStatus === 'pending' && form.status === 'completed'
  );
  
  console.log('Triggering OFFLINE submission dialog...', { 
    pendingCount: allPending.length,
    currentForm: finalData.patientName 
  });
  
  toast({
    title: "Form Queued",
    description: "Form queued for submission when online.",
    variant: "default",
  });
  
  if (onOfflineSubmission) {
    setTimeout(() => {
      onOfflineSubmission(finalData, allPending);
    }, 100);
  }
  
  return { 
    success: true,
    message: "Form queued for submission"
  };
};
