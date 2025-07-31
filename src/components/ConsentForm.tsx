
import React from 'react';
import { useConsentFormContainer } from '../hooks/useConsentFormContainer';
import ConsentFormLayout from './ConsentFormLayout';
import ConsentFormDialogs from './ConsentFormDialogs';

const ConsentForm = () => {
  const containerData = useConsentFormContainer();

  return (
    <>
      <ConsentFormLayout
        currentRegion={containerData.currentRegion}
        regionDetected={containerData.regionDetected}
        isResuming={containerData.isResuming}
        activeSection={containerData.activeSection}
        setActiveSection={containerData.setActiveSection}
        formData={containerData.formData}
        handleInputChange={containerData.handleInputChange}
        handleCheckboxChange={containerData.handleCheckboxChange}
        isDirty={containerData.isDirty}
        justSaved={containerData.justSaved}
        onSave={containerData.handleSave}
        onSubmit={containerData.handleSubmit}
        onDiscard={containerData.handleDiscard}
        onResetJustSaved={containerData.resetJustSaved}
        isOnline={containerData.isOnline}
        lastSaved={containerData.lastSaved}
        formatLastSaved={containerData.formatLastSaved}
        dbInitialized={containerData.dbInitialized}
        retryCount={containerData.retryCount}
        showManualSelector={containerData.showManualSelector}
        setRegionManually={containerData.setRegionManually}
        isRegionFromDraft={containerData.isRegionFromDraft}
        isRegionDetected={containerData.isRegionDetected}
        validationErrors={containerData.validationErrors}
        showValidationErrors={containerData.showValidationErrors}
        submitting={containerData.submitting}
        submissionStatus={containerData.submissionStatus}
        isFormComplete={containerData.isFormComplete}
      />

      <ConsentFormDialogs
        showSaveConfirmation={containerData.showSaveConfirmation}
        saveMessage={containerData.saveMessage}
        isOnline={containerData.isOnline}
        showOfflineDialog={containerData.showOfflineDialog}
        setShowOfflineDialog={containerData.setShowOfflineDialog}
        showOnlineSuccessDialog={containerData.showOnlineSuccessDialog}
        setShowOnlineSuccessDialog={containerData.setShowOnlineSuccessDialog}
        showOfflineSummaryDialog={containerData.showOfflineSummaryDialog}
        setShowOfflineSummaryDialog={containerData.setShowOfflineSummaryDialog}
        showSyncSuccessDialog={containerData.showSyncSuccessDialog}
        setShowSyncSuccessDialog={containerData.setShowSyncSuccessDialog}
        offlineFormData={containerData.offlineFormData}
        onlineFormData={containerData.onlineFormData}
        pendingForms={containerData.pendingForms}
        syncedForms={containerData.syncedForms}
        syncStats={containerData.syncStats}
      />
    </>
  );
};

export default ConsentForm;
