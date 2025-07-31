
import { useState } from 'react';
import { FormData } from '../types/formTypes';

export const useDialogStates = () => {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);
  const [showOnlineSuccessDialog, setShowOnlineSuccessDialog] = useState(false);
  const [showOfflineSummaryDialog, setShowOfflineSummaryDialog] = useState(false);
  const [showSyncSuccessDialog, setShowSyncSuccessDialog] = useState(false);
  const [offlineFormData, setOfflineFormData] = useState<FormData | undefined>(undefined);
  const [onlineFormData, setOnlineFormData] = useState<FormData | undefined>(undefined);
  const [pendingForms, setPendingForms] = useState<FormData[]>([]);
  const [syncedForms, setSyncedForms] = useState<FormData[]>([]);
  const [syncStats, setSyncStats] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

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
    showSyncSuccessDialog,
    setShowSyncSuccessDialog,
    offlineFormData,
    setOfflineFormData,
    onlineFormData,
    setOnlineFormData,
    pendingForms,
    setPendingForms,
    syncedForms,
    setSyncedForms,
    syncStats,
    setSyncStats
  };
};
