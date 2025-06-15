import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { Button } from "@/components/common/Button";
import { MembershipPlan } from "@/types/membership";
import { useAuth } from "@/contexts/AuthContext";
import {
  CardField,
  useConfirmPayment,
  initStripe,
} from "@stripe/stripe-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { SUPABASE_FUNCTIONS_URL, SUPABASE_STRIPE_PUBLIC_KEY } from "@env";

interface StripeNativeProps {
  selectedPlan: MembershipPlan;
  onComplete: () => void;
}

export const StripeNative: React.FC<StripeNativeProps> = (props) => {
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { confirmPayment } = useConfirmPayment();
  const { colors } = useTheme();
  const URL_STRIPE_PAYMENT_INTENT = `${SUPABASE_FUNCTIONS_URL}/v1/create-payment-intent`;

  useEffect(() => {
    initStripe({
      publishableKey: SUPABASE_STRIPE_PUBLIC_KEY || "pk_test_123",
    });
  }, []);

  const fetchPaymentIntentClientSecret = async () => {
    const res = await fetch(URL_STRIPE_PAYMENT_INTENT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: Math.round(props.selectedPlan.price * 100),
      }),
    });

    if (!res.ok) {
      console.error("Failed to create PaymentIntent:", await res.text());
      return null;
    }

    const { clientSecret } = await res.json();
    return clientSecret;
  };

  const handleSubmit = async () => {
    if (!cardDetails || !cardDetails.complete) {
      alert("Please enter complete card details.");
      return;
    }
    setIsLoading(true);
    try {
      const clientSecret = await fetchPaymentIntentClientSecret();
      if (!clientSecret) {
        setIsLoading(false);
        alert(
          "You must implement the backend to create a PaymentIntent and return clientSecret."
        );
        return;
      }
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });
      setIsLoading(false);
      if (error) {
        alert(error.message);
      } else if (paymentIntent) {
        props.onComplete();
      }
    } catch (e: any) {
      setIsLoading(false);
      alert(e.message || "Something went wrong");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Add Payment Method</ThemedText>
      <ThemedText type="subtitle">
        {`Plan Name: ${props.selectedPlan.name}`}
      </ThemedText>
      <ThemedText type="value" style={{ marginVertical: 10 }}>
        {`Price: $${props.selectedPlan.price.toFixed(2)}`}
      </ThemedText>
      <CardField
        postalCodeEnabled={false}
        placeholders={{ number: "4242 4242 4242 4242" }}
        cardStyle={{
          backgroundColor: colors.background,
          textColor: colors.text,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: colors.primary,
        }}
        style={{ width: "100%", height: 50, marginVertical: 20 }}
        onCardChange={setCardDetails}
      />
      <Button
        onPress={handleSubmit}
        variant="primary"
        style={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Add Payment Method"}
      </Button>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 10,
  },
});
