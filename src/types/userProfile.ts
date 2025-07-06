// User profile types for PickleBallApp
import type { MembershipPlan } from "@/types/membership.ts";

export interface GameHistory {
  id: string;
  date: string;
  result: "win" | "loss";
  score: string;
  opponent: string;
}

export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  isVerified?: boolean;
  skillLevel?: string;
  uri_image?: string | null;
  profileImage?:
    | string
    | {
        uri: string;
        base64: string;
        timestamp: number;
      };
  gamesPlayed?: GameHistory[];
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  membership?: MembershipPlan;
}
