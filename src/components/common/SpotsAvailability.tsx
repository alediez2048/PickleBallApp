import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Game } from "@/types/games";
import { ThemedText } from "../common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";

interface SpotsAvailabilityProps {
  game: Game;
  variant?: "default" | "detail";
}

export function SpotsAvailability({
  game,
  variant = "default",
}: SpotsAvailabilityProps) {
  // Determine registered and max players
  const registeredCount = game.registered_count ?? 0;
  const maxPlayers = game.max_players ?? 0;

  return (
    <ThemedView className="flex flex-col items-start gap-0 m-0">
      <ThemedView className="flex-column justify-between items-center mx-2">
        <ThemedText
          type={variant == "detail" ? "label" : "value"}
          className="my-0 py-0"
        >
          Spots Available
        </ThemedText>
        <ThemedText
          type={variant == "detail" ? "value" : "text"}
          className="my-0 py-0"
          colorType="label"
        >
          {registeredCount} of {maxPlayers}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}
