
import React from 'react';
import ValidatedInput from './ValidatedInput';
import { Region } from '../utils/regionSelection';

interface PaymentEmergencySectionProps {
  formData: any;
  onInputChange: (name: string, value: string) => void;
  onCheckboxChange?: (name: string, value: string, checked: boolean) => void;
  currentRegion?: Region;
}

const PaymentEmergencySection = ({ formData, onInputChange, currentRegion }: PaymentEmergencySectionProps) => {
  const handlePaymentPreferenceChange = (value: string) => {
    onInputChange('paymentPreference', value);
    // Clear medical aid fields if not "Medical Aid"
    if (value !== 'Medical Aid') {
      const clearFields = ['medicalAidName', 'medicalAidNo', 'medicalAidPlan', 'mainMember', 'dependantCode'];
      clearFields.forEach(field => onInputChange(field, ''));
    }
  };

  const showMedicalAidDetails = formData.paymentPreference === 'Medical Aid';
  const isNamibianRegion = currentRegion?.code === 'NAM';
  
  // Get payment options based on region
  const getPaymentOptions = () => {
    if (isNamibianRegion) {
      return [
        { value: 'EFT', label: 'EFT' },
        { value: 'Medical Aid', label: 'Medical Aid (NAMAF rates)' }
      ];
    }
    return [
      { value: 'Card/EFT/Snapcan', label: 'Card/EFT/Snapcan' },
      { value: 'Medical Aid', label: 'Medical Aid' }
    ];
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold text-[#ef4805] border-b pb-2">3. Payment and Emergency Contact</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          25. Payment Preference
        </label>
        <div className="space-y-2">
          {getPaymentOptions().map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="paymentPreference"
                value={option.value}
                checked={formData.paymentPreference === option.value}
                onChange={(e) => handlePaymentPreferenceChange(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        
        {isNamibianRegion && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> We only accept EFT payments and Medical Aid claims in line with NAMAF rates. 
              No on-site card payments are currently available in Namibia.
            </p>
          </div>
        )}
      </div>

      {showMedicalAidDetails && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          {isNamibianRegion && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                <strong>NAMAF Compliance:</strong> Medical aid claims will be processed in accordance with 
                Namibian Medical Aid Fund (NAMAF) approved rates and procedures.
              </p>
            </div>
          )}
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
          label="32. Relationship to Patient *"
          value={formData.emergencyRelationship || ''}
          onChange={(value) => onInputChange('emergencyRelationship', value)}
          placeholder="Enter relationship to patient (e.g., Mother, Father, Spouse, Friend)"
          required
        />

        <ValidatedInput
          type="tel"
          label="33. Emergency WhatsApp Number *"
          value={formData.emergencyPhone || ''}
          onChange={(value) => onInputChange('emergencyPhone', value)}
          placeholder="Enter WhatsApp number"
          required
        />
      </div>
    </div>
  );
};

export default PaymentEmergencySection;
