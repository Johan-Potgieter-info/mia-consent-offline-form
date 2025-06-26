
export interface FormData {
  id?: string | number;
  patientName?: string;
  idNumber?: string;
  cellPhone?: string;
  email?: string;
  dateOfBirth?: string;
  birthDate?: string; // Alternative field name used in PatientDetailsSection
  gender?: string;
  maritalStatus?: string;
  employerSchool?: string; // Missing field
  occupationGrade?: string; // Missing field
  address?: string; // Missing field
  postalCode?: string; // Missing field
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
  status?: 'draft' | 'completed'; // Keep for backward compatibility
  submissionStatus?: 'draft' | 'pending' | 'submitted' | 'synced'; // New status tracking
  region?: string;
  doctor?: string;
  practiceNumber?: string;
  lastModified?: string;
  createdAt?: string; // New field for stale cleanup
  synced?: boolean;
  submissionId?: string;
  formSchemaVersion?: number; // New field for version tracking
  submitting?: boolean; // New field for double-submit prevention
  [key: string]: any; // Index signature for database operations
}

export interface FormSubmissionResult {
  success: boolean;
  message: string;
}
