import React, { useState } from "react";
import ConsentPage from "./ConsentPage";

const FormPage: React.FC = () => {
  const [formData, setFormData] = useState<{ consentAgreement?: boolean }>({});

  const handleCheckboxChange = (key: string, value: string, checked: boolean) => {
    console.log("📝 Form state update:", { key, checked });
    setFormData((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Submitting form with:", formData);
    if (formData.consentAgreement === true) {
      alert("✅ Form submitted successfully!");
    } else {
      alert("❌ Please agree to the terms and conditions before submitting.");
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit}>
        <ConsentPage onCheckboxChange={handleCheckboxChange} />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={formData.consentAgreement !== true}
        >
          Submit Form
        </button>
      </form>
    </div>
  );
};

export default FormPage;
