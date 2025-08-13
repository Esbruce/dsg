'use client'

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react'

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void
  onError: (error: string) => void
  siteKey: string
  className?: string
  size?: 'invisible' | 'normal' | 'compact' | 'flexible'
  action?: string
  theme?: 'light' | 'dark' | 'auto'
}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'error-callback': () => void
          'expired-callback': () => void
          theme?: string
          size?: string
          'refresh-expired'?: string
          'appearance'?: string
          action?: string
        }
      ) => string
      remove: (widgetId: string) => void
      execute: (widgetId: string) => void
      reset: (widgetId?: string) => void
    }
    onTurnstileLoaded?: () => void
  }
}

// Minimal singleton script loader (default CF script, no globals)
let scriptLoadPromise: Promise<void> | null = null;

const loadTurnstileScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('turnstile-script') as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load CAPTCHA script')), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Failed to load CAPTCHA script'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

const TurnstileCaptcha = forwardRef<{ execute: () => void; reset: () => void }, TurnstileCaptchaProps>(({ 
  onVerify, 
  onError, 
  siteKey, 
  className = '',
  size = 'normal',
  action,
  theme = 'light'
}: TurnstileCaptchaProps, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const widgetIdRef = useRef<string | null>(null);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleVerify = useCallback((token: string) => {
    console.log('✅ Turnstile CAPTCHA verified');
    onVerify(token);
  }, [onVerify]);

  const handleError = useCallback(() => {
    console.log('❌ Turnstile CAPTCHA error');
    setHasError(true);
    onError('CAPTCHA verification failed.');
  }, [onError]);

  const handleExpired = useCallback(() => {
    console.log('⏰ Turnstile CAPTCHA expired');
    setHasError(true);
    onError('CAPTCHA expired.');
  }, [onError]);

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      if (!siteKey) {
        if (isMounted) {
            setIsLoading(false);
            onError('CAPTCHA error: Missing site key.');
        }
        return;
      }

      try {
        await loadTurnstileScript();
        if (!isMounted || !containerRef.current) return;
        
        // Clean up existing widget if it exists
        if (widgetIdRef.current && window.turnstile) {
          console.log(`🔍 TurnstileCaptcha: Cleaning up existing widget ${widgetIdRef.current}`);
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
        
        console.log('🔍 TurnstileCaptcha: Rendering widget...');
        const appearance = size === 'invisible' ? 'interaction-only' : 'always';
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          appearance,
          action,
          callback: handleVerify,
          'error-callback': handleError,
          'expired-callback': handleExpired
        });

        if (isMounted) {
            setIsLoading(false);
            setHasError(false);
        }
      } catch (error) {
        console.error('❌ TurnstileCaptcha initialization error:', error);
        if (isMounted) {
            setIsLoading(false);
            onError(`Failed to load CAPTCHA.`);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        console.log(`🔍 TurnstileCaptcha: Cleaning up and removing widget ${widgetIdRef.current}`);
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    }
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    execute: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.execute(widgetIdRef.current)
        } catch (e) {
          console.error('❌ Turnstile execute error:', e)
          onError('CAPTCHA execution failed.')
        }
      } else {
        onError('CAPTCHA not ready.')
      }
    },
    reset: () => {
      if (window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current || undefined)
        } catch (e) {
          console.error('❌ Turnstile reset error:', e)
        }
      }
    }
  }))

  return (
    <div className={className}>
      <div 
        ref={containerRef} 
        className="turnstile-container"
        data-testid="turnstile-captcha"
      />
      
      {isLoading && (
        <div className="mt-2 text-sm text-gray-500" role="status">
          Loading security check...
        </div>
      )}
      
      {hasError && !isLoading && (
        <div className="mt-2 text-sm text-red-600" role="alert">
          <p>Security check failed.</p>
        </div>
      )}
    </div>
  )
});

export default TurnstileCaptcha;
