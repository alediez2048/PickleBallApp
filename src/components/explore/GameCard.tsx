import React from "react";
import { TouchableOpacity, StyleSheet, View, Button } from "react-native";
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
      className="m-2 p-0"
      borderColorType="border"
      borderWidth={1}
    >
      <TouchableOpacity onPress={() => onGamePress(fixedGame, game)}>
        <ThemedView className="flex-row justify-between items-start">
          <ThemedView className="flex flex-col items-start gap-0 m-0">
            <ThemedText size={7} type="bold">
              {startTime}
            </ThemedText>
            <ThemedText colorType="primary" weight={"bold"}>
              {fixedGame.location?.name}
            </ThemedText>
            <ThemedText>{fixedGame.location?.address}</ThemedText>
            <ThemedText type="caption">
              {fixedGame.location?.city}, {fixedGame.location?.state}
            </ThemedText>
          </ThemedView>
          <ThemedView className="items-end">
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
        <ThemedView className="flex-row justify-between items-center">
          <ThemedView className="flex flex-col items-start gap-0 m-0">
            <ThemedView style={cardStyles.rowBottom}>
              <SpotsAvailability gameId={displayGame.id} />
            </ThemedView>
          </ThemedView>
          <TouchableOpacity onPress={() => onGamePress(fixedGame, game)}>
            <ThemedView colorType="primary" className="px-7 py-3 rounded-3xl">
              <ThemedText colorType="white" size={5} weight={"bold"}>
                Reserve
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
};

const cardStyles = StyleSheet.create({
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
