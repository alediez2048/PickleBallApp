import React from "react";
import { Button } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      onPress={toggleTheme}
    />
  );
}
