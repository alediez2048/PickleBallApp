import React from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";
import { Button } from "@/components/common/Button";
import { SKILL_LEVELS } from "@/constants/skillLevels";

interface SkillLevelCardProps {
  skillLevel: string;
  onEdit: () => void;
}

export const SkillLevelCard: React.FC<SkillLevelCardProps> = ({
  skillLevel,
  onEdit,
}) => {
  const skill = SKILL_LEVELS.find((level) => level.value === skillLevel);
  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.cardHeader}>
        <ThemedView style={styles.cardTitleContainer}>
          <IconSymbol
            name="trophy.fill"
            size={20}
            color="#4CAF50"
            style={styles.cardIcon}
          />
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Skill Level
          </ThemedText>
        </ThemedView>
        <Button variant="outline" size="small" onPress={onEdit}>
          Edit
        </Button>
      </ThemedView>
      <ThemedView style={styles.skillLevelContainer}>
        <ThemedView
          style={[
            styles.skillBadge,
            skillLevel === "Advanced" && styles.advancedBadge,
            skillLevel === "Open" && styles.proBadge,
          ]}
        >
          <ThemedText style={styles.skillLevelText}>
            {skillLevel || "Not set"}
          </ThemedText>
        </ThemedView>
        <ThemedText type="caption" style={styles.skillLevelDescription}>
          {skill?.description || "Please set your skill level"}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
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
    color: "#666666",
  },
  skillLevelContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  skillBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  advancedBadge: {
    backgroundColor: "#E1F5FE",
  },
  proBadge: {
    backgroundColor: "#FFF3E0",
  },
  skillLevelText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 16,
    textTransform: "capitalize",
  },
  skillLevelDescription: {
    color: "#666666",
    lineHeight: 20,
  },
});
