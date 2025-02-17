import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_GAMES } from '@/utils/mockData';

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
        {Object.values(MOCK_GAMES).map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => handleGameSelect(game.id)}
            activeOpacity={0.7}
          >
            <View style={styles.gameHeader}>
              <View>
                <Text style={styles.timeText}>
                  {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.courtText}>{game.location.name}</Text>
              </View>
              <View style={styles.reserveButton}>
                <Text style={styles.reserveText}>
                  {game.players.length < game.maxPlayers ? 'Reserve' : 'Join Waitlist'}
                </Text>
              </View>
            </View>

            <View style={styles.locationInfo}>
              <Text style={styles.addressText}>{game.location.address}</Text>
              <Text style={styles.cityText}>{game.location.city}, {game.location.state}</Text>
            </View>

            <View style={styles.gameFooter}>
              <View>
                <Text style={styles.labelText}>Skill Level</Text>
                <Text style={styles.valueText}>{game.skillLevel}</Text>
              </View>
              <View>
                <Text style={styles.labelText}>Spots Available</Text>
                <Text style={styles.valueText}>
                  {game.maxPlayers - game.players.length} of {game.maxPlayers}
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
    ...Platform.select({
      ios: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
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
