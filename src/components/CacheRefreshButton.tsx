
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface CacheRefreshButtonProps {
  onRefresh: () => void;
  size?: 'sm' | 'default' | 'lg';
}

const CacheRefreshButton = ({ onRefresh, size = 'default' }: CacheRefreshButtonProps) => {
  return (
    <Button onClick={onRefresh} variant="outline" size={size}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Refresh
    </Button>
  );
};

export default CacheRefreshButton;
