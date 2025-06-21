import React, { useEffect, useState, useRef } from "react";

const ConsentPage: React.FC = () => {
  const [termsHtml, setTermsHtml] = useState<string>("");
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [consentGiven, setConsentGiven] = useState<boolean>(() => {
    return localStorage.getItem("consentAccepted") === "true";
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/mia-consent-offline-form/terms.html")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch terms.html");
        return res.text();
      })
      .then((html) => {
        setTermsHtml(html);

        // Wait until content renders, then measure scroll area
        setTimeout(() => {
          const node = termsRef.current;
          if (node && node.scrollHeight <= node.clientHeight + 5) {
            setIsScrolledToBottom(true); // No scroll needed
          }
        }, 250);
      })
      .catch((err) => {
        console.error("Terms fetch failed:", err);
        setTermsHtml("<p style='color:red'>⚠️ Failed to load Terms and Conditions. Please try again later.</p>");
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!termsRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setIsScrolledToBottom(true);
      }
    };

    const node = termsRef.current;
    node?.addEventListener("scroll", handleScroll);
    return () => node?.removeEventListener("scroll", handleScroll);
  }, [termsHtml]);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  const handleConsent = () => {
    localStorage.setItem("consentAccepted", "true");
    setConsentGiven(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 text-left">
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

      {isOnline && (
        <a
          href="https://johan-potgieter-info.github.io/mia-consent-offline-form/terms.html"
          className="text-sm text-blue-600 underline mb-4 block"
          target="_blank"
          rel="noopener noreferrer"
        >
          View latest online version of Terms & Conditions
        </a>
      )}

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
