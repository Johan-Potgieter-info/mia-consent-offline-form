
import { useState } from 'react';
import { FormData } from '../types/formTypes';

export const useDialogStates = () => {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);
  const [showOnlineSuccessDialog, setShowOnlineSuccessDialog] = useState(false);
  const [showOfflineSummaryDialog, setShowOfflineSummaryDialog] = useState(false);
  const [offlineFormData, setOfflineFormData] = useState<FormData | undefined>(undefined);
  const [onlineFormData, setOnlineFormData] = useState<FormData | undefined>(undefined);
  const [pendingForms, setPendingForms] = useState<FormData[]>([]);

  return {
    showSaveConfirmation,
    setShowSaveConfirmation,
    saveMessage,
    setSaveMessage,
    showOfflineDialog,
    setShowOfflineDialog,
    showOnlineSuccessDialog,
    setShowOnlineSuccessDialog,
    showOfflineSummaryDialog,
    setShowOfflineSummaryDialog,
    offlineFormData,
    setOfflineFormData,
    onlineFormData,
    setOnlineFormData,
    pendingForms,
    setPendingForms
  };
};
