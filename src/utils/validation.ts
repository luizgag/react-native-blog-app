// Validation utility functions and rules

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

// Common validation rules
export const validationRules = {
  required: (fieldName: string): ValidationRule => ({
    test: (value: string) => value.trim().length > 0,
    message: `${fieldName} is required`,
  }),

  minLength: (min: number, fieldName: string): ValidationRule => ({
    test: (value: string) => value.trim().length >= min,
    message: `${fieldName} must be at least ${min} characters long`,
  }),

  maxLength: (max: number, fieldName: string): ValidationRule => ({
    test: (value: string) => value.trim().length <= max,
    message: `${fieldName} must be less than ${max} characters`,
  }),

  email: (): ValidationRule => ({
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    message: 'Please enter a valid email address',
  }),

  password: (): ValidationRule => ({
    test: (value: string) => value.length >= 6,
    message: 'Password must be at least 6 characters long',
  }),

  passwordMatch: (originalPassword: string): ValidationRule => ({
    test: (value: string) => value === originalPassword,
    message: 'Passwords do not match',
  }),

  noWhitespace: (fieldName: string): ValidationRule => ({
    test: (value: string) => !/^\s|\s$/.test(value),
    message: `${fieldName} cannot start or end with whitespace`,
  }),

  alphanumeric: (fieldName: string): ValidationRule => ({
    test: (value: string) => /^[a-zA-Z0-9\s]*$/.test(value),
    message: `${fieldName} can only contain letters, numbers, and spaces`,
  }),

  noSpecialChars: (fieldName: string): ValidationRule => ({
    test: (value: string) => /^[a-zA-Z0-9\s\-_.]*$/.test(value),
    message: `${fieldName} can only contain letters, numbers, spaces, hyphens, underscores, and periods`,
  }),

  url: (): ValidationRule => ({
    test: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Please enter a valid URL',
  }),

  phoneNumber: (): ValidationRule => ({
    test: (value: string) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
    message: 'Please enter a valid phone number',
  }),

  positiveNumber: (fieldName: string): ValidationRule => ({
    test: (value: string) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    },
    message: `${fieldName} must be a positive number`,
  }),

  integer: (fieldName: string): ValidationRule => ({
    test: (value: string) => /^\d+$/.test(value),
    message: `${fieldName} must be a whole number`,
  }),
};

// Form validation schemas for different forms
export const formValidationSchemas = {
  login: {
    email: [
      validationRules.required('Email'),
      validationRules.email(),
      validationRules.maxLength(255, 'Email'),
    ],
    password: [
      validationRules.required('Password'),
      validationRules.password(),
    ],
  },

  createPost: {
    title: [
      validationRules.required('Title'),
      validationRules.minLength(3, 'Title'),
      validationRules.maxLength(200, 'Title'),
      validationRules.noWhitespace('Title'),
    ],
    content: [
      validationRules.required('Content'),
      validationRules.minLength(10, 'Content'),
      validationRules.maxLength(10000, 'Content'),
    ],
  },

  createTeacher: {
    name: [
      validationRules.required('Name'),
      validationRules.minLength(2, 'Name'),
      validationRules.maxLength(100, 'Name'),
      validationRules.noWhitespace('Name'),
    ],
    email: [
      validationRules.required('Email'),
      validationRules.email(),
      validationRules.maxLength(255, 'Email'),
    ],
    password: [
      validationRules.required('Password'),
      validationRules.password(),
      validationRules.maxLength(128, 'Password'),
    ],
    department: [
      validationRules.maxLength(100, 'Department'),
      validationRules.noWhitespace('Department'),
    ],
  },

  createStudent: {
    name: [
      validationRules.required('Name'),
      validationRules.minLength(2, 'Name'),
      validationRules.maxLength(100, 'Name'),
      validationRules.noWhitespace('Name'),
    ],
    email: [
      validationRules.required('Email'),
      validationRules.email(),
      validationRules.maxLength(255, 'Email'),
    ],
    password: [
      validationRules.required('Password'),
      validationRules.password(),
      validationRules.maxLength(128, 'Password'),
    ],
    studentId: [
      validationRules.maxLength(50, 'Student ID'),
      validationRules.noSpecialChars('Student ID'),
    ],
  },
};

// Utility function to validate a single field
export const validateField = (value: string, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }
  return null;
};

// Utility function to validate an entire form
export const validateForm = <T extends Record<string, any>>(
  formData: T,
  schema: Record<keyof T, ValidationRule[]>
): Record<keyof T, string> => {
  const errors: Record<keyof T, string> = {} as Record<keyof T, string>;

  for (const field in schema) {
    const value = formData[field];
    const rules = schema[field];
    const error = validateField(String(value || ''), rules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
};

// Utility function to check if form has errors
export const hasFormErrors = <T extends Record<string, any>>(
  errors: Record<keyof T, string>
): boolean => {
  return Object.values(errors).some(error => error && error.length > 0);
};

// Debounced validation for real-time feedback
export const createDebouncedValidator = (
  validator: (value: string) => string | null,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (value: string, callback: (error: string | null) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const error = validator(value);
      callback(error);
    }, delay);
  };
};