
import { SubmissionEvent } from '../types/formTypes';

const LOG_STORAGE_KEY = 'mia_submission_logs';
const MAX_LOG_ENTRIES = 1000;
const LOG_RETENTION_DAYS = 7;

export class SubmissionEventLogger {
  private static instance: SubmissionEventLogger;

  static getInstance(): SubmissionEventLogger {
    if (!SubmissionEventLogger.instance) {
      SubmissionEventLogger.instance = new SubmissionEventLogger();
    }
    return SubmissionEventLogger.instance;
  }

  async logEvent(
    event: SubmissionEvent['event'],
    formId: string,
    status: SubmissionEvent['status'],
    message: string,
    metadata?: SubmissionEvent['metadata']
  ): Promise<void> {
    const logEntry: SubmissionEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event,
      formId,
      timestamp: new Date().toISOString(),
      status,
      message,
      metadata
    };

    try {
      const existingLogs = await this.getLogs();
      const updatedLogs = [logEntry, ...existingLogs].slice(0, MAX_LOG_ENTRIES);
      
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
      
      // Console log for immediate debugging
      const logLevel = status === 'error' ? 'error' : status === 'warning' ? 'warn' : 'info';
      console[logLevel](`[${event}] ${message}`, metadata);
    } catch (error) {
      console.error('Failed to log submission event:', error);
    }
  }

  async getLogs(): Promise<SubmissionEvent[]> {
    try {
      const logsJson = localStorage.getItem(LOG_STORAGE_KEY);
      if (!logsJson) return [];
      
      const logs = JSON.parse(logsJson) as SubmissionEvent[];
      return this.cleanupOldLogs(logs);
    } catch (error) {
      console.error('Failed to retrieve submission logs:', error);
      return [];
    }
  }

  async getLogsByFormId(formId: string): Promise<SubmissionEvent[]> {
    const allLogs = await this.getLogs();
    return allLogs.filter(log => log.formId === formId);
  }

  async getLogsByEvent(eventType: SubmissionEvent['event']): Promise<SubmissionEvent[]> {
    const allLogs = await this.getLogs();
    return allLogs.filter(log => log.event === eventType);
  }

  async clearLogs(): Promise<void> {
    try {
      localStorage.removeItem(LOG_STORAGE_KEY);
      console.info('Submission logs cleared');
    } catch (error) {
      console.error('Failed to clear submission logs:', error);
    }
  }

  async exportLogs(): Promise<string> {
    const logs = await this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  private cleanupOldLogs(logs: SubmissionEvent[]): SubmissionEvent[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);
    
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate > cutoffDate;
    });
    
    // Update storage if logs were cleaned up
    if (filteredLogs.length !== logs.length) {
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(filteredLogs));
      console.info(`Cleaned up ${logs.length - filteredLogs.length} old submission logs`);
    }
    
    return filteredLogs;
  }

  // Convenience methods for common log events
  async logSubmissionStart(formId: string, metadata?: any): Promise<void> {
    await this.logEvent('submit.started', formId, 'info', 'Form submission started', metadata);
  }

  async logSubmissionSuccess(formId: string, metadata?: any): Promise<void> {
    await this.logEvent('submit.success', formId, 'success', 'Form submitted successfully', metadata);
  }

  async logSubmissionFailed(formId: string, error: string, metadata?: any): Promise<void> {
    await this.logEvent('submit.failed', formId, 'error', `Form submission failed: ${error}`, metadata);
  }

  async logSubmissionQueued(formId: string, metadata?: any): Promise<void> {
    await this.logEvent('submit.queued', formId, 'info', 'Form queued for offline submission', metadata);
  }

  async logValidationFailed(formId: string, errors: string[], metadata?: any): Promise<void> {
    await this.logEvent('validation.failed', formId, 'warning', `Validation failed: ${errors.join(', ')}`, {
      ...metadata,
      validationErrors: errors
    });
  }

  async logSaveSuccess(formId: string, isDraft: boolean, metadata?: any): Promise<void> {
    await this.logEvent('save.success', formId, 'success', `${isDraft ? 'Draft' : 'Form'} saved successfully`, metadata);
  }

  async logSaveFailed(formId: string, error: string, metadata?: any): Promise<void> {
    await this.logEvent('save.failed', formId, 'error', `Save failed: ${error}`, metadata);
  }
}

// Export singleton instance
export const submissionLogger = SubmissionEventLogger.getInstance();
