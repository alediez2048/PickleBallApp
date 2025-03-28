import { ProfileData } from "./profile";

export interface User {
  id?: string;
  name?: string;
  email?: string;
  isVerified?: boolean;
  skillLevel?: string;
  profileImage?:
    | string
    | {
        uri: string;
        base64: string;
        timestamp: number;
      };
  // Profile fields
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  hasCompletedProfile?: boolean;
  hasPaymentMethod?: boolean;
}

export type AuthenticatedUser = Required<Pick<User, "id" | "email" | "name">> &
  User;
