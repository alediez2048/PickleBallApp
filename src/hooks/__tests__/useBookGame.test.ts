import React from 'react';
import { act } from 'react-test-renderer';
import { useBookGame } from '../useBookGame';
import { GamesApi } from '@/services/api/games';
import { prefetch } from '@/utils/prefetch';
import { SkillLevel, GameStatus } from '@/types/games';

// Mock the GamesApi and prefetch
jest.mock('@/services/api/games');
jest.mock('@/utils/prefetch');

// Helper to test hooks
function testHook<T>(callback: () => T): { result: { current: T }, rerender: (callback: () => T) => void } {
  const container = {
    result: { current: undefined as unknown as T }
  };

  function TestComponent() {
    // @ts-ignore
    container.result.current = callback();
    return null;
  }

  // @ts-ignore Doesn't actually need to render, just needs to run the hook
  const render = () => TestComponent();
  
  render();
  
  return {
    result: container.result,
    rerender: (callback) => {
      // @ts-ignore
      container.result.current = callback();
    }
  };
}

describe('useBookGame', () => {
  const mockGame = {
    id: 'game-123',
    title: 'Friday Night Doubles',
    description: 'Fun doubles game for all skill levels',
    startTime: '2023-06-15T18:00:00',
    endTime: '2023-06-15T20:00:00',
    location: {
      id: 'loc-1',
      name: 'Central Park Courts',
      address: '123 Park Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      coordinates: {
        latitude: 40.7812,
        longitude: -73.9665,
      },
    },
    host: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      skillLevel: SkillLevel.Advanced,
    },
    players: [],
    registeredCount: 2,
    maxPlayers: 4,
    skillLevel: SkillLevel.Intermediate,
    price: 15,
    status: GameStatus.Upcoming,
    createdAt: '2023-06-10T10:00:00',
    updatedAt: '2023-06-10T10:00:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    jest.spyOn(GamesApi.prototype, 'getGame').mockResolvedValue(mockGame);
    jest.spyOn(prefetch, 'prefetchBookingFlow').mockImplementation(jest.fn());
  });

  it('initializes with correct default state', () => {
    const { result } = testHook(() => useBookGame());
    
    expect(result.current.step).toBe('details');
    expect(result.current.game).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('navigates to payment step', () => {
    const { result } = testHook(() => useBookGame());
    
    act(() => {
      result.current.goToPayment();
    });
    
    expect(result.current.step).toBe('payment');
  });

  it('navigates to confirmation step', () => {
    const { result } = testHook(() => useBookGame());
    
    act(() => {
      result.current.goToConfirmation();
    });
    
    expect(result.current.step).toBe('confirmation');
  });

  it('starts booking with a game', () => {
    const { result } = testHook(() => useBookGame());
    
    act(() => {
      result.current.startBooking(mockGame);
    });
    
    expect(result.current.game).toBe(mockGame);
    expect(result.current.step).toBe('details');
    expect(prefetch.prefetchBookingFlow).toHaveBeenCalledWith(mockGame.id);
  });

  it('resets booking state', () => {
    const { result } = testHook(() => useBookGame());
    
    // First start a booking
    act(() => {
      result.current.startBooking(mockGame);
    });
    
    // Then navigate to payment
    act(() => {
      result.current.goToPayment();
    });
    
    // Now reset
    act(() => {
      result.current.resetBooking();
    });
    
    expect(result.current.step).toBe('details');
    expect(result.current.game).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('loads a game by ID', async () => {
    const { result } = testHook(() => useBookGame('game-123'));
    
    await act(async () => {
      await result.current.loadGame();
    });
    
    expect(result.current.game).toEqual(mockGame);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles errors when loading a game', async () => {
    const error = new Error('Failed to load game');
    jest.spyOn(GamesApi.prototype, 'getGame').mockRejectedValue(error);
    
    const { result } = testHook(() => useBookGame('game-123'));
    
    await act(async () => {
      await result.current.loadGame();
    });
    
    expect(result.current.error).toEqual(error);
    expect(result.current.isLoading).toBe(false);
  });
}); 