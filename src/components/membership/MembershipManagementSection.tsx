import React, { useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { IconSymbol } from "@/components/common/IconSymbol";
import { Button } from "@/components/common/Button";
import { MembershipPlanModal } from "./MembershipPlanModal";
import { PaymentMethodModal } from "@/components/payment/PaymentMethodModal";
import { MembershipPlan } from "@/types/membership";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useAuth } from "@/contexts/AuthContext";

const MEMBERSHIP_PLANS: MembershipPlan[] = [
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

interface MembershipManagementSectionProps {
  currentPlan?: MembershipPlan;
  onUpdatePlan: (plan: MembershipPlan) => void;
}

export function MembershipManagementSection({
  currentPlan,
  onUpdatePlan,
}: MembershipManagementSectionProps) {
  const { user } = useAuth();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  // Mock payment method for testing
  const mockPaymentMethod = {
    id: "mock-payment-1",
    last4: "4242",
    brand: "Visa",
    expiryMonth: "12",
    expiryYear: "25",
    isDefault: true,
  };

  // Check if user has a payment method
  const hasPaymentMethod = true; // For testing

  // Get default payment method if available
  const defaultPaymentMethod = mockPaymentMethod; // For testing

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan);

    // If selecting the same plan, just close the modal
    if (currentPlan && plan.id === currentPlan.id) {
      Alert.alert(
        "Current Plan",
        `You are already subscribed to the ${plan.name} plan.`,
        [
          {
            text: "OK",
            onPress: () => setShowPlanModal(false),
          },
        ]
      );
      return;
    }

    // If changing between paid plans
    if (currentPlan) {
      Alert.alert(
        "Change Plan",
        `Are you sure you want to change to the ${
          plan.name
        } plan? Your billing will be updated to ${formatPrice(
          plan.price,
          plan.interval
        )}.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Change Plan",
            onPress: () => {
              setShowPlanModal(false);
              onUpdatePlan(plan);
            },
          },
        ]
      );
      return;
    }

    // If no current plan, show payment modal for new plan
    if (hasPaymentMethod) {
      Alert.alert(
        "Confirm Plan Selection",
        `Are you sure you want to select the ${
          plan.name
        } plan? You will be charged ${formatPrice(plan.price, plan.interval)}.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Confirm",
            onPress: () => {
              setShowPlanModal(false);
              onUpdatePlan(plan);
            },
          },
        ]
      );
    } else {
      // If no payment method, show payment modal
      setShowPlanModal(false);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    if (selectedPlan) {
      onUpdatePlan(selectedPlan);
    }
  };

  const formatPrice = (price: number, interval?: string) => {
    return `$${price}${interval ? `/${interval}` : ""}`;
  };

  // Determine the primary action based on current plan
  const getPrimaryAction = () => {
    if (!currentPlan) {
      return (
        <Button
          variant="primary"
          onPress={() => setShowPlanModal(true)}
          style={styles.actionButton}
        >
          Select a Plan
        </Button>
      );
    }

    return (
      <ThemedView style={styles.actionButtonsRow} type="none">
        <Button
          variant="outline"
          onPress={() => setShowPlanModal(true)}
          style={[styles.actionButton, styles.actionButtonHalf]}
        >
          Change Plan
        </Button>
        <Button
          variant="outline"
          onPress={() => {
            Alert.alert(
              "Update Payment Method",
              "Do you want to update your payment method?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Update",
                  onPress: () => {
                    setSelectedPlan(currentPlan);
                    setShowPaymentModal(true);
                  },
                },
              ]
            );
          }}
          style={[styles.actionButton, styles.actionButtonHalf]}
        >
          Update Payment
        </Button>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {currentPlan ? (
        <ThemedView style={styles.planCard} type="card">
          <ThemedView style={styles.planHeader} type="none">
            <ThemedView style={styles.planTitleContainer} type="none">
              <ThemedText style={styles.planName} type="subtitle">
                {currentPlan.name}
              </ThemedText>
              <ThemedText style={styles.planPrice} type="bold">
                {formatPrice(currentPlan.price, currentPlan.interval)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText style={styles.planDescription} type="paragraph">
            {currentPlan.description}
          </ThemedText>
          <ThemedView style={styles.divider} type="none" />
          <ThemedView style={styles.benefitsContainer} type="none">
            {currentPlan.benefits.map((benefit, idx) => (
              <ThemedView key={idx} style={styles.benefitRow} type="none">
                <ThemedText style={styles.benefitText} type="default">
                  {benefit}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
          <ThemedView style={styles.divider} type="none" />
          {defaultPaymentMethod && (
            <ThemedView style={styles.paymentMethodContainer} type="bordered">
              <ThemedView style={styles.paymentMethodRow} type="none">
                <ThemedText style={styles.paymentText} type="label">
                  {defaultPaymentMethod.brand} ****{defaultPaymentMethod.last4}
                </ThemedText>
                <ThemedText style={styles.paymentExpiry} type="caption">
                  Exp: {defaultPaymentMethod.expiryMonth}/
                  {defaultPaymentMethod.expiryYear}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}
          <ThemedView style={styles.actionsContainer} type="none">
            {getPrimaryAction()}
          </ThemedView>
        </ThemedView>
      ) : (
        <ThemedView
          style={styles.emptyState}
          borderColorType="primary"
          borderWidth={2}
        >
          <ThemedText type="value">No Membership Plan Selected</ThemedText>
          <ThemedText style={styles.emptySubtext} type="emptyStateText">
            Choose a plan to get started and unlock all features.
          </ThemedText>
          <Button
            variant="primary"
            size="small"
            onPress={() => setShowPlanModal(true)}
            style={styles.emptyStateButton}
          >
            Select a Plan
          </Button>
        </ThemedView>
      )}
      <MembershipPlanModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={handlePlanSelect}
        currentPlanId={currentPlan?.id}
      />
      {selectedPlan && (
        <PaymentMethodModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
          selectedPlan={selectedPlan}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  planCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  planTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: 8,
  },
  planName: {
    fontWeight: "600",
    color: "#666666",
    fontSize: 18,
    flexShrink: 1,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  planDescription: {
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  benefitsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  paymentMethodContainer: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentIcon: {
    marginRight: 8,
  },
  paymentText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  paymentExpiry: {
    color: "#666666",
    marginLeft: 24,
  },
  actionsContainer: {
    marginTop: 16,
  },
  actionButton: {
    width: "100%",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButtonHalf: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIconContainer: {
    backgroundColor: "#4CAF50",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333333",
  },
  emptySubtext: {
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: 8,
    minWidth: 200,
  },
});
