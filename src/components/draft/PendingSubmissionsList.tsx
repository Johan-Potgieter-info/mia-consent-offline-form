
import React from 'react';
import { Clock, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { QueuedSubmission } from '../../utils/submissionQueue';

interface PendingSubmissionsListProps {
  pendingSubmissions: QueuedSubmission[];
  onRetrySubmission: (id: string) => void;
  onDeleteSubmission: (id: string) => void;
  isLoading: boolean;
}

const PendingSubmissionsList = ({
  pendingSubmissions,
  onRetrySubmission,
  onDeleteSubmission,
  isLoading
}: PendingSubmissionsListProps) => {
  const getStatusColor = (submission: QueuedSubmission) => {
    if (submission.submissionStatus === 'failed') return 'destructive';
    if (submission.retryCount >= submission.maxRetries) return 'destructive';
    if (submission.submissionStatus === 'retrying') return 'secondary';
    return 'default';
  };

  const getStatusText = (submission: QueuedSubmission) => {
    if (submission.submissionStatus === 'failed') return 'Failed';
    if (submission.retryCount >= submission.maxRetries) return 'Max retries exceeded';
    if (submission.submissionStatus === 'retrying') return `Retrying (${submission.retryCount}/${submission.maxRetries})`;
    return 'Pending';
  };

  const formatTimeLeft = (nextRetry: string) => {
    const now = new Date();
    const retryTime = new Date(nextRetry);
    const diff = retryTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ready to retry';
    
    const minutes = Math.ceil(diff / (1000 * 60));
    if (minutes < 60) return `Retry in ${minutes}m`;
    
    const hours = Math.ceil(minutes / 60);
    return `Retry in ${hours}h`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading pending submissions...</p>
        </CardContent>
      </Card>
    );
  }

  if (pendingSubmissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No pending submissions</p>
        </CardContent>
      </Card>
    );
  }

  const stuckSubmissions = pendingSubmissions.filter(s => 
    s.submissionStatus === 'failed' || s.retryCount >= s.maxRetries
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pending Submissions ({pendingSubmissions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stuckSubmissions.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {stuckSubmissions.length} submission{stuckSubmissions.length > 1 ? 's' : ''} failed permanently. 
              Consider deleting them to clean up your queue.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {pendingSubmissions.map((submission) => (
            <div key={submission.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {submission.data.patientName || 'Unknown Patient'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(submission.createdAt).toLocaleString()}
                  </p>
                  {submission.lastAttempt && (
                    <p className="text-sm text-gray-500">
                      Last attempt: {new Date(submission.lastAttempt).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(submission)}>
                    {getStatusText(submission)}
                  </Badge>
                </div>
              </div>

              {submission.submissionStatus !== 'failed' && submission.retryCount < submission.maxRetries && (
                <div className="text-sm text-blue-600">
                  {formatTimeLeft(submission.nextRetry)}
                </div>
              )}

              <div className="flex gap-2">
                {(submission.submissionStatus === 'failed' || submission.retryCount >= submission.maxRetries) ? (
                  <Button
                    onClick={() => onDeleteSubmission(submission.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                ) : (
                  <Button
                    onClick={() => onRetrySubmission(submission.id)}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingSubmissionsList;
