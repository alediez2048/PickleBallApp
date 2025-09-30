import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/common/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import { SkillLevel } from "@/types/games";
import { SKILL_LEVELS } from "@/constants/skillLevels";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";

export default function SkillSelectScreen() {
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | null>(null);
  const [expandedSkill, setExpandedSkill] = useState<SkillLevel | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateProfile } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  // Handles skill selection
  const handleSkillSelect = (skill: SkillLevel) => {
    setSelectedSkill(skill);
    setExpandedSkill(skill);
  };

  // Confirms the selected skill and updates the profile
  const handleConfirm = async () => {
    if (!selectedSkill) {
      Alert.alert(
        "Selection Required",
        "Please select your skill level to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ skill_level: selectedSkill });
      router.replace("/(tabs)/explore");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update skill level";
      Alert.alert("Error", errorMessage, [
        {
          text: "Try Again",
          onPress: () => handleConfirm(),
          style: "default",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggles the expanded state of a skill
  const toggleExpanded = (skill: SkillLevel) => {
    setExpandedSkill(expandedSkill === skill ? null : skill);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <ThemedText type="title">Select Your Skill Level</ThemedText>
        <ThemedText>
          Choose the level that best matches your current abilities. This helps
          us match you with appropriate games.
        </ThemedText>
      </View>

      {/* Skill List Section */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.skillList}>
          {SKILL_LEVELS.map((skill) => (
            <View key={skill.value} style={styles.skillCard}>
              {/* Skill Header */}
              <TouchableOpacity
                style={[
                  styles.skillHeader,
                  selectedSkill === skill.value && styles.selectedSkill,
                  { borderColor: skill.color + "40" },
                ]}
                onPress={() => handleSkillSelect(skill.value as SkillLevel)}
              >
                <View style={styles.skillTitleContainer}>
                  <ThemedView
                    className={`w-6 h-6 rounded-full mr-3`}
                    colorType={
                      skill.color as
                        | "beginner"
                        | "intermediate"
                        | "advanced"
                        | "open"
                        | "all"
                    }
                  />
                  <View style={styles.textContainer}>
                    <ThemedText type="subtitle" colorType="black">
                      {skill.label}
                    </ThemedText>
                    <ThemedText
                      style={styles.skillDescription}
                      numberOfLines={
                        expandedSkill === skill.value ? undefined : 2
                      }
                      colorType="black"
                    >
                      {skill.description}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.expandButton]}
                  onPress={() => toggleExpanded(skill.value as SkillLevel)}
                >
                  <IconSymbol
                    name={
                      expandedSkill === skill.value
                        ? "chevron.down"
                        : "chevron.down"
                    }
                    size={20}
                    color={skill.color}
                    style={[
                      styles.expandIcon,
                      expandedSkill === skill.value && styles.expandedIcon,
                    ]}
                  />
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Expanded Rules Section */}
              {expandedSkill === skill.value && (
                <View style={styles.rulesContainer}>
                  <ThemedText
                    className="py-2 my-2"
                    type="subtitle"
                    weight={"bold"}
                    colorType="black"
                  >
                    Booking Rules:
                  </ThemedText>
                  {SKILL_LEVELS.map((rule, index) => (
                    <View key={index} style={styles.ruleItem}>
                      <View
                        style={[
                          styles.ruleBullet,
                          { backgroundColor: skill.color },
                        ]}
                      />
                      <ThemedText colorType="black">
                        {rule.description}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedSkill || isUpdating) && styles.disabledButton,
          ]}
          onPress={handleConfirm}
          disabled={!selectedSkill || isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <ThemedText type="bold" style={styles.confirmButtonText}>
              {selectedSkill ? "Confirm Selection" : "Select a Skill Level"}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  skillList: {
    padding: 16,
    paddingTop: 8,
    gap: 16,
  },
  skillCard: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  skillHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  selectedSkill: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
  },
  skillTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingRight: 16,
  },
  skillIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  skillDescription: {
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  expandButton: {
    padding: 8,
    marginLeft: 4,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  expandIcon: {
    transform: [{ rotate: "-90deg" }],
  },
  expandedIcon: {
    transform: [{ rotate: "0deg" }],
  },
  rulesContainer: {
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  confirmButtonText: {
    color: "#FFFFFF",
  },
});
