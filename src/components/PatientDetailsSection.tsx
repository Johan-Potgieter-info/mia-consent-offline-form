
import React from 'react';
import { FormData } from '../types/formTypes';
import ValidatedInput from './ValidatedInput';

interface PatientDetailsSectionProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  validationErrors: string[];
  onInputChange: (field: keyof FormData, value: string) => void;
  onCheckboxChange: (field: keyof FormData, value: string, checked: boolean) => void;
}

const PatientDetailsSection = ({ 
  formData, 
  updateFormData, 
  validationErrors,
  onInputChange 
}: PatientDetailsSectionProps) => {
  const hasError = (field: string) => {
    return validationErrors.some(error => error.toLowerCase().includes(field.toLowerCase()));
  };

  const handleGenderChange = (value: string) => {
    updateFormData({ gender: value });
    // Clear other gender text if not "Other"
    if (value !== 'Other') {
      updateFormData({ otherGenderText: '' });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold text-[#ef4805] border-b pb-2">1. Patient Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedInput
          type="text"
          label="1. Patient Name *"
          value={formData.patientName || ''}
          onChange={(value) => updateFormData({ patientName: value })}
          placeholder="Enter full name"
          required
          hasError={hasError('patient name')}
        />

        <ValidatedInput
          type="text"
          label="2. Age *"
          value={formData.age || ''}
          onChange={(value) => updateFormData({ age: value })}
          placeholder="Enter age"
          required
          hasError={hasError('age')}
        />

        <ValidatedInput
          type="date"
          label="3. Birth Date *"
          value={formData.birthDate || ''}
          onChange={(value) => updateFormData({ birthDate: value })}
          required
          hasError={hasError('birth date')}
        />

        <ValidatedInput
          type="text"
          label="4. ID No. *"
          value={formData.idNumber || ''}
          onChange={(value) => updateFormData({ idNumber: value })}
          placeholder="Enter ID number"
          required
          hasError={hasError('id number')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            5. Marital Status
          </label>
          <div className="space-y-2">
            {['Single', 'Married', 'Divorced', 'Widowed'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="radio"
                  name="maritalStatus"
                  value={status}
                  checked={formData.maritalStatus === status}
                  onChange={(e) => updateFormData({ maritalStatus: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm">{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            6. Gender *
          </label>
          <div className="space-y-2">
            {['Male', 'Female', 'Prefer not to say', 'Other'].map((gender) => (
              <label key={gender} className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={formData.gender === gender}
                  onChange={(e) => handleGenderChange(e.target.value)}
                  className="mr-2"
                  required
                />
                <span className="text-sm">{gender}</span>
              </label>
            ))}
          </div>
          {formData.gender === 'Other' && (
            <ValidatedInput
              type="text"
              label=""
              value={formData.otherGenderText || ''}
              onChange={(value) => updateFormData({ otherGenderText: value })}
              placeholder="Please specify"
              className="mt-2"
            />
          )}
          {hasError('gender') && (
            <p className="text-red-500 text-xs mt-1">This field is required.</p>
          )}
        </div>

        <ValidatedInput
          type="text"
          label="7. Employer/School"
          value={formData.employerSchool || ''}
          onChange={(value) => updateFormData({ employerSchool: value })}
          placeholder="Enter employer or school name"
        />

        <ValidatedInput
          type="text"
          label="8. Occupation/Grade"
          value={formData.occupationGrade || ''}
          onChange={(value) => updateFormData({ occupationGrade: value })}
          placeholder="Enter occupation or grade"
        />

        <ValidatedInput
          type="tel"
          label="9. Cell Phone No. *"
          value={formData.cellPhone || ''}
          onChange={(value) => updateFormData({ cellPhone: value })}
          placeholder="Enter cell phone number"
          required
          hasError={hasError('cell phone')}
        />

        <ValidatedInput
          type="email"
          label="10. Email *"
          value={formData.email || ''}
          onChange={(value) => updateFormData({ email: value })}
          placeholder="Enter email address"
          required
          hasError={hasError('email')}
        />

        <div className="md:col-span-2">
          <ValidatedInput
            type="text"
            label="11. Address *"
            value={formData.address || ''}
            onChange={(value) => updateFormData({ address: value })}
            placeholder="Enter full address"
            required
            hasError={hasError('address')}
          />
        </div>

        <ValidatedInput
          type="text"
          label="12. Address Postal Code"
          value={formData.postalCode || ''}
          onChange={(value) => updateFormData({ postalCode: value })}
          placeholder="Enter postal code"
        />
      </div>
    </div>
  );
};

export default PatientDetailsSection;
