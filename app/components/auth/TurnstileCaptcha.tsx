'use client'

import React, { useEffect, useRef } from 'react'

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
      ) => string // Changed from void to string - returns widget ID
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

  useEffect(() => {
    console.log('🔍 TurnstileCaptcha: Component mounted')
    console.log('🔍 TurnstileCaptcha: Site key:', siteKey ? `${siteKey.substring(0, 10)}...` : 'NOT SET')
    
    // Prevent multiple renders
    if (isRenderedRef.current) {
      console.log('🔍 TurnstileCaptcha: Already rendered, skipping')
      return
    }
    
    // Load Turnstile script if not already loaded
    if (!window.turnstile && !scriptLoadedRef.current) {
      console.log('🔍 TurnstileCaptcha: Loading Turnstile script...')
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        console.log('🔍 TurnstileCaptcha: Script loaded successfully')
        scriptLoadedRef.current = true
        renderCaptcha()
      }
      
      script.onerror = () => {
        console.error('❌ TurnstileCaptcha: Failed to load script')
        onError('Failed to load CAPTCHA script')
      }
    } else if (window.turnstile) {
      console.log('🔍 TurnstileCaptcha: Script already loaded')
      renderCaptcha()
    }

    function renderCaptcha() {
      console.log('🔍 TurnstileCaptcha: Attempting to render...')
      if (!containerRef.current) {
        console.error('❌ TurnstileCaptcha: Container ref not found')
        return
      }
      
      if (!window.turnstile) {
        console.error('❌ TurnstileCaptcha: Turnstile not available')
        return
      }
      
      if (!siteKey) {
        console.error('❌ TurnstileCaptcha: No site key provided')
        onError('CAPTCHA configuration error')
        return
      }

      // Check if widget already exists in this container
      if (containerRef.current.querySelector('[data-turnstile-widget]')) {
        console.log('🔍 TurnstileCaptcha: Widget already exists in container')
        return
      }

      // Clear container first
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }

      try {
        console.log('🔍 TurnstileCaptcha: Rendering widget...')
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light', // Light theme for better visibility
          size: 'normal', // Normal size checkbox
          callback: (token: string) => {
            console.log('✅ Turnstile CAPTCHA verified')
            onVerify(token)
          },
          'error-callback': () => {
            console.log('❌ Turnstile CAPTCHA error')
            onError('CAPTCHA verification failed. Please try again.')
          },
          'expired-callback': () => {
            console.log('⏰ Turnstile CAPTCHA expired')
            onError('CAPTCHA expired. Please try again.')
          }
        })
        console.log('✅ TurnstileCaptcha: Widget rendered successfully, ID:', widgetIdRef.current)
        isRenderedRef.current = true
        
        // Mark container as having a widget
        if (containerRef.current) {
          containerRef.current.setAttribute('data-turnstile-widget', widgetIdRef.current)
        }
      } catch (error) {
        console.error('❌ Turnstile render error:', error)
        onError('Failed to load CAPTCHA. Please refresh the page.')
      }
    }

    // Cleanup function
    return () => {
      console.log('🔍 TurnstileCaptcha: Cleaning up...')
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
          console.log('✅ TurnstileCaptcha: Widget reset successfully')
        } catch (error) {
          console.error('Error resetting Turnstile:', error)
        }
      }
      isRenderedRef.current = false
      widgetIdRef.current = ''
    }
  }, []) // Empty dependency array to prevent infinite loops

  return (
    <div 
      ref={containerRef} 
      className={`turnstile-container ${className}`}
      data-testid="turnstile-captcha"
    />
  )
} 