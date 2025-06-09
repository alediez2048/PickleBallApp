import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { validateEmail } from "@/utils/validation";
import { mockApi } from "@/services/mockApi";
import { ThemedText } from "@/components/common/ThemedText";
import Logo from "@/components/common/Logo";
import { ThemedView } from "@/components/common/ThemedView";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!email) {
        setError("Email is required");
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }

      setIsLoading(true);
      await mockApi.requestPasswordReset({ email });
      setSuccess(
        "If an account exists with this email, you will receive password reset instructions shortly"
      );
    } catch (err) {
      setError("Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message='Sending reset instructions...' />;
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ThemedText style={styles.backButtonText}>← Back</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Logo />
            {/* Title */}
            <View style={styles.titleContainer}>
              <ThemedText type='subtitle'>Reset your password</ThemedText>
              <ThemedText>
                Enter your email address and we'll send you instructions to
                reset your password
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='Email'
                  placeholderTextColor='#6B7280'
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                    setSuccess(null);
                  }}
                  autoCapitalize='none'
                  keyboardType='email-address'
                  editable={!isLoading}
                />
                {error && (
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                )}
                {success && (
                  <ThemedText style={styles.successText}>{success}</ThemedText>
                )}
              </View>

              <Button
                onPress={handleResetPassword}
                size='large'
                variant='primary'
                fullWidth
                disabled={isLoading}
              >
                Send Reset Instructions
              </Button>

              <View style={styles.signInContainer}>
                <ThemedText type='caption' style={styles.signInText}>
                  Remember your password?{" "}
                  <ThemedText
                    type='caption'
                    style={styles.signInLink}
                    onPress={() => router.push("/(auth)/email-login")}
                  >
                    Sign in
                  </ThemedText>
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    height: 60,
    justifyContent: "center",
    marginTop: 20,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#6B7280",
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 20,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 25,
    fontSize: 16,
    color: "#000",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    color: "#10B981",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  signInContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  signInText: {
    color: "#6B7280",
  },
  signInLink: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});
