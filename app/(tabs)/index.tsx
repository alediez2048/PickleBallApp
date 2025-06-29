import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useBookedGames } from "@/contexts/BookedGamesContext";
import { IconSymbol } from "@/components/common/IconSymbol";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { BookedGame } from "@/types/bookedGames";

export default function TabHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [upcomingGames, setUpcomingGames] = useState<BookedGame[]>([]);
  const { listBookedGamesForUser } = useBookedGames();

  // Fetch upcoming booked games for the user
  useEffect(() => {
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

  const handleGamePress = (gameId: string) => {
    // Find the booked game to get its original game ID
    const bookedGame = upcomingGames.find((game) => game.id === gameId);
    if (bookedGame) {
      router.push({
        pathname: "/game/[id]",
        params: { id: bookedGame.game_id },
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView colorType="text" style={styles.banner}>
        <ThemedText type="title" colorType="background">
          Hi {user?.name || "User"}
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.contentContainer}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" colorType="primary">
            Welcome to PicklePass
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Find and join pickleball games near you
          </ThemedText>

          <ThemedView style={styles.buttonContainer}>
            <Button
              onPress={() => router.push("/(tabs)/explore")}
              size="large"
              variant="primary"
              fullWidth
              style={styles.button}
            >
              Find Games
            </Button>

            <ThemedView style={styles.upcomingGamesContainer}>
              <ThemedView style={styles.upcomingGamesHeader}>
                <ThemedText style={styles.sectionTitle}>
                  Upcoming Games
                </ThemedText>
              </ThemedView>
              {upcomingGames.length > 0 ? (
                <ThemedView
                  style={styles.gamesList}
                  borderColorType="text"
                  borderWidth={2}
                >
                  {upcomingGames.map((game) => (
                    <TouchableOpacity
                      key={`upcoming-game-${game.id}-${Date.now()}`}
                      onPress={() => handleGamePress(game.id)}
                    >
                      <ThemedView style={styles.gameCardContent}>
                        <ThemedView>
                          <ThemedView style={styles.timeContainer}>
                            <IconSymbol
                              name="calendar"
                              size={16}
                              color="#4CAF50"
                              style={styles.timeIcon}
                            />
                            <ThemedText style={styles.gameTime}>
                              {" "}
                              {new Date(
                                game.game?.start_time
                              ).toLocaleDateString("en-US")}
                            </ThemedText>
                          </ThemedView>
                          <ThemedView style={styles.timeContainer}>
                            <IconSymbol name="time" size={16} />
                            <ThemedText>
                              {new Date(
                                game.game?.start_time
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </ThemedText>
                          </ThemedView>
                        </ThemedView>
                        <ThemedView style={styles.locationContainer}>
                          <ThemedView>
                            <ThemedText>
                              <IconSymbol
                                name="location.fill"
                                size={16}
                                style={styles.locationIcon}
                              />
                              {game.court_name}
                            </ThemedText>
                          </ThemedView>
                          <ThemedView>
                            <ThemedText numberOfLines={1}>
                              {game.location?.address}
                            </ThemedText>
                          </ThemedView>
                        </ThemedView>
                      </ThemedView>
                    </TouchableOpacity>
                  ))}
                </ThemedView>
              ) : (
                <ThemedView style={styles.emptyStateContainer}>
                  <IconSymbol
                    name="gamecontroller.fill"
                    size={40}
                    color="#666666"
                    style={styles.emptyStateIcon}
                  />
                  <ThemedText style={styles.emptyStateTitle}>
                    No Upcoming Games
                  </ThemedText>
                  <ThemedText style={styles.emptyStateText}>
                    Find and join games to see them here!
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    padding: 16,
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  button: {
    width: "100%",
    marginBottom: 12,
  },
  upcomingGamesContainer: {
    borderRadius: 16,
    width: "100%",
    marginVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  upcomingGamesHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  gamesList: {
    padding: 6,
    gap: 12,
    borderRadius: 12,
  },
  gameCard: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gameCardContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeIcon: {
    opacity: 0.8,
  },
  gameTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  locationContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  locationIcon: {
    margin: 4,
    paddingRight: 4,
  },
  emptyStateContainer: {
    padding: 32,
    alignItems: "center",
    margin: 12,
    borderRadius: 12,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
});
