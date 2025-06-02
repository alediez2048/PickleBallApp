import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useGameRegistration } from "@/hooks/useGameRegistration";
import { useTheme } from "@contexts/ThemeContext";
import { ThemedText } from "../common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";

interface SpotsAvailabilityProps {
  gameId: string;
  variant?: "card" | "detail";
  showLoadingState?: boolean;
}

export function SpotsAvailability({
  gameId,
  variant = "card",
  showLoadingState = true,
}: SpotsAvailabilityProps) {
  const { isLoading, error, isFull, spotsLeft, formatSpotsMessage } =
    useGameRegistration(gameId);
  const { colors } = useTheme();

  if (!showLoadingState && isLoading) {
    return null;
  }

  return (
    <ThemedView
      style={[
        styles.container,
        variant === "detail" && {
          ...styles.detailContainer,
          backgroundColor: colors.background,
        },
      ]}
    >
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size='small' color={colors.icon} />
          <ThemedText style={[styles.loadingText, { color: colors.icon }]}>
            Checking availability...
          </ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          Unable to check availability
        </ThemedText>
      ) : (
        <ThemedView style={styles.contentContainer}>
          <ThemedText
            style={[
              styles.label,
              { color: colors.icon },
              variant === "detail" && styles.detailLabel,
            ]}
          >
            Spots Available
          </ThemedText>
          <ThemedText
            style={[
              styles.value,
              { color: isFull ? colors.error : colors.text },
              variant === "detail" && styles.detailValue,
            ]}
          >
            {formatSpotsMessage()}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  detailContainer: {
    borderRadius: 12,
    padding: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
  },
  contentContainer: {
    gap: 2,
  },
  label: {
    fontSize: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  value: {
    fontSize: 18,
    margin: 0,
    fontWeight: "600",
  },
  fullValue: {
    // color handled inline
  },
  detailValue: {
    fontSize: 18,
  },
});
