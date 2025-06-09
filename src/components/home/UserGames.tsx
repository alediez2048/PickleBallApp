import React from "react";
import { View, StyleSheet } from "react-native";
import { Game } from "@/types/games";
import { ThemedText } from "@/components/ThemedText";
import { GameCard } from "@/components/common/GameCard";

interface UserGamesProps {
  games: Game[];
  onGamePress: (game: Game) => void;
}

export function UserGames({ games, onGamePress }: UserGamesProps) {
  if (!games.length) return null;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Your Games</ThemedText>
      <View style={styles.gamesContainer}>
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={() => onGamePress(game)}
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
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  gamesContainer: {
    gap: 12,
  },
});
