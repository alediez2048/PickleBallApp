import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useGames } from "@/hooks/useGames";
import { GameCard } from "./common/GameCard";
import { prefetch } from "@/utils/prefetch";
import type { Game, SkillLevel } from "@/types/games";

interface GameListProps {
  filters?: {
    skillLevel?: SkillLevel;
    date?: string;
    location?: string;
  };
  onGamePress?: (game: Game) => void;
}

export const GameList = React.memo(function GameList({
  filters,
  onGamePress,
}: GameListProps) {
  const { games, error, isRefreshing, refreshGames } = useGames(filters);

  const handleGamePress = useCallback(
    (game: Game) => {
      // Prefetch game details and booking flow data when a game is pressed
      prefetch.prefetchBookingFlow(game.id);
      onGamePress?.(game);
    },
    [onGamePress]
  );

  const renderItem = useCallback(
    ({ item }: { item: Game }) => (
      <GameCard game={item} onPress={() => handleGamePress(item)} />
    ),
    [handleGamePress]
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error.message || "An error occurred while loading games"}
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={games}
      renderItem={renderItem}
      estimatedItemSize={200}
      onRefresh={refreshGames}
      refreshing={isRefreshing}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});
