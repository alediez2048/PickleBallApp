import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { IconSymbol } from "@/components/common/IconSymbol";
import { Button } from "@/components/common/Button";
import { MembershipPlan } from "@/types/membership";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { StripeCheckout } from "./StripeCheckout";

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  selectedPlan: MembershipPlan;
}

export function PaymentMethodModal({
  visible,
  onClose,
  onComplete,
  selectedPlan,
}: PaymentMethodModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>Payment Method</ThemedText>
            <ThemedText size={3}>
              {`Add a payment method for ${selectedPlan.name}`}
            </ThemedText>
          </ThemedView>
          <ThemedView style={{ flex: 1, justifyContent: "flex-start" }}>
            <StripeCheckout
              selectedPlan={selectedPlan}
              onComplete={onComplete}
            />
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 60,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    padding: 10,
  },
  planSummary: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  planSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  planDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "bold",
  },
  formGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 10,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
});
