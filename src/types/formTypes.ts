
export interface FormData {
  id?: string | number;
  
  // Patient Details (Fields 1-12)
  patientName?: string; // 1
  age?: string; // 2
  birthDate?: string; // 3
  dateOfBirth?: string; // Alternative field name for backward compatibility
  idNumber?: string; // 4
  maritalStatus?: string; // 5
  gender?: string; // 6
  otherGenderText?: string; // 6 - other specification
  employerSchool?: string; // 7
  occupationGrade?: string; // 8
  cellPhone?: string; // 9 - Contact Number
  whatsappNumber?: string; // 9b - WhatsApp Number
  sameAsContactNumber?: boolean; // 9c - Checkbox for same as contact
  email?: string; // 10
  address?: string; // 11
  postalCode?: string; // 12
  
  // Account Holder Details (Fields 13-24)
  responsibleForPayment?: string; // 13
  accountHolderName?: string; // 14
  accountHolderAge?: string; // 15
  accountHolderIdNumber?: string; // 16
  accountHolderMaritalStatus?: string; // 17
  accountHolderGender?: string; // 18
  accountHolderOtherGenderText?: string; // 18 - other specification
  accountHolderEmployer?: string; // 19
  accountHolderOccupation?: string; // 20
  accountHolderCellPhone?: string; // 21
  accountHolderWhatsappNumber?: string; // 21b - Account Holder WhatsApp
  accountHolderEmail?: string; // 22
  sameAddress?: string; // 23
  accountHolderAddress?: string; // 23
  accountHolderPostalCode?: string; // 24
  
  // Payment and Emergency Contact (Fields 25-33)
  paymentPreference?: string; // 25
  medicalAidName?: string; // 26
  medicalAidNo?: string; // 27
  medicalAidPlan?: string; // 28
  mainMember?: string; // 29
  dependantCode?: string; // 30
  emergencyName?: string; // 31
  emergencyRelationship?: string; // 32
  emergencyPhone?: string; // 33 - Emergency WhatsApp Number
  
  // Medical History (Fields 34-43)
  gpName?: string; // 34
  gpContact?: string; // 35
  chronicConditions?: string[] | string; // 36 - array of selected conditions
  allergies?: string; // 37
  habits?: string[] | string; // 38 - array of selected habits
  otherHabitsText?: string; // 38 - other specification
  specialistCare?: string; // 39
  hospitalised?: string; // 40
  psychiatricHistory?: string; // 41
  medication?: string; // 42
  femalePatients?: string[] | string; // 43 - array of selected conditions
  
  // Consent (Fields 44-51)
  terms?: string; // 44
  consentFreeWill?: string; // 45
  rates?: string; // 46
  paymentResponsibility?: string; // 47
  mediaPermission?: string; // 48
  cancellationPolicy?: string; // 49
  musicPreference?: string; // 50
  signature?: string; // 51
  
  // Legacy fields for backward compatibility
  consentAgreement?: boolean;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  medicalAidScheme?: string;
  medicalAidNumber?: string;
  relationshipToPatient?: string;
  paymentMethod?: string;
  medications?: string;
  medicalConditions?: string;
  previousDentalWork?: string;
  
  // System fields
  timestamp?: string;
  regionCode?: string;
  status?: 'draft' | 'completed';
  submissionStatus?: 'draft' | 'pending' | 'submitted' | 'synced';
  region?: string;
  doctor?: string;
  practiceNumber?: string;
  lastModified?: string;
  createdAt?: string;
  synced?: boolean;
  submissionId?: string;
  formSchemaVersion?: number;
  submitting?: boolean;
  [key: string]: any;
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
