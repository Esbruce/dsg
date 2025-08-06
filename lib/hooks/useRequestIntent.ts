import { useState, useCallback, useEffect } from 'react';

export interface NavigationIntent {
  type: 'navigate';
  path: string;
}

export interface ActionIntent<T = unknown> {
  type: 'action';
  name: string;
  payload?: T;
}

export type RequestIntentPayload = NavigationIntent | ActionIntent;

export interface FullRequestIntent {
  payload: RequestIntentPayload;
  timestamp: number;
}

const REQUEST_INTENT_KEY = 'dsg_request_intent';

export function useRequestIntent() {
  const [intent, setIntent] = useState<FullRequestIntent | null>(null);

  // Load intent from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REQUEST_INTENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FullRequestIntent;
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

  const setRequestIntent = useCallback((payload: RequestIntentPayload) => {
    const newIntent: FullRequestIntent = {
      payload,
      timestamp: Date.now(),
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
    intent,
    hasIntent: !!intent,
  };
}
