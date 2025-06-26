
import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Trash2, AlertTriangle, Timer, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { QueuedSubmission } from '../../utils/submissionQueue';

interface EnhancedPendingSubmissionsListProps {
  pendingSubmissions: QueuedSubmission[];
  onRetrySubmission: (id: string) => void;
  onDeleteSubmission: (id: string) => void;
  onForceRetry: (id: string) => void;
  isLoading: boolean;
}

const EnhancedPendingSubmissionsList = ({
  pendingSubmissions,
  onRetrySubmission,
  onDeleteSubmission,
  onForceRetry,
  isLoading
}: EnhancedPendingSubmissionsListProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (submission: QueuedSubmission) => {
    if (submission.submissionStatus === 'failed') return 'destructive';
    if (submission.retryCount >= submission.maxRetries) return 'destructive';
    if (submission.submissionStatus === 'retrying') return 'secondary';
    if (isReadyForRetry(submission)) return 'default';
    return 'outline';
  };

  const getStatusText = (submission: QueuedSubmission) => {
    if (submission.submissionStatus === 'failed') return 'Failed';
    if (submission.retryCount >= submission.maxRetries) return 'Max retries exceeded';
    if (submission.submissionStatus === 'retrying') return 'Retrying...';
    if (isReadyForRetry(submission)) return 'Ready to retry';
    return 'Pending';
  };

  const formatTimeLeft = (nextRetry: string) => {
    const now = currentTime;
    const retryTime = new Date(nextRetry);
    const diff = retryTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ready now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const isReadyForRetry = (submission: QueuedSubmission) => {
    if (submission.submissionStatus === 'failed') return false;
    if (submission.retryCount >= submission.maxRetries) return false;
    return new Date(submission.nextRetry) <= currentTime;
  };

  const getRetryProgress = (submission: QueuedSubmission) => {
    return (submission.retryCount / submission.maxRetries) * 100;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Enhanced Pending Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <p className="text-gray-500">Loading pending submissions...</p>
          </div>
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
            Enhanced Pending Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Timer className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No pending submissions</p>
            <p className="text-sm text-gray-400">All submissions are up to date</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stuckSubmissions = pendingSubmissions.filter(s => 
    s.submissionStatus === 'failed' || s.retryCount >= s.maxRetries
  );

  const readySubmissions = pendingSubmissions.filter(isReadyForRetry);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Enhanced Pending Submissions ({pendingSubmissions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Alerts */}
        {readySubmissions.length > 0 && (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              {readySubmissions.length} submission{readySubmissions.length > 1 ? 's are' : ' is'} ready for retry.
            </AlertDescription>
          </Alert>
        )}

        {stuckSubmissions.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {stuckSubmissions.length} submission{stuckSubmissions.length > 1 ? 's' : ''} failed permanently. 
              Consider deleting them to clean up your queue.
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Submission Items */}
        <div className="space-y-3">
          {pendingSubmissions.map((submission) => (
            <div key={submission.id} className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
              {/* Header with Status */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">
                      {submission.data.patientName || 'Unknown Patient'}
                    </h4>
                    <Badge variant={getStatusColor(submission)} className="text-xs">
                      {getStatusText(submission)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(submission.createdAt).toLocaleString()}
                  </p>
                  {submission.lastAttempt && (
                    <p className="text-sm text-gray-500">
                      Last attempt: {new Date(submission.lastAttempt).toLocaleString()}
                    </p>
                  )}
                </div>
                
                {/* Retry Counter Badge */}
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={submission.retryCount >= submission.maxRetries ? 'destructive' : 'outline'}
                    className="font-mono"
                  >
                    {submission.retryCount}/{submission.maxRetries}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Retry Progress</span>
                  <span>{Math.round(getRetryProgress(submission))}%</span>
                </div>
                <Progress 
                  value={getRetryProgress(submission)} 
                  className="h-2"
                />
              </div>

              {/* Countdown Timer */}
              {submission.submissionStatus !== 'failed' && submission.retryCount < submission.maxRetries && (
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">Next retry:</span>
                  </div>
                  <span className={`font-mono text-sm font-bold ${
                    isReadyForRetry(submission) 
                      ? 'text-green-600 animate-pulse' 
                      : 'text-blue-600'
                  }`}>
                    {formatTimeLeft(submission.nextRetry)}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {(submission.submissionStatus === 'failed' || submission.retryCount >= submission.maxRetries) ? (
                  <Button
                    onClick={() => onDeleteSubmission(submission.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => onRetrySubmission(submission.id)}
                      variant="outline"
                      size="sm"
                      disabled={submission.submissionStatus === 'retrying'}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${
                        submission.submissionStatus === 'retrying' ? 'animate-spin' : ''
                      }`} />
                      {submission.submissionStatus === 'retrying' ? 'Retrying...' : 'Retry Now'}
                    </Button>
                    
                    <Button
                      onClick={() => onForceRetry(submission.id)}
                      variant="default"
                      size="sm"
                      disabled={submission.submissionStatus === 'retrying'}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Force Retry
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPendingSubmissionsList;
