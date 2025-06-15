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

  useEffect(() => {
    initStripe({
      publishableKey: process.env.SUPABASE_STRIPE_PUBLIC_KEY || "pk_test_123",
    });
  }, []);

  // TODO: Replace with your backend call to create a PaymentIntent and return clientSecret
  const fetchPaymentIntentClientSecret = async () => {
    // Example: fetch from your Supabase Edge Function or API
    const res = await fetch(
      `${process.env.SUPABASE_FUNTIONS_URL}/v1/create-payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 5000 }),
      }
    );

    const { clientSecret } = await res.json();

    await stripe.initPaymentSheet({ paymentIntentClientSecret: clientSecret });
    return await stripe.presentPaymentSheet();
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
