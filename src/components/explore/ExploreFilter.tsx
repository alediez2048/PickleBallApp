import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@components/common/ThemedView";
import { ThemedText } from "@components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";
import { useTheme } from "@contexts/ThemeContext";

interface ExploreFilterProps {
  selectedSkillLevel: string;
  setSelectedSkillLevel: (level: string) => void;
  showSkillFilter: boolean;
  setShowSkillFilter: (show: boolean) => void;
  skillLevels: { value: string; label: string; color: string }[];
  getSkillLevelColor: (level: string) => string;
  styles: any;
}

const ExploreFilter: React.FC<ExploreFilterProps> = ({
  selectedSkillLevel,
  setSelectedSkillLevel,
  showSkillFilter,
  setShowSkillFilter,
  skillLevels,
  getSkillLevelColor,
}) => {
  const { colors } = useTheme();
  return (
    <ThemedView type='section' borderColorType='primary' borderWidth={2}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowSkillFilter(!showSkillFilter)}
      >
        <ThemedView
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            gap: 10,
          }}
        >
          <IconSymbol name='filter' size={20} color={colors.icon} />
          <ThemedText type='paragraph' style={{ flex: 1, color: colors.text }}>
            {skillLevels.find((s) => s.value === selectedSkillLevel)?.label}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
      {showSkillFilter && (
        <ThemedView type='surface'>
          {skillLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              onPress={() => {
                setSelectedSkillLevel(level.value);
                setShowSkillFilter(false);
              }}
            >
              <ThemedView
                type='badgeContainer'
                style={
                  selectedSkillLevel === level.value
                    ? {
                        backgroundColor: getSkillLevelColor(level.color) + "22",
                      } // 22 for light highlight
                    : {}
                }
              >
                <ThemedView
                  style={{
                    ...styles.badgeDot,
                    backgroundColor: getSkillLevelColor(level.label),
                  }}
                />
                <ThemedText
                  type={
                    selectedSkillLevel === level.value ? "bold" : "paragraph"
                  }
                  style={{ color: colors.text }}
                >
                  {level.label}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  badgeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
  },
  filterButton: {
    paddingLeft: 4,
    paddingRight: 4,
  },
});

export default ExploreFilter;
