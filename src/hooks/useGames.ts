import { useQuery } from '@tanstack/react-query';
import { Game } from '@/types/game';
import { GamesApi, GameFiltersType } from '@/services/api/games';
import { useState, useEffect } from 'react';
import { mockApi } from '@/services/mockApi';
import { useUserProfile } from '@/contexts/selectors/authSelectors';

export function useGames(filters?: GameFiltersType) {
  const {
    data: games,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['games', filters],
    queryFn: () => GamesApi.getGames(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refreshGames = async () => {
    await refetch();
  };

  return {
    games: games || [],
    isLoading,
    error,
    isRefreshing: isLoading,
    refreshGames,
  };
}

interface GameHistory {
  id: string;
  date: string;
  result: 'win' | 'loss';
  score: string;
  opponent: string;
}

export function useGameHistory() {
  const user = useUserProfile();
  const [games, setGames] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      if (!user?.email) return;
      
      try {
        setIsLoading(true);
        const gameHistory = await mockApi.getGameHistory(user.email);
        setGames(gameHistory);
        setError(null);
      } catch (err) {
        setError('Failed to load game history');
        console.error('Error fetching game history:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, [user?.email]);

  const addGame = async (game: Omit<GameHistory, 'id'>) => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      const newGame = await mockApi.addGameToHistory(user.email, game);
      setGames(prevGames => [newGame, ...prevGames]);
      setError(null);
    } catch (err) {
      setError('Failed to add game');
      console.error('Error adding game:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    games,
    isLoading,
    error,
    addGame
  };
} 