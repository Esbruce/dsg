'use client'

import React, {
  useEffect,
  useRef,
  useState
} from 'react'

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void
  onError: (error: string) => void
  siteKey: string
  className?: string
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
        }
      ) => string
      remove: (widgetId: string) => void
    }
    onTurnstileLoaded?: () => void
  }
}

// --- Singleton Script Loader ---
let scriptLoadPromise: Promise<void> | null = null;

const loadTurnstileScript = (): Promise<void> => {
    if (window.turnstile) {
        return Promise.resolve();
    }
    if (scriptLoadPromise) {
        return scriptLoadPromise;
    }
    scriptLoadPromise = new Promise((resolve, reject) => {
        window.onTurnstileLoaded = () => {
            console.log('✅ TurnstileCaptcha: Script loaded successfully.');
            resolve();
            delete window.onTurnstileLoaded;
        };
        
        if (document.getElementById('turnstile-script')) {
            console.log("🔍 TurnstileCaptcha: Script tag already exists, waiting for load.");
            return;
        }

        console.log('🔍 TurnstileCaptcha: Loading Turnstile script...');
        const script = document.createElement('script');
        script.id = 'turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoaded';
        script.async = true;
        script.defer = true;
        script.onerror = (error) => {
            console.error('❌ TurnstileCaptcha: Failed to load script', error);
            scriptLoadPromise = null;
            reject(new Error('Failed to load CAPTCHA script'));
        };
        document.head.appendChild(script);
    });
    return scriptLoadPromise;
}

const TurnstileCaptcha = ({ 
  onVerify, 
  onError, 
  siteKey, 
  className = ''
}: TurnstileCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let widgetId: string | null = null;
    
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
        
        console.log('🔍 TurnstileCaptcha: Rendering widget...');
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          appearance: 'always', // This makes the widget interactive
          callback: (token: string) => {
            console.log('✅ Turnstile CAPTCHA verified');
            onVerify(token);
          },
          'error-callback': () => {
            console.log('❌ Turnstile CAPTCHA error');
            if(isMounted) {
                setHasError(true);
                onError('CAPTCHA verification failed.');
            }
          },
          'expired-callback': () => {
            console.log('⏰ Turnstile CAPTCHA expired');
            if(isMounted) {
                setHasError(true);
                onError('CAPTCHA expired.');
            }
          }
        });

        if (isMounted) {
            setIsLoading(false);
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
      if (widgetId && window.turnstile) {
        console.log(`🔍 TurnstileCaptcha: Cleaning up and removing widget ${widgetId}`);
        window.turnstile.remove(widgetId);
      }
    }
  }, [siteKey, onVerify, onError]);

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
};

export default TurnstileCaptcha;
