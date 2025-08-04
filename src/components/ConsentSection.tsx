
import React, { useEffect, useState, useRef } from "react";
import { FormData } from "../types/formTypes";
import ValidatedInput from "./ValidatedInput";
import { Region } from "../utils/regionSelection";

interface ConsentSectionProps {
  formData?: FormData;
  onInputChange?: (field: keyof FormData, value: string) => void;
  onCheckboxChange?: (field: keyof FormData, value: string, checked: boolean) => void;
  updateFormData?: (updates: Partial<FormData>) => void;
  validationErrors?: string[];
  currentRegion?: Region | null;
}

const ConsentSection: React.FC<ConsentSectionProps> = ({
  formData,
  onInputChange,
  updateFormData = () => {},
  validationErrors,
  currentRegion
}) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = termsRef.current;
    if (!node) return;

    const checkScroll = () => {
      if (node.scrollTop + node.clientHeight >= node.scrollHeight - 5) {
        setIsScrolledToBottom(true);
      }
    };

    node.addEventListener("scroll", checkScroll);

    // auto-enable if scroll not needed
    setTimeout(() => {
      if (node.scrollHeight <= node.clientHeight + 5) {
        setIsScrolledToBottom(true);
      }
    }, 200);

    return () => node.removeEventListener("scroll", checkScroll);
  }, []);

  const handleRadioChange = (fieldName: keyof FormData, value: string) => {
    if (onInputChange) {
      onInputChange(fieldName, value);
    }
    // Update legacy consent field for backward compatibility
    if (fieldName === 'terms' && value === 'Agree') {
      updateFormData({ consentAgreement: true });
    }
  };

  // Show validation errors if present
  const hasValidationErrors = validationErrors && validationErrors.length > 0;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold text-[#ef4805] border-b pb-2">5. Consent</h2>

      {hasValidationErrors && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Please complete the following:</p>
          <ul className="list-disc list-inside text-red-700 text-sm mt-2">
            {validationErrors?.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="mb-4 border border-gray-300 rounded">
        <summary className="cursor-pointer p-3 bg-gray-100 font-medium">
          View MIA Consent Form
        </summary>
        <div
          ref={termsRef}
          className="max-h-72 overflow-y-scroll p-4 border-t border-gray-300 text-sm space-y-4"
        >
          <h3 className="text-lg font-semibold text-orange-600">MIA Consent Form Contents</h3>
          <p>1. I, the undersigned, hereby give my voluntary consent for dental examination, diagnosis and treatment as deemed necessary by the dental professional in attendance.</p>
          <p>2. I understand that dental treatment may involve procedures such as cleaning, scaling, polishing, and the use of diagnostic tools including X-rays or photos.</p>
          <p>3. I understand the nature and purpose of the treatment and acknowledge that no guarantees or assurances have been made to me concerning the results of the procedure.</p>
          <p>4. I understand that there may be risks and complications associated with dental treatment, including but not limited to sensitivity, discomfort, and allergic reactions.</p>
          <p>5. I confirm that I have disclosed all relevant medical history and current medications.</p>
          <p>6. I understand that the dental provider may refer me for further treatment if necessary, and that this referral may incur additional costs not covered during the screening.</p>
          <p>7. I acknowledge that I have the right to ask questions and that I may withdraw my consent at any time before or during the treatment.</p>
          <p>8. I give consent for my dental records to be shared with other healthcare professionals if needed for further treatment or referral.</p>
          <p>9. I understand the confidentiality of my health information and consent to the collection and use of this information for medical and administrative purposes.</p>
          <p>10. I confirm that I have read and understood the information above, and that I am signing this consent voluntarily and without coercion.</p>
        </div>
      </details>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            44. I have read and agree with terms and conditions provided in the document
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="terms"
                value="Agree"
                checked={formData?.terms === 'Agree'}
                onChange={(e) => handleRadioChange('terms', e.target.value)}
                className="mr-2"
                disabled={!isScrolledToBottom}
              />
              <span className="text-sm">Agree</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="terms"
                value="Disagree"
                checked={formData?.terms === 'Disagree'}
                onChange={(e) => handleRadioChange('terms', e.target.value)}
                className="mr-2"
                disabled={!isScrolledToBottom}
              />
              <span className="text-sm">Disagree</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            45. My consent is provided of my own free will without any undue influence from any person whatsoever. I confirm that I have permission of my dependant(s) to give their consent, where such consent has been provided, and I indemnify the practice against this.
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="consentFreeWill"
                value="Agree"
                checked={formData?.consentFreeWill === 'Agree'}
                onChange={(e) => handleRadioChange('consentFreeWill', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Agree</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="consentFreeWill"
                value="Disagree"
                checked={formData?.consentFreeWill === 'Disagree'}
                onChange={(e) => handleRadioChange('consentFreeWill', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Disagree</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            46. I acknowledge that I have been informed that this practice does not charge the rates that the Department of Health has unilaterally determined for dentists
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="rates"
                value="Agree"
                checked={formData?.rates === 'Agree'}
                onChange={(e) => handleRadioChange('rates', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Agree</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="rates"
                value="Disagree"
                checked={formData?.rates === 'Disagree'}
                onChange={(e) => handleRadioChange('rates', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Disagree</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            47. I accept that I am fully responsible for the payment for services rendered and should I not pay timeously, understand that I will be liable for debt recovery cost on an attorney and own client scale.
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentResponsibility"
                value="Agree"
                checked={formData?.paymentResponsibility === 'Agree'}
                onChange={(e) => handleRadioChange('paymentResponsibility', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Agree</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentResponsibility"
                value="Disagree"
                checked={formData?.paymentResponsibility === 'Disagree'}
                onChange={(e) => handleRadioChange('paymentResponsibility', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Disagree</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            48. Do we have your permission to place our positive commentary and non-treatment related photographs on our website/social media? (Optional)
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="mediaPermission"
                value="Yes"
                checked={formData?.mediaPermission === 'Yes'}
                onChange={(e) => handleRadioChange('mediaPermission', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mediaPermission"
                value="No"
                checked={formData?.mediaPermission === 'No'}
                onChange={(e) => handleRadioChange('mediaPermission', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            49. Cancellation Policy Acknowledgment
          </label>
          <p className="text-sm text-gray-600 mb-2">
            I confirm that by confirming this appointment, I agree to keep my appointment for the agreed upon date and time. Please note that Mia Healthcare charges R250 per appointment missed or cancelled within 24 hours of the scheduled time. The cancellation policy will be discussed during the appointment booking process.
          </p>
          <label className="flex items-center">
            <input
              type="radio"
              name="cancellationPolicy"
              value="Acknowledge cancellation policy"
              checked={formData?.cancellationPolicy === 'Acknowledge cancellation policy'}
              onChange={(e) => handleRadioChange('cancellationPolicy', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Acknowledge cancellation policy</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            50. Background Music Preference (Optional)
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ef4805] focus:border-transparent"
            value={formData?.musicPreference || ''}
            onChange={(e) => onInputChange && onInputChange('musicPreference', e.target.value)}
            placeholder="Let us know your favourite artist/song or attach a link to your favourite playlist"
            rows={3}
          />
        </div>

        <ValidatedInput
          type="text"
          label="51. Please enter your full name and surname followed by the date"
          value={formData?.signature || ''}
          onChange={(value) => onInputChange && onInputChange('signature', value)}
          placeholder="Enter your full name and date"
        />

        {/* NAM-specific consent fields */}
        {currentRegion?.code === 'NAM' && (
          <div className="space-y-6 mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-[#ef4805]">Namibian-Specific Consent Requirements</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I understand that if my account remains unpaid after 90 days, my details may be submitted to ITC for blacklisting and legal recovery action.
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="namItcBlacklistingConsent"
                    value="Agree"
                    checked={formData?.namItcBlacklistingConsent === 'Agree'}
                    onChange={(e) => handleRadioChange('namItcBlacklistingConsent', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Agree</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="namItcBlacklistingConsent"
                    value="Disagree"
                    checked={formData?.namItcBlacklistingConsent === 'Disagree'}
                    onChange={(e) => handleRadioChange('namItcBlacklistingConsent', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Disagree</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I understand that MIA will submit claims on my behalf where possible, but I remain responsible for any shortfalls or unpaid amounts.
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="namMedicalAidClaimingResponsibility"
                    value="Agree"
                    checked={formData?.namMedicalAidClaimingResponsibility === 'Agree'}
                    onChange={(e) => handleRadioChange('namMedicalAidClaimingResponsibility', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Agree</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="namMedicalAidClaimingResponsibility"
                    value="Disagree"
                    checked={formData?.namMedicalAidClaimingResponsibility === 'Disagree'}
                    onChange={(e) => handleRadioChange('namMedicalAidClaimingResponsibility', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Disagree</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I authorize MIA to share relevant information with my medical aid for claim purposes.
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="namInformationSharingAuthorization"
                    value="Agree"
                    checked={formData?.namInformationSharingAuthorization === 'Agree'}
                    onChange={(e) => handleRadioChange('namInformationSharingAuthorization', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Agree</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="namInformationSharingAuthorization"
                    value="Disagree"
                    checked={formData?.namInformationSharingAuthorization === 'Disagree'}
                    onChange={(e) => handleRadioChange('namInformationSharingAuthorization', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Disagree</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I understand that my personal and medical information will be kept confidential and used only for healthcare, administrative, or legal purposes in accordance with Namibian regulations.
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="namPrivacyConfidentialityAcknowledgment"
                    value="Agree"
                    checked={formData?.namPrivacyConfidentialityAcknowledgment === 'Agree'}
                    onChange={(e) => handleRadioChange('namPrivacyConfidentialityAcknowledgment', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Agree</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="namPrivacyConfidentialityAcknowledgment"
                    value="Disagree"
                    checked={formData?.namPrivacyConfidentialityAcknowledgment === 'Disagree'}
                    onChange={(e) => handleRadioChange('namPrivacyConfidentialityAcknowledgment', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Disagree</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isScrolledToBottom && (
        <p className="text-red-500 text-sm mt-2">
          Please scroll to the bottom of the consent form to enable the agreement options.
        </p>
      )}

      {formData?.terms === 'Agree' && isScrolledToBottom && (
        <p className="text-green-600 text-sm mt-2 font-medium">
          ✓ Consent terms accepted! Please complete all other required consent questions.
        </p>
      )}
    </div>
  );
};

export default ConsentSection;
