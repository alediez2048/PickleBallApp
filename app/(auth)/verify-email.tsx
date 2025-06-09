import React, { useState } from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { VerifyEmailIcon } from "@/components/common/icons/VerifyEmailIcon";
import { ThemedText } from "@/components/common/ThemedText";

export default function VerifyEmailScreen() {
  const { user, resendConfirmationOfEmail, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await resendConfirmationOfEmail(user.email);

      setSuccess(
        "Verification email has been resent. Please check your inbox."
      );
    } catch (err) {
      if (err instanceof Error && err.message === "Email already verified") {
        router.replace("/(tabs)");
      } else {
        setError("Failed to resend verification email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // Navigation will be handled by the root layout
    } catch (err) {
      setError("Failed to sign out. Please try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message='Please wait...' />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <VerifyEmailIcon size={80} />
        </View>

        <ThemedText type='title' style={styles.title}>
          Verify your email
        </ThemedText>
        <ThemedText type='subtitleCenter' style={styles.subtitle}>
          We've sent a verification email to{"\n"}
          <ThemedText type='subtitle' style={styles.email}>
            {user?.email}
          </ThemedText>
        </ThemedText>

        <View style={styles.messageContainer}>
          {error && (
            <ThemedText type='caption' style={styles.errorText}>
              {error}
            </ThemedText>
          )}
          {success && (
            <ThemedText
              type='caption'
              colorType='primary'
              style={styles.successText}
            >
              {success}
            </ThemedText>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <ThemedText type='caption' style={styles.resendText}>
            Didn't receive the email?
          </ThemedText>
          <Button
            variant='primary'
            size='large'
            fullWidth
            onPress={handleResendVerification}
            disabled={isLoading}
          >
            Resend Verification Email
          </Button>

          <View style={styles.divider} />

          <ThemedText type='caption' style={styles.signInText}>
            Want to use a different account?
          </ThemedText>
          <Button
            variant='outline'
            size='large'
            fullWidth
            onPress={handleBackToSignIn}
            disabled={isLoading}
          >
            Back to Sign In
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },
  email: {
    fontWeight: "600",
  },
  messageContainer: {
    marginBottom: 24,
    minHeight: 40,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  resendText: {
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    width: "100%",
    marginVertical: 8,
  },
  signInText: {
    textAlign: "center",
  },
});
