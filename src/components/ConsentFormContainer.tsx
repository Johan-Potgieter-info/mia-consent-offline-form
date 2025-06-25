
import React from "react";
import { useConsentFormContainer } from "../hooks/useConsentFormContainer";
import PatientDetailsSection from "./PatientDetailsSection";
import PaymentEmergencySection from "./PaymentEmergencySection";
import MedicalHistorySection from "./MedicalHistorySection";
import ConsentSection from "./ConsentSection";
import ConsentFormHeader from "./ConsentFormHeader";
import ConsentFormNavigation from "./ConsentFormNavigation";
import SaveConfirmation from "./SaveConfirmation";

const ConsentFormContainer: React.FC = () => {
  const {
    formData,
    handleInputChange,
    handleCheckboxChange,
    handleSave,
    handleSubmit,
    handleDiscard,
    isDirty,
    justSaved,
    activeSection,
    setActiveSection,
    validationErrors,
    showValidationErrors,
  } = useConsentFormContainer();

  const renderSection = () => {
    switch (activeSection) {
      case "patient":
        return (
          <PatientDetailsSection
            formData={formData}
            onInputChange={handleInputChange}
            validationErrors={validationErrors}
          />
        );
      case "payment":
        return (
          <PaymentEmergencySection
            formData={formData}
            onInputChange={handleInputChange}
            validationErrors={validationErrors}
          />
        );
      case "medical":
        return (
          <MedicalHistorySection
            formData={formData}
            onInputChange={handleInputChange}
            validationErrors={validationErrors}
          />
        );
      case "consent":
        return (
          <ConsentSection
            formData={formData}
            onCheckboxChange={handleCheckboxChange}
            validationErrors={validationErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <ConsentFormHeader />
      <ConsentFormNavigation
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      {renderSection()}
      <SaveConfirmation
        onSaveDraft={() => handleSave(true)}
        onSubmit={handleSubmit}
        onDiscard={handleDiscard}
        isDirty={isDirty}
        justSaved={justSaved}
        showValidationErrors={showValidationErrors}
      />
    </div>
  );
};

export default ConsentFormContainer;
