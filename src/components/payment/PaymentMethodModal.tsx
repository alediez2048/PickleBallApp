import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Button } from "@/components/common/ui/Button";
import { MembershipPlan } from "@/types/membership";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { confirmPayment } = useConfirmPayment();

  useEffect(() => {
    if (visible) {
      setIsSuccess(false);
      setCardDetails(null);
    }
  }, [visible]);

  // TODO: Replace with your backend call to create a PaymentIntent and return clientSecret
  const fetchPaymentIntentClientSecret = async () => {
    // Example: fetch from your Supabase Edge Function or API
    // const res = await fetch('https://your-backend/create-payment-intent', { method: 'POST', body: JSON.stringify({ amount: selectedPlan.price }) });
    // const { clientSecret } = await res.json();
    // return clientSecret;
    return "REPLACE_WITH_CLIENT_SECRET_FROM_BACKEND";
  };

  const handleSubmit = async () => {
    if (Platform.OS !== "web" && (!cardDetails || !cardDetails.complete)) {
      Alert.alert("Invalid Card", "Please enter complete card details.");
      return;
    }
    setIsLoading(true);
    try {
      const clientSecret = await fetchPaymentIntentClientSecret();
      if (
        !clientSecret ||
        clientSecret === "REPLACE_WITH_CLIENT_SECRET_FROM_BACKEND"
      ) {
        setIsLoading(false);
        Alert.alert(
          "Error",
          "You must implement the backend to create a PaymentIntent and return clientSecret."
        );
        return;
      }
      const { error, paymentIntent } = await confirmPayment(clientSecret);
      setIsLoading(false);
      if (error) {
        Alert.alert("Payment failed", error.message);
      } else if (paymentIntent) {
        setIsSuccess(true);
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert("Error", e.message || "Something went wrong");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name='xmark' size={24} color='#666666' />
            </TouchableOpacity>
            <ThemedText style={styles.title}>Payment Method</ThemedText>
            <ThemedText style={styles.subtitle}>
              {isSuccess
                ? "Payment method added successfully!"
                : `Add a payment method for ${selectedPlan.name}`}
            </ThemedText>
          </ThemedView>

          {isSuccess ? (
            <ThemedView style={styles.successContainer}>
              <ThemedView style={styles.successIconContainer}>
                <IconSymbol name='checkmark' size={40} color='#FFFFFF' />
              </ThemedView>
              <ThemedText style={styles.successText}>
                Payment Method Added
              </ThemedText>
              <ThemedText style={styles.successSubtext}>
                Your subscription to {selectedPlan.name} has been activated.
              </ThemedText>
            </ThemedView>
          ) : (
            <ScrollView style={styles.formContainer}>
              <ThemedView style={styles.planSummary}>
                <ThemedText style={styles.planSummaryTitle}>
                  Plan Summary
                </ThemedText>
                <ThemedView style={styles.planDetails}>
                  <ThemedText style={styles.planName}>
                    {selectedPlan.name}
                  </ThemedText>
                  <ThemedText style={styles.planPrice}>
                    ${selectedPlan.price}
                    {selectedPlan.interval ? `/${selectedPlan.interval}` : ""}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {Platform.OS === "web" ? (
                <ThemedView style={{ marginVertical: 24 }}>
                  <ThemedText style={{ color: "red", textAlign: "center" }}>
                    Stripe React Native does not support web. Please implement
                    web payment using Stripe.js.
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>Card Details</ThemedText>
                  <CardField
                    postalCodeEnabled={false}
                    placeholders={{ number: "4242 4242 4242 4242" }}
                    cardStyle={{
                      backgroundColor: "#FFFFFF",
                      textColor: "#000000",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                    }}
                    style={{ width: "100%", height: 50, marginVertical: 12 }}
                    onCardChange={setCardDetails}
                  />
                </ThemedView>
              )}

              <Button
                onPress={handleSubmit}
                variant='primary'
                style={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Add Payment Method"}
              </Button>
            </ScrollView>
          )}
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 60,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
  },
  formContainer: {
    padding: 20,
  },
  planSummary: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  planSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333333",
  },
  planDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
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
    color: "#333333",
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
});
