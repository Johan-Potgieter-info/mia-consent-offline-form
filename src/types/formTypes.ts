
export interface FormData {
  id?: string | number;
  patientName?: string;
  idNumber?: string;
  cellPhone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  medicalAidScheme?: string;
  medicalAidNumber?: string;
  accountHolderName?: string;
  accountHolderIdNumber?: string;
  relationshipToPatient?: string;
  paymentMethod?: string;
  allergies?: string;
  medications?: string;
  medicalConditions?: string;
  previousDentalWork?: string;
  consentAgreement?: boolean;
  timestamp?: string;
  regionCode?: string;
  status?: 'draft' | 'completed';
  region?: string;
  doctor?: string;
  practiceNumber?: string;
  lastModified?: string;
  autoSaved?: boolean;
  synced?: boolean;
  submissionId?: string;
}

export interface FormSubmissionResult {
  success: boolean;
  message: string;
}
