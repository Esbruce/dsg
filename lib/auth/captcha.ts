/**
 * CAPTCHA verification utilities
 * Supports Google reCAPTCHA v2 and v3
 */

export interface CaptchaConfig {
  secretKey: string
  minScore?: number // For reCAPTCHA v3 (0.0 to 1.0)
}

export interface CaptchaResult {
  success: boolean
  error?: string
  score?: number // For reCAPTCHA v3
}

export class CaptchaVerifier {
  private config: CaptchaConfig

  constructor(config: CaptchaConfig) {
    this.config = config
  }

  /**
   * Verify Google reCAPTCHA token
   */
  async verifyRecaptcha(token: string, remoteIp?: string): Promise<CaptchaResult> {
    if (!token) {
      return {
        success: false,
        error: 'CAPTCHA token is required'
      }
    }

    try {
      const params = new URLSearchParams({
        secret: this.config.secretKey,
        response: token
      })

      if (remoteIp) {
        params.append('remoteip', remoteIp)
      }

      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      const data = await response.json()

      if (!data.success) {
        return {
          success: false,
          error: 'CAPTCHA verification failed'
        }
      }

      // For reCAPTCHA v3, check score
      if (data.score !== undefined) {
        const minScore = this.config.minScore || 0.5
        if (data.score < minScore) {
          return {
            success: false,
            error: `CAPTCHA score too low: ${data.score} (minimum: ${minScore})`
          }
        }
        
        return {
          success: true,
          score: data.score
        }
      }

      return { success: true }
    } catch (error) {
      console.error('CAPTCHA verification error:', error)
      return {
        success: false,
        error: 'Failed to verify CAPTCHA'
      }
    }
  }

  /**
   * Verify hCaptcha token (alternative to reCAPTCHA)
   */
  async verifyHCaptcha(token: string, remoteIp?: string): Promise<CaptchaResult> {
    if (!token) {
      return {
        success: false,
        error: 'CAPTCHA token is required'
      }
    }

    try {
      const params = new URLSearchParams({
        secret: this.config.secretKey,
        response: token
      })

      if (remoteIp) {
        params.append('remoteip', remoteIp)
      }

      const response = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      const data = await response.json()

      if (!data.success) {
        return {
          success: false,
          error: 'CAPTCHA verification failed'
        }
      }

      return { success: true }
    } catch (error) {
      console.error('CAPTCHA verification error:', error)
      return {
        success: false,
        error: 'Failed to verify CAPTCHA'
      }
    }
  }
}

/**
 * Get client IP from request
 */
export function getClientIP(req: any): string | undefined {
  const forwarded = req.headers?.get('x-forwarded-for')
  const realIp = req.headers?.get('x-real-ip')
  return forwarded?.split(',')[0] || realIp || req.ip
}

// Create default verifier (configure with your secret key)
export const captchaVerifier = new CaptchaVerifier({
  secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
  minScore: 0.5 // For reCAPTCHA v3
}) 