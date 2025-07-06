import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/common/IconSymbol";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import type { Game } from "@/types/games";
import type { UserProfile } from "@/types/user";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [registeredPlayers, setRegisteredPlayers] = useState<UserProfile[]>([]);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  useEffect(() => {
    setRegisteredPlayers(game.players || []);
  }, [game.players]);

  const handleScroll = (event: ScrollEvent) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const { x } = contentOffset;
    setShowLeftShadow(x > 0);
    setShowRightShadow(x + layoutMeasurement.width + 40 < contentSize.width);
  };

  return (
    <ThemedView
      className="mx-0 px-2 pt-2 mt-2 rounded-xl"
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
        {registeredPlayers.map((player) => (
          <ThemedView
            key={player.id}
            className="flex flex-col items-center mx-2"
          >
            <ThemedView
              colorType="soft"
              borderColorType="text"
              borderWidth={2}
              className="rounded-full px-2 py-2"
            >
              <IconSymbol name="person.fill" size={35} />
            </ThemedView>
            <ThemedText type="value">
              {player.name || `Player ${player.id}`}
            </ThemedText>
          </ThemedView>
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
