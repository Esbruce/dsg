import { useState, useCallback, useEffect } from 'react';

interface RequestIntent {
  path: string;
  timestamp: number;
}

const REQUEST_INTENT_KEY = 'dsg_request_intent';

export function useRequestIntent() {
  const [intent, setIntent] = useState<RequestIntent | null>(null);

  // Load intent from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REQUEST_INTENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only use intent if it's less than 1 hour old
        if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
          setIntent(parsed);
        } else {
          localStorage.removeItem(REQUEST_INTENT_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading request intent:', error);
      localStorage.removeItem(REQUEST_INTENT_KEY);
    }
  }, []);

  const setRequestIntent = useCallback((path: string) => {
    const newIntent: RequestIntent = {
      path,
      timestamp: Date.now()
    };
    setIntent(newIntent);
    try {
      localStorage.setItem(REQUEST_INTENT_KEY, JSON.stringify(newIntent));
    } catch (error) {
      console.error('Error saving request intent:', error);
    }
  }, []);

  const clearRequestIntent = useCallback(() => {
    setIntent(null);
    try {
      localStorage.removeItem(REQUEST_INTENT_KEY);
    } catch (error) {
      console.error('Error clearing request intent:', error);
    }
  }, []);

  const getRequestIntent = useCallback(() => {
    return intent;
  }, [intent]);

  return {
    setRequestIntent,
    clearRequestIntent,
    getRequestIntent,
    hasIntent: !!intent
  };
} 