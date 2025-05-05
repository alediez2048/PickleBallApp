import type { MembershipPlan } from './membership';
import type { SkillLevel } from './game';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  is_verified?: boolean;
  email_confirmed_at?: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: Address | null;
  skill_level?: SkillLevel | null;
  profile_image?:
    | string
    | {
        uri: string;
        base64: string;
        timestamp: number;
      }
    | null;

  membership?: MembershipPlan | null;
  paymentMethods?: any[] | null;
  games_played?: any[] | null;
  has_completed_profile?: boolean;
  has_payment_method?: boolean;

  // Supabase-specific metadata
  aud?: string;
  role?: string;
  confirmation_sent_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
  is_anonymous?: boolean;

  // Extended profile
  status?: 'incomplete' | 'active' | 'suspended' | 'deleted';
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  visibility?: 'public' | 'private' | 'friends-only' | null;
  playing_experience?: number | null;
  preferred_play_style?: 'singles' | 'doubles' | 'both' | null;
  availability?: {
    weekdays?: boolean;
    weekends?: boolean;
    preferredTimes?: string[];
  } | null;
  membership_tier?: string | null;
  membership_start_date?: string | null;
  membership_end_date?: string | null;
  stats?: {
    gamesPlayed: number;
    gamesWon: number;
    totalPlayTime: number;
    averageRating?: number;
  } | null;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    matchAlerts: boolean;
    courtPreferences?: string[];
    partnerPreferences?: {
      skillLevel?: string[];
      ageRange?: {
        min: number;
        max: number;
      };
    };
  } | null;
  waiver_accepted?: boolean;
  waiver_signed_at?: string | null;
  terms_accepted?: boolean;
  terms_accepted_at?: string | null;
  privacy_policy_accepted?: boolean;
  privacy_policy_accepted_at?: string | null;
  last_active?: string | null;
}

// Corrected AuthenticatedUser type
export type AuthenticatedUser = Required<Pick<UserProfile, "id" | "email" | "name">> &
  UserProfile;
