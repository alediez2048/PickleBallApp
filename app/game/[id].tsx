import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';

// Temporary mock data - in real app, this would come from an API call
const MOCK_GAME = {
  id: '1',
  date: new Date(),
  time: '7:00 PM',
  courtName: 'Givens Court',
  location: {
    address: '1100 Springdale Rd',
    area: 'Givens Park',
    city: 'Austin'
  },
  skillRating: 3.7,
  spotsTotal: 15,
  spotsAvailable: 3,
  gameType: 'Standard Game',
  price: 10,
  captain: {
    name: 'John Smith',
    rating: 4.2,
    gamesPlayed: 45
  },
  players: [
    { id: '1', name: 'Sarah Johnson', rating: 3.8 },
    { id: '2', name: 'Mike Wilson', rating: 4.0 },
    { id: '3', name: 'Emily Brown', rating: 3.5 }
  ]
};

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);

  // In a real app, we would fetch the game details using the id
  const game = MOCK_GAME;

  const handleBookingConfirm = () => {
    // Here we would handle the actual booking logic
    setIsBookingModalVisible(false);
    // Navigate to success screen or show success message
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
          <Text style={styles.timeText}>{game.time}</Text>
          <Text style={styles.courtText}>{game.courtName}</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.addressText}>{game.location.address}</Text>
            <Text style={styles.areaText}>{game.location.area}</Text>
            <Text style={styles.cityText}>{game.location.city}</Text>
          </View>
        </View>

        {/* Game Stats */}
        <View style={[styles.section, styles.statsSection]}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Skill Level</Text>
            <Text style={styles.statValue}>{game.skillRating}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Price</Text>
            <Text style={styles.statValue}>${game.price}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Spots Left</Text>
            <Text style={styles.statValue}>{game.spotsAvailable}</Text>
          </View>
        </View>

        {/* Game Captain */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Captain</Text>
          <View style={styles.captainCard}>
            <View style={styles.captainInfo}>
              <Text style={styles.captainName}>{game.captain.name}</Text>
              <Text style={styles.captainStats}>
                Rating: {game.captain.rating} · {game.captain.gamesPlayed} games
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
              <Text style={styles.playerRating}>Rating: {player.rating}</Text>
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
            {game.spotsAvailable > 0 ? 'Reserve Spot' : 'Join Waitlist'}
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
                <Text style={styles.modalGameTime}>{game.time}</Text>
                <Text style={styles.modalGameLocation}>{game.courtName}</Text>
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
                  <Text style={styles.summaryValue}>{game.skillRating}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Available Spots</Text>
                  <Text style={styles.summaryValue}>{game.spotsAvailable} of {game.spotsTotal}</Text>
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
  areaText: {
    color: '#666666',
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
}); 