import React from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";
import { FirstTimeProfileForm } from "@/components/profile/FirstTimeProfileForm";

interface ProfileFormModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ProfileFormModal: React.FC<ProfileFormModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <SafeAreaView style={styles.profileFormOverlay}>
      <ThemedView style={styles.profileFormContainer}>
        <ThemedView style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <IconSymbol name="xmark" size={24} color="#666666" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.modalTitle}>
            Update Profile
          </ThemedText>
        </ThemedView>
        <ScrollView style={styles.profileFormScroll}>
          <FirstTimeProfileForm onComplete={onComplete} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  </Modal>
);

const styles = StyleSheet.create({
  profileFormOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  profileFormContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "90%",
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
  modalCloseButton: {
    padding: 8,
  },
  profileFormScroll: {
    maxHeight: "90%",
  },
});
