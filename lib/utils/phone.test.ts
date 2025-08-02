import { 
  formatUKPhoneNumber, 
  validateUKPhoneNumber, 
  normalizeUKPhoneNumber, 
  isUKMobileNumber,
  isUKLandlineNumber,
  formatUKPhoneForDisplay,
  getUKLocalNumber
} from './phone'

describe('UK Phone Number Utilities', () => {
  describe('formatUKPhoneNumber', () => {
    it('should format valid UK numbers correctly', () => {
      expect(formatUKPhoneNumber('07849484659')).toBe('+447849484659')
      expect(formatUKPhoneNumber('7849484659')).toBe('+447849484659')
      expect(formatUKPhoneNumber('02079460958')).toBe('+442079460958')
      expect(formatUKPhoneNumber('2079460958')).toBe('+442079460958')
    })

    it('should handle numbers with 44 prefix', () => {
      expect(formatUKPhoneNumber('447849484659')).toBe('+447849484659')
      expect(formatUKPhoneNumber('4402079460958')).toBe('+442079460958')
    })

    it('should return null for invalid numbers', () => {
      expect(formatUKPhoneNumber('')).toBeNull()
      expect(formatUKPhoneNumber('123')).toBeNull() // Too short
      expect(formatUKPhoneNumber('123456789012')).toBeNull() // Too long
      expect(formatUKPhoneNumber('123456789')).toBeNull() // Invalid UK number
    })
  })

  describe('validateUKPhoneNumber', () => {
    it('should validate correct UK numbers', () => {
      expect(validateUKPhoneNumber('07849484659')).toEqual({ valid: true })
      expect(validateUKPhoneNumber('7849484659')).toEqual({ valid: true })
      expect(validateUKPhoneNumber('02079460958')).toEqual({ valid: true })
      expect(validateUKPhoneNumber('2079460958')).toEqual({ valid: true })
    })

    it('should reject invalid UK numbers', () => {
      expect(validateUKPhoneNumber('')).toEqual({ 
        valid: false, 
        error: 'Phone number is required' 
      })
      expect(validateUKPhoneNumber('123456789')).toEqual({ 
        valid: false, 
        error: 'Please enter a valid UK phone number (e.g., 07849 484659)' 
      })
      expect(validateUKPhoneNumber('123456789012')).toEqual({ 
        valid: false, 
        error: 'Please enter a valid UK phone number (e.g., 07849 484659)' 
      })
    })
  })

  describe('normalizeUKPhoneNumber', () => {
    it('should normalize UK numbers correctly', () => {
      expect(normalizeUKPhoneNumber('07849484659')).toBe('+447849484659')
      expect(normalizeUKPhoneNumber('7849484659')).toBe('+447849484659')
      expect(normalizeUKPhoneNumber('02079460958')).toBe('+442079460958')
      expect(normalizeUKPhoneNumber('2079460958')).toBe('+442079460958')
    })

    it('should handle the user\'s specific example', () => {
      // Test the exact case mentioned by the user
      expect(normalizeUKPhoneNumber('7849484659')).toBe('+447849484659')
      expect(normalizeUKPhoneNumber('07849484659')).toBe('+447849484659')
      
      // Both should normalize to the same value
      const normalized1 = normalizeUKPhoneNumber('7849484659')
      const normalized2 = normalizeUKPhoneNumber('07849484659')
      expect(normalized1).toBe(normalized2)
    })

    it('should return null for invalid numbers', () => {
      expect(normalizeUKPhoneNumber('')).toBeNull()
      expect(normalizeUKPhoneNumber('123456789')).toBeNull()
    })
  })

  describe('isUKMobileNumber', () => {
    it('should recognize UK mobile numbers', () => {
      expect(isUKMobileNumber('07849484659')).toBe(true)
      expect(isUKMobileNumber('7849484659')).toBe(true)
      expect(isUKMobileNumber('07700900000')).toBe(true)
    })

    it('should reject non-mobile numbers', () => {
      expect(isUKMobileNumber('02079460958')).toBe(false)
      expect(isUKMobileNumber('2079460958')).toBe(false)
    })
  })

  describe('isUKLandlineNumber', () => {
    it('should recognize UK landline numbers', () => {
      expect(isUKLandlineNumber('02079460958')).toBe(true)
      expect(isUKLandlineNumber('2079460958')).toBe(true)
      expect(isUKLandlineNumber('01179460958')).toBe(true)
    })

    it('should reject mobile numbers', () => {
      expect(isUKLandlineNumber('07849484659')).toBe(false)
      expect(isUKLandlineNumber('7849484659')).toBe(false)
    })
  })

  describe('formatUKPhoneForDisplay', () => {
    it('should format mobile numbers for display', () => {
      expect(formatUKPhoneForDisplay('+447849484659')).toBe('+44 7849 48 4659')
      expect(formatUKPhoneForDisplay('+447700900000')).toBe('+44 7700 90 0000')
    })

    it('should format landline numbers for display', () => {
      expect(formatUKPhoneForDisplay('+442079460958')).toBe('+44 207 946 0958')
      expect(formatUKPhoneForDisplay('+441179460958')).toBe('+44 117 946 0958')
    })

    it('should format numbers consistently for verification page display', () => {
      // Test various input formats that should all display the same
      const testInputs = [
        '7849484659',
        '07849484659',
        '7849 484659',
        '07849 484659'
      ]
      
      testInputs.forEach(input => {
        const normalized = normalizeUKPhoneNumber(input)
        const displayFormat = formatUKPhoneForDisplay(normalized)
        
        // All should display as the same formatted number
        expect(displayFormat).toBe('+44 7849 48 4659')
      })
    })

    it('should handle verification page message formatting', () => {
      // Test the exact scenario for verification page
      const phoneNumber = '7849484659'
      const normalized = normalizeUKPhoneNumber(phoneNumber)
      const displayFormat = formatUKPhoneForDisplay(normalized)
      
      const verificationMessage = `We sent a code to ${displayFormat}`
      
      expect(verificationMessage).toBe('We sent a code to +44 7849 48 4659')
      expect(displayFormat).toStartWith('+44')
      expect(displayFormat).toContain(' ')
    })

    it('should handle header dropdown phone number display', () => {
      // Test various formats that might appear in header dropdown
      const testCases = [
        { input: '447849484659', expected: '+44 7849 48 4659' },
        { input: '7849484659', expected: '+44 7849 48 4659' },
        { input: '07849484659', expected: '+44 7849 48 4659' },
        { input: '7849 484659', expected: '+44 7849 48 4659' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const normalized = normalizeUKPhoneNumber(input)
        const displayFormat = formatUKPhoneForDisplay(normalized)
        
        expect(displayFormat).toBe(expected)
        expect(displayFormat).toStartWith('+44')
      })
    })

    it('should handle mixed email and phone identifiers', () => {
      // Test the logic for determining if identifier is phone or email
      const phoneRegex = /^\+?[\d\s]+$/
      
      // Phone numbers should match
      expect(phoneRegex.test('447849484659')).toBe(true)
      expect(phoneRegex.test('7849484659')).toBe(true)
      expect(phoneRegex.test('+447849484659')).toBe(true)
      expect(phoneRegex.test('7849 484659')).toBe(true)
      
      // Emails should not match
      expect(phoneRegex.test('user@example.com')).toBe(false)
      expect(phoneRegex.test('test.email@domain.co.uk')).toBe(false)
      expect(phoneRegex.test('')).toBe(false)
    })
  })

  describe('Timer formatting consistency', () => {
    it('should format timers consistently for OTP and resend', () => {
      // Import formatTime function
      const { formatTime } = require('../auth/otp-client')
      
      // Test various timer values
      const testCases = [
        { seconds: 0, expected: '0:00' },
        { seconds: 30, expected: '0:30' },
        { seconds: 56, expected: '0:56' },
        { seconds: 60, expected: '1:00' },
        { seconds: 90, expected: '1:30' },
        { seconds: 125, expected: '2:05' },
        { seconds: 120, expected: '2:00' }
      ]
      
      testCases.forEach(({ seconds, expected }) => {
        const formatted = formatTime(seconds)
        expect(formatted).toBe(expected)
        expect(formatted).toMatch(/^\d+:\d{2}$/) // Should match mins:seconds format
      })
    })

    it('should handle edge cases for timer formatting', () => {
      const { formatTime } = require('../auth/otp-client')
      
      // Test edge cases
      expect(formatTime(0)).toBe('0:00')
      expect(formatTime(59)).toBe('0:59')
      expect(formatTime(60)).toBe('1:00')
      expect(formatTime(3599)).toBe('59:59')
      expect(formatTime(3600)).toBe('60:00')
    })
  })

  describe('getUKLocalNumber', () => {
    it('should extract local number part', () => {
      expect(getUKLocalNumber('+447849484659')).toBe('7849484659')
      expect(getUKLocalNumber('+442079460958')).toBe('2079460958')
    })

    it('should return null for invalid numbers', () => {
      expect(getUKLocalNumber('7849484659')).toBeNull()
      expect(getUKLocalNumber('')).toBeNull()
    })
  })

  describe('Ghost user prevention with UK numbers', () => {
    it('should normalize similar UK phone numbers to the same value', () => {
      // These should all normalize to the same value to prevent ghost users
      const phone1 = '7849484659'
      const phone2 = '07849484659'
      const phone3 = '7849 484659'
      const phone4 = '07849 484659'
      
      const normalized1 = normalizeUKPhoneNumber(phone1)
      const normalized2 = normalizeUKPhoneNumber(phone2)
      const normalized3 = normalizeUKPhoneNumber(phone3)
      const normalized4 = normalizeUKPhoneNumber(phone4)
      
      expect(normalized1).toBe('+447849484659')
      expect(normalized2).toBe('+447849484659')
      expect(normalized3).toBe('+447849484659')
      expect(normalized4).toBe('+447849484659')
      
      // All should be equal
      expect(normalized1).toBe(normalized2)
      expect(normalized2).toBe(normalized3)
      expect(normalized3).toBe(normalized4)
    })

    it('should handle the specific user example correctly', () => {
      // Test the exact case mentioned by the user
      const originalNumber = '7849484659'
      const variantNumber = '07849484659'
      
      const normalizedOriginal = normalizeUKPhoneNumber(originalNumber)
      const normalizedVariant = normalizeUKPhoneNumber(variantNumber)
      
      console.log('Original:', originalNumber, '→', normalizedOriginal)
      console.log('Variant:', variantNumber, '→', normalizedVariant)
      
      expect(normalizedOriginal).toBe('+447849484659')
      expect(normalizedVariant).toBe('+447849484659')
      expect(normalizedOriginal).toBe(normalizedVariant)
    })

    it('should always add +44 prefix for database storage', () => {
      // Test various input formats to ensure they all get +44 prefix
      const testNumbers = [
        '7849484659',
        '07849484659',
        '7849 484659',
        '07849 484659',
        '447849484659',
        '02079460958',
        '2079460958'
      ]
      
      testNumbers.forEach(number => {
        const normalized = normalizeUKPhoneNumber(number)
        expect(normalized).toMatch(/^\+44\d{9,10}$/) // +44 followed by 9-10 digits
        expect(normalized).toStartWith('+44') // Must start with +44
      })
    })

    it('should ensure consistent database storage format', () => {
      // All UK numbers should be stored in the same format: +44XXXXXXXXX
      const mobileNumber = '7849484659'
      const landlineNumber = '02079460958'
      
      const normalizedMobile = normalizeUKPhoneNumber(mobileNumber)
      const normalizedLandline = normalizeUKPhoneNumber(landlineNumber)
      
      // Both should have +44 prefix
      expect(normalizedMobile).toStartWith('+44')
      expect(normalizedLandline).toStartWith('+44')
      
      // Both should be valid E.164 format
      expect(normalizedMobile).toMatch(/^\+44\d{10}$/) // +44 + 10 digits for mobile
      expect(normalizedLandline).toMatch(/^\+44\d{9}$/) // +44 + 9 digits for landline
      
      console.log('Mobile stored as:', normalizedMobile)
      console.log('Landline stored as:', normalizedLandline)
    })
  })
}) 