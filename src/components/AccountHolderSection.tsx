
import React from 'react';
import { FormData } from '../types/formTypes';
import ValidatedInput from './ValidatedInput';

interface AccountHolderSectionProps {
  formData: FormData;
  onInputChange: (name: string, value: string) => void;
  onCheckboxChange?: (name: string, value: string, checked: boolean) => void;
  updateFormData?: (updates: Partial<FormData>) => void;
  validationErrors?: string[];
}

const AccountHolderSection = ({ 
  formData, 
  onInputChange, 
  updateFormData = () => {},
  validationErrors = []
}: AccountHolderSectionProps) => {
  
  const handleResponsibilityChange = (value: string) => {
    onInputChange('responsibleForPayment', value);
    // Clear account holder fields if "Myself" is selected
    if (value === 'Myself') {
      const clearFields = {
        accountHolderName: '',
        accountHolderAge: '',
        accountHolderIdNumber: '',
        accountHolderMaritalStatus: '',
        accountHolderGender: '',
        accountHolderOtherGenderText: '',
        accountHolderEmployer: '',
        accountHolderOccupation: '',
        accountHolderCellPhone: '',
        accountHolderEmail: '',
        sameAddress: '',
        accountHolderAddress: '',
        accountHolderPostalCode: ''
      };
      Object.entries(clearFields).forEach(([key, value]) => {
        onInputChange(key, value);
      });
    }
  };

  const handleGenderChange = (value: string) => {
    onInputChange('accountHolderGender', value);
    // Clear other gender text if not "Other"
    if (value !== 'Other') {
      onInputChange('accountHolderOtherGenderText', '');
    }
  };

  const handleSameAddressChange = (value: string) => {
    onInputChange('sameAddress', value);
    if (value === 'Yes') {
      // Copy patient address to account holder
      onInputChange('accountHolderAddress', formData.address || '');
      onInputChange('accountHolderPostalCode', formData.postalCode || '');
    } else if (value === 'No') {
      // Clear account holder address
      onInputChange('accountHolderAddress', '');
      onInputChange('accountHolderPostalCode', '');
    }
  };

  const showAccountHolderDetails = formData.responsibleForPayment === 'Parent/Main member/Someone else';

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold text-[#ef4805] border-b pb-2">2. Account Holder Details</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          13. Person Responsible for Account Payment *
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="responsibleForPayment"
              value="Parent/Main member/Someone else"
              checked={formData.responsibleForPayment === 'Parent/Main member/Someone else'}
              onChange={(e) => handleResponsibilityChange(e.target.value)}
              className="mr-2"
              required
            />
            <span className="text-sm">Parent/Main member/Someone else</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="responsibleForPayment"
              value="Myself"
              checked={formData.responsibleForPayment === 'Myself'}
              onChange={(e) => handleResponsibilityChange(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Myself</span>
          </label>
        </div>
      </div>

      {showAccountHolderDetails && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <ValidatedInput
              type="text"
              label="14. Name and Surname"
              value={formData.accountHolderName || ''}
              onChange={(value) => onInputChange('accountHolderName', value)}
              placeholder="Enter full name"
            />

            <ValidatedInput
              type="text"
              label="15. Age"
              value={formData.accountHolderAge || ''}
              onChange={(value) => onInputChange('accountHolderAge', value)}
              placeholder="Enter age"
            />

            <ValidatedInput
              type="text"
              label="16. ID No."
              value={formData.accountHolderIdNumber || ''}
              onChange={(value) => onInputChange('accountHolderIdNumber', value)}
              placeholder="Enter ID number"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                17. Marital Status
              </label>
              <div className="space-y-2">
                {['Single', 'Married', 'Divorced', 'Widowed'].map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="radio"
                      name="accountHolderMaritalStatus"
                      value={status}
                      checked={formData.accountHolderMaritalStatus === status}
                      onChange={(e) => onInputChange('accountHolderMaritalStatus', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                18. Gender
              </label>
              <div className="space-y-2">
                {['Male', 'Female', 'Prefer not to say', 'Other'].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      name="accountHolderGender"
                      value={gender}
                      checked={formData.accountHolderGender === gender}
                      onChange={(e) => handleGenderChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{gender}</span>
                  </label>
                ))}
              </div>
              {formData.accountHolderGender === 'Other' && (
                <ValidatedInput
                  type="text"
                  label=""
                  value={formData.accountHolderOtherGenderText || ''}
                  onChange={(value) => onInputChange('accountHolderOtherGenderText', value)}
                  placeholder="Please specify"
                  className="mt-2"
                />
              )}
            </div>

            <ValidatedInput
              type="text"
              label="19. Employer"
              value={formData.accountHolderEmployer || ''}
              onChange={(value) => onInputChange('accountHolderEmployer', value)}
              placeholder="Enter employer"
            />

            <ValidatedInput
              type="text"
              label="20. Occupation"
              value={formData.accountHolderOccupation || ''}
              onChange={(value) => onInputChange('accountHolderOccupation', value)}
              placeholder="Enter occupation"
            />

            <ValidatedInput
              type="tel"
              label="21. Cell Phone No."
              value={formData.accountHolderCellPhone || ''}
              onChange={(value) => onInputChange('accountHolderCellPhone', value)}
              placeholder="Enter cell phone number"
            />

            <ValidatedInput
              type="email"
              label="22. Email"
              value={formData.accountHolderEmail || ''}
              onChange={(value) => onInputChange('accountHolderEmail', value)}
              placeholder="Enter email address"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                23. Same Address as Patient?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sameAddress"
                    value="Yes"
                    checked={formData.sameAddress === 'Yes'}
                    onChange={(e) => handleSameAddressChange(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sameAddress"
                    value="No"
                    checked={formData.sameAddress === 'No'}
                    onChange={(e) => handleSameAddressChange(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            <div></div> {/* Empty div for grid spacing */}

            <div className="md:col-span-2">
              <ValidatedInput
                type="text"
                label="23. Address"
                value={formData.accountHolderAddress || ''}
                onChange={(value) => onInputChange('accountHolderAddress', value)}
                placeholder="Enter full address"
              />
            </div>

            <ValidatedInput
              type="text"
              label="24. Address Postal Code"
              value={formData.accountHolderPostalCode || ''}
              onChange={(value) => onInputChange('accountHolderPostalCode', value)}
              placeholder="Enter postal code"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountHolderSection;
