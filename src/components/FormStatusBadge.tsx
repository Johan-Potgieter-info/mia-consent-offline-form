
import React from 'react';
import { Badge } from './ui/badge';
import { Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';

interface FormStatusBadgeProps {
  status: 'draft' | 'pending' | 'submitted' | 'synced';
  isSubmitting?: boolean;
}

const FormStatusBadge: React.FC<FormStatusBadgeProps> = ({ status, isSubmitting = false }) => {
  if (isSubmitting) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
        <Upload className="w-3 h-3 mr-1 animate-spin" />
        Submitting...
      </Badge>
    );
  }

  switch (status) {
    case 'draft':
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          Draft
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending Sync
        </Badge>
      );
    case 'submitted':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Submitted
        </Badge>
      );
    case 'synced':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Synced
        </Badge>
      );
    default:
      return null;
  }
};

export default FormStatusBadge;
