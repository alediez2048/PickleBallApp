import React from "react";
import { TouchableOpacity, StyleSheet, Alert } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { SpotsAvailability } from "../common/SpotsAvailability";
import { useTheme } from "@contexts/ThemeContext";
import { SKILL_LEVELS } from "@/constants/skillLevels";

interface GameCardProps {
  fixedGame: any;
  game?: any;
  bookedGame?: any;
  user?: any;
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
  bookedGame,
  user,
  styles,
  onGamePress,
}) => {
  const { colors } = useTheme();
  const displayGame = game && game?.id ? game : fixedGame;
  const gameID = game && game?.id ? game.id : fixedGame.id;
  displayGame.game_id = gameID;

  // Determine registered and max players
  const registeredCount = displayGame.registered_count ?? 0;
  const maxPlayers = displayGame.max_players ?? 0;
  const isFull = registeredCount >= maxPlayers && maxPlayers > 0;
  const isBooked = !!bookedGame;
  if (isBooked) {
    console.log(bookedGame);
  }
  // Button/description logic
  let buttonLabel = "Reserve";
  let buttonDisabled = false;
  let buttonColorType: "primary" | "success" = "primary";
  const isSkillLevelMatch = user?.skill_level === fixedGame.skill_level;

  if (!isSkillLevelMatch) {
    buttonLabel = "Reserve";
    buttonDisabled = true;
  } else if (isBooked) {
    buttonLabel = "Booked";
    buttonDisabled = false;
  } else if (isFull) {
    buttonLabel = "Full";
    buttonDisabled = true;
    buttonColorType = "success";
  }

  // Handle button press
  const handlePress = () => {
    if (!isSkillLevelMatch) {
      Alert.alert(
        "Skill Level Mismatch",
        `You can only join games that match your skill level: ${
          user?.skill_level ?? "registered"
        }.`
      );
      return;
    }
    if (!isBooked && isFull) {
      // Do nothing if not booked and full
      return;
    }
    // Allow navigation for booked or reservable
    onGamePress(fixedGame, game);
  };

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
      <ThemedView className="flex-row justify-between items-center mt-2">
        <ThemedView className="flex flex-col items-start gap-0 m-0">
          <ThemedView className="flex-column justify-between items-center mx-2">
            <ThemedText type="value">Spots Available</ThemedText>
            <ThemedText className="text-xs mt-1" colorType="label">
              {registeredCount} of {maxPlayers}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <TouchableOpacity
          onPress={handlePress}
          disabled={!isSkillLevelMatch ? false : buttonDisabled}
          className="ml-2"
        >
          <ThemedView
            colorType={buttonColorType}
            className={`px-7 py-3 rounded-3xl ${
              buttonDisabled ? "opacity-60" : ""
            }`}
          >
            <ThemedText colorType="white" size={5} weight={"bold"}>
              {buttonLabel}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
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
});

export default GameCard;
