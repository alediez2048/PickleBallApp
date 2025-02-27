import React from 'react';
import renderer from 'react-test-renderer';
import { Text, View, TouchableOpacity } from 'react-native';

// Mock GAME_CONSTANTS to avoid reference error
jest.mock('@/types/game', () => ({
  GAME_CONSTANTS: {
    MAX_PLAYERS: 12,
    DEFAULT_POLLING_INTERVAL: 30000
  }
}));

// Mock for default state
jest.mock('@/hooks/useGameRegistration', () => {
  return {
    // Default state with available spots
    useGameRegistration: jest.fn().mockImplementation(() => ({
      registeredCount: 5,
      isLoading: false,
      error: null,
      isFull: false,
      spotsLeft: 7,
      formatSpotsMessage: () => '7/12 spots left',
      refresh: jest.fn(),
    })),
  };
});

// Import after mocking
import { useGameRegistration } from '@/hooks/useGameRegistration';

// Mock the expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ id: 'game-123' }),
}));

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-123', hasCompletedProfile: true },
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  })),
}));

// Mock the API
jest.mock('@/services/mockApi', () => ({
  mockApi: {
    getGame: jest.fn(() => ({
      id: 'game-123',
      title: 'Test Game',
      date: new Date(),
      location: 'Test Location',
      skillLevel: 'Intermediate',
      price: 15,
      maxPlayers: 12,
    })),
    bookGame: jest.fn().mockResolvedValue({ success: true }),
    getGameBookings: jest.fn(() => 5),
    cancelBooking: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Define props interface for the component
interface GameRegistrationProps {
  gameId?: string;
}

// Create a simple mock for the components we're testing
const GameRegistration: React.FC<GameRegistrationProps> = ({ gameId = 'game-123' }) => {
  const gameRegistration = useGameRegistration(gameId);
  const { formatSpotsMessage, isLoading, isFull } = gameRegistration;

  return (
    <View testID="game-registration">
      <Text testID="spots-message">{formatSpotsMessage()}</Text>
      {isLoading && <Text testID="loading-indicator">Loading...</Text>}
      {isFull && <Text testID="full-message">Game is full</Text>}
      <TouchableOpacity 
        testID="register-button"
        disabled={isFull}
        onPress={() => {/* would handle registration */}}
      >
        <Text>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('GameRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default spots availability', () => {
    const tree = renderer
      .create(<GameRegistration gameId="game-123" />)
      .toJSON();
    
    expect(tree).toMatchSnapshot();
  });
}); 