import React from "react";
import { Modal, ScrollView, TouchableOpacity, Platform } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { Button } from "@/components/common/Button";

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  type: "terms" | "privacy" | "waiver";
  isLoading?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  visible,
  onClose,
  onAccept,
  type,
  isLoading,
}) => {
  const getTitle = () => {
    switch (type) {
      case "terms":
        return "Terms & Conditions";
      case "privacy":
        return "Privacy Policy";
      case "waiver":
        return "Liability Waiver";
    }
  };

  const getContent = () => {
    switch (type) {
      case "terms":
        return `By accepting these Terms & Conditions, you agree to:\n\n1. Follow all rules and guidelines set by PicklePass\n2. Respect other players and court facilities\n3. Maintain accurate profile information\n4. Accept game scheduling and cancellation policies\n5. Comply with our fair play standards\n\nThese terms are subject to change. You will be notified of any updates.`;
      case "privacy":
        return `Our Privacy Policy outlines how we collect, use, and protect your data:\n\n1. We collect profile information you provide\n2. Location data is used for game matching\n3. Your playing history is stored securely\n4. Contact information is used for notifications\n5. We never share your data with third parties\n6. You can request data deletion at any time\n\nYour privacy is important to us.`;
      case "waiver":
        return `By accepting this Liability Waiver, you acknowledge:\n\n1. Pickleball involves inherent risks of injury\n2. You are physically fit to participate\n3. You will follow safety guidelines\n4. You release PicklePass from liability\n5. You have health insurance coverage\n6. You accept responsibility for your actions\n\nThis is a legally binding agreement.`;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <ThemedView
        className="flex-1 justify-center items-center"
        type="blur"
        colorType="none"
      >
        <ThemedView
          type="modalContentCustom"
          className="w-11/12 max-w-xl max-h-[80vh] bg-white dark:bg-background rounded-2xl"
          colorType="background"
          borderColorType="label"
          borderWidth={3}
        >
          <ThemedView
            type="none"
            className="flex-row justify-between items-center border-b border-border px-4 py-3 relative"
            colorType="none"
            borderColorType="border"
          >
            <ThemedText
              type="title"
              colorType="text"
              className="flex-1 text-center mr-10"
              weight="bold"
            >
              {getTitle()}
            </ThemedText>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-2 top-2 p-2"
              disabled={isLoading}
            >
              {/* Replace with your IconSymbol component */}
              <ThemedText type="bold" colorType="label" size={4}>
                ×
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ScrollView className="px-4 py-4 max-h-96">
            <ThemedText
              type="text"
              colorType="label"
              className="leading-6 text-base"
            >
              {getContent()}
            </ThemedText>
          </ScrollView>

          <ThemedView
            type="none"
            className="flex-row justify-between gap-3 px-4 py-3 border-t border-border"
            colorType="none"
            borderColorType="border"
          >
            {/* Replace with your Button component, using ThemedView for wrapper if needed */}
            <ThemedView type="none" className="flex-1 mr-2">
              <Button
                onPress={onClose}
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white font-semibold"
              >
                Decline
              </Button>
            </ThemedView>
            <ThemedView type="none" className="flex-1">
              <Button
                onPress={onAccept}
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-primary text-white font-semibold disabled:opacity-60"
              >
                {isLoading ? "Loading..." : "Accept"}
              </Button>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};
