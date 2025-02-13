export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationResult {
  private errors: ValidationError[] = [];

  addError(field: string, message: string) {
    this.errors.push({ field, message });
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getError(field: string): string | undefined {
    return this.errors.find(error => error.field === field)?.message;
  }

  getAllErrors(): ValidationError[] {
    return [...this.errors];
  }
}

export const validateEmail = (email: string): boolean => {
  // More comprehensive email regex that checks for:
  // - Proper email format
  // - Common TLDs
  // - No special characters in wrong places
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Basic checks
  if (!email || email.length > 254) return false;
  if (!emailRegex.test(email)) return false;
  
  // Additional checks
  const [local, domain] = email.split('@');
  if (local.length > 64) return false;
  if (domain.length > 255) return false;
  
  return true;
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const result = new ValidationResult();

  if (!email) {
    result.addError('email', 'Email is required');
  } else if (!validateEmail(email)) {
    result.addError('email', 'Invalid email format');
  }

  if (!password) {
    result.addError('password', 'Password is required');
  } else if (!validatePassword(password)) {
    result.addError('password', 'Password must be at least 6 characters');
  }

  return result;
};

export const validateRegisterForm = (
  email: string,
  password: string,
  name: string
): ValidationResult => {
  const result = validateLoginForm(email, password);

  if (!name) {
    result.addError('name', 'Name is required');
  } else if (!validateName(name)) {
    result.addError('name', 'Name must be at least 2 characters');
  }

  return result;
}; 