import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { IconSymbol } from "@/components/common/IconSymbol";
import type { Game } from "@/types/games";
import { mockApi } from "@/services/mockApi";

interface RSVPListProps {
  game: Game;
}

export function RSVPList({ game }: RSVPListProps) {
  const [registeredPlayers, setRegisteredPlayers] = useState<User[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const totalPlayers = players.length + registeredPlayers.length;
  const isLoading = isLoadingRegistration || isLoadingPlayers;
  const players = game.players || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Players</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {players.map((player) => (
          <View key={player.id} style={styles.avatarContainer}>
            Player {player.id}
          </View>
        ))}

        {registeredPlayers.length < game.max_players && (
          <View style={styles.avatarContainer}>
            <View style={styles.emptyAvatar}>
              <IconSymbol name="plus" size={24} color="#666666" />
            </View>
            <Text style={styles.emptySpotText}>Empty Spot</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}
      </ScrollView>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  count: {
    fontSize: 14,
    color: "#666666",
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  avatarContainer: {
    alignItems: "center",
    width: 64,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  defaultAvatar: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  registeredAvatar: {
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  emptyAvatar: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  playerName: {
    fontSize: 12,
    color: "#000000",
    textAlign: "center",
  },
  emptySpotText: {
    color: "#666666",
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
  },
});
