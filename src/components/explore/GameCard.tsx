import React from "react";
import { TouchableOpacity } from "react-native";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../common/ThemedText";
import { IconSymbol } from "../ui/IconSymbol";
import { SpotsAvailability } from "../common/SpotsAvailability";

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
  return (
    <ThemedView
      key={game.id}
      style={isSkillLevelMatch ? {} : styles.gameCardMismatch}
    >
      <TouchableOpacity onPress={() => onGamePress(game.id)}>
        <ThemedView
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <ThemedText type='title' style={{ fontSize: 24, marginBottom: 4 }}>
            {new Date(game.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </ThemedText>
          <ThemedText type='paragraph'>{game.title}</ThemedText>
          <ThemedText type='paragraph'>{game.location.name}</ThemedText>
          <ThemedText type='caption'>{game.location.address}</ThemedText>
          <ThemedText type='caption'>
            {game.location.city}, {game.location.state}
          </ThemedText>
          <ThemedView
            style={{ backgroundColor: "#f5f5f5", ...styles.badgeDot }}
          >
            <ThemedView
              style={{
                ...styles.badgeDot,
                backgroundColor: getSkillLevelColor(game.skillLevel),
              }}
            />
            <ThemedText type='badge'>{game.skillLevel}</ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedView style={{ marginBottom: 12 }}>
          <ThemedText type='paragraph' style={{ color: "#000" }}>
            {game.location.name}
          </ThemedText>
          <ThemedText type='caption'>{game.location.address}</ThemedText>
          <ThemedText type='caption'>
            {game.location.city}, {game.location.state}
          </ThemedText>
        </ThemedView>
        <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type='caption'>Spots</ThemedText>
            <SpotsAvailability gameId={game.id} />
          </ThemedView>
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
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
};

export default GameCard;
