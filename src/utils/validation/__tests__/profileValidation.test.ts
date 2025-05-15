import { validateProfile, validateProfileUpdate, ProfileValidationResult } from '../profileValidation';
import { Profile, ProfileVisibility } from '@/types/profile';
import { SkillLevel } from '@/types/games';

describe('Profile Validation', () => {
  const validProfile: Profile = {
    id: '1',
    userId: 'user1',
    displayName: 'John Doe',
    skillLevel: SkillLevel.Intermediate,
    visibility: ProfileVisibility.Public,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  describe('validateProfile', () => {
    it('should pass validation for valid profile', () => {
      const result = validateProfile(validProfile);
      expect(result.hasErrors()).toBe(false);
      expect(result.getErrors()).toHaveLength(0);
    });

    it('should validate display name', () => {
      const profile = { ...validProfile, displayName: '' };
      const result = validateProfile(profile);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrorForField('displayName')).toBe('Display name is required');
    });

    it('should validate display name length', () => {
      const profile = { ...validProfile, displayName: 'A' };
      const result = validateProfile(profile);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrorForField('displayName')).toBe('Display name must be at least 2 characters');
    });

    it('should validate skill level', () => {
      const profile = { ...validProfile, skillLevel: undefined as any };
      const result = validateProfile(profile);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrorForField('skillLevel')).toBe('Skill level is required');
    });

    it('should validate visibility', () => {
      const profile = { ...validProfile, visibility: undefined as any };
      const result = validateProfile(profile);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrorForField('visibility')).toBe('Profile visibility is required');
    });

    it('should validate bio length', () => {
      const profile = { ...validProfile, bio: 'a'.repeat(501) };
      const result = validateProfile(profile);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrorForField('bio')).toBe('Bio must not exceed 500 characters');
    });

    it('should validate avatar URL', () => {
      const profile = { ...validProfile, avatarUrl: 'invalid-url' };
      const result = validateProfile(profile);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrorForField('avatarUrl')).toBe('Invalid avatar URL');
    });
  });

  describe('validateProfileUpdate', () => {
    it('should pass validation for valid update', () => {
      const update = {
        displayName: 'Jane Doe',
        bio: 'Updated bio'
      };
      const result = validateProfileUpdate(update);
      expect(result.hasErrors()).toBe(false);
    });

    it('should validate display name in update', () => {
      const update = { displayName: '' };
      const result = validateProfileUpdate(update);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrorForField('displayName')).toBe('Display name is required');
    });

    it('should validate bio length in update', () => {
      const update = { bio: 'a'.repeat(501) };
      const result = validateProfileUpdate(update);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrorForField('bio')).toBe('Bio must not exceed 500 characters');
    });

    it('should validate avatar URL in update', () => {
      const update = { avatarUrl: 'invalid-url' };
      const result = validateProfileUpdate(update);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrorForField('avatarUrl')).toBe('Invalid avatar URL');
    });
  });

  describe('ProfileValidationResult', () => {
    it('should track multiple errors', () => {
      const result = new ProfileValidationResult();
      result.addError('displayName', 'Display name is required');
      result.addError('skillLevel', 'Skill level is required');

      expect(result.hasErrors()).toBe(true);
      expect(result.getErrors()).toHaveLength(2);
      expect(result.getErrorForField('displayName')).toBe('Display name is required');
      expect(result.getErrorForField('skillLevel')).toBe('Skill level is required');
    });
  });
}); 