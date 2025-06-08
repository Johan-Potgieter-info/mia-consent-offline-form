
import React, { useState } from 'react';
import { useConsentForm } from '../hooks/useConsentForm';
import { useFormSubmission } from '../hooks/useFormSubmission';
import ConsentFormHeader from './ConsentFormHeader';
import ConsentFormProgress from './ConsentFormProgress';
import ConsentFormStatusBar from './ConsentFormStatusBar';
import ConsentFormContent from './ConsentFormContent';
import ConsentFormNavigation from './ConsentFormNavigation';
import BackToStartButton from './BackToStartButton';
import SaveConfirmation from './SaveConfirmation';
import RegionSelector from './RegionSelector';
import OfflineSubmissionDialog from './OfflineSubmissionDialog';
import FormSection from './FormSection';
import PatientDetailsSection from './PatientDetailsSection';
import AccountHolderSection from './AccountHolderSection';
import PaymentEmergencySection from './PaymentEmergencySection';
import MedicalHistorySection from './MedicalHistorySection';
import ConsentSection from './ConsentSection';
import { FormData } from '../types/formTypes';

const ConsentForm = () => {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);
  const [offlineFormData, setOfflineFormData] = useState<FormData | undefined>();
  
  const {
    activeSection,
    setActiveSection,
    formData,
    handleInputChange,
    handleCheckboxChange,
    saveForm,
    isOnline,
    currentRegion,
    regionDetected,
    showManualSelector,
    setRegionManually,
    isResuming,
    lastSaved,
    isDirty,
    formatLastSaved,
    dbInitialized,
    autoSaveStatus,
    retryCount,
    justSaved,
    resetJustSaved,
    isRegionFromDraft,
    isRegionDetected
  } = useConsentForm();

  const { submitForm: submitFormHook } = useFormSubmission({ 
    isOnline,
    onOfflineSubmission: (formData) => {
      setOfflineFormData(formData);
      setShowOfflineDialog(true);
    }
  });

  const sections = [
    { id: 'patientDetails', title: '1. Patient Details', component: PatientDetailsSection },
    { id: 'accountHolder', title: '2. Account Holder Details', component: AccountHolderSection },
    { id: 'paymentEmergency', title: '3. Payment and Emergency Contact', component: PaymentEmergencySection },
    { id: 'medicalHistory', title: '4. Medical History', component: MedicalHistorySection },
    { id: 'consent', title: '5. Consent', component: ConsentSection },
  ];

  const handleSave = async () => {
    try {
      await saveForm();
      setSaveMessage('Form saved successfully to ' + (dbInitialized ? 'cloud storage' : 'local storage'));
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitFormHook(formData, currentRegion, isResuming);
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleDiscard = () => {
    // Reset form data or navigate away without saving
    console.log('Form discarded');
  };

  const renderActiveSection = () => {
    const section = sections.find(s => s.id === activeSection);
    if (!section) return null;

    const SectionComponent = section.component;
    return (
      <SectionComponent
        formData={formData}
        onInputChange={handleInputChange}
        onCheckboxChange={handleCheckboxChange}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsentFormHeader 
        currentRegion={currentRegion}
        regionDetected={regionDetected}
        isResuming={isResuming}
      />

      <div className="max-w-4xl mx-auto p-4">
        {/* Back to Start Button - prominently displayed */}
        <div className="mb-6">
          <BackToStartButton
            isDirty={isDirty}
            justSaved={justSaved}
            onSave={handleSave}
            onDiscard={handleDiscard}
            onResetJustSaved={resetJustSaved}
          />
        </div>

        {/* Manual Region Selector */}
        <RegionSelector
          onRegionSelect={setRegionManually}
          currentRegion={currentRegion}
          isVisible={showManualSelector}
        />

        <ConsentFormProgress 
          currentSection={activeSection}
          sections={sections}
        />

        <ConsentFormStatusBar 
          isOnline={isOnline}
          currentRegion={currentRegion}
          isDirty={isDirty}
          lastSaved={lastSaved}
          formatLastSaved={formatLastSaved}
          onSave={handleSave}
          dbInitialized={dbInitialized}
          autoSaveStatus={autoSaveStatus}
          retryCount={retryCount}
          onRegionSelect={setRegionManually}
          isRegionFromDraft={isRegionFromDraft}
          isRegionDetected={isRegionDetected}
        />

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Section Navigation */}
          <div className="border-b border-gray-200">
            {sections.map((section) => (
              <FormSection
                key={section.id}
                id={section.id}
                title={section.title}
                isActive={activeSection === section.id}
                onToggle={setActiveSection}
              >
                {activeSection === section.id && renderActiveSection()}
              </FormSection>
            ))}
          </div>

          <ConsentFormContent
            currentRegion={currentRegion}
            regionDetected={regionDetected}
            isResuming={isResuming}
          >
            <ConsentFormNavigation
              sections={sections}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              onSave={handleSave}
              onSubmit={handleSubmit}
            />
          </ConsentFormContent>
        </div>
      </div>

      {/* Save Confirmation - properly positioned */}
      <SaveConfirmation
        show={showSaveConfirmation}
        message={saveMessage}
      />

      {/* Offline Submission Dialog */}
      <OfflineSubmissionDialog
        isOpen={showOfflineDialog}
        onClose={() => setShowOfflineDialog(false)}
        formData={offlineFormData}
      />
    </div>
  );
};

export default ConsentForm;
