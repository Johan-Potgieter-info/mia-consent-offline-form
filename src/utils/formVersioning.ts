
import { FormData, VersionMigration } from '../types/formTypes';

export const CURRENT_FORM_VERSION = 2;

// Migration definitions
const migrations: VersionMigration[] = [
  {
    fromVersion: 1,
    toVersion: 2,
    description: 'Added enhanced tracking fields and normalized field names',
    migrate: (data: FormData): FormData => {
      return {
        ...data,
        // Normalize date field
        birthDate: data.birthDate || data.dateOfBirth,
        // Ensure new tracking fields exist
        createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
        lastModified: data.lastModified || new Date().toISOString(),
        formSchemaVersion: 2,
        // Normalize submission status
        submissionStatus: data.submissionStatus || (data.status === 'completed' ? 'submitted' : 'draft')
      };
    }
  }
];

export const migrateFormData = (data: FormData): { migrated: FormData; warnings: string[] } => {
  const warnings: string[] = [];
  let currentData = { ...data };
  
  const currentVersion = currentData.formSchemaVersion || 1;
  
  if (currentVersion === CURRENT_FORM_VERSION) {
    return { migrated: currentData, warnings };
  }
  
  if (currentVersion > CURRENT_FORM_VERSION) {
    warnings.push(`Form was created with a newer version (${currentVersion}). Some features may not work correctly.`);
    return { migrated: currentData, warnings };
  }
  
  // Apply migrations sequentially
  for (const migration of migrations) {
    if (currentData.formSchemaVersion === migration.fromVersion) {
      console.log(`Migrating form from v${migration.fromVersion} to v${migration.toVersion}: ${migration.description}`);
      currentData = migration.migrate(currentData);
      warnings.push(`Form updated from version ${migration.fromVersion} to ${migration.toVersion}: ${migration.description}`);
    }
  }
  
  return { migrated: currentData, warnings };
};

export const isFormVersionSupported = (version: number): boolean => {
  return version <= CURRENT_FORM_VERSION;
};

export const shouldShowVersionWarning = (version: number): boolean => {
  return version !== CURRENT_FORM_VERSION;
};

export const getVersionWarningMessage = (version: number): string => {
  if (version > CURRENT_FORM_VERSION) {
    return `This form was created with a newer version (v${version}). Please update the app or some features may not work correctly.`;
  }
  if (version < CURRENT_FORM_VERSION) {
    return `This form was created with an older version (v${version}). It will be automatically updated when you save.`;
  }
  return '';
};
