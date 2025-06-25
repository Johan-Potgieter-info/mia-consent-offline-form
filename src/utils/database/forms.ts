
import { initDB } from './initialization';
import { FORMS_STORE } from './config';
import { FormData } from '../../types/formTypes';

export const saveFormData = async (formData: FormData): Promise<number> => {
  const db = await initDB();
  const transaction = db.transaction([FORMS_STORE], 'readwrite');
  const store = transaction.objectStore(FORMS_STORE);
  
  const result = await new Promise<number>((resolve, reject) => {
    const request = store.add(formData);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
  
  return result;
};

export const getAllForms = async (): Promise<FormData[]> => {
  const db = await initDB();
  const transaction = db.transaction([FORMS_STORE], 'readonly');
  const store = transaction.objectStore(FORMS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
