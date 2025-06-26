
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

// New interfaces for Phase 3
export interface SubmissionEvent {
  id: string;
  event: 'submit.started' | 'submit.success' | 'submit.failed' | 'submit.queued' | 'validation.failed' | 'save.success' | 'save.failed';
  formId?: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  metadata?: {
    formVersion?: number;
    region?: string;
    retryCount?: number;
    errorCode?: string;
    validationErrors?: string[];
    [key: string]: any;
  };
}

export interface VersionMigration {
  fromVersion: number;
  toVersion: number;
  migrate: (data: FormData) => FormData;
  description: string;
}
