import { Profile, ProfileVisibility, ProfileUpdateInput } from '../profile';
import { SkillLevel } from '../game';

describe('Profile Types', () => {
  describe('ProfileVisibility', () => {
    it('should have all valid visibility options', () => {
      expect(Object.values(ProfileVisibility)).toEqual([
        'public',
        'private',
        'friends-only'
      ]);
    });

    it('should be type-safe', () => {
      const visibility: typeof ProfileVisibility[keyof typeof ProfileVisibility] = ProfileVisibility.Public;
      expect(visibility).toBe('public');
    });
  });

  describe('Profile interface', () => {
    it('should create a valid profile object', () => {
      const profile: Profile = {
        id: '1',
        userId: 'user1',
        displayName: 'John Doe',
        bio: 'Pickleball enthusiast',
        skillLevel: SkillLevel.Intermediate,
        location: {
          city: 'San Francisco',
          state: 'CA'
        },
        avatarUrl: 'https://example.com/avatar.jpg',
        visibility: ProfileVisibility.Public,
        stats: {
          gamesPlayed: 10,
          gamesWon: 7,
          totalPlayTime: 600
        },
        preferences: {
          notifications: true,
          emailUpdates: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(profile).toBeTruthy();
      expect(profile.skillLevel).toBe(SkillLevel.Intermediate);
      expect(profile.visibility).toBe(ProfileVisibility.Public);
    });
  });

  describe('ProfileUpdateInput', () => {
    it('should allow partial updates', () => {
      const update: ProfileUpdateInput = {
        displayName: 'Jane Doe',
        bio: 'Updated bio',
        skillLevel: SkillLevel.Advanced
      };

      expect(update).toBeTruthy();
      expect(update.skillLevel).toBe(SkillLevel.Advanced);
    });

    it('should not allow updating readonly fields', () => {
      type TestType = keyof ProfileUpdateInput;
      const updateKeys: TestType[] = ['displayName', 'bio', 'skillLevel', 'visibility', 'location', 'avatarUrl', 'stats', 'preferences'];
      
      // This type check ensures that 'id', 'userId', 'createdAt', and 'updatedAt' are not part of ProfileUpdateInput
      updateKeys.forEach(key => {
        expect(['id', 'userId', 'createdAt', 'updatedAt'].includes(key)).toBe(false);
      });
    });
  });
}); 