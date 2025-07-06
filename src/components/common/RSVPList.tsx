import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/common/IconSymbol";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import type { Game } from "@/types/games";
import { useTheme } from "@/contexts/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface RSVPListProps {
  game: Game;
}

interface ScrollEvent {
  nativeEvent: {
    contentOffset: { x: number; y: number };
    layoutMeasurement: { width: number; height: number };
    contentSize: { width: number; height: number };
  };
}

export function RSVPList({ game }: RSVPListProps) {
  const { colors } = useTheme();
  const [registeredPlayers, setRegisteredPlayers] = useState<User[]>([]);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const { x } = contentOffset;

    setShowLeftShadow(x > 0);
    setShowRightShadow(x + layoutMeasurement.width + 40 < contentSize.width);
  };

  const players = game.players || [];
  if (players.length > 0) {
    setRegisteredPlayers(players);
  }

  return (
    <ThemedView
      className="mx-0 px-2 pt-2 mt-2  rounded-xl"
      colorType="soft"
      borderColorType="text"
      borderWidth={2}
      style={styles.container}
    >
      <ThemedView
        className="py-4 px-4 flex flex-row justify-between"
        colorType="soft"
      >
        <ThemedText weight={"bold"} type="value" align="center">
          Players
        </ThemedText>
        <ThemedText weight={"bold"} type="label" align="center">
          {registeredPlayers.length} of {game.max_players}
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
        pagingEnabled
      >
        {players.map((player) => (
          <View key={player.id} style={styles.avatarContainer}>
            Player {player.id}
          </View>
        ))}

        {Array.from({
          length: game.max_players - registeredPlayers.length,
        }).map((_, index) => (
          <ThemedView
            key={`empty-spot-${index}`}
            colorType="soft"
            className="flex flex-col items-center mx-2"
          >
            <ThemedView
              colorType="soft"
              borderColorType="text"
              borderWidth={2}
              className="rounded-full px-2 py-2"
            >
              <IconSymbol name="person.fill.badge.plus" size={35} />
            </ThemedView>
            <ThemedText type="value">Empty Spot</ThemedText>
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
    justifyContent: "center",
    alignItems: "center",
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
