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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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