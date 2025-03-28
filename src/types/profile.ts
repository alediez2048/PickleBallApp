import { SkillLevel } from "./game";

export const ProfileVisibility = {
  Public: "public",
  Private: "private",
  FriendsOnly: "friends-only",
} as const;

export type ProfileVisibilityType =
  (typeof ProfileVisibility)[keyof typeof ProfileVisibility];

export const MembershipTier = {
  Free: "free",
  Basic: "basic",
  Premium: "premium",
  Pro: "pro",
} as const;

export type MembershipTierType =
  (typeof MembershipTier)[keyof typeof MembershipTier];

export const ProfileStatus = {
  Incomplete: "incomplete",
  Active: "active",
  Suspended: "suspended",
  Deleted: "deleted",
} as const;

export type ProfileStatusType =
  (typeof ProfileStatus)[keyof typeof ProfileStatus];

export interface Profile {
  id: string;
  userId: string;
  status: ProfileStatusType;
  // Basic Info
  displayName: string;
  bio?: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;

  // Location
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Game Related
  skillLevel: SkillLevel;
  playingExperience: number; // in months
  preferredPlayStyle?: "singles" | "doubles" | "both";
  availability?: {
    weekdays?: boolean;
    weekends?: boolean;
    preferredTimes?: string[];
  };

  // Profile Settings
  avatarUrl?: string;
  visibility: ProfileVisibilityType;

  // Membership
  membershipTier: MembershipTierType;
  membershipStartDate?: string;
  membershipEndDate?: string;

  // Stats
  stats?: {
    gamesPlayed: number;
    gamesWon: number;
    totalPlayTime: number;
    averageRating?: number;
  };

  // Preferences
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    matchAlerts: boolean;
    courtPreferences?: string[];
    partnerPreferences?: {
      skillLevel?: SkillLevel[];
      ageRange?: {
        min: number;
        max: number;
      };
    };
  };

  // Legal
  waiverAccepted: boolean;
  waiverSignedAt?: string;
  termsAccepted: boolean;
  termsAcceptedAt: string;
  privacyPolicyAccepted: boolean;
  privacyPolicyAcceptedAt: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
}

export interface ProfileUpdateInput
  extends Partial<Omit<Profile, "id" | "userId" | "createdAt" | "updatedAt">> {
  // Additional validation rules or specific update fields can be added here
}

export interface ProfileValidationError {
  field: keyof Profile;
  message: string;
}

export interface MembershipPlan {
  id: string;
  tier: MembershipTierType;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: {
    name: string;
    description: string;
    included: boolean;
  }[];
  maxBookingsPerMonth: number;
  courtReservationWindow: number; // in days
  partnerMatchingPriority: number;
  cancellationWindow: number; // in hours
  guestPasses: number;
  discounts?: {
    courtFees?: number;
    equipment?: number;
    events?: number;
  };
}

export const DEFAULT_MEMBERSHIP_PLAN: MembershipPlan = {
  id: "free",
  tier: MembershipTier.Free,
  name: "Free Membership",
  description: "Basic access to PicklePass features",
  price: {
    monthly: 0,
    annual: 0,
  },
  features: [
    {
      name: "Game Booking",
      description: "Book available games",
      included: true,
    },
    {
      name: "Basic Profile",
      description: "Create and maintain your player profile",
      included: true,
    },
  ],
  maxBookingsPerMonth: 2,
  courtReservationWindow: 3,
  partnerMatchingPriority: 0,
  cancellationWindow: 24,
  guestPasses: 0,
};

export interface ProfileData {
  phoneNumber: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  hasCompletedProfile: boolean;
}

export interface FirstTimeProfileFormData {
  phoneNumber: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}
