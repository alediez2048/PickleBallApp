import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ThemeToggleButton() {
  const { theme, toggleTheme, colors } = useTheme();

  // Determine if light or dark is active
  const isDark = theme === "dark";

  return (
    <View style={styles.container}>
      {/* Light mode toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        disabled={!isDark}
        style={[
          styles.button,
          !isDark && {
            backgroundColor: colors.primary,
          }, // use info as highlight
          isDark && {
            backgroundColor: colors.text,
          },
        ]}
      >
        <MaterialCommunityIcons
          name='weather-sunny'
          size={28}
          color={!isDark ? colors.white : colors.primary}
        />
      </TouchableOpacity>

      {/* Dark mode toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        disabled={isDark}
        style={[
          styles.button,
          isDark && { backgroundColor: colors.primary },
          !isDark && { backgroundColor: colors.text },
        ]}
      >
        <MaterialCommunityIcons
          name='weather-night'
          size={28}
          color={isDark ? colors.black : colors.background}
        />
      </TouchableOpacity>
    </View>
  );
}

// Styles for the toggle buttons
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  button: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "transparent",
  },
});
