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
            <IconSymbol name="xmark" size={24} />
          </TouchableOpacity>
        </ThemedView>
        <ScrollView style={styles.modalScroll}>
          {SKILL_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              onPress={() => onSelect(level.value)}
              disabled={isLoading}
            >
              <ThemedView
                borderWidth={selectedLevel === level.value ? 3 : 1}
                borderColorType={
                  selectedLevel === level.value ? "primary" : "text"
                }
                style={[styles.skillOption]}
              >
                <ThemedView style={styles.skillOptionContent}>
                  <ThemedText style={styles.skillOptionText}>
                    {level.label}
                  </ThemedText>
                  <ThemedText type="caption">{level.description}</ThemedText>
                </ThemedView>
                {selectedLevel === level.value ? (
                  <IconSymbol name="checkmark" size={35} color="#4CAF50" />
                ) : null}
              </ThemedView>
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
    backgroundColor: "rgba(0, 0, 0, 0.333)",
    justifyContent: "flex-end",
  },
  modalContent: {
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
    marginBottom: 12,
  },
  skillOptionContent: {
    flex: 1,
    paddingRight: 8,
  },
  skillOptionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
});
