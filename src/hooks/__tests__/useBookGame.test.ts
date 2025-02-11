import { renderHook, act } from '@testing-library/react-native';
import { useBookGame } from '../useBookGame';
import { GamesApi } from '@/services/api/games';
import { prefetch } from '@/utils/prefetch';
import { Game, SkillLevel, GameStatus } from '@/types/game';

// Mock the GamesApi and prefetch
jest.mock('@/services/api/games');
jest.mock('@/utils/prefetch');

const MockGamesApi = GamesApi as jest.MockedClass<typeof GamesApi>;

const mockGame: Game = {
  id: '123',
  title: 'Test Game',
  date: new Date(),
  location: {
    id: 'loc1',
    name: 'Test Location',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  },
  maxPlayers: 4,
  currentPlayers: 2,
  skillLevel: SkillLevel.Intermediate,
  price: 20,
  host: {
    id: 'host1',
    name: 'Test Host',
    email: 'host@test.com',
    skillLevel: SkillLevel.Advanced,
  },
  status: GameStatus.Upcoming,
};

describe('useBookGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBookGame());

    expect(result.current).toEqual(expect.objectContaining({
      step: 'details',
      game: null,
      isLoading: false,
      error: null,
    }));
  });

  it('should load game data', async () => {
    const getGameMock = jest.fn().mockResolvedValue(mockGame);
    MockGamesApi.mockImplementation(() => ({
      getGame: getGameMock,
    } as any));

    const { result } = renderHook(() => useBookGame('123'));

    await act(async () => {
      await result.current.loadGame();
    });

    expect(getGameMock).toHaveBeenCalledWith('123');
    expect(result.current.game).toEqual(mockGame);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle game loading error', async () => {
    const error = new Error('Failed to load game');
    const getGameMock = jest.fn().mockRejectedValue(error);
    MockGamesApi.mockImplementation(() => ({
      getGame: getGameMock,
    } as any));

    const { result } = renderHook(() => useBookGame('123'));

    await act(async () => {
      await result.current.loadGame();
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.game).toBe(null);
  });

  it('should start booking and prefetch data', async () => {
    const { result } = renderHook(() => useBookGame());

    await act(async () => {
      await result.current.startBooking(mockGame);
    });

    expect(result.current.game).toEqual(mockGame);
    expect(result.current.step).toBe('details');
    expect(prefetch.prefetchBookingFlow).toHaveBeenCalledWith(mockGame.id);
  });

  it('should navigate through booking steps', () => {
    const { result } = renderHook(() => useBookGame());

    act(() => {
      result.current.goToPayment();
    });
    expect(result.current.step).toBe('payment');

    act(() => {
      result.current.goToConfirmation();
    });
    expect(result.current.step).toBe('confirmation');
  });

  it('should reset booking state', () => {
    const { result } = renderHook(() => useBookGame());

    act(() => {
      result.current.startBooking(mockGame);
      result.current.goToPayment();
    });

    expect(result.current.game).toEqual(mockGame);
    expect(result.current.step).toBe('payment');

    act(() => {
      result.current.resetBooking();
    });

    expect(result.current.game).toBe(null);
    expect(result.current.step).toBe('details');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });
}); 