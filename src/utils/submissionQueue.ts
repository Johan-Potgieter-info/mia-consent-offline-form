
/**
 * Submission queue management for offline/failed submissions
 */

import { FormData } from '../types/formTypes';

export interface QueuedSubmission {
  id: string;
  data: FormData;
  submissionStatus: 'pending' | 'retrying' | 'failed';
  retryCount: number;
  lastAttempt: string;
  nextRetry: string;
  createdAt: string;
  maxRetries: number;
}

const QUEUE_STORAGE_KEY = 'submission_queue';
const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff in ms

/**
 * Add a form to the submission queue
 */
export const addToQueue = async (formData: FormData): Promise<string> => {
  const queueId = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const queuedSubmission: QueuedSubmission = {
    id: queueId,
    data: formData,
    submissionStatus: 'pending',
    retryCount: 0,
    lastAttempt: now,
    nextRetry: now,
    createdAt: now,
    maxRetries: MAX_RETRIES
  };
  
  const queue = await getQueue();
  queue.push(queuedSubmission);
  await saveQueue(queue);
  
  console.log('Added to submission queue:', queueId);
  return queueId;
};

/**
 * Get all queued submissions
 */
export const getQueue = async (): Promise<QueuedSubmission[]> => {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get submission queue:', error);
    return [];
  }
};

/**
 * Save queue to storage
 */
export const saveQueue = async (queue: QueuedSubmission[]): Promise<void> => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save submission queue:', error);
  }
};

/**
 * Update a queued submission
 */
export const updateQueuedSubmission = async (id: string, updates: Partial<QueuedSubmission>): Promise<void> => {
  const queue = await getQueue();
  const index = queue.findIndex(item => item.id === id);
  
  if (index !== -1) {
    queue[index] = { ...queue[index], ...updates };
    await saveQueue(queue);
  }
};

/**
 * Remove a submission from the queue
 */
export const removeFromQueue = async (id: string): Promise<void> => {
  const queue = await getQueue();
  const filtered = queue.filter(item => item.id !== id);
  await saveQueue(filtered);
  console.log('Removed from submission queue:', id);
};

/**
 * Get next retry time for a submission
 */
export const getNextRetryTime = (retryCount: number): string => {
  const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
  return new Date(Date.now() + delay).toISOString();
};

/**
 * Check if a submission is ready for retry
 */
export const isReadyForRetry = (submission: QueuedSubmission): boolean => {
  if (submission.submissionStatus === 'failed') return false;
  if (submission.retryCount >= submission.maxRetries) return false;
  return new Date(submission.nextRetry) <= new Date();
};

/**
 * Get submissions ready for retry
 */
export const getReadyForRetry = async (): Promise<QueuedSubmission[]> => {
  const queue = await getQueue();
  return queue.filter(isReadyForRetry);
};

/**
 * Mark submission as failed
 */
export const markAsFailed = async (id: string): Promise<void> => {
  await updateQueuedSubmission(id, {
    submissionStatus: 'failed',
    lastAttempt: new Date().toISOString()
  });
};

/**
 * Increment retry count and update next retry time
 */
export const incrementRetry = async (id: string): Promise<void> => {
  const queue = await getQueue();
  const submission = queue.find(item => item.id === id);
  
  if (submission) {
    const newRetryCount = submission.retryCount + 1;
    await updateQueuedSubmission(id, {
      retryCount: newRetryCount,
      lastAttempt: new Date().toISOString(),
      nextRetry: getNextRetryTime(newRetryCount),
      submissionStatus: newRetryCount >= submission.maxRetries ? 'failed' : 'retrying'
    });
  }
};

/**
 * Clean up old failed submissions (older than 7 days)
 */
export const cleanupOldSubmissions = async (): Promise<void> => {
  const queue = await getQueue();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const cleaned = queue.filter(submission => {
    if (submission.submissionStatus === 'failed') {
      return new Date(submission.createdAt) > sevenDaysAgo;
    }
    return true;
  });
  
  if (cleaned.length !== queue.length) {
    await saveQueue(cleaned);
    console.log(`Cleaned up ${queue.length - cleaned.length} old failed submissions`);
  }
};
