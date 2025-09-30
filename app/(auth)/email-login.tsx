import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { validateLoginForm } from "@/utils/validation";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/common/Logo";
import BackButton from "@/components/common/BackButton";

export default function EmailLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { colors, theme } = useTheme();

  const handleLogin = async () => {
    try {
      setErrors({});
      const validationResult = validateLoginForm(email, password);
      if (validationResult.hasErrors()) {
        const newErrors: { [key: string]: string } = {};
        validationResult.getAllErrors().forEach((error) => {
          newErrors[error.field] = error.message;
        });
        setErrors(newErrors);
        return;
      }

      setIsLoading(true);
      await signIn(email, password);
      // Redirect to main tabs after successful login
      console.log("Login successful, redirecting to main tabs...");
      router.replace("/(tabs)");
    } catch (err: any) {
      const rawMessage = typeof err === "string" ? err : err?.message;
      const msg = (rawMessage || "").toString();

      // Specific handling for unconfirmed email (by code or message)
      if (
        err?.code === "EMAIL_NOT_CONFIRMED" ||
        /email\s*not\s*confirmed/i.test(msg)
      ) {
        router.replace({ pathname: "/(auth)/verify-email", params: { email } });
        return;
      }

      setErrors({ form: "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-hide errors after 20 seconds
  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (!hasErrors) return;
    const timer = setTimeout(() => setErrors({}), 20000);
    return () => clearTimeout(timer);
  }, [errors]);

  if (isLoading) {
    return <LoadingSpinner message="Signing in..." />;
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <BackButton />

          <View style={styles.formContainer}>
            <Logo />
            {/* Title */}
            <View style={styles.titleContainer}>
              <ThemedText style={styles.title}>Sign in with email</ThemedText>
              <ThemedText style={styles.subtitle}>
                Enter your email and password
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                  returnKeyType="next"
                />
                {errors.email && (
                  <ThemedText style={styles.errorText}>
                    {errors.email}
                  </ThemedText>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                {errors.password && (
                  <ThemedText style={styles.errorText}>
                    {errors.password}
                  </ThemedText>
                )}
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                  style={styles.forgotPasswordContainer}
                >
                  <ThemedText style={styles.forgotPasswordText}>
                    Forgot password?
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {errors.form && (
                <ThemedText style={[styles.errorText, styles.formError]}>
                  {errors.form}
                </ThemedText>
              )}

              <Button
                onPress={handleLogin}
                size="large"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                Continue
              </Button>
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
    justifyContent: "center",
    alignItems: "stretch",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    height: 60,
    justifyContent: "center",
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
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
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
  formError: {
    textAlign: "center",
    marginBottom: 16,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "500",
  },
});
