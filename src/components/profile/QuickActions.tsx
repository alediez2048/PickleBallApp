import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";

interface QuickActionsProps {
  onEditProfile: () => void;
  onEditSkill: () => void;
  onMembership: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onEditProfile,
  onEditSkill,
  onMembership,
}) => (
  <ThemedView
    style={styles.quickActions}
    borderColorType="primary"
    borderWidth={3}
  >
    <TouchableOpacity style={styles.actionButton} onPress={onEditProfile}>
      <ThemedView
        style={styles.actionIconContainer}
        colorType="primary"
        borderColorType="white"
        borderWidth={2}
      >
        <IconSymbol name="person.fill" size={24} color="white" />
      </ThemedView>
      <ThemedText style={styles.actionText}>Edit Profile</ThemedText>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onEditSkill}>
      <ThemedView
        style={styles.actionIconContainer}
        colorType="primary"
        borderColorType="white"
        borderWidth={2}
      >
        <IconSymbol name="trophy.fill" size={24} color="white" />
      </ThemedView>
      <ThemedText style={styles.actionText}>Skill Level</ThemedText>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onMembership}>
      <ThemedView
        style={styles.actionIconContainer}
        colorType="primary"
        borderColorType="white"
        borderWidth={2}
      >
        <IconSymbol name="star.fill" size={24} color="white" />
      </ThemedView>
      <ThemedText style={styles.actionText}>Membership</ThemedText>
    </TouchableOpacity>
  </ThemedView>
);

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    borderRadius: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
