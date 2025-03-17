import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';
import { MOCK_GAMES } from '@/utils/mockData';
import { useBookedGames, useUpcomingBookedGames, BookedGame } from '@/contexts/BookedGamesContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/services/mockApi';
import { SpotsAvailability } from '@/components/common/SpotsAvailability';
import { GAME_CONSTANTS } from '@/types/game';
import { RSVPList } from '@/components/common/RSVPList';
import { FirstTimeProfileForm } from '@/components/profile/FirstTimeProfileForm';
import { MembershipPlanModal } from '@/components/membership/MembershipPlanModal';
import { PaymentMethodModal } from '@/components/payment/PaymentMethodModal';
import { MembershipPlan } from '@/types/membership';

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { signOut, user, updateMembership } = useAuth();
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isProfileFormVisible, setIsProfileFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalBookedPlayers, setTotalBookedPlayers] = useState(0);
  const { addBookedGame, cancelBooking } = useBookedGames();
  const upcomingGames = useUpcomingBookedGames();
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<typeof MOCK_GAMES[keyof typeof MOCK_GAMES] | null>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isGameFull, setIsGameFull] = useState(false);

  // Get the correct game based on the ID
  const game = MOCK_GAMES[id as keyof typeof MOCK_GAMES];
  
  // Load total booked players using the global tracking system
  useEffect(() => {
    const loadTotalBookedPlayers = async () => {
      if (game) {
        const count = await mockApi.getGameBookings(game.id);
        setTotalBookedPlayers(count);
      }
    };
    loadTotalBookedPlayers();
  }, [game, upcomingGames]);
  
  const totalPlayers = game?.players.length + totalBookedPlayers;
  
  // Check if user has already registered for this game
  const isRegistered = upcomingGames.some(
    (bookedGame: BookedGame) => 
      bookedGame.gameId === id && 
      bookedGame.status === 'upcoming'
  );

  // If game not found, show error or redirect
  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="xmark" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Not Found</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>This game could not be found.</Text>
          <Button 
            onPress={() => router.push('/explore')}
            style={styles.errorButton}
          >
            Back to Explore
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Find the booked game to get its ID
  const bookedGame = upcomingGames.find(
    (game: BookedGame) => game.gameId === id && game.status === 'upcoming'
  );

  const handleBookingConfirm = async () => {
    // Prevent double submission
    if (isLoading) return;

    try {
      setIsLoading(true);

      // Double check registration status before proceeding
      if (isRegistered) {
        throw new Error('You have already signed up for this game');
      }

      // Format the date to match the expected format
      const currentDate = new Date();
      const uniqueId = `${id}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const bookingData = {
        id: uniqueId, // Use the generated unique ID
        gameId: id as string,
        date: currentDate.toISOString(),
        time: new Date(game.startTime).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        courtName: game.location.name,
        location: {
          address: game.location.address,
          area: game.location.name,
          city: game.location.city
        },
        skillRating: 3.7,
        price: game.price
      };

      await addBookedGame(bookingData);
      setIsBookingModalVisible(false); // Close modal after successful booking
      setIsSuccessModalVisible(true);
    } catch (error) {
      Alert.alert(
        'Sign Up Failed',
        error instanceof Error ? error.message : 'Failed to sign up for the game. Please try again.',
        [{ text: 'OK' }]
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
    router.push('/(tabs)/explore');
  };

  const handleCancelRegistration = async () => {
    try {
      // Make sure we have the booking
      if (!bookedGame) {
        throw new Error('Could not find your registration for this game');
      }
      
      setIsCancelModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel registration. Please try again.');
    }
  };

  const handleConfirmCancel = async () => {
    try {
      if (!bookedGame) {
        throw new Error('Could not find your registration for this game');
      }
      
      setIsLoading(true);
      await cancelBooking(bookedGame.id);
      setIsCancelModalVisible(false);
      Alert.alert('Success', 'Your registration has been cancelled.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookButtonPress = () => {
    // Check if game is full first (prioritize this)
    if (game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS || isGameFull || (totalPlayers >= game.maxPlayers)) {
      Alert.alert(
        'Game Full',
        'This game is currently full. Please select a different game with available spots.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Check if user has completed their profile
    console.debug('[GameDetails] Platform:', Platform.OS);
    console.debug('[GameDetails] Book button pressed');
    console.debug('[GameDetails] User profile status:', { hasCompletedProfile: user?.hasCompletedProfile });
    
    if (!user?.hasCompletedProfile) {
      console.debug('[GameDetails] Showing profile form modal');
      // Show profile completion modal directly
      setIsProfileFormVisible(true);
      return;
    }
    
    console.debug('[GameDetails] Showing booking confirmation modal');
    // Proceed with booking
    setIsBookingModalVisible(true);
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
      // Update the user's membership plan with the selected plan
      if (selectedPlan) {
        console.log('Game booking - Updating membership plan:', selectedPlan);
        await updateMembership(selectedPlan);
        console.log('Game booking - Membership plan updated successfully');
      }
      
      // After payment is complete, show the booking modal to complete the reservation
      setIsBookingModalVisible(true);
    } catch (error) {
      console.error('Game booking - Error updating membership:', error);
      Alert.alert('Error', 'Failed to complete booking. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="xmark" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Game Summary */}
        <View style={styles.section}>
          <Text style={styles.timeText}>
            {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.courtText}>{game.location.name}</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.addressText}>{game.location.address}</Text>
            <Text style={styles.cityText}>{game.location.city}, {game.location.state} {game.location.zipCode}</Text>
          </View>
        </View>

        {/* Game Stats */}
        <View style={[styles.section, styles.statsSection]}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Skill Level</Text>
            <Text style={styles.statValue}>{game.skillLevel}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Price</Text>
            <Text style={styles.statValue}>${game.price}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <SpotsAvailability 
              gameId={game.id} 
              variant="detail"
              onGameFullStatusChange={setIsGameFull}
            />
          </View>
        </View>

        {/* Game Captain */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Host</Text>
          <View style={styles.captainCard}>
            <View style={styles.captainInfo}>
              <Text style={styles.captainName}>{game.host.name}</Text>
              <Text style={styles.captainStats}>
                Skill Level: {game.host.skillLevel}
              </Text>
            </View>
          </View>
        </View>

        {/* Players */}
        <View style={styles.section}>
          <RSVPList
            gameId={game.id}
            players={game.players}
            maxPlayers={game.maxPlayers}
            onPlayerPress={(player) => {
              // TODO: Implement player profile view
              console.log('Player pressed:', player);
            }}
          />
        </View>
      </ScrollView>

      {/* Footer with conditional buttons */}
      <View style={styles.footer}>
        {isRegistered ? (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleCancelRegistration}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.reserveButton,
              (game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS || isGameFull || (totalPlayers >= game.maxPlayers)) && styles.disabledButton
            ]}
            onPress={handleBookButtonPress}
            activeOpacity={0.7}
            disabled={game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS || isGameFull || (totalPlayers >= game.maxPlayers)}
          >
            <Text style={[
              styles.reserveText,
              (game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS || isGameFull || (totalPlayers >= game.maxPlayers)) && styles.disabledButtonText
            ]}>
              {(game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS || isGameFull || (totalPlayers >= game.maxPlayers))
                ? 'Game Full' 
                : 'Book'
              }
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={isBookingModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => !isLoading && setIsBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => !isLoading && setIsBookingModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <IconSymbol name="xmark" size={24} color="#666666" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Confirm Booking</Text>

            <View style={styles.bookingGameCard}>
              <View style={styles.bookingTimeContainer}>
                <Text style={styles.bookingTime}>
                  {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.bookingLocationContainer}>
                <Text style={styles.bookingLocationName}>{game.location.name}</Text>
                <Text style={styles.bookingLocationAddress}>{game.location.address}</Text>
              </View>
            </View>

            <View style={styles.bookingSummaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price</Text>
                <Text style={styles.summaryValue}>${game.price}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Skill Level</Text>
                <Text style={styles.summaryValue}>{game.skillLevel}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Available Spots</Text>
                <Text style={styles.summaryValue}>
                  {game.maxPlayers - totalPlayers} of {game.maxPlayers}
                </Text>
              </View>
            </View>

            <Text style={styles.bookingNote}>
              By booking, you agree to participate in this game and follow court rules and etiquette.
            </Text>

            <View style={styles.bookingActions}>
              <TouchableOpacity
                style={styles.cancelBookingButton}
                onPress={() => !isLoading && setIsBookingModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelBookingText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBookingButton, isLoading && styles.disabledButton]}
                onPress={handleBookingConfirm}
                disabled={isLoading}
              >
                <Text style={styles.confirmBookingText}>
                  {isLoading ? 'Booking...' : 'Confirm Booking'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <TouchableOpacity
              onPress={() => setIsSuccessModalVisible(false)}
              style={styles.successCloseButton}
            >
              <IconSymbol name="xmark" size={24} color="#666666" />
            </TouchableOpacity>

            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <IconSymbol name="checkmark" size={40} color="#FFFFFF" />
              </View>
            </View>
            
            <Text style={styles.successTitle}>You're all set!</Text>
            <Text style={styles.successSubtitle}>Get ready to play!</Text>
            
            <View style={styles.successGameCard}>
              <View style={styles.successTimeContainer}>
                <IconSymbol name="calendar" size={20} color="#FFFFFF" style={styles.successTimeIcon} />
                <Text style={styles.successTime}>
                  {new Date(game.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
              </View>
              <View style={styles.successLocationContainer}>
                <Text style={styles.successLocationName}>{game.location.name}</Text>
                <View style={styles.successAddressContainer}>
                  <IconSymbol name="location.fill" size={16} color="#666666" style={styles.successLocationIcon} />
                  <Text style={styles.successLocationAddress}>{game.location.address}</Text>
                </View>
              </View>
            </View>

            <View style={styles.successDetailsContainer}>
              <View style={styles.successDetailItem}>
                <IconSymbol name="trophy.fill" size={20} color="#4CAF50" />
                <Text style={styles.successDetailText}>{game.skillLevel}</Text>
              </View>
              <View style={styles.successDetailDivider} />
              <View style={styles.successDetailItem}>
                <IconSymbol name="person.2.fill" size={20} color="#4CAF50" />
                <Text style={styles.successDetailText}>
                  {game.maxPlayers - (game.players.length + totalBookedPlayers)} spots left
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.findMoreButton}
              onPress={handleExploreMore}
            >
              <Text style={styles.findMoreButtonText}>Find More Games</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Registration Modal */}
      <Modal
        visible={isCancelModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => !isLoading && setIsCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => !isLoading && setIsCancelModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <IconSymbol name="xmark" size={24} color="#666666" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Cancel Registration</Text>

            <View style={styles.bookingGameCard}>
              <View style={styles.bookingTimeContainer}>
                <Text style={styles.bookingTime}>
                  {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.bookingLocationContainer}>
                <Text style={styles.bookingLocationName}>{game.location.name}</Text>
                <Text style={styles.bookingLocationAddress}>{game.location.address}</Text>
              </View>
            </View>

            <View style={styles.bookingSummaryCard}>
              <Text style={styles.summaryTitle}>Game Details</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Skill Level</Text>
                <Text style={styles.summaryValue}>{game.skillLevel}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price</Text>
                <Text style={styles.summaryValue}>${game.price}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Booking ID</Text>
                <Text style={styles.summaryValue}>{bookedGame?.id ? bookedGame.id.split('_')[0] : 'N/A'}</Text>
              </View>
            </View>

            <Text style={[styles.bookingNote, { color: '#F44336' }]}>
              By canceling, you will lose your spot in this game. This action cannot be undone.
            </Text>

            <View style={styles.bookingActions}>
              <TouchableOpacity
                style={styles.keepBookingButton}
                onPress={() => !isLoading && setIsCancelModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.keepBookingText}>Keep My Spot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmCancelButton, isLoading && styles.disabledButton]}
                onPress={handleConfirmCancel}
                disabled={isLoading}
              >
                <Text style={styles.confirmCancelText}>
                  {isLoading ? 'Canceling...' : 'Yes, Cancel Game'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Form Modal */}
      <Modal
        visible={isProfileFormVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isLoading && setIsProfileFormVisible(false)}
      >
        <SafeAreaView style={styles.profileFormOverlay}>
          <View style={styles.profileFormContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => !isLoading && setIsProfileFormVisible(false)}
                style={styles.modalCloseButton}
              >
                <IconSymbol name="xmark" size={24} color="#666666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Complete Your Profile</Text>
            </View>
            <ScrollView style={styles.profileFormScroll}>
              <FirstTimeProfileForm onComplete={handleProfileComplete} />
            </ScrollView>
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  courtText: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 8,
  },
  locationInfo: {
    marginTop: 8,
  },
  addressText: {
    color: '#000000',
    marginBottom: 2,
  },
  cityText: {
    color: '#666666',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  captainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  captainInfo: {
    flex: 1,
  },
  captainName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  captainStats: {
    fontSize: 14,
    color: '#666666',
  },
  playerCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  playerRating: {
    fontSize: 14,
    color: '#666666',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  reserveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  signOutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '85%',
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    position: 'absolute',
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    flex: 1,
  },
  bookingGameCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  bookingTime: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingLocationContainer: {
    flex: 1,
  },
  bookingLocationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  bookingLocationAddress: {
    fontSize: 14,
    color: '#666666',
  },
  bookingSummaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  bookingNote: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelBookingButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#F44336',
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
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBookingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '85%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    position: 'absolute',
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
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
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
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  successGameCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  successTimeContainer: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  successTimeIcon: {
    marginRight: 8,
  },
  successTime: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successLocationContainer: {
    flex: 1,
  },
  successLocationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  successAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successLocationIcon: {
    marginRight: 4,
  },
  successLocationAddress: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  successDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  successDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successDetailText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  successDetailDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  findMoreButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#000000',
    fontSize: 16,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  keepBookingButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#F44336',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  profileFormOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileFormContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '95%',
    maxWidth: 500,
    height: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
  },
  profileFormScroll: {
    flex: 1,
  },
}); 