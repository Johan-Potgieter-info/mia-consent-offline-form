
import { useState, useCallback, useRef } from 'react';
import { FormData } from '../types/formTypes';
import { migrateFormData, shouldShowVersionWarning, getVersionWarningMessage, CURRENT_FORM_VERSION } from '../utils/formVersioning';
import { submissionLogger } from '../utils/submissionEventLogger';
import { SensitiveDataEncryption } from '../utils/sensitiveDataEncryption';
import { validateForm as validateFormComprehensive } from '../utils/formValidation';

// Helper function to check if form has meaningful content
const hasMeaningfulContent = (formData: FormData): boolean => {
  const meaningfulFields = [
    'patientName',
    'idNumber', 
    'cellPhone',
    'email',
    'dateOfBirth',
    'birthDate',
    'address',
    'emergencyContactName',
    'emergencyContactNumber'
  ];
  
  return meaningfulFields.some(field => {
    const value = formData[field as keyof FormData];
    return value && typeof value === 'string' && value.trim().length > 0;
  });
};

export const useFormManagement = () => {
  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [isDirty, setIsDirty] = useState(false);
  const [activeSection, setActiveSection] = useState("patientDetails");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const isFirstLoadRef = useRef(true);

  const handleInputChange = (field: keyof FormData, value: string) => {
    console.log(`Form field changed: ${field} = ${value}`);
    
    setFormData((prev) => {
      const updated = { 
        ...prev, 
        [field]: value,
        lastModified: new Date().toISOString(),
        formSchemaVersion: CURRENT_FORM_VERSION
      };
      
      // Log field change for sensitive fields (without the actual value)
      if (SensitiveDataEncryption.isFieldSensitive(field as string)) {
        submissionLogger.logEvent(
          'save.success',
          String(prev.id || 'new'),
          'info',
          `Updated sensitive field: ${field}`,
          { fieldName: field, fieldType: 'sensitive' }
        );
      }
      
      return updated;
    });
    
    // Only set dirty if this is not the first load
    if (!isFirstLoadRef.current) {
      setIsDirty(true);
    }
  };

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    console.log(`Checkbox changed: ${field} = ${checked} (value: ${value})`);
    
    // Special handling for consent agreement to ensure boolean type
    const finalValue = field === 'consentAgreement' ? checked : checked;
    
    setFormData((prev) => ({ 
      ...prev, 
      [field]: finalValue,
      lastModified: new Date().toISOString(),
      formSchemaVersion: CURRENT_FORM_VERSION
    }));
    
    // Only set dirty if this is not the first load  
    if (!isFirstLoadRef.current) {
      setIsDirty(true);
    }
  };

  const updateFormDataWithRegion = useCallback((currentRegion: any) => {
    setFormData((prev) => ({
      ...prev,
      regionCode: currentRegion?.code || prev.regionCode,
      region: currentRegion?.name || prev.region,
      doctor: currentRegion?.doctor || prev.doctor,
      practiceNumber: currentRegion?.practiceNumber || prev.practiceNumber,
      lastModified: new Date().toISOString(),
      formSchemaVersion: CURRENT_FORM_VERSION
    }));
  }, []);

  // Enhanced setFormData that handles versioning and decryption
  const setFormDataWithMigration = useCallback((data: FormData) => {
    console.log('Setting form data:', { 
      patientName: data.patientName,
      consentAgreement: data.consentAgreement,
      hasId: !!data.id 
    });
    
    // First decrypt if needed
    const decryptedData = SensitiveDataEncryption.decryptSensitiveFields(data);
    
    // Then migrate if needed
    const { migrated, warnings } = migrateFormData(decryptedData);
    
    // Show version warning if needed
    if (shouldShowVersionWarning(data.formSchemaVersion || 1)) {
      const warningMessage = getVersionWarningMessage(data.formSchemaVersion || 1);
      console.warn('Form version warning:', warningMessage);
    }
    
    // Log any warnings
    if (warnings.length > 0) {
      submissionLogger.logEvent(
        'save.success',
        String(data.id || 'unknown'),
        'warning',
        `Form migrated: ${warnings.join(', ')}`,
        { 
          fromVersion: data.formSchemaVersion || 1,
          toVersion: CURRENT_FORM_VERSION,
          warnings 
        }
      );
    }
    
    setFormData(migrated);
    
    // Mark that first load is complete
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
    }
  }, []);

  const resetJustSaved = useCallback(() => {
    // This will be handled by the save logic
  }, []);

  const formatLastSaved = useCallback(() => {
    return 'Just now'; // Simplified for now
  }, []);

  // Use comprehensive validation function
  const validateForm = useCallback((data: FormData = formData): { isValid: boolean; errors: string[] } => {
    console.log('Using comprehensive validation for form data');
    return validateFormComprehensive(data);
  }, [formData]);

  return {
    formData,
    setFormData: setFormDataWithMigration,
    isDirty,
    setIsDirty,
    activeSection,
    setActiveSection,
    validationErrors,
    setValidationErrors,
    retryCount,
    setRetryCount,
    handleInputChange,
    handleCheckboxChange,
    updateFormDataWithRegion,
    hasMeaningfulContent,
    resetJustSaved,
    formatLastSaved,
    validateForm
  };
};
