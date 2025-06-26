
import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, RefreshCw, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { submissionLogger } from '../../utils/submissionEventLogger';
import { SubmissionEvent } from '../../types/formTypes';

interface SubmissionLogsViewerProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const SubmissionLogsViewer = ({ isVisible = false, onClose }: SubmissionLogsViewerProps) => {
  const [logs, setLogs] = useState<SubmissionEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SubmissionEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const logEntries = await submissionLogger.getLogs();
      setLogs(logEntries);
      setFilteredLogs(logEntries);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadLogs();
    }
  }, [isVisible]);

  useEffect(() => {
    let filtered = logs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (eventFilter !== 'all') {
      filtered = filtered.filter(log => log.event === eventFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, statusFilter, eventFilter]);

  const handleExportLogs = async () => {
    try {
      const exportData = await submissionLogger.exportLogs();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submission-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all submission logs? This action cannot be undone.')) {
      try {
        await submissionLogger.clearLogs();
        setLogs([]);
        setFilteredLogs([]);
      } catch (error) {
        console.error('Failed to clear logs:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submission Logs ({filteredLogs.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={loadLogs} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExportLogs} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button onClick={handleClearLogs} variant="outline" size="sm" className="text-red-600">
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="submit.started">Submit Started</SelectItem>
              <SelectItem value="submit.success">Submit Success</SelectItem>
              <SelectItem value="submit.failed">Submit Failed</SelectItem>
              <SelectItem value="submit.queued">Submit Queued</SelectItem>
              <SelectItem value="validation.failed">Validation Failed</SelectItem>
              <SelectItem value="save.success">Save Success</SelectItem>
              <SelectItem value="save.failed">Save Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredLogs.length === 0 ? (
          <Alert>
            <AlertDescription>
              {loading ? 'Loading logs...' : 'No submission logs found.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                    <span className="font-mono text-sm text-gray-600">{log.event}</span>
                    {log.formId && (
                      <span className="text-xs text-gray-500">Form: {log.formId}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{log.message}</p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600">Metadata</summary>
                    <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubmissionLogsViewer;
