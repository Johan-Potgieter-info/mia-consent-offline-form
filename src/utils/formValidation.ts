
import { FormData } from '../types/formTypes';

export const validateForm = (formData: FormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  console.log('Validating comprehensive form data:', {
    patientName: formData.patientName,
    age: formData.age,
    idNumber: formData.idNumber,
    cellPhone: formData.cellPhone,
    email: formData.email,
    address: formData.address,
    terms: formData.terms,
    consentFreeWill: formData.consentFreeWill,
    rates: formData.rates,
    paymentResponsibility: formData.paymentResponsibility,
    cancellationPolicy: formData.cancellationPolicy
  });

  // Patient Details - Required fields
  if (!formData.patientName?.trim()) {
    errors.push("Patient name is required");
  }
  
  if (!formData.age?.trim()) {
    errors.push("Age is required");
  }
  
  if (!formData.birthDate?.trim()) {
    errors.push("Birth date is required");
  }
  
  if (!formData.idNumber?.trim()) {
    errors.push("ID number is required");
  }
  
  if (!formData.gender?.trim()) {
    errors.push("Gender is required");
  }
  
  if (!formData.cellPhone?.trim()) {
    errors.push("Contact number is required");
  }
  
  if (!formData.whatsappNumber?.trim()) {
    errors.push("WhatsApp number is required");
  }
  
  if (!formData.email?.trim()) {
    errors.push("Personal email is required");
  }
  
  if (!formData.address?.trim()) {
    errors.push("Address is required");
  }

  // Account Holder - Required field
  if (!formData.responsibleForPayment?.trim()) {
    errors.push("Person responsible for payment is required");
  }

  // Payment - Medical Aid conditional validation
  if (formData.paymentPreference === 'Medical Aid') {
    if (!formData.medicalAidName?.trim()) {
      errors.push("Medical Aid name is required when Medical Aid is selected");
    }
    if (!formData.medicalAidNo?.trim()) {
      errors.push("Medical Aid number is required when Medical Aid is selected");
    }
    if (!formData.medicalAidPlan?.trim()) {
      errors.push("Medical Aid plan is required when Medical Aid is selected");
    }
    if (!formData.mainMember?.trim()) {
      errors.push("Main member is required when Medical Aid is selected");
    }
  }

  // Emergency Contact - Required fields
  if (!formData.emergencyName?.trim()) {
    errors.push("Emergency contact name is required");
  }
  
  if (!formData.emergencyRelationship?.trim()) {
    errors.push("Emergency contact relationship is required");
  }
  
  if (!formData.emergencyPhone?.trim()) {
    errors.push("Emergency WhatsApp number is required");
  }

  // Medical History - Required fields
  if (!formData.allergies?.trim()) {
    errors.push("Allergies field is required (enter 'Nil' if none)");
  }
  
  if (!formData.medication?.trim()) {
    errors.push("Medication field is required (enter 'Nil' if none)");
  }

  // Habits validation - at least one option must be selected
  const habitsValue = formData.habits;
  const hasHabits = habitsValue && (
    (typeof habitsValue === 'string' && habitsValue.trim() !== '') ||
    (Array.isArray(habitsValue) && habitsValue.length > 0)
  );
  if (!hasHabits) {
    errors.push("Please select at least one option for habits/substance abuse");
  }

  // Consent - All consent questions are required
  if (!formData.terms || formData.terms !== 'Agree') {
    errors.push("You must agree to the terms and conditions");
  }
  
  if (!formData.consentFreeWill || formData.consentFreeWill !== 'Agree') {
    errors.push("You must confirm that consent is given of your own free will");
  }
  
  if (!formData.rates || formData.rates !== 'Agree') {
    errors.push("You must acknowledge the practice's billing rates");
  }
  
  if (!formData.paymentResponsibility || formData.paymentResponsibility !== 'Agree') {
    errors.push("You must accept responsibility for payment");
  }
  
  if (!formData.cancellationPolicy || formData.cancellationPolicy !== 'Acknowledge cancellation policy') {
    errors.push("You must acknowledge the cancellation policy");
  }

  console.log('Comprehensive validation result:', { isValid: errors.length === 0, errors });

  return {
    isValid: errors.length === 0,
    errors
  };
};
