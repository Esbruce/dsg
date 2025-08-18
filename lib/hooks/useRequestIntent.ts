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

  // Load intent from sessionStorage (preferred) or localStorage with a short TTL
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(REQUEST_INTENT_KEY) || localStorage.getItem(REQUEST_INTENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FullRequestIntent;
        // Only use intent if it's less than 5 minutes old
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          setIntent(parsed);
        } else {
          sessionStorage.removeItem(REQUEST_INTENT_KEY);
          localStorage.removeItem(REQUEST_INTENT_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading request intent:', error);
      sessionStorage.removeItem(REQUEST_INTENT_KEY);
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
      // Prefer sessionStorage for shorter-lived and tab-scoped persistence
      sessionStorage.setItem(REQUEST_INTENT_KEY, JSON.stringify(newIntent));
      // Ensure any legacy copy in localStorage is removed
      localStorage.removeItem(REQUEST_INTENT_KEY);
    } catch (error) {
      console.error('Error saving request intent:', error);
    }
  }, []);

  const clearRequestIntent = useCallback(() => {
    setIntent(null);
    try {
      sessionStorage.removeItem(REQUEST_INTENT_KEY);
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
