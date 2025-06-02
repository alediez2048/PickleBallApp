import React, { useState, useEffect } from "react";
import {
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import type { FixedGame } from "@/types/fixedGames";
import { SkillLevel } from "@/constants/skillLevel.types";
import { Game, GameStatus } from "@/types/games";
import { useAuth } from "@/contexts/AuthContext";
import {
  useBookedGames,
  useUpcomingBookedGames,
} from "@/contexts/BookedGamesContext";
import { mockApi } from "@/services/mockApi";
import { SpotsAvailability } from "@/components/common/SpotsAvailability";
import { GAME_CONSTANTS } from "@/types/games";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { SKILL_LEVELS } from "@/constants/skillLevels";
import { useGames } from "@/contexts/GameContext";
import { useFixedGames } from "@/contexts/FixedGamesContext";
import { DAYS_OF_WEEK } from "@/constants/daysOfWeek";
import GameCard from "@/components/explore/GameCard";
import ExploreFilter from "@components/explore/ExploreFilter";
import { useTheme } from "@contexts/ThemeContext";

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
  const upcomingGames = useUpcomingBookedGames();
  const { cancelBooking } = useBookedGames();
  const { games, fetchGames, loading: loadingGames, createGame } = useGames();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    filter: string
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
      games: { fixedGame: FixedGame; game?: Game }[];
    }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateUTC = date.toISOString().split("T")[0];
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      const displayDate = `${mm}/${dd}/${yyyy}`;
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
          return { fixedGame: fg, game: scheduledGame };
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

  // Fetch fixed games on mount, then build the days array after fetch
  useEffect(() => {
    fetchFixedGames();
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedDaysArray = buildSortedDaysArray(fixedGames, games, actualFilter);

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
  const statusCache = React.useRef<Map<string, number>>(new Map());

  const isGameBooked = React.useCallback(
    (gameId: string) => {
      return upcomingGames.some(
        (bookedGame) =>
          bookedGame.gameId === gameId && bookedGame.status === "upcoming"
      );
    },
    [upcomingGames]
  );

  // Replace all usages of MOCK_GAMES with allGames
  // Example: initialStatuses, getReservationStatus, filteredGames, groupGamesByDate, etc.

  // Update getReservationStatus to accept both scheduled and fixed games
  const getReservationStatus = React.useCallback(
    async (game: MergedGame) => {
      // If it's a fixed game, always allow reservation (or customize as needed)
      if (game.isFixed) {
        return {
          canReserve: true,
          buttonText: "Reserve",
          buttonStyle: {
            backgroundColor: colors.primary, // Use theme color
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
          },
          textStyle: { color: colors.white, fontWeight: "600" },
          isBooked: false,
        };
      }
      try {
        if (isGameBooked(game.id)) {
          return {
            canReserve: false,
            buttonText: "Cancel",
            buttonStyle: {
              backgroundColor: colors.error, // Use theme color
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
            },
            textStyle: { color: colors.white, fontWeight: "600" },
            isBooked: true,
          };
        }

        // Default to 0 if getGameBookings is not available
        let bookedPlayersCount = 0;
        try {
          // TODO: Replace with real API call if available
          // bookedPlayersCount = await getGameBookings(game.id);
        } catch (error) {
          console.warn(
            `Could not get bookings count for game ${game.id}, using default value`
          );
        }

        const totalPlayers = game.players.length + bookedPlayersCount;
        const spotsAvailable = game.maxPlayers - totalPlayers;

        if (spotsAvailable > 0) {
          return {
            canReserve: true,
            buttonText: "Reserve",
            buttonStyle: {
              backgroundColor: colors.primary, // Use theme color
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
            },
            textStyle: { color: colors.white, fontWeight: "600" },
            isBooked: false,
          };
        }

        return {
          canReserve: false,
          buttonText: "Join Waitlist",
          buttonStyle: {
            backgroundColor: colors.waitlist, // Use theme color
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
          },
          textStyle: { color: colors.white, fontWeight: "600" },
          isBooked: false,
        };
      } catch (error) {
        console.warn(
          `Error getting reservation status for game ${game.id}:`,
          error
        );
        return {
          canReserve: false,
          buttonText: "Unavailable",
          buttonStyle: {
            backgroundColor: colors.warning, // Use theme color
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
          },
          textStyle: { color: colors.icon, fontWeight: "600" },
          isBooked: false,
        };
      }
    },
    [isGameBooked]
  );

  // Initialize game statuses for allGames
  // useEffect(() => {
  //   // Set initial states for all games
  //   const initialStatuses = allGames.reduce((acc, game) => {
  //     acc[game.id] = {
  //       canReserve: true,
  //       buttonText: "Reserve",
  //       buttonStyle: {
  //         backgroundColor: "#4CAF50",
  //         paddingHorizontal: 20,
  //         paddingVertical: 10,
  //         borderRadius: 20,
  //       },
  //       textStyle: { color: "#FFFFFF", fontWeight: "600" },
  //       isBooked: false,
  //     };
  //     return acc;
  //   }, {} as Record<string, any>);

  //   setGameStatuses(initialStatuses);
  // }, [allGames]);

  // Load game statuses for allGames
  // useEffect(() => {
  //   let isMounted = true;
  //   const controller = new AbortController();

  //   const loadGameStatuses = async () => {
  //     if (isLoadingStatuses) return;

  //     try {
  //       setIsLoadingStatuses(true);
  //       const games = allGames;
  //       const currentTime = Date.now();
  //       const updatedStatuses: Record<string, any> = {};

  //       // Process games in chunks to prevent overwhelming
  //       for (let i = 0; i < games.length; i++) {
  //         if (!isMounted) break;

  //         const game = games[i];
  //         const lastUpdate = statusCache.current.get(game.id) || 0;

  //         // Only update if cache is expired (5 seconds)
  //         if (currentTime - lastUpdate > 5000) {
  //           try {
  //             const status = await getReservationStatus(game);
  //             updatedStatuses[game.id] = status;
  //             statusCache.current.set(game.id, currentTime);

  //             // Update state in batches
  //             if (isMounted && Object.keys(updatedStatuses).length > 0) {
  //               setGameStatuses((prev) => ({ ...prev, ...updatedStatuses }));
  //             }

  //             // Add delay between requests
  //             await new Promise((resolve) => setTimeout(resolve, 200));
  //           } catch (error) {
  //             console.warn(`Error loading status for game ${game.id}:`, error);
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error loading game statuses:", error);
  //     } finally {
  //       if (isMounted) {
  //         setIsLoadingStatuses(false);
  //       }
  //     }
  //   };

  //   // Load statuses immediately on mount or when dependencies change
  //   loadGameStatuses();

  //   // Clean up
  //   return () => {
  //     isMounted = false;
  //     controller.abort();
  //   };
  // }, [allGames, upcomingGames, user?.skill_level, getReservationStatus]);

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
        location_id: fixedGame.location.location_id,
        host: fixedGame.host,
        players: [],
        registered_count: 0,
        max_players: fixedGame.max_players,
        skill_level: fixedGame.skill_level,
        price: fixedGame.price,
        image_url: fixedGame.image_url,
        fixed_game_id: fixedGame.id,
        created_at: "", // required by type, ignored by backend
        updated_at: "", // required by type, ignored by backend
      };
      try {
        const created = await createGame(gameData);
        if (created && typeof created === "object" && "id" in created) {
          router.push({ pathname: "/game/[id]", params: { id: created.id } });
        } else {
          Alert.alert("Error", "Could not create game.");
        }
      } catch (err) {
        Alert.alert("Error", "Could not create game.");
      }
    }
  };

  // Add 'All Levels' option to the beginning of the skill levels array
  const skillLevels = [
    { value: "all", label: "All Levels", color: colors.skillAll },
    ...SKILL_LEVELS,
  ];

  // Accept string for compatibility with ExploreFilter
  const getSkillLevelColor = (level: string) => {
    if (level === "all") return colors.skillAll;
    const skillLevel = SKILL_LEVELS.find((sl) => sl.value === level);
    return skillLevel ? skillLevel.color : colors.skillAll;
  };

  const isSkillLevelMatch = (gameSkillLevel: SkillLevel) => {
    return (
      selectedSkillLevel === "all" || gameSkillLevel === selectedSkillLevel
    );
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
      <ExploreFilter
        selectedSkillLevel={actualFilter}
        setSelectedSkillLevel={setActualFilter}
        showSkillFilter={showSkillFilter}
        setShowSkillFilter={setShowSkillFilter}
        skillLevels={skillLevels}
        getSkillLevelColor={getSkillLevelColor}
        styles={styles}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {sortedDaysArray.length === 0 && (
          <ThemedView type='emptyStateContainer'>
            <IconSymbol
              name='calendar'
              size={48}
              color={colors.icon}
              style={{ marginBottom: 16, opacity: 0.5 }}
            />
            <ThemedText type='emptyStateTitle'>No games found</ThemedText>
            <ThemedText type='emptyStateText'>
              There are no games available for the selected skill level. Try
              changing the filter or check back later.
            </ThemedText>
          </ThemedView>
        )}
        {sortedDaysArray.map((dayObj: any) => (
          <ThemedView key={dayObj.dateUTC} type='dateSection'>
            <ThemedView
              type='dateTitleContainer'
              borderColorType='text'
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText type='sectionTitle'>{dayObj.day}</ThemedText>
              <ThemedText type='sectionTitle'>{dayObj.displayDate}</ThemedText>
            </ThemedView>
            {dayObj.games.map((game: any) => (
              <GameCard
                key={game?.fixedGame?.id}
                game={game.game}
                fixedGame={game.fixedGame}
                isSkillLevelMatch={isSkillLevelMatch(game.skillLevel)}
                gameStatus={gameStatuses[game.id]}
                isLoadingStatuses={isLoadingStatuses}
                styles={styles}
                getSkillLevelColor={getSkillLevelColor}
                onGamePress={handleGameSelect}
                onActionPress={(gameId, isBooked) => {
                  if (isBooked) {
                    handleCancelRegistration(gameId);
                  } else {
                    handleGameSelect(gameId);
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
        animationType='slide'
        transparent
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <ThemedView
          type='modalContentCustom'
          style={[
            styles.modalContainer,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <ThemedText type='title'>Cancel Registration</ThemedText>
          <ThemedText type='paragraph'>
            Are you sure you want to cancel your registration for this game?
          </ThemedText>
          <ThemedView type='centered'>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.error }]}
              onPress={() => setIsCancelModalVisible(false)}
            >
              <ThemedText type='button'>No, go back</ThemedText>
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
              <ThemedText type='button'>Yes, cancel</ThemedText>
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
