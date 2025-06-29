
import React, { useEffect, useState, useRef } from "react";
import { FormData } from "../types/formTypes";

interface ConsentSectionProps {
  formData?: FormData;
  onInputChange?: (field: keyof FormData, value: string) => void;
  onCheckboxChange?: (field: keyof FormData, value: string, checked: boolean) => void;
  updateFormData?: (updates: Partial<FormData>) => void;
  validationErrors?: string[];
}

const ConsentSection: React.FC<ConsentSectionProps> = ({
  formData,
  onCheckboxChange,
  validationErrors
}) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const termsRef = useRef<HTMLDivElement>(null);

  // Reset consent state on component mount - don't auto-tick
  useEffect(() => {
    // Only check formData, don't auto-load from localStorage
    if (formData?.consentAgreement === true) {
      setConsentGiven(true);
    } else {
      setConsentGiven(false);
    }
  }, [formData?.consentAgreement]);

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

  const handleConsent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    
    // Update localStorage (preserve existing behavior)
    localStorage.setItem("consentAccepted", checked.toString());
    
    // Update local state (preserve existing behavior)
    setConsentGiven(checked);
    
    // Update main form data (fix the issue)
    if (onCheckboxChange) {
      onCheckboxChange('consentAgreement', checked.toString(), checked);
    }
  };

  // Show validation errors if present
  const hasValidationErrors = validationErrors && validationErrors.length > 0;

  return (
    <div className="max-w-2xl mx-auto p-4 text-left">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Consent and Agreement</h2>

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
            View Consent and Agreement Form
          </summary>
          <div
            ref={termsRef}
            className="max-h-72 overflow-y-scroll p-4 border-t border-gray-300 text-sm space-y-4"
          >
            <h3 className="text-lg font-semibold text-orange-600">Consent Form Contents</h3>
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

        <label className="flex items-start space-x-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            disabled={!isScrolledToBottom}
            checked={consentGiven}
            onChange={handleConsent}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm">
            I have read and agree to the Consent and Agreement terms above.
          </span>
        </label>

        {!isScrolledToBottom && (
          <p className="text-red-500 text-sm mt-2">
            Please scroll to the bottom of the consent form to enable the checkbox.
          </p>
        )}

        {consentGiven && isScrolledToBottom && (
          <p className="text-green-600 text-sm mt-2 font-medium">
            ✓ Consent Accepted! You can now submit the form.
          </p>
        )}
      </div>
    </div>
  );
};

export default ConsentSection;
