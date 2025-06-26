
import { useState, useCallback } from 'react';
import { FormData } from '../types/formTypes';

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
  const [activeSection, setActiveSection] = useState("patient");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [field]: value,
      lastModified: new Date().toISOString(),
      formSchemaVersion: 1
    }));
    setIsDirty(true);
  };

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    setFormData((prev) => ({ 
      ...prev, 
      [field]: checked,
      lastModified: new Date().toISOString(),
      formSchemaVersion: 1
    }));
    setIsDirty(true);
  };

  const updateFormDataWithRegion = useCallback((currentRegion: any) => {
    setFormData((prev) => ({
      ...prev,
      regionCode: currentRegion?.code || prev.regionCode,
      region: currentRegion?.name || prev.region,
      doctor: currentRegion?.doctor || prev.doctor,
      practiceNumber: currentRegion?.practiceNumber || prev.practiceNumber,
      lastModified: new Date().toISOString(),
      formSchemaVersion: 1
    }));
  }, []);

  const resetJustSaved = useCallback(() => {
    // This will be handled by the save logic
  }, []);

  const formatLastSaved = useCallback(() => {
    return 'Just now'; // Simplified for now
  }, []);

  return {
    formData,
    setFormData,
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
    formatLastSaved
  };
};
