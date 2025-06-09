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
  if (Platform.OS === "web") {
    // Web: show only the message and block the rest
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
            </ThemedView>
            <ThemedView style={{ marginVertical: 48 }}>
              <ThemedText
                style={{ color: "red", textAlign: "center", fontSize: 18 }}
              >
                This payment method is only available on the mobile version.
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </SafeAreaView>
      </Modal>
    );
  }

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
    return "pk_test_51RVRsn09fHPKWccnytHurltMuR3gAcMNKbAaYjxEpactV8qbf0sRD7dBr5HUsGWdD6GKtwdOfjiP8YFWmTF20e0U00Zfu794Y8";
  };

  const handleSubmit = async () => {
    if (!cardDetails || !cardDetails.complete) {
      Alert.alert("Invalid Card", "Please enter complete card details.");
      return;
    }
    setIsLoading(true);
    try {
      const clientSecret = await fetchPaymentIntentClientSecret();
      if (
        !clientSecret ||
        clientSecret ===
          "pk_test_51RVRsn09fHPKWccnytHurltMuR3gAcMNKbAaYjxEpactV8qbf0sRD7dBr5HUsGWdD6GKtwdOfjiP8YFWmTF20e0U00Zfu794Y8"
      ) {
        setIsLoading(false);
        Alert.alert(
          "Error",
          "You must implement the backend to create a PaymentIntent and return clientSecret."
        );
        return;
      }
      // Stripe confirmPayment expects only the clientSecret for Card payments
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
            <ThemedText type='miniSubtitle'>
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

              <ThemedView style={styles.formGroup}>
                <ThemedText type='label'>Card Details</ThemedText>
                <CardField
                  postalCodeEnabled={false}
                  placeholders={{ number: "4242 4242 4242 4242" }}
                  cardStyle={{
                    backgroundColor: "#FFFFFF",
                    textColor: "#000000",
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: "#4CAF50",
                  }}
                  style={{ width: "100%", height: 50, marginVertical: 20 }}
                  onCardChange={setCardDetails}
                />
              </ThemedView>

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
    color: "#000000",
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
