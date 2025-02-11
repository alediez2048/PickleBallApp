import { useCallback, useState } from 'react';
import { GamesApi } from '@/services/api/games';
import { useDataRefresh } from './useDataRefresh';
import type { Game, GameFilters } from '../types/game';

export function useGames(filters?: GameFilters) {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const gamesApi = new GamesApi();

  const fetchGames = useCallback(async () => {
    try {
      const fetchedGames = await gamesApi.getGames(filters);
      setGames(fetchedGames);
      return fetchedGames;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch games');
      setError(error);
      throw error;
    }
  }, [filters]);

  const { isRefreshing, refresh } = useDataRefresh(
    `games_${JSON.stringify(filters || {})}`,
    fetchGames,
    {
      retryAttempts: 3,
      onError: (error) => {
        console.error('Failed to refresh games:', error);
        setError(error);
      },
    }
  );

  const refreshGames = useCallback(async () => {
    setError(null);
    return refresh();
  }, [refresh]);

  return {
    games,
    error,
    isRefreshing,
    refreshGames,
  };
} 