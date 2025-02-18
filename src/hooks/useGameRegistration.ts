import { useState, useEffect, useCallback } from 'react';
import { mockApi } from '@/services/mockApi';
import { GAME_CONSTANTS } from '@/types/game';
import { MOCK_GAMES } from '@/utils/mockData';

interface GameRegistrationState {
  registeredCount: number;
  isLoading: boolean;
  error: Error | null;
  isFull: boolean;
  spotsLeft: number;
}

export function useGameRegistration(gameId: string) {
  const [state, setState] = useState<GameRegistrationState>({
    registeredCount: MOCK_GAMES[gameId]?.registeredCount || 0,
    isLoading: true,
    error: null,
    isFull: false,
    spotsLeft: GAME_CONSTANTS.MAX_PLAYERS,
  });

  const fetchRegistrationCount = useCallback(async () => {
    if (!gameId) {
      console.error('No gameId provided to useGameRegistration');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: new Error('Invalid game ID'),
      }));
      return;
    }

    try {
      // First try to get the count from mock data as fallback
      const mockGame = MOCK_GAMES[gameId];
      const initialCount = mockGame?.registeredCount || 0;

      // Then get the real-time count
      const count = await mockApi.getGameBookings(gameId);
      const finalCount = count || initialCount; // Use mock data if API returns 0
      const spotsLeft = GAME_CONSTANTS.MAX_PLAYERS - finalCount;

      setState({
        registeredCount: finalCount,
        isLoading: false,
        error: null,
        isFull: finalCount >= GAME_CONSTANTS.MAX_PLAYERS,
        spotsLeft,
      });
    } catch (error) {
      console.error('Error fetching registration count:', error);
      
      // Fallback to mock data if available
      const mockGame = MOCK_GAMES[gameId];
      if (mockGame) {
        const count = mockGame.registeredCount;
        const spotsLeft = GAME_CONSTANTS.MAX_PLAYERS - count;
        setState({
          registeredCount: count,
          isLoading: false,
          error: null,
          isFull: count >= GAME_CONSTANTS.MAX_PLAYERS,
          spotsLeft,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to fetch registration count'),
        }));
      }
    }
  }, [gameId]);

  // Set up polling for real-time updates
  useEffect(() => {
    fetchRegistrationCount();

    const intervalId = setInterval(() => {
      fetchRegistrationCount();
    }, GAME_CONSTANTS.DEFAULT_POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchRegistrationCount]);

  const formatSpotsMessage = useCallback(() => {
    if (state.isLoading) return 'Loading...';
    if (state.error) {
      // If we have a fallback count, show it even if there's an error
      if (state.registeredCount > 0) {
        return `${GAME_CONSTANTS.MAX_PLAYERS - state.registeredCount}/${GAME_CONSTANTS.MAX_PLAYERS} spots left`;
      }
      return 'Unable to load spots';
    }
    if (state.isFull) return 'Game Full';
    return `${state.spotsLeft}/${GAME_CONSTANTS.MAX_PLAYERS} spots left`;
  }, [state.isLoading, state.error, state.isFull, state.spotsLeft, state.registeredCount]);

  return {
    ...state,
    formatSpotsMessage,
    refresh: fetchRegistrationCount,
  };
} 