export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval?: "month";
  benefits: string[];
  description: string;
}

export type MembershipTier = "drop-in" | "monthly";
