import { FormData } from '../types/formTypes';
import { supabase } from '../integrations/supabase/client';
import { checkServerConnectivity } from './connectivity';

export const testSupabaseConnection = async (): Promise<boolean> => {
  // Avoid SELECTs due to RLS; use service availability check instead
  console.log('Testing Supabase connection via health/preflight checks...');
  const ok = await checkServerConnectivity();
  if (!ok) {
    console.error('Supabase connection test failed');
  } else {
    console.log('Supabase connection test successful');
  }
  return ok;
};

export const saveFormToSupabase = async (formData: FormData, isDraft: boolean): Promise<FormData> => {
  try {
    const table = isDraft ? 'form_drafts' : 'consent_forms';
    const { data, error } = await supabase
      .from(table)
      .insert([{
        patient_name: formData.patientName,
        age: formData.age ? parseInt(formData.age) : null,
        birth_date: formData.birthDate,
        id_number: formData.idNumber,
        marital_status: formData.maritalStatus,
        gender: formData.gender,
        employer_school: formData.employerSchool,
        occupation_grade: formData.occupationGrade,
        cell_phone: formData.cellPhone,
        whatsapp_number: formData.whatsappNumber,
        same_as_contact_number: formData.sameAsContactNumber || false,
        email: formData.email,
        address: formData.address,
        postal_code: formData.postalCode,
        responsible_for_payment: formData.responsibleForPayment || '',
        account_holder_name: formData.accountHolderName,
        account_holder_age: formData.accountHolderAge ? parseInt(formData.accountHolderAge) : null,
        emergency_name: formData.emergencyName || '',
        emergency_relationship: formData.emergencyRelationship || '',
        emergency_phone: formData.emergencyPhone || '',
        gp_name: formData.gpName,
        gp_contact: formData.gpContact,
        chronic_conditions: Array.isArray(formData.chronicConditions) ? formData.chronicConditions : [],
        allergies: formData.allergies || '',
        medication: formData.medication || '',
        payment_preference: formData.paymentPreference,
        medical_aid_name: formData.medicalAidName,
        medical_aid_no: formData.medicalAidNo,
        medical_aid_plan: formData.medicalAidPlan,
        main_member: formData.mainMember,
        dependant_code: formData.dependantCode,
        signature: formData.signature || '',
        region_code: formData.regionCode || '',
        doctor: formData.doctor,
        practice_number: formData.practiceNumber,
        consent_agreement: isDraft ? (formData.consentAgreement || false) : true,
        status: isDraft ? 'draft' : 'completed',
        encrypted: true,
        timestamp: new Date().toISOString(),
        last_modified: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving form to Supabase:', error);
      throw new Error(`Failed to save form: ${error.message}`);
    }

    return {
      ...formData,
      id: data.id,
      timestamp: data.timestamp,
      lastModified: data.last_modified
    };
  } catch (error) {
    console.error('Save form error:', error);
    throw error;
  }
};

export const updateFormInSupabase = async (id: string, formData: FormData, isDraft: boolean): Promise<FormData> => {
  try {
    const table = isDraft ? 'form_drafts' : 'consent_forms';
    const { data, error } = await supabase
      .from(table)
      .update({
        patient_name: formData.patientName,
        age: formData.age ? parseInt(formData.age) : null,
        birth_date: formData.birthDate,
        id_number: formData.idNumber,
        marital_status: formData.maritalStatus,
        gender: formData.gender,
        employer_school: formData.employerSchool,
        occupation_grade: formData.occupationGrade,
        cell_phone: formData.cellPhone,
        whatsapp_number: formData.whatsappNumber,
        same_as_contact_number: formData.sameAsContactNumber || false,
        email: formData.email,
        address: formData.address,
        postal_code: formData.postalCode,
        responsible_for_payment: formData.responsibleForPayment || '',
        account_holder_name: formData.accountHolderName,
        account_holder_age: formData.accountHolderAge ? parseInt(formData.accountHolderAge) : null,
        emergency_name: formData.emergencyName || '',
        emergency_relationship: formData.emergencyRelationship || '',
        emergency_phone: formData.emergencyPhone || '',
        gp_name: formData.gpName,
        gp_contact: formData.gpContact,
        chronic_conditions: Array.isArray(formData.chronicConditions) ? formData.chronicConditions : [],
        allergies: formData.allergies || '',
        medication: formData.medication || '',
        payment_preference: formData.paymentPreference,
        medical_aid_name: formData.medicalAidName,
        medical_aid_no: formData.medicalAidNo,
        medical_aid_plan: formData.medicalAidPlan,
        main_member: formData.mainMember,
        dependant_code: formData.dependantCode,
        signature: formData.signature || '',
        region_code: formData.regionCode || '',
        doctor: formData.doctor,
        practice_number: formData.practiceNumber,
        consent_agreement: isDraft ? (formData.consentAgreement || false) : true,
        status: isDraft ? 'draft' : 'completed',
        last_modified: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating form in Supabase:', error);
      throw new Error(`Failed to update form: ${error.message}`);
    }

    return {
      ...formData,
      id: data.id,
      timestamp: data.timestamp,
      lastModified: data.last_modified
    };
  } catch (error) {
    console.error('Update form error:', error);
    throw error;
  }
};

export const getFormsFromSupabase = async (isDraft: boolean): Promise<FormData[]> => {
  try {
    const table = isDraft ? 'form_drafts' : 'consent_forms';
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching forms from Supabase:', error);
      throw new Error(`Failed to fetch forms: ${error.message}`);
    }

    return (data || []).map(row => ({
      id: row.id,
      patientName: row.patient_name,
      age: row.age?.toString(),
      birthDate: row.birth_date,
      idNumber: row.id_number,
      maritalStatus: row.marital_status,
      gender: row.gender,
      employerSchool: row.employer_school,
      occupationGrade: row.occupation_grade,
      cellPhone: row.cell_phone,
      whatsappNumber: (row as any).whatsapp_number,
      sameAsContactNumber: (row as any).same_as_contact_number || false,
      email: row.email,
      address: row.address,
      postalCode: row.postal_code,
      responsibleForPayment: row.responsible_for_payment,
      accountHolderName: row.account_holder_name,
      accountHolderAge: row.account_holder_age?.toString(),
      emergencyName: row.emergency_name,
      emergencyRelationship: row.emergency_relationship,
      emergencyPhone: row.emergency_phone,
      gpName: row.gp_name,
      gpContact: row.gp_contact,
      chronicConditions: Array.isArray(row.chronic_conditions) 
        ? row.chronic_conditions.map(c => String(c)) 
        : row.chronic_conditions 
          ? [String(row.chronic_conditions)] 
          : [],
      allergies: row.allergies,
      medication: row.medication,
      paymentPreference: row.payment_preference,
      medicalAidName: row.medical_aid_name,
      medicalAidNo: row.medical_aid_no,
      medicalAidPlan: row.medical_aid_plan,
      mainMember: row.main_member,
      dependantCode: row.dependant_code,
      signature: row.signature,
      regionCode: row.region_code,
      doctor: row.doctor,
      practiceNumber: row.practice_number,
      consentAgreement: row.consent_agreement,
      status: row.status as 'draft' | 'completed',
      timestamp: row.timestamp,
      lastModified: row.last_modified,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error('Get forms error:', error);
    throw error;
  }
};

export const deleteFormFromSupabase = async (id: string, isDraft: boolean): Promise<void> => {
  try {
    const table = isDraft ? 'form_drafts' : 'consent_forms';
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting form from Supabase:', error);
      throw new Error(`Failed to delete form: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete form error:', error);
    throw error;
  }
};
