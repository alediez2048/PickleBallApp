import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGames } from "@contexts/GameContext";
import { useTheme } from "@contexts/ThemeContext";
import { ThemedView } from "@components/common/ThemedView";
import { ThemedText } from "@components/common/ThemedText";
import { Button } from "@/components/common/Button";
import { MOCK_GAMES } from "@/utils/mockData";
import { useBookedGames } from "@/contexts/BookedGamesContext";
import { useAuth } from "@/contexts/AuthContext";
import { mockApi } from "@/services/mockApi";
import { SpotsAvailability } from "@/components/common/SpotsAvailability";
import { GAME_CONSTANTS } from "@/types/games";
import { RSVPList } from "@/components/common/RSVPList";
import { FirstTimeProfileForm } from "@/components/profile/FirstTimeProfileForm";
import { MembershipPlanModal } from "@/components/membership/MembershipPlanModal";
import { PaymentMethodModal } from "@/components/payment/PaymentMethodModal";
import { MembershipPlan } from "@/types/membership";
import { IconSymbol } from "@/components/common/IconSymbol";
import BackButton from "@/components/common/BackButton";
import { BookedGame } from "@/types/bookedGames";

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isProfileFormVisible, setIsProfileFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalBookedPlayers, setTotalBookedPlayers] = useState(0);
  const { addBookedGame, cancelBooking, listBookedGamesForUser } =
    useBookedGames();
  const [upcomingGames, setUpcomingGames] = useState<BookedGame[]>([]);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<
    (typeof MOCK_GAMES)[keyof typeof MOCK_GAMES] | null
  >(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const { getGame } = useGames();
  const { colors } = useTheme();

  // Get the correct game based on the ID
  const game = getGame(id as string);

  // Load total booked players using the global tracking system
  useEffect(() => {
    const loadTotalBookedPlayers = async () => {
      if (game) {
        // const count = await mockApi.getGameBookings(game.id);
        // setTotalBookedPlayers(count);
      }
    };
    loadTotalBookedPlayers();
    fetchBookedGames();
  }, [game]);

  const fetchBookedGames = async () => {
    try {
      const games = await listBookedGamesForUser();
      setUpcomingGames(games);
    } catch (error) {
      console.error("Error fetching upcoming games:", error);
      Alert.alert("Error", "Failed to fetch upcoming games. Please try again.");
    }
  };

  // Defensive: players array may be undefined
  const totalPlayers =
    (game?.players?.length || 0) +
    (typeof totalBookedPlayers !== "undefined" ? totalBookedPlayers : 0);

  // Check if user has already registered for this game
  const isRegistered = upcomingGames.some(
    (bookedGame: BookedGame) =>
      bookedGame.gameId === id && bookedGame.status === "upcoming"
  );

  // If game not found, show error or redirect
  if (!game) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Game not found.</ThemedText>
      </ThemedView>
    );
  }

  // Find the booked game to get its ID
  const bookedGame = upcomingGames.find(
    (game: BookedGame) => game.gameId === id && game.status === "upcoming"
  );

  const handleBookingConfirm = async () => {
    // Prevent double submission
    if (isLoading) return;

    try {
      setIsLoading(true);

      // Double check registration status before proceeding
      if (isRegistered) {
        throw new Error("You have already signed up for this game");
      }

      const now = new Date();

      const bookingData = {
        game_id: id as string,
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        court_name: game.location?.name || "",
        location_id: game.location_id || "",
        price: game.price,
        user_id: user?.id || "",
        skill_rating: 5,
        user_info: user,
        status: "upcoming",
      };

      await addBookedGame(bookingData);
      setIsBookingModalVisible(false); // Close modal after successful booking
      setIsSuccessModalVisible(true);
    } catch (error) {
      Alert.alert(
        "Sign Up Failed",
        error instanceof Error
          ? error.message
          : "Failed to sign up for the game. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBooking = () => {
    setIsSuccessModalVisible(false);
    // Stay on the current screen instead of navigating away
  };

  const handleExploreMore = () => {
    setIsSuccessModalVisible(false);
    router.push("/(tabs)/explore");
  };

  const handleCancelRegistration = async () => {
    try {
      // Make sure we have the booking
      if (!bookedGame) {
        throw new Error("Could not find your registration for this game");
      }

      setIsCancelModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to cancel registration. Please try again.");
    }
  };

  const handleConfirmCancel = async () => {
    try {
      if (!bookedGame) {
        throw new Error("Could not find your registration for this game");
      }

      setIsLoading(true);
      await cancelBooking(bookedGame.id);
      setIsCancelModalVisible(false);
      Alert.alert("Success", "Your registration has been cancelled.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to cancel registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookButtonPress = () => {
    // Check if user has completed their profile
    console.debug("[GameDetails] Platform:", Platform.OS);

    // if (!user?.has_completed_profile) {
    console.debug("[GameDetails] Showing profile form modal");
    // Show profile completion modal directly
    setIsProfileFormVisible(true);
    return;
    // }

    console.debug("[GameDetails] Showing booking confirmation modal");
    // Proceed with booking
    // setIsBookingModalVisible(true);
  };

  const handleProfileComplete = () => {
    setIsProfileFormVisible(false);
    setShowMembershipModal(true);
  };

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setShowMembershipModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async () => {
    setShowPaymentModal(false);
    try {
      // After payment is complete, show the booking modal to complete the reservation
      setIsBookingModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to complete booking. Please try again.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <BackButton />
      {/* Header */}
      <ThemedView>
        <ThemedText
          type="title"
          style={{
            textAlign: "center",
            paddingVertical: 10,
            marginVertical: 10,
          }}
        >
          Game Details
        </ThemedText>
      </ThemedView>
      {/* Game Summary */}
      <ThemedView style={styles.twoRows}>
        <ThemedView style={styles.oneRowColumn}>
          <ThemedView>
            <ThemedText type="badge">Start</ThemedText>
            <ThemedText type="sectionTitle">
              {new Date(game.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </ThemedView>
          <ThemedView>
            <ThemedText type="badge">End</ThemedText>
            <ThemedText type="sectionTitle">
              {new Date(game.end_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.oneRowColumn}>
          <ThemedText type="sectionTitle" style={styles.alignRight}>
            {new Date(game.end_time).toLocaleDateString("en-US")}
          </ThemedText>
          <ThemedView>
            <ThemedText
              type="subtitle"
              colorType="primary"
              style={styles.alignRight}
            >
              {game.location?.name}
            </ThemedText>
            <ThemedView>
              <ThemedText type="default" style={styles.alignRight}>
                {game.location?.address}
              </ThemedText>
              <ThemedText type="caption" style={styles.alignRight}>
                {game.location?.city}, {game.location?.state}{" "}
                {game.location?.zip_code}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      {/* Game Stats */}
      <ThemedView
        borderColorType="text"
        borderWidth="bold"
        style={[styles.section, styles.statsSection]}
      >
        <ThemedView style={styles.statItem}>
          <ThemedText type="label" align="center" colorType="label">
            Skill Level
          </ThemedText>
          <ThemedText type="value" align="center">
            {game.skill_level}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.statDivider} />
        <ThemedView style={styles.statItem}>
          <ThemedText type="label" align="center" colorType="label">
            Price
          </ThemedText>
          <ThemedText type="value" align="center">
            ${game.price}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.statDivider} />
        <ThemedView style={styles.statItem}>
          <SpotsAvailability gameId={game.id} />
        </ThemedView>
      </ThemedView>
      {/* Game Host */}
      {/* <ThemedView style={styles.section}>
        <ThemedText type='sectionTitle'>Game Host</ThemedText>
        <ThemedView style={styles.captainCard}>
          <ThemedView style={styles.captainInfo}>
            <ThemedText style={styles.captainName}>{game.host.name}</ThemedText>
            <ThemedText style={styles.captainStats}>
              Skill Level: {game.host.skillLevel}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView> */}
      {/* Players */}
      <ThemedView style={styles.section}>
        {/* TODO: RSVPList component, ensure it uses ThemedText/ThemedView */}
      </ThemedView>
      {/* Footer with conditional buttons */}
      <ThemedView style={styles.footer}>
        {isRegistered ? (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleCancelRegistration}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.signOutText}>Cancel</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.reserveButton,
              game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS &&
                styles.disabledButton,
            ]}
            onPress={handleBookButtonPress}
            activeOpacity={0.7}
            disabled={game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS}
          >
            <ThemedText
              style={[
                styles.reserveText,
                game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS &&
                  styles.disabledButtonText,
              ]}
            >
              {game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS
                ? "Game Full"
                : "Book"}
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={isBookingModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => !isLoading && setIsBookingModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => !isLoading && setIsBookingModalVisible(false)}
              style={styles.modalCloseButton}
            >
              {/* <IconSymbol name='xmark' size={24} color='#666666' /> */}
            </TouchableOpacity>
            <ThemedText className="mb-4" type="subtitle">
              {new Date(game.start_time).toLocaleDateString("en-US")}
            </ThemedText>
            <ThemedView style={styles.bookingGameCard}>
              <ThemedView style={styles.bookingTimeContainer}>
                <ThemedText type="bold" colorType={"white"}>
                  {new Date(game.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.bookingLocationContainer}>
                <ThemedText style={styles.bookingLocationName}>
                  {game.location?.name}
                </ThemedText>
                <ThemedText style={styles.bookingLocationAddress}>
                  {game.location?.address}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.bookingSummaryCard}>
              <ThemedText style={styles.summaryTitle}>Summary</ThemedText>
              <ThemedView style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Price</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  ${game.price}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Skill Level</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {game.skill_level}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>
                  Available Spots
                </ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {game.max_players - totalPlayers} of {game.max_players}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedText style={styles.bookingNote}>
              By booking, you agree to participate in this game and follow court
              rules and etiquette.
            </ThemedText>

            <ThemedView style={styles.bookingActions}>
              <TouchableOpacity
                style={styles.cancelBookingButton}
                onPress={() => !isLoading && setIsBookingModalVisible(false)}
                disabled={isLoading}
              >
                <ThemedText style={styles.cancelBookingText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBookingButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleBookingConfirm}
                disabled={isLoading}
              >
                <ThemedText style={styles.confirmBookingText}>
                  {isLoading ? "Booking..." : "Confirm Booking"}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <ThemedView style={styles.successModalOverlay}>
          <ThemedView style={styles.successModalContent}>
            <TouchableOpacity
              onPress={() => setIsSuccessModalVisible(false)}
              style={styles.successCloseButton}
            ></TouchableOpacity>

            <ThemedView style={styles.successIconContainer}>
              <ThemedView style={styles.successIconCircle}>
                <IconSymbol name="checkmark" size={40} color="#FFFFFF" />
              </ThemedView>
            </ThemedView>

            <ThemedText style={styles.successTitle}>You're all set!</ThemedText>
            <ThemedText style={styles.successSubtitle}>
              Get ready to play!
            </ThemedText>

            <ThemedView colorType="primary" style={styles.successGameCard}>
              <ThemedView style={styles.successTimeContainer}>
                <ThemedText type="value">
                  {new Date(game.start_time).toLocaleDateString("en-US")}
                </ThemedText>
                <ThemedText style={styles.successTime}>
                  {new Date(game.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </ThemedText>
              </ThemedView>
              <ThemedView>
                <ThemedText type="bold" colorType="primary">
                  {game.location?.city}
                </ThemedText>
                <ThemedText type="bold">{game.location?.name}</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.successDetailsContainer}>
              <ThemedView style={styles.successDetailItem}>
                {/* <IconSymbol name='trophy.fill' size={20} color='#4CAF50' /> */}
                <ThemedText style={styles.successDetailText}>
                  {game.skill_level}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.successDetailDivider} />
              <ThemedView style={styles.successDetailItem}>
                {/* <IconSymbol name='person.2.fill' size={20} color='#4CAF50' /> */}
                <ThemedText style={styles.successDetailText}>
                  {game.max_players -
                    (game.players.length + totalBookedPlayers)}{" "}
                  spots left
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <TouchableOpacity
              style={styles.findMoreButton}
              onPress={handleExploreMore}
            >
              <ThemedText style={styles.findMoreButtonText}>
                Find More Games
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Cancel Registration Modal */}
      <Modal
        visible={isCancelModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => !isLoading && setIsCancelModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => !isLoading && setIsCancelModalVisible(false)}
              style={styles.modalCloseButton}
            >
              {/* <IconSymbol name='xmark' size={24} color='#666666' /> */}
            </TouchableOpacity>

            <ThemedText style={styles.modalTitle}>
              Cancel Registration
            </ThemedText>

            <ThemedView style={styles.bookingGameCard}>
              <ThemedView style={styles.bookingTimeContainer}>
                <ThemedText colorType={"default"}>
                  {new Date(game.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.bookingLocationContainer}>
                <ThemedText style={styles.bookingLocationName}>
                  {game.location?.name}
                </ThemedText>
                <ThemedText style={styles.bookingLocationAddress}>
                  {game.location?.address}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.bookingSummaryCard}>
              <ThemedText style={styles.summaryTitle}>Game Details</ThemedText>
              <ThemedView style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Skill Level</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {game.skill_level}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Price</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  ${game.price}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Booking ID</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {bookedGame?.id ? bookedGame.id.split("_")[0] : "N/A"}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedText style={[styles.bookingNote, { color: "#F44336" }]}>
              By canceling, you will lose your spot in this game. This action
              cannot be undone.
            </ThemedText>

            <ThemedView style={styles.bookingActions}>
              <TouchableOpacity
                style={styles.keepBookingButton}
                onPress={() => !isLoading && setIsCancelModalVisible(false)}
                disabled={isLoading}
              >
                <ThemedText style={styles.keepBookingText}>
                  Keep My Spot
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmCancelButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleConfirmCancel}
                disabled={isLoading}
              >
                <ThemedText style={styles.confirmCancelText}>
                  {isLoading ? "Canceling..." : "Yes, Cancel Game"}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Profile Form Modal */}
      <Modal
        visible={isProfileFormVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isLoading && setIsProfileFormVisible(false)}
      >
        <SafeAreaView style={styles.profileFormOverlay}>
          <ThemedView style={styles.profileFormContainer}>
            <ThemedView style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => !isLoading && setIsProfileFormVisible(false)}
                style={styles.modalCloseButton}
              >
                <IconSymbol name="xmark" size={24} />
              </TouchableOpacity>
              <ThemedText type="defaultSemiBold">
                Complete Your Profile
              </ThemedText>
            </ThemedView>
            <ScrollView style={styles.profileFormScroll}>
              <FirstTimeProfileForm onComplete={handleProfileComplete} />
            </ScrollView>
          </ThemedView>
        </SafeAreaView>
      </Modal>

      {/* Membership Plan Modal */}
      <MembershipPlanModal
        visible={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        onSelectPlan={handlePlanSelect}
      />

      {/* Payment Method Modal */}
      {selectedPlan && (
        <PaymentMethodModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
          selectedPlan={selectedPlan}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  twoRows: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 2,
    gap: 4,
  },
  oneRowColumn: {
    flex: 1,
    flexDirection: "column",
    padding: 8,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  section: {
    padding: 10,
    margin: 10,
  },
  alignRight: {
    textAlign: "right",
  },
  courtText: {
    fontSize: 18,

    marginBottom: 8,
  },
  locationInfo: {
    marginTop: 8,
  },
  addressText: {
    marginBottom: 2,
  },
  cityText: {
    color: "#666666",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: "100%",
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  captainCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  captainInfo: {
    flex: 1,
  },
  captainName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  captainStats: {
    fontSize: 14,
    color: "#666666",
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  reserveButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
  },
  reserveText: {
    fontWeight: "600",
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: "#F44336",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
  },
  signOutText: {
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "85%",
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalCloseButton: {
    position: "absolute",
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    flex: 1,
  },
  bookingGameCard: {
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bookingTimeContainer: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  bookingTime: {
    fontSize: 16,
    fontWeight: "600",
  },
  bookingLocationContainer: {
    flex: 1,
  },
  bookingLocationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bookingLocationAddress: {
    fontSize: 14,
    color: "#666666",
  },
  bookingSummaryCard: {
    borderRadius: 16,
    padding: 12,
    width: "100%",
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  bookingNote: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  bookingActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  cancelBookingButton: {
    flex: 1,
    backgroundColor: "#F44336",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#F44336",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  confirmBookingButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#4CAF50",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cancelBookingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmBookingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  successModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "85%",
    maxWidth: 400,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successCloseButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 8,
    zIndex: 1,
  },
  successIconContainer: {
    marginTop: 12,
    marginBottom: 20,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#4CAF50",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
  },
  successGameCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 10,
    width: "100%",
    marginBottom: 10,
  },
  successTimeContainer: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  successTime: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successLocationContainer: {
    flex: 1,
  },
  successLocationName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  successAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  successLocationAddress: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  successDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  successDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successDetailText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  successDetailDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  findMoreButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#4CAF50",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  findMoreButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#000000",
    fontSize: 16,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  keepBookingButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#4CAF50",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  keepBookingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: "#F44336",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#F44336",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  confirmCancelText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  profileFormOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profileFormContainer: {
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    height: "90%",
    maxHeight: "90%",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    position: "relative",
  },
  profileFormScroll: {
    flex: 1,
  },
});
