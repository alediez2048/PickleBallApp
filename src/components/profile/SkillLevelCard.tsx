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
    <ThemedView style={styles.card} borderColorType="primary" borderWidth={3}>
      <ThemedView style={styles.cardHeader}>
        <ThemedView style={styles.cardTitleContainer}>
          <IconSymbol
            name="trophy.fill"
            size={20}
            color="primary"
            style={styles.cardIcon}
          />
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Skill Level
          </ThemedText>
        </ThemedView>
        <Button variant="primary" size="small" onPress={onEdit}>
          Edit
        </Button>
      </ThemedView>
      <ThemedView
        style={styles.skillLevelContainer}
        borderColorType="primary"
        borderWidth={2}
      >
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
          <ThemedText type="label" style={styles.skillLevelDescription}>
            {skill?.description || "Please set your skill level"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

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
  skillLevelContainer: {
    borderRadius: 12,
    padding: 16,
  },
  skillBadge: {
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
    lineHeight: 20,
  },
});
