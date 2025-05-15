import React from "react";
import { View, StyleSheet } from "react-native";
import { Game } from "@/types/games";
import { ThemedText } from "@/components/ThemedText";
import { GameCard } from "@/components/common/GameCard";

interface FeaturedGamesProps {
  games: Game[];
  onGamePress: (gameId: string) => void;
  onViewAll: () => void;
}

export function FeaturedGames({
  games,
  onGamePress,
  onViewAll,
}: FeaturedGamesProps) {
  if (!games.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Featured Games</ThemedText>
        <ThemedText style={styles.viewAll} onPress={onViewAll}>
          View All
        </ThemedText>
      </View>
      <View style={styles.gamesContainer}>
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={() => onGamePress(game.id)}
            variant='compact'
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  viewAll: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  gamesContainer: {
    gap: 12,
  },
});
