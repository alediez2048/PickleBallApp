import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { TextInput } from "@/components/common/TextInput";
import { Button } from "@/components/common/Button";
import { IconSymbol } from "@/components/common/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentMethodFormProps {
  onComplete: () => void;
  onCancel: () => void;
  isFirstTime?: boolean;
}

export function PaymentMethodForm({
  onComplete,
  onCancel,
  isFirstTime = false,
}: PaymentMethodFormProps) {
  const { user } = useAuth();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Invalid card number";
    }

    if (!expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = "Invalid expiry date (MM/YY)";
    }

    if (!cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "Invalid CVV";
    }

    if (!name.trim()) {
      newErrors.name = "Cardholder name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log("Handle Submit");

      onComplete();
    } catch (error) {
      Alert.alert("Error", "Failed to save payment method. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const getCardBrand = (cardNum: string): string => {
    const cleanedNum = cardNum.replace(/\s/g, "");

    if (/^4/.test(cleanedNum)) return "Visa";
    if (/^5[1-5]/.test(cleanedNum)) return "Mastercard";
    if (/^3[47]/.test(cleanedNum)) return "American Express";
    if (/^6(?:011|5)/.test(cleanedNum)) return "Discover";

    return "Credit Card";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {isFirstTime && (
            <View style={styles.welcomeSection}>
              <IconSymbol name="creditcard.fill" size={40} color="#4CAF50" />
              <ThemedText variant="title" style={styles.welcomeTitle}>
                Add Payment Method
              </ThemedText>
              <ThemedText variant="body" style={styles.welcomeText}>
                To complete your game booking, please add a payment method. This
                will be securely saved for future bookings.
              </ThemedText>
            </View>
          )}

          <View style={styles.form}>
            <TextInput
              label="Card Number"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
              error={errors.cardNumber}
              editable={!isLoading}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <TextInput
                  label="Expiry Date"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                  error={errors.expiryDate}
                  editable={!isLoading}
                />
              </View>
              <View style={styles.halfWidth}>
                <TextInput
                  label="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  error={errors.cvv}
                  editable={!isLoading}
                />
              </View>
            </View>

            <TextInput
              label="Cardholder Name"
              value={name}
              onChangeText={setName}
              placeholder="JOHN DOE"
              autoCapitalize="characters"
              error={errors.name}
              editable={!isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Button
              variant="secondary"
              onPress={onCancel}
              disabled={isLoading}
              style={styles.footerButton}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.footerButton}
            >
              Save Payment Method
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeText: {
    textAlign: "center",
    color: "#666666",
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    marginTop: 32,
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
