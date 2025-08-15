// Enhanced encryption utilities with AES-256-GCM for sensitive medical data

// Generate a secure key from a password using PBKDF2
const generateKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

// Generate a secure random salt
const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
};

// Generate a secure random IV
const generateIV = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(12));
};

// Secure encryption using AES-256-GCM
export const secureEncrypt = async (text: string): Promise<string> => {
  try {
    if (!text || typeof text !== 'string') {
      return text;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Use a derived key from environment-specific secret
    const salt = generateSalt();
    const iv = generateIV();
    
    // In production, this should come from a secure environment variable
    const password = 'MiaFormsSecureKey2024!'; // TODO: Move to env variable
    const key = await generateKey(password, salt);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );
    
    // Combine salt + iv + encrypted data and encode as base64
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // Add secure prefix to identify encrypted data
    return 'sec:' + btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Secure encryption failed:', error);
    // Fallback to base64 for compatibility
    return 'fb:' + btoa(encodeURIComponent(text));
  }
};

// Secure decryption using AES-256-GCM
export const secureDecrypt = async (encryptedText: string): Promise<string> => {
  try {
    if (!encryptedText || typeof encryptedText !== 'string') {
      return encryptedText;
    }

    // Handle secure encryption
    if (encryptedText.startsWith('sec:')) {
      const base64Data = encryptedText.slice(4);
      const combined = new Uint8Array(
        atob(base64Data).split('').map(char => char.charCodeAt(0))
      );
      
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encrypted = combined.slice(28);
      
      const password = 'MiaFormsSecureKey2024!'; // TODO: Move to env variable
      const key = await generateKey(password, salt);
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    }
    
    // Handle fallback encryption
    if (encryptedText.startsWith('fb:')) {
      const base64Data = encryptedText.slice(3);
      return decodeURIComponent(atob(base64Data));
    }
    
    // Handle legacy base64 encryption (for backwards compatibility)
    if (encryptedText.startsWith('enc:')) {
      const base64Data = encryptedText.slice(4);
      return decodeURIComponent(atob(base64Data));
    }
    
    // Try legacy decryption without prefix
    try {
      return decodeURIComponent(atob(encryptedText));
    } catch {
      // Return as-is if not encrypted
      return encryptedText;
    }
  } catch (error) {
    console.error('Secure decryption failed:', error);
    return encryptedText; // Return original if decryption fails
  }
};

// Enhanced field encryption for form data
export const encryptSensitiveFields = async <T extends Record<string, unknown>>(data: T): Promise<T> => {
  const sensitiveFields = [
    'patientName', 'patient_name',
    'idNumber', 'id_number', 
    'contactNumber', 'cell_phone',
    'email', 
    'address',
    'emergencyName', 'emergency_name',
    'emergencyPhone', 'emergency_phone',
    'accountHolderName', 'account_holder_name'
  ];
  
  const processedData = { ...data };
  
  for (const field of sensitiveFields) {
    if (processedData[field] && typeof processedData[field] === 'string') {
      (processedData as any)[field] = await secureEncrypt(processedData[field] as string);
    }
  }
  
  return processedData;
};

// Enhanced field decryption for form data
export const decryptSensitiveFields = async <T extends Record<string, unknown>>(data: T): Promise<T> => {
  const sensitiveFields = [
    'patientName', 'patient_name',
    'idNumber', 'id_number',
    'contactNumber', 'cell_phone', 
    'email',
    'address',
    'emergencyName', 'emergency_name',
    'emergencyPhone', 'emergency_phone', 
    'accountHolderName', 'account_holder_name'
  ];
  
  const decryptedData = { ...data };
  
  for (const field of sensitiveFields) {
    if (decryptedData[field] && typeof decryptedData[field] === 'string') {
      (decryptedData as any)[field] = await secureDecrypt(decryptedData[field] as string);
    }
  }
  
  return decryptedData;
};

// Data integrity verification
export const verifyDataIntegrity = (data: any): boolean => {
  try {
    // Check for required fields
    const requiredFields = ['patient_name', 'id_number', 'email'];
    const hasRequiredFields = requiredFields.every(field => 
      data[field] && typeof data[field] === 'string' && data[field].trim().length > 0
    );
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];
    
    const dataString = JSON.stringify(data);
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(dataString)
    );
    
    return hasRequiredFields && !hasSuspiciousContent;
  } catch (error) {
    console.error('Data integrity check failed:', error);
    return false;
  }
};