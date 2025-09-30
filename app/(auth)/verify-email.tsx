import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { VerifyEmailIcon } from "@/components/common/icons/VerifyEmailIcon";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";

export default function VerifyEmailScreen() {
  const { user, resendConfirmationOfEmail, signOut } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { colors } = useTheme();
  const emailParam =
    typeof params.email === "string" ? params.email : undefined;
  const targetEmail = emailParam || user?.email || "";

  // Auto-hide messages after 20 seconds
  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 20000);
    return () => clearTimeout(t);
  }, [error, success]);

  const handleResendVerification = async () => {
    if (!targetEmail) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      console.log("[VerifyEmail] Resend pressed for:", { email: targetEmail });
      await resendConfirmationOfEmail(targetEmail);
      console.log("[VerifyEmail] Resend request completed for:", {
        email: targetEmail,
      });

      setSuccess(
        "Verification email has been resent. Please check your inbox."
      );
    } catch (err) {
      console.log("[VerifyEmail] Resend request failed:", err);
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
    setIsLoading(true);
    try {
      await signOut();
    } catch (err) {
      setError("Failed to sign out. Please try again.");
    } finally {
      // Ensure we explicitly navigate to the login screen
      router.replace("/(auth)/login");
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Please wait..." />;

  return (
    <ThemedView type="default" style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.sectionMd}>
          <VerifyEmailIcon size={80} />
        </ThemedView>

        <ThemedText type="title" style={styles.title}>
          Verify your email
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          We've sent a verification email to{"\n"}
          <ThemedText type="subtitle" style={styles.email}>
            {targetEmail}
          </ThemedText>
        </ThemedText>

        <ThemedView style={[styles.sectionMd, styles.messageContainer]}>
          {error && (
            <ThemedText
              type="caption"
              style={styles.centerText}
              colorType="danger"
            >
              {error}
            </ThemedText>
          )}
          {success && (
            <ThemedText
              type="caption"
              style={styles.centerText}
              colorType="primary"
            >
              {success}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <ThemedText type="caption" style={styles.centerText}>
            Didn't receive the email?
          </ThemedText>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={handleResendVerification}
            disabled={isLoading}
          >
            Resend Verification Email
          </Button>

          <ThemedView
            style={[styles.divider, { backgroundColor: colors.border }]}
          />

          <ThemedText type="caption" style={styles.centerText}>
            Want to use a different account?
          </ThemedText>
          <Button
            variant="outline"
            size="large"
            fullWidth
            onPress={handleBackToSignIn}
            disabled={isLoading}
          >
            Back to Sign In
          </Button>
        </ThemedView>
      </ThemedView>
    </ThemedView>
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
  sectionMd: {
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
  email: { fontWeight: "600" },
  messageContainer: {
    minHeight: 40,
  },
  centerText: { textAlign: "center" },
  buttonContainer: {
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 8,
  },
});
