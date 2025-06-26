
import { FormData } from '../types/formTypes';

const STALE_DRAFT_DAYS = 7; // Consider drafts older than 7 days as stale
const STUCK_SUBMISSION_DAYS = 3; // Consider pending submissions older than 3 days as stuck

export const isStale = (dateString: string, daysThreshold: number): boolean => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > daysThreshold;
  } catch (error) {
    console.error('Error checking stale date:', error);
    return false;
  }
};

export const identifyStaleDrafts = (drafts: FormData[]): FormData[] => {
  return drafts.filter(draft => {
    const createdAt = draft.createdAt || draft.timestamp;
    const lastModified = draft.lastModified;
    
    // Check both creation and last modified dates
    const staleByCreation = createdAt && isStale(createdAt, STALE_DRAFT_DAYS);
    const staleByModified = lastModified && isStale(lastModified, STALE_DRAFT_DAYS);
    
    return staleByCreation || staleByModified;
  });
};

export const identifyStuckSubmissions = (submissions: FormData[]): FormData[] => {
  return submissions.filter(submission => {
    if (submission.submissionStatus !== 'pending') return false;
    
    const createdAt = submission.createdAt || submission.timestamp;
    return createdAt && isStale(createdAt, STUCK_SUBMISSION_DAYS);
  });
};

export const formatStaleWarning = (staleDrafts: FormData[], stuckSubmissions: FormData[]): string | null => {
  const messages: string[] = [];
  
  if (staleDrafts.length > 0) {
    messages.push(`${staleDrafts.length} draft${staleDrafts.length > 1 ? 's' : ''} older than ${STALE_DRAFT_DAYS} days`);
  }
  
  if (stuckSubmissions.length > 0) {
    messages.push(`${stuckSubmissions.length} pending submission${stuckSubmissions.length > 1 ? 's' : ''} stuck for over ${STUCK_SUBMISSION_DAYS} days`);
  }
  
  return messages.length > 0 ? messages.join(' and ') : null;
};
