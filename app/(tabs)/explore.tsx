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
import { SkillLevel, Game, GameStatus } from "@/types/games";
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

// Type for merged game (scheduled or fixed)
type MergedGame = Game & {
  isFixed?: boolean;
  dayOfWeek?: string;
  fixedStartTime?: string;
  durationMinutes?: number;
};

// Move allGames and related logic to the top of the ExploreScreen function, before any useEffect or variable that uses it
export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const upcomingGames = useUpcomingBookedGames();
  const { cancelBooking } = useBookedGames();
  const { games, fetchGames, loading: loadingGames } = useGames();
  const {
    fixedGames,
    fetchFixedGames,
    loading: loadingFixedGames,
  } = useFixedGames();

  // --- Merged games logic must be here ---
  const today = new Date();
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(today.getDate() + 14);

  const scheduledGames: MergedGame[] = games.filter((game) => {
    const start = new Date(game.startTime);
    return (
      start >= today &&
      start <= twoWeeksFromNow &&
      Array.isArray(game.players) &&
      game.players.length > 0
    );
  });

  const mappedFixedGames: MergedGame[] = fixedGames.map((fg) => ({
    id: fg.id,
    title: fg.title,
    description: fg.description || "",
    startTime: "",
    endTime: "",
    location: {
      id: fg.location_id,
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      coordinates: { latitude: 0, longitude: 0 },
    },
    host: fg.host,
    players: [],
    registeredCount: 0,
    maxPlayers: fg.max_players,
    skillLevel: fg.skill_level,
    price: fg.price,
    imageUrl: fg.image_url,
    status: GameStatus.Upcoming,
    createdAt: fg.created_at,
    updatedAt: fg.updated_at,
    isFixed: true,
    dayOfWeek: fg.day_of_week,
    fixedStartTime: fg.start_time,
    durationMinutes: fg.duration_minutes,
  }));

  const allGames: MergedGame[] = [...mappedFixedGames, ...scheduledGames];
  // --- End merged games logic ---

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
            backgroundColor: "#4CAF50",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
          },
          textStyle: { color: "#FFFFFF", fontWeight: "600" },
          isBooked: false,
        };
      }
      try {
        if (isGameBooked(game.id)) {
          return {
            canReserve: false,
            buttonText: "Cancel",
            buttonStyle: {
              backgroundColor: "#F44336",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
            },
            textStyle: { color: "#FFFFFF", fontWeight: "600" },
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
              backgroundColor: "#4CAF50",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
            },
            textStyle: { color: "#FFFFFF", fontWeight: "600" },
            isBooked: false,
          };
        }

        return {
          canReserve: false,
          buttonText: "Join Waitlist",
          buttonStyle: {
            backgroundColor: "#FFA000",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
          },
          textStyle: { color: "#FFFFFF", fontWeight: "600" },
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
            backgroundColor: "#E0E0E0",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
          },
          textStyle: { color: "#666666", fontWeight: "600" },
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

  const handleGameSelect = (gameId: string) => {
    router.push({
      pathname: "/game/[id]",
      params: { id: gameId },
    });
  };

  const filteredGames = allGames.filter((game) => {
    if (selectedSkillLevel === "all") return true;
    return game.skillLevel === selectedSkillLevel;
  });

  // Function to group games by date
  // Grouping: for fixed games, group by day_of_week; for scheduled, by date
  const groupGamesByDate = (
    games: MergedGame[]
  ): Record<string, MergedGame[]> => {
    const groupedGames: Record<string, MergedGame[]> = {};
    games.forEach((game) => {
      if (game.isFixed) {
        const key = game.dayOfWeek || "Fixed";
        if (!groupedGames[key]) groupedGames[key] = [];
        groupedGames[key].push(game);
      } else {
        const gameDate = new Date(game.startTime);
        const today = new Date();
        const gameDateMidnight = new Date(
          gameDate.getFullYear(),
          gameDate.getMonth(),
          gameDate.getDate()
        );
        const todayMidnight = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const tomorrowMidnight = new Date(todayMidnight);
        tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
        let dateKey: string;
        if (gameDateMidnight.getTime() === todayMidnight.getTime()) {
          dateKey = "Today";
        } else if (gameDateMidnight.getTime() === tomorrowMidnight.getTime()) {
          dateKey = "Tomorrow";
        } else {
          dateKey = gameDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
        }
        if (!groupedGames[dateKey]) groupedGames[dateKey] = [];
        groupedGames[dateKey].push(game);
      }
    });
    Object.keys(groupedGames).forEach((dateKey) => {
      groupedGames[dateKey].sort((a, b) => {
        if (a.isFixed && b.isFixed) return 0;
        if (a.isFixed) return -1;
        if (b.isFixed) return 1;
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      });
    });
    return groupedGames;
  };

  const groupedGames = groupGamesByDate(filteredGames);

  // Get sorted date keys (Today, Tomorrow, then chronological order)
  const getOrderedDateKeys = (): string[] => {
    const dateKeys = Object.keys(groupedGames);

    return dateKeys.sort((a: string, b: string) => {
      if (a === "Today") return -1;
      if (b === "Today") return 1;
      if (a === "Tomorrow") return -1;
      if (b === "Tomorrow") return 1;

      // For other dates, convert to date objects and compare
      const dateA = new Date(a.replace(/Today|Tomorrow/g, ""));
      const dateB = new Date(b.replace(/Today|Tomorrow/g, ""));

      return dateA.getTime() - dateB.getTime();
    });
  };

  const orderedDateKeys = getOrderedDateKeys();

  // Add 'All Levels' option to the beginning of the skill levels array
  const skillLevels = [
    { value: "all" as const, label: "All Levels" },
    ...SKILL_LEVELS,
  ];

  const getSkillLevelColor = (level: SkillLevel | "all") => {
    switch (level) {
      case SkillLevel.Beginner:
        return "#4CAF50";
      case SkillLevel.Intermediate:
        return "#2196F3";
      case SkillLevel.Advanced:
        return "#F44336";
      case SkillLevel.Open:
        return "#9C27B0";
      default:
        return "#666666";
    }
  };

  const isSkillLevelMatch = (gameSkillLevel: SkillLevel) => {
    if (!user?.skill_level) return false;
    return gameSkillLevel === user.skill_level;
  };

  const getBookedGameId = (gameId: string) => {
    const bookedGame = upcomingGames.find(
      (game) => game.gameId === gameId && game.status === "upcoming"
    );
    return bookedGame?.id;
  };

  const handleCancelRegistration = async (gameId: string) => {
    try {
      const game = allGames.find((g) => g.id === gameId);
      if (!game) {
        throw new Error("Game not found");
      }
      const bookedGame = upcomingGames.find(
        (game) => game.gameId === gameId && game.status === "upcoming"
      );
      if (!bookedGame) {
        throw new Error("Could not find your registration for this game");
      }
      setSelectedGame(game);
      setIsCancelModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to cancel registration. Please try again.");
    }
  };

  const handleGamePress = (gameId: string) => {
    const game = allGames.find((g) => g.id === gameId);
    if (!game) return;
    if (!isSkillLevelMatch(game.skillLevel)) {
      Alert.alert(
        "Skill Level Mismatch",
        `This game is for ${
          game.skillLevel
        } players. Please find a game that matches your skill level (${
          user?.skill_level || "Not Set"
        }).`,
        [{ text: "OK" }]
      );
      return;
    }
    router.push({
      pathname: "/game/[id]",
      params: { id: gameId },
    });
  };

  // Only fetch on mount, not on every change of fetchGames/fetchFixedGames references
  useEffect(() => {
    // fetchGames();
    // fetchFixedGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView type='section' borderColorType='primary' borderWidth={2}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSkillFilter((v) => !v)}
        >
          <ThemedView
            type='bordered'
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          >
            <IconSymbol name='filter' size={20} color='default' />
            <ThemedText
              type='paragraph'
              colorType='default'
              style={{ flex: 1 }}
            >
              {skillLevels.find((s) => s.value === selectedSkillLevel)?.label}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
        {showSkillFilter && (
          <ThemedView type='surface' style={styles.scrollFilterDropdown}>
            {skillLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                onPress={() => {
                  setSelectedSkillLevel(level.value);
                  setShowSkillFilter(false);
                }}
              >
                <ThemedView
                  type='badgeContainer'
                  style={
                    selectedSkillLevel === level.value
                      ? { backgroundColor: "#f1f8e94e" }
                      : {}
                  }
                >
                  <ThemedView
                    style={{
                      ...styles.badgeDot,
                      backgroundColor: getSkillLevelColor(level.value),
                    }}
                  />
                  <ThemedText
                    type={
                      selectedSkillLevel === level.value ? "bold" : "paragraph"
                    }
                  >
                    {level.label}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {orderedDateKeys.length === 0 && (
          <ThemedView type='emptyStateContainer'>
            <IconSymbol
              name='calendar'
              size={48}
              color='#bbb'
              style={{ marginBottom: 16, opacity: 0.5 }}
            />
            <ThemedText type='emptyStateTitle'>No games found</ThemedText>
            <ThemedText type='emptyStateText'>
              There are no games available for the selected skill level. Try
              changing the filter or check back later.
            </ThemedText>
          </ThemedView>
        )}
        {orderedDateKeys.map((dateKey) => (
          <ThemedView key={dateKey} type='dateSection'>
            <ThemedView type='dateTitleContainer' borderColorType='text'>
              <ThemedText type='sectionTitle'>{dateKey}</ThemedText>
            </ThemedView>
            {groupedGames[dateKey].map((game) => (
              <ThemedView
                key={game.id}
                type='gameCard'
                style={
                  isSkillLevelMatch(game.skillLevel)
                    ? {}
                    : styles.gameCardMismatch
                }
              >
                <TouchableOpacity onPress={() => handleGamePress(game.id)}>
                  <ThemedView
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <ThemedText
                      type='title'
                      style={{ fontSize: 24, marginBottom: 4 }}
                    >
                      {new Date(game.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </ThemedText>
                    <ThemedText type='paragraph'>{game.title}</ThemedText>
                    <ThemedText type='paragraph'>
                      {game.location.name}
                    </ThemedText>
                    <ThemedText type='caption'>
                      {game.location.address}
                    </ThemedText>
                    <ThemedText type='caption'>
                      {game.location.city}, {game.location.state}
                    </ThemedText>
                    <ThemedView
                      type='badgeContainer'
                      style={{ backgroundColor: "#f5f5f5" }}
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
                    <ThemedText type='caption'>
                      {game.location.address}
                    </ThemedText>
                    <ThemedText type='caption'>
                      {game.location.city}, {game.location.state}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView type='gameFooter'>
                    <ThemedView style={{ flex: 1 }}>
                      <ThemedText type='caption'>Spots</ThemedText>
                      <SpotsAvailability gameId={game.id} />
                    </ThemedView>
                    <TouchableOpacity
                      disabled={isLoadingStatuses}
                      onPress={() => {
                        if (gameStatuses[game.id]?.isBooked) {
                          handleCancelRegistration(game.id);
                        } else {
                          handleGameSelect(game.id);
                        }
                      }}
                    >
                      <ThemedView style={gameStatuses[game.id]?.buttonStyle}>
                        <ThemedText
                          type={
                            gameStatuses[game.id]?.isBooked
                              ? "buttonCancel"
                              : gameStatuses[game.id]?.buttonText ===
                                "Join Waitlist"
                              ? "buttonWaitlist"
                              : gameStatuses[game.id]?.buttonText ===
                                "Unavailable"
                              ? "buttonDisabled"
                              : "button"
                          }
                        >
                          {gameStatuses[game.id]?.buttonText}
                        </ThemedText>
                      </ThemedView>
                    </TouchableOpacity>
                  </ThemedView>
                </TouchableOpacity>
              </ThemedView>
            ))}
          </ThemedView>
        ))}
      </ScrollView>

      {/* Modal de cancelación */}
      <Modal
        visible={isCancelModalVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <ThemedView type='modalContentCustom'>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setIsCancelModalVisible(false)}
          >
            <IconSymbol name='xmark' size={24} color='#000' />
          </TouchableOpacity>
          <ThemedText
            type='title'
            style={{ marginTop: 12, marginBottom: 24, textAlign: "center" }}
          >
            Cancel Registration
          </ThemedText>
          <ThemedView
            type='card'
            style={{
              width: "100%",
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ThemedView
              style={{
                backgroundColor: "#4CAF50",
                padding: 12,
                borderRadius: 12,
                marginRight: 12,
              }}
            >
              <ThemedText type='button'>
                {selectedGame &&
                  new Date(selectedGame.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </ThemedText>
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText
                type='paragraph'
                style={{ fontWeight: "600", color: "#000" }}
              >
                {selectedGame?.location.name}
              </ThemedText>
              <ThemedText type='caption'>
                {selectedGame?.location.address}
              </ThemedText>
              <ThemedText type='caption'>
                {selectedGame?.location.city}, {selectedGame?.location.state}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText type='paragraphCenter' style={{ marginBottom: 24 }}>
            Are you sure you want to cancel your registration for this game?
          </ThemedText>
          <ThemedView style={styles.modalActionRow}>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => setIsCancelModalVisible(false)}
            >
              <ThemedView
                style={{
                  backgroundColor: "#4CAF50",
                  paddingVertical: 16,
                  borderRadius: 30,
                  alignItems: "center",
                }}
              >
                <ThemedText type='button'>Keep Booking</ThemedText>
              </ThemedView>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={async () => {
                setIsLoading(true);
                if (selectedGame?.id) {
                  await cancelBooking(getBookedGameId(selectedGame.id)!);
                }
                setIsLoading(false);
                setIsCancelModalVisible(false);
              }}
            >
              <ThemedView
                style={{
                  backgroundColor: "#F44336",
                  paddingVertical: 16,
                  borderRadius: 30,
                  alignItems: "center",
                }}
              >
                <ThemedText type='buttonCancel'>Confirm Cancel</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    marginBottom: 2,
  },
  skillFilterDropdown: {
    position: "absolute" as const,
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gameCardMismatch: {
    opacity: 0.8,
    borderColor: "#ffcdd2",
  },
  scrollViewContent: {
    paddingBottom: Platform.select({
      ios: 100,
      android: 80,
      default: 80,
    }),
  },
  scrollFilterDropdown: {
    paddingBottom: Platform.select({
      ios: 100,
      android: 80,
      default: 20,
    }),
  },
  modalCloseButton: {
    position: "absolute" as const,
    right: 16,
    top: 16,
    padding: 8,
    zIndex: 1,
  },
  modalActionRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    width: "100%",
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 30,
    alignItems: "center" as const,
    paddingVertical: 16,
  },
});
