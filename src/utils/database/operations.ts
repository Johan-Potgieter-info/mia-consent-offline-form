
// Core database operations with proper error handling

import { initDB } from './initialization';
import { encryptSensitiveFields as legacyEncrypt, decryptSensitiveFields as legacyDecrypt } from '../encryption';
import { encryptSensitiveFields, decryptSensitiveFields, verifyDataIntegrity } from '../secureEncryption';
import { sanitizeFormData } from '../inputSecurity';
import { FormData } from '../../types/formTypes';

/**
 * Save data to a specific store
 */
export const saveToIndexedDB = async (data: FormData, storeName: string): Promise<number> => {
  try {
    // Security: Sanitize input data
    const sanitizedData = sanitizeFormData(data);
    
    // Security: Verify data integrity
    if (!verifyDataIntegrity(sanitizedData)) {
      throw new Error('Data integrity check failed');
    }

    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    console.log(`Saving to ${storeName}:`, { id: sanitizedData.id, timestamp: sanitizedData.timestamp });
    
    // Add timestamp and encryption metadata with secure encryption
    const dataToSave = {
      ...sanitizedData,
      timestamp: sanitizedData.timestamp || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      encrypted: true,
      secureEncryption: true,
      ...(await encryptSensitiveFields(sanitizedData))
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(dataToSave);
      request.onsuccess = () => {
        console.log(`Successfully saved to ${storeName} with ID:`, request.result);
        resolve(request.result as number);
      };
      request.onerror = () => {
        console.error(`Failed to save to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to save to ${storeName}:`, error);
    throw error;
  }
};

/**
 * Get all data from a specific store
 */
export const getAllFromIndexedDB = async (storeName: string): Promise<FormData[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = async () => {
        const allData = request.result;
        console.log(`Retrieved ${allData.length} items from ${storeName}`);
        
        // Decrypt sensitive fields and ensure proper typing
        const decryptedData = await Promise.all(allData.map(async item => {
          const formData = item as any;
          
          // Use secure decryption for new data, fallback to legacy for old data
          if (formData.secureEncryption) {
            return await decryptSensitiveFields(formData) as FormData;
          } else {
            return legacyDecrypt(formData) as FormData;
          }
        }));
        
        resolve(decryptedData);
      };
      request.onerror = () => {
        console.error(`Failed to get all from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to get all from ${storeName}:`, error);
    return [];
  }
};

/**
 * Delete data from a specific store
 */
export const deleteFromIndexedDB = async (id: number, storeName: string): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        console.log(`Successfully deleted ID ${id} from ${storeName}`);
        resolve();
      };
      request.onerror = () => {
        console.error(`Failed to delete from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to delete from ${storeName}:`, error);
    throw error;
  }
};

/**
 * Update data in a specific store
 */
export const updateInIndexedDB = async (id: number | string, data: FormData, storeName: string): Promise<void> => {
  try {
    // Security: Sanitize input data
    const sanitizedData = sanitizeFormData(data);
    
    // Security: Verify data integrity
    if (!verifyDataIntegrity(sanitizedData)) {
      throw new Error('Data integrity check failed');
    }

    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    const dataToUpdate = {
      ...sanitizedData,
      id: typeof id === 'string' ? parseInt(id) : id,
      lastModified: new Date().toISOString(),
      encrypted: true,
      secureEncryption: true,
      ...(await encryptSensitiveFields(sanitizedData))
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(dataToUpdate);
      request.onsuccess = () => {
        console.log(`Successfully updated ID ${id} in ${storeName}`);
        resolve();
      };
      request.onerror = () => {
        console.error(`Failed to update in ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to update in ${storeName}:`, error);
    throw error;
  }
};
