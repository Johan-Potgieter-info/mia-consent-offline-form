
import React from 'react';
import ValidatedInput from './ValidatedInput';

interface PaymentEmergencySectionProps {
  formData: any;
  onInputChange: (name: string, value: string) => void;
  onCheckboxChange?: (name: string, value: string, checked: boolean) => void;
}

const PaymentEmergencySection = ({ formData, onInputChange }: PaymentEmergencySectionProps) => {
  const handlePaymentPreferenceChange = (value: string) => {
    onInputChange('paymentPreference', value);
    // Clear medical aid fields if not "Medical Aid"
    if (value !== 'Medical Aid') {
      const clearFields = ['medicalAidName', 'medicalAidNo', 'medicalAidPlan', 'mainMember', 'dependantCode'];
      clearFields.forEach(field => onInputChange(field, ''));
    }
  };

  const showMedicalAidDetails = formData.paymentPreference === 'Medical Aid';

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold text-[#ef4805] border-b pb-2">3. Payment and Emergency Contact</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          25. Payment Preference
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentPreference"
              value="Card/EFT/Snapcan"
              checked={formData.paymentPreference === 'Card/EFT/Snapcan'}
              onChange={(e) => handlePaymentPreferenceChange(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Card/EFT/Snapcan</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentPreference"
              value="Medical Aid"
              checked={formData.paymentPreference === 'Medical Aid'}
              onChange={(e) => handlePaymentPreferenceChange(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Medical Aid</span>
          </label>
        </div>
      </div>

      {showMedicalAidDetails && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <ValidatedInput
              type="text"
              label="26. Medical Aid Name *"
              value={formData.medicalAidName || ''}
              onChange={(value) => onInputChange('medicalAidName', value)}
              placeholder="Enter medical aid name"
              required
            />

            <ValidatedInput
              type="text"
              label="27. Medical Aid No. *"
              value={formData.medicalAidNo || ''}
              onChange={(value) => onInputChange('medicalAidNo', value)}
              placeholder="Enter medical aid number"
              required
            />

            <ValidatedInput
              type="text"
              label="28. Plan *"
              value={formData.medicalAidPlan || ''}
              onChange={(value) => onInputChange('medicalAidPlan', value)}
              placeholder="Enter plan name"
              required
            />

            <ValidatedInput
              type="text"
              label="29. Main Member *"
              value={formData.mainMember || ''}
              onChange={(value) => onInputChange('mainMember', value)}
              placeholder="Enter main member name"
              required
            />

            <ValidatedInput
              type="text"
              label="30. Dependant Code (if applicable)"
              value={formData.dependantCode || ''}
              onChange={(value) => onInputChange('dependantCode', value)}
              placeholder="Enter dependant code"
            />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <ValidatedInput
          type="text"
          label="31. Emergency Contact Name and Surname *"
          value={formData.emergencyName || ''}
          onChange={(value) => onInputChange('emergencyName', value)}
          placeholder="Enter emergency contact name"
          required
        />

        <ValidatedInput
          type="text"
          label="32. Relationship *"
          value={formData.emergencyRelationship || ''}
          onChange={(value) => onInputChange('emergencyRelationship', value)}
          placeholder="Enter relationship"
          required
        />

        <ValidatedInput
          type="tel"
          label="33. Cell Phone Number *"
          value={formData.emergencyPhone || ''}
          onChange={(value) => onInputChange('emergencyPhone', value)}
          placeholder="Enter cell phone number"
          required
        />
      </div>
    </div>
  );
};

export default PaymentEmergencySection;
