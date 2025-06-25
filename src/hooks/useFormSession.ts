
import { useState, useEffect } from 'react';

export const useFormSession = () => {
  const [sessionId, setSessionId] = useState<string>(() => {
    return localStorage.getItem('formSessionId') || `session-${Date.now()}`;
  });

  useEffect(() => {
    localStorage.setItem('formSessionId', sessionId);
  }, [sessionId]);

  const clearSession = () => {
    localStorage.removeItem('formSessionId');
    setSessionId(`session-${Date.now()}`);
  };

  return { sessionId, clearSession };
};
