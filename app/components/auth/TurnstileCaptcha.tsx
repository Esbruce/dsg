'use client'

import React, { useEffect, useRef, useState } from 'react'

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
        }
      ) => string
      reset: (widgetId: string) => void
    }
  }
}

export default function TurnstileCaptcha({ 
  onVerify, 
  onError, 
  siteKey, 
  className = '' 
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string>('')
  const isRenderedRef = useRef<boolean>(false)
  const scriptLoadedRef = useRef<boolean>(false)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState<boolean>(false)

  useEffect(() => {
    console.log('🔍 TurnstileCaptcha: Component mounted')
    console.log('🔍 TurnstileCaptcha: Site key:', siteKey ? `${siteKey.substring(0, 10)}...` : 'NOT SET')
    setDebugInfo(`Site key: ${siteKey ? 'Set' : 'NOT SET'}`)
    
    // Prevent multiple renders
    if (isRenderedRef.current) {
      console.log('🔍 TurnstileCaptcha: Already rendered, skipping')
      setDebugInfo(prev => prev + ' | Already rendered')
      return
    }
    
    // Load Turnstile script if not already loaded
    if (!window.turnstile && !scriptLoadedRef.current) {
      console.log('🔍 TurnstileCaptcha: Loading Turnstile script...')
      setDebugInfo(prev => prev + ' | Loading script')
      
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        console.log('🔍 TurnstileCaptcha: Script loaded successfully')
        setDebugInfo(prev => prev + ' | Script loaded')
        scriptLoadedRef.current = true
        renderCaptcha()
      }
      
      script.onerror = () => {
        console.error('❌ TurnstileCaptcha: Failed to load script')
        setDebugInfo(prev => prev + ' | Script failed')
        onError('Failed to load CAPTCHA script')
      }
    } else if (window.turnstile) {
      console.log('🔍 TurnstileCaptcha: Script already loaded')
      setDebugInfo(prev => prev + ' | Script already loaded')
      renderCaptcha()
    }

    function renderCaptcha() {
      console.log('🔍 TurnstileCaptcha: Attempting to render...')
      setDebugInfo(prev => prev + ' | Attempting render')
      
      if (!containerRef.current) {
        console.error('❌ TurnstileCaptcha: Container ref not found')
        setDebugInfo(prev => prev + ' | No container')
        return
      }
      
      if (!window.turnstile) {
        console.error('❌ TurnstileCaptcha: Turnstile not available')
        setDebugInfo(prev => prev + ' | Turnstile not available')
        return
      }
      
      if (!siteKey) {
        console.error('❌ TurnstileCaptcha: No site key provided')
        setDebugInfo(prev => prev + ' | No site key')
        onError('CAPTCHA configuration error - no site key provided')
        return
      }

      // Check if widget already exists in this container
      if (containerRef.current.querySelector('[data-turnstile-widget]')) {
        console.log('🔍 TurnstileCaptcha: Widget already exists in container')
        setDebugInfo(prev => prev + ' | Widget exists')
        return
      }

      // Check if we're already verifying
      if (isVerifying) {
        console.log('🔍 TurnstileCaptcha: Already verifying, skipping render')
        setDebugInfo(prev => prev + ' | Already verifying')
        return
      }

      // Clear container first
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }

      try {
        console.log('🔍 TurnstileCaptcha: Rendering widget...')
        setDebugInfo(prev => prev + ' | Rendering')
        
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          size: 'normal',
          callback: (token: string) => {
            if (isVerifying) {
              console.log('🔍 TurnstileCaptcha: Already verifying, ignoring duplicate callback')
              return
            }
            console.log('✅ Turnstile CAPTCHA verified, token length:', token.length)
            setDebugInfo(prev => prev + ' | Verified')
            setIsVerifying(true)
            // Add a small delay to prevent race conditions
            setTimeout(() => {
              onVerify(token)
            }, 100)
          },
          'error-callback': () => {
            if (isVerifying) {
              console.log('🔍 TurnstileCaptcha: Already verifying, ignoring error callback')
              return
            }
            console.log('❌ Turnstile CAPTCHA error')
            setDebugInfo(prev => prev + ' | Error')
            setIsVerifying(true)
            // Add a small delay to prevent race conditions
            setTimeout(() => {
              onError('CAPTCHA verification failed. Please try again.')
            }, 100)
          },
          'expired-callback': () => {
            console.log('⏰ Turnstile CAPTCHA expired')
            setDebugInfo(prev => prev + ' | Expired')
            setIsVerifying(false) // Reset for retry
            onError('CAPTCHA expired. Please try again.')
          }
        })
        console.log('✅ TurnstileCaptcha: Widget rendered successfully, ID:', widgetIdRef.current)
        setDebugInfo(prev => prev + ' | Rendered')
        isRenderedRef.current = true
        
        // Mark container as having a widget
        if (containerRef.current) {
          containerRef.current.setAttribute('data-turnstile-widget', widgetIdRef.current)
        }
      } catch (error) {
        console.error('❌ Turnstile render error:', error)
        setDebugInfo(prev => prev + ' | Render failed')
        onError('Failed to load CAPTCHA. Please refresh the page.')
      }
    }

    // Cleanup function
    return () => {
      console.log('🔍 TurnstileCaptcha: Cleaning up...')
      // Don't reset if we're currently verifying
      if (widgetIdRef.current && window.turnstile && !isVerifying) {
        try {
          window.turnstile.reset(widgetIdRef.current)
          console.log('✅ TurnstileCaptcha: Widget reset successfully')
        } catch (error) {
          console.error('Error resetting Turnstile:', error)
        }
      }
      isRenderedRef.current = false
      widgetIdRef.current = ''
      setIsVerifying(false)
    }
  }, [siteKey, onVerify, onError]) // Added all dependencies

  return (
    <div className={className}>
      <div 
        ref={containerRef} 
        className="turnstile-container"
        data-testid="turnstile-captcha"
      />
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500">
          Debug: {debugInfo}
        </div>
      )}
    </div>
  )
} 