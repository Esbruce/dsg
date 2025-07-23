export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMedicalNotes(notes: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!notes.trim()) {
    errors.push('Medical notes cannot be empty');
  }
  
  if (notes.length > 50000) {
    errors.push('Medical notes too long (max 50,000 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 