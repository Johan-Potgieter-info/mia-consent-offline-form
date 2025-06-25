
// Placeholder Supabase operations
import { FormData } from '../types/formTypes';

export const testSupabaseConnection = async (): Promise<boolean> => {
  // Always return false since no Supabase is configured
  return false;
};

export const saveFormToSupabase = async (formData: FormData, isDraft: boolean): Promise<FormData> => {
  throw new Error('Supabase not configured');
};

export const updateFormInSupabase = async (id: string, formData: FormData, isDraft: boolean): Promise<FormData> => {
  throw new Error('Supabase not configured');
};

export const getFormsFromSupabase = async (isDraft: boolean): Promise<FormData[]> => {
  throw new Error('Supabase not configured');
};

export const deleteFormFromSupabase = async (id: string, isDraft: boolean): Promise<void> => {
  throw new Error('Supabase not configured');
};
