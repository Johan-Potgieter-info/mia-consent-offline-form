
import { useState, useEffect } from 'react';
import { getCurrentConnectivity, checkServerConnectivity } from '../utils/connectivity';

export const useConnectivity = () => {
  const [isOnline, setIsOnline] = useState(getCurrentConnectivity());

  useEffect(() => {
    const handleOnline = async () => {
      console.log('Browser came online, checking server connectivity...');
      const actuallyOnline = await checkServerConnectivity();
      setIsOnline(actuallyOnline);
    };
    
    const handleOffline = () => {
      console.log('Browser went offline');      
      setIsOnline(false);
    };

    // Initial connectivity check
    checkServerConnectivity().then(setIsOnline);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};
