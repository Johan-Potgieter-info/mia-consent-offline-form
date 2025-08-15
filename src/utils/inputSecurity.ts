// Input security and validation utilities
import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove any HTML tags and dangerous content
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });

  // Additional sanitization for form inputs
  return sanitized
    .replace(/[<>]/g, '') // Remove any remaining angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/style\s*=/gi, '') // Remove style attributes
    .trim();
};

// Email validation with security checks
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // Sanitize first
  const sanitizedEmail = sanitizeInput(email);
  
  // Check for basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Security checks
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /vbscript/i,
    /onload/i,
    /onerror/i,
    /<|>/,
    /['"]/
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(sanitizedEmail))) {
    return { isValid: false, error: 'Email contains invalid characters' };
  }

  // Length checks
  if (sanitizedEmail.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  return { isValid: true };
};

// Phone number validation with security
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const sanitizedPhone = sanitizeInput(phone);
  
  // Allow only digits, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (!phoneRegex.test(sanitizedPhone)) {
    return { isValid: false, error: 'Phone number contains invalid characters' };
  }

  // Check length (international format)
  const digitsOnly = sanitizedPhone.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number length is invalid' };
  }

  return { isValid: true };
};

// ID number validation (South African format)
export const validateIDNumber = (idNumber: string): { isValid: boolean; error?: string } => {
  if (!idNumber) {
    return { isValid: false, error: 'ID number is required' };
  }

  const sanitizedId = sanitizeInput(idNumber);
  
  // South African ID format: 13 digits
  if (!/^\d{13}$/.test(sanitizedId)) {
    return { isValid: false, error: 'ID number must be exactly 13 digits' };
  }

  // Additional validation can be added here (checksum, etc.)
  return { isValid: true };
};

// General text input validation
export const validateTextInput = (
  input: string, 
  fieldName: string, 
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    allowNumbers?: boolean;
    allowSpecialChars?: boolean;
  } = {}
): { isValid: boolean; error?: string } => {
  
  const { required = false, minLength = 0, maxLength = 1000, allowNumbers = true, allowSpecialChars = true } = options;

  if (!input && required) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (!input) {
    return { isValid: true }; // Optional field, empty is ok
  }

  const sanitizedInput = sanitizeInput(input);

  // Length validation
  if (sanitizedInput.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (sanitizedInput.length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  // Character validation
  let allowedPattern = 'a-zA-Z\\s';
  if (allowNumbers) allowedPattern += '0-9';
  if (allowSpecialChars) allowedPattern += '\\-\\.\\,\\(\\)';

  const regex = new RegExp(`^[${allowedPattern}]+$`);
  if (!regex.test(sanitizedInput)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true };
};

// Sanitize entire form data object
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitizedData = { ...data };

  Object.keys(sanitizedData).forEach(key => {
    const value = sanitizedData[key];
    if (typeof value === 'string') {
      sanitizedData[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitizedData[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    }
  });

  return sanitizedData;
};

// Rate limiting helper (client-side)
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Security headers for fetch requests
export const getSecurityHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};

// Error sanitization (prevent information leakage)
export const sanitizeError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  // Don't expose sensitive error details in production
  if (process.env.NODE_ENV === 'production') {
    // Generic error messages for production
    if (error.message?.includes('database') || error.message?.includes('SQL')) {
      return 'A database error occurred. Please try again.';
    }
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return 'A network error occurred. Please check your connection.';
    }
    return 'An error occurred. Please try again.';
  }

  // In development, show more details but still sanitize
  const message = error.message || error.toString();
  return sanitizeInput(message).substring(0, 200); // Limit length
};