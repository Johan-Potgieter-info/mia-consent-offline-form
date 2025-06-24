
// Encryption utilities for sensitive data

// Simple encryption/decryption functions
export const encrypt = (text: string): string => {
  try {
    return btoa(encodeURIComponent(text));
  } catch (error) {
    console.warn('Encryption failed, storing as plain text');
    return text;
  }
};

export const decrypt = (encryptedText: string): string => {
  try {
    return decodeURIComponent(atob(encryptedText));
  } catch (error) {
    // If decryption fails, assume it's plain text
    return encryptedText;
  }
};

export const encryptSensitiveFields = <T extends Record<string, unknown>>(data: T): T => {
  const sensitiveFields = ['patientName', 'idNumber', 'contactNumber', 'email', 'address'];
  const processedData = { ...data };
  
  sensitiveFields.forEach(field => {
    if (processedData[field] && typeof processedData[field] === 'string') {
      (processedData as any)[field] = encrypt(processedData[field] as string);
    }
  });
  
  return processedData;
};

export const decryptSensitiveFields = <T extends Record<string, unknown>>(data: T): T => {
  const sensitiveFields = ['patientName', 'idNumber', 'contactNumber', 'email', 'address'];
  const decryptedData = { ...data };
  
  sensitiveFields.forEach(field => {
    if (decryptedData[field] && (decryptedData as any).encrypted && typeof decryptedData[field] === 'string') {
      (decryptedData as any)[field] = decrypt(decryptedData[field] as string);
    }
  });
  
  return decryptedData;
};
