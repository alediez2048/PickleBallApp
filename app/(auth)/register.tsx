import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { validateRegisterForm } from "@/utils/validation";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import Logo from "@/components/common/Logo";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  // Auto-hide errors after 20 seconds
  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (!hasErrors) return;
    const timer = setTimeout(() => {
      setErrors({});
    }, 20000);
    return () => clearTimeout(timer);
  }, [errors]);

  const handleRegister = async () => {
    try {
      setErrors({});
      const validationResult = validateRegisterForm(email, password, name);
      if (validationResult.hasErrors()) {
        const newErrors: { [key: string]: string } = {};
        validationResult.getAllErrors().forEach((error) => {
          newErrors[error.field] = error.message;
        });
        setErrors(newErrors);
        return;
      }

      setIsLoading(true);
      await signUp(email, password, name);
      setIsLoading(false);
      Alert.alert(
        "Account created",
        "Your account was created successfully. Please check your email to verify your account, then sign in again.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
        { cancelable: false }
      );
    } catch (err: any) {
      console.log("Register: Registration error", err);
      const rawMessage = typeof err === "string" ? err : err?.message;
      const code = err?.code;
      const msg = (rawMessage || "").toString().toLowerCase();

      if (code === "EMAIL_EXISTS" || msg.includes("already registered")) {
        setErrors({ email: "Email is already registered" });
      } else if (
        code === "THROTTLED" ||
        msg.includes("for security purposes")
      ) {
        setErrors({ form: "Please wait a moment before trying again." });
      } else {
        setErrors({ form: "Registration failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Creating your account..." />;
  }

  return (
    <ThemedView style={[styles.container]}>
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
              <ThemedText style={styles.title}>Create your account</ThemedText>
              <ThemedText style={styles.subtitle}>
                Enter your details below
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
                {errors.name && (
                  <ThemedText
                    className="mt-2 pt-2 text-center mb-0 pb-0"
                    colorType="danger"
                    size={20}
                    weight={"bold"}
                  >
                    {errors.name}
                  </ThemedText>
                )}
              </View>

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
                />
                {errors.email && (
                  <ThemedText
                    className="mt-2 pt-2 text-center mb-0 pb-0"
                    colorType="danger"
                    size={20}
                    weight={"bold"}
                  >
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
                />
                {errors.password && (
                  <ThemedText
                    className="mt-2 pt-2 text-center mb-0 pb-0"
                    colorType="danger"
                    size={20}
                    weight={"bold"}
                  >
                    {errors.password}
                  </ThemedText>
                )}
              </View>

              {errors.form && (
                <ThemedText
                  className="mt-2 pt-2 text-center mb-0 pb-0"
                  colorType="danger"
                  size={20}
                  weight={"bold"}
                >
                  {errors.form}
                </ThemedText>
              )}

              <Button
                onPress={handleRegister}
                size="large"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                Create Account
              </Button>

              <View style={styles.signInContainer}>
                <ThemedText type="caption" style={styles.signInText}>
                  Already have an account?{" "}
                  <ThemedText
                    type="caption"
                    style={styles.signInLink}
                    onPress={() => router.push("/(auth)/login")}
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
    paddingTop: 5,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 3,
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
  formError: {
    textAlign: "center",
    marginBottom: 16,
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
