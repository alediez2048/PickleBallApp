import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_GAMES } from '@/utils/mockData';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SkillLevel, Game } from '@/types/game';
import { useUserProfile } from '@/contexts/selectors/authSelectors';
import { useBookedGames, useUpcomingBookedGames } from '@/contexts/BookedGamesContext';
import { mockApi } from '@/services/mockApi';
import { SpotsAvailability } from '@/components/common/SpotsAvailability';
import { GAME_CONSTANTS } from '@/types/game';

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
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<typeof MOCK_GAMES[keyof typeof MOCK_GAMES] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  // Function to group games by date
  const groupGamesByDate = (games: Game[]): Record<string, Game[]> => {
    const groupedGames: Record<string, Game[]> = {};
    
    games.forEach(game => {
      const gameDate = new Date(game.startTime);
      const today = new Date();
      
      // Reset times to midnight for date comparison
      const gameDateMidnight = new Date(gameDate.getFullYear(), gameDate.getMonth(), gameDate.getDate());
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const tomorrowMidnight = new Date(todayMidnight);
      tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
      
      let dateKey: string;
      
      if (gameDateMidnight.getTime() === todayMidnight.getTime()) {
        dateKey = 'Today';
      } else if (gameDateMidnight.getTime() === tomorrowMidnight.getTime()) {
        dateKey = 'Tomorrow';
      } else {
        // Format date as "Day of Week, Month Day" for future dates
        dateKey = gameDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      if (!groupedGames[dateKey]) {
        groupedGames[dateKey] = [];
      }
      
      groupedGames[dateKey].push(game);
    });
    
    // Sort games by time within each day
    Object.keys(groupedGames).forEach(dateKey => {
      groupedGames[dateKey].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });
    
    return groupedGames;
  };

  // Group filtered games by date
  const groupedGames = groupGamesByDate(filteredGames);
  
  // Get sorted date keys (Today, Tomorrow, then chronological order)
  const getOrderedDateKeys = (): string[] => {
    const dateKeys = Object.keys(groupedGames);
    
    return dateKeys.sort((a: string, b: string) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Tomorrow') return -1;
      if (b === 'Tomorrow') return 1;
      
      // For other dates, convert to date objects and compare
      const dateA = new Date(a.replace(/Today|Tomorrow/g, ''));
      const dateB = new Date(b.replace(/Today|Tomorrow/g, ''));
      
      return dateA.getTime() - dateB.getTime();
    });
  };

  const orderedDateKeys = getOrderedDateKeys();

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
      const game = MOCK_GAMES[gameId];
      if (!game) {
        throw new Error('Game not found');
      }

      const bookedGame = upcomingGames.find(
        game => game.gameId === gameId && game.status === 'upcoming'
      );

      if (!bookedGame) {
        throw new Error('Could not find your registration for this game');
      }

      setSelectedGame(game);
      setIsCancelModalVisible(true);
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
        {Object.keys(groupedGames).length > 0 ? (
          orderedDateKeys.map(dateKey => (
            <View key={`date-${dateKey}`} style={styles.dateSection}>
              <View style={styles.dateTitleContainer}>
                <Text style={styles.dateTitle}>{dateKey}</Text>
                {dateKey === 'Today' || dateKey === 'Tomorrow' ? (
                  <Text style={styles.dateSubtitle}>
                    {new Date(
                      dateKey === 'Today' 
                        ? Date.now() 
                        : Date.now() + 86400000
                    ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                ) : null}
              </View>
              
              {groupedGames[dateKey].map((game) => {
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
                        <SpotsAvailability 
                          gameId={game.id} 
                          variant="card"
                          showLoadingState={false}
                        />
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
                          style={[
                            reservationStatus.buttonStyle,
                            game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS && styles.disabledButton
                          ]}
                          onPress={() => handleGamePress(game.id)}
                          disabled={game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS}
                        >
                          <Text style={[
                            reservationStatus.textStyle,
                            game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS && styles.disabledButtonText
                          ]}>
                            {game.registeredCount >= GAME_CONSTANTS.MAX_PLAYERS 
                              ? 'Game Full' 
                              : reservationStatus.buttonText
                            }
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
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

            {selectedGame && (
              <>
                <View style={styles.bookingGameCard}>
                  <View style={styles.bookingTimeContainer}>
                    <Text style={styles.bookingTime}>
                      {new Date(selectedGame.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.bookingLocationContainer}>
                    <Text style={styles.bookingLocationName}>{selectedGame.location.name}</Text>
                    <Text style={styles.bookingLocationAddress}>{selectedGame.location.address}</Text>
                  </View>
                </View>

                <View style={styles.bookingSummaryCard}>
                  <Text style={styles.summaryTitle}>Game Details</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Skill Level</Text>
                    <Text style={styles.summaryValue}>{selectedGame.skillLevel}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Price</Text>
                    <Text style={styles.summaryValue}>${selectedGame.price}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Booking ID</Text>
                    <Text style={styles.summaryValue}>
                      {upcomingGames.find(g => g.gameId === selectedGame.id)?.id.split('_')[0] || 'N/A'}
                    </Text>
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
                    onPress={async () => {
                      try {
                        const bookedGame = upcomingGames.find(
                          game => game.gameId === selectedGame.id && game.status === 'upcoming'
                        );
                        
                        if (!bookedGame) {
                          throw new Error('Could not find your registration for this game');
                        }

                        setIsLoading(true);
                        await cancelBooking(bookedGame.id);
                        setIsCancelModalVisible(false);
                        Alert.alert('Success', 'Your registration has been cancelled.');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to cancel registration. Please try again.');
                      } finally {
                        setIsLoading(false);
                        setSelectedGame(null);
                      }
                    }}
                    disabled={isLoading}
                  >
                    <Text style={styles.confirmCancelText}>
                      {isLoading ? 'Canceling...' : 'Yes, Cancel Game'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    right: 16,
    top: 16,
    padding: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
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
  // Styles for date sections
  dateSection: {
    marginBottom: 16,
  },
  dateTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginRight: 8,
  },
  dateSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
});
