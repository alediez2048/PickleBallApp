import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { SpotsAvailability } from "../common/SpotsAvailability";
import { useTheme } from "@contexts/ThemeContext";

interface GameCardProps {
  fixedGame: any;
  game?: any;
  isSkillLevelMatch: boolean;
  gameStatus: any;
  isLoadingStatuses: boolean;
  styles: any;
  getSkillLevelColor: (level: any) => string;
  onGamePress: (fixedGame: any, game: any) => void;
  onActionPress: (gameId: string, isBooked: boolean) => void;
}

const GameCard: React.FC<GameCardProps> = ({
  fixedGame,
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
  const displayGame = game && game?.id ? game : fixedGame;
  const gameID = game && game?.id ? game.id : false;
  displayGame.game_id = gameID;
  // Handle both ISO string and 'HH:mm:ss' format for startTime
  let startTime = "";
  if (displayGame.start_time) {
    if (/^\d{2}:\d{2}:\d{2}$/.test(displayGame.start_time)) {
      // Format is 'HH:mm:ss', create a Date for today with this time
      const [h, m, s] = displayGame.start_time.split(":").map(Number);
      const date = new Date();
      date.setHours(h, m, s, 0);
      startTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Assume ISO string
      startTime = new Date(displayGame.start_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  return (
    <ThemedView
      key={displayGame.id}
      type='gameCard'
      borderColorType='text'
      borderWidth={2}
    >
      <TouchableOpacity onPress={() => onGamePress(fixedGame, game)}>
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
              Duration:{" "}
              {displayGame.durationMinutes || displayGame.duration_minutes || 0}{" "}
              min
            </ThemedText>
          </View>
          <View style={cardStyles.rightCol}>
            <View style={cardStyles.skillLevelBadge}>
              <ThemedText type='bold' style={cardStyles.skillText}>
                {displayGame.skillLevel || displayGame.skill_level}
              </ThemedText>
              <View
                style={[
                  cardStyles.badgeDot,
                  {
                    backgroundColor: getSkillLevelColor(
                      displayGame.skillLevel || displayGame.skill_level
                    ),
                  },
                ]}
              />
            </View>
            <ThemedText
              type='paragraph'
              style={[cardStyles.titleText, { color: colors.text }]}
            >
              {displayGame.title}
            </ThemedText>
          </View>
        </View>
        <View style={cardStyles.rowMid}>
          <View style={cardStyles.leftCol}>
            <View style={cardStyles.rowBottom}>
              <View style={cardStyles.spotsCol}>
                <ThemedText type='subtitle'>Spots</ThemedText>
                <SpotsAvailability gameId={displayGame.id} />
              </View>
            </View>
          </View>
          <View style={cardStyles.leftCol}>
            <View>
              <ThemedText
                type='paragraph'
                style={[cardStyles.locationName, { color: colors.primary }]}
              >
                {displayGame.location?.name}
              </ThemedText>
              <ThemedText
                type='caption'
                style={[cardStyles.locationAddress, { color: colors.icon }]}
              >
                {displayGame.location?.address} - {displayGame.location?.city},{" "}
                {displayGame.location?.state}
              </ThemedText>
            </View>
            <TouchableOpacity
              disabled={isLoadingStatuses}
              onPress={() =>
                onActionPress(displayGame.id, gameStatus?.isBooked)
              }
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
