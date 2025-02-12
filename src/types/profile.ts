import { SkillLevelType } from './game';

export const ProfileVisibility = {
  Public: 'public',
  Private: 'private',
  FriendsOnly: 'friends-only'
} as const;

export type ProfileVisibilityType = typeof ProfileVisibility[keyof typeof ProfileVisibility];

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  skillLevel: SkillLevelType;
  location?: {
    city?: string;
    state?: string;
  };
  avatarUrl?: string;
  visibility: ProfileVisibilityType;
  stats?: {
    gamesPlayed: number;
    gamesWon: number;
    totalPlayTime: number;
  };
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateInput extends Partial<Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  // Additional validation rules or specific update fields can be added here
}

export interface ProfileValidationError {
  field: keyof Profile;
  message: string;
} 