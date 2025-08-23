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
        {variant == "detail" ? (
          <>
            <ThemedText type="label" align="center" colorType="label">
              Spots Available
            </ThemedText>
            <ThemedText type="value" align="center">
              {registeredCount - maxPlayers} of {maxPlayers}
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText type="label" className="my-0 py-0">
              Spots Available
            </ThemedText>
            <ThemedText type="value" className="my-0 py-0">
              {registeredCount - maxPlayers} of {maxPlayers}
            </ThemedText>
          </>
        )}
      </ThemedView>
    </ThemedView>
  );
}
