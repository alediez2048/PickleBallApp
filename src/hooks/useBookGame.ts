import { useState, useCallback } from 'react';
import { GamesApi } from '@/services/api/games';
import { prefetch } from '@/utils/prefetch';
import type { Game } from '@/types/game';

interface BookingState {
  step: 'details' | 'payment' | 'confirmation';
  game: Game | null;
  isLoading: boolean;
  error: Error | null;
}

export function useBookGame(gameId?: string) {
  const [state, setState] = useState<BookingState>({
    step: 'details',
    game: null,
    isLoading: false,
    error: null,
  });

  const gamesApi = new GamesApi();

  const loadGame = useCallback(async () => {
    if (!gameId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const game = await gamesApi.getGame(gameId);
      setState(prev => ({ ...prev, game, isLoading: false }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load game');
      setState(prev => ({ ...prev, error, isLoading: false }));
    }
  }, [gameId]);

  const startBooking = useCallback(async (game: Game) => {
    setState(prev => ({ 
      ...prev,
      step: 'details',
      game,
      error: null,
    }));

    // Prefetch data needed for the next steps
    prefetch.prefetchBookingFlow(game.id);
  }, []);

  const goToPayment = useCallback(() => {
    setState(prev => ({ ...prev, step: 'payment' }));
  }, []);

  const goToConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, step: 'confirmation' }));
  }, []);

  const resetBooking = useCallback(() => {
    setState({
      step: 'details',
      game: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    loadGame,
    startBooking,
    goToPayment,
    goToConfirmation,
    resetBooking,
  };
} 