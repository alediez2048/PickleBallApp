import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { GameProvider } from '../../GameContext';
import {
  useGameById,
  useGamesByStatus,
  useGamesBySkillLevel,
  useUpcomingGames,
  useGameStats,
  useFilteredGames,
  usePaginatedGames,
} from '../gameSelectors';
import { Game, GameStatus, SkillLevel } from '@/types/game';

// Mock data
const mockGames: Game[] = [
  {
    id: '1',
    title: 'Game 1',
    date: new Date('2024-03-25'),
    location: {
      id: '1',
      name: 'Court 1',
      address: '123 Main St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      coordinates: { latitude: 0, longitude: 0 },
    },
    maxPlayers: 4,
    currentPlayers: 2,
    skillLevel: SkillLevel.Beginner,
    price: 10,
    host: {
      id: '1',
      name: 'Host 1',
      email: 'host1@test.com',
      skillLevel: SkillLevel.Intermediate,
    },
    status: GameStatus.Upcoming,
  },
  // Add more mock games as needed
];

// Mock GameProvider
jest.mock('../../GameContext', () => ({
  GameProvider: ({ children }: { children: React.ReactNode }) => children,
  useGames: () => ({
    games: mockGames,
    getGame: (id: string) => mockGames.find(game => game.id === id),
  }),
}));

describe('Game Selectors', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GameProvider>{children}</GameProvider>
  );

  describe('useGameById', () => {
    it('returns the correct game by id', () => {
      const { result } = renderHook(() => useGameById('1'), { wrapper });
      expect(result.current?.id).toBe('1');
    });

    it('returns undefined for non-existent game', () => {
      const { result } = renderHook(() => useGameById('999'), { wrapper });
      expect(result.current).toBeUndefined();
    });
  });

  describe('useGamesByStatus', () => {
    it('filters games by status', () => {
      const { result } = renderHook(
        () => useGamesByStatus(GameStatus.Upcoming),
        { wrapper }
      );
      expect(result.current.length).toBe(1);
      expect(result.current[0].status).toBe(GameStatus.Upcoming);
    });
  });

  describe('useGamesBySkillLevel', () => {
    it('filters games by skill level', () => {
      const { result } = renderHook(
        () => useGamesBySkillLevel(SkillLevel.Beginner),
        { wrapper }
      );
      expect(result.current.length).toBe(1);
      expect(result.current[0].skillLevel).toBe(SkillLevel.Beginner);
    });
  });

  describe('useGameStats', () => {
    it('calculates correct game statistics', () => {
      const { result } = renderHook(() => useGameStats(), { wrapper });
      expect(result.current).toEqual({
        total: 1,
        upcoming: 1,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        averagePrice: 10,
      });
    });
  });

  describe('useFilteredGames', () => {
    it('filters games based on multiple criteria', () => {
      const filters = {
        status: GameStatus.Upcoming,
        skillLevel: SkillLevel.Beginner,
        minPrice: 5,
        maxPrice: 15,
      };
      const { result } = renderHook(() => useFilteredGames(filters), { wrapper });
      expect(result.current.length).toBe(1);
    });

    it('returns empty array when no games match filters', () => {
      const filters = {
        minPrice: 100,
      };
      const { result } = renderHook(() => useFilteredGames(filters), { wrapper });
      expect(result.current.length).toBe(0);
    });
  });

  describe('usePaginatedGames', () => {
    it('returns correct pagination data', () => {
      const { result } = renderHook(() => usePaginatedGames(1, 10), { wrapper });
      expect(result.current).toEqual({
        games: mockGames,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });
}); 