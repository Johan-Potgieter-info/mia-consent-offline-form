
import React, { useEffect } from 'react';
import { Cloud, HardDrive, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface SaveConfirmationProps {
  show: boolean;
  message: string;
  duration?: number;
  isOnline?: boolean;
}

const SaveConfirmation = ({ 
  show, 
  message, 
  duration = 3000, 
  isOnline = false
}: SaveConfirmationProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (show) {
      const getToastMessage = () => {
        return isOnline ? "Draft saved to cloud" : "Draft saved locally";
      };

      const getDescription = () => {
        return isOnline 
          ? "Your draft has been saved to the cloud database" 
          : "Your draft has been saved locally and will sync when online";
      };

      toast({
        title: getToastMessage(),
        description: getDescription(),
        duration: duration,
      });
    }
  }, [show, message, duration, isOnline, toast]);

  if (!show) return null;

  const getIcon = () => {
    return isOnline ? <Cloud className="w-6 h-6 text-green-600" /> : <HardDrive className="w-6 h-6 text-blue-600" />;
  };

  const getBgColor = () => {
    return isOnline ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200';
  };

  const getTextColor = () => {
    return isOnline ? 'text-green-900' : 'text-blue-900';
  };

  const getSecondaryColor = () => {
    return isOnline ? 'text-green-700' : 'text-blue-700';
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${getBgColor()} rounded-lg p-4 shadow-lg border-2 animate-fade-in`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className={`font-semibold ${getTextColor()}`}>
              Draft Saved Successfully
            </p>
          </div>
          <p className={`text-sm mt-1 ${getSecondaryColor()}`}>
            {isOnline ? 'Saved to cloud database' : 'Saved locally - will sync when online'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaveConfirmation;
