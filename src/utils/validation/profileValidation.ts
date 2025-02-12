import { Profile, ProfileUpdateInput, ProfileValidationError } from '@/types/profile';

export class ProfileValidationResult {
  private errors: ProfileValidationError[] = [];

  addError(field: keyof Profile, message: string) {
    this.errors.push({ field, message });
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): ProfileValidationError[] {
    return [...this.errors];
  }

  getErrorForField(field: keyof Profile): string | undefined {
    const error = this.errors.find(e => e.field === field);
    return error?.message;
  }
}

export function validateProfile(profile: Profile): ProfileValidationResult {
  const result = new ProfileValidationResult();

  // Required fields
  if (!profile.displayName?.trim()) {
    result.addError('displayName', 'Display name is required');
  } else if (profile.displayName.length < 2) {
    result.addError('displayName', 'Display name must be at least 2 characters');
  }

  if (!profile.skillLevel) {
    result.addError('skillLevel', 'Skill level is required');
  }

  if (!profile.visibility) {
    result.addError('visibility', 'Profile visibility is required');
  }

  // Optional fields with conditions
  if (profile.bio && profile.bio.length > 500) {
    result.addError('bio', 'Bio must not exceed 500 characters');
  }

  if (profile.avatarUrl && !isValidUrl(profile.avatarUrl)) {
    result.addError('avatarUrl', 'Invalid avatar URL');
  }

  return result;
}

export function validateProfileUpdate(update: ProfileUpdateInput): ProfileValidationResult {
  const result = new ProfileValidationResult();

  // Validate only the fields that are being updated
  if (update.displayName !== undefined) {
    if (!update.displayName.trim()) {
      result.addError('displayName', 'Display name is required');
    } else if (update.displayName.length < 2) {
      result.addError('displayName', 'Display name must be at least 2 characters');
    }
  }

  if (update.bio !== undefined && update.bio.length > 500) {
    result.addError('bio', 'Bio must not exceed 500 characters');
  }

  if (update.avatarUrl !== undefined && !isValidUrl(update.avatarUrl)) {
    result.addError('avatarUrl', 'Invalid avatar URL');
  }

  return result;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 