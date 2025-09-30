import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/common/IconSymbol";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import type { Game } from "@/types/games";
import type { UserProfile } from "@/types/user";
import { useTheme } from "@/contexts/ThemeContext";
import { getPublicUrl } from "@/services/image";
import { useGames } from "@contexts/GameContext";

interface RSVPListProps {
  gameId: string;
}

interface ScrollEvent {
  nativeEvent: {
    contentOffset: { x: number; y: number };
    layoutMeasurement: { width: number; height: number };
    contentSize: { width: number; height: number };
  };
}

export function RSVPList({ gameId }: RSVPListProps) {
  const { colors } = useTheme();
  const [registeredPlayers, setRegisteredPlayers] = useState<UserProfile[]>([]);
  const [isMounted, setIsMounted] = useState<any>(true);
  const [actualGame, setActualGame] = useState<Game | null>(null);
  const { fetchGame, games, getGame } = useGames();

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) return;
      setRegisteredPlayers([]);
      await fetchGame(gameId); // Always fetch latest from server
      // Get the updated game from context
      const updatedGame = getGame(gameId);
      if (updatedGame) {
        await fetchPlayersWithProfile(updatedGame);
        setActualGame(updatedGame);
      } else {
        setActualGame(null);
      }
    };
    loadGame();
  }, [gameId, fetchGame, getGame]);

  const fetchPlayersWithProfile = async (game: Game) => {
    const playersWithProfile = await searchImageForPlayers(game.players);
    setRegisteredPlayers(playersWithProfile || []);
  };

  const searchImageForPlayers = async (players: UserProfile[]) => {
    for (const player of players) {
      console.log(
        "[RSVPList] Players with profile images:",
        player.profile_image
      );
      if (player.profile_image && typeof player.profile_image === "string") {
        const urlImage = await fetchProfileImage(player.profile_image);
        player.uri_image = urlImage ?? player.uri_image ?? null;
      }
    }
    // Filter out players without profile images
    return players;
  };

  const fetchProfileImage = async (path: string) => {
    try {
      const urlImage = await getPublicUrl(path);
      return urlImage ? urlImage : null;
    } catch (error) {
      console.error("Error fetching profile image:", error);
      return null;
    }
  };

  const handleScroll = (event: ScrollEvent) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const { x } = contentOffset;
    setShowLeftShadow(x > 0);
    setShowRightShadow(x + layoutMeasurement.width + 40 < contentSize.width);
  };

  if (!actualGame) {
    return (
      <ThemedText weight={"bold"} type="value" align="center">
        Players Loading
      </ThemedText>
    );
  }

  return (
    <ThemedView
      className="mx-0 px-2 pt-2 mt-2 rounded-xl"
      borderColorType="text"
      borderWidth={2}
      style={styles.container}
    >
      <ThemedView className="py-4 px-4 flex flex-row justify-between">
        <ThemedText weight={"bold"} type="value" align="center">
          Players
        </ThemedText>
        <ThemedText weight={"bold"} type="label" align="center">
          {registeredPlayers.length} of {actualGame?.max_players || 0}
        </ThemedText>
      </ThemedView>
      {showLeftShadow && (
        <LinearGradient
          colors={[colors.text, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.leftShadow}
          pointerEvents="none"
        />
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {registeredPlayers.map((player) => (
          <ThemedView
            key={player.id}
            className="flex flex-col items-center mx-2"
          >
            {player.uri_image ? (
              <Image
                style={{
                  borderRadius: 65,
                  width: 65,
                  height: 65,
                  resizeMode: "cover",
                }}
                source={{ uri: player.uri_image }}
              />
            ) : (
              <ThemedView
                borderColorType="text"
                borderWidth={2}
                className="rounded-full px-2 py-2"
              >
                <IconSymbol name="person.fill" size={45} />
              </ThemedView>
            )}

            <ThemedText size={3} weight={"bold"}>
              {player.name || `Player ${player.id}`}
            </ThemedText>
          </ThemedView>
        ))}
        {actualGame &&
          Array.from({
            length: (actualGame?.max_players || 0) - registeredPlayers.length,
          }).map((_, index) => (
            <ThemedView
              key={`empty-spot-${index}`}
              className="flex flex-col items-center mx-2"
            >
              <ThemedView
                borderColorType="text"
                borderWidth={2}
                className="rounded-full px-2 py-2"
              >
                <IconSymbol name="person.fill.badge.plus" size={45} />
              </ThemedView>
              <ThemedText size={3} weight={"bold"}>
                Empty Spot
              </ThemedText>
            </ThemedView>
          ))}
      </ScrollView>
      {showRightShadow && (
        <LinearGradient
          colors={["transparent", colors.text]}
          style={styles.rightShadow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          pointerEvents="none"
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    gap: 12,
  },
  leftShadow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 25,
    zIndex: 10,
    borderRadius: 5,
  },
  rightShadow: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 25,
    zIndex: 10,
    borderRadius: 5,
  },
});
