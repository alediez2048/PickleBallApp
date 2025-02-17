import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';
import { MOCK_GAMES } from '@/utils/mockData';
import { useBookedGames, useUpcomingBookedGames, BookedGame } from '@/contexts/BookedGamesContext';
import { useAuth } from '@/contexts/AuthContext';

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { signOut } = useAuth();
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addBookedGame, cancelBooking } = useBookedGames();
  const upcomingGames = useUpcomingBookedGames();

  // Get the correct game based on the ID
  const game = MOCK_GAMES[id as keyof typeof MOCK_GAMES];
  
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
      setIsBookingModalVisible(false); // Close modal immediately to prevent double clicks

      // Double check registration status before proceeding
      if (isRegistered) {
        throw new Error('You have already signed up for this game');
      }

      // Create a more unique booking ID using timestamp and random string
      const randomString = Math.random().toString(36).substring(2, 8);
      const bookingId = `booking_${id}_${Date.now()}_${randomString}`;
      
      // Format the date to match the expected format
      const currentDate = new Date();
      const bookingData = {
        id: bookingId,
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
    router.push('/explore');
  };

  const handleSignOut = async () => {
    try {
      // Make sure we have the booking
      if (!bookedGame) {
        throw new Error('Could not find your registration for this game');
      }
      
      // Cancel the booking using the booking ID, not the game ID
      await cancelBooking(bookedGame.id);
      router.back(); // Go back to previous screen after canceling
    } catch (error) {
      Alert.alert('Error', 'Failed to remove you from the game. Please try again.');
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
            <Text style={styles.statLabel}>Spots Left</Text>
            <Text style={styles.statValue}>{game.maxPlayers - game.players.length}</Text>
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
          <Text style={styles.sectionTitle}>Players ({game.players.length})</Text>
          {game.players.map(player => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerRating}>Skill Level: {player.skillLevel}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer with conditional buttons */}
      <View style={styles.footer}>
        {isRegistered ? (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.reserveButton}
            onPress={() => setIsBookingModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.reserveText}>
              {game.players.length < game.maxPlayers ? 'Sign Up' : 'Join Waitlist'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={isBookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isLoading && setIsBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Sign Up</Text>
              <TouchableOpacity
                onPress={() => !isLoading && setIsBookingModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Game Details</Text>
                <Text style={styles.modalGameTime}>
                  {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.modalGameLocation}>{game.location.name}</Text>
                <Text style={styles.modalGameAddress}>{game.location.address}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Summary</Text>
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
                    {game.maxPlayers - game.players.length} of {game.maxPlayers}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalNote}>
                  By signing up, you agree to participate in this game and follow court rules and etiquette.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => !isLoading && setIsBookingModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  isLoading && styles.disabledButton
                ]}
                onPress={handleBookingConfirm}
                disabled={isLoading}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? 'Signing Up...' : 'Confirm Sign Up'}
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
            <View style={styles.successIconContainer}>
              <IconSymbol name="checkmark" size={40} color="#4CAF50" />
            </View>
            
            <Text style={styles.successTitle}>Sign Up Confirmed!</Text>
            
            <View style={styles.successGameInfo}>
              <Text style={styles.successGameTime}>
                {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.successGameLocation}>{game.location.name}</Text>
              <Text style={styles.successGameAddress}>{game.location.address}</Text>
            </View>

            <View style={styles.successNote}>
              <Text style={styles.successNoteText}>
                We've sent a confirmation email with all the details.
                See you on the court!
              </Text>
            </View>

            <View style={styles.successActions}>
              <TouchableOpacity
                style={[styles.successButton, styles.viewBookingButton]}
                onPress={handleViewBooking}
              >
                <Text style={styles.viewBookingText}>Continue to Game Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.successButton, styles.exploreButton]}
                onPress={handleExploreMore}
              >
                <Text style={styles.exploreButtonText}>Find More Games</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  modalGameTime: {
    fontSize: 14,
    color: '#000000',
  },
  modalGameLocation: {
    fontSize: 14,
    color: '#000000',
  },
  modalGameAddress: {
    fontSize: 14,
    color: '#000000',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  modalNote: {
    fontSize: 14,
    color: '#666666',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  successModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    maxHeight: '80%',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  successGameInfo: {
    marginBottom: 16,
  },
  successGameTime: {
    fontSize: 14,
    color: '#000000',
  },
  successGameLocation: {
    fontSize: 14,
    color: '#000000',
  },
  successGameAddress: {
    fontSize: 14,
    color: '#000000',
  },
  successNote: {
    marginBottom: 16,
  },
  successNoteText: {
    fontSize: 14,
    color: '#666666',
  },
  successActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  successButton: {
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  viewBookingButton: {
    backgroundColor: '#4CAF50',
  },
  viewBookingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  exploreButton: {
    backgroundColor: '#4CAF50',
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
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
}); 