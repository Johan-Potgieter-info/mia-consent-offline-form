
// Supabase operations for form data

import { supabase } from '../integrations/supabase/client';
import { FormData } from '../types/formTypes';

/**
 * Map form data to database schema (camelCase to snake_case)
 */
const mapFormDataToDatabase = (formData: FormData, isDraft: boolean = false) => {
  const mapped: Record<string, unknown> = {
    // Remove the local id since Supabase will generate its own UUID
    patient_name: formData.patientName || '',
    id_number: formData.idNumber || '',
    marital_status: formData.maritalStatus || null,
    gender: formData.gender || '',
    employer_school: formData.employerSchool || null,
    occupation_grade: formData.occupationGrade || null,
    cell_phone: formData.cellPhone || '',
    email: formData.email || '',
    address: formData.address || '',
    postal_code: formData.postalCode || null,
    responsible_for_payment: formData.responsibleForPayment || '',
    account_holder_name: formData.accountHolderName || null,
    account_holder_age: formData.accountHolderAge || null,
    gp_name: formData.gpName || null,
    gp_contact: formData.gpContact || null,
    allergies: formData.allergies || '',
    medication: formData.medication || '',
    chronic_conditions: formData.chronicConditions || [],
    age: formData.age || null,
    birth_date: formData.birthDate || null,
    payment_preference: formData.paymentPreference || null,
    medical_aid_name: formData.medicalAidName || null,
    medical_aid_no: formData.medicalAidNo || null,
    medical_aid_plan: formData.medicalAidPlan || null,
    main_member: formData.mainMember || null,
    dependant_code: formData.dependantCode || null,
    emergency_name: formData.emergencyName || '',
    emergency_relationship: formData.emergencyRelationship || '',
    emergency_phone: formData.emergencyPhone || '',
    consent_agreement: formData.consentAgreement || false,
    signature: formData.signature || '',
    doctor: formData.doctor || null,
    practice_number: formData.practiceNumber || null,
    region_code: formData.regionCode || 'PTA',
    encrypted: false,
    status: isDraft ? 'draft' : 'completed',
  };

  return mapped;
};

/**
 * Map database data back to form data (snake_case to camelCase)
 */
const mapDatabaseToFormData = (dbData: Record<string, unknown>): FormData => {
  return {
    id: dbData.id as string | number, // Keep the UUID as string
    patientName: dbData.patient_name as string,
    idNumber: dbData.id_number as string,
    maritalStatus: dbData.marital_status as string,
    gender: dbData.gender as string,
    employerSchool: dbData.employer_school as string,
    occupationGrade: dbData.occupation_grade as string,
    cellPhone: dbData.cell_phone as string,
    email: dbData.email as string,
    address: dbData.address as string,
    postalCode: dbData.postal_code as string,
    responsibleForPayment: dbData.responsible_for_payment as string,
    accountHolderName: dbData.account_holder_name as string,
    accountHolderAge: dbData.account_holder_age as number,
    gpName: dbData.gp_name as string,
    gpContact: dbData.gp_contact as string,
    allergies: dbData.allergies as string,
    medication: dbData.medication as string,
    chronicConditions: (dbData.chronic_conditions as string[]) || [],
    age: dbData.age as number,
    birthDate: dbData.birth_date as string,
    paymentPreference: dbData.payment_preference as string,
    medicalAidName: dbData.medical_aid_name as string,
    medicalAidNo: dbData.medical_aid_no as string,
    medicalAidPlan: dbData.medical_aid_plan as string,
    mainMember: dbData.main_member as string,
    dependantCode: dbData.dependant_code as string,
    emergencyName: dbData.emergency_name as string,
    emergencyRelationship: dbData.emergency_relationship as string,
    emergencyPhone: dbData.emergency_phone as string,
    consentAgreement: dbData.consent_agreement as boolean,
    signature: dbData.signature as string,
    doctor: dbData.doctor as string,
    practiceNumber: dbData.practice_number as string,
    regionCode: dbData.region_code as string,
    region: dbData.region_code as string, // For backward compatibility
    timestamp: dbData.timestamp as string,
    lastModified: dbData.last_modified as string,
  };
};

