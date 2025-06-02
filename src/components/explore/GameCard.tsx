import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { SpotsAvailability } from "../common/SpotsAvailability";
import { useTheme } from "@contexts/ThemeContext";

interface GameCardProps {
  game: any;
  isSkillLevelMatch: boolean;
  gameStatus: any;
  isLoadingStatuses: boolean;
  styles: any;
  getSkillLevelColor: (level: any) => string;
  onGamePress: (gameId: string) => void;
  onActionPress: (gameId: string, isBooked: boolean) => void;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  isSkillLevelMatch,
  gameStatus,
  isLoadingStatuses,
  styles,
  getSkillLevelColor,
  onGamePress,
  onActionPress,
}) => {
  const { colors } = useTheme();
  const startTime = new Date(game.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <ThemedView
      key={game.id}
      type='gameCard'
      borderColorType='text'
      borderWidth={2}
      style={isSkillLevelMatch ? {} : styles.gameCardMismatch}
    >
      <TouchableOpacity onPress={() => onGamePress(game.id)}>
        <View style={cardStyles.rowTop}>
          <View style={cardStyles.leftCol}>
            <ThemedText
              type='title'
              style={[cardStyles.timeText, { color: colors.text }]}
            >
              {startTime}
            </ThemedText>
            <ThemedText
              type='paragraph'
              style={[cardStyles.durationText, { color: colors.icon }]}
            >
              Duration: {game.durationMinutes || game.duration_minutes || 0} min
            </ThemedText>
          </View>
          <View style={cardStyles.rightCol}>
            <View style={cardStyles.skillLevelBadge}>
              <ThemedText type='bold' style={cardStyles.skillText}>
                {game.skillLevel}
              </ThemedText>
              <View
                style={[
                  cardStyles.badgeDot,
                  { backgroundColor: getSkillLevelColor(game.skillLevel) },
                ]}
              />
            </View>
            <ThemedText
              type='paragraph'
              style={[cardStyles.titleText, { color: colors.text }]}
            >
              {game.title}
            </ThemedText>
          </View>
        </View>
        <View style={cardStyles.rowMid}>
          <View style={cardStyles.leftCol}>
            <View style={cardStyles.rowBottom}>
              <View style={cardStyles.spotsCol}>
                <ThemedText type='subtitle'>Spots</ThemedText>
                <SpotsAvailability gameId={game.id} />
              </View>
            </View>
          </View>
          <View style={cardStyles.leftCol}>
            <View>
              <ThemedText
                type='paragraph'
                style={[cardStyles.locationName, { color: colors.primary }]}
              >
                {game.location?.name}
              </ThemedText>
              <ThemedText
                type='caption'
                style={[cardStyles.locationAddress, { color: colors.icon }]}
              >
                {game.location?.address} - {game.location?.city},{" "}
                {game.location?.state}
              </ThemedText>
            </View>
            <TouchableOpacity
              disabled={isLoadingStatuses}
              onPress={() => onActionPress(game.id, gameStatus?.isBooked)}
            >
              <ThemedView style={gameStatus?.buttonStyle}>
                <ThemedText
                  type={
                    gameStatus?.isBooked
                      ? "buttonCancel"
                      : gameStatus?.buttonText === "Join Waitlist"
                      ? "buttonWaitlist"
                      : gameStatus?.buttonText === "Unavailable"
                      ? "buttonDisabled"
                      : "button"
                  }
                >
                  {gameStatus?.buttonText}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
};

const cardStyles = StyleSheet.create({
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leftCol: {
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
    margin: 0,
  },
  rightCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 0,
  },
  skillText: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 0,
  },
  skillLevelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
  },
  durationText: {
    fontSize: 14,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowMid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  locationName: {
    fontWeight: "600",
    textAlign: "right",
  },
  locationAddress: {
    textAlign: "right",
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 0,
  },
  spotsCol: {
    flex: 1,
  },
});

export default GameCard;
