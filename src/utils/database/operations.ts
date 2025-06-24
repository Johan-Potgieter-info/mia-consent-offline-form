
// Core database operations with proper error handling

import { initDB } from './initialization';
import { encryptSensitiveFields, decryptSensitiveFields } from '../encryption';
import { FormData } from '../../types/formTypes';

/**
 * Save data to a specific store
 */
export const saveToIndexedDB = async (data: FormData, storeName: string): Promise<number> => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    console.log(`Saving to ${storeName}:`, data);
    
    // Add timestamp and encryption metadata
    const dataToSave = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      encrypted: true,
      ...encryptSensitiveFields(data)
    };
    
    const result = await store.add(dataToSave);
    console.log(`Successfully saved to ${storeName} with ID:`, result);
    return result as number;
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
    
    const allData = await store.getAll();
    console.log(`Retrieved ${allData.length} items from ${storeName}`);
    
    // Decrypt sensitive fields and ensure proper typing
    const decryptedData = allData.map(item => {
      const formData = item as any;
      return decryptSensitiveFields(formData) as FormData;
    });
    
    return decryptedData;
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
    
    await store.delete(id);
    console.log(`Successfully deleted ID ${id} from ${storeName}`);
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
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    const dataToUpdate = {
      ...data,
      id: typeof id === 'string' ? parseInt(id) : id,
      lastModified: new Date().toISOString(),
      encrypted: true,
      ...encryptSensitiveFields(data)
    };
    
    await store.put(dataToUpdate);
    console.log(`Successfully updated ID ${id} in ${storeName}`);
  } catch (error) {
    console.error(`Failed to update in ${storeName}:`, error);
    throw error;
  }
};
