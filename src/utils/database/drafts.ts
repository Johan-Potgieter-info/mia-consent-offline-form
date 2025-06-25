
import { initDB } from './initialization';
import { DRAFTS_STORE } from './config';
import { FormData } from '../../types/formTypes';

export const saveDraftData = async (formData: FormData): Promise<number> => {
  const db = await initDB();
  const transaction = db.transaction([DRAFTS_STORE], 'readwrite');
  const store = transaction.objectStore(DRAFTS_STORE);
  
  const result = await new Promise<number>((resolve, reject) => {
    const request = store.add(formData);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
  
  return result;
};

export const getAllDrafts = async (): Promise<FormData[]> => {
  const db = await initDB();
  const transaction = db.transaction([DRAFTS_STORE], 'readonly');
  const store = transaction.objectStore(DRAFTS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteDraft = async (id: number): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([DRAFTS_STORE], 'readwrite');
  const store = transaction.objectStore(DRAFTS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const updateDraftById = async (id: string | number, formData: FormData): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([DRAFTS_STORE], 'readwrite');
  const store = transaction.objectStore(DRAFTS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.put({ ...formData, id });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
