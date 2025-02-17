import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';
import { MOCK_GAMES } from '@/utils/mockData';
import { useBookedGames } from '@/contexts/BookedGamesContext';

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const { addBookedGame } = useBookedGames();

  // Get the correct game based on the ID
  const game = MOCK_GAMES[id as keyof typeof MOCK_GAMES];

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

  const handleBookingConfirm = async () => {
    try {
      // Format the date to match the expected format
      const currentDate = new Date();
      const bookingData = {
        id: `booking_${id}_${Date.now()}`,
        date: currentDate.toISOString(), // Use ISO string format
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
        skillRating: 3.7, // Default skill rating
        price: game.price,
        status: 'upcoming' // Add status field
      };

      console.log('Attempting to book game with data:', bookingData);
      await addBookedGame(bookingData);
      console.log('Game booked successfully');
      setIsBookingModalVisible(false);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Failed',
        error instanceof Error ? error.message : 'Failed to book the game. Please try again.',
        [{ text: 'OK', onPress: () => setIsBookingModalVisible(false) }]
      );
    }
  };

  const handleViewBooking = () => {
    setIsSuccessModalVisible(false);
    // Navigate to home screen to see booked games
    router.push('/(tabs)');
  };

  const handleExploreMore = () => {
    setIsSuccessModalVisible(false);
    router.push('/explore');
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

      {/* Reserve Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.reserveButton}
          onPress={() => setIsBookingModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.reserveText}>
            {game.players.length < game.maxPlayers ? 'Reserve Spot' : 'Join Waitlist'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={isBookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Reservation</Text>
              <TouchableOpacity
                onPress={() => setIsBookingModalVisible(false)}
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
                <Text style={styles.modalSectionTitle}>Booking Summary</Text>
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
                  By confirming, you agree to participate in this game and follow court rules and etiquette.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsBookingModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleBookingConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
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
            
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            
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
                <Text style={styles.viewBookingText}>View Booking</Text>
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  modalGameTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  modalGameLocation: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  modalGameAddress: {
    fontSize: 14,
    color: '#666666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
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
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
  },
  successGameInfo: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  successGameTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  successGameLocation: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  successGameAddress: {
    fontSize: 14,
    color: '#666666',
  },
  successNote: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  successNoteText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  successButton: {
    width: '100%',
    paddingVertical: 12,
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
    backgroundColor: '#F3F4F6',
  },
  exploreButtonText: {
    color: '#000000',
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
}); 