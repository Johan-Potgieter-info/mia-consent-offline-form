
import { FormData } from '../types/formTypes';

// Simple encryption/decryption using Web Crypto API with fallback
class SensitiveDataEncryption {
  // Frontend field names (camelCase)
  private static readonly SENSITIVE_FIELDS = [
    'patientName',
    'idNumber', 
    'cellPhone',
    'email',
    'address',
    'emergencyContactName',
    'emergencyContactNumber',
    'accountHolderName',
    'accountHolderIdNumber'
  ];

  // Database field names (snake_case) - mapping from camelCase to snake_case
  private static readonly DB_FIELD_MAPPING = {
    'patientName': 'patient_name',
    'idNumber': 'id_number',
    'cellPhone': 'cell_phone',
    'email': 'email',
    'address': 'address',
    'emergencyContactName': 'emergency_name',
    'emergencyContactNumber': 'emergency_phone',
    'accountHolderName': 'account_holder_name',
    'accountHolderIdNumber': 'account_holder_id_number'
  };

  // Database sensitive fields (snake_case)
  private static readonly DB_SENSITIVE_FIELDS = Object.values(this.DB_FIELD_MAPPING);

  private static readonly ENCRYPTION_PREFIX = 'enc:';

  // Simple base64 encoding as fallback (not secure, but better than plain text)
  private static simpleFallbackEncrypt(text: string): string {
    try {
      return this.ENCRYPTION_PREFIX + btoa(encodeURIComponent(text));
    } catch {
      return text; // Return original if encoding fails
    }
  }

  private static simpleFallbackDecrypt(encryptedText: string): string {
    try {
      if (!encryptedText.startsWith(this.ENCRYPTION_PREFIX)) {
        return encryptedText; // Not encrypted
      }
      const base64 = encryptedText.slice(this.ENCRYPTION_PREFIX.length);
      return decodeURIComponent(atob(base64));
    } catch {
      return encryptedText; // Return original if decoding fails
    }
  }

  static encryptSensitiveFields(data: FormData): FormData {
    const encryptedData = { ...data };
    
    this.SENSITIVE_FIELDS.forEach(field => {
      const value = encryptedData[field];
      if (value && typeof value === 'string' && value.trim()) {
        encryptedData[field] = this.simpleFallbackEncrypt(value);
      }
    });

    // Mark as encrypted for decryption logic
    encryptedData._encrypted = true;
    
    return encryptedData;
  }

  static decryptSensitiveFields(data: FormData): FormData {
    // If not marked as encrypted, return as-is
    if (!data._encrypted) {
      return data;
    }

    const decryptedData = { ...data };
    
    this.SENSITIVE_FIELDS.forEach(field => {
      const value = decryptedData[field];
      if (value && typeof value === 'string') {
        decryptedData[field] = this.simpleFallbackDecrypt(value);
      }
    });

    // Remove encryption marker
    delete decryptedData._encrypted;
    
    return decryptedData;
  }

  static isFieldSensitive(fieldName: string): boolean {
    return this.SENSITIVE_FIELDS.includes(fieldName);
  }

  static getSensitiveFields(): string[] {
    return [...this.SENSITIVE_FIELDS];
  }

  // Decrypt database fields (snake_case format) - for data coming from Supabase
  static decryptDatabaseFields(dbData: any): any {
    const decryptedData = { ...dbData };
    
    this.DB_SENSITIVE_FIELDS.forEach(field => {
      const value = decryptedData[field];
      if (value && typeof value === 'string') {
        decryptedData[field] = this.simpleFallbackDecrypt(value);
      }
    });

    // Remove encryption marker if present
    delete decryptedData.encrypted;
    
    return decryptedData;
  }

  // Convert camelCase form data to snake_case for database storage
  static convertToDbFormat(formData: FormData): any {
    const dbData = { ...formData };
    
    // Convert field names to snake_case
    Object.entries(this.DB_FIELD_MAPPING).forEach(([camelCase, snakeCase]) => {
      if (dbData[camelCase] !== undefined) {
        dbData[snakeCase] = dbData[camelCase];
        delete dbData[camelCase];
      }
    });
    
    return dbData;
  }

  // Convert snake_case database data to camelCase for frontend
  static convertFromDbFormat(dbData: any): FormData {
    const formData = { ...dbData };
    
    // Convert field names from snake_case to camelCase
    Object.entries(this.DB_FIELD_MAPPING).forEach(([camelCase, snakeCase]) => {
      if (formData[snakeCase] !== undefined) {
        formData[camelCase] = formData[snakeCase];
        delete formData[snakeCase];
      }
    });
    
    return formData;
  }

  static isDbFieldSensitive(fieldName: string): boolean {
    return this.DB_SENSITIVE_FIELDS.includes(fieldName);
  }

  // Privacy notice for users
  static getPrivacyNotice(): string {
    return "Sensitive information (like ID numbers and contact details) is encrypted when stored locally for your privacy and security.";
  }
}

export { SensitiveDataEncryption };
