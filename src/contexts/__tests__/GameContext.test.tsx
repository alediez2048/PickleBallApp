import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, Pressable } from 'react-native';
import { GameProvider, useGames } from '../GameContext';
import { Game, SkillLevel, GameStatus, User, Location } from '@/types/game';
import { act } from 'react-test-renderer';
import { renderHook } from '@testing-library/react-native';

// Mock the API
const mockApi = {
  games: {
    list: jest.fn(),
    create: jest.fn()
  }
};

jest.mock('@/services/api/games', () => ({
  api: mockApi
}));

// Create a reusable mock game object
const createMockGameData = (): Omit<Game, 'id' | 'status'> => ({
  title: 'Test Game',
  description: 'Test Description',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(),
  location: {
    id: '1',
    name: 'Test Location',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    coordinates: {
      latitude: 0,
      longitude: 0,
    }
  } as Location,
  maxPlayers: 4,
  skillLevel: 'Intermediate' as SkillLevel,
  price: 10,
  host: {
    id: '1',
    name: 'Test Host',
    email: 'test@test.com',
    skillLevel: 'Intermediate' as SkillLevel
  } as User,
  players: [] as User[],
  registeredCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Test component that uses game context
const TestComponent: React.FC = () => {
  const { games, loading, error, fetchGames, createGame } = useGames();
  const mockGameData = createMockGameData();
  
  return (
    <View>
      <Pressable testID="fetch-games" onPress={() => fetchGames()}>
        <Text>Fetch Games</Text>
      </Pressable>
      <Pressable
        testID="create-game"
        onPress={() => createGame(mockGameData)}
      >
        <Text>Create Game</Text>
      </Pressable>
      <Text testID="loading-state">{loading ? 'loading' : 'not-loading'}</Text>
      <Text testID="error-state">{error || 'no-error'}</Text>
      <Text testID="games-count">{games.length}</Text>
    </View>
  );
};

describe('GameContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a new game successfully', async () => {
    const mockGame = createMockGameData();

    mockApi.games.create.mockResolvedValue({
      ...mockGame,
      id: '1',
      status: GameStatus.Upcoming
    });

    const { result } = renderHook(() => useGames(), {
      wrapper: GameProvider,
    });

    await act(async () => {
      await result.current.createGame(mockGame);
    });

    expect(mockApi.games.create).toHaveBeenCalledWith(mockGame);
    expect(result.current.error).toBeNull();
  });

  it('handles game creation error', async () => {
    const mockGame = createMockGameData();
    const errorMessage = 'Failed to create game';
    mockApi.games.create.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useGames(), {
      wrapper: GameProvider,
    });

    await act(async () => {
      await result.current.createGame(mockGame);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('fetches games successfully', async () => {
    const mockGames = [
      { ...createMockGameData(), id: '1', status: GameStatus.Upcoming },
      { ...createMockGameData(), id: '2', status: GameStatus.Upcoming }
    ];

    mockApi.games.list.mockResolvedValue(mockGames);

    const { result } = renderHook(() => useGames(), {
      wrapper: GameProvider,
    });

    await act(async () => {
      await result.current.fetchGames();
    });

    expect(result.current.games).toEqual(mockGames);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch games error', async () => {
    const errorMessage = 'Failed to fetch games';
    mockApi.games.list.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useGames(), {
      wrapper: GameProvider,
    });

    await act(async () => {
      await result.current.fetchGames();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
    expect(result.current.games).toHaveLength(0);
  });

  it('shows loading state while fetching games', async () => {
    mockApi.games.list.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useGames(), {
      wrapper: GameProvider,
    });

    act(() => {
      result.current.fetchGames();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.loading).toBe(false);
  });

  it('renders TestComponent and handles user interactions', async () => {
    const mockGame = createMockGameData();
    mockApi.games.create.mockResolvedValue({
      ...mockGame,
      id: '1',
      status: GameStatus.Upcoming
    });

    const { getByTestId } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Test initial state
    expect(getByTestId('loading-state')).toHaveTextContent('not-loading');
    expect(getByTestId('error-state')).toHaveTextContent('no-error');
    expect(getByTestId('games-count')).toHaveTextContent('0');

    // Test create game interaction
    await act(async () => {
      fireEvent.press(getByTestId('create-game'));
    });

    expect(mockApi.games.create).toHaveBeenCalled();
  });
}); 