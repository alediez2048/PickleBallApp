import { MembershipPlan } from "@/types/membership";

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "drop-in",
    name: "Drop-In Pass",
    price: 10,
    description: "Perfect for occasional players",
    benefits: [
      "Single game access",
      "No commitment required",
      "Full access to game features",
      "Cancel anytime",
    ],
  },
  {
    id: "monthly",
    name: "Monthly Membership",
    price: 50,
    interval: "month",
    description: "Best value for regular players",
    benefits: [
      "Unlimited game access",
      "Priority booking",
      "Member-only events",
      "Exclusive discounts",
      "Cancel anytime",
    ],
  },
];