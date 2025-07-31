
import { FormData } from '../types/formTypes';
import { Region } from './regionSelection';
import { migrateFormData, CURRENT_FORM_VERSION } from './formVersioning';
import { SensitiveDataEncryption } from './sensitiveDataEncryption';

export interface PreparedFormData extends FormData {
  timestamp: string;
  createdAt: string;
  synced: boolean;
  submissionId: string;
  submissionStatus: 'submitted' | 'pending';
  status: 'completed';
  formSchemaVersion: number;
}

export const prepareFormData = (
  formData: FormData, 
  currentRegion: Region | null, 
  actuallyOnline: boolean
): { preparedData: PreparedFormData; warnings: string[] } => {
  // Handle form versioning
  const { migrated: migratedData, warnings } = migrateFormData(formData);
  
  // Prepare final data with encryption for sensitive fields
  const encryptedData = SensitiveDataEncryption.encryptSensitiveFields(migratedData);
  
  const finalData: PreparedFormData = { 
    ...encryptedData, 
    timestamp: new Date().toISOString(),
    createdAt: encryptedData.createdAt || new Date().toISOString(), 
    synced: actuallyOnline, // Use actual connectivity instead of capabilities.supabase
    submissionId: `${encryptedData.regionCode || currentRegion?.code || 'UNK'}-${Date.now()}`,
    submissionStatus: (actuallyOnline ? 'submitted' : 'pending') as 'submitted' | 'pending',
    status: 'completed' as const,
    formSchemaVersion: CURRENT_FORM_VERSION
  };

  return { preparedData: finalData, warnings };
};
