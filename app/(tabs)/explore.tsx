import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useBookedGames } from "@/contexts/BookedGamesContext";
import { useGames } from "@/contexts/GameContext";
import { useFixedGames } from "@/contexts/FixedGamesContext";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import ExploreFilter from "@/components/explore/ExploreFilter";
import GameCard from "@/components/explore/GameCard";
import { IconSymbol } from "@/components/common/IconSymbol";
import { DAYS_OF_WEEK } from "@constants/daysOfWeek";
import { BookedGame } from "@/types/bookedGames";
import { Game, GameStatus } from "@/types/games";
import { FixedGame } from "@/types/fixedGames";
import { SkillLevel } from "@/types/skillLevel";

// Type for merged game (scheduled or fixed)
type MergedGame = Game & {
  isFixed?: boolean;
  dayOfWeek?: string;
  fixedStartTime?: string;
  durationMinutes?: number;
  game_id?: string; // Optional for fixed games
};

// Move allGames and related logic to the top of the ExploreScreen function, before any useEffect or variable that uses it
export default function ExploreScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [upcomingGames, setUpcomingGames] = useState<BookedGame[]>([]);
  const { cancelBooking, listBookedGamesForUser } = useBookedGames();
  const { games, fetchGames, createGame } = useGames();
  const {
    fixedGames,
    fetchFixedGames,
    loading: loadingFixedGames,
  } = useFixedGames();

  // Add state for filter
  const [actualFilter, setActualFilter] = useState<string>("all");

  // Fetch fixed games on mount, then build the days array after fetch
  useEffect(() => {
    fetchFixedGames();
    fetchGames();
    fetchBookedGames();
  }, []);

  const fetchBookedGames = async () => {
    try {
      const games = await listBookedGamesForUser();
      setUpcomingGames(games);
    } catch (error) {
      console.error("Error fetching upcoming games:", error);
      Alert.alert("Error", "Failed to fetch upcoming games. Please try again.");
    }
  };

  // Map fixed_game_id to scheduled game for quick lookup
  const fixedGameIdToGame: Record<string, Game> = {};
  games.forEach((game) => {
    if (game.fixed_game_id) {
      fixedGameIdToGame[game.fixed_game_id] = game;
    }
  });

  // Function to build the sorted days array based on the current filter
  const buildSortedDaysArray = (
    fixedGames: FixedGame[],
    games: Game[],
    filter: string,
    upcomingGames: BookedGame[] // <-- add this argument
  ) => {
    if (!fixedGames || fixedGames.length === 0) return [];
    const activeFixedGames = fixedGames.filter((fg) => fg.status === "active");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysArray: {
      dateUTC: string;
      displayDate: string;
      day: string;
      fixedGame?: FixedGame;
      games: { fixedGame: FixedGame; game?: Game; bookedGame?: BookedGame }[];
    }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateUTC = date.toISOString().split("T")[0];
      const displayDate = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      let day = date.toLocaleDateString("en-US", { weekday: "long" });
      if (i === 0) day = "Today";
      else if (i === 1) day = "Tomorrow";
      const fixedGamesForDay = activeFixedGames.filter(
        (fg) => fg.day_of_week === DAYS_OF_WEEK[date.getDay()]
      );
      // For each fixed game, find the scheduled game by fixed_game_id
      const mergedGames = fixedGamesForDay
        .map((fg) => {
          const scheduledGame = fixedGameIdToGame[fg.id];
          // Find the bookedGame for this scheduledGame
          let bookedGame: BookedGame | undefined = undefined;
          if (scheduledGame) {
            bookedGame = upcomingGames.find(
              (bg) => bg.game_id === scheduledGame.id
            );
          }
          return { fixedGame: fg, game: scheduledGame, bookedGame };
        })
        .filter(({ fixedGame }) =>
          filter === "all" ? true : fixedGame.skill_level === filter
        );
      if (mergedGames.length > 0) {
        daysArray.push({
          dateUTC,
          displayDate,
          day,
          fixedGame: fixedGamesForDay[0],
          games: mergedGames,
        });
      }
    }
    return daysArray.sort((a, b) => a.dateUTC.localeCompare(b.dateUTC));
  };

  const sortedDaysArray = buildSortedDaysArray(
    fixedGames,
    games,
    actualFilter,
    upcomingGames
  );

  const [selectedSkillLevel, setSelectedSkillLevel] = useState<
    SkillLevel | "all"
  >("all");
  const [showSkillFilter, setShowSkillFilter] = useState(false);
  const [gameStatuses, setGameStatuses] = useState<
    Record<
      string,
      {
        canReserve: boolean;
        buttonText: string;
        buttonStyle: any;
        textStyle: any;
        isBooked: boolean;
      }
    >
  >({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<MergedGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refactored: handleGameSelect receives both fixedGame and game
  const handleGameSelect = async (fixedGame: FixedGame, game?: Game) => {
    // If scheduled game exists, navigate to it
    if (game && game.id) {
      router.push({ pathname: "/game/[id]", params: { id: game.id } });
      return;
    }
    // If no scheduled game, create one from fixedGame
    if (fixedGame) {
      // Calculate the next date for the fixed game's day_of_week
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      let dayDiff = daysOfWeek.indexOf(fixedGame.day_of_week) - today.getDay();
      if (dayDiff < 0) dayDiff += 7;
      const gameDate = new Date(today);
      gameDate.setDate(today.getDate() + dayDiff);
      // Parse start_time (HH:mm:ss)
      const [h, m, s] = fixedGame.start_time.split(":").map(Number);
      gameDate.setHours(h, m, s || 0, 0);
      const startTime = gameDate.toISOString();
      // Calculate endTime by adding duration_minutes
      const endDate = new Date(
        gameDate.getTime() + fixedGame.duration_minutes * 60000
      );
      const endTime = endDate.toISOString();
      // Prepare gameData for scheduled game creation
      const gameData = {
        title: fixedGame.title,
        description: fixedGame.description || "",
        start_time: startTime,
        end_time: endTime,
        location_id: fixedGame.location_id,
        host: fixedGame.host,
        players: [],
        registered_count: 0,
        max_players: fixedGame.max_players,
        skill_level: fixedGame.skill_level,
        price: fixedGame.price,
        image_url: fixedGame.image_url,
        fixed_game_id: fixedGame.id,
        status: GameStatus.Upcoming,
      };
      try {
        const newGameCreated = await createGame(gameData);
        // After creating the game, refetch games and navigate to the newly created game if possible
        await fetchGames();

        if (newGameCreated && newGameCreated.id) {
          router.push({
            pathname: "/game/[id]",
            params: { id: newGameCreated.id },
          });
        }
      } catch (err) {
        Alert.alert("Error", "Could not create game.");
      }
    }
  };

  const handleCancelRegistration = async (gameId: string) => {
    try {
      setIsLoading(true);
      // Call the cancelBooking function from context
      await cancelBooking(gameId);
      // Optionally, show a success message or update local state
      Alert.alert("Success", "Your registration has been cancelled.");
    } catch (error) {
      console.error("Error cancelling registration:", error);
      Alert.alert("Error", "There was a problem cancelling your registration.");
    } finally {
      setIsLoading(false);
      setIsCancelModalVisible(false);
    }
  };

  // Render using sortedDaysArray
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ThemedText
        className="mt-2 pt-2 text-center"
        type="subtitle"
        weight="bold"
      >
        Games in Austin ▼
      </ThemedText>
      <ExploreFilter
        selectedSkillLevel={actualFilter}
        setSelectedSkillLevel={setActualFilter}
        showSkillFilter={showSkillFilter}
        setShowSkillFilter={setShowSkillFilter}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {sortedDaysArray.length === 0 && (
          <ThemedView className="items-center p-8 rounded-xl mt-4 mx-8">
            <IconSymbol
              name="calendar"
              size={48}
              color={"text"}
              style={{ marginBottom: 16, opacity: 0.5 }}
            />
            <ThemedText type="title" weight="bold">
              No games found
            </ThemedText>
            <ThemedText className="py-3 my-5">
              There are no games available for the selected skill level. Try
              changing the filter or check back later.
            </ThemedText>
          </ThemedView>
        )}
        {sortedDaysArray.map((dayObj: any) => (
          <ThemedView key={dayObj.dateUTC} type="dateSection">
            <ThemedView
              colorType="soft"
              className="flex-row justify-between rounded items-center mx-2 py-4"
            >
              <ThemedText className="mx-4" type="value">
                {dayObj.day}
              </ThemedText>
              <ThemedText className="mx-4" type="value">
                {dayObj.displayDate}
              </ThemedText>
            </ThemedView>
            {dayObj.games.map((game: any) => (
              <GameCard
                key={game?.fixedGame?.id}
                game={game.game}
                fixedGame={game.fixedGame}
                bookedGame={game.bookedGame}
                user={user}
                gameStatus={gameStatuses[game.id]}
                isLoadingStatuses={isLoadingStatuses}
                onGamePress={handleGameSelect}
                onActionPress={(gameId, isBooked) => {
                  if (isBooked) {
                    handleCancelRegistration(gameId);
                  } else {
                    // Find the correct fixedGame and game objects from the current context
                    const foundGame = dayObj.games.find(
                      (g: any) =>
                        (g.game && g.game.id === gameId) ||
                        g.fixedGame.id === gameId
                    );
                    if (foundGame) {
                      handleGameSelect(foundGame.fixedGame, foundGame.game);
                    }
                  }
                }}
              />
            ))}
          </ThemedView>
        ))}
      </ScrollView>
      {/* Cancel registration modal */}
      <Modal
        visible={isCancelModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <ThemedView type="modalContentCustom" colorType="soft">
          <ThemedText type="title">Cancel Registration</ThemedText>
          <ThemedText>
            Are you sure you want to cancel your registration for this game?
          </ThemedText>
          <ThemedView type="centered">
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.danger }]}
              onPress={() => setIsCancelModalVisible(false)}
            >
              <ThemedText>No, go back</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                if (selectedGame) {
                  handleCancelRegistration(selectedGame.id);
                }
              }}
            >
              <ThemedText>Yes, cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 5,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 8,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 8,
  },
});
