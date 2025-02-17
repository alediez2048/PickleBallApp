import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Button } from '@components/common/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/selectors/authSelectors';
import { useRouter } from 'expo-router';
import { useUpcomingBookedGames, useBookedGames } from '@/contexts/BookedGamesContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabHomeScreen() {
  const user = useUserProfile();
  const router = useRouter();
  const upcomingGames = useUpcomingBookedGames();
  const { clearAllGames, cancelBooking } = useBookedGames();
  
  const handleGamePress = (gameId: string) => {
    // Find the booked game to get its original game ID
    const bookedGame = upcomingGames.find(game => game.id === gameId);
    if (bookedGame) {
      router.push({
        pathname: '/game/[id]',
        params: { id: bookedGame.gameId }
      });
    }
  };

  const handleCancelRegistration = async (gameId: string) => {
    try {
      await cancelBooking(gameId);
    } catch (error) {
      console.error('Error canceling registration:', error);
      Alert.alert('Error', 'Failed to cancel registration. Please try again.');
    }
  };

  const handleClearGames = async () => {
    try {
      await clearAllGames();
    } catch (error) {
      console.error('Error clearing games:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.welcomeText}>
          Hi {user?.name || 'User'}, Welcome to PicklePass
        </Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>
            Welcome to PicklePass
          </Text>
          <Text style={styles.subtitle}>
            Find and join pickleball games near you
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button 
              onPress={() => router.push('/explore')} 
              size="lg"
              style={styles.button}
            >
              Find Games
            </Button>
            
            <View style={styles.upcomingGamesContainer}>
              <View style={styles.upcomingGamesHeader}>
                <Text style={styles.sectionTitle}>
                  Upcoming Games
                </Text>
              </View>
              {upcomingGames.length > 0 ? (
                <View style={styles.gamesList}>
                  {upcomingGames.map((game) => (
                    <TouchableOpacity
                      key={game.id}
                      style={styles.gameCard}
                      onPress={() => handleGamePress(game.id)}
                    >
                      <View style={styles.gameCardContent}>
                        <View style={styles.gameTimeAndLocation}>
                          <View style={styles.timeContainer}>
                            <IconSymbol name="calendar" size={16} color="#4CAF50" style={styles.timeIcon} />
                            <Text style={styles.gameTime}>{game.time}</Text>
                          </View>
                          <View style={styles.locationContainer}>
                            <IconSymbol name="location.fill" size={16} color="#666666" style={styles.locationIcon} />
                            <View style={styles.locationTextContainer}>
                              <Text style={styles.gameCourt}>{game.courtName}</Text>
                              <Text style={styles.gameAddress} numberOfLines={1}>{game.location.address}</Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleCancelRegistration(game.id);
                          }}
                        >
                          <IconSymbol name="xmark" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <IconSymbol name="gamecontroller.fill" size={40} color="#666666" style={styles.emptyStateIcon} />
                  <Text style={styles.emptyStateTitle}>No Upcoming Games</Text>
                  <Text style={styles.emptyStateText}>
                    Find and join games to see them here!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    backgroundColor: '#000000',
    padding: 20,
    paddingTop: 60,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  upcomingGamesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    marginVertical: 16,
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
        elevation: 4,
      },
    }),
  },
  upcomingGamesHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  gamesList: {
    padding: 12,
    gap: 12,
  },
  gameCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameTimeAndLocation: {
    flex: 1,
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeIcon: {
    opacity: 0.8,
  },
  gameTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  locationIcon: {
    marginTop: 2,
  },
  locationTextContainer: {
    flex: 1,
  },
  gameCourt: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  gameAddress: {
    fontSize: 13,
    color: '#666666',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#F44336',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyStateContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    margin: 12,
    borderRadius: 12,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
