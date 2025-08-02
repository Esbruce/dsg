export interface CaptchaResult {
  success: boolean
  error?: string
  score?: number
}

export class CaptchaService {
  private readonly secretKey: string
  private readonly threshold: number

  constructor() {
    this.secretKey = process.env.TURNSTILE_SECRET_KEY!
    this.threshold = parseFloat(process.env.TURNSTILE_THRESHOLD || '0.5')
    
    if (!this.secretKey) {
      throw new Error('TURNSTILE_SECRET_KEY is required')
    }
  }

  /**
   * Verify Cloudflare Turnstile token
   */
  async verifyToken(token: string, ipAddress?: string): Promise<CaptchaResult> {
    try {
      if (!token) {
        return { success: false, error: 'No CAPTCHA token provided' }
      }

      // Prepare verification request
      const formData = new URLSearchParams()
      formData.append('secret', this.secretKey)
      formData.append('response', token)
      if (ipAddress) {
        formData.append('remoteip', ipAddress)
      }

      // Verify with Cloudflare
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

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
    // Simple risk assessment for minimal implementation
    const { requestCount, failedAttempts } = riskFactors
    
    // Require CAPTCHA if:
    // - More than 3 requests in last hour
    // - More than 2 failed attempts
    return requestCount > 3 || failedAttempts > 2
  }
}

// Create singleton instance
export const captchaService = new CaptchaService() 