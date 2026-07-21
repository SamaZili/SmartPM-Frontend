import { useState, useEffect, useCallback } from 'react';

export function useTemporaryMessage() {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');

  const showMessage = useCallback((msg: string, duration = 3000, messageType: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setType(messageType);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer); // Cleanup pour éviter les fuites mémoire
  }, [message]);

  return { message, type, showMessage, clearMessage };
}