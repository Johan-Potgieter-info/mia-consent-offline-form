import React, { useEffect, useState, useRef } from "react";

const ConsentPage: React.FC<{ onCheckboxChange?: (key: string, value: string, checked: boolean) => void }> = ({ onCheckboxChange }) => {
  const [termsHtml, setTermsHtml] = useState<string>("");
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [consentGiven, setConsentGiven] = useState<boolean>(() => {
    return localStorage.getItem("consentAccepted") === "true";
  });
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/mia-consent-offline-form/terms.html")
      .then((res) => res.text())
      .then(setTermsHtml)
      .catch(console.error);

    const handleScroll = () => {
      if (!termsRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      console.log("Scroll position:", { scrollTop, scrollHeight, clientHeight });
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setIsScrolledToBottom(true);
      }
    };

    const node = termsRef.current;
    node?.addEventListener("scroll", handleScroll);
    return () => node?.removeEventListener("scroll", handleScroll);
  }, []);

  const handleConsent = () => {
    console.log("✅ Consent checkbox ticked");
    localStorage.setItem("consentAccepted", "true");
    setConsentGiven(true);
    onCheckboxChange?.("consentAgreement", "", true);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Patient Consent Form</h1>
      <details className="mb-4 border border-gray-300 rounded">
        <summary className="cursor-pointer p-3 bg-gray-100 font-medium">
          View Terms and Conditions
        </summary>
        <div
          ref={termsRef}
          className="max-h-72 overflow-y-scroll p-4 border-t border-gray-300 text-sm"
          dangerouslySetInnerHTML={{ __html: termsHtml }}
        />
      </details>

      <label className="flex items-start space-x-2 mt-4">
        <input
          type="checkbox"
          disabled={!isScrolledToBottom}
          checked={consentGiven}
          onChange={handleConsent}
          className="mt-1"
        />
        <span>I have read and agree to the Terms and Conditions.</span>
      </label>

      {!isScrolledToBottom && (
        <p className="text-red-500 text-sm mt-2">
          Please scroll to the bottom of the terms to enable the checkbox.
        </p>
      )}
    </div>
  );
};

export default ConsentPage;