/**
 * Save form data to Supabase
 * @param formData Form data to save
 * @param isDraft Whether this is a draft or completed form
 * @returns Promise with saved form data
 */
export const saveFormToSupabase = async (formData: FormData, isDraft: boolean = false): Promise<FormData> => {
  try {
    const tableName = isDraft ? 'form_drafts' : 'consent_forms';
    const timestamp = new Date().toISOString();
    
    const dataToSave = {
      ...mapFormDataToDatabase(formData, isDraft),
      timestamp,
      last_modified: timestamp,
    };

    const { data, error } = await supabase
      .from(tableName)
      .insert([dataToSave])
      .select()
      .single();

    if (error) {
      console.error(`Supabase ${tableName} save error:`, error);
      throw error;
    }

    console.log(`Form saved to Supabase ${tableName}:`, data.id);
    return mapDatabaseToFormData(data);
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
};

/**
 * Update existing form data in Supabase
 * @param id Form ID (UUID string)
 * @param formData Updated form data
 * @param isDraft Whether this is a draft or completed form
 * @returns Promise with updated form data
 */
export const updateFormInSupabase = async (id: string, formData: FormData, isDraft: boolean = false): Promise<FormData> => {
  try {
    const tableName = isDraft ? 'form_drafts' : 'consent_forms';
    const timestamp = new Date().toISOString();
    
    const dataToUpdate = {
      ...mapFormDataToDatabase(formData, isDraft),
      last_modified: timestamp,
    };

    const { data, error } = await supabase
      .from(tableName)
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Supabase ${tableName} update error:`, error);
      throw error;
    }

    console.log(`Form updated in Supabase ${tableName}:`, data.id);
    return mapDatabaseToFormData(data);
  } catch (error) {
    console.error('Error updating in Supabase:', error);
    throw error;
  }
};

/**
 * Get all forms from Supabase
 * @param isDraft Whether to get drafts or completed forms
 * @returns Promise with forms array
 */
export const getFormsFromSupabase = async (isDraft: boolean = false): Promise<FormData[]> => {
  try {
    const tableName = isDraft ? 'form_drafts' : 'consent_forms';
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('last_modified', { ascending: false });

    if (error) {
      console.error(`Supabase ${tableName} fetch error:`, error);
      throw error;
    }

    return (data || []).map(mapDatabaseToFormData);
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    throw error;
  }
};

/**
 * Delete form from Supabase
 * @param id Form ID (UUID string)
 * @param isDraft Whether this is a draft or completed form
 * @returns Promise that resolves when deleted
 */
export const deleteFormFromSupabase = async (id: string, isDraft: boolean = false): Promise<void> => {
  try {
    const tableName = isDraft ? 'form_drafts' : 'consent_forms';
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Supabase ${tableName} delete error:`, error);
      throw error;
    }

    console.log(`Form deleted from Supabase ${tableName}:`, id);
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    throw error;
  }
};

/**
 * Get forms by region from Supabase
 * @param regionCode Region code to filter by
 * @param isDraft Whether to get drafts or completed forms
 * @returns Promise with filtered forms
 */
export const getFormsByRegionFromSupabase = async (regionCode: string, isDraft: boolean = false): Promise<FormData[]> => {
  try {
    const tableName = isDraft ? 'form_drafts' : 'consent_forms';
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('region_code', regionCode)
      .order('last_modified', { ascending: false });

    if (error) {
      console.error(`Supabase ${tableName} fetch by region error:`, error);
      throw error;
    }

    return (data || []).map(mapDatabaseToFormData);
  } catch (error) {
    console.error('Error fetching by region from Supabase:', error);
    throw error;
  }
};

/**
 * Test Supabase connection
 * @returns Promise<boolean> True if connection is successful
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('consent_forms')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }

    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};
