
import { FormData } from '../types/formTypes';

export const validateForm = (formData: FormData): { isValid: boolean; errors: string[] } => {
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
