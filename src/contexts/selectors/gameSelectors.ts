import { useMemo } from 'react';
import { Game, SkillLevel, GameStatus } from '@/types/games';
import { useGames } from '../GameContext';

// Basic selectors
export const useGameById = (gameId: string) => {
  const { getGame } = useGames();
  return useMemo(() => getGame(gameId), [gameId, getGame]);
};

export const useGamesByStatus = (status: GameStatus) => {
  const { games } = useGames();
  return useMemo(
    () => games.filter(game => game.status === status),
    [games, status]
  );
};

export const useGamesBySkillLevel = (skillLevel: SkillLevel) => {
  const { games } = useGames();
  return useMemo(
    () => games.filter(game => game.skillLevel === skillLevel),
    [games, skillLevel]
  );
};

// Computed selectors
export const useUpcomingGames = () => {
  const { games } = useGames();
  return useMemo(
    () => games.filter(
      game => game.status === GameStatus.Upcoming && new Date(game.date) > new Date()
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [games]
  );
};

export const useGameStats = () => {
  const { games } = useGames();
  return useMemo(() => ({
    total: games.length,
    upcoming: games.filter(game => game.status === GameStatus.Upcoming).length,
    inProgress: games.filter(game => game.status === GameStatus.InProgress).length,
    completed: games.filter(game => game.status === GameStatus.Completed).length,
    cancelled: games.filter(game => game.status === GameStatus.Cancelled).length,
    averagePrice: games.reduce((acc, game) => acc + game.price, 0) / games.length || 0,
  }), [games]);
};

// Complex selectors
export const useFilteredGames = (filters: {
  status?: GameStatus;
  skillLevel?: SkillLevel;
  minPrice?: number;
  maxPrice?: number;
  dateRange?: { start: Date; end: Date };
}) => {
  const { games } = useGames();
  
  return useMemo(() => {
    return games.filter(game => {
      if (filters.status && game.status !== filters.status) return false;
      if (filters.skillLevel && game.skillLevel !== filters.skillLevel) return false;
      if (filters.minPrice && game.price < filters.minPrice) return false;
      if (filters.maxPrice && game.price > filters.maxPrice) return false;
      if (filters.dateRange) {
        const gameDate = new Date(game.date);
        if (gameDate < filters.dateRange.start || gameDate > filters.dateRange.end) {
          return false;
        }
      }
      return true;
    });
  }, [games, filters]);
};

// Pagination selector
export const usePaginatedGames = (page: number, pageSize: number) => {
  const { games } = useGames();
  
  return useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      games: games.slice(start, end),
      totalPages: Math.ceil(games.length / pageSize),
      currentPage: page,
      hasNextPage: end < games.length,
      hasPreviousPage: page > 1,
    };
  }, [games, page, pageSize]);
}; 