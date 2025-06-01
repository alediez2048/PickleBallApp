import React from "react";
import { TouchableOpacity } from "react-native";
import { ThemedView } from "@components/common/ThemedView";
import { ThemedText } from "@components/common/ThemedText";
import { IconSymbol } from "@components/ui/IconSymbol";

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
  styles,
}) => (
  <ThemedView type='section' borderColorType='primary' borderWidth={2}>
    <TouchableOpacity
      style={styles.filterButton}
      onPress={() => setShowSkillFilter(!showSkillFilter)}
    >
      <ThemedView
        type='bordered'
        style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
      >
        <IconSymbol name='filter' size={20} color='default' />
        <ThemedText type='paragraph' colorType='default' style={{ flex: 1 }}>
          {skillLevels.find((s) => s.value === selectedSkillLevel)?.label}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
    {showSkillFilter && (
      <ThemedView type='surface' style={styles.scrollFilterDropdown}>
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
                  ? { backgroundColor: "#f1f8e94e" }
                  : {}
              }
            >
              <ThemedView
                style={{
                  ...styles.badgeDot,
                  backgroundColor: getSkillLevelColor(level.value),
                }}
              />
              <ThemedText
                type={selectedSkillLevel === level.value ? "bold" : "paragraph"}
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

export default ExploreFilter;
