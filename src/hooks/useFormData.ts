
import { useState, useCallback } from 'react';
import { FormData } from '../types/formTypes';

const initialFormData: FormData = {
  // Generate a consistent ID at form initialization
  id: Date.now(),
  patientName: '',
  idNumber: '',
  cellPhone: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  medicalAidScheme: '',
  medicalAidNumber: '',
  accountHolderName: '',
  accountHolderIdNumber: '',
  relationshipToPatient: '',
  paymentMethod: '',
  allergies: '',
  medications: '',
  medicalConditions: '',
  previousDentalWork: '',
  consentAgreement: false,
  timestamp: new Date().toISOString(),
  regionCode: '',
  status: 'draft'
};

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isDirty, setIsDirty] = useState(false);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => {
      // Check if the value actually changed to avoid unnecessary updates
      if (prev[field] === value) {
        return prev;
      }
      
      return {
        ...prev,
        [field]: value,
        // Preserve the original ID throughout the form lifecycle
        id: prev.id || Date.now(),
        // Only update lastModified for significant changes, throttled
        lastModified: new Date().toISOString()
      };
    });
    
    // Throttle isDirty updates to prevent excessive re-renders
    setTimeout(() => setIsDirty(true), 0);
  }, []);

  const handleCheckboxChange = useCallback((field: keyof FormData, value: string, checked: boolean) => {
    setFormData(prev => {
      // Check if the value actually changed to avoid unnecessary updates
      if (prev[field] === checked) {
        return prev;
      }
      
      return {
        ...prev,
        [field]: checked,
        // Preserve the original ID throughout the form lifecycle
        id: prev.id || Date.now(),
        lastModified: new Date().toISOString()
      };
    });
    
    // Throttle isDirty updates to prevent excessive re-renders
    setTimeout(() => setIsDirty(true), 0);
  }, []);

  return {
    formData,
    setFormData: useCallback((data: FormData) => {
      // When setting form data (like from a draft), preserve or generate ID
      setFormData({
        ...data,
        id: data.id || Date.now(),
        // Don't update lastModified when loading existing data
        lastModified: data.lastModified || new Date().toISOString()
      });
      setIsDirty(false);
    }, []),
    handleInputChange,
    handleCheckboxChange,
    isDirty,
    setIsDirty
  };
};
