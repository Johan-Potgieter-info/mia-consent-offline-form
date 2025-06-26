
import { useState } from 'react';

export const useSubmissionState = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'draft' | 'pending' | 'submitted' | 'synced'>('draft');

  const startSubmission = () => {
    if (submitting) return false; // Prevent double submission
    setSubmitting(true);
    setSubmissionStatus('pending');
    return true;
  };

  const completeSubmission = (status: 'submitted' | 'synced') => {
    setSubmitting(false);
    setSubmissionStatus(status);
  };

  const failSubmission = () => {
    setSubmitting(false);
    setSubmissionStatus('draft');
  };

  return {
    submitting,
    submissionStatus,
    startSubmission,
    completeSubmission,
    failSubmission,
    setSubmissionStatus
  };
};
