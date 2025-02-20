import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { GameList } from '../GameList';
import type { Game, Location } from '@/types/game';
import { GameProvider } from '@/contexts/GameContext';
import { UIProvider } from '@/contexts/UIContext';

// Mock the required components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    View: 'View',
  };
});

// Mock expo-image
jest.mock('expo-image', () => 'View');

// Mock FlashList with a more accurate implementation
jest.mock('@shopify/flash-list', () => ({
  FlashList: 'View',
}));

const mockLocation: Location = {
  id: '1',
  name: 'Test Location',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  coordinates: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
};

const createMockGame = (id: string): Game => ({
  id,
  title: `Game ${id}`,
  description: `Game ${id} description`,
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(),
  location: mockLocation,
  host: {
    id: '1',
    name: 'Host 1',
    email: 'host1@example.com',
    skillLevel: 'Intermediate' as const,
  },
  players: [],
  registeredCount: 4,
  maxPlayers: 8,
  skillLevel: 'Intermediate' as const,
  price: 10,
  imageUrl: 'https://example.com/image1.jpg',
  status: 'Upcoming' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UIProvider>
    <GameProvider>{children}</GameProvider>
  </UIProvider>
);

describe('GameList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with empty list', () => {
    const { getByTestId } = render(
      <GameList
        data={[]}
        ListEmptyComponent={<View testID="empty-list" />}
      />,
      { wrapper }
    );
    expect(getByTestId('empty-list')).toBeTruthy();
  });

  it('renders list of games', () => {
    const games = [
      createMockGame('1'),
      createMockGame('2'),
    ];

    const { getAllByTestId } = render(
      <GameList data={games} />,
      { wrapper }
    );
    expect(getAllByTestId('game-item')).toHaveLength(2);
  });

  it('calls onGamePress with the correct game when pressed', () => {
    const mockOnGamePress = jest.fn();
    const games = [createMockGame('1')];

    const { getByTestId } = render(
      <GameList data={games} onGamePress={mockOnGamePress} />,
      { wrapper }
    );

    const gameItem = getByTestId('game-item');
    fireEvent.press(gameItem);
    expect(mockOnGamePress).toHaveBeenCalledWith(games[0]);
  });

  it('displays game information correctly', () => {
    const games = [createMockGame('1')];

    const { getByText } = render(
      <GameList data={games} />,
      { wrapper }
    );

    expect(getByText(games[0].title)).toBeTruthy();
    expect(getByText(games[0].location.name)).toBeTruthy();
    expect(getByText(`$${games[0].price}`)).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <GameList loading={true} />,
      { wrapper }
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('shows error state', () => {
    const errorMessage = 'Failed to load games';
    const { getByText } = render(
      <GameList error={errorMessage} />,
      { wrapper }
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('shows empty state when no games', () => {
    const { getByText } = render(
      <GameList data={[]} />,
      { wrapper }
    );

    expect(getByText('No games found')).toBeTruthy();
  });

  it('handles refresh correctly', () => {
    const onRefresh = jest.fn();
    const { getByTestId } = render(
      <GameList data={[]} onRefresh={onRefresh} />,
      { wrapper }
    );

    const refreshControl = getByTestId('refresh-control');
    fireEvent(refreshControl, 'touchEnd');
    expect(onRefresh).toHaveBeenCalled();
  });

  it('handles end reached correctly', () => {
    const onEndReached = jest.fn();
    const { getByTestId } = render(
      <GameList data={[]} onEndReached={onEndReached} />,
      { wrapper }
    );

    const endReached = getByTestId('end-reached');
    fireEvent(endReached, 'touchEnd');
    expect(onEndReached).toHaveBeenCalled();
  });
});

export const SkillLevel = {
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
  AllLevels: 'All Levels'
} as const;

export type AppRoutes = {
  '/(tabs)/': undefined;
  '/(tabs)/home': undefined;
  '/(tabs)/games': { category?: string };
  '/games/[id]': { id: string };
  '/games/create': undefined;
  '/activity/[id]': { id: string };
  '/(auth)/login': undefined;
  '/(auth)/register': undefined;
  '/(auth)/forgot-password': undefined;
}; 