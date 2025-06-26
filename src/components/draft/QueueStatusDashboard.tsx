
import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertTriangle, CheckCircle, XCircle, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { QueuedSubmission } from '../../utils/submissionQueue';

interface QueueStatusDashboardProps {
  queuedSubmissions: QueuedSubmission[];
  isLoading: boolean;
  onForceRetry: (id: string) => void;
  onClearFailedSubmissions: () => void;
  onRefresh: () => void;
}

const QueueStatusDashboard = ({
  queuedSubmissions,
  isLoading,
  onForceRetry,
  onClearFailedSubmissions,
  onRefresh
}: QueueStatusDashboardProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for accurate countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getQueueStats = () => {
    const pending = queuedSubmissions.filter(s => s.submissionStatus === 'pending').length;
    const retrying = queuedSubmissions.filter(s => s.submissionStatus === 'retrying').length;
    const failed = queuedSubmissions.filter(s => s.submissionStatus === 'failed' || s.retryCount >= s.maxRetries).length;
    const total = queuedSubmissions.length;

    return { pending, retrying, failed, total };
  };

  const getNextRetryCountdown = (submission: QueuedSubmission): string => {
    if (submission.submissionStatus === 'failed' || submission.retryCount >= submission.maxRetries) {
      return 'Failed';
    }

    const nextRetry = new Date(submission.nextRetry);
    const diff = nextRetry.getTime() - currentTime.getTime();

    if (diff <= 0) {
      return 'Ready';
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getRetryProgress = (submission: QueuedSubmission): number => {
    return (submission.retryCount / submission.maxRetries) * 100;
  };

  const getStatusIcon = (submission: QueuedSubmission) => {
    if (submission.submissionStatus === 'failed' || submission.retryCount >= submission.maxRetries) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (submission.submissionStatus === 'retrying') {
      return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
    if (getNextRetryCountdown(submission) === 'Ready') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  const stats = getQueueStats();
  const readyForRetry = queuedSubmissions.filter(s => 
    s.submissionStatus !== 'failed' && 
    s.retryCount < s.maxRetries && 
    new Date(s.nextRetry) <= currentTime
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading queue status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Queue Status Dashboard
          </CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Queue Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <div className="text-sm text-blue-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.retrying}</div>
            <div className="text-sm text-yellow-600">Retrying</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Ready for Retry Alert */}
        {readyForRetry.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {readyForRetry.length} submission{readyForRetry.length > 1 ? 's are' : ' is'} ready for retry.
            </AlertDescription>
          </Alert>
        )}

        {/* Failed Submissions Alert */}
        {stats.failed > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              <span>{stats.failed} submission{stats.failed > 1 ? 's have' : ' has'} permanently failed.</span>
              <Button 
                onClick={onClearFailedSubmissions}
                variant="outline" 
                size="sm"
                className="ml-2"
              >
                Clear Failed
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Queue Items */}
        {queuedSubmissions.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Queue Details</h4>
            {queuedSubmissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission)}
                    <div>
                      <h5 className="font-medium text-sm">
                        {submission.data.patientName || 'Unknown Patient'}
                      </h5>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={submission.submissionStatus === 'failed' || submission.retryCount >= submission.maxRetries ? 'destructive' : 'secondary'}
                    >
                      {submission.retryCount}/{submission.maxRetries}
                    </Badge>
                    
                    {submission.submissionStatus !== 'failed' && submission.retryCount < submission.maxRetries && (
                      <Button
                        onClick={() => onForceRetry(submission.id)}
                        variant="outline"
                        size="sm"
                        disabled={submission.submissionStatus === 'retrying'}
                      >
                        {submission.submissionStatus === 'retrying' ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          'Force Retry'
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Retry Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Retry Progress</span>
                    <span>{Math.round(getRetryProgress(submission))}%</span>
                  </div>
                  <Progress value={getRetryProgress(submission)} className="h-2" />
                </div>

                {/* Next Retry Countdown */}
                {submission.submissionStatus !== 'failed' && submission.retryCount < submission.maxRetries && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Next retry:</span>
                    <span className={`font-mono ${
                      getNextRetryCountdown(submission) === 'Ready' 
                        ? 'text-green-600 font-bold' 
                        : 'text-blue-600'
                    }`}>
                      {getNextRetryCountdown(submission)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Timer className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No items in submission queue</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueStatusDashboard;
