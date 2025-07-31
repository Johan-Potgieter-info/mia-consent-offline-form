
import { useNavigate } from 'react-router-dom';
import { useHybridStorage } from './useHybridStorage';
import { useToast } from '@/hooks/use-toast';
import { useFormSession } from './useFormSession';
import { FormData, FormSubmissionResult } from '../types/formTypes';
import { Region } from '../utils/regionSelection';
import { checkServerConnectivity } from '../utils/connectivity';
import { submissionLogger } from '../utils/submissionEventLogger';
import { validateForm } from '../utils/formValidation';
import { prepareFormData } from '../utils/formDataPreparation';
import { processSubmission } from '../utils/submissionProcessor';

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
      
      // Prepare form data and handle versioning
      const { preparedData, warnings } = prepareFormData(formData, currentRegion, false);
      
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
      const validation = validateForm(preparedData);
      if (!validation.isValid) {
        console.log('Validation failed:', validation.errors);
        
        // Log validation failure
        await submissionLogger.logValidationFailed(formId, validation.errors, {
          formVersion: preparedData.formSchemaVersion
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
      
      // Update prepared data with actual connectivity
      const finalPreparedData = { ...preparedData, synced: actuallyOnline };
      
      // Process the submission using the new modular approach
      return await processSubmission(
        finalPreparedData,
        formData,
        currentRegion,
        isResuming,
        actuallyOnline,
        {
          startSubmission,
          completeSubmission,
          failSubmission,
          onOfflineSubmission,
          onOnlineSubmission
        },
        {
          saveForm,
          deleteForm,
          syncData,
          getForms,
          clearSession,
          capabilities,
          toast
        }
      );
      
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
