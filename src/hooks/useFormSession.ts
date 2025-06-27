
import { useState, useEffect } from 'react';

// Browser API guards
const hasLocalStorage = typeof localStorage !== 'undefined';

export const useFormSession = () => {
  const [sessionId, setSessionId] = useState<string>(() => {
    if (!hasLocalStorage) return `session-${Date.now()}`;
    return localStorage.getItem('formSessionId') || `session-${Date.now()}`;
  });

  useEffect(() => {
    if (hasLocalStorage) {
      localStorage.setItem('formSessionId', sessionId);
    }
  }, [sessionId]);

  const clearSession = () => {
    if (hasLocalStorage) {
      localStorage.removeItem('formSessionId');
    }
    setSessionId(`session-${Date.now()}`);
  };

  return { sessionId, clearSession };
};
