import { useState, useCallback } from 'react';
import { Game, SkillLevel } from '../types/game';

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async (filters?: {
    skillLevel?: SkillLevel;
    date?: Date;
    location?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to fetch games
      // This is a placeholder for the actual implementation
      const response = await Promise.resolve([]);
      setGames(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGame = useCallback(async (gameData: Omit<Game, 'id' | 'status'>) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to create game
      // This is a placeholder for the actual implementation
      await Promise.resolve();
      await fetchGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    fetchGames,
    createGame,
  };
}; 