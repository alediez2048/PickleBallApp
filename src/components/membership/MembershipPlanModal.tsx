import React from "react";
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Button } from "@/components/common/ui/Button";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { useTheme } from "@/contexts/ThemeContext";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval?: "month" | "year";
  benefits: string[];
  description: string;
}

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

interface MembershipPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: MembershipPlan) => void;
  currentPlanId?: string;
}

export function MembershipPlanModal({
  visible,
  onClose,
  onSelectPlan,
  currentPlanId,
}: MembershipPlanModalProps) {
  const { colors } = useTheme();
  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name='xmark' size={24} />
            </TouchableOpacity>
            <ThemedText type='title'>Choose Your Plan</ThemedText>
            <ThemedText type='miniSubtitle' colorType='label'>
              Select a membership plan that fits your needs
            </ThemedText>
          </ThemedView>

          <ScrollView style={styles.plansContainer}>
            {MEMBERSHIP_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  { borderColor: colors.text },
                  currentPlanId === plan.id && styles.currentPlanCard,
                ]}
                onPress={() => onSelectPlan(plan)}
                activeOpacity={0.9}
              >
                {currentPlanId === plan.id && (
                  <ThemedView
                    style={styles.currentPlanBadge}
                    colorType='primary'
                  >
                    <ThemedText
                      type='badge'
                      colorType='white'
                      style={styles.currentPlanBadgeText}
                    >
                      Current Plan
                    </ThemedText>
                  </ThemedView>
                )}

                <ThemedView style={styles.planHeader}>
                  <ThemedText type='sectionTitle'>{plan.name}</ThemedText>
                  <ThemedView style={styles.priceContainer}>
                    <ThemedText type='title' colorType='primary'>
                      ${plan.price}
                    </ThemedText>
                    {plan.interval && (
                      <ThemedText type='default' colorType='label'>
                        /{plan.interval}
                      </ThemedText>
                    )}
                  </ThemedView>
                </ThemedView>

                <ThemedText type='paragraph'>{plan.description}</ThemedText>

                <ThemedView style={styles.benefitsContainer}>
                  {plan.benefits.map((benefit, index) => (
                    <ThemedView key={index} style={styles.benefitRow}>
                      <IconSymbol
                        name='checkmark'
                        size={18}
                        color={colors.success}
                        style={styles.benefitIcon}
                      />
                      <ThemedText type='label'>{benefit}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>

                <Button
                  variant={currentPlanId === plan.id ? "outline" : "primary"}
                  style={styles.selectButton}
                  onPress={() => onSelectPlan(plan)}
                >
                  {currentPlanId === plan.id ? "Current Plan" : "Select Plan"}
                </Button>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: Platform.OS === "ios" ? 50 : 30,
    overflow: "hidden",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  plansContainer: {
    padding: 20,
  },
  planCard: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentPlanCard: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "#F1F8E9",
  },
  currentPlanBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    position: "absolute",
    top: -12,
    right: 20,
    zIndex: 1,
  },
  currentPlanBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  planHeader: {
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  benefitIcon: {
    marginRight: 10,
  },
  selectButton: {
    width: "100%",
  },
});
