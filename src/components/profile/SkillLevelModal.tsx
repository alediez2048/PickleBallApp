import React from "react";
import { Modal, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";
import { SKILL_LEVELS } from "@/constants/skillLevels";

interface SkillLevelModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (level: string) => void;
  selectedLevel: string;
  isLoading: boolean;
}

export const SkillLevelModal: React.FC<SkillLevelModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedLevel,
  isLoading,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <ThemedView style={styles.modalOverlay}>
      <ThemedView style={styles.modalContent}>
        <ThemedView style={styles.modalHeader}>
          <ThemedText type="title" style={styles.modalTitle}>
            Update Skill Level
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color="#666666" />
          </TouchableOpacity>
        </ThemedView>
        <ScrollView style={styles.modalScroll}>
          {SKILL_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.skillOption,
                selectedLevel === level.value && styles.selectedSkill,
              ]}
              onPress={() => onSelect(level.value)}
              disabled={isLoading}
            >
              <ThemedView style={styles.skillOptionContent}>
                <ThemedText style={styles.skillOptionText}>
                  {level.label}
                </ThemedText>
                <ThemedText type="caption" style={styles.skillDescription}>
                  {level.description}
                </ThemedText>
              </ThemedView>
              {selectedLevel === level.value ? (
                <IconSymbol name="checkmark" size={20} color="#4CAF50" />
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>
    </ThemedView>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
    color: "#666666",
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    padding: 16,
  },
  skillOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    marginBottom: 12,
  },
  skillOptionContent: {
    flex: 1,
    paddingRight: 8,
  },
  selectedSkill: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  skillOptionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#666666",
  },
  skillDescription: {
    color: "#666666",
  },
});
