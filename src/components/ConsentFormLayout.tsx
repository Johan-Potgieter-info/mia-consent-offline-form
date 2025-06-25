
import React from 'react';
import ConsentFormHeader from './ConsentFormHeader';
import ConsentFormProgress from './ConsentFormProgress';
import ConsentFormStatusBar from './ConsentFormStatusBar';
import ConsentFormContent from './ConsentFormContent';
import ConsentFormNavigation from './ConsentFormNavigation';
import BackToStartButton from './BackToStartButton';
import RegionSelector from './RegionSelector';
import FormValidationErrors from './FormValidationErrors';
import FormSectionsContainer from './FormSectionsContainer';
import { FormData } from '../types/formTypes';
import { Region } from '../utils/regionDetection';
import { AutoSaveStatus } from '../types/autoSaveTypes';
import { useFormSections } from '../hooks/useFormSections';

interface ConsentFormLayoutProps {
  currentRegion: Region | null;
  regionDetected: boolean;
  isResuming: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string) => void;
  handleCheckboxChange: (field: keyof FormData, value: string, checked: boolean) => void;
  isDirty: boolean;
  justSaved: boolean;
  onSave: () => Promise<void>;
  onSubmit: () => Promise<void>;
  onDiscard: () => void;
  onResetJustSaved: () => void;
  isOnline: boolean;
  lastSaved: Date | null;
  formatLastSaved: () => string;
  dbInitialized: boolean;
  autoSaveStatus: AutoSaveStatus;
  retryCount: number;
  showManualSelector: boolean;
  setRegionManually: (region: Region) => void;
  isRegionFromDraft: boolean;
  isRegionDetected: boolean;
  validationErrors: string[];
  showValidationErrors: boolean;
}

const ConsentFormLayout = ({
  currentRegion,
  regionDetected,
  isResuming,
  activeSection,
  setActiveSection,
  formData,
  handleInputChange,
  handleCheckboxChange,
  isDirty,
  justSaved,
  onSave,
  onSubmit,
  onDiscard,
  onResetJustSaved,
  isOnline,
  lastSaved,
  formatLastSaved,
  dbInitialized,
  autoSaveStatus,
  retryCount,
  showManualSelector,
  setRegionManually,
  isRegionFromDraft,
  isRegionDetected,
  validationErrors = [],
  showValidationErrors
}: ConsentFormLayoutProps) => {
  const { sections } = useFormSections();

  // Check if user has consented before showing the form
  const hasConsented = localStorage.getItem("consentAccepted") === "true" || formData?.consentAgreement === true;

  if (!hasConsented) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Consent Required</h2>
          <p className="text-gray-600 mb-4">Please return to the home page to provide consent before proceeding.</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsentFormHeader 
        currentRegion={currentRegion}
        regionDetected={regionDetected}
        isResuming={isResuming}
      />

      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <BackToStartButton
            isDirty={isDirty}
            justSaved={justSaved}
            onSave={onSave}
            onDiscard={onDiscard}
            onResetJustSaved={onResetJustSaved}
          />
        </div>

        <RegionSelector
          onRegionSelect={setRegionManually}
          currentRegion={currentRegion}
          isVisible={showManualSelector}
        />

        <ConsentFormProgress 
          currentSection={activeSection}
          sections={sections || []}
        />

        <ConsentFormStatusBar 
          isOnline={isOnline}
          currentRegion={currentRegion}
          isDirty={isDirty}
          lastSaved={lastSaved}
          formatLastSaved={formatLastSaved}
          onSave={onSave}
          dbInitialized={dbInitialized}
          autoSaveStatus={autoSaveStatus}
          retryCount={retryCount}
          onRegionSelect={setRegionManually}
          isRegionFromDraft={isRegionFromDraft}
          isRegionDetected={isRegionDetected}
        />

        <FormValidationErrors 
          errors={validationErrors || []}
          isVisible={showValidationErrors && (validationErrors?.length || 0) > 0}
        />

        <FormSectionsContainer
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          formData={formData}
          handleInputChange={handleInputChange}
          handleCheckboxChange={handleCheckboxChange}
          validationErrors={validationErrors || []}
        />

        <ConsentFormContent
          currentRegion={currentRegion}
          regionDetected={regionDetected}
          isResuming={isResuming}
        >
          <ConsentFormNavigation
            sections={sections || []}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onSave={onSave}
            onSubmit={onSubmit}
          />
        </ConsentFormContent>
      </div>
    </div>
  );
};

export default ConsentFormLayout;
