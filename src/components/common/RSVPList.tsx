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
import type { User, SkillLevel } from "@/types/games";
import { useGameRegistration } from "@/hooks/useGameRegistration";
import { useBookedGames } from "@/contexts/BookedGamesContext";
import { useUserProfile } from "@/contexts/selectors/authSelectors";
import { mockApi } from "@/services/mockApi";

interface RSVPListProps {
  gameId: string;
  players: User[];
  maxPlayers: number;
  onPlayerPress?: (player: User) => void;
}

interface PlayerAvatarProps {
  player: User;
  onPress?: () => void;
  isRegistered?: boolean;
}

const getImageSource = (profileImage: User["profileImage"]) => {
  if (!profileImage) return undefined;

  if (typeof profileImage === "string") {
    return { uri: profileImage };
  }

  return { uri: profileImage.base64 };
};

const PlayerAvatar = React.memo(
  ({ player, onPress, isRegistered }: PlayerAvatarProps) => (
    <TouchableOpacity
      style={styles.avatarContainer}
      onPress={onPress}
      disabled={!onPress}
    >
      {player.profileImage ? (
        <Image
          source={getImageSource(player.profileImage)}
          style={[styles.avatar, isRegistered && styles.registeredAvatar]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            isRegistered ? styles.registeredAvatar : styles.defaultAvatar,
          ]}
        >
          <IconSymbol
            name='person.fill'
            size={20}
            color={isRegistered ? "#4CAF50" : "#666666"}
          />
        </View>
      )}
      <Text style={styles.playerName} numberOfLines={1}>
        {player.name}
        {isRegistered && " (Registered)"}
      </Text>
    </TouchableOpacity>
  )
);

export function RSVPList({
  gameId,
  players,
  maxPlayers,
  onPlayerPress,
}: RSVPListProps) {
  const {
    isLoading: isLoadingRegistration,
    error: registrationError,
    registeredCount,
  } = useGameRegistration(gameId);
  const [registeredPlayers, setRegisteredPlayers] = useState<User[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadRegisteredPlayers = async () => {
      try {
        setIsLoadingPlayers(true);
        const players = await mockApi.getRegisteredPlayers(gameId);
        const typedPlayers: User[] = players.map((player) => ({
          ...player,
          skillLevel: (player.skillLevel || "Beginner") as SkillLevel,
        }));
        setRegisteredPlayers(typedPlayers);
        setError(null);
      } catch (err) {
        console.error("Error loading registered players:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load registered players")
        );
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    loadRegisteredPlayers();
    // Set up polling to refresh the list periodically
    const intervalId = setInterval(loadRegisteredPlayers, 5000);
    return () => clearInterval(intervalId);
  }, [gameId]);

  if (error || registrationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error?.message ||
            registrationError?.message ||
            "Unable to load players"}
        </Text>
      </View>
    );
  }

  const totalPlayers = players.length + registeredPlayers.length;
  const isLoading = isLoadingRegistration || isLoadingPlayers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Players</Text>
        <Text style={styles.count}>
          {isLoading ? "Loading..." : `${totalPlayers}/${maxPlayers}`}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Host and initial players */}
        {players.map((player) => (
          <PlayerAvatar
            key={player.id}
            player={player}
            onPress={() => onPlayerPress?.(player)}
          />
        ))}

        {/* Registered players */}
        {registeredPlayers.map((player) => (
          <PlayerAvatar
            key={player.id}
            player={player}
            onPress={() => onPlayerPress?.(player)}
            isRegistered
          />
        ))}

        {/* Empty spots */}
        {Array.from({ length: maxPlayers - totalPlayers }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.avatarContainer}>
            <View style={[styles.avatar, styles.emptyAvatar]}>
              <IconSymbol name='person.fill' size={20} color='#E0E0E0' />
            </View>
            <Text style={[styles.playerName, styles.emptySpotText]}>Open</Text>
          </View>
        ))}
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
