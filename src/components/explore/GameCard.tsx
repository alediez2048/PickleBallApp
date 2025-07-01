import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { SpotsAvailability } from "../common/SpotsAvailability";
import { useTheme } from "@contexts/ThemeContext";
import { SKILL_LEVELS } from "@/constants/skillLevels";

interface GameCardProps {
  fixedGame: any;
  game?: any;
  isSkillLevelMatch: boolean;
  gameStatus: any;
  isLoadingStatuses: boolean;
  styles: any;
  onGamePress: (fixedGame: any, game: any) => void;
  onActionPress: (gameId: string, isBooked: boolean) => void;
}

const GameCard: React.FC<GameCardProps> = ({
  fixedGame,
  game,
  gameStatus,
  isLoadingStatuses,
  onGamePress,
  onActionPress,
}) => {
  const { colors } = useTheme();
  const displayGame = game && game?.id ? game : fixedGame;
  const gameID = game && game?.id ? game.id : false;
  displayGame.game_id = gameID;

  const level = SKILL_LEVELS.find(
    (sl) =>
      sl.value === fixedGame.skill_level || sl.value === displayGame.skill_level
  );
  // Handle both ISO string and 'HH:mm:ss' format for startTime
  let startTime = "";
  if (fixedGame.start_time) {
    if (/^\d{2}:\d{2}:\d{2}$/.test(fixedGame.start_time)) {
      // Format is 'HH:mm:ss', create a Date for today with this time
      const [h, m, s] = fixedGame.start_time.split(":").map(Number);
      const date = new Date();
      date.setHours(h, m, s, 0);
      startTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Assume ISO string
      startTime = new Date(fixedGame.start_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  return (
    <ThemedView
      key={displayGame.id}
      type="gameCard"
      className="my-2"
      borderColorType="black"
      borderWidth={2}
    >
      <TouchableOpacity onPress={() => onGamePress(fixedGame, game)}>
        <ThemedView style={cardStyles.rowTop}>
          <ThemedView style={cardStyles.leftCol}>
            <ThemedText type="value">{startTime}</ThemedText>
            <ThemedText
              type="value"
              style={[cardStyles.durationText, { color: colors.icon }]}
            >
              Duration:{" "}
              {fixedGame.duration_minutes || displayGame.duration_minutes || 0}{" "}
              min
            </ThemedText>
          </ThemedView>
          <ThemedView style={cardStyles.rightCol}>
            <ThemedView
              colorType="soft"
              className="flex-row justify-between rounded-xl items-center px-2 py-1"
            >
              <ThemedView
                className={`w-4 h-4 rounded-full mr-1`}
                colorType={
                  (level?.color ?? "all") as
                    | "beginner"
                    | "intermediate"
                    | "advanced"
                    | "open"
                    | "all"
                }
              />
              <ThemedText
                colorType={
                  (level?.color ?? "all") as
                    | "beginner"
                    | "intermediate"
                    | "advanced"
                    | "open"
                    | "all"
                }
                type="bold"
              >
                {fixedGame.skillLevel || displayGame.skill_level || "Open"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        <View style={cardStyles.rowMid}>
          <View style={cardStyles.leftCol}>
            <View style={cardStyles.rowBottom}>
              <View>
                <ThemedText type="subtitle">Spots</ThemedText>
                <SpotsAvailability gameId={displayGame.id} />
              </View>
            </View>
          </View>
          <View style={cardStyles.rightCol}>
            <View>
              <ThemedText
                type="paragraph"
                style={[cardStyles.locationName, { color: colors.primary }]}
              >
                {fixedGame.location?.name}
              </ThemedText>
              <ThemedText
                type="caption"
                style={[cardStyles.locationAddress, { color: colors.icon }]}
              >
                {fixedGame.location?.address} - {fixedGame.location?.city},{" "}
                {fixedGame.location?.state}
              </ThemedText>
            </View>
            <TouchableOpacity
              disabled={isLoadingStatuses}
              onPress={() =>
                onActionPress(displayGame.id, gameStatus?.isBooked)
              }
            >
              <ThemedView style={gameStatus?.buttonStyle}>
                <ThemedText>{gameStatus?.buttonText}</ThemedText>
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
    alignItems: "flex-start",
    gap: 0,
    margin: 0,
  },
  rightCol: {
    alignItems: "flex-end",
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
});

export default GameCard;
