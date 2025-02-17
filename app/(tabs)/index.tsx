import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Button } from '@components/common/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/selectors/authSelectors';
import { useRouter } from 'expo-router';
import { useUpcomingBookedGames, useBookedGames } from '@/contexts/BookedGamesContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabHomeScreen() {
  const { signOut } = useAuth();
  const user = useUserProfile();
  const router = useRouter();
  const upcomingGames = useUpcomingBookedGames();
  const { clearAllGames } = useBookedGames();
  
  const handleGamePress = (gameId: string) => {
    router.push({
      pathname: '/game/[id]',
      params: { id: gameId }
    });
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
                {upcomingGames.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={handleClearGames}
                  >
                    Clear All Games
                  </Button>
                )}
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
                        <View style={styles.gameInfo}>
                          <Text style={styles.gameTime}>{game.time}</Text>
                          <Text style={styles.gameCourt}>{game.courtName}</Text>
                          <Text style={styles.gameAddress}>{game.location.address}</Text>
                        </View>
                        <IconSymbol name="location.fill" size={20} color="#666666" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.sectionContent}>
                  No upcoming games scheduled. Find a game to join!
                </Text>
              )}
            </View>

            <Button 
              variant="secondary" 
              onPress={signOut}
              size="md"
              style={styles.button}
            >
              Sign Out
            </Button>
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
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  sectionContent: {
    color: '#666666',
    fontSize: 16,
    lineHeight: 24,
  },
  gamesList: {
    gap: 12,
  },
  gameCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
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
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  gameCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
  },
  gameTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  gameCourt: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 2,
  },
  gameAddress: {
    fontSize: 12,
    color: '#666666',
  },
  upcomingGamesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
