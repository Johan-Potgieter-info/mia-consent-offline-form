
import { useNavigate } from 'react-router-dom';
import { useHybridStorage } from './useHybridStorage';
import { useToast } from '@/hooks/use-toast';
import { useFormSession } from './useFormSession';
import { FormData, FormSubmissionResult } from '../types/formTypes';
import { Region } from '../utils/regionDetection';
import { checkServerConnectivity } from '../utils/connectivity';
import { migrateFormData, CURRENT_FORM_VERSION, shouldShowVersionWarning, getVersionWarningMessage } from '../utils/formVersioning';
import { submissionLogger } from '../utils/submissionEventLogger';
import { SensitiveDataEncryption } from '../utils/sensitiveDataEncryption';

interface UseFormSubmissionProps {
  isOnline: boolean;
  onOfflineSubmission?: (formData: FormData, pendingForms: FormData[]) => void;
  onOnlineSubmission?: (formData: FormData) => void;
  onValidationErrors?: (errors: string[]) => void;
}

export const useFormSubmission = ({ 
  isOnline,
  onOfflineSubmission,
  onOnlineSubmission,
  onValidationErrors
}: UseFormSubmissionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveForm, deleteForm, syncData, capabilities, getForms } = useHybridStorage();
  const { clearSession } = useFormSession();

  const validateForm = (formData: FormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    console.log('Validating form data:', {
      patientName: formData.patientName,
      idNumber: formData.idNumber,
      cellPhone: formData.cellPhone,
      consentAgreement: formData.consentAgreement
    });

    // Check mandatory fields
    if (!formData.patientName?.trim()) {
      errors.push("Patient name is required");
    }
    
    if (!formData.idNumber?.trim()) {
      errors.push("ID number is required");
    }
    
    if (!formData.cellPhone?.trim()) {
      errors.push("Cell phone number is required");
    }
    
    console.log("🔍 [DEBUG] Consent Agreement value:", formData.consentAgreement);
    if (!formData.consentAgreement) {
      errors.push("You must agree to the consent form");
    }

    console.log('Validation result:', { isValid: errors.length === 0, errors });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const submitForm = async (
    formData: FormData, 
    currentRegion: Region | null, 
    isResuming: boolean,
    startSubmission?: () => boolean,
    completeSubmission?: (status: 'submitted' | 'synced') => void,
    failSubmission?: () => void
  ): Promise<FormSubmissionResult> => {
    const formId = String(formData.id || 'new');
    
    try {
      console.log('Processing form submission...', {
        formData: {
          patientName: formData.patientName,
          idNumber: formData.idNumber,
          cellPhone: formData.cellPhone,
          consentAgreement: formData.consentAgreement
        },
        isResuming,
        draftId: formData.id
      });

      // Log submission start
      await submissionLogger.logSubmissionStart(formId, {
        formVersion: formData.formSchemaVersion || 1,
        region: currentRegion?.code,
        isResuming
      });
      
      // Handle form versioning
      const { migrated: migratedData, warnings } = migrateFormData(formData);
      
      // Show version warnings if needed
      if (warnings.length > 0) {
        warnings.forEach(warning => {
          toast({
            title: "Form Updated",
            description: warning,
            variant: "default",
          });
        });
      }
      
      // Validate the form (this happens AFTER startSubmission is called)
      const validation = validateForm(migratedData);
      if (!validation.isValid) {
        console.log('Validation failed:', validation.errors);
        
        // Log validation failure
        await submissionLogger.logValidationFailed(formId, validation.errors, {
          formVersion: migratedData.formSchemaVersion
        });
        
        if (failSubmission) failSubmission();
        
        // Trigger validation error callback to show errors in UI
        if (onValidationErrors) {
          onValidationErrors(validation.errors);
        }
        
        // Also show toast for immediate feedback
        toast({
          title: "Validation Error",
          description: "Please complete all required fields before submitting.",
          variant: "destructive",
        });
        
        return { 
          success: false, 
          message: "Please fix validation errors before submitting"
        };
      }

      console.log('Form validation passed, proceeding with submission...');

      // CRITICAL FIX: Do a fresh real-time connectivity check instead of relying on stale state
      console.log('Checking real-time server connectivity...');
      const actuallyOnline = await checkServerConnectivity();
      console.log('Server connectivity result:', actuallyOnline);
      
      // Prepare final data with encryption for sensitive fields
      const encryptedData = SensitiveDataEncryption.encryptSensitiveFields(migratedData);
      
      const finalData = { 
        ...encryptedData, 
        timestamp: new Date().toISOString(),
        createdAt: encryptedData.createdAt || new Date().toISOString(), 
        synced: capabilities.supabase && actuallyOnline,
        submissionId: `${encryptedData.regionCode || currentRegion?.code || 'UNK'}-${Date.now()}`,
        submissionStatus: (actuallyOnline && capabilities.supabase ? 'submitted' : 'pending') as 'submitted' | 'pending',
        status: 'completed' as const,
        formSchemaVersion: CURRENT_FORM_VERSION
      };
      
      console.log('Saving completed form...', { 
        id: finalData.id, 
        status: finalData.status, 
        submissionStatus: finalData.submissionStatus,
        actuallyOnline,
        supabaseCapability: capabilities.supabase
      });
      
      // Save COMPLETED form (isDraft = false)
      const savedForm = await saveForm(finalData, false);
      console.log('Form saved successfully:', savedForm);
      
      // Log successful save
      await submissionLogger.logSaveSuccess(formId, false, {
        formVersion: finalData.formSchemaVersion,
        encrypted: true
      });
      
      // Delete the draft IMMEDIATELY after successful completion
      if (formData.id && isResuming) {
        try {
          console.log('Deleting draft form after successful submission...', formData.id);
          await deleteForm(formData.id, true);
          console.log('Draft deleted successfully after submission');
        } catch (error) {
          console.error('Draft deletion failed after submission (may not exist):', error);
        }
      }
      
      // Clear the form session since we successfully submitted
      clearSession();
      console.log('Form session cleared after successful submission');
      
      // FIXED: Correct logic for determining online vs offline submission
      const isActuallyOnline = actuallyOnline && capabilities.supabase;
      
      if (isActuallyOnline) {
        console.log('Processing ONLINE submission...', { 
          actuallyOnline, 
          supabaseCapability: capabilities.supabase 
        });
        
        if (completeSubmission) completeSubmission('submitted');
        
        // Online submission - attempt sync
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
      } else {
        console.log('Processing OFFLINE submission...', { 
          actuallyOnline, 
          supabaseCapability: capabilities.supabase 
        });
        
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
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Log submission failure
      await submissionLogger.logSubmissionFailed(formId, String(error), {
        formVersion: formData.formSchemaVersion || 1,
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

  return { submitForm };
};
