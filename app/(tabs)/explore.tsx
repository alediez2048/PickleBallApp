import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// Temporary mock data for testing
const MOCK_GAMES = [
  {
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
    gameType: 'Standard Game'
  },
  {
    id: '2',
    date: new Date(Date.now() + 86400000), // Tomorrow
    time: '9:00 AM',
    courtName: 'Dove Springs',
    location: {
      address: '5701 Ainez Drive',
      area: 'South Austin',
      city: 'Austin'
    },
    skillRating: 3.8,
    spotsTotal: 15,
    spotsAvailable: 0,
    gameType: 'Standard Game'
  }
];

export default function ExploreScreen() {
  const router = useRouter();

  const handleGameSelect = (gameId: string) => {
    router.push({
      pathname: '/game/[id]',
      params: { id: gameId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Location Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationText}>Games in Austin ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Games List */}
      <ScrollView style={styles.gamesContainer}>
        {MOCK_GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => handleGameSelect(game.id)}
            activeOpacity={0.7}
          >
            <View style={styles.gameHeader}>
              <View>
                <Text style={styles.timeText}>{game.time}</Text>
                <Text style={styles.courtText}>{game.courtName}</Text>
              </View>
              <View style={styles.reserveButton}>
                <Text style={styles.reserveText}>
                  {game.spotsAvailable > 0 ? 'Reserve' : 'Join Waitlist'}
                </Text>
              </View>
            </View>

            <View style={styles.locationInfo}>
              <Text style={styles.addressText}>{game.location.address}</Text>
              <Text style={styles.areaText}>{game.location.area}</Text>
              <Text style={styles.cityText}>{game.location.city}</Text>
            </View>

            <View style={styles.gameFooter}>
              <View>
                <Text style={styles.labelText}>Average Skill Rating</Text>
                <Text style={styles.valueText}>{game.skillRating}</Text>
              </View>
              <View>
                <Text style={styles.labelText}>Spots Available</Text>
                <Text style={styles.valueText}>
                  {game.spotsAvailable} of {game.spotsTotal}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationButton: {
    alignItems: 'center',
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  gamesContainer: {
    padding: 16,
  },
  gameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  courtText: {
    fontSize: 16,
    color: '#000000',
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  reserveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationInfo: {
    marginBottom: 12,
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
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  labelText: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 4,
  },
  valueText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
