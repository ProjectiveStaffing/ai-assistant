/**
 * Validation utilities for form fields
 * Following BEST_PRACTICES.md: DRY principle, reusable validation logic
 */

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

/**
 * Generic field validation for text inputs with length constraints
 * @param value - The field value to validate
 * @param minLength - Minimum allowed length
 * @param maxLength - Maximum allowed length
 * @param fieldName - Display name for error messages
 * @returns ValidationResult with error message if invalid
 */
export function validateField(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): ValidationResult {
  if (value.length === 0) {
    return { isValid: true, error: '' };
  }

  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} debe tener al menos ${minLength} caracteres`,
    };
  }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} no puede tener más de ${maxLength} caracteres`,
    };
  }

  return { isValid: true, error: '' };
}

/**
 * Validates username format and length
 * Rules: 3-20 characters, no spaces
 */
export function validateUsername(username: string): ValidationResult {
  // Check for spaces
  if (/\s/.test(username)) {
    return {
      isValid: false,
      error: 'El username no puede contener espacios',
    };
  }

  // Validate length
  return validateField(username, 3, 20, 'El username');
}

/**
 * Validates display name length
 * Rules: 3-25 characters
 */
export function validateDisplayName(displayName: string): ValidationResult {
  return validateField(displayName, 3, 25, 'El nombre');
}

/**
 * Validates email format
 * Rules: Valid email format, max 254 characters
 */
export function validateEmail(email: string): ValidationResult {
  if (email.length === 0) {
    return { isValid: true, error: '' };
  }

  if (email.length > 254) {
    return {
      isValid: false,
      error: 'El email es demasiado largo',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Por favor ingresa un email válido',
    };
  }

  return { isValid: true, error: '' };
}

/**
 * Validates password match
 * Rules: Both passwords must match and be at least 6 characters
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (confirmPassword.length === 0) {
    return { isValid: true, error: '' };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Las contraseñas no coinciden',
    };
  }

  return { isValid: true, error: '' };
}

/**
 * Validates password strength
 * Rules: Minimum 6 characters
 */
export function validatePassword(password: string): ValidationResult {
  if (password.length === 0) {
    return { isValid: true, error: '' };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'La contraseña debe tener al menos 6 caracteres',
    };
  }

  return { isValid: true, error: '' };
}
