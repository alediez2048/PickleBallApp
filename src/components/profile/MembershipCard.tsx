import React from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";
import { MembershipManagementSection } from "@/components/membership/MembershipManagementSection";
import { MembershipPlan } from "@/types/membership";

interface MembershipCardProps {
  currentPlan?: MembershipPlan;
  onUpdatePlan: (plan: MembershipPlan) => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  currentPlan,
  onUpdatePlan,
}) => (
  <ThemedView style={styles.card} borderColorType="primary" borderWidth={3}>
    <ThemedView style={styles.cardHeader}>
      <ThemedView style={styles.cardTitleContainer}>
        <IconSymbol
          name="star.fill"
          size={20}
          color="primary"
          style={styles.cardIcon}
        />
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Membership
        </ThemedText>
      </ThemedView>
    </ThemedView>
    <MembershipManagementSection
      key={currentPlan?.id || "no-plan"}
      currentPlan={currentPlan}
      onUpdatePlan={onUpdatePlan}
    />
  </ThemedView>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 18,
  },
});
