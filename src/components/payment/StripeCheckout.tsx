import React from "react";
import { Platform } from "react-native";
import { StripeNative } from "./StripeNative";
import { MembershipPlan } from "@types/membership";

interface StripeCheckoutProps {
  selectedPlan: MembershipPlan;
  onComplete: () => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  selectedPlan,
  onComplete,
}) => {
  return <StripeNative selectedPlan={selectedPlan} onComplete={onComplete} />;
};
