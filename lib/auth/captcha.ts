export interface CaptchaResult {
  success: boolean
  error?: string
  score?: number
}

export class CaptchaService {
  private readonly secretKey: string | undefined
  private readonly threshold: number
  private readonly timeout: number

  constructor() {
    this.secretKey = process.env.TURNSTILE_SECRET_KEY
    this.threshold = parseFloat(process.env.TURNSTILE_THRESHOLD || '0.5')
    this.timeout = parseInt(process.env.TURNSTILE_TIMEOUT || '10000') // 10 seconds default
  }

  /**
   * Check if CAPTCHA is properly configured
   */
  isConfigured(): boolean {
    return !!this.secretKey
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus(): {
    configured: boolean
    hasSecretKey: boolean
    threshold: number
    timeout: number
  } {
    return {
      configured: this.isConfigured(),
      hasSecretKey: !!this.secretKey,
      threshold: this.threshold,
      timeout: this.timeout
    }
  }

  /**
   * Verify Cloudflare Turnstile token
   */
  async verifyToken(token: string, ipAddress?: string): Promise<CaptchaResult> {
    try {
      // Development mode bypass for testing
      if (process.env.NODE_ENV === 'development' && token === 'dev-skip-token') {
        console.log('🔧 Development mode: Bypassing CAPTCHA verification');
        return { success: true, score: 1.0 };
      }

      // Check if CAPTCHA is configured
      if (!this.secretKey) {
        console.warn('⚠️ TURNSTILE_SECRET_KEY not configured, skipping CAPTCHA verification')
        return { success: true, score: 1.0 } // Allow request to proceed
      }

      if (!token) {
        console.error('❌ No CAPTCHA token provided')
        return { success: false, error: 'No CAPTCHA token provided' }
      }

      // Validate token format (basic check)
      if (token.length < 10) {
        console.error('❌ Invalid CAPTCHA token format')
        return { success: false, error: 'Invalid CAPTCHA token format' }
      }

      // Prepare verification request
      const formData = new URLSearchParams()
      formData.append('secret', this.secretKey)
      formData.append('response', token)
      if (ipAddress) {
        formData.append('remoteip', ipAddress)
      }

      console.log('🔒 Verifying CAPTCHA token with Cloudflare...')

      // Verify with Cloudflare with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout) // Use class timeout

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('❌ CAPTCHA verification request failed:', response.status, response.statusText)
        return { 
          success: false, 
          error: `CAPTCHA verification request failed: ${response.status}`
        }
      }

      const result = await response.json()

      if (!result.success) {
        console.log('❌ CAPTCHA verification failed:', result)
        return { 
          success: false, 
          error: 'CAPTCHA verification failed',
          score: result.score || 0
        }
      }

      // Check score threshold (if score is provided)
      if (result.score !== undefined && result.score < this.threshold) {
        console.log('❌ CAPTCHA score too low:', result.score, '<', this.threshold)
        return { 
          success: false, 
          error: 'CAPTCHA score too low',
          score: result.score
        }
      }

      console.log('✅ CAPTCHA verification successful, score:', result.score)
      return { 
        success: true, 
        score: result.score || 1.0
      }

    } catch (error) {
      console.error('❌ CAPTCHA verification error:', error)
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { 
            success: false, 
            error: 'CAPTCHA verification timeout'
          }
        }
        return { 
          success: false, 
          error: `CAPTCHA verification error: ${error.message}`
        }
      }
      
      return { 
        success: false, 
        error: 'CAPTCHA verification error'
      }
    }
  }

  /**
   * Check if CAPTCHA is required based on risk factors
   */
  shouldRequireCaptcha(riskFactors: {
    ipAddress: string
    requestCount: number
    failedAttempts: number
  }): boolean {
    // If CAPTCHA is not configured, don't require it
    if (!this.secretKey) {
      return false
    }

    // Simple risk assessment for minimal implementation
    const { requestCount, failedAttempts } = riskFactors
    
    // Require CAPTCHA if:
    // - More than 3 requests in last hour
    // - More than 2 failed attempts
    return requestCount > 3 || failedAttempts > 2
  }
}

// Export singleton instance
export const captchaService = new CaptchaService() 