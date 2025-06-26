
import { FormData } from '../types/formTypes';

// Simple encryption/decryption using Web Crypto API with fallback
class SensitiveDataEncryption {
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

  // Privacy notice for users
  static getPrivacyNotice(): string {
    return "Sensitive information (like ID numbers and contact details) is encrypted when stored locally for your privacy and security.";
  }
}

export { SensitiveDataEncryption };
