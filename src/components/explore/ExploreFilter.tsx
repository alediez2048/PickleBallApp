import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";
import { useTheme } from "@/contexts/ThemeContext";
import { SKILL_LEVELS_ALL } from "@/constants/skillLevels";

interface ExploreFilterProps {
  selectedSkillLevel: string;
  setSelectedSkillLevel: (level: string) => void;
  showSkillFilter: boolean;
  setShowSkillFilter: (show: boolean) => void;
  skillLevels: { value: string; label: string; color: string }[];
  styles: any;
}

const ExploreFilter: React.FC<ExploreFilterProps> = ({
  selectedSkillLevel,
  setSelectedSkillLevel,
  showSkillFilter,
  setShowSkillFilter,
  skillLevels,
}) => {
  const { colors } = useTheme();
  const selected = SKILL_LEVELS_ALL.find((s) => s.value === selectedSkillLevel);
  return (
    <ThemedView type="section" borderColorType="primary" borderWidth={2}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowSkillFilter(!showSkillFilter)}
        className="flex-row items-center px-2 py-3"
      >
        <IconSymbol name="filter" size={25} />
        <ThemedText style={{ flex: 1, color: colors.text }} className="ml-2">
          {selected ? selected.label : "All Levels"}
        </ThemedText>
        <IconSymbol
          name={showSkillFilter ? "xmark" : "chevron.down"}
          size={25}
        />
      </TouchableOpacity>
      {showSkillFilter && (
        <ThemedView
          type="surface"
          colorType="soft"
          className="mt-2 rounded-lg border border-primary"
        >
          {SKILL_LEVELS_ALL.map((level) => (
            <TouchableOpacity
              key={level.value}
              onPress={() => {
                setSelectedSkillLevel(level.value);
                setShowSkillFilter(false);
              }}
              className="flex-row items-center p-0 m-0"
            >
              <ThemedView
                className="flex-row items-center px-4 py-3 w-full"
                colorType={
                  selectedSkillLevel === level.value ? "active" : "soft"
                }
              >
                <ThemedView
                  className={`w-4 h-4 rounded-full mr-3`}
                  colorType={
                    level.color as
                      | "beginner"
                      | "intermediate"
                      | "advanced"
                      | "open"
                      | "all"
                  }
                />
                <ThemedText
                  type={selectedSkillLevel === level.value ? "bold" : "text"}
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
  filterButton: {
    paddingLeft: 4,
    paddingRight: 4,
  },
});

export default ExploreFilter;
