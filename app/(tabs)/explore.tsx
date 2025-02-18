import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_GAMES } from '@/utils/mockData';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SkillLevel } from '@/types/game';
import { useUserProfile } from '@/contexts/selectors/authSelectors';
import { useBookedGames, useUpcomingBookedGames } from '@/contexts/BookedGamesContext';
import { mockApi } from '@/services/mockApi';

export default function ExploreScreen() {
  const router = useRouter();
  const user = useUserProfile();
  const upcomingGames = useUpcomingBookedGames();
  const { cancelBooking } = useBookedGames();
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | 'all'>('all');
  const [showSkillFilter, setShowSkillFilter] = useState(false);
  const [gameStatuses, setGameStatuses] = useState<Record<string, {
    canReserve: boolean;
    buttonText: string;
    buttonStyle: any;
    textStyle: any;
    isBooked: boolean;
  }>>({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const statusCache = React.useRef<Map<string, number>>(new Map());

  const isGameBooked = React.useCallback((gameId: string) => {
    return upcomingGames.some(
      bookedGame => bookedGame.gameId === gameId && bookedGame.status === 'upcoming'
    );
  }, [upcomingGames]);

  const getReservationStatus = React.useCallback(async (game: typeof MOCK_GAMES[keyof typeof MOCK_GAMES]) => {
    try {
      if (isGameBooked(game.id)) {
        return {
          canReserve: false,
          buttonText: 'Cancel',
          buttonStyle: styles.cancelButton,
          textStyle: styles.cancelText,
          isBooked: true
        };
      }

      // Default to 0 if getGameBookings is not available
      let bookedPlayersCount = 0;
      try {
        bookedPlayersCount = await mockApi.getGameBookings(game.id);
      } catch (error) {
        console.warn(`Could not get bookings count for game ${game.id}, using default value`);
      }

      const totalPlayers = game.players.length + bookedPlayersCount;
      const spotsAvailable = game.maxPlayers - totalPlayers;

      if (spotsAvailable > 0) {
        return {
          canReserve: true,
          buttonText: 'Reserve',
          buttonStyle: styles.reserveButton,
          textStyle: styles.reserveText,
          isBooked: false
        };
      }

      return {
        canReserve: false,
        buttonText: 'Join Waitlist',
        buttonStyle: styles.waitlistButton,
        textStyle: styles.waitlistText,
        isBooked: false
      };
    } catch (error) {
      console.warn(`Error getting reservation status for game ${game.id}:`, error);
      return {
        canReserve: false,
        buttonText: 'Unavailable',
        buttonStyle: styles.disabledButton,
        textStyle: styles.disabledButtonText,
        isBooked: false
      };
    }
  }, [isGameBooked]);

  // Initialize game statuses
  useEffect(() => {
    // Set initial states for all games
    const initialStatuses = Object.values(MOCK_GAMES).reduce((acc, game) => {
      acc[game.id] = {
        canReserve: true,
        buttonText: 'Reserve',
        buttonStyle: styles.reserveButton,
        textStyle: styles.reserveText,
        isBooked: false
      };
      return acc;
    }, {} as Record<string, any>);
    
    setGameStatuses(initialStatuses);
  }, []);

  // Load game statuses with improved throttling and caching
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadGameStatuses = async () => {
      if (isLoadingStatuses) return;
      
      try {
        setIsLoadingStatuses(true);
        const games = Object.values(MOCK_GAMES);
        const currentTime = Date.now();
        const updatedStatuses: Record<string, any> = {};
        
        // Process games in chunks to prevent overwhelming
        for (let i = 0; i < games.length; i++) {
          if (!isMounted) break;
          
          const game = games[i];
          const lastUpdate = statusCache.current.get(game.id) || 0;
          
          // Only update if cache is expired (5 seconds)
          if (currentTime - lastUpdate > 5000) {
            try {
              const status = await getReservationStatus(game);
              updatedStatuses[game.id] = status;
              statusCache.current.set(game.id, currentTime);
              
              // Update state in batches
              if (isMounted && Object.keys(updatedStatuses).length > 0) {
                setGameStatuses(prev => ({
                  ...prev,
                  ...updatedStatuses
                }));
              }
              
              // Add delay between requests
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              console.warn(`Error loading status for game ${game.id}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading game statuses:', error);
      } finally {
        if (isMounted) {
          setIsLoadingStatuses(false);
        }
      }
    };

    // Load statuses immediately on mount or when dependencies change
    loadGameStatuses();

    // Clean up
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [upcomingGames, user?.skillLevel, getReservationStatus]);

  const handleGameSelect = (gameId: string) => {
    router.push({
      pathname: '/game/[id]',
      params: { id: gameId }
    });
  };

  const filteredGames = Object.values(MOCK_GAMES).filter(game => {
    if (selectedSkillLevel === 'all') return true;
    return game.skillLevel === selectedSkillLevel;
  });

  const skillLevels = [
    { value: 'all' as const, label: 'All Levels' },
    { value: SkillLevel.Beginner, label: 'Beginner' },
    { value: SkillLevel.Intermediate, label: 'Intermediate' },
    { value: SkillLevel.Advanced, label: 'Advanced' },
    { value: SkillLevel.Open, label: 'Open' },
  ];

  const getSkillLevelColor = (level: SkillLevel | 'all') => {
    switch (level) {
      case SkillLevel.Beginner:
        return '#4CAF50';
      case SkillLevel.Intermediate:
        return '#2196F3';
      case SkillLevel.Advanced:
        return '#F44336';
      case SkillLevel.Open:
        return '#9C27B0';
      default:
        return '#666666';
    }
  };

  const isSkillLevelMatch = (gameSkillLevel: SkillLevel) => {
    if (!user?.skillLevel) return false;
    return gameSkillLevel === user.skillLevel;
  };

  const getBookedGameId = (gameId: string) => {
    const bookedGame = upcomingGames.find(
      game => game.gameId === gameId && game.status === 'upcoming'
    );
    return bookedGame?.id;
  };

  const handleCancelRegistration = async (gameId: string) => {
    try {
      const bookedGame = upcomingGames.find(
        game => game.gameId === gameId && game.status === 'upcoming'
      );

      if (!bookedGame) {
        throw new Error('Could not find your registration for this game');
      }

      Alert.alert(
        'Cancel Registration',
        'Are you sure you want to cancel your registration for this game?',
        [
          {
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                await cancelBooking(bookedGame.id);
                Alert.alert('Success', 'Your registration has been cancelled.');
              } catch (error) {
                Alert.alert('Error', 'Failed to cancel registration. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel registration. Please try again.');
    }
  };

  const handleGamePress = (gameId: string) => {
    const game = MOCK_GAMES[gameId];
    if (!game) return;

    if (!isSkillLevelMatch(game.skillLevel)) {
      Alert.alert(
        'Skill Level Mismatch',
        `This game is for ${game.skillLevel} players. Please find a game that matches your skill level (${user?.skillLevel || 'Not Set'}).`,
        [{ text: 'OK' }]
      );
      return;
    }

    router.push({
      pathname: '/game/[id]',
      params: { id: gameId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Filters */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationText}>Games in Austin ▼</Text>
        </TouchableOpacity>

        {/* Skill Level Filter Button */}
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowSkillFilter(!showSkillFilter)}
        >
          <IconSymbol name="trophy.fill" size={20} color="#666666" />
          <Text style={styles.filterButtonText}>
            {selectedSkillLevel === 'all' ? 'All Levels' : selectedSkillLevel}
          </Text>
          <IconSymbol 
            name={showSkillFilter ? 'xmark' : 'chevron.down'} 
            size={16} 
            color="#666666" 
          />
        </TouchableOpacity>

        {/* Skill Level Filter Dropdown */}
        {showSkillFilter && (
          <View style={styles.skillFilterDropdown}>
            {skillLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.skillFilterOption,
                  selectedSkillLevel === level.value && styles.selectedSkillOption
                ]}
                onPress={() => {
                  setSelectedSkillLevel(level.value);
                  setShowSkillFilter(false);
                }}
              >
                <View style={styles.skillLevelBadge}>
                  <View 
                    style={[
                      styles.skillLevelDot, 
                      { backgroundColor: getSkillLevelColor(level.value) }
                    ]} 
                  />
                  <Text style={[
                    styles.skillFilterText,
                    selectedSkillLevel === level.value && styles.selectedSkillText
                  ]}>
                    {level.label}
                  </Text>
                </View>
                {selectedSkillLevel === level.value && (
                  <IconSymbol name="checkmark" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Games List */}
      <ScrollView style={styles.gamesContainer}>
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => {
            const reservationStatus = gameStatuses[game.id] || {
              canReserve: false,
              buttonText: 'Loading...',
              buttonStyle: styles.disabledButton,
              textStyle: styles.disabledButtonText,
              isBooked: false
            };
            
            // Check if the game is booked by the current user
            const isBooked = upcomingGames.some(
              bookedGame => bookedGame.gameId === game.id && bookedGame.status === 'upcoming'
            );
            
            return (
              <View
                key={`explore-${game.id}`}
                style={[
                  styles.gameCard,
                  !isSkillLevelMatch(game.skillLevel) && styles.mismatchedGameCard
                ]}
              >
                <TouchableOpacity
                  style={styles.gameCardContent}
                  onPress={() => handleGamePress(game.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.gameHeader}>
                    <View>
                      <Text style={styles.timeText}>
                        {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text style={styles.courtText}>{game.location.name}</Text>
                    </View>
                    <View style={[
                      styles.skillLevelTag,
                      { backgroundColor: getSkillLevelColor(game.skillLevel) + '15' }
                    ]}>
                      <View 
                        style={[
                          styles.skillLevelDot,
                          { backgroundColor: getSkillLevelColor(game.skillLevel) }
                        ]} 
                      />
                      <Text style={[
                        styles.skillLevelText,
                        { color: getSkillLevelColor(game.skillLevel) }
                      ]}>
                        {game.skillLevel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationInfo}>
                    <Text style={styles.addressText}>{game.location.address}</Text>
                    <Text style={styles.cityText}>{game.location.city}, {game.location.state}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.gameFooter}>
                  <View style={styles.spotsContainer}>
                    <Text style={styles.labelText}>Spots Available</Text>
                    <Text style={styles.valueText}>
                      {game.maxPlayers - (game.players.length + (upcomingGames.filter(
                        bookedGame => bookedGame.gameId === game.id && bookedGame.status === 'upcoming'
                      ).length))} of {game.maxPlayers}
                    </Text>
                  </View>
                  {isBooked ? (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelRegistration(game.id)}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={reservationStatus.buttonStyle}
                      onPress={() => handleGamePress(game.id)}
                    >
                      <Text style={reservationStatus.textStyle}>
                        {reservationStatus.buttonText}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="gamecontroller.fill" size={40} color="#666666" style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>No Games Found</Text>
            <Text style={styles.emptyStateText}>
              No games available for the selected skill level. Try adjusting your filters or check back later.
            </Text>
          </View>
        )}
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
    zIndex: 1,
  },
  locationButton: {
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 15,
    color: '#666666',
    flex: 1,
  },
  skillFilterDropdown: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  skillFilterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  selectedSkillOption: {
    backgroundColor: '#F1F8E9',
  },
  skillLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skillFilterText: {
    fontSize: 15,
    color: '#666666',
  },
  selectedSkillText: {
    color: '#000000',
    fontWeight: '500',
  },
  gamesContainer: {
    padding: 16,
    paddingBottom: Platform.select({
      ios: 100,
      android: 80,
      default: 80,
    }),
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
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gameCardContent: {
    flex: 1,
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
  skillLevelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  skillLevelText: {
    fontSize: 13,
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
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  spotsContainer: {
    flex: 1,
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
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 16,
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
    lineHeight: 20,
  },
  mismatchedGameCard: {
    opacity: 0.8,
    borderColor: '#ffcdd2',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  disabledButtonText: {
    color: '#666666',
    fontWeight: '600',
  },
  waitlistButton: {
    backgroundColor: '#FFA000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  waitlistText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
