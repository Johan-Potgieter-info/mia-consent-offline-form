
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
import FormStatusBadge from './FormStatusBadge';
import { FormData } from '../types/formTypes';
import { Region } from '../utils/regionDetection';
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
  retryCount: number;
  showManualSelector: boolean;
  setRegionManually: (region: Region) => void;
  isRegionFromDraft: boolean;
  isRegionDetected: boolean;
  validationErrors: string[];
  showValidationErrors: boolean;
  submitting?: boolean;
  submissionStatus?: 'draft' | 'pending' | 'submitted' | 'synced';
  isFormComplete?: boolean;
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
  retryCount,
  showManualSelector,
  setRegionManually,
  isRegionFromDraft,
  isRegionDetected,
  validationErrors = [],
  showValidationErrors,
  submitting = false,
  submissionStatus = 'draft',
  isFormComplete = false
}: ConsentFormLayoutProps) => {
  const { sections } = useFormSections();

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsentFormHeader 
        currentRegion={currentRegion}
        regionDetected={regionDetected}
        isResuming={isResuming}
      />

      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <BackToStartButton
            isDirty={isDirty}
            justSaved={justSaved}
            formData={formData}
            onSave={onSave}
            onDiscard={onDiscard}
            onResetJustSaved={onResetJustSaved}
          />
          
          <FormStatusBadge 
            status={submissionStatus}
            isSubmitting={submitting}
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
            submitting={submitting}
            isFormComplete={isFormComplete}
          />
        </ConsentFormContent>
      </div>
    </div>
  );
};

export default ConsentFormLayout;
