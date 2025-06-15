export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval?: 'month' | 'year';
  benefits: string[];
  description: string;
}

export type MembershipTier = 'free' | 'drop-in' | 'monthly';