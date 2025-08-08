/**
 * UK-specific phone number utilities for consistent validation and formatting
 */

/**
 * UK phone number validation regex - E.164 format with +44
 * Matches UK mobile and landline numbers
 */
const UK_PHONE_REGEX = /^\+44[1-9]\d{8,10}$/

/**
 * UK mobile number patterns (common prefixes)
 */
const UK_MOBILE_PREFIXES = [
  '7', // Mobile numbers starting with 7
]

/**
 * UK landline number patterns (common prefixes)
 */
const UK_LANDLINE_PREFIXES = [
  '1', '2', '3', '4', '5', '6', '8', '9' // Landline numbers
]

/**
 * Format UK phone number to E.164 international format
 * @param phone - Raw phone number input (without +44)
 * @returns Formatted phone number or null if invalid
 */
export function formatUKPhoneNumber(phone: string): string | null {
  if (!phone) return null
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')
  
  // If already starts with 44, remove it and add back
  if (cleaned.startsWith('44')) {
    cleaned = cleaned.substring(2)
  }
  
  // If starts with 0, remove it (UK numbers often start with 0)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  
  // Check if it's a valid UK number length (9-10 digits after country code)
  if (cleaned.length < 9 || cleaned.length > 10) {
    return null
  }
  
  // Add +44 prefix
  return '+44' + cleaned
}

/**
 * Validate UK phone number format
 * @param phone - Phone number to validate (can be with or without +44)
 * @returns Validation result with error message if invalid
 */
export function validateUKPhoneNumber(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return {
      valid: false,
      error: "Phone number is required"
    }
  }
  
  const formatted = formatUKPhoneNumber(phone)
  if (!formatted) {
    return {
      valid: false,
      error: "Please enter a valid UK phone number (e.g., 07849 484659)"
    }
  }
  
  // Additional validation for UK number patterns
  const numberPart = formatted.substring(3) // Remove +44
  
  // Check if it's a valid UK mobile or landline number
  const isValidMobile = UK_MOBILE_PREFIXES.some(prefix => numberPart.startsWith(prefix))
  const isValidLandline = UK_LANDLINE_PREFIXES.some(prefix => numberPart.startsWith(prefix))
  
  if (!isValidMobile && !isValidLandline) {
    return {
      valid: false,
      error: "Please enter a valid UK mobile or landline number"
    }
  }
  
  return { valid: true }
}

/**
 * Normalize UK phone number for consistent storage/comparison
 * @param phone - UK phone number to normalize
 * @returns Normalized phone number or null if invalid
 */
export function normalizeUKPhoneNumber(phone: string): string | null {
  const formatted = formatUKPhoneNumber(phone)
  if (!formatted) return null
  
  // For UK numbers, we just need to ensure consistent format
  // Remove any spaces or formatting and ensure it's +44XXXXXXXXX
  const cleaned = formatted.replace(/\s/g, '')
  
  return cleaned
}

/**
 * Format UK phone number for display
 * @param phone - UK phone number in E.164 format
 * @returns Formatted phone number for display
 */
export function formatUKPhoneForDisplay(phone: string): string {
  if (!phone || !phone.startsWith('+44')) {
    return phone
  }
  
  const numberPart = phone.substring(3) // Remove +44
  
  // Format with only one space after +44
  return `+44 ${numberPart}`
}

/**
 * Extract the local part of a UK phone number (without +44)
 * @param phone - UK phone number in E.164 format
 * @returns Local number part or null if invalid
 */
export function getUKLocalNumber(phone: string): string | null {
  if (!phone || !phone.startsWith('+44')) {
    return null
  }
  
  return phone.substring(3) // Remove +44
}

/**
 * Check if phone number is a UK mobile number
 * @param phone - UK phone number
 * @returns True if it's a UK mobile number
 */
export function isUKMobileNumber(phone: string): boolean {
  const formatted = formatUKPhoneNumber(phone)
  if (!formatted) return false
  
  const numberPart = formatted.substring(3) // Remove +44
  return UK_MOBILE_PREFIXES.some(prefix => numberPart.startsWith(prefix))
}

/**
 * Check if phone number is a UK landline number
 * @param phone - UK phone number
 * @returns True if it's a UK landline number
 */
export function isUKLandlineNumber(phone: string): boolean {
  const formatted = formatUKPhoneNumber(phone)
  if (!formatted) return false
  
  const numberPart = formatted.substring(3) // Remove +44
  return UK_LANDLINE_PREFIXES.some(prefix => numberPart.startsWith(prefix))
}

// Legacy functions for backward compatibility
export function formatPhoneNumber(phone: string): string | null {
  return formatUKPhoneNumber(phone)
}

export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  return validateUKPhoneNumber(phone)
}

export function normalizePhoneNumber(phone: string): string | null {
  return normalizeUKPhoneNumber(phone)
} 