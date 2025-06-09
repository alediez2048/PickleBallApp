import React from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { LogBox } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  message?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  message,
  color,
}) => {
  const { colors } = useTheme();
  const spinnerColor = colors.text;

  return (
    <ThemedView>
      <SafeAreaView style={styles.container} testID='loading-spinner'>
        <ThemedView style={styles.content}>
          <ActivityIndicator size={size} color={spinnerColor} />
          {message && <ThemedText style={styles.message}>{message}</ThemedText>}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
});

LogBox.ignoreLogs([
  'Warning: Each child in a list should have a unique "key" prop',
]);
